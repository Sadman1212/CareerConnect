// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// 🔔 NEW (Socket.IO extensions)
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (UNCHANGED)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Global error handler (UNCHANGED)
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: err.message });
});

// ===============================
// 🔔 SOCKET.IO EXTENSION (SAFE)
// ===============================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io available everywhere
app.set("io", io);

io.on("connection", (socket) => {
  // Socket connect/disconnect logs are optional. Enable by setting SOCKET_LOGS=true in .env
  if (process.env.SOCKET_LOGS === "true") {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  } else {
    // still attach the disconnect handler but without logging
    socket.on("disconnect", () => {});
  }
});

// Start server (EXTENDED, not changed)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
