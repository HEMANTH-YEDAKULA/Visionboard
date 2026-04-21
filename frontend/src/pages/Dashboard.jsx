import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';

const CATEGORY_BAR_COLORS = ['bg-[#53aa58]', 'bg-[#4f7ee8]', 'bg-[#f1bf46]', 'bg-[#67c6bb]'];
const PIE_COLORS = ['#4f7ee8', '#dfe7f4'];

function getWeekLabel() {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  return `Week of ${month} ${now.getDate()}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        const overviewRes = await API.get('/entries/overview');
        if (!active) return;
        setOverview(overviewRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    const intervalId = window.setInterval(loadOverview, 30000);
    const onFocus = () => loadOverview();
    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  if (loading) {
    return <div className="panel text-sm text-slate-500">Loading dashboard...</div>;
  }

  const weekly = overview?.weeklyComparison || {
    thisWeekCompleted: 0,
    lastWeekCompleted: 0,
    deltaPercent: 0,
    completionRate: 0,
    thisWeekTotal: 0,
  };

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="page-heading-row">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>{'<'}</button>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">{getWeekLabel()}</p>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-grid">
        <motion.section className="insight-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <h2 className="insight-title">Tasks Completed</h2>
          <div className="mt-10 text-center">
            <div className="text-[64px] font-semibold leading-none text-[#4f7ee8]">
              {weekly.thisWeekCompleted}/{weekly.thisWeekTotal || overview?.metrics?.totalGoals || 0}
            </div>
            <div className="mt-3 text-[22px] text-[#6d7d97]">Completed this week</div>
          </div>
          <div className="mt-10 h-5 rounded-full bg-[#e8edf4]">
            <div className="h-5 rounded-full bg-[linear-gradient(90deg,#4f7ee8,#56c4b3)]" style={{ width: `${Math.min(100, weekly.completionRate)}%` }} />
          </div>
        </motion.section>

        <motion.section className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
          <h2 className="insight-title text-[24px]">Streak</h2>
          <div className="mt-8 grid gap-4">
            <div className="soft-panel">
              <div className="text-sm text-slate-500">Current streak</div>
              <div className="mt-3 text-4xl font-semibold text-ink">{overview?.metrics?.streak || 0}</div>
            </div>
            <div className="soft-panel">
              <div className="text-sm text-slate-500">Check-ins today</div>
              <div className="mt-3 text-4xl font-semibold text-[#4f7ee8]">{overview?.metrics?.checkInsToday || 0}</div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="dashboard-grid-bottom">
        <motion.section className="insight-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}>
          <h2 className="insight-title">Charts</h2>
          <div className="mt-6" style={{ height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={overview?.progressTrend || []}>
                <defs>
                  <linearGradient id="weeklyProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f7ee8" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#4f7ee8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf2f8" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="averageProgress" stroke="#4f7ee8" fill="url(#weeklyProgress)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section className="insight-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}>
          <h2 className="insight-title">Success Rate</h2>
          <div className="mt-4" style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={overview?.completionBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {(overview?.completionBreakdown || []).map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-slate-500">Overall completion rate: {overview?.metrics?.completionRate || 0}%</div>
        </motion.section>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="insight-card">
          <h2 className="insight-title">Reminders</h2>
          <div className="mt-6 space-y-3">
            {(overview?.notifications || []).map((item) => (
              <div key={item.id} className="notification-card">
                <div className="notification-title">{item.title}</div>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
            {!overview?.notifications?.length ? <div className="soft-panel text-sm text-slate-500">No reminders pending right now.</div> : null}
          </div>
        </div>

        <div className="insight-card">
          <h2 className="insight-title">Category Progress</h2>
          <div className="mt-8 space-y-6">
            {(overview?.categoryProgress || []).map((item, index) => (
              <div key={item.name}>
                <div className="mb-3 flex items-center justify-between text-[18px]">
                  <span className="font-medium text-ink">{item.name}</span>
                  <span className="text-[#6d7d97]">{item.ratioLabel}</span>
                </div>
                <div className="h-4 rounded-full bg-[#e8edf4]">
                  <div className={`h-4 rounded-full ${CATEGORY_BAR_COLORS[index % CATEGORY_BAR_COLORS.length]}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="insight-card">
        <h2 className="insight-title">Goal deadline analysis</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(overview?.goalIntelligence || []).slice(0, 6).map((goal) => (
            <div key={goal.goalId} className="soft-panel">
              <div className="flex items-start justify-between gap-3">
                <div className="text-base font-semibold text-ink">{goal.title}</div>
                <div className="status-pill">{goal.status}</div>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Days left: <span className="font-medium text-ink">{goal.daysLeft ?? 'No deadline'}</span></div>
                <div>Required pace: <span className="font-medium text-ink">{goal.requiredDailyProgress || 0}% / day</span></div>
                <div>Completion chance: <span className="font-medium text-ink">{goal.completionProbability}%</span></div>
                <div>{goal.weakReason}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-actions">
        <button className="btn-primary-large" type="button" onClick={() => navigate('/goals')}>Add New Task</button>
        <button className="btn-outline-large" type="button" onClick={() => navigate('/ai-insights')}>AI Insights</button>
        <button className="btn-outline-large" type="button" onClick={() => navigate('/predictions')}>Predictions</button>
      </div>
    </div>
  );
}
