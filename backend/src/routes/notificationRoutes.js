const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

// Get all user notifications
router.get("/", auth, controller.getUserNotifications);

// Get unread notification count
router.get("/unread-count", auth, controller.getUnreadCount);

// Mark single notification as read
router.patch("/:id/read", auth, controller.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", auth, controller.markAllAsRead);

module.exports = router;
