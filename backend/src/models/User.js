const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    password: { type: String, required: true },

    studentType: { type: String },
    department: { type: String },
    imageUrl: { type: String },

    // Role management
    role: {
      type: String,
      enum: ["user", "company", "admin"],
      default: "user",
    },

    // Profile fields
    currentAddress: { type: String, default: "" },
    academicBackground: { type: String, default: "" },
    cgpa: { type: Number, default: null },
    skills: { type: String, default: "" },
    university: { type: String, default: "" },
    certificateUrl: { type: String, default: "" },
    cvUrl: { type: String, default: "" },
    projectLink: { type: String, default: "" },
    linkedinLink: { type: String, default: "" },
  },
  { timestamps: true }
);

// Hash password before save (disabled - hashing is done in controller)
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

module.exports = mongoose.model("User", userSchema);
