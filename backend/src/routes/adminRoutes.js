const express = require("express");
const router = express.Router();
const { auth, isRole } = require("../middleware/authMiddleware");
const AdminController = require("../controllers/adminController");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/JobModel");

// Admin login
router.post("/login", AdminController.login);

// Admin dashboard
router.get("/dashboard", auth, isRole("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.email}` });
});

// Admin summary (stats and counts)
router.get("/summary", auth, isRole("admin"), AdminController.getAdminSummary);

// Get all job posts
router.get("/jobs", auth, isRole("admin"), AdminController.getAllJobPosts);

// Get pending applications
router.get("/pending-applications", auth, isRole("admin"), AdminController.getPendingApplications);

// Get pending jobs (recently created, open status)
router.get("/pending-jobs", auth, isRole("admin"), async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingJobs = await Job.find({
      status: "open",
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate("company", "companyName")
      .sort({ createdAt: -1 });

    res.json(pendingJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get("/users", auth, isRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all companies
router.get("/companies", auth, isRole("admin"), async (req, res) => {
  try {
    const companies = await Company.find({}).select("-password");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending requests (companies waiting approval)
router.get("/pending", auth, isRole("admin"), async (req, res) => {
  try {
    const pendingCompanies = await Company.find({ status: "pending" }).select("-password");
    const pendingUsers = await User.find({ requestPending: true }).select("-password");
    res.json({ 
      pendingCompanies,
      pendingUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/user/:id", auth, isRole("admin"), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete company
router.delete("/company/:id", auth, isRole("admin"), async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany) return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete job post
router.delete("/jobs/:id", auth, isRole("admin"), async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve or reject pending company
router.patch("/company/:id/status", auth, isRole("admin"), async (req, res) => {
  const { status } = req.body; // expect 'approved' or 'rejected'
  try {
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: `Company ${status} successfully`, company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete pending company request
router.delete("/pending-company/:id", auth, isRole("admin"), async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany) return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Pending company request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete pending user request
router.delete("/pending-user/:id", auth, isRole("admin"), async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Pending user request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
