//routes/profile.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET current user's profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (name, profile fields, optional password)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, password, profile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;

    if (profile && typeof profile === 'object') {
      if (user.role === 'faculty') {
        const { year, ...rest } = profile;
        user.profile = { ...user.profile.toObject(), ...rest };
      } else {
        user.profile = { ...user.profile.toObject(), ...profile };
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const u = user.toObject();
    delete u.password;
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update coding profiles
router.put('/coding-profiles', authenticateToken, async (req, res) => {
  try {
    const { leetcode, codechef, hackerrank } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile = {
      ...user.profile.toObject(),
      leetcode: leetcode || user.profile.leetcode,
      codechef: codechef || user.profile.codechef,
      hackerrank: hackerrank || user.profile.hackerrank,
    };

    await user.save();
    const u = user.toObject();
    delete u.password;
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
