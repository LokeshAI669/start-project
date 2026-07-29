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
              <div className="stat-showcase-num">2 Days</div>
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
              <p className="step-desc">Create a free student account, fill in your project details, pick a meeting time, and submit in under 2 days.</p>
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
          <div className="footer-links">
            {/* LinkedIn */}
            <a href="https://www.linkedin.com/in/www-jobzen-968a19421/" target="_blank" rel="noreferrer" className="footer-social-link" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </a>

            {/* Instagram */}
            <a href="https://www.instagram.com/jobz_en?igsh=Y2s3enVpcjNrZ3Bo" target="_blank" rel="noreferrer" className="footer-social-link" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              <span>Instagram</span>
            </a>

            {/* WhatsApp Channel */}
            <a href="https://whatsapp.com/channel/0029VbD9lzJ5K3zXBD76Ij2x" target="_blank" rel="noreferrer" className="footer-social-link" title="WhatsApp Channel">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Website */}
            <a href="https://wwwJobZen.co.in" target="_blank" rel="noreferrer" className="footer-social-link" title="Website">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>Website</span>
            </a>
          </div>
          <div className="footer-copy">© 2026 JobZen · All rights reserved</div>
        </div>
      </footer>
    </>
  );
}
