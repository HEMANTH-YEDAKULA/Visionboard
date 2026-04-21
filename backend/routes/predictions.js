const express = require("express");
const path = require("path");
const { spawn } = require("child_process");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Goal = require("../models/Goal");
const GoalEntry = require("../models/GoalEntry");
const { buildGoalIntelligence } = require("../utils/activityInsights");

function runPredictionScript(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "ml", "predict.py");
    const process = spawn("python", [scriptPath], { cwd: path.join(__dirname, "..") });
    let stdout = "";
    let stderr = "";

    process.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    process.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Prediction process failed with code ${code}`));
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid prediction output: ${stdout}`));
      }
    });

    process.stdin.write(JSON.stringify(payload));
    process.stdin.end();
  });
}

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [goals, entries] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: -1 }),
      GoalEntry.find({ userId }).sort({ date: 1, createdAt: 1 }),
    ]);

    const goalIntelligence = buildGoalIntelligence(goals, entries);
    const features = goalIntelligence.map((goal) => ({
      goalId: String(goal.goalId),
      title: goal.title,
      deadline: goal.deadline,
      progress: goal.progress,
      daysLeft: goal.daysLeft ?? 30,
      progressRate: goal.progressRate,
      completionRate: goal.completionRate,
      streak: goal.goalStreak,
      consistencyScore: goal.consistencyScore / 100,
    }));

    const predictions = await runPredictionScript({ goals: features });

    const merged = features.map((goal) => {
      const prediction = predictions.find((item) => item.goalId === goal.goalId) || {};
      return {
        ...goal,
        probability: prediction.probability ?? 0,
        status: prediction.status || "Unknown",
      };
    });

    res.json({ predictions: merged });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Could not generate predictions" });
  }
});

module.exports = router;
