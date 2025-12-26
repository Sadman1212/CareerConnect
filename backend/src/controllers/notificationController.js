const Notification = require("../models/Notification");

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create notification for job deadline
exports.createDeadlineNotification = async (userId, jobTitle, companyName, daysUntilDeadline) => {
  try {
    const notification = new Notification({
      user: userId,
      title: `Job Deadline Alert: ${jobTitle}`,
      message: `Important! Application deadline for ${jobTitle} at ${companyName} is in ${daysUntilDeadline} days.`,
      type: "DEADLINE",
      link: `/jobs`,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating deadline notification:", err);
  }
};

// Create notification for job update
exports.createJobUpdateNotification = async (userId, jobTitle, companyName, updateType = "updated") => {
  try {
    const notification = new Notification({
      user: userId,
      title: `Job Update: ${jobTitle}`,
      message: `A job position "${jobTitle}" at ${companyName} has been ${updateType}.`,
      type: "JOB",
      link: `/jobs`,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating job update notification:", err);
  }
};

// Create notification for career opportunity
exports.createCareerNotification = async (userId, message, careerTopic) => {
  try {
    const notification = new Notification({
      user: userId,
      title: `Career Opportunity: ${careerTopic}`,
      message: message,
      type: "CAREER",
      link: `/dashboard`,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating career notification:", err);
  }
};

// Create notification for interview schedule
exports.createInterviewNotification = async (userId, companyName, interviewDate) => {
  try {
    const notification = new Notification({
      user: userId,
      title: `Interview Scheduled: ${companyName}`,
      message: `Your interview with ${companyName} is scheduled for ${new Date(interviewDate).toLocaleString()}.`,
      type: "INTERVIEW",
      link: `/applied-jobs`,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error("Error creating interview notification:", err);
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Error getting unread count:", err);
    res.status(500).json({ message: err.message });
  }
};
