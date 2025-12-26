// backend/src/models/CareerEvent.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const careerEventSchema = new mongoose.Schema(
  {
    // Which company created this event
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Convenience copy of company name (for faster display)
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventSubtitle: {
      type: String,
      required: true,
      trim: true,
    },

    // Cover image URL (after upload to Cloudinary or similar)
    coverImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    eventWebsite: {
      type: String,
      required: true,
      trim: true,
    },

    eventType: {
      type: String,
      required: true,
      trim: true,
    },

    eventDetails: {
      type: String,
      required: true,
      trim: true,
    },

    // Deadline for registration
    eventDeadline: {
      type: Date,
      required: true,
    },

    // Actual event date
    eventDate: {
      type: Date,
      required: true,
    },

    eventPlace: {
      type: String,
      required: true,
      trim: true,
    },

    // List of activities with their time
    activityList: {
      type: [activitySchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one activity is required",
      },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const CareerEvent = mongoose.model("CareerEvent", careerEventSchema);

module.exports = CareerEvent;
