import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../utils/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post('/auth/register', { name, email, password });
      await login(res.data.token, res.data.user);
      nav('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Register failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="mx-auto max-w-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="panel">
        <h2 className="mb-2 text-2xl font-semibold text-ink">Create account</h2>
        <p className="mb-6 text-sm text-slate-500">Register once, verify immediately, and land in a live dashboard.</p>
        <form onSubmit={submit} className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="field" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="field" type="email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="field" required minLength={6} />
          <div className="flex items-center justify-between">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Register'}
            </button>
            <Link to="/" className="text-sm font-medium text-brand">Back to sign in</Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
