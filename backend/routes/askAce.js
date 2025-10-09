// routes/askAce.js
const express = require("express");
const { handleAskAce } = require('../controllers/askAceController');
const router = express.Router();

// Main AskAce chat endpoint
router.post("/", handleAskAce);

module.exports = router;