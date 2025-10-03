// src/pages/ChannelPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Send, Check, Crown, LogOut, ArrowLeft } from "lucide-react";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

// FIXED: Use environment variable or relative URL instead of hardcoded localhost
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";
const socket = io(SOCKET_URL, { withCredentials: true });

export default function ChannelPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState("");
  const msgEndRef = useRef(null);

  useEffect(() => {
    fetchChannelAndMessages();
    socket.emit("joinChannel", id);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("newMessage");
      socket.emit("leaveChannel", id);
    };
  }, [id]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChannelAndMessages = async () => {
    setLoading(true);
    try {
      const chRes = await API.get(`/forum/channels/${id}`);
      setChannel(chRes.data);

      const mRes = await API.get(`/forum/channels/${id}/messages`);
      setMessages(mRes.data || []);
    } catch (err) {
      toast.error("Failed to load channel");
      nav("/forum");
    } finally {
      setLoading(false);
    }
  };

  const isMember = !!channel?.members?.some((m) => String(m._id) === String(user?.id));
  const isCreator = channel && String(channel.creator?._id) === String(user?.id);
  const isAdminOrCreator = user && (user.role === "admin" || isCreator);

  const handleSend = async () => {
    if (!msgText.trim()) return;
    if (!isMember) return toast.error("You must be a member to send messages");
    
    const tempMsg = msgText;
    setMsgText(""); // Clear input immediately for better UX
    
    try {
      await API.post(`/forum/channels/${id}/messages`, { content: tempMsg });
    } catch (err) {
      toast.error("Failed to send");
      setMsgText(tempMsg); // Restore message on error
    }
  };

  const handleApprove = async (uid) => {
    try {
      await API.post(`/forum/channels/${id}/approve`, { userId: uid });
      toast.success("User approved");
      fetchChannelAndMessages();
    } catch {
      toast.error("Approve failed");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this channel?")) return;
    try {
      await API.post(`/forum/channels/${id}/leave`);
      toast.success("You left the channel");
      nav("/forum");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave channel");
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (loading) return <Loader message="Loading channel..." />;
  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Channel not found</p>
          <button onClick={() => nav("/forum")} className="bg-purple-600 px-4 py-2 rounded">
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  // Check if user is a member
  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">{channel.name}</h1>
          <p className="text-gray-400 mb-6">You must be a member to view this channel</p>
          <button 
            onClick={() => nav("/forum")} 
            className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => nav("/forum")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{channel.name}</h1>
              <p className="text-sm text-gray-400">{channel.description || "No description"}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                Created by: {channel.creator?.name || "Unknown"}
                <Crown size={12} className="text-yellow-400" />
              </p>
            </div>
          </div>

          {isMember && !isCreator && (
            <button
              onClick={handleLeave}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded flex items-center gap-1 text-sm transition"
            >
              <LogOut size={14} /> Leave
            </button>
          )}
        </div>

        {/* Pending Requests */}
        {isAdminOrCreator && channel.pendingRequests?.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              Pending Join Requests
              <span className="bg-yellow-600 text-xs px-2 py-0.5 rounded">
                {channel.pendingRequests.length}
              </span>
            </h3>
            <div className="space-y-2">
              {channel.pendingRequests.map((u) => (
                <div key={u._id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <span className="font-medium">{u.name || "Unknown User"}</span>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(u._id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="bg-gray-800 p-4 rounded mb-4 flex-1 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((m) => {
              const isMine = String(m.author?._id) === String(user?.id);
              const isChannelCreator = String(m.author?._id) === String(channel.creator?._id);
              
              return (
                <div
                  key={m._id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-md break-words ${
                      isMine ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1 mb-1">
                      {m.author?.name || "Unknown User"}
                      {isChannelCreator && (
                        <Crown size={12} className="text-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm">{m.content}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {formatDateTime(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Send box */}
        <div className="flex gap-2">
          <input
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 px-4 py-3 rounded text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
          />
          <button 
            onClick={handleSend} 
            className="bg-purple-600 hover:bg-purple-700 px-6 rounded transition disabled:opacity-50"
            disabled={!msgText.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-72 border-l border-gray-700 p-4 overflow-y-auto bg-gray-800">
        <h3 className="font-bold mb-3 flex items-center justify-between">
          <span>Members</span>
          <span className="text-sm bg-gray-700 px-2 py-0.5 rounded">
            {channel.members?.length || 0}
          </span>
        </h3>
        <div className="space-y-2">
          {channel.members && channel.members.length > 0 ? (
            channel.members.map((m) => {
              const isMemberCreator = String(m._id) === String(channel.creator?._id);
              return (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name || "Unknown"}</div>
                    <div className="text-xs text-gray-400 truncate">{m.email}</div>
                  </div>
                  {isMemberCreator && (
                    <Crown size={14} className="text-yellow-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">No members yet</div>
          )}
        </div>
      </div>
    </div>
  );
}