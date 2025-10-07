require('dotenv').config();
require('./cron/assignmentReminder'); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const notesRoutes = require('./routes/notes');
const papersRoutes = require('./routes/papers');
const usersRoutes = require('./routes/users');
const assignmentsRoutes = require('./routes/assignments');
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const forumRoutes = require("./routes/forum");
const statsRoutes = require("./routes/codingStats")
const notificationRoutes  = require("./routes/notifications")
const errorHandler = require('./middleware/errorHandler');
const createDefaultAdmin = require('./utils/initAdmin');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

connectDB(process.env.MONGO_URI);
createDefaultAdmin();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

// pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/papers', papersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/coding-stats", statsRoutes);
app.use("/api/notifications", notificationRoutes);


app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("⚡ User connected", socket.id);

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
