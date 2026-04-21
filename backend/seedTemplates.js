// seedTemplates.js
const mongoose = require('mongoose');
require('dotenv').config();
const GoalTemplate = require('./models/GoalTemplate');

const seedData = [
  { title: "Health & Fitness", description: "Exercise 30 mins daily", category: "Health", defaultDuration: 30, icon: "💪" },
  { title: "Learning", description: "Complete a course", category: "Learning", defaultDuration: 60, icon: "📘" },
  { title: "Finance", description: "Save weekly", category: "Finance", defaultDuration: 90, icon: "💰" },
  { title: "Career", description: "Build portfolio projects", category: "Career", defaultDuration: 45, icon: "💼" },
  { title: "Personal Growth", description: "Daily journaling", category: "Personal", defaultDuration: 21, icon: "🧘" }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await GoalTemplate.deleteMany();
  await GoalTemplate.insertMany(seedData);
  console.log('✅ Templates seeded successfully');
  mongoose.connection.close();
}).catch(err => {
  console.error('Seed error:', err);
});
