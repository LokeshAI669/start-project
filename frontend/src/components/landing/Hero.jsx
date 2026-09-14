import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';

export default function Hero({ navigate }) {
  return (
    <section className="hero" id="hero" aria-label="Hero section">
      {/* ══ Abstract Ambient Background ══════════════════════════════════ */}
      <div className="hero-bg-layer" aria-hidden="true">
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

        {/* ── Right Column: Interactive SaaS Approval Dashboard Visual ── */}
        <div className="hero-dashboard-wrapper">
          {/* Ambient Glow behind dashboard */}
          <div className="hero-dashboard-backdrop-glow" aria-hidden="true" />

          {/* Main Dashboard Window */}
          <motion.div
            className="hero-saas-window"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* macOS Window Header */}
            <div className="hero-window-header">
              <div className="hero-window-dots" aria-hidden="true">
                <span className="dot dot-close" />
                <span className="dot dot-minimize" />
                <span className="dot dot-expand" />
              </div>
              <div className="hero-window-title">
                <ShieldCheck size={14} className="hero-window-shield" />
                <span>JobZen Review Portal</span>
              </div>
              <div className="hero-window-badge">
                <span className="pulse-dot" />
                <span>Live System</span>
              </div>
            </div>

            {/* Dashboard Content Body */}
            <div className="hero-window-body">
              {/* Top Pipeline Bar */}
              <div className="hero-pipeline-header">
                <div>
                  <span className="pipeline-label">Live Pipeline</span>
                  <h4 className="pipeline-title">Request #JZ-8842</h4>
                </div>
                <span className="pipeline-status-tag">
                  <Clock size={12} /> In Review · Priority
                </span>
              </div>

              {/* 3-Step Approval Pipeline */}
              <div className="hero-pipeline-steps">
                <div className="pipeline-step completed">
                  <div className="step-marker">
                    <CheckCircle2 size={13} />
                  </div>
                  <div className="step-info">
                    <span className="step-name">Submitted</span>
                    <span className="step-time">10:14 AM</span>
                  </div>
                </div>
                <div className="pipeline-connector active" />
                <div className="pipeline-step active">
                  <div className="step-marker">
                    <span className="step-pulsing-ring" />
                    <span className="step-inner-dot" />
                  </div>
                  <div className="step-info">
                    <span className="step-name">Faculty Review</span>
                    <span className="step-time">In Progress</span>
                  </div>
                </div>
                <div className="pipeline-connector" />
                <div className="pipeline-step pending">
                  <div className="step-marker">
                    <span className="step-empty-dot" />
                  </div>
                  <div className="step-info">
                    <span className="step-name">Approval</span>
                    <span className="step-time">Next</span>
                  </div>
                </div>
              </div>

              {/* Featured In-Flight Request Card */}
              <div className="hero-project-preview-card">
                <div className="project-preview-top">
                  <div>
                    <span className="project-preview-category">Artificial Intelligence</span>
                    <h5 className="project-preview-name">AI Interview Coach & Sentiment Analysis</h5>
                  </div>
                  <span className="project-preview-budget">₹80,000</span>
                </div>

                {/* Progress bar */}
                <div className="project-progress-wrap">
                  <div className="project-progress-bar">
                    <motion.div
                      className="project-progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: '84%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                  <div className="project-progress-meta">
                    <span>Supervisor review complete</span>
                    <span className="progress-pct">84%</span>
                  </div>
                </div>
              </div>

              {/* Real-time KPI Stats Grid */}
              <div className="hero-kpi-grid">
                <div className="hero-kpi-card">
                  <span className="kpi-val text-green">94%</span>
                  <span className="kpi-label">Acceptance Rate</span>
                </div>
                <div className="hero-kpi-card">
                  <span className="kpi-val text-blue">&lt;24hr</span>
                  <span className="kpi-label">Avg. Response</span>
                </div>
                <div className="hero-kpi-card">
                  <span className="kpi-val text-gold">4.9 ★</span>
                  <span className="kpi-label">Satisfaction</span>
                </div>
              </div>

              {/* Scheduled Meeting Notification Banner */}
              <div className="hero-meeting-banner">
                <div className="meeting-icon-wrap">
                  <Calendar size={15} />
                </div>
                <div className="meeting-text">
                  <strong>Slot Reserved: Tomorrow at 10:30 AM</strong>
                  <span>Supervising Faculty: Dr. A. Sharma (HOD Comp Sci)</span>
                </div>
                <ArrowUpRight size={15} className="meeting-arrow" />
              </div>
            </div>
          </motion.div>

          {/* Floating Verified Pill (Desktop & Tablet) */}
          <motion.div
            className="hero-floating-badge"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              delay: 0.45,
              y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <div className="floating-badge-icon">
              <FileCheck size={16} />
            </div>
            <div>
              <div className="floating-badge-title">Project Approved</div>
              <div className="floating-badge-sub">Confirmation email sent</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
