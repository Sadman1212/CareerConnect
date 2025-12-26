const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Admin = require("../models/admin");
const connectDB = require("../config/db");

const createAdmin = async () => {
  await connectDB();

  const email = "admin@careerconnect.com";
  const password = "Admin@123";

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    console.log("Admin already exists:", email);
    process.exit();
  }

  const admin = new Admin({ email, password });
  await admin.save();
  console.log("Admin created:", email);
  process.exit();
};

createAdmin();

