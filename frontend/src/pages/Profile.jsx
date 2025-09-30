import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, CreditCard as Edit3, Save, X, Mail, BookOpen, Calendar, Phone, FileText, Star, Trophy, Clock } from 'lucide-react';
import StarField from '../components/StarField';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', profile: { bio: '', department: '', year: '', contact: '' } });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        profile: {
          bio: user.profile?.bio || '',
          department: user.profile?.department || '',
          year: user.profile?.year || '',
          contact: user.profile?.contact || ''
        }
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (['bio', 'department', 'year', 'contact'].includes(name)) {
      setForm(prev => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name: form.name, profile: form.profile });
      setMsg('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error('Update failed', err.response?.data || err.message);
      setMsg(err.response?.data?.message || 'Update failed');
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <span className="text-gray-300">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
           <StarField />
    
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Success/Error Message */}
        {msg && (
          <div className={`mb-6 p-4 rounded-lg border ${
            msg.includes('successfully') 
              ? 'bg-green-900/50 border-green-700 text-green-200' 
              : 'bg-red-900/50 border-red-700 text-red-200'
          } animate-fade-in`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                msg.includes('successfully') ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              {msg}
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user.name || 'User'}
                </h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.role === 'faculty' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                    <span className="text-sm capitalize font-medium">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                Profile Details
              </h2>

              {!editing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Department
                      </label>
                      <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                        {user.profile?.department || 'Not specified'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Year
                      </label>
                      <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                        {user.profile?.year || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
                    </label>
                    <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                      {user.profile?.contact || 'Not provided'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bio
                    </label>
                    <p className="text-white bg-gray-700/50 p-3 rounded-lg min-h-[80px]">
                      {user.profile?.bio || 'No bio added yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Department</label>
                      <input
                        name="department"
                        value={form.profile.department}
                        onChange={onChange}
                        placeholder="e.g., Computer Science"
                        className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Year</label>
                      <select
                        name="year"
                        value={form.profile.year}
                        onChange={onChange}
                        className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Contact</label>
                    <input
                      name="contact"
                      value={form.profile.contact}
                      onChange={onChange}
                      placeholder="Phone number or other contact"
                      className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Bio</label>
                    <textarea
                      name="bio"
                      value={form.profile.bio}
                      onChange={onChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Save Changes
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'faculty' 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {user.role === 'faculty' ? 'Faculty' : 'Student'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.profile?.bio ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {user.profile?.bio ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white text-sm">Recently</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Browse Notes</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm">View Papers</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Study Hub</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}