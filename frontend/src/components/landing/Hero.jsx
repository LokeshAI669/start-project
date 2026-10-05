import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';
import HeroCanvas from './HeroCanvas';

export default function Hero({ navigate }) {
  return (
    <section className="hero" id="hero" aria-label="Hero section">
      {/* ══ Abstract Ambient Background ══════════════════════════════════ */}
      <div className="hero-bg-layer" aria-hidden="true">
        <HeroCanvas />
        <div className="hero-ambient-orb hero-ambient-orb-1" />
        <div className="hero-ambient-orb hero-ambient-orb-2" />
        <div className="hero-ambient-orb hero-ambient-orb-3" />
        <div className="hero-grid-mesh" />
        <div className="hero-video-gradient-overlay" />
      </div>

      {/* ══ Hero Content Grid ═══════════════════════════════════════════ */}
      <div className="hero-inner">
        {/* ── Left Column: Headline, CTAs, Trust Badges ── */}
        <motion.div
          className="hero-text"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            className="hero-tag"
          >
            <Sparkles size={13} style={{ color: 'var(--orange-light, #60A5FA)' }} />
            Project Request Platform
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          >
            Where Student Projects<br />
            <span className="typewriter-wrap">
              <span className="typewriter-text" id="typewriter">Get Approved</span>
              <span className="typewriter-cursor" aria-hidden="true" />
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          >
            Submit project ideas, schedule meetings, and track supervisor approvals in real time.
            A streamlined platform engineered for students and faculty who value clarity and speed.
          </motion.p>

          <StatsBadge count="250+" label="projects" />
          <CTAButtons navigate={navigate} />
          <StatusBar />
        </motion.div>

        {/* ── Right Column: Animated Dashboard Mockup (CSS only, no video) ── */}
        <motion.div
          className="hero-mockup-wrapper"
          initial={{ opacity: 0, scale: 0.94, y: 28 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-video-ambient-glow" aria-hidden="true" />
          <div className="hero-3d-orbit-ring" aria-hidden="true" />
          <div className="hero-3d-orbit-ring-2" aria-hidden="true" />

          {/* Dashboard mockup card */}
          <div className="hero-dashboard-mockup">
            <div className="hero-dash-topbar">
              <span className="hero-dash-dot" style={{ background: '#ff5f57' }} />
              <span className="hero-dash-dot" style={{ background: '#febc2e' }} />
              <span className="hero-dash-dot" style={{ background: '#28c840' }} />
              <span className="hero-dash-title">JobZen Dashboard</span>
            </div>
            <div className="hero-dash-body">
              {/* Stat row */}
              <div className="hero-dash-stats">
                {[
                  { label: 'Submitted', val: '12', color: '#3B82F6' },
                  { label: 'Accepted', val: '8', color: '#10B981' },
                  { label: 'Pending', val: '4', color: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} className="hero-dash-stat-card" style={{ '--sc': s.color }}>
                    <div className="hero-dash-stat-val">{s.val}</div>
                    <div className="hero-dash-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Project request rows */}
              {[
                { name: 'E-Commerce App', budget: '₹1,50,000', status: 'Accepted', sc: '#10B981' },
                { name: 'AI Chatbot', budget: '₹80,000', status: 'Pending', sc: '#F59E0B' },
                { name: 'Data Dashboard', budget: '₹2,00,000', status: 'Accepted', sc: '#10B981' },
                { name: 'LMS Portal', budget: '₹1,20,000', status: 'In Review', sc: '#3B82F6' },
              ].map((r, i) => (
                <motion.div
                  key={r.name}
                  className="hero-dash-row"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <div className="hero-dash-row-name">{r.name}</div>
                  <div className="hero-dash-row-budget">{r.budget}</div>
                  <span className="hero-dash-badge" style={{ color: r.sc, borderColor: r.sc + '40', background: r.sc + '15' }}>
                    {r.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating pill */}
          <div className="hero-3d-floating-pill" aria-hidden="true">
            <span className="pill-pulse-dot" />
            <span>AI Review Live</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


