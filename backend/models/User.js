const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  department: { type: String, default: "" },
  year: { type: String, default: "" },
  courses: [{ type: String }],
  contact: { type: String, default: "" },
  leetcode: { type: String, default: "" },
  codechef: { type: String, default: "" },
  hackerrank: { type: String, default: "" },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notes"}],
    paperBookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Papers"}],
    profile: { type: ProfileSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
