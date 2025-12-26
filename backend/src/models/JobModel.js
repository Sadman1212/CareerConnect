const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",      // use your existing Company model name
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    department: { type: String, required: true },
    studentCategory: { type: String, required: true },
    gender: { type: String, default: "Any" },
    deadline: { type: Date, required: true },
    address: { type: String, required: true },

    description: { type: String, required: true },
    requirements: { type: String, required: true },
    benefits: { type: String, required: true },
    experience: { type: String, required: true },
    salaryRange: { type: String, required: true },

    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
