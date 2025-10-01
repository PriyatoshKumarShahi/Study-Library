const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assignmentNo: { type: String, required: true },
  subject: { type: String, required: true },
  facultyName: { type: String, required: true },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
