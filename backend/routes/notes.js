const express = require('express');
const router = express.Router();
const { uploadNotes, getNotes, deleteNote, incrementDownload } = require('../controllers/notesController');
const authenticateToken = require('../middleware/auth');
const upload = require('../config/upload');

// ✅ Allow both admin AND faculty to upload notes
router.post('/upload', authenticateToken, upload.single('file'), uploadNotes);

router.get('/', getNotes);

router.delete('/:id', authenticateToken,  deleteNote);
router.post('/:id/download', incrementDownload);

module.exports = router;