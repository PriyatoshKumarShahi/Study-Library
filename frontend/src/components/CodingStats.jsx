// components/CodingStats.jsx
import React, { useState, useEffect } from 'react';
import { Code, TrendingUp, Award, Star, AlertCircle, Loader } from 'lucide-react';

export default function CodingStats({ profiles }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const platforms = [
    { id: 'leetcode', name: 'LeetCode', color: 'from-orange-500 to-yellow-500', icon: '💻' },
    { id: 'codechef', name: 'CodeChef', color: 'from-amber-700 to-amber-500', icon: '👨‍🍳' },
  ];

  useEffect(() => {
    fetchStats();
  }, [profiles]);

  const fetchStats = async () => {
    const profilesArray = [
      { platform: 'leetcode', username: profiles.leetcode },
      { platform: 'codechef', username: profiles.codechef },
      { platform: 'hackerrank', username: profiles.hackerrank },
    ].filter(p => p.username);

    if (profilesArray.length === 0) {
      setStats([]);
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/coding-stats/fetch-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ profiles: profilesArray }),
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.results || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setFetchError('Failed to fetch coding statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalSolved = () => {
    return stats.reduce((acc, stat) => {
      if (!stat.error && stat.stats?.totalSolved) return acc + stat.stats.totalSolved;
      return acc;
    }, 0);
  };

  const getPlatformInfo = (platformId) => platforms.find(p => p.id === platformId);

  const renderPlatformCard = (stat) => {
    const platformInfo = getPlatformInfo(stat.platform);
    if (!platformInfo) return null;

    if (stat.error) {
      return (
        <div key={stat.platform} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${platformInfo.color} rounded-lg flex items-center justify-center text-2xl`}>
              {platformInfo.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{platformInfo.name}</h3>
              <p className="text-sm text-gray-400">@{stat.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{stat.error}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={stat.platform} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200 hover:shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 bg-gradient-to-br ${platformInfo.color} rounded-lg flex items-center justify-center text-2xl shadow-lg`}>
            {platformInfo.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{platformInfo.name}</h3>
            <p className="text-sm text-gray-400">@{stat.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          {stat.stats?.totalSolved !== undefined && (
            <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <span className="text-gray-300 text-sm font-medium">Total Solved</span>
              <span className="text-2xl font-bold text-white">{stat.stats.totalSolved}</span>
            </div>
          )}

          {(stat.stats?.easySolved !== undefined || stat.stats?.mediumSolved !== undefined || stat.stats?.hardSolved !== undefined) && (
            <div className="grid grid-cols-3 gap-2">
              {stat.stats.easySolved !== undefined && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-green-400 mb-1">Easy</div>
                  <div className="text-lg font-bold text-green-300">{stat.stats.easySolved}</div>
                </div>
              )}
              {stat.stats.mediumSolved !== undefined && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-yellow-400 mb-1">Medium</div>
                  <div className="text-lg font-bold text-yellow-300">{stat.stats.mediumSolved}</div>
                </div>
              )}
              {stat.stats.hardSolved !== undefined && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <div className="text-xs text-red-400 mb-1">Hard</div>
                  <div className="text-lg font-bold text-red-300">{stat.stats.hardSolved}</div>
                </div>
              )}
            </div>
          )}

          {(stat.stats?.ranking || stat.stats?.rating || stat.stats?.stars) && (
            <div className="flex gap-2 flex-wrap">
              {stat.stats.ranking && (
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-300">Rank:</span>
                  <span className="text-sm font-bold text-blue-300">{stat.stats.ranking.toLocaleString()}</span>
                </div>
              )}
              {stat.stats.rating && (
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-300">Rating:</span>
                  <span className="text-sm font-bold text-purple-300">{stat.stats.rating}</span>
                </div>
              )}
              {stat.stats.stars && (
                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-300">Stars:</span>
                  <span className="text-sm font-bold text-yellow-300">{stat.stats.stars}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!profiles.leetcode && !profiles.codechef && !profiles.hackerrank) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          <Code className="w-6 h-6 text-blue-400" />
          Coding Profiles
        </h2>
        <p className="text-gray-400 mb-6">No coding profiles added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            Coding Statistics
          </h2>
          {loading && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching stats...</span>
            </div>
          )}
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{fetchError}</span>
          </div>
        )}

        {!loading && stats.length > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Problems Solved</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {getTotalSolved()}
                </p>
              </div>
              <Award className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? platforms.map((platform) => (
                <div key={platform.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-700 rounded-lg"></div>
                    <div className="h-12 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
              ))
            : stats.map((stat) => renderPlatformCard(stat))}
        </div>
      </div>
    </div>
  );
}
