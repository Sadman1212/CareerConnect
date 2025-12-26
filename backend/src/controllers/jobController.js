const Job = require("../models/JobModel");
const User = require("../models/User"); // follow feature

// ===============================
// POST /api/jobs  (company creates job)
// ===============================
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ error: "Only companies can post jobs" });
    }

    const {
      title,
      category,
      department,
      studentCategory,
      gender,
      deadline,
      address,
      description,
      requirements,
      benefits,
      experience,
      salaryRange,
    } = req.body;

    if (
      !title ||
      !category ||
      !department ||
      !studentCategory ||
      !deadline ||
      !address ||
      !description ||
      !requirements ||
      !benefits ||
      !experience ||
      !salaryRange
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await Job.create({
      company: req.user.id,
      title,
      category,
      department,
      studentCategory,
      gender,
      deadline,
      address,
      description,
      requirements,
      benefits,
      experience,
      salaryRange,
    });

    // 🔔 REAL-TIME NOTIFICATION (EXTENSION)
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "JOB_CREATED",
        title: "New Job Posted",
        message: `${job.title} has been posted`,
      });
    }

    res.status(201).json(job);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// GET /api/jobs  (all jobs for users, filters + search)
// ===============================
exports.getAllJobsForUsers = async (req, res) => {
  try {
    const { category, department, studentCategory, search, companyId } = req.query;

    const filter = {};

    // Allow filtering by company id for client-side company job lookups
    if (companyId) {
      filter.company = companyId;
    }

    if (category && category !== "Any") {
      filter.category = category;
    }

    if (department) {
      if (department === "Any") {
        filter.department = "Any";
      } else if (department !== "All") {
        filter.department = department;
      }
    }

    if (studentCategory && studentCategory !== "All") {
      filter.studentCategory = studentCategory;
    }

    // 🔍 SEARCH EXTENSION (job title / department)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("company", "companyName name imageUrl")
      .sort("-createdAt");

    res.json(jobs);
  } catch (err) {
    console.error("Get all jobs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// GET /api/jobs/company (company's own jobs)
// ===============================
exports.getCompanyJobs = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ error: "Only companies can view this" });
    }

    const jobs = await Job.find({ company: req.user.id }).sort("-createdAt");
    res.json(jobs);
  } catch (err) {
    console.error("Get company jobs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// GET /api/jobs/:id (single job for company)
// ===============================
exports.getJobById = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ error: "Only companies can view this" });
    }

    const job = await Job.findOne({
      _id: req.params.id,
      company: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    console.error("Get job by id error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// PUT /api/jobs/:id (update job)
// ===============================
exports.updateJob = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ error: "Only companies can update jobs" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company: req.user.id },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 🔔 REAL-TIME NOTIFICATION
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "JOB_UPDATED",
        title: "Job Updated",
        message: `${job.title} has been updated`,
      });
    }

    res.json(job);
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===============================
// DELETE /api/jobs/:id (delete job)
// ===============================
exports.deleteJob = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ error: "Only companies can delete jobs" });
    }

    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      company: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // 🔔 REAL-TIME NOTIFICATION
    const io = req.app.get("io");
    if (io) {
      io.emit("notification", {
        type: "JOB_DELETED",
        title: "Job Removed",
        message: `${job.title} has been removed`,
      });
    }

    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* =========================================
   NEW: FOLLOWED JOBS FEATURE
   ========================================= */

// POST /api/jobs/:id/follow  (user follows a job)
exports.followJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadyFollowing = user.followedJobs.some(
      (jid) => jid.toString() === jobId
    );
    if (alreadyFollowing) {
      return res.status(200).json({ message: "Already following this job" });
    }

    user.followedJobs.push(jobId);
    await user.save();

    res.status(201).json({ message: "Job followed successfully" });
  } catch (err) {
    console.error("Follow job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/jobs/:id/follow  (user unfollows a job)
exports.unfollowJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const beforeCount = user.followedJobs.length;
    user.followedJobs = user.followedJobs.filter(
      (jid) => jid.toString() !== jobId
    );

    if (user.followedJobs.length === beforeCount) {
      return res.status(404).json({ error: "Job was not followed" });
    }

    await user.save();

    res.json({ message: "Job unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow job error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/jobs/user/followed  (list of jobs user is following)
exports.getFollowedJobsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "followedJobs",
      populate: {
        path: "company",
        select: "companyName name imageUrl",
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sort followed jobs alphabetically by title
    const jobs = [...user.followedJobs].sort((a, b) => {
      const t1 = (a.title || "").toLowerCase();
      const t2 = (b.title || "").toLowerCase();
      if (t1 < t2) return -1;
      if (t1 > t2) return 1;
      return 0;
    });

    res.json(jobs);
  } catch (err) {
    console.error("Get followed jobs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
