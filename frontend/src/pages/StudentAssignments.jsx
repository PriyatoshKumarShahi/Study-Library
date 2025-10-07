// src/pages/StudentAssignments.jsx
import React, { useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../contexts/AuthContext";
import StarField2 from "../components/StarField2";
import {
  BookOpen,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Trash2,
  Search
} from "lucide-react";

// helper to extract only digits
const extractDigits = (str) => {
  if (!str) return "";
  const match = str.toString().match(/\d+/);
  return match ? match[0] : str;
};

export default function StudentAssignments() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    assignmentNo: "",
    subject: "",
    facultyName: "",
    year: ""
  });
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "assignmentNo" || name === "year") {
      value = extractDigits(value); // normalize digits
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!filters.assignmentNo || !filters.subject || !filters.facultyName || !filters.year) {
      setError("Please provide assignmentNo, subject, facultyName and year to search.");
      setAssignments([]);
      return;
    }

    try {
      setError("");
      setLoadingSearch(true);
      const res = await API.get("/assignments", { params: filters });
      setAssignments(res.data || []);
      if (!res.data || res.data.length === 0) {
        setError("No assignment found for the provided combination.");
      }
    } catch (err) {
      console.error("search error:", err);
      setError(err.response?.data?.message || "Failed to fetch assignments");
      setAssignments([]);
    } finally {
      setLoadingSearch(false);
    }
  };

const handleDownload = async (assignmentId, fileUrl, filename) => {
  if (!fileUrl) return toast.error("File URL missing");

  setDownloading(true);
  toast.info("Downloading started...");

  try {
    // Step 1: Download the actual file
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("File download failed");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    // Step 2: Record the download in backend
    await API.post(`/assignments/${assignmentId}/download`);

    // Step 3: Update local state
    setAssignments((prev) =>
      prev.map((a) =>
        a._id === assignmentId ? { ...a, downloads: (a.downloads || 0) + 1 } : a
      )
    );

    toast.success("Download completed");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error(error.message || "Download failed");
  } finally {
    setDownloading(false);
  }
};




  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    setDeleting(true);
    try {
      await API.delete(`/assignments/${id}`);
      toast.success("Assignment deleted");
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("delete failed:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <StarField2 />

      {(downloading || deleting || loadingSearch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          {downloading && <Loader message="Downloading your file..." />}
          {deleting && <Loader message="Deleting assignment..." />}
          {loadingSearch && <Loader message="Searching assignments..." />}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-glow">
            Student Assignments
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access and download your assignments
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" /> Search Assignments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              name="assignmentNo"
              placeholder="Assignment No"
              value={filters.assignmentNo}
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={filters.subject}
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
              type="text"
              name="facultyName"
              placeholder="Faculty Name"
              value={filters.facultyName}
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={filters.year}
              onChange={handleChange}
              className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSearch}
              className=" flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer "
            >
              <Search className="w-4 h-4 text-white" />
              Search
            </button>
            <button
              onClick={() => {
                setFilters({ assignmentNo: "", subject: "", facultyName: "", year: "" });
                setAssignments([]);
                setError("");
              }}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg  transition-all duration-200 cursor-pointer "
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-600/50 rounded text-white">{error}</div>
          )}
        </div>

        {/* Assignment List */}
        <div className="space-y-6">
          {assignments.map((a) => {
            const cleanFilename = a.subject
              ? a.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
              : "assignment.pdf";

            return (
              <div
                key={a._id}
                className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" /> {a.assignmentNo} - {a.subject}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-pink-400" /> Faculty: {a.facultyName}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-green-400" /> Year: {a.year} • Branch: {a.branch}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-400" /> Deadline:{" "}
                      {a.deadline ? new Date(a.deadline).toLocaleString() : "N/A"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleDownload(a._id, a.fileUrl, cleanFilename)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" /> Download PDF
                    </button>

                    {(user?.role === "admin" || user?.id === a.uploadedBy) && (
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                </div>

                {a.description && <p className="text-gray-300">{a.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
