import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';
import FeatureCard from './FeatureCard';

import heroBgVideo    from '../../assets/hero-bg-robot-final.mp4';
import heroBgMobileVideo from '../../assets/hero-bg-robot.mp4';
import heroBgPoster   from '../../assets/hero-bg-robot-poster.webp';

// ─── matchMedia hook ──────────────────────────────────────────────────────────
// Uses the browser's native matchMedia API for accurate, reactive breakpoints.
// Server-side safe (returns false when window is undefined).
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
    setMatches(mql.matches); // sync on mount in case it changed during SSR
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// ─── Detect iOS/Safari — needs special HEVC .mov handling ────────────────────
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isSafari() {
  if (typeof navigator === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export default function Hero({ navigate }) {
  // ── Breakpoints via matchMedia (accurate & reactive) ─────────────────────
  const isMobile  = useMediaQuery('(max-width: 767px)');
  const isTablet  = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  // ── Video state ───────────────────────────────────────────────────────────
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  // ── Detect slow network ───────────────────────────────────────────────────
  const isSlowConnection = (() => {
    if (typeof navigator === 'undefined') return false;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g'));
  })();

  // ── Mobile: always skip video to save battery + bandwidth ────────────────
  // On mobile screens we render a static poster image — no video at all.
  // This is the primary fix for Android lag.
  const shouldSkipVideo = isMobile || isSlowConnection;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldSkipVideo) return;

    // Ensure muted (required by all browsers for autoplay)
    video.muted = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoPlaying(true))
        .catch(() => {
          // Autoplay blocked (e.g. browser policy, low power mode)
          // Gracefully fall back to poster image
          setVideoFailed(true);
        });
    }
  }, [shouldSkipVideo]);

  // ── Determine if video element should render at all ───────────────────────
  const showVideo = !shouldSkipVideo && !videoFailed;

  return (
    <section className="hero" id="hero" aria-label="Hero section">

      {/* ── Background Layer ── */}
      <div className="hero-bg-layer" aria-hidden="true">
        {showVideo ? (
          <video
            ref={videoRef}
            className="hero-video-bg"
            poster={heroBgPoster}
            autoPlay
            loop
            muted
            playsInline
            /* iOS Safari requires this attribute to autoplay inline */
            x-webkit-airplay="allow"
            /* Preload: metadata-only on tablet, full on desktop */
            preload={isTablet ? 'metadata' : 'auto'}
            onError={() => setVideoFailed(true)}
            onCanPlayThrough={() => {
              if (!videoPlaying && videoRef.current) {
                videoRef.current.play().catch(() => setVideoFailed(true));
              }
            }}
          >
            {/*
              Source order matters:
              1. Safari/iOS: needs HEVC .mov for alpha-channel video
                 (WebM VP9 alpha is NOT supported by Safari/iOS at all)
              2. Modern browsers: WebM VP9 with alpha channel
              3. Tablet: smaller optimised mp4
              4. Desktop: full-quality mp4
            */}
            {/* HEVC .mov for Safari/iOS — served only if the browser accepts it */}
            <source
              src={heroBgVideo.replace('.mp4', '.mov')}
              type='video/mp4; codecs="hvc1"'
            />
            {/* WebM VP9 alpha — Chrome, Firefox, Edge */}
            <source
              src={heroBgVideo.replace('.mp4', '.webm')}
              type="video/webm"
            />
            {/* MP4 fallback — tablet gets smaller file */}
            {isTablet && (
              <source src={heroBgMobileVideo} type="video/mp4" />
            )}
            {/* MP4 fallback — desktop full quality */}
            <source src={heroBgVideo} type="video/mp4" />
          </video>
        ) : (
          /*
            Mobile / slow connection / video-failed fallback.
            Uses the poster WebP as a static background — zero JS cost,
            no network request for a 26MB video file.
          */
          <div
            className="hero-poster-bg"
            style={{ backgroundImage: `url(${heroBgPoster})` }}
            role="img"
            aria-label="Hero background"
          />
        )}

        {/* Gradient overlay — darkens bottom so text stays readable */}
        <div className="hero-video-gradient-overlay" />
      </div>

      {/* ── Hero Content ── */}
      <div className="hero-inner">
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

        <div className="hero-dashboard-wrapper">
          {/* Spinning rings — desktop only (too heavy for mobile GPU) */}
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
