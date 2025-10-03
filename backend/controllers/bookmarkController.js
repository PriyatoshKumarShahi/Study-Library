// controllers/bookmarkController.js
const User = require("../models/User");
const Notes = require("../models/Notes");
const Papers = require("../models/Papers"); // Add Papers model

// Notes bookmarks (existing)
exports.addBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.bookmarks.includes(noteId)) {
      user.bookmarks.push(noteId);
      await user.save();
    }

    res.json({ message: "Note bookmarked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to bookmark", error: err.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.bookmarks = user.bookmarks.filter(
      (id) => id.toString() !== noteId.toString()
    );
    await user.save();

    res.json({ message: "Bookmark removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove bookmark", error: err.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks", error: err.message });
  }
};

// Paper bookmarks (new)
exports.addPaperBookmark = async (req, res) => {
  try {
    const { paperId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.paperBookmarks) {
      user.paperBookmarks = [];
    }

    if (!user.paperBookmarks.includes(paperId)) {
      user.paperBookmarks.push(paperId);
      await user.save();
    }

    res.json({ message: "Paper bookmarked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to bookmark paper", error: err.message });
  }
};

exports.removePaperBookmark = async (req, res) => {
  try {
    const { paperId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.paperBookmarks = user.paperBookmarks.filter(
      (id) => id.toString() !== paperId.toString()
    );
    await user.save();

    res.json({ message: "Paper bookmark removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove paper bookmark", error: err.message });
  }
};

exports.getPaperBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("paperBookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.paperBookmarks || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch paper bookmarks", error: err.message });
  }
};