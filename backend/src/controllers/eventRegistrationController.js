// backend/src/controllers/eventRegistrationController.js
const EventRegistration = require("../models/EventRegistration");
const CareerEvent = require("../models/CareerEvent");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, sendRegistrationConfirmationEmail } = require("../config/nodemailer");

/**
 * Get all career events (for users to view)
 */
exports.getAllCareerEvents = async (req, res) => {
  try {
    const events = await CareerEvent.find()
      .populate("company", "companyName imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching career events:", error);
    res.status(500).json({
      message: "Failed to fetch career events",
      error: error.message,
    });
  }
};

/**
 * Submit registration form (Step 1: Send verification email)
 */
exports.submitRegistration = async (req, res) => {
  try {
    const { eventId, fullName, mobileNumber, institution, email } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!eventId || !fullName || !mobileNumber || !institution || !email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if event exists
    const event = await CareerEvent.findById(eventId).populate(
      "company",
      "companyName"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user already registered for this event
    const existingRegistration = await EventRegistration.findOne({
      userId,
      eventId,
    });

    if (existingRegistration) {
      if (existingRegistration.isEmailVerified) {
        return res.status(400).json({
          message: "You have already registered for this event",
        });
      } else {
        // If not verified, delete old registration and create new one
        await EventRegistration.findByIdAndDelete(existingRegistration._id);
      }
    }

    // Generate verification token (expires in 24 hours)
    const verificationToken = jwt.sign(
      { registrationId: "temp" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Calculate expiry time (24 hours from now)
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create new registration (pending status) with token
    const registration = await EventRegistration.create({
      userId,
      eventId,
      fullName,
      mobileNumber,
      institution,
      email,
      status: "pending",
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-event-registration?token=${verificationToken}`;

    // Send verification email
    await sendVerificationEmail(email, fullName, verificationUrl);

    res.status(200).json({
      message: "Registration successful! Please check your email to verify.",
      registrationId: registration._id,
    });
  } catch (error) {
    console.error("Error submitting registration:", error);
    res.status(500).json({
      message: "Failed to submit registration",
      error: error.message,
    });
  }
};

/**
 * Verify email and confirm registration (Step 2: Accessed from email link)
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find registration by token
    const registration = await EventRegistration.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    }).populate("eventId");

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found or verification link has expired",
      });
    }

    if (registration.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
        registration: {
          eventName: registration.eventId?.eventName,
        },
      });
    }

    // Update registration status
    registration.isEmailVerified = true;
    registration.status = "confirmed";
    registration.verifiedAt = new Date();
    registration.verificationToken = null; // ✅ Changed to null
    registration.verificationTokenExpiry = null; // ✅ Changed to null
    await registration.save({ validateModifiedOnly: true }); // ✅ Added validateModifiedOnly

    // Send confirmation email
    await sendRegistrationConfirmationEmail(
      registration.email,
      registration.fullName,
      registration.eventId?.eventName || "Career Event",
      registration.eventId?.eventDate || new Date()
    );

    res.status(200).json({
      message: "Email verified successfully! Your registration is confirmed.",
      registration: {
        eventName: registration.eventId?.eventName,
        fullName: registration.fullName,
        email: registration.email,
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        message: "Invalid verification link",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        message: "Verification link has expired. Please register again.",
      });
    }

    res.status(500).json({
      message: "Failed to verify email",
      error: error.message,
    });
  }
};

/**
 * Get user's registered events
 */
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await EventRegistration.find({ userId })
      .populate({
        path: "eventId",
        populate: {
          path: "company",
          select: "companyName imageUrl",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
};

/**
 * Cancel event registration
 */
exports.cancelRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const userId = req.user.id;

    const registration = await EventRegistration.findOne({
      _id: registrationId,
      userId,
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    await EventRegistration.findByIdAndDelete(registrationId);

    res.status(200).json({
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({
      message: "Failed to cancel registration",
      error: error.message,
    });
  }
};
