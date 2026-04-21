import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      await login(res.data.token, res.data.user);
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.section
        className="panel relative overflow-hidden bg-ink text-white"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.2),transparent_22%)]" />
        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.28em] text-sky-200">Real-Time Goal OS</p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
              Build streaks, surface blockers, and keep momentum visible.
            </h1>
            <p className="max-w-xl text-sm text-slate-300">
              VisionBoard now treats your daily goal updates like a live operating system instead of a static tracker.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="stat-card-dark">
              <div className="stat-label-dark">Dashboard</div>
              <div className="stat-value-dark">Live metrics</div>
            </div>
            <div className="stat-card-dark">
              <div className="stat-label-dark">Check-ins</div>
              <div className="stat-value-dark">Daily streaks</div>
            </div>
            <div className="stat-card-dark">
              <div className="stat-label-dark">AI coach</div>
              <div className="stat-value-dark">Actionable feedback</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <h2 className="mb-2 text-2xl font-semibold text-ink">Sign in</h2>
        <p className="mb-6 text-sm text-slate-500">Your session is verified against the backend before protected views open.</p>
        <form onSubmit={submit} className="space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="field" type="email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="field" required />
          <div className="flex items-center justify-between">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Verifying...' : 'Sign in'}
            </button>
            <Link to="/register" className="text-sm font-medium text-brand">Create account</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
