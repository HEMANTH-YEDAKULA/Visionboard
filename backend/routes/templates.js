// routes/templates.js
const express = require('express');
const router = express.Router();
const GoalTemplate = require('../models/GoalTemplate');

router.get('/', async (req, res) => {
  try {
    const templates = await GoalTemplate.find();
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
