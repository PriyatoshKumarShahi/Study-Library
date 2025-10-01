const express = require('express');
const router = express.Router();
const { uploadAssignment, getAssignments } = require('../controllers/assignmentsController');
const authenticateToken = require('../middleware/auth');
const requireFaculty = require('../middleware/faculty'); // create middleware to check faculty role
const upload = require('../config/upload');

router.post('/upload', authenticateToken, requireFaculty, upload.single('file'), uploadAssignment);
router.get('/', authenticateToken, getAssignments);

module.exports = router;
