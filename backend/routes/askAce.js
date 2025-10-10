// routes/askAce.js
const express = require("express");
const { handleAskAce, getChatHistory, clearChatHistory } = require('../controllers/askAceController');
const router = express.Router();

// Main AskAce chat endpoint
router.post("/", handleAskAce);

// Get user's chat history
router.get("/history/:userId", getChatHistory);

// Clear user's chat history
router.delete("/history/:userId", clearChatHistory);

module.exports = router;
