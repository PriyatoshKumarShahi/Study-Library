// src/pages/FacultyDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api";
import { toast } from "react-toastify";
import StarField2 from "../components/StarField2";
import { Upload, FileText, Calendar, BookOpen, User, GraduationCap, Sparkles } from "lucide-react";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    assignmentNo: "",
    subject: "",
    year: "",
    branch: "",
    description: "",
    file: null,
    facultyName: user?.name || "",
    deadline: ""
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setForm((prev) => ({ ...prev, file: files[0] }));
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (let key in form) {
      // don't append null file as string
      if (key === "file") {
        if (form.file) data.append("file", form.file);
      } else {
        data.append(key, form[key] ?? "");
      }
    }

    // ensure facultyName is set (allow manual override)
    if (!form.facultyName && user?.name) data.set("facultyName", user.name);

    try {
      const res = await API.post("/assignments/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Assignment uploaded successfully!");
      toast.success("Assignment uploaded successfully!");
      setForm({
        assignmentNo: "",
        subject: "",
        year: "",
        branch: "",
        description: "",
        file: null,
        facultyName: user?.name || "",
        deadline: ""
      });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error("upload error:", err);
      const message = err.response?.data?.message || "Upload failed";
      setMsg(message);
      toast.error(message);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
  <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
    <StarField2 />

    <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Upload className="w-16 h-16 text-blue-400 animate-bounce" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-glow">
          Faculty Dashboard
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Upload and manage assignments for your students
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Upload New Assignment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Assignment Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Assignment Number
              </label>
              <input
                type="text"
                name="assignmentNo"
                placeholder="e.g., Assignment 1"
                value={form.assignmentNo}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="e.g., Data Structures"
                value={form.subject}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-green-400" />
                Year
              </label>
              <input
                type="text"
                name="year"
                placeholder="e.g., 2nd Year"
                value={form.year}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-400" />
                Branch
              </label>
              <input
                type="text"
                name="branch"
                placeholder="e.g., Computer Science"
                value={form.branch}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Faculty Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-400" />
                Faculty Name
              </label>
              <input
                type="text"
                name="facultyName"
                placeholder="Your name"
                value={form.facultyName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-400" />
                Submission Deadline
              </label>
              <input
                type="datetime-local"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Description (Optional)
            </label>
            <textarea
              name="description"
              placeholder="Add any additional instructions or details..."
              value={form.description}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              rows={4}
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Upload File
            </label>
            <div className="relative">
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-200"
                required
              />
            </div>
            {form.file && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {form.file.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Assignment
          </button>
        </form>
      </div>
    </div>
  </div>
);

}
