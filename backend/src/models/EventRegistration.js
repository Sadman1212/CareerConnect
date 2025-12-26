// backend/src/models/EventRegistration.js
const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    // User who is registering
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Career Event being registered for
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareerEvent",
      required: true,
    },

    // Registration form data
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      required: false, // Changed from true to false
      default: null,
    },

    verificationTokenExpiry: {
      type: Date,
      required: false, // Changed from true to false
      default: null,
    },

    // Registration status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // When email was verified
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate registrations
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
