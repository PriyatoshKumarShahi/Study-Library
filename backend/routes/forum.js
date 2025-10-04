const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const User = require("../models/User");

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
      members: [req.user.id],
      isGeneral
    });

    const populated = await Channel.findById(channel._id)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating channel" });
  }
});

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

router.post("/channels/:id/join", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("pendingRequests", "name email");

    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (channel.bannedMembers.includes(req.user.id)) {
      return res.status(403).json({ message: "You are banned from this channel" });
    }

    if (channel.isGeneral) {
      if (!channel.members.find(m => String(m._id) === req.user.id)) {
        channel.members.push(req.user.id);
        await channel.save();

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

router.post("/channels/:id/approve", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (String(channel.creator) !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    channel.pendingRequests = channel.pendingRequests.filter(id => String(id) !== String(userId));

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
router.post("/channels/:id/remove-member", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const isCreator = String(channel.creator) === String(req.user.id);
    const isFaculty = currentUser.role === "faculty";
    const isSpecificAdmin = currentUser.email === "priytoshshahi90@gmail.com";

    if (!isCreator && !isFaculty && !isSpecificAdmin) return res.status(403).json({ message: "Not authorized to remove members" });
    if (String(channel.creator) === String(userId)) return res.status(400).json({ message: "Cannot remove channel creator" });

    channel.members = channel.members.filter(id => String(id) !== String(userId));
    await channel.save();

    const populated = await Channel.findById(channel._id).populate("creator", "name email").populate("members", "name email").populate("pendingRequests", "name email");

    await Notification.create({
      user: userId,
      type: "removed_from_channel",
      content: `You have been removed from channel ${channel.name}`
    });

    if (req.io) req.io.to(channel._id.toString()).emit("memberRemoved", { userId: String(userId), channelId: String(channel._id) });

    res.json({ message: "Member removed successfully", channel: populated });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Error removing member" });
  }
});

module.exports = router;

router.post("/messages/:messageId/report", authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate("author", "name email")
      .populate("channel");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const channel = await Channel.findById(message.channel);

    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    if (message.reports.includes(req.user.id)) {
      return res.status(400).json({ message: "You already reported this message" });
    }

    message.reports.push(req.user.id);
    await message.save();

    const reportCount = message.reports.length;

    if (reportCount >= 10) {
      const authorId = message.author._id;

      if (String(channel.creator) !== String(authorId)) {
        channel.members = channel.members.filter(id => String(id) !== String(authorId));

        if (!channel.bannedMembers.includes(authorId)) {
          channel.bannedMembers.push(authorId);
        }

        await channel.save();

        await Message.deleteMany({ channel: channel._id, author: authorId });

        await Notification.create({
          user: authorId,
          type: "banned_from_channel",
          content: `You have been banned from channel ${channel.name} due to multiple reports`
        });

        if (req.io) {
          req.io.to(channel._id.toString()).emit("userBanned", {
            userId: String(authorId),
            channelId: String(channel._id)
          });
        }

        return res.json({
          message: "Message reported. User has been banned due to multiple reports.",
          banned: true,
          reportCount
        });
      }
    }

    res.json({
      message: "Message reported successfully",
      reportCount,
      banned: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reporting message" });
  }
});

router.post("/messages/:messageId/pin", authenticateToken, async (req, res) => {
  try {
    const { pinned } = req.body;
    const message = await Message.findById(req.params.messageId)
      .populate("author", "name email")
      .populate("channel");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const channel = await Channel.findById(message.channel);

    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    const isCreator = String(channel.creator) === String(req.user.id);
    const canPin = req.user.role === "admin" || req.user.role === "faculty" || isCreator;

    if (!canPin) {
      return res.status(403).json({ message: "Only faculty, admin, or channel creator can pin messages" });
    }

    message.pinned = pinned;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate("author", "name email role")
      .populate("reports", "name");

    if (req.io) {
      req.io.to(channel._id.toString()).emit("messageUpdated", populated);
    }

    res.json({ message: pinned ? "Message pinned" : "Message unpinned", data: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error pinning message" });
  }
});

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

    if (channel.bannedMembers.includes(req.user.id)) {
      return res.status(403).json({ message: "You are banned from this channel" });
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

router.post("/channels/:id/leave", authenticateToken, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (String(channel.creator) === String(req.user.id)) {
      return res.status(400).json({ message: "Creator cannot leave the channel" });
    }

    channel.members = channel.members.filter(id => String(id) !== String(req.user.id));
    await channel.save();

    res.json({ message: "You left the channel successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error leaving channel" });
  }
});

router.get("/channels/:id/messages", authenticateToken, async (req, res) => {
  try {
    const msgs = await Message.find({ channel: req.params.id })
      .populate("author", "name email role")
      .populate("reports", "name")
      .sort({ createdAt: 1 });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;