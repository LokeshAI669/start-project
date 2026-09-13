import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';
import FeatureCard from './FeatureCard';

import heroBgVideo       from '../../assets/hero-bg-robot-final.mp4';
import heroBgMobileVideo from '../../assets/hero-bg-robot.mp4';
import heroBgPoster      from '../../assets/hero-bg-robot-poster.webp';
// The new animated robot video — plays as a foreground overlay element
import heroRobotAnimated from '../../assets/hero-robot-animated.mp4';

// ─── matchMedia hook ──────────────────────────────────────────────────────────
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export default function Hero({ navigate }) {
  const isMobile  = useMediaQuery('(max-width: 767px)');
  const isTablet  = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // ── Background video state ────────────────────────────────────────────────
  const [bgVideoFailed, setBgVideoFailed]     = useState(false);
  const [bgVideoPlaying, setBgVideoPlaying]   = useState(false);
  const bgVideoRef = useRef(null);

  // ── Animated robot video state ────────────────────────────────────────────
  const [robotVideoFailed, setRobotVideoFailed] = useState(false);
  const robotVideoRef = useRef(null);

  // ── Slow network check ────────────────────────────────────────────────────
  const isSlowConnection = (() => {
    if (typeof navigator === 'undefined') return false;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g'));
  })();

  // Mobile: skip the heavy background video entirely (use poster instead)
  const shouldSkipBgVideo = isMobile || isSlowConnection;
  // Robot animation video: show on tablet + desktop only
  const shouldSkipRobotVideo = isMobile;

  // ── Play background video ──────────────────────────────────────────────────
  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video || shouldSkipBgVideo) return;
    video.muted = true;
    video.play()
      .then(() => setBgVideoPlaying(true))
      .catch(() => setBgVideoFailed(true));
  }, [shouldSkipBgVideo]);

  // ── Play robot animated video ──────────────────────────────────────────────
  useEffect(() => {
    const video = robotVideoRef.current;
    if (!video || shouldSkipRobotVideo) return;
    video.muted = true;
    video.play().catch(() => setRobotVideoFailed(true));
  }, [shouldSkipRobotVideo]);

  const showBgVideo    = !shouldSkipBgVideo && !bgVideoFailed;
  const showRobotVideo = !shouldSkipRobotVideo && !robotVideoFailed;

  return (
    <section className="hero" id="hero" aria-label="Hero section">

      {/* ══ Background Layer ══════════════════════════════════════════════════ */}
      <div className="hero-bg-layer" aria-hidden="true">
        {showBgVideo ? (
          <video
            ref={bgVideoRef}
            className="hero-video-bg"
            poster={heroBgPoster}
            autoPlay
            loop
            muted
            playsInline
            x-webkit-airplay="allow"
            preload={isTablet ? 'metadata' : 'auto'}
            onError={() => setBgVideoFailed(true)}
          >
            {/* Safari/iOS: HEVC .mov (WebM alpha not supported in Safari) */}
            <source src={heroBgVideo.replace('.mp4', '.mov')} type='video/mp4; codecs="hvc1"' />
            {/* Chrome/Firefox/Edge: WebM VP9 */}
            <source src={heroBgVideo.replace('.mp4', '.webm')} type="video/webm" />
            {/* Tablet: smaller file */}
            {isTablet && <source src={heroBgMobileVideo} type="video/mp4" />}
            {/* Desktop: full quality */}
            <source src={heroBgVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            className="hero-poster-bg"
            style={{ backgroundImage: `url(${heroBgPoster})` }}
            role="img"
            aria-label="Hero background"
          />
        )}

        {/* Gradient overlay */}
        <div className="hero-video-gradient-overlay" />
      </div>

      {/* ══ Hero Content ══════════════════════════════════════════════════════ */}
      <div className="hero-inner">

        {/* ── Left: text + CTAs ── */}
        <motion.div
          className="hero-text"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className="hero-tag"
          >
            Project Request Platform
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
          >
            Where Student Projects<br />
            <span className="typewriter-wrap">
              <span className="typewriter-text" id="typewriter">Get Approved</span>
              <span className="typewriter-cursor" aria-hidden="true" />
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
          >
            Submit project ideas, schedule meetings, track approvals in real time —
            a streamlined platform built for students and supervisors who value
            clarity and speed.
          </motion.p>

          <StatsBadge count="250+" label="projects" />
          <CTAButtons navigate={navigate} />
          <StatusBar />
        </motion.div>

        {/* ── Right: animated robot + dashboard card ── */}
        <div className="hero-dashboard-wrapper">

          {/* ── Spinning rings — desktop only ── */}
          {isDesktop && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="dashboard-ring dashboard-ring-outer"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="dashboard-ring dashboard-ring-inner"
              />
            </>
          )}

          {/*
            ══ ANIMATED ROBOT VIDEO ══════════════════════════════════════════
            The Kling-generated animated robot sits here as an overlay element.

            Styling approach:
            - mix-blend-mode: lighten  → makes the dark background of the video
              transparent visually, letting the hero bg show through.
              Works best when the video has a near-black background.
            - object-fit: contain      → keeps full robot in frame, never crops
            - No fixed height/width    → fluid, responsive
            - pointer-events: none     → clicks pass through to content below
            - loop + muted + playsInline → required for cross-browser autoplay

            If the video has a transparent/alpha channel (WebM with alpha),
            mix-blend-mode is not needed and can be removed.
          */}
          {showRobotVideo && (
            <motion.div
              className="hero-robot-video-wrap"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            >
              <video
                ref={robotVideoRef}
                className="hero-robot-video"
                autoPlay
                loop
                muted
                playsInline
                x-webkit-airplay="allow"
                preload="auto"
                onError={() => setRobotVideoFailed(true)}
              >
                {/* HEVC mov for Safari/iOS alpha support */}
                <source
                  src={heroRobotAnimated.replace('.mp4', '.mov')}
                  type='video/mp4; codecs="hvc1"'
                />
                {/* WebM for Chrome/Firefox (if available) */}
                <source
                  src={heroRobotAnimated.replace('.mp4', '.webm')}
                  type="video/webm"
                />
                {/* MP4 universal fallback */}
                <source src={heroRobotAnimated} type="video/mp4" />
              </video>
            </motion.div>
          )}

          {/* Dashboard stats card — shown below robot or as fallback */}
          <FeatureCard
            title="Project Approval Rate"
            percentage="94%"
            icon={CheckCircle}
            metrics={[
              { label: 'Requests Accepted', value: '94%' },
              { label: 'Avg. Response Time', value: '<24hr' },
              { label: 'Student Satisfaction', value: '4.9 ★' },
            ]}
            badgeText="Live Tracking · Real-Time Updates"
          />
        </div>
      </div>
    </section>
  );
}
