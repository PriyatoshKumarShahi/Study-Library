// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Malformed token' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should contain { id, role } or userId
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

module.exports = authenticateToken;
