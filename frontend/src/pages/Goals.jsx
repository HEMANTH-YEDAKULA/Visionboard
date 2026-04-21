import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import GoalCard from '../components/GoalCard';

const CATEGORY_OPTIONS = [
  { value: 'Health', label: 'Health', symbol: 'H', bubbleClass: 'bubble-green' },
  { value: 'Career', label: 'Career', symbol: 'C', bubbleClass: 'bubble-blue' },
  { value: 'Finance', label: 'Finance', symbol: '$', bubbleClass: 'bubble-gold' },
  { value: 'Personal', label: 'Personal', symbol: 'P', bubbleClass: 'bubble-cyan' },
  { value: 'Learning', label: 'Learning', symbol: 'L', bubbleClass: 'bubble-purple' },
  { value: 'Relationships', label: 'Relationships', symbol: 'R', bubbleClass: 'bubble-pink' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high', label: 'High priority' },
];

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [todayEntries, setTodayEntries] = useState([]);
  const [overview, setOverview] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const loadGoalsData = async () => {
    const [gRes, tRes, entriesRes, overviewRes] = await Promise.all([
      API.get('/goals'),
      API.get('/templates'),
      API.get('/entries/today'),
      API.get('/entries/overview'),
    ]);

    setGoals(gRes.data || []);
    setTemplates(tRes.data || []);
    setTodayEntries(entriesRes.data || []);
    setOverview(overviewRes.data);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadGoalsData();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addGoal = async () => {
    const nextTitle = selectedTemplate?.title || title;
    if (!nextTitle.trim()) {
      alert('Title is required');
      return;
    }

    const payload = {
      title: nextTitle.trim(),
      description: selectedTemplate?.description || description,
      category: selectedTemplate?.category || category,
      priority,
      startDate: new Date().toISOString(),
      endDate: deadline || null,
    };

    try {
      await API.post('/goals', payload);
      await loadGoalsData();
      setSelectedTemplate(null);
      setTitle('');
      setDescription('');
      setCategory('Health');
      setPriority('medium');
      setDeadline('');
      setFeedback('Task saved successfully.');
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not add goal');
    }
  };

  const saveProgress = async (goal, progress) => {
    try {
      const res = await API.put(`/goals/${goal._id}`, {
        progress,
        completed: progress >= 100,
      });
      setGoals((current) => current.map((item) => item._id === goal._id ? res.data : item));
      setFeedback(`Progress updated for ${goal.title}.`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not update goal');
    }
  };

  const toggleGoal = async (goal) => {
    try {
      const res = await API.put(`/goals/${goal._id}`, {
        completed: !goal.completed,
        progress: goal.completed ? Math.min(goal.progress || 0, 90) : 100,
      });
      setGoals((current) => current.map((item) => item._id === goal._id ? res.data : item));
      setFeedback(`${goal.title} is now ${goal.completed ? 'active' : 'completed'}.`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not update goal');
    }
  };

  const checkInGoal = async (goal, entry) => {
    try {
      await Promise.all([
        API.put(`/goals/${goal._id}`, {
          progress: entry.progress,
          completed: entry.completed,
        }),
        API.post('/entries/today', {
          goalId: goal._id,
          ...entry,
        }),
      ]);

      await loadGoalsData();
      setFeedback(`Today's check-in saved for ${goal.title}.`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not save check-in');
    }
  };

  const deleteGoal = async (goal) => {
    try {
      await API.delete(`/goals/${goal._id}`);
      await loadGoalsData();
      setFeedback(`${goal.title} was removed.`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not delete goal');
    }
  };

  if (loading) {
    return <div className="panel text-sm text-slate-500">Loading goals...</div>;
  }

  const checkedInGoalIds = new Set(todayEntries.map((entry) => String(entry.goalId)));

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="page-heading-row">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>
            {'<'}
          </button>
          <div>
            <h1 className="page-title">Create New Task</h1>
            <p className="page-subtitle">Add a new goal to your vision board</p>
          </div>
        </div>
      </motion.section>

      {feedback ? <div className="panel text-sm text-slate-600">{feedback}</div> : null}

      <motion.section
        className="form-shell"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
      >
        <div className="form-card">
          <h2 className="section-title">Task Details</h2>

          <div className="space-y-8">
            <div>
              <label className="field-label">Task Name</label>
              <input
                className="field field-large"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="What do you want to achieve?"
              />
            </div>

            <div>
              <label className="field-label">Category</label>
              <div className="category-grid">
                {CATEGORY_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`category-card ${category === item.value ? 'category-card-active' : ''}`}
                    onClick={() => setCategory(item.value)}
                  >
                    <span className={`category-bubble ${item.bubbleClass}`}>{item.symbol}</span>
                    <span className="category-name">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Priority Level</label>
              <select className="field field-large" value={priority} onChange={(event) => setPriority(event.target.value)}>
                {PRIORITY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Deadline</label>
              <input
                className="field field-large"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
              <p className="mt-3 text-sm text-slate-500">
                Set a target date so VisionBoard can estimate pace, remaining days, and completion probability for this goal.
              </p>
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea
                className="field min-h-28 resize-none"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add more context for this task"
              />
            </div>

            {templates.length ? (
              <div>
                <label className="field-label">Suggested Templates</label>
                <div className="template-row">
                  {templates.slice(0, 4).map((template) => (
                    <button
                      key={template._id}
                      type="button"
                      className={`template-chip ${selectedTemplate?._id === template._id ? 'template-chip-active' : ''}`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTitle(template.title);
                        setDescription(template.description || '');
                        setCategory(template.category || 'Health');
                      }}
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button className="save-task-button" type="button" onClick={addGoal}>
              Save Task
            </button>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="section-title mb-1">Active Tasks</h3>
            <p className="text-sm text-slate-500">Your existing goals stay below the creation form and still support check-ins.</p>
          </div>
          <div className="category-pill">{checkedInGoalIds.size} checked in today</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              intelligence={overview?.goalIntelligence?.find((item) => String(item.goalId) === String(goal._id))}
              checkedInToday={checkedInGoalIds.has(String(goal._id))}
              onSaveProgress={saveProgress}
              onCheckIn={checkInGoal}
              onToggleComplete={toggleGoal}
              onDelete={deleteGoal}
            />
          ))}
        </div>
        {goals.length === 0 ? <div className="panel mt-4 text-sm text-slate-500">No goals created yet.</div> : null}
      </section>
    </div>
  );
}
