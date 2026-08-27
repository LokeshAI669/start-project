import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutList, Mail, Activity, CalendarDays, Sun, Moon, CheckCircle, Sparkles, ArrowRight, Mic, BriefcaseBusiness, Users, BrainCircuit, ChevronRight, Code2, Database, PlayCircle } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useScroll } from 'motion/react';

import JobZenLogo from '../components/JobZenLogo';
import { AuthContext } from '../context/AuthContext';
import './HireProjectLanding.css';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';

/* ─────────────────────────────────────────────────────────────
   SPLASH INTRO — plays once per session, then reveals the page
   ───────────────────────────────────────────────────────────── */
const PROJECTS = [
  { icon: '🛒', iconClass: 'blue',  name: 'E-Commerce Mobile App',      meta: '₹1,50,000  ·  Jul 20, 2026', badge: 'Accepted', badgeClass: 'accepted' },
  { icon: '🤖', iconClass: 'gold',  name: 'AI Chatbot System',           meta: '₹80,000   ·  Jul 22, 2026', badge: 'Pending',  badgeClass: 'pending'  },
  { icon: '📊', iconClass: 'green', name: 'Data Analytics Dashboard',    meta: '₹2,00,000 ·  Jul 25, 2026', badge: 'Accepted', badgeClass: 'accepted' },
  { icon: '🎓', iconClass: 'blue',  name: 'LMS Portal',                  meta: '₹1,20,000 ·  Jul 28, 2026', badge: 'In Review', badgeClass: 'review'  },
];

function SplashIntro({ onDone }) {
  const overlayRef   = useRef(null);
  const fillRef      = useRef(null);
  const cardRefs     = useRef([]);
  const statusRef    = useRef(null);
  const doneRef      = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    let raf = null;
    let startTime = null;
    const TOTAL_DURATION = 2600; // ms until exit begins

    // ── Animate progress bar with rAF ──────────────────────
    const animateBar = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      if (fillRef.current) {
        fillRef.current.style.width = pct + '%';
        if (pct >= 100) fillRef.current.classList.add('done');
      }
      if (pct < 100) raf = requestAnimationFrame(animateBar);
    };
    raf = requestAnimationFrame(animateBar);

    // ── Fly in each card with staggered delays ─────────────
    const cardDelays = [400, 750, 1100, 1450];
    const cardTimers = cardDelays.map((delay, i) =>
      setTimeout(() => {
        const el = cardRefs.current[i];
        if (el) el.classList.add('fly-in');
      }, delay)
    );

    // ── Begin exit sequence ────────────────────────────────
    const exitTimer = setTimeout(() => {
      // fly cards out in reverse order
      [...cardRefs.current].reverse().forEach((el, i) => {
        setTimeout(() => {
          if (el) el.classList.add('fly-out');
        }, i * 70);
      });

      // after cards leave, fade the overlay
      setTimeout(() => {
        const overlay = overlayRef.current;
        if (overlay) overlay.classList.add('splash-exit');
        // after fade completes, unmount
        setTimeout(() => {
          if (!doneRef.current) { doneRef.current = true; onDone(); }
        }, 750);
      }, 350);
    }, TOTAL_DURATION);

    return () => {
      cancelAnimationFrame(raf);
      cardTimers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <div className="splash-overlay" ref={overlayRef} aria-live="polite" aria-label="Loading JobZen">
      {/* ── Decorative background ── */}
      <div className="splash-bg-grid" />
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />

      {/* ── Logo ── */}
      <div className="splash-logo-wrap">
        <JobZenLogo theme="dark" size="md" />
        <span className="splash-logo-tag">Project Request Platform</span>
      </div>

      {/* ── Progress bar ── */}
      <div className="splash-progress-wrap">
        <div className="splash-progress-label">
          <span>Loading projects</span>
          <span ref={statusRef}>—</span>
        </div>
        <div className="splash-progress-track">
          <div className="splash-progress-fill" ref={fillRef} />
        </div>
      </div>

      {/* ── Project cards ── */}
      <div className="splash-cards">
        {PROJECTS.map((p, i) => (
          <div
            key={i}
            className="splash-card"
            ref={el => cardRefs.current[i] = el}
          >
            <div className={`splash-card-icon ${p.iconClass}`}>{p.icon}</div>
            <div className="splash-card-info">
              <div className="splash-card-name">{p.name}</div>
              <div className="splash-card-meta">{p.meta}</div>
            </div>
            <span className={`splash-badge ${p.badgeClass}`}>{p.badge}</span>
          </div>
        ))}
      </div>

      {/* ── Status line ── */}
      <div className="splash-status">
        <span className="splash-status-dot" />
        System Online · 250+ Projects Delivered
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED FEATURE CARD
   ───────────────────────────────────────────────────────────── */
function AnimatedFeatureCard({ Icon, title, desc, index }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);

  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    setIsHovered(false);
    animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
  };

  // Subtly parallax the icon box slower than the rest of the card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-12, 12]);

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        ref={cardRef}
        className="feature-card"
        initial={{ opacity: 0, y: 30, rotateX: 20 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.12 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isTouch && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isTouch ? 0 : rotateX,
          rotateY: isTouch ? 0 : rotateY,
          transformStyle: "preserve-3d",
          position: "relative",
          zIndex: isHovered ? 10 : 1
        }}
        animate={isHovered ? { scale: 1.02, z: 20 } : { scale: 1, z: 0 }}
      >
        <motion.div 
          className="feature-icon-wrap2" 
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            y: parallaxY, 
            transform: 'translateZ(30px)', 
            willChange: 'transform, box-shadow'
          }}
          animate={isHovered ? {
            boxShadow: [
              "0 0 0 0px rgba(59, 130, 246, 0.4)",
              "0 0 0 20px rgba(59, 130, 246, 0)"
            ]
          } : {
            boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)"
          }}
          transition={isHovered ? { duration: 1.5, repeat: Infinity, ease: "easeOut" } : { duration: 0.3 }}
        >
          <Icon color="var(--blue)" size={24} />
        </motion.div>
        
        <div className="feature-title" style={{ transform: "translateZ(15px)" }}>{title}</div>
        <p className="feature-desc" style={{ transform: "translateZ(5px)" }}>{desc}</p>
      </motion.div>
    </div>
  );
}



/* ─────────────────────────────────────────────────────────────
   ANIMATED STAT — whileInView counter card
   ───────────────────────────────────────────────────────────── */
function AnimatedStat({ value, label, index = 0 }) {
  const match = value.match(/(\D*)(\d+)(\D*)/);
  const prefix = match ? match[1] : '';
  const numValue = match ? parseInt(match[2], 10) : 0;
  const suffix = match ? match[3] : value;
  const hasNum = !!match;

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(hasNum ? prefix + '0' + suffix : value);

  useEffect(() => {
    if (!hasNum) return;
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(prefix + latest + suffix);
    });
    return unsubscribe;
  }, [rounded, prefix, suffix, hasNum]);

  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isTouch) return;
    animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
  };

  const handleViewportEnter = () => {
    if (hasNum) {
      animate(count, numValue, { duration: 1.2, delay: index * 0.15, ease: "easeOut" });
    }
  };

  return (
    <div className="stat-showcase-item" style={{ perspective: 1000, padding: 0 }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        onViewportEnter={handleViewportEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={!isTouch ? { scale: 1.03, y: -4, boxShadow: "0 15px 35px rgba(59, 130, 246, 0.12)" } : {}}
        style={{
          rotateX: isTouch ? 0 : rotateX,
          rotateY: isTouch ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          padding: '30px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}
      >
        <div className="stat-showcase-num" style={{ transform: 'translateZ(20px)' }}>{displayValue}</div>
        <div className="stat-showcase-label" style={{ transform: 'translateZ(10px)' }}>{label}</div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HP PROJECTS DATA
   ───────────────────────────────────────────────────────────── */
const HP_PROJECTS = [
  { title: 'COVID-19 Analysis',    category: 'Data Analytics',         image: '/projects/covid-dashboard.jpg', color: '#5CFFE1', stat: 'Python + Power BI' },
  { title: 'Netflix EDA',    category: 'Exploratory Data Analysis', image: '/projects/netflix-analysis.jpg', color: '#FF8A5B', stat: 'Pandas + Seaborn' },
  { title: 'AI Interview Coach',     category: 'Artificial Intelligence',      image: '/projects/ai-coach.jpg', color: '#9B5CFF', stat: '92% accuracy' },
  { title: 'Fintech Dashboard', category: 'Web Application',     image: '/projects/fintech.jpg', color: '#D8FF5C', stat: '12K users' },
];
const HP_PROJECTS_DUP = [...HP_PROJECTS, ...HP_PROJECTS];

const HP_CATEGORIES = [
  { icon: <BrainCircuit size={22} />, title: 'Artificial Intelligence', color: '#9B5CFF' },
  { icon: <Database size={22} />,     title: 'Data Science',            color: '#5CFFE1' },
  { icon: <Code2 size={22} />,        title: 'Web Development',         color: '#FF8A5B' },
  { icon: <BriefcaseBusiness size={22} />, title: 'Career Projects',    color: '#D8FF5C' },
];

/* ─────────────────────────────────────────────────────────────
   HP PROJECT CARD
   ───────────────────────────────────────────────────────────── */
function HpProjectCard({ project, index }) {
  const navigate = useNavigate();
  return (
    <motion.article
      className="hp-project-card"
      style={{ '--accent': project.color }}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -14, rotate: index % 2 === 0 ? 1.5 : -1.5, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="hp-project-image-wrap">
        <img src={project.image} alt={project.title} loading="lazy" />
        <div className="hp-image-overlay" />
        <span className="hp-project-stat">{project.stat}</span>
      </div>
      <div className="hp-project-content">
        <p className="hp-project-category">{project.category}</p>
        <h3 className="hp-project-title">{project.title}</h3>
        <button className="hp-project-btn" onClick={() => navigate('/browse')}>
          View project <ArrowRight size={14} />
        </button>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────────────────────
   HP CATEGORY CARD
   ───────────────────────────────────────────────────────────── */
function HpCategoryCard({ icon, title, count, color, index = 0 }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    animate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        className="hp-category-card"
        style={{
          '--category-color': color,
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          willChange: 'transform'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="hp-category-icon"
          animate={isHovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{ transform: 'translateZ(30px)' }}
        >
          {icon}
        </motion.div>
        <h3 className="hp-category-title" style={{ transform: 'translateZ(20px)' }}>{title}</h3>
        
        <motion.div 
          className="hp-category-arrow"
          initial={false}
          animate={isHovered ? { x: 4, opacity: 1 } : { x: -6, opacity: 0 }}
          style={{ transform: 'translateZ(15px)', display: 'flex', alignItems: 'center' }}
        >
          <ArrowRight size={17} />
        </motion.div>

        {/* Soft glow/shadow matching accent color */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: color,
            filter: 'blur(45px)',
            zIndex: -1,
            pointerEvents: 'none',
            borderRadius: '18px',
            willChange: 'opacity'
          }}
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  // Show splash only once per browser session
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem('jz_splash_seen')) return false;
    return true;
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('jz_splash_seen', '1');
    setShowSplash(false);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // ── Navbar scroll effect (passive listener = no jank) ──
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if (window.scrollY > 20) navbar?.classList.add('scrolled');
      else navbar?.classList.remove('scrolled');
    };
    // passive:true tells the browser we won't call preventDefault(),
    // so it can scroll immediately without waiting for JS to finish.
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Scroll Progress Bar (rAF-throttled, passive listener) ──
    const progressBar = document.getElementById('scroll-progress');
    let rafId = null;
    const onScrollProgress = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (progressBar) {
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
          progressBar.style.width = pct + '%';
        }
      });
    };
    window.addEventListener('scroll', onScrollProgress, { passive: true });

    // ── Typewriter Effect ──
    const tw = document.getElementById('typewriter');
    const words = ['Get Approved', 'Get Reviewed', 'Succeed'];
    let wIdx = 0, cIdx = 0, isDeleting = false;
    let twTimeout;

    const type = () => {
      if (!tw) return;
      const current = words[wIdx];
      tw.innerText = current.substring(0, cIdx);
      if (!isDeleting && cIdx === current.length) {
        isDeleting = true;
        twTimeout = setTimeout(type, 2000);
      } else if (isDeleting && cIdx === 0) {
        isDeleting = false;
        wIdx = (wIdx + 1) % words.length;
        twTimeout = setTimeout(type, 500);
      } else {
        cIdx += isDeleting ? -1 : 1;
        twTimeout = setTimeout(type, isDeleting ? 50 : 100);
      }
    };
    if (tw) type();

    // ── Scroll Reveal — IntersectionObserver (runs OFF the main thread) ──
    // Using IntersectionObserver instead of a scroll listener is far more
    // performant: the browser notifies us asynchronously without running
    // JS on every scroll pixel, completely eliminating reveal-related jank.
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once visible we don't need to keep observing it
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      revealObserver.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll, { passive: true });
      window.removeEventListener('scroll', onScrollProgress, { passive: true });
      if (rafId) cancelAnimationFrame(rafId);
      revealObserver.disconnect();
      clearTimeout(twTimeout);
    };
  }, []);

  return (
    <>
      {/* ── Cinematic Splash Intro (once per session) ── */}
      {showSplash && <SplashIntro onDone={handleSplashDone} />}

      {/* ── Noise texture ── */}
      <div className="hp-noise" />

      <div id="scroll-progress"></div>

      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Page wrapper gives grid-overlay a positioned ancestor so position:absolute works */}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
      <div className="grid-overlay"></div>

      <Header theme={theme} toggleTheme={toggleTheme} navigate={navigate} />
      
      <Hero navigate={navigate} />

      <section className="stats-section-wrap">
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="stats-showcase">
            <AnimatedStat value="250+" label="Students Helped" index={0} />
            <AnimatedStat value="7"    label="Auto Emails" index={1} />
            <AnimatedStat value="99%"  label="Uptime" index={2} />
            <AnimatedStat value="2 Days" label="To Submit" index={3} />
          </div>
        </div>
      </section>

      {/* ══ FLOWING PROJECTS BELT ══ */}
      <section className="hp-flow-section">
        <div className="hp-flow-header">
          Live Projects <span className="hp-dot" />
        </div>
        <div className="hp-flow-area">
          <div className="hp-flow-glow" />
          <motion.div
            className="hp-project-track"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {HP_PROJECTS_DUP.map((p, i) => (
              <HpProjectCard key={`${p.title}-${i}`} project={p} index={i} />
            ))}
          </motion.div>
          <div className="hp-flow-fade hp-flow-fade-left" />
          <div className="hp-flow-fade hp-flow-fade-right" />
        </div>
      </section>

      {/* ══ CATEGORIES ══ */}
      <div className="hp-category-section">
        <div className="hp-section-heading">
          <div>
            <p className="hp-section-label">Explore the ecosystem</p>
            <h2 className="hp-section-h2">Ideas in motion.</h2>
          </div>
          <motion.button
            className="hp-view-all"
            initial="rest"
            whileHover="hover"
            animate="rest"
            onClick={() => navigate('/browse')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            View all projects 
            <motion.span variants={{ rest: { x: 0 }, hover: { x: 4 } }}>
              <ChevronRight size={16} style={{ display: 'block' }} />
            </motion.span>
          </motion.button>
        </div>
        <div className="hp-category-grid">
          {HP_CATEGORIES.map((c, i) => (
            <HpCategoryCard key={c.title} {...c} index={i} />
          ))}
        </div>
      </div>

      {/* ══ FEATURED PROJECTS ══ */}
      <div className="hp-featured-section">
        <div className="hp-section-heading">
          <div>
            <p className="hp-section-label">Featured work</p>
            <h2 className="hp-section-h2">Projects worth seeing.</h2>
          </div>
        </div>
        <div className="hp-featured-grid">
          {HP_PROJECTS.slice(0, 3).map((p, i) => (
            <HpProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>

      <section className="section bg-alt">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-tag"
          >Why JobZen</motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-title"
          >Everything students and admins need</motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-desc"
          >From first submission to final confirmation — JobZen keeps everyone perfectly in sync, automatically.</motion.p>

          <div className="features-grid" style={{marginTop:'50px'}}>
            {[
              { Icon: LayoutList, title: 'Structured Submissions',  desc: 'A guided 2-step form captures project name, budget, description, and preferred meeting time with full validation.' },
              { Icon: Mail,       title: '7 Automated Emails',       desc: 'Key actions trigger beautifully formatted emails — zero manual follow-up needed.' },
              { Icon: Activity,   title: 'Real-Time Status',         desc: 'Students see Pending, Accepted, or Denied instantly — with a live acceptance rate gauge and timeline.' },
              { Icon: CalendarDays, title: 'Easy Rescheduling',      desc: 'Denied? Pick a new date and time in one click. Admin gets notified automatically, no follow-up needed.' },
            ].map(({ Icon, title, desc }, i) => (
              <AnimatedFeatureCard key={title} Icon={Icon} title={title} desc={desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-tag"
          >How It Works</motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-title"
          >Three simple steps</motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-desc"
          >Students submit, admins decide, everyone gets notified — automatically and beautifully.</motion.p>

          <div className="steps-grid" style={{marginTop:'50px'}}>
            <div className="steps-connector"></div>
            {[
              { num: '1', title: 'Register & Submit', desc: 'Create a free student account, fill in your project details, pick a meeting time, and submit in under 2 days.' },
              { num: '2', title: 'Admin Reviews',     desc: 'The admin sees your request instantly, reviews all details in a clean dashboard, and makes a decision.' },
              { num: '3', title: 'Get Notified',      desc: 'You receive a beautifully formatted email with the decision and confirmed meeting time — all automated.' },
            ].map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                className="step-card"
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, type: 'spring', stiffness: 180, damping: 18 }}
                whileHover={{ y: -6 }}
              >
                <div className="step-num-big">{num}</div>
                <div className="step-title">{title}</div>
                <p className="step-desc">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section bg-alt">
        <div style={{maxWidth:'600px',margin:'0 auto',position:'relative',zIndex:'1'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 160 }}
            style={{ textAlign: 'center' }}
          >
            <div className="section-tag" style={{justifyContent:'center'}}>Get Started</div>
            <h2 className="section-title" style={{fontSize:'clamp(2rem,4vw,3rem)',marginTop:8}}>
              Ready to get your project <span className="gradient-text-cta">approved?</span>
            </h2>
            <p className="section-desc" style={{margin:'16px auto 36px',maxWidth:'420px',fontSize:'1rem'}}>
              Join students already using JobZen to move faster and more professionally.
            </p>
            <div className="cta-glow-btn">
              <motion.button
                onClick={() => navigate('/request')}
                className="btn btn-primary btn-lg"
                style={{fontSize:'16px',padding:'16px 40px'}}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                Submit Request <ArrowRight size={18} style={{display:'inline',marginLeft:6,verticalAlign:'middle'}} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><JobZenLogo theme={theme} size="sm" /></div>
          <div className="footer-links">
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/www-jobzen-968a19421/" target="_blank" rel="noreferrer" className="footer-social-link" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/jobz_en?igsh=Y2s3enVpcjNrZ3Bo" target="_blank" rel="noreferrer" className="footer-social-link" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>

            {/* WhatsApp Channel */}
            <a href="https://whatsapp.com/channel/0029VbD9lzJ5K3zXBD76Ij2x" target="_blank" rel="noreferrer" className="footer-social-link" title="WhatsApp Channel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
            </a>

            {/* Website */}
            <a href="https://wwwJobZen.co.in" target="_blank" rel="noreferrer" className="footer-social-link" title="Website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </a>
          </div>
          <div className="footer-copy">© 2026 JobZen · All rights reserved</div>
        </div>
      </footer>
      </div>{/* end page-wrapper */}
    </>
  );
}
