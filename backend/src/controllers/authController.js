const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

// NEW: cloudinary + streamifier
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// password must have at least ONE letter, ONE number and ONE special character
// (no minimum length enforced)
const isStrongPassword = (password) => {
  const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
  return pattern.test(password);
};

// helper to upload a buffer to Cloudinary and get back the URL
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // MODIFIED: Changed from "image" to "auto" to support PDFs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// POST /api/auth/register-user
exports.registerUser = async (req, res) => {
  try {
    const { name, gender, email, mobile, password, studentType, department } =
      req.body;

    // make all fields + image mandatory
    if (
      !name ||
      !gender ||
      !email ||
      !mobile ||
      !password ||
      !studentType ||
      !department ||
      !req.file
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must include at least one letter, one number and one special character.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    // upload image buffer to Cloudinary instead of local /uploads
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      "careerconnect/users"
    );

    console.log("Creating user with:", { name, gender, email, mobile, studentType, department, imageUrl });

    const user = await User.create({
      name,
      gender,
      email,
      mobile,
      password: hashed,
      studentType,
      department,
      imageUrl,
    });

    console.log("User created:", user._id);

    const token = createToken(user._id, "user");
    res.status(201).json({
      token,
      profile: {
        id: user._id,
        name: user.name,
        role: "user",
        imageUrl: user.imageUrl || null,
        gender: user.gender,
        mobile: user.mobile,
        studentType: user.studentType,
        department: user.department,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/auth/register-company
exports.registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      establishmentYear,
      contactNo,
      email,
      password,
      industryType,
      address,
      licenseNo,
    } = req.body;

    // make all company fields + image mandatory
    if (
      !companyName ||
      !establishmentYear ||
      !contactNo ||
      !email ||
      !password ||
      !industryType ||
      !address ||
      !licenseNo ||
      !req.file
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must include at least one letter, one number and one special character.",
      });
    }

    const existing = await Company.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);

    // upload logo to Cloudinary
    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      "careerconnect/companies"
    );

    const company = await Company.create({
      companyName,
      establishmentYear,
      contactNo,
      email,
      password: hashed,
      industryType,
      address,
      licenseNo,
      imageUrl,
    });

    const token = createToken(company._id, "company");
    res.status(201).json({
      token,
      profile: {
        id: company._id,
        name: company.companyName,
        role: "company",
        imageUrl: company.imageUrl || null,
        email: company.email,
        contactNo: company.contactNo,
        establishmentYear: company.establishmentYear,
        industryType: company.industryType,
        address: company.address,
        licenseNo: company.licenseNo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login (email+password)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body; // role: "user" or "company"

    let account;
    if (role === "company") {
      account = await Company.findOne({ email });
    } else {
      account = await User.findOne({ email });
    }

    if (!account) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, account.password);
    if (!match) return res.status(400).json({ message: "Wrong Password" });

    const effectiveRole = role === "company" ? "company" : "user";

    const token = createToken(account._id, effectiveRole);

    // Build profile differently for user vs company
    let profile;
    if (effectiveRole === "user") {
      profile = {
        id: account._id,
        name: account.name,
        role: "user",
        imageUrl: account.imageUrl || null,
        gender: account.gender,
        mobile: account.mobile,
        studentType: account.studentType,
        department: account.department,
        email: account.email,
        // Include new profile fields
        currentAddress: account.currentAddress || "",
        academicBackground: account.academicBackground || "",
        cgpa: account.cgpa || null,
        skills: account.skills || "",
        certificateUrl: account.certificateUrl || "",
        cvUrl: account.cvUrl || "",
        projectLink: account.projectLink || "",
        linkedinLink: account.linkedinLink || ""
      };
    } else {
      profile = {
        id: account._id,
        name: account.companyName,
        role: "company",
        imageUrl: account.imageUrl || null,
        email: account.email,
        contactNo: account.contactNo,
        establishmentYear: account.establishmentYear,
        industryType: account.industryType,
        address: account.address,
        licenseNo: account.licenseNo,
      };
    }

    res.json({ token, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/google-login  (works for BOTH user and company)
exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // 1) try to find a User
    let account = await User.findOne({ email });
    let role = "user";

    // 2) if no user, try Company
    if (!account) {
      account = await Company.findOne({ email });
      role = "company";
    }

    // 3) if neither exists, return error
    if (!account) {
      return res.status(400).json({
        message: "No account with this Google email. Please register first.",
      });
    }

    const token = createToken(account._id, role);

    let profile;
    if (role === "user") {
      profile = {
        id: account._id,
        name: account.name,
        role: "user",
        imageUrl: account.imageUrl || null,
        gender: account.gender,
        mobile: account.mobile,
        studentType: account.studentType,
        department: account.department,
        email: account.email,
        // Include new profile fields
        currentAddress: account.currentAddress || "",
        academicBackground: account.academicBackground || "",
        cgpa: account.cgpa || null,
        skills: account.skills || "",
        certificateUrl: account.certificateUrl || "",
        cvUrl: account.cvUrl || "",
        projectLink: account.projectLink || "",
        linkedinLink: account.linkedinLink || ""
      };
    } else {
      profile = {
        id: account._id,
        name: account.companyName,
        role: "company",
        imageUrl: account.imageUrl || null,
        email: account.email,
        contactNo: account.contactNo,
        establishmentYear: account.establishmentYear,
        industryType: account.industryType,
        address: account.address,
        licenseNo: account.licenseNo,
      };
    }

    res.json({ token, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded; // "user" or "company"

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "New password must include 6 characters including  letter,number and special character.",
      });
    }

    const Model = role === "company" ? Company : User;
    const account = await Model.findById(id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Previous password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    account.password = hashed;
    await account.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/auth/update-profile (NOW HANDLES NAME, EMAIL, MOBILE, GENDER, STUDENT TYPE AND DEPARTMENT)
exports.updateUserProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    // Only allow users (not companies) to update profile
    if (role !== "user") {
      return res.status(403).json({ message: "Only users can update profile" });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract text fields from request body
    const {
      name, // MODIFIED: Added name
      email, // MODIFIED: Added email
      mobile, // MODIFIED: Added mobile
      gender, // MODIFIED: Added gender
      currentAddress,
      academicBackground,
      cgpa,
      skills,
      projectLink,
      linkedinLink,
      studentType,
      department
    } = req.body;

    // MODIFIED: Check if email is being changed and if it's already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
      user.email = email;
    }

    // MODIFIED: Update basic fields (only if provided)
    if (name !== undefined) user.name = name;
    if (mobile !== undefined) user.mobile = mobile;
    if (gender !== undefined) user.gender = gender;

    // Update other text fields (only if provided)
    if (currentAddress !== undefined) user.currentAddress = currentAddress;
    if (academicBackground !== undefined) user.academicBackground = academicBackground;
    if (cgpa !== undefined) user.cgpa = cgpa || null;
    if (skills !== undefined) user.skills = skills;
    if (projectLink !== undefined) user.projectLink = projectLink;
    if (linkedinLink !== undefined) user.linkedinLink = linkedinLink;
    if (studentType !== undefined) user.studentType = studentType;
    if (department !== undefined) user.department = department;

    // Handle file uploads (profile photo, certificate, CV)
    if (req.files) {
      // Update profile photo if uploaded
      if (req.files.profilePhoto) {
        const photoUrl = await uploadToCloudinary(
          req.files.profilePhoto[0].buffer,
          "careerconnect/users"
        );
        user.imageUrl = photoUrl;
      }

      // Update certificate if uploaded (IMAGE OR PDF) - MODIFIED
      if (req.files.certificate) {
        const certUrl = await uploadToCloudinary(
          req.files.certificate[0].buffer,
          "careerconnect/certificates"
        );
        user.certificateUrl = certUrl;
      }

      // Update CV if uploaded (IMAGE OR PDF) - MODIFIED
      if (req.files.cv) {
        const cvUrl = await uploadToCloudinary(
          req.files.cv[0].buffer,
          "careerconnect/cvs"
        );
        user.cvUrl = cvUrl;
      }
    }

    // Save updated user
    await user.save();

    // Return updated profile data (same format as login response)
    const updatedProfile = {
      id: user._id,
      name: user.name,
      role: "user",
      imageUrl: user.imageUrl || null,
      gender: user.gender,
      mobile: user.mobile,
      studentType: user.studentType,
      department: user.department,
      email: user.email,
      // Include new fields in response
      currentAddress: user.currentAddress,
      academicBackground: user.academicBackground,
      cgpa: user.cgpa,
      skills: user.skills,
      certificateUrl: user.certificateUrl,
      cvUrl: user.cvUrl,
      projectLink: user.projectLink,
      linkedinLink: user.linkedinLink
    };

    res.json({ 
      message: "Profile updated successfully",
      profile: updatedProfile 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/auth/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    // Get password from request body
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find the account (user or company)
    const Model = role === "company" ? Company : User;
    const account = await Model.findById(id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Delete the account
    await Model.findByIdAndDelete(id);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/search - Search for users by name, email, skills
exports.searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.json([]);
    }

    const searchRegex = new RegExp(search, 'i');
    
    const users = await User.find({
      role: "user",
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { skills: searchRegex },
        { currentAddress: searchRegex },
        { university: searchRegex }
      ]
    }).select('-password'); // Exclude password field

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/user/:userId - Get a specific user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
