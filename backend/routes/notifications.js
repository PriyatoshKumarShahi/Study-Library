const express = require("express");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// 📩 Get all notifications for the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort notifications (newest first)
    const sortedNotifications = user.notifications.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.json(sortedNotifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// ✅ Mark all notifications as read
router.put("/mark-read", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications.forEach((n) => (n.read = true));
    await user.save();

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
});


router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notifications = user.notifications.filter(
      (n) => n._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

router.delete("/clear", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.notifications = [];
    await user.save();
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
});


module.exports = router;
