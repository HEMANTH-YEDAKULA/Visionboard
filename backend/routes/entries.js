const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const GoalEntry = require("../models/GoalEntry");
const Goal = require("../models/Goal");
const { buildActivityInsights, getTodayDateString } = require("../utils/activityInsights");

router.post("/today", auth, async (req, res) => {
  try {
    const { goalId, progress, completed, mood, note } = req.body;
    const today = getTodayDateString();

    if (!goalId) {
      return res.status(400).json({ msg: "goalId is required" });
    }

    const entry = await GoalEntry.findOneAndUpdate(
      { userId: req.user.id, goalId, date: today },
      {
        progress: typeof progress === "number" ? progress : 0,
        completed: Boolean(completed),
        mood: mood || "neutral",
        note: note || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not save entry" });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const days = Math.min(Number(req.query.days) || 14, 60);
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    const entries = await GoalEntry.find({
      userId: req.user.id,
      date: { $gte: cutoffDate },
    }).sort({ date: 1, createdAt: 1 });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not fetch history" });
  }
});

router.get("/overview", auth, async (req, res) => {
  try {
    const [goals, entries] = await Promise.all([
      Goal.find({ userId: req.user.id }).sort({ createdAt: -1 }),
      GoalEntry.find({ userId: req.user.id }).sort({ date: 1, createdAt: 1 }),
    ]);

    res.json(buildActivityInsights(goals, entries));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not fetch overview" });
  }
});

router.get("/today", auth, async (req, res) => {
  try {
    const today = getTodayDateString();
    const entries = await GoalEntry.find({ userId: req.user.id, date: today });
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not fetch today's entries" });
  }
});

module.exports = router;
