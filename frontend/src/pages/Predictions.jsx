import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';

export default function Predictions() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get('/predictions');
        setPredictions(response.data.predictions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="panel text-sm text-slate-500">Loading predictions...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="page-heading-row">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>{'<'}</button>
          <div>
            <h1 className="page-title">Predictions</h1>
            <p className="page-subtitle">Quantitative goal completion prediction</p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {predictions.map((goal) => (
          <article key={goal.goalId} className="goal-card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-lg font-semibold text-ink">{goal.title}</div>
              <div className="status-pill">{goal.status}</div>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div>Deadline: <span className="font-medium text-ink">{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</span></div>
              <div>Progress: <span className="font-medium text-ink">{goal.progress}%</span></div>
              <div>Days left: <span className="font-medium text-ink">{goal.daysLeft}</span></div>
              <div>Completion probability: <span className="font-medium text-ink">{Math.round((goal.probability || 0) * 100)}%</span></div>
            </div>
          </article>
        ))}
      </section>
      {!predictions.length ? <div className="panel text-sm text-slate-500">No predictions available yet.</div> : null}
    </div>
  );
}
