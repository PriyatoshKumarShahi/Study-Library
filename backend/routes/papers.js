const express = require("express");
const router = express.Router();
const { uploadPapers, getPapers, deletePaper } = require("../controllers/papersController");
const authenticateToken = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const upload = require("../config/upload");

router.post(
  "/upload",
  authenticateToken,
  requireAdmin,
  upload.single("file"),
  uploadPapers
);

router.get("/", getPapers);

// Delete paper route (admin only)
router.delete("/:id", authenticateToken, requireAdmin, deletePaper);

module.exports = router;
