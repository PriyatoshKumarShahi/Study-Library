const Assignment = require('../models/Assignment');
const cloudinary = require('../config/cloudinary');

exports.uploadAssignment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { assignmentNo, subject, year, branch } = req.body;
    const facultyName = req.user.name;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'studylibrary/assignments', use_filename: true, unique_filename: false },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(req.file.buffer);
    });

    const assignment = new Assignment({
      assignmentNo,
      subject,
      facultyName,
      year,
      branch,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user.id,
      description: req.body.description || ''
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment uploaded successfully', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { assignmentNo, subject, facultyName } = req.query;
    let query = {};
    if (assignmentNo) query.assignmentNo = assignmentNo;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (facultyName) query.facultyName = facultyName;

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
