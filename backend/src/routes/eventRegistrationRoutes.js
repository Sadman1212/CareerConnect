// backend/src/routes/eventRegistrationRoutes.js
const express = require("express");
const router = express.Router();
const { auth, isRole } = require("../middleware/authMiddleware");
const {
  getAllCareerEvents,
  submitRegistration,
  verifyEmail,
  getMyRegistrations,
  cancelRegistration,
} = require("../controllers/eventRegistrationController");

// ==============================
// PUBLIC ROUTES
// ==============================

// Verify email (public - accessed from email link)
router.get("/verify/:token", verifyEmail);

// ==============================
// USER ROUTES (Protected)
// ==============================

// Get all career events (any logged-in user can view)
router.get("/events", auth, getAllCareerEvents);

// Submit registration form (user only)
router.post("/register", auth, isRole("user"), submitRegistration);

// Get user's registered events (user only)
router.get("/my-registrations", auth, isRole("user"), getMyRegistrations);

// Cancel registration (user only)
router.delete("/:registrationId", auth, isRole("user"), cancelRegistration);

module.exports = router;
