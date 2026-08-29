import React, { useMemo, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  ArrowRight,
  Bot,
  ChevronDown,
  FolderKanban,
  Grid2X2,
  Home,
  LayoutDashboard,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import JobZenLogo from '../../components/JobZenLogo';
import './ProjectCatalog.css';

/* ─────────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────────── */
function getDomainColor(domain) {
  switch (domain) {
    case 'Machine Learning': return '#7C5CFC';
    case 'Cyber Security': return '#FF6B8A';
    case 'Computer Vision': return '#5CFFE1';
    case 'NLP': return '#FFB86B';
    case 'Deep Learning': return '#B58CFF';
    default: return '#D8FF5C';
  }
}

function getDomainImage(domain) {
  switch (domain) {
    case 'Machine Learning': return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85';
    case 'Cyber Security': return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=85';
    case 'Computer Vision': return 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?auto=format&fit=crop&w=900&q=85';
    case 'NLP': return 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85';
    case 'Deep Learning': return 'https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=900&q=85';
    default: return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=85';
  }
}

function getDomainTools(domain) {
  switch (domain) {
    case 'Machine Learning': return ['Python', 'Scikit-learn'];
    case 'Cyber Security': return ['Cloud', 'Network'];
    case 'Computer Vision': return ['OpenCV', 'ML'];
    case 'NLP': return ['NLP', 'BERT'];
    case 'Deep Learning': return ['TensorFlow', 'Keras'];
    default: return ['Python', 'Data'];
  }
}

// CATEGORIES is now fetched dynamically — see useEffect in BrowseCatalog
const FALLBACK_DOMAINS = [
  'Machine Learning',
  'Cyber Security',
  'Computer Vision',
  'NLP',
  'Deep Learning',
  'Mixed',
];

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export default function BrowseCatalog() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const anonUser = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('anon_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All Domains');
  const [level, setLevel]             = useState('All levels');
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Semantic search state
  const [semanticResults, setSemanticResults]     = useState([]);
  const [isSemanticSearch, setIsSemanticSearch]   = useState(false);
  const [semanticLoading, setSemanticLoading]     = useState(false);
  const debounceRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? 'http://localhost:3000' : 'https://start-project-mu.vercel.app');

  // Debounced semantic search — fires 600ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (search.trim().length < 3) {
      setIsSemanticSearch(false);
      setSemanticResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSemanticLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/ai/semantic-search?q=${encodeURIComponent(search.trim())}&limit=30`);
        const data = await res.json();
        if (data.semantic && Array.isArray(data.data)) {
          const mapped = data.data.map(p => ({
            id: p.id,
            title: p.title,
            category: p.domain,
            level: p.difficulty,
            description: p.short_description,
            color: getDomainColor(p.domain),
            image: getDomainImage(p.domain),
            tools: getDomainTools(p.domain),
          }));
          setSemanticResults(mapped);
          setIsSemanticSearch(true);
        } else {
          setIsSemanticSearch(false);
        }
      } catch (_) {
        setIsSemanticSearch(false);
      } finally {
        setSemanticLoading(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState(['All Domains', ...FALLBACK_DOMAINS]);

  // Fetch catalog projects
  useEffect(() => {
    api('GET', '/api/catalog?limit=200')
      .then(res => {
        const mapped = res.data.map(p => ({
          id: p.id,
          title: p.title,
          category: p.domain,
          level: p.difficulty,
          description: p.short_description,
          color: getDomainColor(p.domain),
          image: getDomainImage(p.domain),
          tools: getDomainTools(p.domain)
        }));
        setProjects(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch live domain list from API — keeps filter tabs in sync with DB
  useEffect(() => {
    api('GET', '/api/catalog/domains')
      .then(data => {
        const domains = Array.isArray(data)
          ? data.map(d => (typeof d === 'string' ? d : d.domain)).filter(Boolean)
          : [];
        if (domains.length > 0) {
          setCategories(['All Domains', ...domains]);
        }
      })
      .catch(() => { /* keep FALLBACK_DOMAINS */ });
  }, []);


  const filtered = useMemo(() => {
    // When semantic search is active, apply only category + level filters on top of semantic results
    const base = isSemanticSearch ? semanticResults : projects;
    return base.filter((p) => {
      const matchSearch = isSemanticSearch
        ? true // semantic already ranked by relevance
        : (p.title.toLowerCase().includes(search.toLowerCase()) ||
           (p.description || '').toLowerCase().includes(search.toLowerCase()));
      const matchCategory = category === 'All Domains' || p.category === category;
      const matchLevel    = level === 'All levels' || p.level === level;
      return matchSearch && matchCategory && matchLevel;
    });
  }, [search, category, level, projects, isSemanticSearch, semanticResults]);

  return (
    <div className="pc-wrap">
      {/* ── Sidebar ── */}
      <aside className="pc-sidebar">
        <Link to="/" className="pc-logo" style={{padding:'0 24px'}}>
          <JobZenLogo theme="dark" size="sm" />
        </Link>

        <div className="pc-sidebar-profile">
          <div className="pc-profile-letter">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <strong>{user?.name || 'Welcome back'}</strong>
            <small>{user?.email || 'Keep building'}</small>
          </div>
        </div>

        <nav className="pc-nav">
          <Link to="/dashboard">
            <LayoutDashboard size={20} />
            My Requests
          </Link>
          <Link to="/request">
            <PlusCircle size={20} />
            New Request
          </Link>
          <Link to="/browse" className="pc-active">
            <Grid2X2 size={20} />
            Projects
          </Link>
        </nav>

      </aside>

      {/* ── Main ── */}
      <main className="pc-main">
        {/* Header */}
        <header className="pc-header">
          <div>
            <p className="pc-kicker">Discover your next opportunity</p>
            <h1>Project Catalog</h1>
            <p className="pc-subtitle">
              Browse real-world projects and request the one that matches your goals.
            </p>
          </div>
          <Link to="/" className="pc-home-btn">
            <Home size={17} />
            Home
          </Link>
        </header>

        {/* Hero banner */}
        <section className="pc-hero">
          <div>
            <span className="pc-live-dot" />
            <span className="pc-hero-updated">Updated today</span>
            <h2>Build something that gets you noticed.</h2>
            <p>
              Choose a project, develop your skills, and create work you can
              proudly showcase.
            </p>
          </div>

          <div className="pc-orbit-wrap">
            <div className="pc-orbit" />
            <div className="pc-orbit pc-orbit-two" />
            <div className="pc-orbit-center">
              <FolderKanban size={32} />
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="pc-toolbar">
          <div className="pc-count">
          <strong>{filtered.length}</strong> projects {isSemanticSearch ? <><span className="pc-semantic-label"><Bot size={12} /> AI ranked</span></> : 'available'}
        </div>

          <div className="pc-controls">
            {/* Search */}
            <div className={`pc-search ${semanticLoading ? 'pc-search--loading' : ''}`}>
              {semanticLoading
                ? <div className="pc-search-spinner" />
                : isSemanticSearch
                ? <Bot size={18} style={{ color: '#a259ff' }} />
                : <Search size={18} />}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="AI-powered search — try 'stock price prediction'…"
              />
              {isSemanticSearch && (
                <span className="pc-ai-badge">AI</span>
              )}
            </div>

            {/* Custom Category select */}
            <div className="pc-select-wrap" style={{ position: 'relative', padding: 0, border: 'none', background: 'transparent', height: 'auto' }}>
              <button 
                className="pc-select-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: 'rgba(255,255,255,0.055)', border: '1px solid var(--pc-border)', 
                  padding: '0 15px', borderRadius: '12px', color: 'var(--text-primary)',
                  fontSize: '0.9rem', width: '100%', height: '50px', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {category}
                <ChevronDown size={17} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--pc-muted)' }} />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, width: '100%', 
                      marginTop: '6px', background: '#121421',
                      border: '1px solid var(--pc-border)', borderRadius: '12px',
                      overflow: 'hidden', zIndex: 50, boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
                    }}
                  >
                    {categories.map((c) => (
                      <div 
                        key={c}
                        onClick={() => { setCategory(c); setIsDropdownOpen(false); }}
                        style={{
                          padding: '12px 16px', cursor: 'pointer', fontSize: '0.9rem',
                          background: category === c ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: category === c ? 'var(--text-primary)' : 'var(--pc-muted)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if(category !== c) e.target.style.background = 'rgba(255,255,255,0.04)';
                          e.target.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = category === c ? 'rgba(255,255,255,0.08)' : 'transparent';
                          if(category !== c) e.target.style.color = 'var(--pc-muted)';
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter toggle */}
            <button
              className="pc-filter-btn"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal size={17} />
              Filters
            </button>
          </div>
        </section>

        {/* Advanced level filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="pc-adv-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              {LEVELS.map((l) => (
                <button
                  key={l}
                  className={level === l ? 'pc-active' : ''}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <motion.section layout className="pc-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onRequest={() => navigate(`/request?catalog_id=${project.id}`)}
              />
            ))}
          </AnimatePresence>
        </motion.section>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="pc-empty">
            <Search size={36} />
            <h3>No projects found</h3>
            <p>Try another search term or choose a different category.</p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PROJECT CARD
   ───────────────────────────────────────────────────────────── */
function ProjectCard({ project, index, onRequest }) {
  return (
    <motion.article
      layout
      className="pc-card"
      style={{ '--project-color': project.color }}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.42, delay: index * 0.055 }}
      whileHover={{ y: -8 }}
    >
      {/* Cover */}
      <div className="pc-cover">
        <img src={project.image} alt={project.title} loading="lazy" />
        <div className="pc-cover-shade" />
        <span className="pc-domain-badge">{project.category}</span>
        <span className="pc-level-badge">{project.level}</span>
      </div>

      {/* Body */}
      <div className="pc-body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>

        <div className="pc-tools">
          {project.tools.map((t) => <span key={t}>{t}</span>)}
        </div>

        <button className="pc-request-btn" onClick={onRequest}>
          Request this project
          <ArrowRight size={17} />
        </button>
      </div>
    </motion.article>
  );
}
