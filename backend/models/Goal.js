// models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  progress: { type: Number, default: 0 }, // 0-100
  completed: { type: Boolean, default: false },
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
