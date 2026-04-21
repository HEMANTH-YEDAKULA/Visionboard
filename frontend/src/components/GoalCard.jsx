import React, { useEffect, useState } from 'react';

const MOODS = [
  { value: 'happy', label: 'Happy' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'sad', label: 'Sad' },
  { value: 'frustrated', label: 'Frustrated' },
];

function priorityLabel(priority) {
  if (!priority) return 'Medium';
  return priority.slice(0, 1).toUpperCase() + priority.slice(1);
}

function statusLabel(intelligence) {
  if (!intelligence) return 'Tracking';
  if (intelligence.status === 'on-track') return 'On track';
  if (intelligence.status === 'at-risk') return 'At risk';
  if (intelligence.status === 'critical') return 'Critical';
  if (intelligence.status === 'overdue') return 'Overdue';
  if (intelligence.status === 'completed') return 'Completed';
  return 'Tracking';
}

export default function GoalCard({ goal, intelligence, checkedInToday, onSaveProgress, onCheckIn, onToggleComplete, onDelete }) {
  const [progress, setProgress] = useState(goal.progress || 0);
  const [mood, setMood] = useState('neutral');
  const [note, setNote] = useState('');

  useEffect(() => {
    setProgress(goal.progress || 0);
  }, [goal.progress]);

  return (
    <article className="goal-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-ink">{goal.title}</div>
          <div className="mt-1 text-sm text-slate-500">
            {goal.category || 'General'} / {priorityLabel(goal.priority)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="category-pill">{progress}%</div>
          {intelligence ? <div className="status-pill">{statusLabel(intelligence)}</div> : null}
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-600">{goal.description || 'No description yet.'}</p>

      {intelligence ? (
        <div className="goal-meta-grid">
          <div className="soft-panel compact-panel">
            <div className="meta-label">Deadline</div>
            <div className="meta-value">
              {intelligence.daysLeft === null ? 'No date' : `${intelligence.daysLeft} day${intelligence.daysLeft === 1 ? '' : 's'} left`}
            </div>
          </div>
          <div className="soft-panel compact-panel">
            <div className="meta-label">Required pace</div>
            <div className="meta-value">{intelligence.requiredDailyProgress || 0}% / day</div>
          </div>
          <div className="soft-panel compact-panel">
            <div className="meta-label">Success chance</div>
            <div className="meta-value">{intelligence.completionProbability}%</div>
          </div>
        </div>
      ) : null}

      {intelligence?.weakReason ? (
        <div className="rounded-[20px] border border-[#f1e8d7] bg-[#fffaf0] p-4 text-sm text-[#745c2e]">
          {intelligence.weakReason}
        </div>
      ) : null}

      <div className="rounded-[20px] border border-line bg-[#fafcff] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
          <span>{goal.completed ? 'Completed' : 'In progress'}</span>
          <span>{checkedInToday ? 'Checked in today' : 'No check-in today'}</span>
        </div>
        <input
          className="mt-4 h-2 w-full accent-brand"
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button className="soft-button" type="button" onClick={() => onSaveProgress(goal, progress)}>
            Save progress
          </button>
          <button className="soft-button" type="button" onClick={() => onToggleComplete(goal)}>
            {goal.completed ? 'Mark active' : 'Mark complete'}
          </button>
        </div>
      </div>

      <div className="space-y-3 rounded-[20px] border border-line bg-white p-4">
        <div className="text-sm font-semibold text-ink">Daily check-in</div>
        <select className="field" value={mood} onChange={(event) => setMood(event.target.value)}>
          {MOODS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <textarea
          className="field min-h-24 resize-none"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Write a short note about today's progress"
        />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <button
            className="save-task-button"
            type="button"
            onClick={() => {
              onCheckIn(goal, {
                progress,
                completed: progress >= 100,
                mood,
                note,
              });
              setNote('');
            }}
          >
            Save today's check-in
          </button>
          <button className="btn-danger" type="button" onClick={() => onDelete(goal)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
