const Application = require("../models/Application");
const JobModel = require("../models/JobModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { sendEmail } = require("../utils/mailer");
const { addEvent } = require("../../services/googleCalendar"); // Google Calendar service

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // Supports images AND PDFs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Submit job application
exports.submitApplication = async (req, res) => {
  try {
    console.log("=== APPLICATION SUBMISSION STARTED ===");
    console.log("User ID:", req.user.id);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { jobId, companyId, companyName, jobTitle, interviewDateTime } = req.body; // Added interviewDateTime
    const userId = req.user.id;

    // CV validation
    console.log("Checking for CV upload...");

    if (!req.files) {
      console.log("ERROR: No files in request");
      return res.status(400).json({
        error: "No files uploaded. Please upload your CV to continue.",
      });
    }

    console.log("Files object exists. Checking cvImage field...");
    console.log("cvImage field:", req.files.cvImage);

    if (!req.files.cvImage || req.files.cvImage.length === 0) {
      console.log("ERROR: CV field is empty or missing");
      console.log("Available fields:", Object.keys(req.files));
      return res.status(400).json({
        error:
          "Sorry! without uploading your own Curriculum Vitae, you cannot apply for this company",
      });
    }

    console.log("CV uploaded successfully:", req.files.cvImage[0].originalname);

    // Check already applied
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      console.log("ERROR: User already applied for this job");
      return res.status(400).json({
        error: "You have already applied for this job",
      });
    }

    // Upload CV to Cloudinary
    console.log("Uploading CV to Cloudinary...");
    const cvImageUrl = await uploadToCloudinary(
      req.files.cvImage[0].buffer,
      "careerconnect/applications/cvs"
    );
    console.log("CV uploaded to Cloudinary:", cvImageUrl);

    // Upload recommendation letters to Cloudinary (if any)
    let recommendationLettersUrls = [];
    if (req.files.recommendationLetters && req.files.recommendationLetters.length > 0) {
      console.log(`Uploading ${req.files.recommendationLetters.length} recommendation letter(s)...`);
      recommendationLettersUrls = await Promise.all(
        req.files.recommendationLetters.map(async (file) => {
          console.log("Uploading recommendation letter:", file.originalname);
          const url = await uploadToCloudinary(
            file.buffer,
            "careerconnect/applications/recommendations"
          );
          console.log("Recommendation letter uploaded:", url);
          return url;
        })
      );
    }

    // Upload career summary to Cloudinary (if any)
    let careerSummaryUrls = [];
    if (req.files.careerSummary && req.files.careerSummary.length > 0) {
      console.log(`Uploading ${req.files.careerSummary.length} career summary file(s)...`);
      careerSummaryUrls = await Promise.all(
        req.files.careerSummary.map(async (file) => {
          console.log("Uploading career summary:", file.originalname);
          const url = await uploadToCloudinary(
            file.buffer,
            "careerconnect/applications/summaries"
          );
          console.log("Career summary uploaded:", url);
          return url;
        })
      );
    }

    console.log("Creating application in database...");

    const application = new Application({
      userId,
      jobId,
      companyId,
      companyName,
      jobTitle,
      cvImage: cvImageUrl,
      recommendationLetters: recommendationLettersUrls,
      careerSummary: careerSummaryUrls,
    });

    await application.save();

    console.log("Application saved successfully! ID:", application._id);

    // --- GOOGLE CALENDAR EVENT INTEGRATION ---
    try {
      if (interviewDateTime) {
        const interviewDate = new Date(interviewDateTime);
        const interviewEndDate = new Date(interviewDate.getTime() + 30 * 60 * 1000); // 30 mins duration

        const event = {
          summary: `CareerConnect: ${jobTitle} at ${companyName}`,
          description: `User ${req.user.name} submitted an application for ${jobTitle} at ${companyName}`,
          start: {
            dateTime: interviewDate,
            timeZone: "Asia/Dhaka",
          },
          end: {
            dateTime: interviewEndDate,
            timeZone: "Asia/Dhaka",
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 1440 }, // 1 day before
              { method: "popup", minutes: 60 },   // 1 hour before
            ],
          },
        };

        await addEvent(event);
        console.log("Google Calendar event created successfully");
      }
    } catch (calendarError) {
      console.error("Error creating Google Calendar event:", calendarError);
    }

    console.log("=== APPLICATION SUBMISSION COMPLETED ===");

    // 🔔 CREATE NOTIFICATION FOR COMPANY
    try {
      const Notification = require("../models/Notification");
      const Company = require("../models/Company");
      const User = require("../models/User");

      const company = await Company.findById(companyId);
      const user = await User.findById(userId);

      if (company && user) {
        const notification = new Notification({
          user: companyId, // Send to company
          title: `New Application Received`,
          message: `${user.name} applied for ${jobTitle}`,
          type: "JOB",
          link: "/company-applicants",
        });
        await notification.save();

        // 🔔 Real-time socket notification for company
        const io = req.app.get("io");
        if (io) {
          io.to(companyId.toString()).emit("notification", {
            type: "JOB",
            title: `New Application Received`,
            message: `${user.name} applied for ${jobTitle}`,
            link: "/company-applicants",
          });
        }
      }
    } catch (notifError) {
      console.error("Error creating company notification:", notifError);
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("=== APPLICATION SUBMISSION ERROR ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to submit application",
      message: error.message,
    });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    console.log("Fetching applications for user:", req.user.id);
    const userId = req.user.id;

    const applications = await Application.find({ userId })
      .populate("jobId")
      .populate("companyId")
      .sort({ createdAt: -1 });

    console.log(`Found ${applications.length} applications for user`);

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      error: "Failed to fetch applications",
      message: error.message,
    });
  }
};

// Delete application (user side)
exports.deleteApplication = async (req, res) => {
  try {
    console.log("=== DELETE APPLICATION STARTED ===");
    const { applicationId } = req.params;
    const userId = req.user.id;

    console.log("Application ID:", applicationId);
    console.log("User ID:", userId);

    const application = await Application.findById(applicationId);

    if (!application) {
      console.log("ERROR: Application not found");
      return res.status(404).json({
        error: "Application not found",
      });
    }

    console.log("Application found. Owner:", application.userId);

    if (application.userId.toString() !== userId) {
      console.log("ERROR: Unauthorized deletion attempt");
      return res.status(403).json({
        error: "You are not authorized to delete this application",
      });
    }

    await Application.findByIdAndDelete(applicationId);

    console.log("Application deleted successfully!");
    console.log("=== DELETE APPLICATION COMPLETED ===");

    res.status(200).json({
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("=== DELETE APPLICATION ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({
      error: "Failed to delete application",
      message: error.message,
    });
  }
};

// Get applications for a company (candidate list) - with optional search
exports.getCompanyApplications = async (req, res) => {
  try {
    const companyId = req.user.id; // company logged in
    const { jobId, search, status } = req.query; // OPTIONAL filters

    const filter = { companyId };
    if (jobId) {
      filter.jobId = jobId;
    }
    if (status) {
      filter.status = status;
    }

    let applications = await Application.find(filter)
      .populate(
        "userId",
        "name email department studentType imageUrl mobile skills"
      )
      .populate("jobId", "title category department")
      .sort({ createdAt: -1 });

    // 🔍 Search applicants by name, email, or skills
    if (search) {
      applications = applications.filter((app) => {
        const user = app.userId;
        const searchLower = search.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.skills && user.skills.toLowerCase().includes(searchLower))
        );
      });
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({
      error: "Failed to fetch candidates",
      message: error.message,
    });
  }
};

// Update application status (pending / shortlisted / hired / rejected)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const companyId = req.user.id;

    const allowed = ["pending", "shortlisted", "hired", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const application = await Application.findOne({
      _id: applicationId,
      companyId,
    })
      .populate("userId", "name email")
      .populate("companyId", "companyName")
      .populate("jobId", "title");

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = status;
    await application.save();

    // 🔔 Send notification to applicant
    const Notification = require("../models/Notification");
    const notificationMessages = {
      shortlisted: {
        title: "Great News! You've been Shortlisted",
        message: `You have been shortlisted for ${application.jobId.title} at ${application.companyId.companyName}`,
        type: "JOB",
      },
      hired: {
        title: "Congratulations! You're Hired",
        message: `You have been selected for ${application.jobId.title} at ${application.companyId.companyName}. Check your email for further instructions.`,
        type: "INTERVIEW",
      },
      rejected: {
        title: "Application Update",
        message: `Your application for ${application.jobId.title} at ${application.companyId.companyName} has been reviewed.`,
        type: "JOB",
      },
    };

    const notifData = notificationMessages[status];
    if (notifData) {
      const notification = new Notification({
        user: application.userId._id,
        title: notifData.title,
        message: notifData.message,
        type: notifData.type,
        link: "/applied-jobs",
      });
      await notification.save();

      // 🔔 Real-time socket notification
      const io = req.app.get("io");
      if (io) {
        io.to(application.userId._id.toString()).emit("notification", {
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          link: "/applied-jobs",
        });
      }
    }

    res.json({ message: "Status updated", application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      error: "Failed to update status",
      message: error.message,
    });
  }
};

// Delete application (company side)
exports.companyDeleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const companyId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      companyId,
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    await Application.findByIdAndDelete(applicationId);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Company delete application error:", error);
    res.status(500).json({
      error: "Failed to delete application",
      message: error.message,
    });
  }
};


// SINGLE + BULK EMAIL
// body:
//   single: { to, subject, message }
//   bulk:   { recipients: [email1, ...], subject, message }
exports.sendEmailToApplicant = async (req, res) => {
  try {
    const { to, recipients, subject, message } = req.body;

    if (!subject || !message) {
      return res
        .status(400)
        .json({ error: "subject and message are required" });
    }

    // bulk: array from frontend (Email all shortlisted/hired/rejected)
    if (Array.isArray(recipients) && recipients.length > 0) {
      await sendEmail({
        to: recipients,          // Nodemailer accepts array
        subject,
        text: message,
      });
      return res.json({
        message: "Bulk email sent successfully",
        count: recipients.length,
      });
    }

    // single: existing behaviour
    if (!to) {
      return res
        .status(400)
        .json({ error: "to (recipient email) is required" });
    }

    await sendEmail({ to, subject, text: message });

    res.json({ message: "Email sent successfully", count: 1 });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
};

