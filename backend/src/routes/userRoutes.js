// routes/user.js
const express = require("express");
const router = express.Router();
const DeleteRequest = require("../models/DeleteRequest");
const authController = require("../controllers/authController");

// GET /api/users/search - Search for users
router.get("/search", authController.searchUsers);

// POST /api/request-delete
router.post("/request-delete", async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    await DeleteRequest.create({ userId, reason });
    return res.json({ message: "Delete request created" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
