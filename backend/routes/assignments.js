const express = require('express');
const router = express.Router();
const {
  uploadAssignment,
  getAssignments,
  deleteAssignment,
  incrementDownloadController,
  getMyAssignments
} = require('../controllers/assignmentsController');
const authenticateToken = require('../middleware/auth');
const requireFaculty = require('../middleware/faculty');
const upload = require('../config/upload');

// upload - faculty only
router.post(
  '/upload',
  authenticateToken,
  requireFaculty,
  upload.single('file'),
  uploadAssignment
);

// search - require auth (students can access)
router.get('/', authenticateToken, getAssignments);

// get my assignments - faculty only
router.get('/my-assignments', authenticateToken, requireFaculty, getMyAssignments);

// delete - only owner or admin
router.delete('/:id', authenticateToken, deleteAssignment);

// download - increment downloads and track student
router.post('/:id/download', authenticateToken, incrementDownloadController);

module.exports = router;
