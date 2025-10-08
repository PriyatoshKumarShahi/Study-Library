const express = require("express");
const { handleAskAce } = require('../controllers/askAceController');
const router = express.Router();

router.post("/", handleAskAce);

module.exports = router;
