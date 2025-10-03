// controllers/assignmentsController.js
const Assignment = require('../models/Assignment');
const cloudinary = require('../config/cloudinary');

// Upload Assignment (faculty only)
exports.uploadAssignment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const {
      assignmentNo,
      subject,
      facultyName,
      year,
      branch,
      description,
      deadline
    } = req.body;

    // Validate required fields - strict
    if (!assignmentNo || !subject || !facultyName || !year || !branch || !deadline) {
      return res.status(400).json({ message: "assignmentNo, subject, facultyName, year, branch and deadline are required" });
    }

    // upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "studylibrary/assignments",
          use_filename: true,
          unique_filename: false,
        },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(req.file.buffer);
    });

   const assignment = new Assignment({
  assignmentNo,
  subject,
  facultyName,
  year,
  branch,
  deadline: new Date(deadline),
  description,
  fileUrl: result.secure_url, // use Cloudinary URL as-is
  cloudinaryId: result.public_id,
  uploadedBy: req.user.id,
});


    await assignment.save();
    res.status(201).json({ message: "Assignment uploaded successfully", assignment });
  } catch (error) {
    console.error("uploadAssignment error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// Get/Search Assignments (strict: all four fields required)
exports.getAssignments = async (req, res) => {
  try {
    const { assignmentNo, subject, facultyName, year } = req.query;

    // Require all search fields
    if (!assignmentNo || !subject || !facultyName || !year) {
      return res.status(400).json({
        message: "To search assignments you must provide assignmentNo, subject, facultyName and year"
      });
    }

    // Exact match for assignmentNo and year; case-insensitive match for subject & facultyName
    const query = {
      assignmentNo: assignmentNo,
      year: year,
      subject: { $regex: `^${escapeRegex(subject)}$`, $options: "i" },
      facultyName: { $regex: `^${escapeRegex(facultyName)}$`, $options: "i" }
    };

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    if (!assignments || assignments.length === 0) {
      return res.json([]); // frontend will show "no assignment found"
    }
    res.json(assignments);
  } catch (error) {
    console.error("getAssignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete assignment (only owner or admin)
// Delete assignment (only owner or admin)
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // ✅ permission: owner or admin (based on role)
    // if (assignment.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ message: "Not authorized to delete this assignment" });
    // }

    // delete from cloudinary if exists
    if (assignment.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(assignment.cloudinaryId, { resource_type: "raw" });
      } catch (err) {
        console.warn("cloudinary deletion failed:", err.message);
      }
    }

    await Assignment.findByIdAndDelete(id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("deleteAssignment error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};


// Increment download count
exports.incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Download incremented", downloads: assignment.downloads });
  } catch (error) {
    console.error("incrementDownload error:", error);
    res.status(500).json({ message: "Failed to increment download" });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error("getMyAssignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// small helper to escape regex
function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
