// backend/routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const { auth, isRole } = require("../middleware/authMiddleware");
const {
  createJob,
  getCompanyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getAllJobsForUsers,
} = require("../controllers/jobController");

// ==============================
// COMPANY ROUTES (requires auth + role)
// ==============================

// Create a new job (company only)
router.post("/", auth, isRole("company"), createJob);

// Update a job by ID (company only)
router.put("/:id", auth, isRole("company"), updateJob);

// Delete a job by ID (company only)
router.delete("/:id", auth, isRole("company"), deleteJob);

// Get jobs of logged-in company
router.get("/company", auth, isRole("company"), getCompanyJobs);

// ==============================
// PUBLIC / USER ROUTES
// ==============================

// Get all jobs for users (optional filters: ?category=&department=)
router.get("/", getAllJobsForUsers);

// Get single job by ID (requires auth, any user or company)
router.get("/:id", auth, getJobById);

module.exports = router;

