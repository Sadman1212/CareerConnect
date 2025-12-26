const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    establishmentYear: Number,
    contactNo: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    industryType: String,
    address: String,
    licenseNo: String,
    imageUrl: String,
    description: String,

    // ⭐ ADD THESE FIELDS ⭐
    website: String,
    companySize: String,
    companyType: String,
    about: String,
    facebook: String,
    linkedin: String,
    tagline: String,

    hrName: String,
    hrEmail: String,
    hrPhone: String,

    jobs: [
      {
        title: String,
        description: String,
        location: String,
        _id: false,
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
