import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../api";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    assignmentNo: "",
    subject: "",
    year: "",
    branch: "",
    description: "",
    file: null,
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
    for (let key in form) data.append(key, form[key]);
    data.append("facultyName", user.name); // ✅ auto-attach faculty name

    try {
      const res = await API.post("/assignments/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Assignment uploaded successfully!");
      setForm({
        assignmentNo: "",
        subject: "",
        year: "",
        branch: "",
        description: "",
        file: null,
      });
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Upload failed");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl mt-8">
      <h2 className="text-2xl font-bold mb-4">Faculty Dashboard</h2>
      {msg && <div className="mb-4 p-3 bg-green-600/50 rounded">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="assignmentNo"
          placeholder="Assignment No"
          value={form.assignmentNo}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700"
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700"
          required
        />
        <input
          type="text"
          name="year"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700"
          required
        />
        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={form.branch}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-700"
          rows={3}
        ></textarea>
        <input
          type="file"
          name="file"
          onChange={handleChange}
          className="w-full text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
        >
          Upload Assignment
        </button>
      </form>
    </div>
  );
}
