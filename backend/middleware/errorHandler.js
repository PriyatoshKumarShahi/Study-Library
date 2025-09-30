const multer = require('multer');

const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 10MB.' });
    }
  }
  res.status(500).json({ message: error.message || 'Server error' });
};

module.exports = errorHandler;
