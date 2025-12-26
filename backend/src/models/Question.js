// models/Question.js
const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String },
    authorImageUrl: { type: String },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    authorName: { type: String },
    authorImageUrl: { type: String },
    title: { type: String, required: true },
    body: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    upvotedBy: { type: [String], default: [] },
    replies: [replySchema],
    // NEW: optionally store a company name that this question is about
    companyName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);




