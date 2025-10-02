import React, { useState } from "react";
import API from "../api"; 
import { toast } from "react-toastify";
import Loader from "../components/Loader";

export default function StudentAssignments() {
  const [filters, setFilters] = useState({
    assignmentNo: "",
    subject: "",
    facultyName: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSearch = async () => {
    try {
      setError("");
      const res = await API.get("/assignments", { params: filters });
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch assignments");
    }
  };

const handleDownload = async (assignmentId, fileUrl, filename) => {
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
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    // ✅ Increment download count in backend
    // await API.post(`/assignments/${assignmentId}/download`);

    toast.success("Download completed");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error(error.message || "Download failed"); // ✅ fixed
  } finally {
    setDownloading(false);
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6">
      {downloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <Loader message="Downloading your file..." />
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Access Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          name="assignmentNo"
          placeholder="Assignment No"
          value={filters.assignmentNo}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 w-full"
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={filters.subject}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 w-full"
        />
        <input
          type="text"
          name="facultyName"
          placeholder="Faculty Name"
          value={filters.facultyName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 w-full"
        />
      </div>
      <button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 p-2 rounded mb-6"
      >
        Search
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-600/50 rounded text-white">{error}</div>
      )}

      <div className="space-y-4">
        {assignments.map((a) => {
          // generate clean filename
          const cleanFilename = a.subject
            ? a.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
            : "assignment.pdf";

          return (
            <div
              key={a._id}
              className="p-4 bg-gray-800/80 rounded shadow flex flex-col gap-2"
            >
              <h3 className="font-bold">
                {a.assignmentNo} - {a.subject}
              </h3>
              <p>Faculty: {a.facultyName}</p>

              <button
                onClick={() => handleDownload(a._id, a.fileUrl, cleanFilename)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white w-fit"
              >
                Download PDF
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
