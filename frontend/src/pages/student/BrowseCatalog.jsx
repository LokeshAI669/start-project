import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import CustomSelect from '../../components/CustomSelect';
import StudentLayout from '../../components/StudentLayout';
const difficultyColor = (d) => {
  if (d === 'Beginner')     return 'var(--green)';
  if (d === 'Advanced')     return 'var(--red)';
  return 'var(--orange)';
};

export default function BrowseCatalog() {
  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [items, setItems]     = useState([]);
  const [domains, setDomains] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]   = useState('');
  const [domain, setDomain]   = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 12;

  useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);

  useEffect(() => {
    api('GET', '/api/catalog/domains').then(setDomains).catch(() => {});
  }, []);

  useEffect(() => { fetchItems(); }, [page, domain]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (domain) params.append('domain', domain);
      if (search) params.append('search', search);
      const data = await api('GET', `/api/catalog?${params}`);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setItems(list);
      setTotal(data.total || list.length);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  return (
    <StudentLayout title="Project Catalog" subtitle="Browse and request a project">
      <div style={{maxWidth:'1100px',margin:'0 auto',position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'16px',marginBottom:'32px'}}>
          <div>
            <p style={{color:'var(--text-faint)',fontSize:'13px'}}>{total} projects available</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'28px'}}>
          <form onSubmit={handleSearch} style={{display:'flex',gap:'8px',flex:1,minWidth:'220px'}}>
            <div style={{position:'relative',flex:1}}>
              
              <input className="form-input" style={{paddingLeft:'38px'}} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>
          <CustomSelect
            value={domain}
            onChange={val => { setDomain(val); setPage(1); }}
            options={domains.map(d => ({ value: d.domain, label: `${d.domain} (${d.count})` }))}
            placeholder="All Domains"
            style={{width:'220px'}}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <div style={{fontSize:'3rem',marginBottom:'12px'}}></div>
            <p style={{color:'var(--text-faint)'}}>No projects found. Try a different search or domain.</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'18px'}}>
            {items.map(p => (
              <div key={p.id} className="card feature-card" style={{padding:'22px 24px',display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'9px',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--orange)',background:'var(--orange-soft)',border:'1px solid var(--orange-border)',padding:'3px 8px',borderRadius:'99px'}}>{p.domain}</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'9px',textTransform:'uppercase',letterSpacing:'.07em',color:difficultyColor(p.difficulty),fontWeight:600}}>{p.difficulty}</span>
                </div>
                <h3 style={{fontSize:'15px',fontWeight:700,margin:'0 0 8px',lineHeight:'1.4'}}>{p.title}</h3>
                <p style={{fontSize:'13px',color:'var(--text-faint)',lineHeight:'1.6',flex:1,margin:'0 0 16px'}}>{p.short_description}</p>
                {p.estimated_duration && (
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:'10px',color:'var(--text-faint)',marginBottom:'16px'}}>
                    ⏱ {p.estimated_duration}
                  </div>
                )}
                <Link to={`/request?catalog_id=${p.id}`} className="btn btn-primary btn-sm" style={{width:'100%',textAlign:'center'}}>
                  Request This Project →
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'12px',marginTop:'32px'}}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>
              &larr; Prev
            </button>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'12px',color:'var(--text-faint)'}}>
              Page {page} of {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
