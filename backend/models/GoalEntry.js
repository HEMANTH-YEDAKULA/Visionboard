const mongoose = require("mongoose");

const goalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    mood: {
      type: String,
      enum: ["happy", "neutral", "sad", "frustrated"],
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate entry per goal per day
goalEntrySchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("GoalEntry", goalEntrySchema);
