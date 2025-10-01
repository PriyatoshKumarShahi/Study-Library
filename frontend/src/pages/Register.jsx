import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, GraduationCap, BookOpen, Sparkles } from 'lucide-react';
import StarField from '../components/StarField';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [facultyForm, setFacultyForm] = useState({ department: '', code: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFacultyChange = (e) => setFacultyForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Faculty code verification
    if (form.role === 'faculty' && facultyForm.code !== 'ABESEC') {
      setError('Invalid faculty code!');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role === 'faculty'){

        payload.department = facultyForm.department;
      payload.code = facultyForm.code; 
      }
      await register(payload); // Call backend
      nav('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <StarField />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <GraduationCap className="w-16 h-16 text-blue-400 animate-bounce" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Join AceStudy
            </h1>
            <p className="text-gray-400">Create your account and start your learning journey</p>
          </div>

          {/* Form Card */}
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg mb-4 animate-shake">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="flex gap-4 mb-4 justify-center">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={form.role === 'student'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Student
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="faculty"
                  checked={form.role === 'faculty'}
                  onChange={handleChange}
                  className="mr-2"
                />
                Faculty
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white pl-11 pr-4 py-3 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white pl-11 pr-4 py-3 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 text-white pl-11 pr-4 py-3 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Faculty Fields (Animated) */}
              <div className={`overflow-hidden transition-all duration-500 ${form.role === 'faculty' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-1 mt-2">
                  <label className="text-sm font-medium text-gray-300">Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="department"
                      placeholder="Enter department"
                      value={facultyForm.department}
                      onChange={handleFacultyChange}
                      className="w-full bg-gray-700/50 border border-gray-600 text-white pl-11 pr-4 py-3 rounded-lg"
                      required={form.role === 'faculty'}
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <label className="text-sm font-medium text-gray-300">Special Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="code"
                      placeholder="Enter special code"
                      value={facultyForm.code}
                      onChange={handleFacultyChange}
                      className="w-full bg-gray-700/50 border border-gray-600 text-white pl-11 pr-4 py-3 rounded-lg"
                      required={form.role === 'faculty'}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Create Account
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
