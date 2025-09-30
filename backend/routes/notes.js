const express = require('express');
const router = express.Router();
const { uploadNotes, getNotes, deleteNote, incrementDownload } = require('../controllers/notesController');
const authenticateToken = require('../middleware/auth');
const requireAdmin = require('../middleware/admin');
const upload = require('../config/upload');

router.post('/upload', authenticateToken, requireAdmin, upload.single('file'), uploadNotes);

router.get('/', getNotes);

router.delete('/:id', authenticateToken, requireAdmin, deleteNote);

// NEW ROUTE - Add this line
router.post('/:id/download', incrementDownload);

module.exports = router;
