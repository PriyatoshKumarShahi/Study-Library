import React, { useState } from "react";
import axios from "axios";

export default function StudentAssignments() {
  const [filters, setFilters] = useState({
    assignmentNo: "",
    subject: "",
    facultyName: "",
  });
  const [assignments, setAssignments] = useState([]);

  const handleChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSearch = async () => {
    try {
      const res = await axios.get("/api/assignments", { params: filters });
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <div className="space-y-4">
        {assignments.map((a) => (
          <div key={a._id} className="p-4 bg-gray-800/80 rounded shadow">
            <h3 className="font-bold">
              {a.assignmentNo} - {a.subject}
            </h3>
            <p>Faculty: {a.facultyName}</p>
            <a
              href={a.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              Download File
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
