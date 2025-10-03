import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, MessageCircle, TrendingUp, Users, Upload, Filter, Star, Sparkles, GraduationCap } from 'lucide-react';
import StarField from '../components/StarField';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-950 min-h-screen text-white relative overflow-hidden">
      {/* Connected Star Field Background */}
      
      {/* Hero Section */}
      <section id="hero" className="relative z-10  text-center py-24 px-6 bg-gradient-to-b from-indigo-900/50 via-purple-900/30 to-gray-900/50">
      <StarField />
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <GraduationCap className="w-20 h-20 text-blue-400 animate-bounce" />
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-glow">
              AceStudy
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Your ultimate platform for academic excellence. Connect, learn, and excel with comprehensive study resources.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {!user && (
                <>
                  <Link 
                    to="/register" 
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Get Started <Star className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </span>
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-700/80 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Login
                  </Link>
                </>
              )}
              {user && (
                <Link 
                  to="/profile" 
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why AceStudy Exists Section */}
      <section id="about" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Why AceStudy Exists?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We understand the challenges students face in accessing quality study materials. AceStudy bridges the gap between students and resources, creating a collaborative learning ecosystem.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Accessibility</h3>
              <p className="text-gray-300 leading-relaxed">Making quality educational resources accessible to every student, regardless of their location or background.</p>
            </div>
            
            <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Collaboration</h3>
              <p className="text-gray-300 leading-relaxed">Fostering a community where students and faculty can share knowledge and support each other's academic journey.</p>
            </div>
            
            <div className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Excellence</h3>
              <p className="text-gray-300 leading-relaxed">Empowering students to achieve academic excellence through comprehensive resources and progress tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Comprehensive Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need for academic success, all in one platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Notes Feature */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Smart Notes</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Access subject-wise notes shared by faculty and top students. Filter by year, branch, and subject for quick discovery.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">Subject-wise</span>
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">Searchable</span>
              </div>
            </div>
            
            {/* Previous Papers */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Previous Papers</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Comprehensive collection of previous year question papers with solutions. Filter by year, semester, and branch.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">Year-wise</span>
                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">Solutions</span>
              </div>
            </div>
            
            {/* Study Discussions */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Study Discussions</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Interactive discussion forums where students can ask questions, share insights, and collaborate on academic topics.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">Interactive</span>
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">Collaborative</span>
              </div>
            </div>
            
            {/* Study Hub */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Study Hub</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Track your study time, set goals, and monitor your learning progress with detailed analytics and insights.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">Time Tracking</span>
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">Analytics</span>
              </div>
            </div>
            
            {/* Progress Dashboard */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-pink-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Progress Dashboard</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Personalized dashboard showing your study progress, achievements, goals, and performance metrics.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full">Personalized</span>
                <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full">Achievements</span>
              </div>
            </div>
            
            {/* Faculty Features */}
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl hover:border-teal-500/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Faculty Portal</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Faculty can upload assignments, share study materials, track student progress, and manage course content.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-teal-500/20 text-teal-300 rounded-full">Upload</span>
                <span className="px-2 py-1 text-xs bg-teal-500/20 text-teal-300 rounded-full">Management</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Filtering Section */}
      <section id="filtering" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Smart Filtering System
            </h2>
            <p className="text-xl text-gray-300">Find exactly what you need with our advanced filtering options</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Year & Semester Wise</h3>
                  <p className="text-gray-300">Filter content by academic year and semester for targeted study materials.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Branch & Subject</h3>
                  <p className="text-gray-300">Organize materials by engineering branches and specific subjects for easy access.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Quality Ratings</h3>
                  <p className="text-gray-300">Find top-rated content reviewed by students and verified by faculty members.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Available Filters</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-400">Academic</h4>
                  <div className="flex flex-col gap-1 text-sm text-gray-300">
                    <span>• Year (1st - 4th)</span>
                    <span>• Semester</span>
                    <span>• Branch</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-400">Content Type</h4>
                  <div className="flex flex-col gap-1 text-sm text-gray-300">
                    <span>• Notes</span>
                    <span>• Question Papers</span>
                    <span>• Assignments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of students already using AceStudy to achieve academic excellence.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Your Journey <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}