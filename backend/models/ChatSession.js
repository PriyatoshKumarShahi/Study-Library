const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});


ChatSessionSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model("ChatSession", ChatSessionSchema);