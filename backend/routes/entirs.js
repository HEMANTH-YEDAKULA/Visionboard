const express = require("express");
const router = express.Router();
const GoalEntry = require("../models/GoalEntry");
const authMiddleware = require("../middleware/authMiddleware");

// Helper: today as YYYY-MM-DD
const today = () => new Date().toISOString().split("T")[0];

/* ---------------- SAVE / UPDATE TODAY ENTRY ---------------- */
router.post("/today", authMiddleware, async (req, res) => {
  try {
    const { goalId, progress, completed, mood, note } = req.body;

    const entry = await GoalEntry.findOneAndUpdate(
      {
        userId: req.user.id,
        goalId,
        date: today(),
      },
      {
        progress,
        completed,
        mood,
        note,
      },
      { upsert: true, new: true }
    );

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to save daily entry" });
  }
});

/* ---------------- GET TODAY ENTRIES ---------------- */
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const entries = await GoalEntry.find({
      userId: req.user.id,
      date: today(),
    });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch entries" });
  }
});

module.exports = router;
