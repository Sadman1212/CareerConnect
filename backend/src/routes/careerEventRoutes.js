// backend/src/routes/careerEventRoutes.js
const express = require("express");
const router = express.Router();

const {
  createCareerEvent,
  getCompanyEvents,
  getCareerEventById,
  updateCareerEvent,
  deleteCareerEvent,
} = require("../controllers/careerEventController");

const { protect } = require("../middleware/authMiddleware");
// adjust import if your middleware file exports differently

// All routes here are protected – only logged‑in users (companies) can access.
// The controller itself additionally checks that req.user.role === "company".

// Create new event
router.post("/", protect, createCareerEvent);

// Get all events for the logged‑in company
router.get("/company", protect, getCompanyEvents);

// Get single event (for editing)
router.get("/:id", protect, getCareerEventById);

// Update existing event
router.put("/:id", protect, updateCareerEvent);

// Delete event
router.delete("/:id", protect, deleteCareerEvent);

module.exports = router;
