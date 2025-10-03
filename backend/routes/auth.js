const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const otpStore = {};

// 🔹 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min

    await transporter.sendMail({
      from: `"AceStudy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your AceStudy OTP Code",
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// 🔹 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, code, otp } = req.body;

    if (!name || !email || !password || !otp)
      return res.status(400).json({ message: "Missing fields" });

    // OTP validation
    const otpData = otpStore[email];
    if (!otpData) return res.status(400).json({ message: "OTP not requested" });
    if (otpData.expires < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (otpData.otp != otp) return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email]; // remove OTP after verification

    // Faculty validation
    if (role === "faculty") {
      if (!department || !code) return res.status(400).json({ message: "Department and code required for faculty" });
      if (code !== "ABESEC") return res.status(400).json({ message: "Invalid faculty code" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "student",
      profile: role === "faculty"
        ? { department }
        : { department: department || "", year: "", bio: "", contact: "" },
    });

    await user.save();

    // JWT token
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 🔹 Send Welcome Email
    const welcomeHTML = `
      <h2>Welcome to AceStudy, ${name}!</h2>
      <p>We are excited to have you on board. Here are some features you can explore:</p>
      <ul>
        <li>📚 Access study <b>notes</b> curated by faculty.</li>
        <li>📝 Download <b>previous year papers</b> to prepare efficiently.</li>
        <li>📄 Submit and view <b>assignments</b> from your teachers.</li>
        <li>🎯 Track your learning journey with your profile.</li>
      </ul>
      <p>Start exploring AceStudy today and make the most of it!</p>
      <p>— The AceStudy Team</p>
    `;

    await transporter.sendMail({
      from: `"AceStudy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to AceStudy!",
      html: welcomeHTML,
    });

    const u = user.toObject();
    delete u.password;
    res.json({ token, user: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const u = user.toObject();
    delete u.password;
    res.json({ token, user: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
