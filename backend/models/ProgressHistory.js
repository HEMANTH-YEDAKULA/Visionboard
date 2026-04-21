// models/ProgressHistory.js
const mongoose = require('mongoose');

const progressHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true },
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ProgressHistory', progressHistorySchema);
