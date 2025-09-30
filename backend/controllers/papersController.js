const Papers = require("../models/Papers");
const cloudinary = require("../config/cloudinary");

exports.uploadPapers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, subject, year, branch, semester, examYear, description } = req.body;
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "studylibrary/papers",
          use_filename: true,
          unique_filename: false,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const papers = new Papers({
      title,
      subject,
      year,
      branch,
      semester,
      examYear,
      description,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user.id,
    });

    await papers.save();
    res.status(201).json({ message: "Papers uploaded successfully", papers });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.getPapers = async (req, res) => {
  try {
    const { year, branch, examYear, semester, search } = req.query;
    let query = {};
    if (year) query.year = year;
    if (branch) query.branch = branch;
    if (examYear) query.examYear = examYear;
    if (semester) query.semester = semester;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
      ];
    }

    const papers = await Papers.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { cloudinaryId } = req.body;
    const paper = await Papers.findById(id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    if (cloudinaryId) {
      await cloudinary.uploader.destroy(cloudinaryId, { resource_type: "raw" });
    }

    await Papers.findByIdAndDelete(id);
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};


exports.incrementDownload = async (req, res) => {
  try {
    const { id } = req.params;
    
    const papers = await Papers.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!papers) {
      return res.status(404).json({ message: "Paper not found" });
    }

    res.json({ message: "Download count updated", downloads: papers.downloads });
  } catch (error) {
    console.error("Failed to increment download:", error);
    res.status(500).json({ message: "Failed to update download count" });
  }
};