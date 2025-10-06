import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  CreditCard as Edit3,
  Save,
  X,
  Mail,
  BookOpen,
  Calendar,
  Phone,
  FileText,
  Star,
  Trophy,
  Clock,
  Code,
  TrendingUp,
  Award,
  AlertCircle,
  Loader,
  ExternalLink,
  Target,
  Zap,
} from "lucide-react";
import StarField from "../components/StarField";

// Circular Progress Chart Component
const CircularProgress = ({ solved, total, easy, medium, hard }) => {
  const circumference = 2 * Math.PI * 70;

  // ✅ Compute percentages based on solved count, not total problems in site
  const totalSolved = easy + medium + hard || 1;
  const easyPercent = (easy / totalSolved) * 100;
  const mediumPercent = (medium / totalSolved) * 100;
  const hardPercent = (hard / totalSolved) * 100;

  // Convert percentages to stroke lengths
  const easyLength = (easyPercent / 100) * circumference;
  const mediumLength = (mediumPercent / 100) * circumference;
  const hardLength = (hardPercent / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        {/* Background circle */}
        <circle cx="96" cy="96" r="70" stroke="#374151" strokeWidth="14" fill="none" />

        {/* Easy (green) */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="#10b981"
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${easyLength} ${circumference - easyLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Medium (yellow) */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="#fbbf24"
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${mediumLength} ${circumference - mediumLength}`}
          strokeDashoffset={-easyLength}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Hard (red) */}
        <circle
          cx="96"
          cy="96"
          r="70"
          stroke="#ef4444"
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${hardLength} ${circumference - hardLength}`}
          strokeDashoffset={-(easyLength + mediumLength)}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-white">{solved}</div>
          <div className="text-sm text-gray-400 mt-1">Solved</div>
        </div>
      </div>
    </div>
  );
};


// Difficulty Bar Component
const DifficultyBar = ({ label, count, color, maxCount }) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color.replace("text-", "bg-")} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

// Removed Activity Heat Map - not fetching real data from LeetCode API

// LeetCode Stats Component
const LeetCodeStats = ({ username }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      fetchStats();
    }
  }, [username]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coding-stats/fetch-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          profiles: [{ platform: 'leetcode', username }] 
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      
      if (data.results && data.results[0] && !data.results[0].error) {
        setStats(data.results[0].stats);
      } else {
        throw new Error(data.results[0]?.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || "Failed to fetch LeetCode statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!username) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 shadow-2xl text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4">
          💻
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white">No LeetCode Profile</h2>
        <p className="text-gray-400">Add your LeetCode username in the profile section to see your coding stats</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 shadow-2xl">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Loader className="w-12 h-12 animate-spin text-orange-400" />
          <span className="text-gray-300 text-lg">Fetching your LeetCode stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 text-red-400 py-8">
          <AlertCircle className="w-12 h-12" />
          <span className="text-lg">{error}</span>
          <button
            onClick={fetchStats}
            className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg transition-colors text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxSolved = Math.max(stats.easySolved, stats.mediumSolved, stats.hardSolved);

  return (
    <div className="space-y-6">
    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover:border-purple-400/50 transition-all">
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-xl flex items-center justify-center text-3xl shadow-lg">
        💻
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">LeetCode Statistics</h2>
        <a
          href={`https://leetcode.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
        >
          <span className="text-lg font-medium">@{username}</span>
          <ExternalLink className="w-4 h-4  group-hover:-translate-y-0.25 transition-transform" />
        </a>
      </div>
    </div>
    <button
      onClick={fetchStats}
      className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-5 py-2.5 rounded-lg transition-all transform hover:scale-105 shadow-lg"
    >
      <TrendingUp className="w-4 h-4" />
      Refresh Stats
    </button>
  </div>
</div>


      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl hover:border-gray-600 transition-all">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            DSA Problems Solved
          </h3>
          <div className="flex justify-center mb-6">
            <CircularProgress
              solved={stats.totalSolved}
              total={3200}
              easy={stats.easySolved}
              medium={stats.mediumSolved}
              hard={stats.hardSolved}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">{stats.totalSolved} problems solved</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Easy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-gray-300">Hard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl hover:border-gray-600 transition-all">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Difficulty Breakdown
          </h3>
          <div className="space-y-6">
            <DifficultyBar label="Easy" count={stats.easySolved} color="text-green-400" maxCount={maxSolved} />
            <DifficultyBar label="Medium" count={stats.mediumSolved} color="text-yellow-400" maxCount={maxSolved} />
            <DifficultyBar label="Hard" count={stats.hardSolved} color="text-red-400" maxCount={maxSolved} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-blue-400" />
                <h4 className="text-sm font-medium text-gray-400">Global Ranking</h4>
              </div>
              <p className="text-4xl font-bold text-white">
                #{stats.ranking ? stats.ranking.toLocaleString() : 'N/A'}
              </p>
            </div>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-purple-400" />
                <h4 className="text-sm font-medium text-gray-400">Total Problems</h4>
              </div>
              <p className="text-4xl font-bold text-white">{stats.totalSolved}</p>
            </div>
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Code className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
;

// Main Profile Component
export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    profile: { bio: "", department: "", year: "", contact: "", leetcode: "" },
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        profile: {
          bio: user.profile?.bio || "",
          department: user.profile?.department || "",
          year: user.role === "faculty" ? "" : user.profile?.year || "",
          contact: user.profile?.contact || "",
          leetcode: user.profile?.leetcode || "",
        },
      });
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (["bio", "department", "year", "contact", "leetcode"].includes(name)) {
      setForm((prev) => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name: form.name, profile: form.profile });
      setMsg("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      console.error("Update failed", err);
      setMsg("Update failed");
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {msg && (
          <div className={`mb-6 p-4 rounded-lg border ${msg.includes("successfully") ? "bg-green-900/50 border-green-700 text-green-200" : "bg-red-900/50 border-red-700 text-red-200"} animate-fade-in`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${msg.includes("successfully") ? "bg-green-400" : "bg-red-400"}`}></div>
              {msg}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {user.name || "User"}
                </h1>
                <div className="flex items-center gap-4 text-gray-300 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user.role === "faculty" ? "bg-purple-400" : "bg-blue-400"}`}></div>
                    <span className="text-sm capitalize font-medium">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 cursor-pointer shadow-lg"
              >
                <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
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
                        {user.profile?.department || "Not specified"}
                      </p>
                    </div>
                    {user.role !== "faculty" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Year
                        </label>
                        <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                          {user.profile?.year || "Not specified"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact
                    </label>
                    <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                      {user.profile?.contact || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bio
                    </label>
                    <p className="text-white bg-gray-700/50 p-3 rounded-lg min-h-[80px]">
                      {user.profile?.bio || "No bio added yet"}
                    </p>
                  </div>
                  <div className="border-t border-gray-700 pt-6 mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-orange-400" />
                      LeetCode Username
                    </h3>
                    <div className="space-y-2">
                      {user.profile?.leetcode ? (
                        <a
                          href={`https://leetcode.com/${user.profile.leetcode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 p-4 rounded-lg hover:border-orange-400/50 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center text-xl">
                              💻
                            </div>
                            <span className="text-white font-medium text-lg">
                              @{user.profile.leetcode}
                            </span>
                          </div>
                          <ExternalLink className="w-5 h-5 text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                      ) : (
                        <p className="text-gray-400 bg-gray-700/50 p-4 rounded-lg text-center">
                          No LeetCode username set
                        </p>
                      )}
                    </div>
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
                        placeholder="Enter your department"
                        className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                    {user.role !== "faculty" && (
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
                    )}
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
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-orange-400" />
                      LeetCode Username
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">LeetCode Username</label>
                      <input
                        name="leetcode"
                        value={form.profile.leetcode}
                        onChange={onChange}
                        placeholder="Enter your LeetCode username"
                        className="w-full bg-gray-700/50 border border-gray-600 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Stats will be fetched automatically after saving
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
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

          <div className="space-y-6">
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Type</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === "faculty" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
                    {user.role === "faculty" ? "Faculty" : "Student"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile?.bio ? "bg-green-500/20 text-green-300" : "bg-orange-500/20 text-orange-300"}`}>
                    {user.profile?.bio ? "Complete" : "Incomplete"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white text-sm">Recently</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a href="/notes" className="w-full block text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Browse Notes</span>
                  </div>
                </a>
                <a href="/papers" className="w-full block text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm">View Papers</span>
                  </div>
                </a>
                <a href="/home" className="w-full block text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Study Hub</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <LeetCodeStats username={user.profile?.leetcode} />
      </div>
    </div>
  );
}