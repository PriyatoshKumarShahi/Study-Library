require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const notesRoutes = require('./routes/notes');
const papersRoutes = require('./routes/papers');
const usersRoutes = require('./routes/users');
const assignmentsRoutes = require('./routes/assignments'); // ✅ add this

const errorHandler = require('./middleware/errorHandler');
const createDefaultAdmin = require('./utils/initAdmin');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

connectDB(process.env.MONGO_URI);

// Initialize default admin
createDefaultAdmin();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assignments', assignmentsRoutes); // ✅ add this

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
