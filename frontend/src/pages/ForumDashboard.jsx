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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Discussion Forum
          </h1>
          <p className="text-gray-400 text-lg">Connect, collaborate, and engage with your community</p>
        </div>

        {/* Create Button */}
        {user && (user.role === "admin" || user.role === "faculty") && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowCreate((prev) => !prev)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            >
              <PlusCircle size={20} /> Create Channel
            </button>
          </div>
        )}

        {/* Create Channel Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl mb-10 space-y-6 border border-gray-700 shadow-2xl max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Create New Channel
            </h2>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Channel Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-all"
                placeholder="Enter channel name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none transition-all resize-none"
                placeholder="Enter channel description"
                rows={4}
              />
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isGeneral}
                  onChange={(e) => setIsGeneral(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer accent-emerald-500"
                />
                <span className="group-hover:text-emerald-400 transition-colors">
                  General Channel (anyone can join without approval)
                </span>
              </label>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setName("");
                    setDescription("");
                    setIsGeneral(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-emerald-500/50"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Channel"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Channel List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {loading ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <div className="inline-block w-8 h-8 border-4 border-gray-600 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p>Loading channels...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl mb-2">No channels yet</p>
              <p className="text-sm">{user?.role !== "student" && "Create one to get started!"}</p>
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
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 transform hover:-translate-y-1"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-bold text-white">{ch.name}</h2>
                      {ch.isGeneral && (
                        <span className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                          General
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {ch.description || "No description provided"}
                    </p>
                    <div className="text-xs text-gray-500 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Created by:</span>
                        <span className="text-emerald-400 font-medium">{ch.creator?.name || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 bg-gray-700/50 px-3 py-1 rounded-full">
                          <Users size={13} />
                          <span className="font-medium">{ch.members?.length || 0}</span>
                          <span className="text-gray-400">members</span>
                        </span>
                        {!ch.isGeneral && (
                          <span className="flex items-center gap-1.5 bg-gray-700/50 px-3 py-1 rounded-full">
                            <Lock size={13} />
                            <span className="font-medium">{ch.pendingRequests?.length || 0}</span>
                            <span className="text-gray-400">pending</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-700/50">
                    {isMember ? (
                      <Link 
                        to={`/forum/channel/${ch._id}`} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-blue-500/50 cursor-pointer transform hover:scale-105"
                      >
                        Open Channel <ArrowRight size={16} />
                      </Link>
                    ) : hasRequested ? (
                      <span className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 px-4 py-2.5 rounded-lg text-sm text-center font-medium shadow-lg">
                        Request Pending
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleJoin(ch)} 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/50 cursor-pointer transform hover:scale-105"
                      >
                        {ch.isGeneral ? "Join Now" : "Request to Join"}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(ch._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                        title="Delete Channel"
                      >
                        <Trash2 size={18} />
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