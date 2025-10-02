// routes/assignments.js
const express = require('express');
const router = express.Router();
const {
  uploadAssignment,
  getAssignments,
  deleteAssignment,
  incrementDownload
} = require('../controllers/assignmentsController');
const authenticateToken = require('../middleware/auth');
const requireFaculty = require('../middleware/faculty'); // ensures req.user.role === 'faculty'
const upload = require('../config/upload');

// upload - faculty only
router.post('/upload', authenticateToken, requireFaculty, upload.single('file'), uploadAssignment);

// search - require auth (students can access)
router.get('/', authenticateToken, getAssignments);

// delete - only owner or admin
router.delete('/:id', authenticateToken, deleteAssignment);

// download increment
router.post('/:id/download', authenticateToken, incrementDownload);

module.exports = router;
