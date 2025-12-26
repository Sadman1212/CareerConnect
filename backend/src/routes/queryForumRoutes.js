// routes/queryForumRoutes.js
const express = require("express");
const Question = require("../models/Question");

const router = express.Router();

// GET all questions (popular first)
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({
      upvotes: -1,
      createdAt: -1,
    });
    res.json(questions);
  } catch (err) {
    console.error("GET /api/query-forum error", err);
    res.status(500).json({ error: "Failed to load queries" });
  }
});

// NEW: GET only questions for a company, based on name in query string
// GET /api/query-forum/company?name=Company%20ABC
router.get("/company", async (req, res) => {
  try {
    const rawName = (req.query.name || "").trim();
    if (!rawName) return res.json([]);

    const regex = new RegExp(rawName, "i");

    const questions = await Question.find({
      $or: [{ title: regex }, { body: regex }, { companyName: regex }],
    }).sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error("GET /api/query-forum/company error", err);
    res.status(500).json({ error: "Failed to load company queries" });
  }
});

// POST new question
router.post("/", async (req, res) => {
  try {
    const {
      title,
      body,
      authorId,
      authorName,
      authorImageUrl,
      companyName,
    } = req.body;

    if (!title || !body || !authorId) {
      return res
        .status(400)
        .json({ error: "title, body and authorId are required" });
    }

    const question = await Question.create({
      title,
      body,
      authorId,
      authorName,
      authorImageUrl,
      companyName: companyName || null, // can be null
    });

    res.status(201).json(question);
  } catch (err) {
    console.error("POST /api/query-forum error", err);
    res.status(500).json({ error: "Failed to create query" });
  }
});

// DELETE question – only author
router.delete("/:id", async (req, res) => {
  try {
    const { authorId } = req.body; // from axios.delete(... { data: { authorId } })
    if (!authorId) {
      return res.status(400).json({ error: "authorId is required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.authorId !== authorId) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this question" });
    }

    await question.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/query-forum/:id error", err);
    res.status(500).json({ error: "Failed to delete query" });
  }
});

// POST reply
router.post("/:id/replies", async (req, res) => {
  try {
    const { text, authorId, authorName, authorImageUrl } = req.body;

    if (!text || !authorId) {
      return res
        .status(400)
        .json({ error: "text and authorId are required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    question.replies.push({ text, authorId, authorName, authorImageUrl });
    await question.save();

    res.status(201).json(question);
  } catch (err) {
    console.error("POST /api/query-forum/:id/replies error", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
});

// PATCH reply – only its author
router.patch("/:id/replies/:replyId", async (req, res) => {
  try {
    const { text, authorId } = req.body;
    if (!text || !authorId) {
      return res
        .status(400)
        .json({ error: "text and authorId are required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const reply = question.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (reply.authorId !== authorId) {
      return res.status(403).json({ error: "Not allowed to edit this reply" });
    }

    reply.text = text;
    await question.save();

    res.json(question);
  } catch (err) {
    console.error("PATCH /api/query-forum/:id/replies/:replyId error", err);
    res.status(500).json({ error: "Failed to update reply" });
  }
});

// DELETE reply – only its author
router.delete("/:id/replies/:replyId", async (req, res) => {
  try {
    const { authorId } = req.body;
    if (!authorId) {
      return res.status(400).json({ error: "authorId is required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const reply = question.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (reply.authorId !== authorId) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this reply" });
    }

    reply.deleteOne();
    await question.save();

    res.json(question);
  } catch (err) {
    console.error("DELETE /api/query-forum/:id/replies/:replyId error", err);
    res.status(500).json({ error: "Failed to delete reply" });
  }
});

// POST /api/query-forum/:id/upvote – prevent multiple upvotes
router.post("/:id/upvote", async (req, res) => {
  try {
    const { authorId } = req.body;
    if (!authorId) {
      return res.status(400).json({ error: "authorId is required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (question.upvotedBy.includes(authorId)) {
      return res
        .status(400)
        .json({ error: "You already upvoted this question" });
    }

    question.upvotes += 1;
    question.upvotedBy.push(authorId);
    await question.save();

    res.json(question);
  } catch (err) {
    console.error("POST /api/query-forum/:id/upvote error", err);
    res.status(500).json({ error: "Failed to upvote question" });
  }
});

module.exports = router;



