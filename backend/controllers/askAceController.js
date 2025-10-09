// backend/controllers/askAceController.js
const fetch = require("node-fetch");
const ChatSession = require("../models/ChatSession");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("⚠️ Gemini API key is missing!");
}

// Cache for working model (so we don't test every time)
let cachedWorkingModel = null;

// --- Helper functions ---
const generateTitle = (message) => {
  const words = message.trim().split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

// Categorize query
function categorizeQuery(message) {
  const lower = message.toLowerCase();
  const studyKeywords = ["study", "exam", "homework", "assignment", "coding", "practice", "learn"];
  const counsellingKeywords = ["stress", "anxiety", "motivation", "focus", "planning", "advice", "help"];

  if (studyKeywords.some((w) => lower.includes(w))) return "study";
  if (counsellingKeywords.some((w) => lower.includes(w))) return "counselling";
  return "general";
}

// Generate prompt
function generatePrompt(message, category, chatHistory = []) {
  let guidance = "";

  switch (category) {
    case "study":
      guidance = "Explain concepts clearly with examples. Offer study tips and motivation.";
      break;
    case "counselling":
      guidance = "Give supportive advice. Provide stress-relief techniques in a friendly tone.";
      break;
    default:
      guidance = "Answer clearly and helpfully. Be concise, friendly and motivating.";
      break;
  }

  let contextText = "";
  if (chatHistory && chatHistory.length > 0) {
    const recentHistory = chatHistory.slice(-4);
    contextText = "\n\nPrevious conversation:\n" + 
      recentHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'AskAce'}: ${msg.text}`).join("\n");
  }

  return `You are AskAce, a friendly AI assistant. ${guidance}\n\nUser message: "${message}"${contextText}\n\nProvide a clear, helpful response with bullet points where useful.`;
}

// Find a working model by trying different options
async function findWorkingModel() {
  if (cachedWorkingModel) {
    console.log(`✨ Using cached model: ${cachedWorkingModel}`);
    return cachedWorkingModel;
  }

  console.log("🔍 Testing available models...");
  
  // Try these models in order (most common free models)
  const modelsToTry = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro-latest", 
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "text-bison-001"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`   Testing: ${modelName}...`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hi" }] }]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`   ✅ ${modelName} works!`);
          cachedWorkingModel = modelName;
          return modelName;
        }
      }
    } catch (error) {
      console.log(`   ❌ ${modelName} failed`);
    }
  }

  throw new Error("No working models found. Please check your API key.");
}

// Make API call with the working model
async function callGeminiAPI(prompt) {
  const modelName = await findWorkingModel();
  
  console.log(`📡 Calling Gemini API with model: ${modelName}`);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data?.error?.message || "API request failed");
  }

  return data;
}

// --- Main Controller ---
exports.handleAskAce = async (req, res) => {
  try {
    console.log("📨 Received request");

    const { message, userId, sessionId, isNewSession, chatHistory } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file." 
      });
    }

    const category = categorizeQuery(message);
    const prompt = generatePrompt(message, category, chatHistory);

    console.log("🤖 Category:", category);

    // Call Gemini API
    const data = await callGeminiAPI(prompt);

    // Extract reply
    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("❌ No reply in response");
      return res.status(500).json({ 
        error: "I apologize, but I couldn't generate a response. Please try again!"
      });
    }

    console.log("✅ Success! Reply length:", reply.length);

    // Handle new session
    if (isNewSession && userId) {
      const newSessionId = sessionId || Date.now().toString();
      const title = generateTitle(message);

      const initialMessages = [
        { sender: "ai", text: "Hello! I'm AskAce, your study & motivation assistant. How can I help you today?", time: new Date() },
        { sender: "user", text: message, time: new Date() },
        { sender: "ai", text: reply, time: new Date() }
      ];

      const newSession = new ChatSession({
        userId,
        sessionId: newSessionId,
        title,
        messages: initialMessages,
        lastUpdated: new Date()
      });

      await newSession.save();
      return res.json({ text: reply, sessionId: newSessionId, title, session: newSession });
    }

    // Update existing session
    if (sessionId && userId) {
      const session = await ChatSession.findOne({ sessionId });
      if (session) {
        session.messages.push(
          { sender: "user", text: message, time: new Date() },
          { sender: "ai", text: reply, time: new Date() }
        );
        session.lastUpdated = new Date();
        await session.save();
        return res.json({ text: reply, session });
      }
    }

    // Fallback response (no session)
    res.json({ text: reply });

  } catch (err) {
    console.error("❌ Error:", err.message);
    
    let errorMessage = "I'm sorry, I encountered an error. Please try again!";
    let errorDetails = err.message;
    
    if (err.message.includes("API key expired")) {
      errorMessage = "⚠️ Your API key has expired. Please generate a new one from Google AI Studio.";
    } else if (err.message.includes("API key not valid")) {
      errorMessage = "⚠️ Your API key is invalid. Please check your .env file.";
    } else if (err.message.includes("quota")) {
      errorMessage = "⚠️ API quota exceeded. Please try again later.";
    } else if (err.message.includes("No working models")) {
      errorMessage = "⚠️ No available models found. Your API key may not have access to any Gemini models. Please:\n1. Generate a NEW API key from https://aistudio.google.com/app/apikey\n2. Make sure you're creating a key in the FREE tier\n3. Update your .env file";
      errorDetails = "Try creating a new API key from Google AI Studio";
    } else if (err.message.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
};