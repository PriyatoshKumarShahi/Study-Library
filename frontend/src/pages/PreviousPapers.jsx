import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  FileText,
  Filter,
  Download,
  Search,
  Calendar,
  GraduationCap,
  Clock,
  Bookmark,
} from "lucide-react";
import StarField from "../components/StarField";
import API from "../api";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function PreviousPapers() {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const [filters, setFilters] = useState({
    year: "",
    branch: "",
    examYear: "",
    semester: "",
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
  const examYears = ["2024", "2023", "2022", "2021", "2020", "2019"];
  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];

  useEffect(() => {
    fetchPapers();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [filters, papers, activeTab]);

  const fetchPapers = async () => {
  try {
    const res = await API.get("/papers");
    const data = res.data;

    let userBookmarks = [];
    if (user) {
      // Change this to fetch paper bookmarks specifically
      const bookmarkRes = await API.get("/bookmarks/papers");
      userBookmarks = bookmarkRes.data.map((paper) => paper._id);
    }

    const papersWithBookmark = data.map((paper) => ({
      ...paper,
      isBookmarked: userBookmarks.includes(paper._id),
    }));

    setPapers(papersWithBookmark);
    setFilteredPapers(papersWithBookmark);
  } catch (err) {
    console.error("Error fetching papers:", err);
    toast.error("Failed to load papers");
  } finally {
    setLoading(false);
  }
};


 const handleBookmarkToggle = async (paper) => {
  if (!user) return toast.error("You must be logged in to bookmark");

  try {
    if (paper.isBookmarked) {
      // Change the endpoint
      await API.delete(`/bookmarks/papers/${paper._id}`);
    } else {
      // Change the endpoint
      await API.post(`/bookmarks/papers/${paper._id}`);
    }

    setPapers((prev) =>
      prev.map((p) =>
        p._id === paper._id ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );

    toast.success(
      paper.isBookmarked
        ? "Removed from bookmarks"
        : "Added to bookmarks"
    );
  } catch (err) {
    console.error("Bookmark toggle failed:", err);
    toast.error("Failed to update bookmark");
  }
};

  const applyFilters = () => {
    let filtered = papers;

    if (filters.year) filtered = filtered.filter((p) => p.year === filters.year);
    if (filters.branch) filtered = filtered.filter((p) => p.branch === filters.branch);
    if (filters.examYear) filtered = filtered.filter((p) => p.examYear === filters.examYear);
    if (filters.semester) filtered = filtered.filter((p) => p.semester === filters.semester);
    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.uploadedBy?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (activeTab === "bookmarks") {
      filtered = filtered.filter((p) => p.isBookmarked);
    }

    setFilteredPapers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ year: "", branch: "", examYear: "", semester: "", search: "" });
  };

  const handleDelete = async (id, cloudinaryId) => {
    if (!window.confirm("Are you sure you want to delete this paper?")) return;
    setDeletingId(id);
    toast.info("Deleting file...");
    try {
      await API.delete(`/papers/${id}`, {
        data: { cloudinaryId },
      });
      setPapers((prev) => prev.filter((p) => p._id !== id));
      toast.success("File deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (paperId, fileUrl, filename) => {
    if (!fileUrl) return toast.error("File URL missing");
    setDownloading(true);
    toast.info("Downloading started...");

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("File download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      await API.post(`/papers/${paperId}/download`);
      setPapers((prev) =>
        prev.map((p) =>
          p._id === paperId ? { ...p, downloads: (p.downloads || 0) + 1 } : p
        )
      );
      toast.success("Download completed");
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <span className="text-gray-300">Loading papers...</span>
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
            <FileText className="w-16 h-16 text-purple-400 animate-bounce" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-glow">
            Previous Papers
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Access previous year question papers with solutions to ace your exams
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white shadow-lg shadow-purple-500/20"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All Papers
          </button>
          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 ${
              activeTab === "bookmarks"
                ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white shadow-lg shadow-purple-500/20"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Bookmarked
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Filter Papers</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search papers..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
              />
            </div>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.branch}
              onChange={(e) => handleFilterChange("branch", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={filters.examYear}
              onChange={(e) => handleFilterChange("examYear", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">Exam Year</option>
              {examYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 text-white px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {filteredPapers.length} of {papers.length} papers
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.length > 0 ? (
            filteredPapers.map((paper) => {
              const filename = paper.title
                ? paper.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
                : "previous_paper.pdf";

              return (
                <div
                  key={paper._id}
                  className="group bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-purple-500/10 relative"
                >
                  {/* Bookmark Icon */}
                  {user && (
                    <div
                      className="absolute top-4 right-4 cursor-pointer z-20"
                      onClick={() => handleBookmarkToggle(paper)}
                    >
                      <Bookmark
                        className={`w-6 h-6 transition-all duration-200 ${
                          paper.isBookmarked
                            ? "text-yellow-400 fill-yellow-400 scale-110"
                            : "text-gray-400 hover:text-purple-300"
                        }`}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors duration-300">
                    {paper.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    {paper.year && paper.semester && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">
                          {paper.year} • {paper.semester}
                        </span>
                      </div>
                    )}
                    {paper.examYear && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">Exam Year: {paper.examYear}</span>
                      </div>
                    )}
                    {paper.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Duration: {paper.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{paper.downloads || 0} downloads</span>
                    </div>
                  </div>

                  {paper.hasSolutions && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        ✓ Solutions Available
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleDownload(paper._id, paper.fileUrl, filename)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group cursor-pointer"
                    >
                      <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                      <span className="text-sm font-medium">Download</span>
                    </button>

                    {user?.email === "priytoshshahi90@gmail.com" && (
                      <button
                        onClick={() => handleDelete(paper._id, paper.cloudinaryId)}
                        disabled={deletingId === paper._id}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        {deletingId === paper._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 col-span-full">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No papers found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters, search terms, or check the other tab
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




// import React, { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   FileText,
//   Filter,
//   Download,
//   Search,
//   Calendar,
//   GraduationCap,
//   Clock,
//   Bookmark,
// } from "lucide-react";
// import StarField from "../components/StarField";
// import API from "../api";
// import Loader from "../components/Loader";
// import { toast } from "react-toastify";

// export default function PreviousPapers() {
//   const { user } = useAuth();
//   const [papers, setPapers] = useState([]);
//   const [filteredPapers, setFilteredPapers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [activeTab, setActiveTab] = useState("all");

//   const [filters, setFilters] = useState({
//     year: "",
//     branch: "",
//     examYear: "",
//     semester: "",
//     search: "",
//   });

//   const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
//   const branches = [
//     "Computer Science Engineering",
//     "Information Technology",
//     "Electronics & Communication",
//     "Mechanical Engineering",
//     "Civil Engineering",
//     "Electrical Engineering",
//   ];
//   const examYears = ["2024", "2023", "2022", "2021", "2020", "2019"];
//   const semesters = [
//     "1st Semester",
//     "2nd Semester",
//     "3rd Semester",
//     "4th Semester",
//     "5th Semester",
//     "6th Semester",
//     "7th Semester",
//     "8th Semester",
//   ];

//   useEffect(() => {
//     fetchPapers();
//   }, [user]);

//   useEffect(() => {
//     applyFilters();
//   }, [filters, papers, activeTab]);

//   const fetchPapers = async () => {
//     try {
//       // Fetch papers
//       const res = await API.get("/papers");
//       const data = res.data;

//       // Fetch user bookmarks
//       let userBookmarks = [];
//       if (user) {
//         const bookmarkRes = await API.get("/bookmarks");
//         userBookmarks = bookmarkRes.data.map((note) => note._id);
//       }

//       // Merge bookmarks
//       const papersWithBookmark = data.map((paper) => ({
//         ...paper,
//         isBookmarked: userBookmarks.includes(paper._id),
//       }));

//       setPapers(papersWithBookmark);
//       setFilteredPapers(papersWithBookmark);
//     } catch (err) {
//       console.error("Error fetching papers:", err);
//       toast.error("Failed to load papers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookmarkToggle = async (paper) => {
//     if (!user) return toast.error("You must be logged in to bookmark");

//     try {
//       if (paper.isBookmarked) {
//         await API.delete(`/bookmarks/${paper._id}`);
//       } else {
//         await API.post(`/bookmarks/${paper._id}`);
//       }

//       setPapers((prev) =>
//         prev.map((p) =>
//           p._id === paper._id ? { ...p, isBookmarked: !p.isBookmarked } : p
//         )
//       );
//       toast.success(
//         paper.isBookmarked
//           ? "Removed from bookmarks"
//           : "Added to bookmarks"
//       );
//     } catch (err) {
//       console.error("Bookmark toggle failed:", err);
//       toast.error("Failed to update bookmark");
//     }
//   };

//   const applyFilters = () => {
//     let filtered = papers;

//     if (filters.year) filtered = filtered.filter((p) => p.year === filters.year);
//     if (filters.branch) filtered = filtered.filter((p) => p.branch === filters.branch);
//     if (filters.examYear) filtered = filtered.filter((p) => p.examYear === filters.examYear);
//     if (filters.semester) filtered = filtered.filter((p) => p.semester === filters.semester);
//     if (filters.search) {
//       filtered = filtered.filter(
//         (p) =>
//           p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//           p.subject?.toLowerCase().includes(filters.search.toLowerCase())
//       );
//     }

//     if (activeTab === "bookmarks") filtered = filtered.filter((p) => p.isBookmarked);

//     setFilteredPapers(filtered);
//   };

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ year: "", branch: "", examYear: "", semester: "", search: "" });
//   };

//   const handleDownload = async (paperId, fileUrl, filename) => {
//     if (!fileUrl) return toast.error("File URL missing");
//     setDownloading(true);
//     toast.info("Downloading started...");

//     try {
//       const response = await fetch(fileUrl);
//       if (!response.ok) throw new Error("File download failed");

//       const blob = await response.blob();
//       const blobUrl = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = blobUrl;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(blobUrl);

//       await API.post(`/papers/${paperId}/download`);
//     } catch (err) {
//       console.error("Download failed:", err);
//       toast.error("Download failed");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
//         <div className="flex items-center gap-3">
//           <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
//           <span className="text-gray-300">Loading papers...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
//       <StarField />
//       {downloading && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//           <Loader message="Downloading your file..." />
//         </div>
//       )}

//       <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <FileText className="w-16 h-16 text-purple-400 mx-auto animate-bounce" />
//           <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-glow">
//             Previous Papers
//           </h1>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-4 mb-6 justify-center">
//           <button
//             onClick={() => setActiveTab("all")}
//             className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
//               activeTab === "all"
//                 ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white"
//                 : "bg-gray-700/50 text-gray-300"
//             }`}
//           >
//             All Papers
//           </button>
//           <button
//             onClick={() => setActiveTab("bookmarks")}
//             className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
//               activeTab === "bookmarks"
//                 ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white"
//                 : "bg-gray-700/50 text-gray-300"
//             }`}
//           >
//             Bookmarked
//           </button>
//         </div>

//         {/* Papers Grid */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredPapers.map((paper) => {
//             const filename = paper.title
//               ? paper.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
//               : "previous_paper.pdf";

//             return (
//               <div
//                 key={paper._id}
//                 className="group bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 shadow-2xl hover:shadow-purple-500/10"
//               >
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
//                     <FileText className="w-6 h-6 text-white" />
//                   </div>

//                   {/* Bookmark Icon */}
//                   {user && (
//                     <div
//                       className="cursor-pointer"
//                       onClick={() => handleBookmarkToggle(paper)}
//                     >
//                       <Bookmark
//                         className={`w-6 h-6 ${
//                           paper.isBookmarked ? "text-yellow-400" : "text-gray-400"
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors duration-300">
//                   {paper.title}
//                 </h3>

//                 <div className="flex gap-2 mt-4">
//                   <button
//                     onClick={() => handleDownload(paper._id, paper.fileUrl, filename)}
//                     className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group"
//                   >
//                     <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
//                     <span className="text-sm font-medium">Download</span>
//                   </button>
//                 </div>
//               </div>
//             );
//           })}

//           {filteredPapers.length === 0 && (
//             <div className="text-center py-12">
//               <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-400 mb-2">No papers found</h3>
//               <p className="text-gray-500">Try adjusting your filters or search terms</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
