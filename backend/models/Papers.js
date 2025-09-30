const mongoose = require('mongoose');

const papersSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  examYear: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  downloadUrl: { type: String },   // 👈 add this
  cloudinaryId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hasSolutions: { type: Boolean, default: false },
  duration: String,
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('Papers', papersSchema);
