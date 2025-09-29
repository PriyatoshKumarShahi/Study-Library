const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET current user's profile (same as /auth/me but kept here for separation)
router.get('/', auth, async (req, res) => {
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
router.put('/', auth, async (req, res) => {
  try {
    const { name, password, profile } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (profile && typeof profile === 'object') {
      user.profile = { ...user.profile.toObject(), ...profile };
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

module.exports = router;
