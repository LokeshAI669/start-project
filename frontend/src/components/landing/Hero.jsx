import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';
import HeroCanvas from './HeroCanvas';

export default function Hero({ navigate }) {
  const videoRef = React.useRef(null);
  const wrapperRef = React.useRef(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.play().catch(() => {});
    }
  }, []);

  const handleMouseMove = (e) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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

        {/* ── Right Column: Premium Floating 3D Video Visual ── */}
        <motion.div
          ref={wrapperRef}
          className="hero-video-visual-wrapper"
          initial={{ opacity: 0, scale: 0.94, y: 28 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1100px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          {/* Ambient Atmospheric Glow */}
          <div className="hero-video-ambient-glow" aria-hidden="true" />

          {/* 3D Orbit Rings */}
          <div className="hero-3d-orbit-ring" aria-hidden="true" />
          <div className="hero-3d-orbit-ring-2" aria-hidden="true" />

          {/* ── The Video Frame ── */}
          <div className="hero-video-frame">
            {/* Radial edge mask for seamless background blending */}
            <div className="hero-video-mask-border" aria-hidden="true" />

            <video
              ref={videoRef}
              className="hero-main-video"
              src="/hero-main-visual.mp4"
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              aria-hidden="true"
            />

            {/* Holographic shimmer sweep */}
            <div className="hero-hologram-shimmer" aria-hidden="true" />

            {/* Bottom fade to blend video into background */}
            <div className="hero-video-bottom-fade" aria-hidden="true" />

            {/* Top fade */}
            <div className="hero-video-top-fade" aria-hidden="true" />

            {/* Cyan rim glow */}
            <div className="hero-video-rim-glow" aria-hidden="true" />
          </div>

          {/* 3D Floating Holographic Pill badge */}
          <div className="hero-3d-floating-pill" aria-hidden="true">
            <span className="pill-pulse-dot" />
            <span>AI Review Live</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
