const Company = require("../models/Company");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// GET my company profile
exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    return res.json(company);
  } catch (err) {
    console.error("GET /company/me error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Update company profile
exports.updateCompany = async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(updatedCompany);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//search companies
exports.searchCompanies = async (req, res) => {
  const { search } = req.query;

  const companies = await Company.find({
    companyName: { $regex: search, $options: "i" },
  });

  res.json(companies);
};

// Get company by id (public)
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("Get company by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a job posting
exports.addJob = async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    company.jobs.push({ title, description, location });
    await company.save();
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const companies = await Company.find({}, "companyName jobs");
    const jobs = [];
    companies.forEach(c => {
      c.jobs.forEach(j => jobs.push({ ...j.toObject(), companyName: c.companyName, companyId: c._id }));
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const companies = await Company.find();
    for (let c of companies) {
      const job = c.jobs.id(req.params.jobId);
      if (job) {
        return res.json({ ...job.toObject(), companyName: c.companyName, companyId: c._id });
      }
    }
    res.status(404).json({ message: "Job not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload company image (expects `upload` middleware to populate `req.file`)
exports.uploadImage = async (req, res) => {
  try {
    const companyId = req.user && req.user.id;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file || !req.file.buffer) return res.status(400).json({ message: "No file uploaded" });

    const uploadFromBuffer = (buffer) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "company_logos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

    const result = await uploadFromBuffer(req.file.buffer);
    const company = await Company.findByIdAndUpdate(companyId, { imageUrl: result.secure_url }, { new: true });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete company profile
exports.deleteCompany = async (req, res) => {
  try {
    const companyId = req.user && req.user.id;
    if (!companyId) return res.status(401).json({ message: "Unauthorized" });

    const company = await Company.findByIdAndDelete(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json({ message: "Company profile deleted successfully" });
  } catch (err) {
    console.error("Delete company error:", err);
    res.status(500).json({ message: err.message });
  }
};
