// src/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// core for Socket.IO (both branches added socket support)
const http = require("http");
const { Server } = require("socket.io");

// route files used by different pages/features (include both branches' routes)
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const queryForumRoutes = require("./routes/queryForumRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/careerconnect";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error", err));

// health check
app.get("/", (req, res) => {
  res.send("CareerConnect API running");
});

// Register routes from both branches (keep old and new paths to avoid breaking callers)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/query-forum", queryForumRoutes);

// ✅ Career events routes (company creates/manages events)
app.use("/api/career-events", require("./routes/careerEventRoutes"));

// ✅ NEW: Event registration routes (user views/registers for events)
app.use("/api/event-registrations", require("./routes/eventRegistrationRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: err.message });
});

// ===============================
// SOCKET.IO: create server and expose `io` via `app.set("io", io)`
// ===============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.set("io", io);

io.on("connection", (socket) => {
  if (process.env.SOCKET_LOGS === "true") {
    console.log("Socket connected:", socket.id);
    socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
  } else {
    socket.on("disconnect", () => {});
  }
});

// Start server (use the http server so Socket.IO works)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

