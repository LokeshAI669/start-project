import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import CustomSelect from '../../components/CustomSelect';

const DOMAINS = ['Web Development','Mobile Development','AI/ML','Data Science','Cybersecurity','Cloud Computing','IoT','Blockchain','UI/UX Design','Game Development','Other'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

const emptyForm = { title:'', domain:'', short_description:'', difficulty:'Intermediate', full_description:'', tech_stack:'', estimated_duration:'', objectives:'', prerequisites:'' };

export default function AdminCatalog() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  useEffect(() => {
    if (!token) { navigate('/admin-login'); return; }
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchItems();
  }, [token, navigate, user?.role]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api('GET', '/api/catalog?limit=100');
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || '', domain: item.domain || '', short_description: item.short_description || '',
      difficulty: item.difficulty || 'Intermediate', full_description: item.full_description || '',
      tech_stack: item.tech_stack || '', estimated_duration: item.estimated_duration || '',
      objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : (item.objectives || ''),
      prerequisites: item.prerequisites || ''
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.domain) return setError('Title and domain are required.');
    setSaving(true); setError('');
    try {
      const payload = { ...form, objectives: form.objectives ? form.objectives.split('\n').filter(Boolean) : [] };
      if (editItem) await api('PUT', `/api/catalog/${editItem.id}`, payload);
      else          await api('POST', '/api/catalog', payload);
      setShowForm(false);
      await fetchItems();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this project from the catalog?')) return;
    try {
      await api('DELETE', `/api/catalog/${id}`);
      await fetchItems();
    } catch (e) { alert(e.message); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="app-layout admin-portal">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ display: window.innerWidth > 1024 ? 'block' : 'none' }}>
          <Link to="/admin"><JobZenLogo theme={theme} size="sm" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-item"> All Requests</Link>
          <Link to="/admin/catalog" className="sidebar-item active"> Manage Catalog</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className="topbar" style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={{display:'flex', flexDirection: window.innerWidth <= 1024 ? 'column' : 'row', alignItems: window.innerWidth <= 1024 ? 'flex-start' : 'center', gap:'16px', paddingRight:'50px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <button 
                className="mobile-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
                style={{background:'none',border:'none',color:'var(--text-primary)',fontSize:'1.5rem',cursor:'pointer',marginTop:'-4px'}}
              >
                ☰
              </button>
              <Link to="/admin" style={{ display: window.innerWidth <= 1024 ? 'block' : 'none' }}><JobZenLogo theme={theme} size="sm" /></Link>
            </div>
            <div>
              <h1 className="page-title">Manage Catalog</h1>
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>{(items || []).length} active catalog projects</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center', position:'absolute', top:0, right:0}}>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Project</button>
            <button onClick={() => navigate('/profile')} className="topbar-profile-btn" title="Profile">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading...</div>
        ) : (items || []).length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <p style={{color:'var(--text-faint)'}}>No catalog projects yet. Add the first one!</p>
          </div>
        ) : (
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Domain</th>
                  <th>Difficulty</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(items || []).map(p => (
                  <tr key={p.id}>
                    <td style={{fontWeight:600}}>{p.title}</td>
                    <td><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'10px',background:'var(--orange-soft)',color:'var(--orange)',padding:'3px 8px',borderRadius:'99px'}}>{p.domain}</span></td>
                    <td style={{fontSize:'12px',color:'var(--text-faint)'}}>{p.difficulty}</td>
                    <td style={{fontSize:'12px',color:'var(--text-faint)'}}>{p.estimated_duration || '—'}</td>
                    <td>
                      <div style={{display:'flex',gap:'8px'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}} onClick={() => setShowForm(false)}>
          <div className="card" style={{width:'100%',maxWidth:'600px',padding:'32px',maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <h3 style={{margin:0}}>{editItem ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setShowForm(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)'}}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={f('title')} placeholder="e.g. Inventory Management System" />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div className="form-group">
                  <label className="form-label">Domain *</label>
                  <CustomSelect
                    value={form.domain}
                    onChange={val => setForm({...form, domain: val})}
                    options={DOMAINS.map(d => ({ value: d, label: d }))}
                    placeholder="Select domain..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <CustomSelect
                    value={form.difficulty}
                    onChange={val => setForm({...form, difficulty: val})}
                    options={DIFFICULTIES.map(d => ({ value: d, label: d }))}
                    placeholder="Select difficulty..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <input className="form-input" value={form.short_description} onChange={f('short_description')} placeholder="One-line summary of the project" />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={4} style={{resize:'vertical'}} value={form.full_description} onChange={f('full_description')} placeholder="Detailed description..." />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div className="form-group">
                  <label className="form-label">Tech Stack</label>
                  <input className="form-input" value={form.tech_stack} onChange={f('tech_stack')} placeholder="e.g. React, Node.js, PostgreSQL" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input className="form-input" value={form.estimated_duration} onChange={f('estimated_duration')} placeholder="e.g. 4-6 weeks" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Objectives <span style={{color:'var(--text-faint)',fontWeight:400}}>(one per line)</span></label>
                <textarea className="form-input" rows={3} style={{resize:'vertical'}} value={form.objectives} onChange={f('objectives')} placeholder="Build a REST API&#10;Create a React frontend&#10;Deploy to cloud" />
              </div>
              <div className="form-group">
                <label className="form-label">Prerequisites</label>
                <input className="form-input" value={form.prerequisites} onChange={f('prerequisites')} placeholder="e.g. Basic JavaScript knowledge" />
              </div>

              {error && <div className="form-error show" style={{marginBottom:'16px'}}>{error}</div>}

              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add to Catalog'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
