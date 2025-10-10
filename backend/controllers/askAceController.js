const fetch = require("node-fetch");
const ChatSession = require("../models/ChatSession");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("⚠️ Gemini API key is missing!");
}

let cachedWorkingModel = null;

// --- Helper functions ---
const generateTitle = (message) => {
  const words = message.trim().split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

function categorizeQuery(message) {
  const lower = message.toLowerCase();
  const studyKeywords = ["study", "exam", "homework", "assignment", "coding", "practice", "learn"];
  const counsellingKeywords = ["stress", "anxiety", "motivation", "focus", "planning", "advice", "help"];

  if (studyKeywords.some((w) => lower.includes(w))) return "study";
  if (counsellingKeywords.some((w) => lower.includes(w))) return "counselling";
  return "general";
}

function generatePrompt(message, category, chatHistory = []) {
  const trimmed = (message || "").trim();
  if (["hi", "hello", "hey", "hii"].includes(trimmed.toLowerCase())) {
    return `You are AskAce, a friendly AI assistant. Reply with a short greeting only: "Hi! How can I help you today?" Do not reference previous conversation.`;
  }

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

  const instruction = `IMPORTANT FORMATTING RULES:
1. For headings: Use **Heading Text** format (will be converted to bold)
2. For bullet points: Use proper markdown bullets with "- " or "• "
3. Add blank lines between paragraphs for spacing
4. NEVER use asterisks (*) alone for emphasis or decoration
5. NEVER use stars (***) for headings
6. Keep answers structured and easy to read
7. Do NOT add greetings or sign-offs unless user explicitly asks
8. Use **bold** for important terms or emphasis within paragraphs`;

  let contextText = "";
  if (chatHistory && chatHistory.length > 0) {
    const recentHistory = chatHistory.slice(-6);
    contextText = "\n\nPrevious conversation (only use if user asked to continue or referenced it):\n" +
      recentHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'AskAce'}: ${msg.text}`).join("\n");
  }

  return `You are AskAce, a friendly AI assistant. ${guidance}\n\n${instruction}\n\nUser message: "${message}"${contextText}\n\nProvide a clear, helpful response following the formatting rules above.`;
}

async function findWorkingModel() {
  if (cachedWorkingModel) {
    console.log(`✨ Using cached model: ${cachedWorkingModel}`);
    return cachedWorkingModel;
  }

  console.log("🔍 Testing available models...");
  
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

// Format AI response for better display
function formatResponse(text) {
  if (!text) return text;
  
  let formatted = text;
  
  // Remove decorative stars/asterisks that aren't markdown
  formatted = formatted.replace(/^\*+\s*/gm, '');
  formatted = formatted.replace(/\*+$/gm, '');
  
  // Ensure proper spacing between paragraphs
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Convert any remaining * bullets to proper markdown bullets
  formatted = formatted.replace(/^\*\s+/gm, '• ');
  
  return formatted.trim();
}

// --- Main Controller ---
exports.handleAskAce = async (req, res) => {
  try {
    console.log("📨 Received request");

    const { message, userId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file." 
      });
    }

    // Get or create user's current session
    let session = await ChatSession.findOne({ userId }).sort({ lastUpdated: -1 });
    
    if (!session) {
      // Create new session for user
      const title = generateTitle(message);
      session = new ChatSession({
        userId,
        sessionId: `${userId}_${Date.now()}`,
        title,
        messages: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      });
    }

    // Get chat history for context
    const chatHistory = session.messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    const category = categorizeQuery(message);
    const prompt = generatePrompt(message, category, chatHistory);

    console.log("🤖 Category:", category);

    // Call Gemini API
    const data = await callGeminiAPI(prompt);

    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("❌ No reply in response");
      return res.status(500).json({ 
        error: "I apologize, but I couldn't generate a response. Please try again!"
      });
    }

    // Format the response
    reply = formatResponse(reply);

    console.log("✅ Success! Reply length:", reply.length);

    // Save messages to session
    session.messages.push(
      { sender: "user", text: message, time: new Date() },
      { sender: "ai", text: reply, time: new Date() }
    );
    session.lastUpdated = new Date();
    
    await session.save();

    res.json({ 
      text: reply, 
      sessionId: session.sessionId,
      userId: session.userId
    });

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
      errorMessage = "⚠️ No available models found. Your API key may not have access to any Gemini models.";
      errorDetails = "Try creating a new API key from Google AI Studio";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
};

// Get user's chat history
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const session = await ChatSession.findOne({ userId }).sort({ lastUpdated: -1 });
    
    if (!session) {
      return res.json({ messages: [] });
    }

    res.json({ 
      messages: session.messages,
      sessionId: session.sessionId 
    });

  } catch (err) {
    console.error("❌ Error fetching history:", err.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// Clear user's chat history
exports.clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await ChatSession.deleteMany({ userId });
    
    res.json({ message: "Chat history cleared successfully" });

  } catch (err) {
    console.error("❌ Error clearing history:", err.message);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
};
