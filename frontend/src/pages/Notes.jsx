import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  Filter,
  Download,
  Search,
  Calendar,
  GraduationCap,
  FileText,
  Star,
  Eye,
} from "lucide-react";
import StarField from "../components/StarField";
import API from "../api";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading , setDownloading] = useState(false)
  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState({
    year: "",
    branch: "",
    subject: "",
    search: "",
  });

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const branches = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, notes]);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = notes;

    if (filters.year) {
      filtered = filtered.filter((note) => note.year === filters.year);
    }
    if (filters.branch) {
      filtered = filtered.filter((note) => note.branch === filters.branch);
    }
    if (filters.subject) {
      filtered = filtered.filter(
        (note) =>
          note.subject.toLowerCase().includes(filters.subject.toLowerCase()) ||
          note.title.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((note) => {
        const title = note.title?.toLowerCase() || "";
        const description = note.description?.toLowerCase() || "";
        const uploadedBy =
          typeof note.uploadedBy === "string"
            ? note.uploadedBy.toLowerCase()
            : note.uploadedBy?.name?.toLowerCase() || "";

        return (
          title.includes(searchLower) ||
          description.includes(searchLower) ||
          uploadedBy.includes(searchLower)
        );
      });
    }

    setFilteredNotes(filtered);
  };

 const handleDelete = async (id, cloudinaryId) => {
  if (!window.confirm("Are you sure you want to delete this note?")) return;

  setDeletingId(id); // show loader for this note
  toast.info("Deleting file...");

  try {
    await API.delete(`/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: { cloudinaryId },
    });

    setNotes((prev) => prev.filter((note) => note._id !== id));
    setFilteredNotes((prev) => prev.filter((note) => note._id !== id));

    toast.success("File deleted successfully!!");
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error(err.response?.data?.message || "Failed to delete!!");
  } finally {
    setDeletingId(null); 
  }
};;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ year: "", branch: "", subject: "", search: "" });
  };
const handleDownload = async (noteId, fileUrl, filename) => {
  if (!fileUrl) return toast.error("File URL missing");

  setDownloading(true); // Show loader
  toast.info("Downloading started...");

  try {
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("File download failed");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // Create temporary link for download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    // Increment download count in backend
    await API.post(`/notes/${noteId}/download`);

    // Update local state
    setNotes(prevNotes =>
      prevNotes.map(n =>
        n._id === noteId ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      )
    );
    setFilteredNotes(prevNotes =>
      prevNotes.map(n =>
        n._id === noteId ? { ...n, downloads: (n.downloads || 0) + 1 } : n
      )
    );
     toast.success("Download completed");

  } catch (error) {
    console.error("Download failed:", error);
     toast.error(err.response?.data?.message || "Download failed");
  } finally {
    setDownloading(false); // Hide loader
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <span className="text-gray-300">Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <StarField />
        {downloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Loader message="Downloading your file..." />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <BookOpen className="w-16 h-16 text-blue-400 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-glow">
            Study Notes
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access comprehensive study notes shared by faculty and top students
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Filter Notes</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Branch Filter */}
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange("branch", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <input
              type="text"
              placeholder="Subject..."
              value={filters.subject}
              onChange={(e) => handleFilterChange("subject", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {filteredNotes.length} of {notes.length} notes
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Notes Grid */}
     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => { // Opening the map function with block scope {
             
            const cleanFilename = note.title
              ? note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
              : "downloaded_file.pdf";

            return ( // Explicit return for the JSX starts here
            <div
              key={note._id}
              className="group bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
              </div>

              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300">
                {note.title}
              </h3>

              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                {note.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">
                    {note.year} • {note.branch}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">
                    By {note.uploadedBy?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">
                    {note.downloads || 0} downloads
                  </span>
                </div>
              </div> 
                
           <div className="flex gap-2">

<button
  onClick={() => handleDownload(note._id, note.fileUrl, cleanFilename)}
  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group"
>
  <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
  <span className="text-sm font-medium">Download</span>
</button>


  
  {/* Delete button (only for admin) */}
  {user?.email === "priytoshshahi90@gmail.com" && (
    <button
       onClick={() => handleDelete(note._id, note.cloudinaryId)}
  disabled={deletingId === note._id}
      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors duration-200"
    >
     {deletingId === note._id ? "Deleting..." : "Delete"}
    </button>
  )}
</div>
            </div>
          )})} 
     </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No notes found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
