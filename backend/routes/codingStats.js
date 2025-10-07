// routes/codingStats.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

async function fetchLeetCodeStats(username) {
  try {
    console.log(`[LeetCode] Fetching stats for username: ${username}`);
    
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          tagProblemCounts {
            advanced {
              tagName
              tagSlug
              problemsSolved
            }
          }
          profile {
            ranking
            reputation
          }
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: { username },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://leetcode.com',
        },
        timeout: 10000,
      }
    );

    console.log('[LeetCode] Raw response received');

    const data = response.data;
    if (data.errors) {
      console.error('[LeetCode] GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }

    if (!data.data?.matchedUser) {
      console.error('[LeetCode] User not found in response');
      throw new Error('User not found');
    }

    const user = data.data.matchedUser;
    console.log('[LeetCode] User data structure:', {
      hasSubmitStatsGlobal: !!user.submitStatsGlobal,
      hasUserCalendar: !!user.userCalendar,
      hasTagProblemCounts: !!user.tagProblemCounts,
      hasProfile: !!user.profile,
    });

    const submissions = user.submitStatsGlobal?.acSubmissionNum || [];
    console.log('[LeetCode] Submissions data:', JSON.stringify(submissions, null, 2));

    const allSubmissions = submissions.find(s => s.difficulty === 'All');
    console.log('[LeetCode] All submissions object:', JSON.stringify(allSubmissions, null, 2));
    
    if (allSubmissions) {
      console.log('[LeetCode] Available fields:', Object.keys(allSubmissions));
    }

    // ✅ FIXED: Get ALL topics where problems are solved (NO LIMIT!)
    const topicStats = (user.tagProblemCounts?.advanced || [])
      .filter(t => t.problemsSolved > 0)
      .map(t => ({
        topic: t.tagName,
        count: t.problemsSolved,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count, no slice!

    console.log('[LeetCode] ✅ Total topics with solved problems:', topicStats.length);
    console.log('[LeetCode] Top 10 topics:', topicStats.slice(0, 10).map(t => `${t.topic}: ${t.count}`));

    // Calendar data
    const calendar = user.userCalendar;
    console.log('[LeetCode] Calendar data:', {
      streak: calendar?.streak,
      totalActiveDays: calendar?.totalActiveDays,
      hasSubmissionCalendar: !!calendar?.submissionCalendar,
    });

    // Calculate max streak
    let maxStreak = 0;
    let currentStreak = 0;
    
    if (calendar?.submissionCalendar) {
      try {
        const submissionCalendar = JSON.parse(calendar.submissionCalendar);
        const timestamps = Object.keys(submissionCalendar)
          .map(Number)
          .filter(t => submissionCalendar[t] > 0)
          .sort((a, b) => a - b);
        
        console.log('[LeetCode] Submission calendar entries:', timestamps.length);

        if (timestamps.length > 0) {
          currentStreak = 1;
          maxStreak = 1;

          for (let i = 1; i < timestamps.length; i++) {
            const dayDiff = (timestamps[i] - timestamps[i - 1]) / 86400;
            
            if (dayDiff === 1) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 1;
            }
          }
        }

        console.log('[LeetCode] Calculated streaks - Max:', maxStreak, 'Current:', currentStreak);
      } catch (err) {
        console.error('[LeetCode] Error parsing submission calendar:', err.message);
      }
    }

    // ✅ FIXED: Get total submissions properly
    let totalSubmissions = allSubmissions?.submissions || allSubmissions?.count || 0;
    
    if (totalSubmissions === 0 && allSubmissions?.count) {
      totalSubmissions = allSubmissions.count;
      console.log('[LeetCode] ⚠️ Using count as submissions field is 0 or missing');
    }

    const statsResult = {
      platform: 'leetcode',
      username,
      stats: {
        totalSolved: submissions.find(s => s.difficulty === 'All')?.count || 0,
        easySolved: submissions.find(s => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: submissions.find(s => s.difficulty === 'Medium')?.count || 0,
        hardSolved: submissions.find(s => s.difficulty === 'Hard')?.count || 0,
        totalSubmissions: totalSubmissions,
        ranking: user.profile?.ranking || 0,
        topics: topicStats, // ✅ ALL topics!
        totalActiveDays: calendar?.totalActiveDays || 0,
        maxStreak: maxStreak,
        currentStreak: calendar?.streak || 0,
      },
    };

    console.log('[LeetCode] Final stats summary:', {
      totalSolved: statsResult.stats.totalSolved,
      totalSubmissions: statsResult.stats.totalSubmissions,
      topicsCount: statsResult.stats.topics.length,
      activeDays: statsResult.stats.totalActiveDays,
      maxStreak: statsResult.stats.maxStreak,
    });
    
    if (statsResult.stats.totalSubmissions === statsResult.stats.totalSolved) {
      console.log('[LeetCode] ⚠️ WARNING: Submission count equals solved count!');
      console.log('[LeetCode] The "submissions" field might not be in the API response');
    }
    
    if (allSubmissions?.submissions && allSubmissions.submissions !== allSubmissions.count) {
      console.log('[LeetCode] ✅ Got different submission count:', {
        solved: allSubmissions.count,
        submissions: allSubmissions.submissions,
        ratio: (allSubmissions.submissions / allSubmissions.count).toFixed(2)
      });
    }
    
    return statsResult;

  } catch (error) {
    console.error('[LeetCode] Error:', error.message);
    if (error.response) {
      console.error('[LeetCode] Response status:', error.response.status);
    }
    return {
      platform: 'leetcode',
      username,
      error: error.message || 'Failed to fetch LeetCode stats',
    };
  }
}

router.post('/fetch-stats', async (req, res) => {
  try {
    console.log('[API] Fetch stats request received');
    const { profiles } = req.body;
    
    if (!profiles || !Array.isArray(profiles)) {
      console.error('[API] Invalid request body');
      return res.status(400).json({ 
        error: 'Invalid request body. Expected { profiles: [...] }' 
      });
    }

    console.log('[API] Fetching stats for profiles:', profiles);

    const results = await Promise.all(
      profiles.map(async profile => {
        const { platform, username } = profile;
        
        if (!username) {
          console.log(`[API] No username for platform: ${platform}`);
          return { platform, username, error: 'Username is required' };
        }

        if (platform.toLowerCase() === 'leetcode') {
          return await fetchLeetCodeStats(username);
        } else {
          console.log(`[API] Unsupported platform: ${platform}`);
          return { platform, username, error: 'Unsupported platform' };
        }
      })
    );

    console.log('[API] Returning results');
    res.json({ results });
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
});

module.exports = router;