const Notes = require("../models/Notes");
const cloudinary = require("../config/cloudinary");

exports.uploadNotes = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, subject, year, branch, description } = req.body;
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "studylibrary/notes",
          use_filename: true,
          unique_filename: false,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const cleanFilename = title
      ? title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
      : "downloaded_file.pdf";

    const downloadUrl = result.secure_url.replace(
      "/upload/",
      `/upload/fl_attachment:${encodeURIComponent(cleanFilename)}/`
    );

    const notes = new Notes({
      title,
      subject,
      year,
      branch,
      description,
      fileUrl: result.secure_url,
      downloadUrl,
      cloudinaryId: result.public_id,
      fileExtension: ".pdf",
      uploadedBy: req.user.id,
    });

    await notes.save();
    res.status(201).json({ message: "Notes uploaded successfully", notes });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { year, branch, subject, search } = req.query;
    let query = {};
    if (year) query.year = year;
    if (branch) query.branch = branch;
    if (subject) query.subject = new RegExp(subject, "i");
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
      ];
    }

    const notes = await Notes.find(query)
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { cloudinaryId } = req.body;
    const note = await Notes.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (cloudinaryId) {
      await cloudinary.uploader.destroy(cloudinaryId, { resource_type: "raw" });
    }

    await Notes.findByIdAndDelete(id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

