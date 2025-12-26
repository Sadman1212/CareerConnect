const Admin = require("../models/admin"); // <-- use Admin model
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Job = require("../models/JobModel");
const Company = require("../models/Company");
const User = require("../models/User");
const Application = require("../models/Application");

//POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin", email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      profile: { id: admin._id, email: admin.email, role: "admin" },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all job posts
exports.getAllJobPosts = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate("company", "companyName email contactNo industryType")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("Error fetching job posts:", err);
    res.status(500).json({ message: "Failed to fetch job posts", error: err.message });
  }
};

// GET pending applications (pending status from applications)
exports.getPendingApplications = async (req, res) => {
  try {
    const pendingApplications = await Application.find({ status: "pending" })
      .populate("userId", "name email mobile department studentType")
      .populate("jobId", "title category")
      .populate("companyId", "companyName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pendingApplications.length,
      pendingApplications,
    });
  } catch (err) {
    console.error("Error fetching pending applications:", err);
    res.status(500).json({ message: "Failed to fetch pending applications", error: err.message });
  }
};

// GET admin summary (all key stats)
exports.getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalJobPosts = await Job.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: "pending" });
    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      summary: {
        totalUsers,
        totalCompanies,
        totalJobPosts,
        pendingApplications,
        totalApplications,
      },
    });
  } catch (err) {
    console.error("Error fetching admin summary:", err);
    res.status(500).json({ message: "Failed to fetch admin summary", error: err.message });
  }
};
