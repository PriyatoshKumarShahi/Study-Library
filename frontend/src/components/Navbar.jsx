import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GraduationCap, LogOut, Bell, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import API from "../api"; // Axios instance

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    try {
      await API.put("/notifications/mark-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "features", "resources"];
      let current = "";
      for (let sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = sec;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    if (location.pathname === "/") {
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // initialize
    } else {
      // reset active section when not on home page
      setActiveSection("");
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setActiveSection(sectionId);
  };

  const linkClasses = (path) =>
    `transition-colors duration-200 ${
      location.pathname === path
        ? "text-blue-400 font-semibold"
        : "text-gray-300 hover:text-white"
    }`;

  const sectionClasses = (section) =>
    `cursor-pointer transition-colors duration-200 ${
      activeSection === section
        ? "text-blue-400 font-semibold"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="bg-gray-800/95 backdrop-blur-sm text-white shadow-2xl border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <GraduationCap className="w-8 h-8 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AceStudy
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Section navigation */}
            <div className="hidden md:flex items-center gap-6">
              <span
                onClick={() => scrollToSection("hero")}
                className={sectionClasses("hero")}
              >
                Home
              </span>
              <span
                onClick={() => scrollToSection("about")}
                className={sectionClasses("about")}
              >
                About
              </span>

              {/* Show Features + Resources ONLY when user is NOT logged in */}
              {!user && (
                <>
                  <span
                    onClick={() => scrollToSection("features")}
                    className={sectionClasses("features")}
                  >
                    Features
                  </span>
                  <span
                    onClick={() => scrollToSection("resources")}
                    className={sectionClasses("resources")}
                  >
                    Resources
                  </span>
                </>
              )}
            </div>

            {/* Logged in user links */}
            {user && (
              <>
                <Link to="/notes" className={linkClasses("/notes")}>
                  Notes
                </Link>
                <Link to="/papers" className={linkClasses("/papers")}>
                  Papers
                </Link>
                <Link to="/forum" className={linkClasses("/forum")}>
                  Forum
                </Link>

                {/* Faculty Dashboard link only for faculty */}
                {user.role === "faculty" && (
                  <Link
                    to="/faculty-dashboard"
                    className={linkClasses("/faculty-dashboard")}
                  >
                    Faculty Dashboard
                  </Link>
                )}

                {/* Student Assignments accessible to all logged-in users */}
                <Link
                  to="/student-assignments"
                  className={linkClasses("/student-assignments")}
                >
                  Assignments
                </Link>
               

                {/* Admin link for specific email */}
                {user.email === "priytoshshahi90@gmail.com" && (
                  <Link to="/admin" className={linkClasses("/admin")}>
                    Admin
                  </Link>
                )}
              </>
            )}

            {/* Auth buttons */}
            {user ? (
              <>
                <Link to="/profile" className={linkClasses("/profile")}>
                  Profile
                </Link>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col text-sm text-gray-400 leading-tight text-left">
                    <span>Welcome</span>
                    <span className="text-blue-400 font-medium">
                      {user.name}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center gap-2 bg-red-600/80 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm group cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform " />
                    <span>Logout</span>
                  </button>
                </div>
                    <div className="relative" ref={dropdownRef}>
  <button
    onClick={() => {
      setShowDropdown((prev) => !prev);
      if (unreadCount > 0) markAsRead(); // mark all as read when opened
    }}
    className="relative p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
  >
    <Bell className="w-6 h-6 text-gray-300 hover:text-blue-400 transition-colors" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
        {unreadCount}
      </span>
    )}
  </button>

  {/* Dropdown */}
  {showDropdown && (
    <div className="absolute right-0 mt-2 w-80 bg-gray-800/90 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-50 backdrop-blur-md">
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-300">Notifications</span>

        {notifications.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={markAsRead}
              className="text-xs text-blue-400 hover:underline"
            >
              Mark all as read
            </button>
            <button
              onClick={async () => {
                try {
                  await API.delete("/notifications/clear");
                  setNotifications([]);
                } catch (err) {
                  console.error("Error clearing notifications", err);
                }
              }}
              className="text-xs text-red-400 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-72 overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif, i) => (
            <div
              key={i}
              className={`p-3 border-b border-gray-700 last:border-0 flex justify-between items-start gap-2 transition cursor-pointer
                ${
                  notif.read
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700/40"
                    : "bg-gray-700/40 text-white hover:bg-gray-700/60"
                }`}
            >
              <div className="flex-1">
                <div className="text-sm">{notif.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>

              {/* 🗑️ Delete button */}
              <button
                onClick={async () => {
                  try {
                    await API.delete(`/notifications/${notif._id}`);
                    setNotifications((prev) =>
                      prev.filter((n) => n._id !== notif._id)
                    );
                  } catch (err) {
                    console.error("Error deleting notification", err);
                  }
                }}
                className="text-gray-400 hover:text-red-400 transition cursor-pointer"
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500 text-sm text-center">
            No notifications
          </div>
        )}
      </div>
    </div>
  )}
</div>

              </>
            ) : (
              <>
                <Link to="/login" className={linkClasses("/login")}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                    location.pathname === "/register"
                      ? "bg-gradient-to-r from-blue-700 to-purple-700 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
