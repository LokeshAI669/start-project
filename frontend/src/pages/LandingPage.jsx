import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutList, Mail, Activity, CalendarDays, Sun, Moon } from 'lucide-react';

import JobZenLogo from '../components/JobZenLogo';

export default function LandingPage() {

  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  };

  useEffect(() => {
    // ── Navbar scroll effect ──
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if (window.scrollY > 20) navbar?.classList.add('scrolled');
      else navbar?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);

    // ── Live Dashboard Simulation ──
    const latencyEl = document.getElementById('latency-val');
    const rateEl = document.getElementById('panel-rate');
    const barEl = document.getElementById('acceptance-bar');
    
    let rate = 94;
    if (rateEl && barEl) {
      rateEl.innerText = rate + '%';
      barEl.style.width = rate + '%';
    }

    const simInterval = setInterval(() => {
      if (latencyEl) latencyEl.innerText = Math.floor(Math.random() * 20 + 8) + 'ms';
      if (rateEl && barEl && Math.random() > 0.5) {
        rate = Math.max(90, Math.min(99, rate + (Math.floor(Math.random() * 5) - 2)));
        rateEl.innerText = rate + '%';
        barEl.style.width = rate + '%';
      }
      const row1Badge = document.querySelector('#row-1 .badge');
      if (row1Badge && Math.random() > 0.8) {
         if (row1Badge.classList.contains('badge-pending')) {
             row1Badge.className = 'badge badge-accepted';
             row1Badge.innerText = 'Accepted';
         } else {
             row1Badge.className = 'badge badge-pending';
             row1Badge.innerText = 'Pending';
         }
      }
    }, 1500);

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

    // ── Scroll Reveal ──
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
      const wh = window.innerHeight;
      reveals.forEach(r => {
        if (r.getBoundingClientRect().top < wh - 50) r.classList.add('visible');
      });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', revealOnScroll);
      clearInterval(simInterval);
      clearTimeout(twTimeout);
    };
  }, []);

  return (
    <>
      <div id="scroll-progress"></div>

      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="grid-overlay"></div>

      <nav className="pub-navbar" id="navbar">
        <Link to="/" className="pub-navbar-logo">
          <JobZenLogo theme={theme} size="md" />
        </Link>
        <div className="pub-navbar-links">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'} style={{padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s ease'}}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="nav-divider"></div>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started →</Link>
        </div>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-tag"> Project Request Platform</div>
            <h1>Where Student Projects<br/>
              <span className="typewriter-wrap">
                <span className="typewriter-text" id="typewriter">Get Approved</span><span className="typewriter-cursor"></span>
              </span>
            </h1>
            <p>Submit project ideas, schedule meetings, track approvals in real time — a streamlined platform built for students and supervisors who value clarity and speed.</p>
            <div style={{display:'inline-block', padding:'10px 18px', background:'rgba(255, 255, 255, 0.03)', borderRadius:'10px', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:'14px', fontWeight:'500', marginBottom:'32px', marginTop:'12px', letterSpacing:'0.02em'}}>
              We have successfully delivered projects to over 250+ students.
            </div>
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
              <Link to="/login" className="btn btn-ghost  btn-lg">Sign In</Link>
            </div>
            <div className="hero-trust" style={{display:'flex',alignItems:'center',gap:'20px',marginTop:'36px',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 12px var(--green)',animation:'liveDot 2s infinite'}}></div>
                <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'10.5px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em'}}>System Online</span>
              </div>
              <div style={{width:'1px',height:'14px',background:'var(--border)'}}></div>
              <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'10.5px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em'}}>Real-Time Tracking</span>
              <div style={{width:'1px',height:'14px',background:'var(--border)'}}></div>
              <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'10.5px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em'}}>Free Forever</span>
            </div>
          </div>

          <div className="hero-panel" style={{position:'relative'}}>
            <div className="float-badge float-badge-1">
              <span style={{color:'var(--green)',fontSize:'16px'}}></span>
              <div>
                <div style={{fontSize:'11px',fontWeight:'700',color:'var(--text-primary)'}}>Request Accepted</div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'9px',color:'var(--text-faint)'}}>Email sent · just now</div>
              </div>
            </div>
            <div className="float-badge float-badge-2">
              <span style={{color:'var(--orange)',fontSize:'16px'}}></span>
              <div>
                <div style={{fontSize:'11px',fontWeight:'700',color:'var(--text-primary)'}}>New Submission</div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'9px',color:'var(--text-faint)'}}>Admin notified</div>
              </div>
            </div>

            <div className="hero-panel-header">
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:'10px',letterSpacing:'.08em'}}>LIVE DASHBOARD</span>
                <div className="live-indicator"><div className="live-dot"></div>CONNECTED</div>
              </div>
              <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'9px',color:'var(--text-faint)'}} id="panel-time">--:--:--</div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'16px'}}>
              <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'10px',padding:'11px 12px',textAlign:'center',transition:'border-color 0.3s ease'}} id="stat-total">
                <div style={{fontSize:'1.4rem',fontWeight:'900',color:'var(--text-primary)',letterSpacing:'-0.04em'}} id="panel-total">250+</div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'8px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.06em',marginTop:'2px'}}>Total</div>
              </div>
              <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'10px',padding:'11px 12px',textAlign:'center',transition:'border-color 0.3s ease'}} id="stat-pending">
                <div style={{fontSize:'1.4rem',fontWeight:'900',color:'var(--orange)',letterSpacing:'-0.04em'}} id="panel-pending">10</div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'8px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.06em',marginTop:'2px'}}>Pending</div>
              </div>
              <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:'10px',padding:'11px 12px',textAlign:'center',transition:'border-color 0.3s ease'}}>
                <div style={{fontSize:'1.4rem',fontWeight:'900',color:'var(--green)',letterSpacing:'-0.04em'}} id="panel-rate">94%</div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'8px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.06em',marginTop:'2px'}}>Accept Rate</div>
              </div>
            </div>

            <div id="panel-rows">
              <div className="hero-req-row" id="row-0">
                <div>
                  <div className="hero-req-name">E-Commerce Mobile App</div>
                  <div className="hero-req-meta">₹150,000 · July 20, 2026</div>
                </div>
                <span className="badge badge-accepted">Accepted</span>
              </div>
              <div className="hero-req-row" id="row-1">
                <div>
                  <div className="hero-req-name">AI Chatbot System</div>
                  <div className="hero-req-meta">₹80,000 · July 22, 2026</div>
                </div>
                <span className="badge badge-pending">Pending</span>
              </div>
              <div className="hero-req-row" id="row-2">
                <div>
                  <div className="hero-req-name">Data Analytics Dashboard</div>
                  <div className="hero-req-meta">₹200,000 · July 25, 2026</div>
                </div>
                <span className="badge badge-accepted">Accepted</span>
              </div>
            </div>

            <div style={{marginTop:'14px',padding:'11px 14px',background:'var(--bg-elevated)',borderRadius:'10px',border:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'9px',color:'var(--text-faint)',textTransform:'uppercase',letterSpacing:'.07em'}}>AP-SOUTH-1 · LATENCY: <span className="latency-blink" id="latency-val">12ms</span></div>
                <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:'9px',color:'var(--green)'}}>UPTIME 99.9%</div>
              </div>
              <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'99px',overflow:'hidden'}}>
                <div id="acceptance-bar" style={{height:'100%',width:'0%',background:'linear-gradient(90deg,var(--orange),var(--green))',borderRadius:'99px',transition:'width 1.5s ease-out'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:'0 52px',marginTop:'-20px',marginBottom:'0',position:'relative',zIndex:'1'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="stats-showcase reveal visible">
            <div className="stat-showcase-item">
              <div className="stat-showcase-num">100%</div>
              <div className="stat-showcase-label">Digital Process</div>
            </div>
            <div className="stat-showcase-item">
              <div className="stat-showcase-num">7</div>
              <div className="stat-showcase-label">Auto Notifications</div>
            </div>
            <div className="stat-showcase-item">
              <div className="stat-showcase-num">99%</div>
              <div className="stat-showcase-label">Uptime</div>
            </div>
            <div className="stat-showcase-item">
              <div className="stat-showcase-num">2 min</div>
              <div className="stat-showcase-label">To Submit</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-alt">
        <div className="section-inner">
          <div className="section-tag reveal visible">Why JobZen</div>
          <h2 className="section-title reveal visible">Everything students and admins need</h2>
          <p className="section-desc reveal visible">From first submission to final confirmation — JobZen keeps everyone perfectly in sync, automatically.</p>
          <div className="features-grid" style={{marginTop:'50px'}}>
            <div className="feature-card reveal visible">
              <div className="feature-icon-wrap2" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <LayoutList color="var(--blue)" size={24} />
              </div>
              <div className="feature-title">Structured Submissions</div>
              <p className="feature-desc">A guided 2-step form captures project name, budget, description, and preferred meeting time with full validation.</p>
            </div>
            <div className="feature-card reveal visible">
              <div className="feature-icon-wrap2" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Mail color="var(--blue)" size={24} />
              </div>
              <div className="feature-title">7 Automated Emails</div>
              <p className="feature-desc">Every action triggers a beautiful email — registration, submission, accept, deny, reschedule, and password reset.</p>
            </div>
            <div className="feature-card reveal visible">
              <div className="feature-icon-wrap2" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Activity color="var(--blue)" size={24} />
              </div>
              <div className="feature-title">Real-Time Status</div>
              <p className="feature-desc">Students see Pending, Accepted, or Denied instantly — with a live acceptance rate gauge and timeline.</p>
            </div>
            <div className="feature-card reveal visible">
              <div className="feature-icon-wrap2" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <CalendarDays color="var(--blue)" size={24} />
              </div>
              <div className="feature-title">Easy Rescheduling</div>
              <p className="feature-desc">Denied? Pick a new date and time in one click. Admin gets notified automatically, no follow-up needed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-tag reveal visible">How It Works</div>
          <h2 className="section-title reveal visible">Three simple steps</h2>
          <p className="section-desc reveal visible">Students submit, admins decide, everyone gets notified — automatically and beautifully.</p>
          <div className="steps-grid" style={{marginTop:'50px'}}>
            <div className="steps-connector"></div>
            <div className="step-card reveal-scale visible">
              <div className="step-num-big">1</div>
              <div className="step-title">Register &amp; Submit</div>
              <p className="step-desc">Create a free student account, fill in your project details, pick a meeting time, and submit in under 2 minutes.</p>
            </div>
            <div className="step-card reveal-scale visible">
              <div className="step-num-big">2</div>
              <div className="step-title">Admin Reviews</div>
              <p className="step-desc">The admin sees your request instantly, reviews all details in a clean dashboard, and makes a decision.</p>
            </div>
            <div className="step-card reveal-scale visible">
              <div className="step-num-big">3</div>
              <div className="step-title">Get Notified</div>
              <p className="step-desc">You receive a beautifully formatted email with the decision and confirmed meeting time — all automated.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section bg-alt">
        <div style={{maxWidth:'600px',margin:'0 auto',position:'relative',zIndex:'1'}}>
          <div className="section-tag reveal visible" style={{justifyContent:'center'}}>Get Started</div>
          <h2 className="section-title reveal visible" style={{fontSize:'clamp(2rem,4vw,3rem)'}}>Ready to get your project <span className="gradient-text-cta">approved?</span></h2>
          <p className="section-desc reveal visible" style={{margin:'0 auto 36px',maxWidth:'420px',fontSize:'1rem'}}>Join students already using JobZen to move faster and more professionally.</p>
          <div className="cta-glow-btn reveal visible">
            <Link to="/register" className="btn btn-primary btn-lg" style={{fontSize:'16px',padding:'16px 40px'}}>Create Free Account →</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo"><JobZenLogo theme={theme} size="sm" /></div>
          <div className="footer-links"></div>
          <div className="footer-copy">© 2026 JobZen · All rights reserved</div>
        </div>
      </footer>
    </>
  );
}
