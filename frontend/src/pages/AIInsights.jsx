import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';

export default function AIInsights() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await API.post('/ai/summary');
      setInsights(response.data);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || 'Could not generate AI insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="page-heading-row">
          <button type="button" className="back-button" onClick={() => navigate(-1)}>{'<'}</button>
          <div>
            <h1 className="page-title">AI Insights</h1>
            <p className="page-subtitle">Qualitative coaching and category-wise feedback</p>
          </div>
        </div>
      </motion.section>

      <div className="dashboard-actions">
        <button className="btn-primary-large" type="button" onClick={generateInsights} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="insight-card">
          <h2 className="insight-title">Summary</h2>
          <p className="mt-6 text-[20px] leading-[1.7] text-[#324b70]">
            {insights?.summary || 'Generate a summary to get productivity coaching based on your current goals and activity.'}
          </p>
        </section>

        <section className="insight-card">
          <h2 className="insight-title">Focus Areas</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {(insights?.focusAreas || []).map((item) => (
              <span key={item} className="focus-pill">{item}</span>
            ))}
            {!insights?.focusAreas?.length ? <span className="text-sm text-slate-500">No focus areas yet.</span> : null}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="insight-card">
          <h2 className="insight-title">Suggestions</h2>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
            {(insights?.suggestions || []).map((item) => (
              <li key={item}>- {item}</li>
            ))}
            {!insights?.suggestions?.length ? <li>No suggestions yet.</li> : null}
          </ul>
        </section>

        <section className="insight-card">
          <h2 className="insight-title">Category-wise Advice</h2>
          <div className="mt-6 space-y-3">
            {(insights?.categoryAdvice || []).map((item) => (
              <div key={item.category} className="soft-panel">
                <div className="text-base font-semibold text-ink">{item.category}</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{item.advice}</div>
              </div>
            ))}
            {!insights?.categoryAdvice?.length ? <div className="soft-panel text-sm text-slate-500">No category advice yet.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
