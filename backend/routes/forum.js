// routes/forum.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// ✅ Create Channel - FIXED: Creator is now added to members
router.post("/channels", authenticateToken, async (req, res) => {
  try {
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Only faculty or admin can create channels" });
    }

    const { name, description, isGeneral } = req.body;
    const channel = await Channel.create({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id], // FIXED: Always add creator as member
      isGeneral
    });

    const populated = await Channel.findById(channel._id)
      .populate("creator", "name email") // FIXED: Changed from "username" to "name"
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating channel" });
  }
});

// ✅ Get all channels - FIXED: Changed username to name
router.get("/channels", authenticateToken, async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");
    res.json(channels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching channels" });
  }
});

// ✅ Request to Join - FIXED: Changed username to name
router.post("/channels/:id/join", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (channel.isGeneral) {
      if (!channel.members.find(m => String(m._id) === req.user.id)) {
        channel.members.push(req.user.id);
        await channel.save();
        
        // Re-populate after saving
        const updated = await Channel.findById(channel._id)
          .populate("creator", "name email")
          .populate("members", "name email")
          .populate("pendingRequests", "name email");
        
        return res.json({ message: "Joined general channel", channel: updated });
      }
      return res.json({ message: "Already a member", channel });
    }

    if (channel.pendingRequests.find(m => String(m._id) === req.user.id) ||
        channel.members.find(m => String(m._id) === req.user.id)) {
      return res.status(400).json({ message: "Already requested or joined" });
    }

    channel.pendingRequests.push(req.user.id);
    await channel.save();

    // FIXED: Get user name for notification
    const User = require("../models/User");
    const requestingUser = await User.findById(req.user.id);

    await Notification.create({
      user: channel.creator._id,
      type: "join_request",
      content: `${requestingUser.name} requested to join channel ${channel.name}`
    });

    res.json({ message: "Join request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error requesting join" });
  }
});

// ✅ Approve Request - FIXED: Changed username to name
router.post("/channels/:id/approve", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (String(channel.creator) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    channel.pendingRequests = channel.pendingRequests.filter(id => String(id) !== userId);
    
    // FIXED: Only add if not already a member
    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
    }
    
    await channel.save();

    const populated = await Channel.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    res.json({ message: "User approved", channel: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving user" });
  }
});

// ✅ Delete Channel (admin/creator only)
router.delete("/channels/:id", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (String(channel.creator) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.deleteMany({ channel: channel._id });
    await channel.deleteOne();

    res.json({ message: "Channel deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting channel" });
  }
});

// ✅ Get single channel - FIXED: Changed username to name
router.get("/channels/:id", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.json(channel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching channel" });
  }
});

// ✅ Send Message - FIXED: Changed username to name
router.post("/channels/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a member" });
    }

    const msg = await Message.create({
      channel: channel._id,
      author: req.user.id,
      content
    });

    const populated = await Message.findById(msg._id).populate("author", "name email role");
    req.io.to(channel._id.toString()).emit("newMessage", populated);

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
});

// ✅ Leave Channel
router.post("/channels/:id/leave", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (String(channel.creator) === req.user.id) {
      return res.status(400).json({ message: "Creator cannot leave the channel" });
    }

    channel.members = channel.members.filter(id => String(id) !== req.user.id);
    await channel.save();

    res.json({ message: "You left the channel successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error leaving channel" });
  }
});

// ✅ Get Messages - FIXED: Changed username to name
router.get("/channels/:id/messages", authenticateToken, async (req, res) => {
  try {
    const msgs = await Message.find({ channel: req.params.id })
      .populate("author", "name email role")
      .sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;