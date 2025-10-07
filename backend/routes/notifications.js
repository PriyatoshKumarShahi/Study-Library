import express from "express";
import User from "../models/User.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark all notifications as read
router.put("/mark-read", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notifications.forEach((n) => (n.read = true));
    await user.save();
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
});

export default router;
