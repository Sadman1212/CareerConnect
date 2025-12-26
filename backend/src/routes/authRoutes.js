const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  registerUser,
  registerCompany,
  login,
  googleLogin,
  changePassword,
  updateUserProfile,
  deleteAccount,
  getUserProfile
} = require("../controllers/authController");

// user registration WITH image file named "image"
router.post("/register-user", upload.single("image"), registerUser);

// company registration
router.post("/register-company", upload.single("image"), registerCompany);

// login (user or company, based on role in body)
router.post("/login", login);

// google login
router.post("/google-login", googleLogin);

// change password for logged-in user or company
router.post("/change-password", changePassword);

// update profile with multiple file uploads
router.put(
  "/update-profile", 
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "cv", maxCount: 1 }
  ]),
  updateUserProfile
);

// NEW: delete account route
router.delete("/delete-account", deleteAccount);

// NEW: get specific user profile
router.get("/user/:userId", getUserProfile);

module.exports = router;



