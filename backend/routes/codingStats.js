//routes/codingStats.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Fetch LeetCode stats (unchanged)
async function fetchLeetCodeStats(username) {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
            reputation
          }
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { username },
    }, {
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    });

    const data = response.data;

    if (data.errors || !data.data?.matchedUser) throw new Error('User not found');

    const user = data.data.matchedUser;
    const submissions = user.submitStats.acSubmissionNum;

    return {
      platform: 'leetcode',
      username,
      stats: {
        totalSolved: submissions.find(s => s.difficulty === 'All')?.count || 0,
        easySolved: submissions.find(s => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: submissions.find(s => s.difficulty === 'Medium')?.count || 0,
        hardSolved: submissions.find(s => s.difficulty === 'Hard')?.count || 0,
        ranking: user.profile?.ranking || 0,
      },
    };
  } catch (error) {
    return { platform: 'leetcode', username, error: error.message || 'Failed to fetch LeetCode stats' };
  }
}

// Fetch CodeChef stats using a free third-party API
async function fetchCodeChefStats(username) {
  try {
    // Using competeapi.vercel.app as a free option
    const response = await axios.get(`https://competeapi.vercel.app/api/codechef/${username}`);
    const data = response.data;

    if (!data || data.status !== 'success') {
      throw new Error('User not found or API failed');
    }

    return {
      platform: 'codechef',
      username,
      stats: {
        rating: data.rating || 0,
        stars: data.stars || 'N/A',
        totalSolved: data.solvedProblems || 0,
        ranking: data.globalRank || 0,
        contestRating: data.rating || 0,
      },
    };
  } catch (error) {
    return { platform: 'codechef', username, error: error.message || 'Failed to fetch CodeChef stats' };
  }
}

// POST route to fetch stats (HackerRank removed)
router.post('/fetch-stats', async (req, res) => {
  try {
    const { profiles } = req.body;
    if (!profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ error: 'Invalid request body. Expected { profiles: [...] }' });
    }

    const results = await Promise.all(
      profiles.map(async profile => {
        const { platform, username } = profile;
        if (!username) return { platform, username, error: 'Username is required' };

        switch (platform.toLowerCase()) {
          case 'leetcode': return await fetchLeetCodeStats(username);
          case 'codechef': return await fetchCodeChefStats(username);
          default: return { platform, username, error: 'Unsupported platform' };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    console.error('Error fetching coding stats:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
