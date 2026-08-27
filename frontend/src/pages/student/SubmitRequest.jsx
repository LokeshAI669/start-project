import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Grid2X2,
  Home,
  LayoutDashboard,
  Paperclip,
  PlusCircle,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import './SubmitRequest.css';

/* ─────────────────────────────────────────────────────────────
   STEP DEFINITIONS
   ───────────────────────────────────────────────────────────── */
const STEPS = [
  { n: 1, label: 'Your Info',     desc: 'Name & contact' },
  { n: 2, label: 'Project',       desc: 'Details & budget' },
  { n: 3, label: 'Meeting',       desc: 'Schedule & submit' },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function SubmitRequest() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const catalogId = searchParams.get('catalog_id');

  /* form state */
  const [step, setStep]                     = useState(1);
  const [name, setName]                     = useState(user?.name || '');
  const [email, setEmail]                   = useState(user?.email || '');
  const [projectName, setProjectName]       = useState('');
  const [budget, setBudget]                 = useState('');
  const [currency, setCurrency]             = useState('₹');
  const [description, setDescription]       = useState('');
  const [timeVal, setTimeVal]               = useState('10:00');
  const [ampm, setAmpm]                     = useState('AM');
  const [preferredTime, setPreferredTime]   = useState('10:00 AM');
  const [preferredDate, setPreferredDate]   = useState('');
  const [attachment, setAttachment]         = useState(null);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);

  /* pre-fill from user context */
  useEffect(() => {
    if (user) {
      if (user.name  && !name)  setName(user.name);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  /* pre-fill from catalog */
  useEffect(() => {
    if (!catalogId) return;
    setLoading(true);
    api('GET', `/api/catalog/${catalogId}`)
      .then(data => {
        if (!data) return;
        setProjectName(data.title || '');
        let desc = data.short_description || '';
        if (data.full_description) desc += '\n\n' + data.full_description;
        if (data.objectives?.length) desc += '\n\nObjectives:\n- ' + data.objectives.join('\n- ');
        if (data.tech_stack)        desc += '\n\nTech Stack: ' + data.tech_stack;
        setDescription(desc);
      })
      .catch(err => console.error('Catalog fetch failed:', err))
      .finally(() => setLoading(false));
  }, [catalogId]);

  /* ── Validation ── */
  const validate = (s) => {
    if (s === 1) {
      if (!name.trim())  return 'Full name is required.';
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'A valid email is required.';
    }
    if (s === 2) {
      if (!projectName.trim())                           return 'Project name is required.';
      if (budget === '' || isNaN(+budget) || +budget < 0) return 'Enter a valid budget.';
      if (!description.trim() || description.length < 20) return 'Description must be at least 20 characters.';
    }
    if (s === 3) {
      if (!preferredDate) return 'Preferred meeting date is required.';
      if (!preferredTime) return 'Preferred meeting time is required.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validate(step);
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(3);
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('email', email.trim());
      fd.append('project_name', projectName.trim());
      fd.append('budget', Number(budget));
      fd.append('currency', currency);
      fd.append('description', description.trim());
      fd.append('preferred_date', preferredDate);
      fd.append('preferred_time', preferredTime);
      if (catalogId)  fd.append('catalog_project_id', catalogId);
      if (attachment) fd.append('attachment', attachment);
      await api('POST', '/api/requests', fd);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false); setStep(1);
    setName(''); setEmail(''); setProjectName('');
    setBudget(''); setDescription('');
    setPreferredDate(''); setPreferredTime('10:00 AM');
    setTimeVal('10:00'); setAmpm('AM'); setAttachment(null);
  };

  /* ══════════════════════════════════════════════════════════════
     SUCCESS SCREEN
     ══════════════════════════════════════════════════════════════ */
  if (success) return (
    <div className="sr-wrap">
      <Sidebar active={null} />
      <div className="sr-success">
        <motion.div
          className="sr-success-card"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="sr-success-icon">ðŸŽ‰</div>
          <h2>Request Submitted!</h2>
          <p>
            Thank you <strong style={{ color: '#f5f7ff' }}>{name}</strong>. Your project
            request has been sent to our team.<br />
            We've sent a confirmation to <strong style={{ color: '#f5f7ff' }}>{email}</strong>.
          </p>
          <div className="sr-success-btns">
            <Link to="/" className="sr-btn-primary">
              <Home size={17} /> Return Home
            </Link>
            <button className="sr-btn-ghost" onClick={resetForm}>
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════
     MAIN FORM
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="sr-wrap">
      <Sidebar active="request" />

      <main className="sr-main">
        {/* Header */}
        <header className="sr-header">
          <div>
            <p className="sr-kicker">Start your journey</p>
            <h1>New Request</h1>
            <p className="sr-subtitle">
              Fill in the details below and our team will get back to you.
            </p>
          </div>
          <Link to="/" className="sr-home-btn">
            <Home size={17} /> Home
          </Link>
        </header>

        {/* Step progress */}
        <div className="sr-steps">
          {STEPS.map((s, i) => {
            const state = step > s.n ? 'done' : step === s.n ? 'active' : 'idle';
            return (
              <React.Fragment key={s.n}>
                <div className="sr-step">
                  <div className={`sr-step-circle ${state}`}>
                    {state === 'done' ? <CheckCircle2 size={17} /> : s.n}
                  </div>
                  <div className="sr-step-info">
                    <div className={`sr-step-label ${state === 'active' ? 'active-label' : state === 'done' ? 'done-label' : ''}`}>
                      {s.label}
                    </div>
                    <div className="sr-step-desc">{s.desc}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`sr-step-line ${step > s.n ? 'done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="sr-card"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {/* ── Step 1: Personal info ── */}
            {step === 1 && (
              <>
                <div className="sr-card-title">
                  <div className="sr-card-title-icon"><User size={18} /></div>
                  Your Information
                </div>
                <div className="sr-grid-2">
                  <div className="sr-field">
                    <label className="sr-label">Full Name *</label>
                    <input
                      className="sr-input"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="sr-field">
                    <label className="sr-label">Email Address *</label>
                    <input
                      className="sr-input"
                      type="email"
                      placeholder="e.g. priya@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2: Project details ── */}
            {step === 2 && (
              <>
                <div className="sr-card-title">
                  <div className="sr-card-title-icon"><FileText size={18} /></div>
                  Project Details
                </div>

                <div className="sr-field">
                  <label className="sr-label">Project Name *</label>
                  <input
                    className="sr-input"
                    type="text"
                    placeholder="e.g. AI Interview Coach"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                  />
                </div>

                <div className="sr-grid-budget">
                  <div className="sr-field" style={{ marginBottom: 0 }}>
                    <label className="sr-label">Currency</label>
                    <div className="sr-select-wrap">
                      <select
                        className="sr-select"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                      >
                        <option value="₹">₹ INR</option>
                        <option value="$">$ USD</option>
                        <option value="₦">₦ NGN</option>
                        <option value="€">€ EUR</option>
                      </select>
                      <ChevronDown size={15} />
                    </div>
                  </div>
                  <div className="sr-field" style={{ marginBottom: 0 }}>
                    <label className="sr-label">
                      <Wallet size={13} /> Budget *
                    </label>
                    <input
                      className="sr-input"
                      type="number"
                      placeholder="e.g. 50000"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="sr-field" style={{ marginTop: 18 }}>
                  <label className="sr-label">
                    <FileText size={13} /> Project Description *
                    <span className="sr-label-opt">(min 20 chars)</span>
                  </label>
                  <textarea
                    className="sr-textarea"
                    placeholder="Describe your project goals, features, and requirements..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <div className={`sr-char-hint ${description.length === 0 ? '' : description.length < 20 ? 'warn' : 'ok'}`}>
                    {description.length} / 20 min characters
                  </div>
                </div>

                <div className="sr-field">
                  <label className="sr-label">
                    <Paperclip size={13} /> Attachment
                    <span className="sr-label-opt">— optional</span>
                  </label>
                  {attachment ? (
                    <div className="sr-file-chosen">
                      <Paperclip size={15} style={{ color: '#748cff', flexShrink: 0 }} />
                      <span className="sr-file-name">{attachment.name}</span>
                      <button
                        type="button"
                        className="sr-file-remove"
                        onClick={() => setAttachment(null)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <label className="sr-file-drop">
                      <Paperclip size={17} />
                      Click to upload a file (PDF, DOCX, image…)
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={e => setAttachment(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </>
            )}

            {/* ── Step 3: Meeting ── */}
            {step === 3 && (
              <>
                <div className="sr-card-title">
                  <div className="sr-card-title-icon"><CalendarDays size={18} /></div>
                  Schedule a Meeting
                </div>

                {/* Project summary pill */}
                <div className="sr-project-pill">
                  <div>
                    <div className="sr-project-pill-title">{projectName}</div>
                    <div className="sr-project-pill-sub">Project · {name}</div>
                  </div>
                  <div className="sr-project-pill-budget">
                    {currency}{Number(budget || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="sr-field">
                  <label className="sr-label">
                    <CalendarDays size={13} /> Preferred Date *
                  </label>
                  <input
                    className="sr-input"
                    type="date"
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="sr-field">
                  <label className="sr-label">
                    <Clock size={13} /> Preferred Time *
                  </label>
                  <div className="sr-time-row">
                    <input
                      className="sr-input"
                      type="time"
                      value={timeVal}
                      onChange={e => {
                        setTimeVal(e.target.value);
                        setPreferredTime(e.target.value ? `${e.target.value} ${ampm}` : '');
                      }}
                    />
                    <div className="sr-select-wrap">
                      <select
                        className="sr-select"
                        value={ampm}
                        onChange={e => {
                          setAmpm(e.target.value);
                          setPreferredTime(timeVal ? `${timeVal} ${e.target.value}` : '');
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  {preferredTime && (
                    <p style={{ fontSize: '0.78rem', color: '#748cff', margin: '6px 0 0', fontWeight: 600 }}>
                      ✓ Selected: {preferredTime}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="sr-error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <X size={16} style={{ flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="sr-actions">
              {step > 1 && (
                <button className="sr-btn-ghost" onClick={() => { setError(''); setStep(s => s - 1); }}>
                  ← Back
                </button>
              )}
              {step < 3 && (
                <button className="sr-btn-primary" onClick={handleNext}>
                  Next Step <ArrowRight size={17} />
                </button>
              )}
              {step === 3 && (
                <button
                  className="sr-btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : <><CheckCircle2 size={17} /> Submit Request</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
   ───────────────────────────────────────────────────────────── */
function Sidebar({ active }) {
  const { user } = useContext(AuthContext);

  return (
    <aside className="sr-sidebar">
      <Link to="/" className="sr-logo" style={{padding:'0 24px'}}>
        <JobZenLogo theme="dark" size="sm" />
      </Link>

      <nav className="sr-nav">
        <Link to="/dashboard" className={active === 'dashboard' ? 'sr-active' : ''}>
          <LayoutDashboard size={20} /> My Requests
        </Link>
        <Link to="/request" className={active === 'request' ? 'sr-active' : ''}>
          <PlusCircle size={20} /> New Request
        </Link>
        <Link to="/browse" className={active === 'browse' ? 'sr-active' : ''}>
          <Grid2X2 size={20} /> Projects
        </Link>
      </nav>

      <div className="sr-sidebar-bottom">
        <div className="sr-profile-letter">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
        <div>
          <strong>{user?.name || 'Welcome back'}</strong>
          <small>{user?.email || 'Keep building'}</small>
        </div>
      </div>
    </aside>
  );
}

