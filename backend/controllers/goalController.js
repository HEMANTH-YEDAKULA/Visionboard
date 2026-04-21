const Goal = require('../models/Goal');

// Create a goal
const createGoal = async (req, res) => {
  try {
    const { title, domain, description, targetValue, endDate, weight, unit } = req.body;
    const goal = new Goal({
      user: req.user._id,
      title, domain, description, targetValue, endDate, weight, unit
    });
    await goal.save();
    res.json(goal);
  } catch (err) { console.error('createGoal:', err); res.status(500).send('Server error'); }
};

// Get all user goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort('-createdAt');
    res.json(goals);
  } catch (err) { console.error('getGoals:', err); res.status(500).send('Server error'); }
};

// Update goal (partial)
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    res.json(goal);
  } catch (err) { console.error('updateGoal:', err); res.status(500).send('Server error'); }
};

// Delete
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });
    res.json({ msg: 'Deleted' });
  } catch (err) { console.error('deleteGoal:', err); res.status(500).send('Server error'); }
};

// Update progress and maintain simple streak logic
const updateProgress = async (req, res) => {
  try {
    const { progressDelta, progressAbsolute } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    if (typeof progressAbsolute === 'number') goal.progress = Math.max(0, Math.min(100, progressAbsolute));
    else if (typeof progressDelta === 'number') goal.progress = Math.max(0, Math.min(100, (goal.progress || 0) + progressDelta));
    else return res.status(400).json({ msg: 'Provide progressDelta or progressAbsolute' });

    // Streak logic: increment streak if progress increases on a new day
    const today = new Date().toDateString();
    const lastDate = goal._lastProgressDate;
    const lastVal = goal._lastProgressValue || 0;

    if (!lastDate) {
      goal._lastProgressDate = today;
      goal._lastProgressValue = goal.progress;
      goal.streak = goal.streak || 0;
    } else {
      if (goal.progress > lastVal && lastDate !== today) {
        goal.streak = (goal.streak || 0) + 1;
      } else if (goal.progress < lastVal) {
        // optional: reset streak on regression (you can remove this line if you prefer)
        goal.streak = 0;
      }
      goal._lastProgressDate = today;
      goal._lastProgressValue = goal.progress;
    }

    await goal.save();
    res.json(goal);
  } catch (err) { console.error('updateProgress:', err); res.status(500).send('Server error'); }
};

// Weighted scoring: overall user score and details
const getScore = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });
    if (!goals.length) return res.json({ overall: 0, details: [] });

    const totalWeight = goals.reduce((s,g)=> s + (g.weight || 1), 0);
    const details = goals.map(g => {
      const contribution = ((g.progress || 0) / 100) * (g.weight || 1);
      return { goalId: g._id, title: g.title, progress: g.progress || 0, weight: g.weight || 1, contribution };
    });
    const sumContrib = details.reduce((s,d)=> s + d.contribution, 0);
    const overall = totalWeight ? (sumContrib / totalWeight) * 100 : 0;
    res.json({ overall: Math.round(overall * 100) / 100, details });
  } catch (err) { console.error('getScore:', err); res.status(500).send('Server error'); }
};

module.exports = {
  createGoal, getGoals, updateGoal, deleteGoal, updateProgress, getScore
};
