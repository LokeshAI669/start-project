import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import StatsBadge from './StatsBadge';
import CTAButtons from './CTAButtons';
import StatusBar from './StatusBar';
import FeatureCard from './FeatureCard';

import heroBgVideo from '../../assets/hero-bg-robot-final.mp4';
import heroBgMobileVideo from '../../assets/hero-bg-robot.mp4';
import heroBgPoster from '../../assets/hero-bg-robot-poster.webp';

export default function Hero({ navigate }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const videoRef = useRef(null);
  const [showFallbackButton, setShowFallbackButton] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
      console.warn("Data Saver mode enabled, skipping autoplay.");
      setShowFallbackButton(true);
      return;
    }

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay blocked:", err);
        setShowFallbackButton(true);
      });
    }
  }, []);

  return (
    <section className="hero" id="hero">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        className="hero-video-bg"
        poster={heroBgPoster}
        preload={isMobile ? "metadata" : "auto"}
      >
        <source src={heroBgMobileVideo} media="(max-width: 768px)" type="video/mp4" />
        <source src={heroBgVideo} type="video/mp4" />
      </video>
      
      <div className="hero-video-gradient-overlay" aria-hidden="true"></div>
      
      {showFallbackButton && (
        <div className="hero-video-fallback-overlay">
          <button 
            onClick={() => { 
              if(videoRef.current) videoRef.current.play(); 
              setShowFallbackButton(false); 
            }} 
            className="btn-play-fallback"
          >
            <PlayCircle size={48} />
            <span>Play Background Video</span>
          </button>
        </div>
      )}

      <div className="hero-inner">
        <motion.div 
          className="hero-text"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="hero-tag">
            Project Request Platform
          </motion.div>
          
          <motion.h1 variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
            Where Student Projects<br/>
            <span className="typewriter-wrap">
              <span className="typewriter-text" id="typewriter">Get Approved</span><span className="typewriter-cursor"></span>
            </span>
          </motion.h1>
          
          <motion.p variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
            Submit project ideas, schedule meetings, track approvals in real time — a streamlined platform built for students and supervisors who value clarity and speed.
          </motion.p>
          
          <StatsBadge count="250+" label="students" />
          <CTAButtons navigate={navigate} />
          <StatusBar />
        </motion.div>

        <div className="hero-dashboard-wrapper">
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
          <FeatureCard 
            title="Interview Readiness"
            percentage="86%"
            icon={CheckCircle}
            metrics={[
              { label: 'Communication', value: '90%' },
              { label: 'Technical Skills', value: '84%' },
              { label: 'Confidence', value: '82%' }
            ]}
            badgeText="AI-Powered Analysis · Live"
          />
        </div>
      </div>
    </section>
  );
}
