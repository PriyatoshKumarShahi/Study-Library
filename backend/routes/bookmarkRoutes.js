// routes/bookmarkRoutes.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  addBookmark,
  removeBookmark,
  getBookmarks,
  addPaperBookmark,
  removePaperBookmark,
  getPaperBookmarks,
} = require("../controllers/bookmarkController");

// Notes bookmarks
router.get("/", authenticateToken, getBookmarks);
router.post("/:noteId", authenticateToken, addBookmark);
router.delete("/:noteId", authenticateToken, removeBookmark);

// Paper bookmarks
router.get("/papers", authenticateToken, getPaperBookmarks);
router.post("/papers/:paperId", authenticateToken, addPaperBookmark);
router.delete("/papers/:paperId", authenticateToken, removePaperBookmark);

module.exports = router;