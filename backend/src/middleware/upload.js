const multer = require("multer");
const path = require("path");

// Store uploaded files in memory as Buffer objects.
// The controller will take req.file.buffer and send it to Cloudinary.
const storage = multer.memoryStorage();

// FILE FILTER: Accept both images and PDFs
const fileFilter = (req, file, cb) => {
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check mimetype for images
  const isImage = file.mimetype.startsWith("image/");
  
  // Check for PDF
  const isPDF = file.mimetype === "application/pdf" || ext === ".pdf";
  
  // Accept if it's an image or PDF
  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, etc.) and PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter, // MODIFIED: Added file filter
  limits: { 
    fileSize: 10 * 1024 * 1024 // MODIFIED: 10 MB limit per file
  }
});

module.exports = upload;
