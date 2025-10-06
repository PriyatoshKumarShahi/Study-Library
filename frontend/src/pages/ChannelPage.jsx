import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Send, Check, Crown, LogOut, ArrowLeft, MoreVertical, Flag, Pin, X, Trash2 } from "lucide-react";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import StarField from "../components/StarField";


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
  const [openMemberMenu, setOpenMemberMenu] = useState(null);
  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const msgEndRef = useRef(null);

  useEffect(() => {
    fetchChannelAndMessages();
    socket.emit("joinChannel", id);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageUpdated", (msg) => {
      setMessages((prev) => prev.map(m => m._id === msg._id ? msg : m));
    });

    socket.on("messageDeleted", (data) => {
      setMessages((prev) => prev.filter(m => m._id !== data.messageId));
    });

    socket.on("memberRemoved", (data) => {
      if (String(data.userId) === String(user?.id)) {
        toast.error("You have been removed from this channel");
        nav("/forum");
      } else {
        fetchChannelAndMessages();
      }
    });

    socket.on("userBanned", (data) => {
      if (String(data.userId) === String(user?.id)) {
        toast.error("You have been banned from this channel");
        nav("/forum");
      } else {
        fetchChannelAndMessages();
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("messageDeleted");
      socket.off("memberRemoved");
      socket.off("userBanned");
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
  const canPinMessages = user && (user.role === "admin" || user.role === "faculty" || isCreator);

  const handleSend = async () => {
    if (!msgText.trim()) return;
    if (!isMember) return toast.error("You must be a member to send messages");

    const tempMsg = msgText;
    setMsgText("");

    try {
      await API.post(`/forum/channels/${id}/messages`, { content: tempMsg });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send");
      setMsgText(tempMsg);
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

  const handleRemoveMember = async (memberId) => {
    console.log("Remove member clicked:", memberId);
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      console.log("Calling API to remove member...");
      const res = await API.post(`/forum/channels/${id}/remove-member`, { userId: memberId });
      console.log("API response:", res.data);

      toast.success("Member removed successfully");
      setOpenMemberMenu(null);
      fetchChannelAndMessages();
    } catch (err) {
      console.error("Error removing member:", err);
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleReportMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to report this message?")) return;

    try {
      const res = await API.post(`/forum/messages/${messageId}/report`);
      if (res.data.banned) {
        toast.warning("Message reported. User has been banned due to multiple reports.");
      } else {
        toast.success(`Message reported (${res.data.reportCount} reports)`);
      }
      setOpenMessageMenu(null);
      fetchChannelAndMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report message");
    }
  };

  const handlePinMessage = async (messageId, isPinned) => {
    try {
      await API.post(`/forum/messages/${messageId}/pin`, { pinned: !isPinned });
      toast.success(isPinned ? "Message unpinned" : "Message pinned");
      setOpenMessageMenu(null);
      fetchChannelAndMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pin/unpin message");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await API.delete(`/forum/messages/${messageId}`);
      toast.success("Message deleted successfully");
      setOpenMessageMenu(null);
      setMessages((prev) => prev.filter(m => m._id !== messageId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
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
          <button onClick={() => nav("/forum")} className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700 cursor-pointer">
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">{channel.name}</h1>
          <p className="text-gray-400 mb-6">You must be a member to view this channel</p>
          <button
            onClick={() => nav("/forum")}
            className="bg-emerald-600 px-6 py-2 rounded hover:bg-emerald-700 cursor-pointer"
          >
            Back to Forum
          </button>
        </div>
      </div>
    );
  }

  const pinnedMessages = messages.filter(m => m.pinned);
  const regularMessages = messages.filter(m => !m.pinned);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <StarField />
      {/* Left Sidebar - Members */}
      <div className="w-64 border-r border-gray-700 bg-gray-850 overflow-y-auto mt-16">
        <div className="p-4">
          <h3 className="font-bold mb-3 flex items-center justify-between text-gray-300">
            <span>Members</span>
            <span className="text-sm bg-gray-700 px-2 py-0.5 rounded">
              {channel.members?.length || 0}
            </span>
          </h3>
          <div className="space-y-2">
            {channel.members && channel.members.length > 0 ? (
              channel.members.map((m) => {
                const isMemberCreator = String(m._id) === String(channel.creator?._id);
                const isCurrentUser = String(m._id) === String(user?.id);
                const canRemove = isAdminOrCreator && !isMemberCreator && !isCurrentUser;

                return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 transition group"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="font-medium truncate flex items-center gap-1 text-sm">
                        {m.name || "Unknown"}
                        {isMemberCreator && (
                          <Crown size={12} className="text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{m.email}</div>
                    </div>

                    {canRemove && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMemberMenu(openMemberMenu === m._id ? null : m._id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {openMemberMenu === m._id && (
                          <div
                            className="absolute right-0 top-8 bg-gray-900 border border-gray-600 rounded shadow-lg z-20 w-32"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                console.log("Remove member clicked:", m._id);

                                if (!window.confirm("Are you sure you want to remove this member?")) return;

                                try {
                                  console.log("Calling API to remove member...");
                                  const res = await API.post(`/forum/channels/${id}/remove-member`, { userId: m._id });
                                  console.log("API response:", res.data);

                                  toast.success("Member removed successfully");
                                  setOpenMemberMenu(null);
                                  fetchChannelAndMessages();
                                } catch (err) {
                                  console.error("Error removing member:", err);
                                  toast.error(err.response?.data?.message || "Failed to remove member");
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
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

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => nav("/forum")}
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">{channel.name}</h1>
                <p className="text-sm text-gray-400">
                  {channel.description || "No description"}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-400 flex items-center gap-1 ml-auto">
              <span>Created by:</span>
              <span className="font-medium text-white">
                {channel.creator?.name || "Unknown"}
              </span>
              <Crown size={14} className="text-yellow-400" />
            </div>
          </div>

          {isMember && !isCreator && (
            <button
              onClick={handleLeave}
              className="bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded flex items-center gap-1 text-sm transition cursor-pointer ml-3"
            >
              <LogOut size={14} /> Leave
            </button>
          )}
        </div>

        {/* Pending Requests */}
        {isAdminOrCreator && channel.pendingRequests?.length > 0 && (
          <div className="bg-yellow-900/20 border-b border-yellow-700/30 p-3">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-300">
              Pending Join Requests
              <span className="bg-yellow-600 text-xs px-2 py-0.5 rounded">
                {channel.pendingRequests.length}
              </span>
            </h3>
            <div className="space-y-2">
              {channel.pendingRequests.map((u) => (
                <div key={u._id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded">
                  <div>
                    <span className="font-medium text-sm">{u.name || "Unknown User"}</span>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <button
                    onClick={() => handleApprove(u._id)}
                    className="bg-green-600/80 hover:bg-green-600 px-3 py-1 rounded text-sm flex items-center gap-1 transition cursor-pointer"
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="bg-emerald-900/10 border-b border-emerald-700/30 p-3 max-h-32 overflow-y-auto">
            <h3 className="text-xs font-bold mb-2 flex items-center gap-1 text-emerald-300">
              <Pin size={12} /> Pinned Messages
            </h3>
            <div className="space-y-1">
              {pinnedMessages.map((m) => (
                <div key={m._id} className="bg-gray-800/30 rounded p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-400 text-xs">
                        {m.author?.name || "Unknown"}
                      </span>
                      <p className="text-gray-300 text-xs mt-0.5">{m.content}</p>
                    </div>
                    {canPinMessages && (
                      <button
                        onClick={() => handlePinMessage(m._id, true)}
                        className="text-gray-400 hover:text-red-400 ml-2 cursor-pointer"
                        title="Unpin"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {regularMessages.length === 0 && pinnedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            regularMessages.map((m) => {
              const isMine = String(m.author?._id) === String(user?.id);
              const isChannelCreator = String(m.author?._id) === String(channel.creator?._id);
              const hasReported = m.reports?.some((r) => String(r._id) === String(user?.id));
              const reportCount = m.reports?.length || 0;
              const canDeleteMessage = isMine || user?.role === "faculty";

              return (
                <div
                  key={m._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} group`}
                >
                  <div className="flex items-start gap-2 max-w-lg">
                    <div
                      className={`px-3 py-2 rounded-2xl ${
                        isMine
                          ? "bg-emerald-600/20 border border-emerald-500/30 text-white"
                          : "bg-gray-800/60 border border-gray-700/50 text-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px] font-medium text-gray-400">
                          {m.author?.name || "Unknown User"}
                        </span>
                        {isChannelCreator && (
                          <Crown size={10} className="text-yellow-400" />
                        )}
                      </div>
                      <div className="text-sm leading-relaxed">{m.content}</div>
                      <div className="text-xs opacity-60 mt-0.5 flex items-center gap-2">
                        <span>{formatDateTime(m.createdAt)}</span>
                        {reportCount > 0 && (
                          <span className="flex items-center gap-0.5 text-red-400">
                            <Flag size={8} /> {reportCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Three Dots Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMessageMenu(openMessageMenu === m._id ? null : m._id)}
                        className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMessageMenu === m._id && (
                        <div className="absolute right-0 top-6 bg-gray-900 border border-gray-600 rounded shadow-lg z-20 w-36">
                          {!isMine && (
                            <button
                              onClick={() => handleReportMessage(m._id)}
                              disabled={hasReported}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                hasReported
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-400 hover:bg-gray-800 cursor-pointer"
                              }`}
                            >
                              <Flag size={12} />
                              {hasReported ? "Reported" : "Report"}
                            </button>
                          )}
                          {canPinMessages && (
                            <button
                              onClick={() => handlePinMessage(m._id, m.pinned)}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                            >
                              <Pin size={12} />
                              {m.pinned ? "Unpin" : "Pin"}
                            </button>
                          )}
                          {canDeleteMessage && (
                            <button
                              onClick={() => handleDeleteMessage(m._id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 flex items-center gap-2 cursor-pointer border-t border-gray-700"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={msgEndRef} />
        </div>

        {/* Send box */}
        <div className="p-4 bg-gray-800/30 border-t border-gray-700">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 px-4 py-3 rounded-lg text-white border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 rounded-lg transition disabled:opacity-50 cursor-pointer"
              disabled={!msgText.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(openMemberMenu || openMessageMenu) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setOpenMemberMenu(null);
            setOpenMessageMenu(null);
          }}
        />
      )}
    </div>
  );
}