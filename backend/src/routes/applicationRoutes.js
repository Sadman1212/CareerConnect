const express = require("express");
const router = express.Router();
const {
  submitApplication,
  getUserApplications,
  deleteApplication,
  getCompanyApplications,
  updateApplicationStatus,
  companyDeleteApplication,
} = require("../controllers/applicationController");

const { auth, isRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Upload middleware
const uploadMiddleware = upload.fields([
  { name: "cvImage", maxCount: 1 },
  { name: "recommendationLetters", maxCount: 5 },
  { name: "careerSummary", maxCount: 5 },
]);

// ==============================
// USER ROUTES
// ==============================

// Submit application
router.post(
  "/apply",
  auth,
  isRole("user"),
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({ error: err.message || "File upload failed" });
      }
      next();
    });
  },
  submitApplication
);

// Get user's own applications
router.get("/user", auth, isRole("user"), getUserApplications);

// Delete application (user)
router.delete("/:applicationId", auth, isRole("user"), deleteApplication);

// ==============================
// COMPANY ROUTES
// ==============================

// Get applications for company
router.get("/company", auth, isRole("company"), getCompanyApplications);

// Update application status
router.patch("/:applicationId/status", auth, isRole("company"), updateApplicationStatus);

// Delete application (company)
router.delete("/company/:applicationId", auth, isRole("company"), companyDeleteApplication);

module.exports = router;

