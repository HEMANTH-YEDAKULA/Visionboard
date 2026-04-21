const express = require("express");
const router = express.Router();
const ProgressEntry = require("../models/ProgressEntry");
const authMiddleware = require("../middleware/authMiddleware");

// Log daily progress
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { goalId, status, progress, note, date } = req.body;

    const entry = await ProgressEntry.create({
      userId: req.user.id,
      goalId,
      date,
      status,
      progress,
      note,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get progress entries for a week
router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await ProgressEntry.find({
      userId: req.user.id,
    }).sort({ date: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
