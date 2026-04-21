// models/AIInsights.js
const mongoose = require('mongoose');

const aiInsightsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  summary: String,
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AIInsights', aiInsightsSchema);
