// src/pages/ForumDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Users, Lock, PlusCircle, ArrowRight, Trash2 } from "lucide-react";
import API from "../api";
import { toast } from "react-toastify";

export default function Forum() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create channel state
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isGeneral, setIsGeneral] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await API.get("/forum/channels");
      setChannels(res.data || []);
    } catch {
      toast.error("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Channel name is required");
    setCreating(true);
    try {
      const res = await API.post("/forum/channels", { name, description, isGeneral });
      setChannels((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setName("");
      setDescription("");
      setIsGeneral(false);
      toast.success("Channel created");
      nav(`/forum/channel/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (ch) => {
    if (!user) return toast.error("Login to request join");
    const isMember = ch.members?.some((m) => String(m._id) === String(user.id));
    const hasRequested = ch.pendingRequests?.some((r) => String(r._id) === String(user.id));
    
    if (isMember) {
      return toast.info("You are already a member");
    }
    
    if (hasRequested) {
      return toast.info("Join request already sent");
    }

    try {
      await API.post(`/forum/channels/${ch._id}/join`);
      toast.success(ch.isGeneral ? "Joined channel" : "Join request sent");
      fetchChannels();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join");
    }
  };

  const handleDelete = async (chId) => {
    if (!window.confirm("Delete this channel? All messages will be lost.")) return;
    try {
      await API.delete(`/forum/channels/${chId}`);
      toast.success("Channel deleted");
      fetchChannels();
    } catch {
      toast.error("Failed to delete channel");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Discussion Forum</h1>
          {user && (user.role === "admin" || user.role === "faculty") && (
            <button
              onClick={() => setShowCreate((prev) => !prev)}
              className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
            >
              <PlusCircle size={18} /> Create Channel
            </button>
          )}
        </div>

        {/* Create Channel Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="bg-gray-800 p-6 rounded mb-6 space-y-4 border border-gray-700"
          >
            <div>
              <label className="block text-sm font-semibold mb-1">Channel Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
                placeholder="Enter channel name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
                placeholder="Enter channel description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isGeneral}
                  onChange={(e) => setIsGeneral(e.target.checked)}
                  className="w-4 h-4"
                />
                General Channel (anyone can join without approval)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setName("");
                    setDescription("");
                    setIsGeneral(false);
                  }}
                  className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Channel List */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">Loading channels...</div>
          ) : channels.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No channels yet. {user?.role !== "student" && "Create one to get started!"}
            </div>
          ) : (
            channels.map((ch) => {
              const isMember = ch.members?.some((m) => String(m._id) === String(user?.id));
              const hasRequested = ch.pendingRequests?.some((r) => String(r._id) === String(user?.id));
              const isCreator = user && String(ch.creator?._id) === String(user.id);
              const canDelete = user && (user.role === "admin" || isCreator);

              return (
                <div
                  key={ch._id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex justify-between items-start hover:border-gray-600 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">{ch.name}</h2>
                      {ch.isGeneral && (
                        <span className="text-xs bg-green-600 px-2 py-0.5 rounded">General</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{ch.description || "No description"}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Created by: {ch.creator?.name || "Unknown"}</div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {ch.members?.length || 0} members
                        </span>
                        {!ch.isGeneral && (
                          <span className="flex items-center gap-1">
                            <Lock size={12} />
                            {ch.pendingRequests?.length || 0} pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {isMember ? (
                      <Link 
                        to={`/forum/channel/${ch._id}`} 
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-1"
                      >
                        Open <ArrowRight size={14} />
                      </Link>
                    ) : hasRequested ? (
                      <span className="bg-yellow-600 px-4 py-2 rounded text-sm">Pending</span>
                    ) : (
                      <button 
                        onClick={() => handleJoin(ch)} 
                        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700 transition"
                      >
                        {ch.isGeneral ? "Join" : "Request"}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(ch._id)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}