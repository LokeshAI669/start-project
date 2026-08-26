import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
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

const CATEGORIES = [
  'All Domains',
  'Machine Learning',
  'Cyber Security',
  'Computer Vision',
  'NLP',
  'Deep Learning',
  'Mixed'
];

const LEVELS = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export default function BrowseCatalog() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All Domains');
  const [level, setLevel]             = useState('All levels');
  const [showFilters, setShowFilters] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('GET', '/api/catalog?limit=500')
      .then(res => {
        // Deduplicate by title client-side (safety net)
        const seen = new Set();
        const unique = res.data.filter(p => {
          const key = p.title.toLowerCase().trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const mapped = unique.map(p => ({
          id: p.id,
          title: p.title,
          category: p.domain,
          level: p.difficulty,
          description: p.short_description || '',
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

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All Domains' || p.category === category;
      const matchLevel    = level === 'All levels' || p.level === level;
      return matchSearch && matchCategory && matchLevel;
    });
  }, [projects, search, category, level]);

  return (
    <div className="pc-wrap">
      {/* ── Sidebar ── */}
      <aside className="pc-sidebar">
        <Link to="/" className="pc-logo" style={{padding:'0 24px'}}>
          <JobZenLogo theme="dark" size="sm" />
        </Link>

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

        <div className="pc-sidebar-bottom">
          <div className="pc-profile-letter">U</div>
          <div>
            <strong>Welcome back</strong>
            <small>Keep building</small>
          </div>
        </div>
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
            <strong>{filtered.length}</strong> projects available
          </div>

          <div className="pc-controls">
            {/* Search */}
            <div className="pc-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
              />
            </div>

            {/* Custom Category select */}
            <div className="pc-custom-select-wrap" style={{ position: 'relative' }}>
              <button 
                className="pc-select-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: 'var(--bg-card)', border: '1px solid var(--border)', 
                  padding: '10px 16px', borderRadius: '8px', color: 'var(--text-primary)',
                  fontSize: '14px', width: '200px', cursor: 'pointer', fontFamily: 'inherit'
                }}
              >
                {category}
                <ChevronDown size={17} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
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
                      marginTop: '6px', background: '#18181B', // Dark theme background
                      border: '1px solid var(--border)', borderRadius: '8px',
                      overflow: 'hidden', zIndex: 50, boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <div 
                        key={c}
                        onClick={() => { setCategory(c); setIsDropdownOpen(false); }}
                        style={{
                          padding: '10px 16px', cursor: 'pointer', fontSize: '14px',
                          background: category === c ? 'rgba(255,255,255,0.08)' : 'transparent',
                          color: category === c ? 'var(--text-primary)' : 'var(--text-secondary)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if(category !== c) e.target.style.background = 'rgba(255,255,255,0.04)';
                          e.target.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = category === c ? 'rgba(255,255,255,0.08)' : 'transparent';
                          if(category !== c) e.target.style.color = 'var(--text-secondary)';
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
        {!loading && filtered.length === 0 && (
          <div className="pc-empty">
            <Search size={36} />
            <h3>No projects found</h3>
            <p>Try another search term or choose a different category.</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="pc-empty">
            <h3 style={{ opacity: 0.5 }}>Loading projects...</h3>
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
