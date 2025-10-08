// backend/controllers/askAceController.js
const axios = require("axios");
const ChatSession = require("../models/ChatSession");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FREE_MODEL = "models/text-bison-001";
const FREE_API_VERSION = "v1";

if (!GEMINI_API_KEY) console.error("Gemini API key is missing!");

// --- Helper functions ---
const generateTitle = (message) => {
  const words = message.trim().split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

// Categorize query into study / counselling / general
function categorizeQuery(message) {
  const lower = message.toLowerCase();
  const studyKeywords = ["study", "exam", "homework", "assignment", "coding", "practice"];
  const counsellingKeywords = ["stress", "anxiety", "motivation", "focus", "planning", "advice"];

  if (studyKeywords.some((w) => lower.includes(w))) return "study";
  if (counsellingKeywords.some((w) => lower.includes(w))) return "counselling";
  return "general";
}

// Generate prompt based on category
function generatePrompt(message, category) {
  let guidance = "";

  switch (category) {
    case "study":
      guidance = `
**Study Guidance:**
- Explain concepts clearly and step-by-step
- Give examples and practice problems
- Offer coding/study tips and motivation
- Provide hints without full solutions if requested`;
      break;

    case "counselling":
      guidance = `
**Counselling / Motivation:**
- Give supportive and encouraging advice
- Provide focus and time management tips
- Suggest stress-relief techniques
- Use empathetic, friendly tone`;
      break;

    case "general":
    default:
      guidance = `
**General Advice:**
- Answer user's query clearly and helpfully
- Be concise but thorough
- Keep responses friendly and motivating`;
      break;
  }

  return `You are AskAce, a friendly AI assistant. Respond to the user's message: "${message}".
${guidance}
**Response Format:**
- Use headings and bullet points where helpful
- Keep the response clear, actionable, and friendly`;
}

// --- Controller ---
exports.handleAskAce = async (req, res) => {
  try {
    const { message, userId, sessionId, isNewSession } = req.body;

    const category = categorizeQuery(message);
    const prompt = generatePrompt(message, category);

    const apiUrl = `https://generativelanguage.googleapis.com/${FREE_API_VERSION}/${FREE_MODEL}:generateText?key=${GEMINI_API_KEY}`;

    // --- Call Gemini API ---
    const { data } = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      },
      { headers: { "Content-Type": "application/json" } }
    );

    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    // --- Handle new session ---
    if (isNewSession && userId) {
      const newSessionId = sessionId || Date.now().toString();
      const title = generateTitle(message);

      const initialMessages = [
        { sender: "ai", text: "Hello! I'm AskAce, your study & motivation assistant.", time: new Date() },
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
      return res.json({ reply, sessionId: newSessionId, title, session: newSession });
    }

    // --- Update existing session ---
    if (sessionId && userId) {
      const session = await ChatSession.findOne({ sessionId });
      if (session) {
        session.messages.push(
          { sender: "user", text: message, time: new Date() },
          { sender: "ai", text: reply, time: new Date() }
        );
        session.lastUpdated = new Date();
        await session.save();
        return res.json({ reply, session });
      }
    }

    // Fallback response
    res.json({ reply });
  } catch (err) {
    console.error("AskAce error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
};
