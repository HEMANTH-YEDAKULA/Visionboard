// models/GoalTemplate.js
const mongoose = require('mongoose');

const goalTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  defaultDuration: Number, // days
  icon: String
});

module.exports = mongoose.model('GoalTemplate', goalTemplateSchema);
