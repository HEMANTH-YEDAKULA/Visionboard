const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

router.post("/", async (req, res) => {
  try {
    if (!req.body?.title?.trim()) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title: req.body.title.trim(),
      description: req.body.description || "",
      category: req.body.category || "",
      priority: req.body.priority || "medium",
      progress: typeof req.body.progress === "number" ? req.body.progress : 0,
      completed: Boolean(req.body.completed),
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ msg: "Goal not found" });
    }

    const { title, description, category, priority, progress, completed, startDate, endDate } = req.body;

    if (typeof title === "string" && title.trim()) goal.title = title.trim();
    if (typeof description === "string") goal.description = description;
    if (typeof category === "string") goal.category = category;
    if (typeof priority === "string") goal.priority = priority;
    if (startDate !== undefined) goal.startDate = startDate || null;
    if (endDate !== undefined) goal.endDate = endDate || null;
    if (typeof progress === "number") {
      goal.progress = Math.max(0, Math.min(100, progress));
    }

    if (typeof completed === "boolean") {
      goal.completed = completed;
      if (completed && goal.progress < 100) {
        goal.progress = 100;
      }
    } else if (goal.progress >= 100) {
      goal.completed = true;
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removed = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!removed) return res.status(404).json({ msg: "Goal not found" });
    res.json({ msg: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
