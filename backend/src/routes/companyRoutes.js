// backend/src/routes/companyRoutes.js
const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/companyController");
const { auth, isRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // multer for images

// -----------------------
// Public routes
// -----------------------

// Search companies (public)
router.get("/search", CompanyController.searchCompanies);

// Get company by id (public)
router.get("/:id", CompanyController.getCompanyById);

// (Optional) Company registration handled in authRoutes.js
// router.post("/register", upload.single("image"), CompanyController.registerCompany);

// -----------------------
// Protected routes
// -----------------------

// Get logged-in company profile
router.get("/me", auth, isRole("company"), CompanyController.getMyCompany);

// Update company info
router.put("/:id", auth, isRole("company"), CompanyController.updateCompany);

// Upload company image
router.post(
  "/upload-image",
  auth,
  isRole("company"),
  upload.single("image"),
  CompanyController.uploadImage
);

// Delete company profile
router.delete("/delete-profile", auth, isRole("company"), CompanyController.deleteCompany);

module.exports = router;



