// middleware/admin.js
const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    // Use the correct property from decoded token
    const user = await User.findById(req.user.id); // changed from userId -> id
    if (!user || user.email !== 'priytoshshahi90@gmail.com') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = requireAdmin;
