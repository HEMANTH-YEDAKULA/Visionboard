const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const AIInsights = require("../models/AIInsights");
const Goal = require("../models/Goal");
const GoalEntry = require("../models/GoalEntry");
const { generateAiSummary } = require("../utils/generateAiSummary");

async function handleSummary(req, res) {
  try {
    const userId = req.user.id;
    const [goals, entries] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: -1 }),
      GoalEntry.find({ userId }).sort({ date: 1, createdAt: 1 }),
    ]);

    const aiResponse = await generateAiSummary(goals, entries);

    await AIInsights.create({
      userId,
      summary: aiResponse.summary,
      suggestions: aiResponse.suggestions || aiResponse.feedback || [],
    });

    res.json(aiResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

router.post("/summary", verifyToken, handleSummary);
router.get("/summary", verifyToken, handleSummary);

module.exports = router;
