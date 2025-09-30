import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, User, LogOut, Home, UserPlus, LogIn, BookOpen, FileText, MessageCircle, TrendingUp, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
            {/* Navigation Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection('hero')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => scrollToSection('about')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>About</span>
              </button>
              
              <button 
                onClick={() => scrollToSection('features')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
              >
                <TrendingUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Features</span>
              </button>
              
              <button 
                onClick={() => scrollToSection('filtering')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Resources</span>
              </button>
            </div>

            {/* Mobile Home Link */}
            <Link 
              to="/" 
              className="md:hidden flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            
            {user && (
              <>
                <Link 
                  to="/notes" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Notes</span>
                </Link>
                
                <Link 
                  to="/papers" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Papers</span>
                </Link>
                
                {user.email === 'priytoshshahi90@gmail.com' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 group"
                  >
                    <Settings className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )}

            {/* User-specific Links */}
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-sm text-gray-400">
                    Welcome, <span className="text-blue-400 font-medium">{user.name}</span>
                  </span>
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
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 group"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Login</span>
                </Link>
                
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 group"
                >
                  <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
