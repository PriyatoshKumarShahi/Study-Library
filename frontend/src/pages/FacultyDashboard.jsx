// src/pages/FacultyDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import StarField2 from "../components/StarField2";
import { Upload, FileText, Calendar, BookOpen, User, GraduationCap, Sparkles, Trash2 } from "lucide-react";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("uploadAssignment");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [assignmentFormData, setAssignmentFormData] = useState({
    assignmentNo: "",
    subject: "",
    year: "",
    branch: "",
    description: "",
    file: null,
    facultyName: user?.name || "",
    deadline: ""
  });

  const [notesFormData, setNotesFormData] = useState({
    title: "",
    subject: "",
    year: "",
    branch: "",
    description: "",
    file: null
  });

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const branches = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering"
  ];

  useEffect(() => {
    if (activeTab === "manage") {
      fetchMyAssignments();
    }
  }, [activeTab]);

  const fetchMyAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await API.get("/assignments/my-assignments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAssignments(res.data);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      toast.error("Failed to load assignments");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignmentInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setAssignmentFormData((prev) => ({ ...prev, file: files[0] }));
    else setAssignmentFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotesInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setNotesFormData((prev) => ({ ...prev, file: files[0] }));
    else setNotesFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();

    const normalizedForm = {
      ...assignmentFormData,
      assignmentNo: assignmentFormData.assignmentNo.replace(/\D/g, ""),
      year: assignmentFormData.year.replace(/\D/g, "")
    };

    const data = new FormData();
    for (let key in normalizedForm) {
      if (key === "file") {
        if (normalizedForm.file) data.append("file", normalizedForm.file);
      } else {
        data.append(key, normalizedForm[key] ?? "");
      }
    }

    if (!normalizedForm.facultyName && user?.name) data.set("facultyName", user.name);

    try {
      setUploading(true);
      const res = await API.post("/assignments/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage({ type: "success", text: "Assignment uploaded successfully!" });
      toast.success("Assignment uploaded successfully!");
      setAssignmentFormData({
        assignmentNo: "",
        subject: "",
        year: "",
        branch: "",
        description: "",
        file: null,
        facultyName: user?.name || "",
        deadline: ""
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("upload error:", err);
      const msg = err.response?.data?.message || "Upload failed";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (let key in notesFormData) {
      if (key === "file") {
        if (notesFormData.file) data.append("file", notesFormData.file);
      } else {
        data.append(key, notesFormData[key] ?? "");
      }
    }

    try {
      setUploading(true);
      const res = await API.post("/notes/upload", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setMessage({ type: "success", text: "Notes uploaded successfully!" });
      toast.success("Notes uploaded successfully!");
      setNotesFormData({
        title: "",
        subject: "",
        year: "",
        branch: "",
        description: "",
        file: null
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("upload error:", err);
      const msg = err.response?.data?.message || "Upload failed";
      setMessage({ type: "error", text: msg });
      toast.error(msg);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAssignment = async (id, cloudinaryId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    setDeletingId(id);
    toast.info("Deleting assignment...");

    try {
      await API.delete(`/assignments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: { cloudinaryId },
      });

      setAssignments((prev) => prev.filter((assignment) => assignment._id !== id));
      toast.success("Assignment deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <StarField2 />

      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Loader message="Uploading..." />
        </div>
      )}

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
            Upload and manage assignments and notes for your students
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-900/50 border-green-700 text-green-200"
                : "bg-red-900/50 border-red-700 text-red-200"
            } animate-fade-in`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? <Upload className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              {message.text}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab("uploadAssignment")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === "uploadAssignment" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <Upload className="w-5 h-5" /> Upload Assignment
            </button>
            <button
              onClick={() => setActiveTab("uploadNotes")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === "uploadNotes" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-5 h-5" /> Upload Notes
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === "manage" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-5 h-5" /> Manage Assignments
            </button>
          </div>

          <div className="p-8">
            {/* Upload Assignment Tab */}
            {activeTab === "uploadAssignment" && (
              <UploadAssignmentForm
                formData={assignmentFormData}
                handleInputChange={handleAssignmentInputChange}
                handleSubmit={handleAssignmentSubmit}
                uploading={uploading}
                years={years}
                branches={branches}
              />
            )}

            {/* Upload Notes Tab */}
            {activeTab === "uploadNotes" && (
              <UploadNotesForm
                formData={notesFormData}
                handleInputChange={handleNotesInputChange}
                handleSubmit={handleNotesSubmit}
                uploading={uploading}
                years={years}
                branches={branches}
              />
            )}

            {/* Manage Assignments Tab */}
            {activeTab === "manage" && (
              <ManageAssignments
                assignments={assignments}
                loading={loadingAssignments}
                onDelete={handleDeleteAssignment}
                deletingId={deletingId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const UploadAssignmentForm = ({ formData, handleInputChange, handleSubmit, uploading, years, branches }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Assignment Number
          </label>
          <input
            type="text"
            name="assignmentNo"
            value={formData.assignmentNo}
            onChange={handleInputChange}
            placeholder="e.g., Assignment 1"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Data Structures"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-green-400" /> Year
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" /> Branch
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4 text-pink-400" /> Faculty Name
          </label>
          <input
            type="text"
            name="facultyName"
            value={formData.facultyName}
            onChange={handleInputChange}
            placeholder="Your name"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-400" /> Submission Deadline
          </label>
          <input
            type="datetime-local"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Add any additional instructions or details..."
          className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" /> Upload File
        </label>
        <div className="relative">
          <input
            type="file"
            name="file"
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-200"
            required
          />
        </div>
        {formData.file && <p className="text-sm text-gray-400 mt-2">Selected: {formData.file.name}</p>}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Uploading...
          </span>
        ) : (
          <>
            <Upload className="w-5 h-5" /> Upload Assignment
          </>
        )}
      </button>
    </form>
  );
};

const UploadNotesForm = ({ formData, handleInputChange, handleSubmit, uploading, years, branches }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Data Structures Complete Notes"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="e.g., Data Structures"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-green-400" /> Year *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" /> Branch *
          </label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            required
          >
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Description (Optional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Add description about the notes..."
          className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" /> Upload File *
        </label>
        <div className="relative">
          <input
            type="file"
            name="file"
            onChange={handleInputChange}
            accept=".pdf,.doc,.docx"
            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-200"
            required
          />
        </div>
        {formData.file && <p className="text-sm text-gray-400 mt-2">Selected: {formData.file.name}</p>}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Uploading...
          </span>
        ) : (
          <>
            <Upload className="w-5 h-5" /> Upload Notes
          </>
        )}
      </button>
    </form>
  );
};

const ManageAssignments = ({ assignments, loading, onDelete, deletingId }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading assignments...</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Assignments Yet</h3>
        <p className="text-gray-500">Upload your first assignment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">My Assignments</h2>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-white">
                  Assignment {assignment.assignmentNo} - {assignment.subject}
                </h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <p><span className="text-gray-400">Year:</span> {assignment.year}</p>
                  <p><span className="text-gray-400">Branch:</span> {assignment.branch}</p>
                  <p><span className="text-gray-400">Deadline:</span> {new Date(assignment.deadline).toLocaleString()}</p>
                  <p><span className="text-gray-400">Downloads:</span> {assignment.downloads || 0}</p>
                  {assignment.description && (
                    <p className="mt-2"><span className="text-gray-400">Description:</span> {assignment.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDelete(assignment._id, assignment.cloudinaryId)}
                disabled={deletingId === assignment._id}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deletingId === assignment._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};