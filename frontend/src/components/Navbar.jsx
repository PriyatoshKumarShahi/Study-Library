import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track active section for highlighting
  const [activeSection, setActiveSection] = useState("");

 useEffect(() => {
  const handleScroll = () => {
    const sections = ["hero", "about", "features", "filtering"];
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
        {/* Section navigation (Home, About, Features, Resources) */}
        <div className="hidden md:flex items-center gap-6">
          <span onClick={() => scrollToSection("hero")} className={sectionClasses("hero")}>
            Home
          </span>
          <span onClick={() => scrollToSection("about")} className={sectionClasses("about")}>
            About
          </span>
          <span onClick={() => scrollToSection("features")} className={sectionClasses("features")}>
            Features
          </span>
          <span onClick={() => scrollToSection("filtering")} className={sectionClasses("filtering")}>
            Resources
          </span>
        </div>

        {user && (
          <>
            <Link to="/notes" className={linkClasses("/notes")}>
              Notes
            </Link>
            <Link to="/papers" className={linkClasses("/papers")}>
              Papers
            </Link>

            {/* Faculty Dashboard link only for faculty */}
            {user.role === 'faculty' && (
              <Link to="/faculty-dashboard" className={linkClasses("/faculty-dashboard")}>
                Faculty Dashboard
              </Link>
            )}

            {/* Student Assignments accessible to all logged-in users */}
            <Link to="/student-assignments" className={linkClasses("/student-assignments")}>
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

        {user ? (
          <>
            <Link to="/profile" className={linkClasses("/profile")}>
              Profile
            </Link>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-sm text-gray-400 leading-tight text-left">
                <span>Welcome</span>
                <span className="text-blue-400 font-medium">{user.name}</span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600/80 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm group"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
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
