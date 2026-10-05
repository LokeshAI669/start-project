import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import CustomSelect from '../../components/CustomSelect';
import { useMediaQuery } from '../../hooks/useMediaQuery';


const DOMAINS = ['Web Development','Mobile Development','AI/ML','Data Science','Cybersecurity','Cloud Computing','IoT','Blockchain','UI/UX Design','Game Development','Other'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

const emptyForm = { title:'', domain:'', short_description:'', difficulty:'Intermediate', full_description:'', tech_stack:'', estimated_duration:'', objectives:'', prerequisites:'', github_url:'', zip_url:'' };

export default function AdminCatalog() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [uploadingZip, setUploadingZip] = useState(false);
  const [zipUploadError, setZipUploadError] = useState('');
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/hireproject_admin');
      return;
    }
    if (user && user.role === 'admin') fetchItems();
  }, [user, authLoading, navigate]);

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

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setError(''); setZipUploadError(''); setShowForm(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || '', domain: item.domain || '', short_description: item.short_description || '',
      difficulty: item.difficulty || 'Intermediate', full_description: item.full_description || '',
      tech_stack: item.tech_stack || '', estimated_duration: item.estimated_duration || '',
      objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : (item.objectives || ''),
      prerequisites: item.prerequisites || '',
      github_url: item.github_url || '',
      zip_url: item.zip_url || ''
    });
    setError('');
    setZipUploadError('');
    setShowForm(true);
  };

  const handleZipFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setZipUploadError('Please select a valid .zip file.');
      return;
    }
    setZipUploadError('');
    setUploadingZip(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('zip_file', file);
      
      const res = await fetch('/api/catalog/upload-zip', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload zip file');
      setForm(prev => ({ ...prev, zip_url: data.zip_url }));
    } catch (err) {
      setZipUploadError(err.message);
    } finally {
      setUploadingZip(false);
    }
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
        <div className="sidebar-logo" style={{ display: isNarrow ? 'none' : 'block' }}>
          <Link to="/admin/dashboard"><JobZenLogo theme={theme} size="sm" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="sidebar-item"> All Requests</Link>
          <Link to="/admin/catalog" className="sidebar-item active"> Manage Catalog</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className="topbar" style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={{display:'flex', flexDirection: isNarrow ? 'column' : 'row', alignItems: isNarrow ? 'flex-start' : 'center', gap:'16px', paddingRight:'50px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
              <button 
                className="mobile-menu-btn" 
                onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }}
                style={{background:'none',border:'none',color:'var(--text-primary)',fontSize:'1.5rem',cursor:'pointer',marginTop:'-4px'}}
              >
                ☰
              </button>
              <Link to="/admin/dashboard" style={{ display: isNarrow ? 'block' : 'none' }}><JobZenLogo theme={theme} size="sm" /></Link>
            </div>
            <div>
              <h1 className="page-title">Manage Catalog</h1>
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>{(items || []).length} active catalog projects</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center', position:'absolute', top:0, right:0}}>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Project</button>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading...</div>
        ) : (items || []).length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <p style={{color:'var(--text-faint)'}}>No catalog projects yet. Add the first one!</p>
          </div>
        ) : (
          <div className="card" style={{padding:0, overflow:'hidden', width:'100%'}}>
            <div className="table-responsive" style={{width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch', touchAction:'pan-x pan-y'}} onWheel={(e) => { if (e.deltaY && !e.shiftKey) e.currentTarget.scrollLeft += e.deltaY; }}>
              <table className="data-table" style={{minWidth:'780px', width:'100%', tableLayout:'fixed'}}>
                <thead>
                  <tr>
                    <th style={{width:'240px', minWidth:'240px'}}>Title</th>
                    <th style={{width:'150px', minWidth:'150px', whiteSpace:'nowrap'}}>Domain</th>
                    <th style={{width:'130px', minWidth:'130px', whiteSpace:'nowrap'}}>Difficulty</th>
                    <th style={{width:'130px', minWidth:'130px', whiteSpace:'nowrap'}}>Duration</th>
                    <th style={{width:'130px', minWidth:'130px', whiteSpace:'nowrap'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(items || []).map(p => (
                    <tr key={p.id}>
                      <td style={{fontWeight:600,width:'240px',minWidth:'240px',wordBreak:'break-word'}}>
                        {p.title}
                        {p.zip_url && (
                          <div style={{marginTop:'4px'}}>
                            <span style={{fontSize:'10px',fontFamily:'JetBrains Mono,monospace',color:'#34D399',background:'rgba(52,211,153,0.1)',padding:'2px 6px',borderRadius:'4px'}}>ZIP DELIVERABLE</span>
                          </div>
                        )}
                      </td>
                      <td style={{whiteSpace:'nowrap',width:'150px'}}><span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'10px',background:'var(--orange-soft)',color:'var(--orange)',padding:'3px 8px',borderRadius:'99px'}}>{p.domain}</span></td>
                      <td style={{fontSize:'12px',color:'var(--text-faint)',whiteSpace:'nowrap',width:'130px'}}>{p.difficulty}</td>
                      <td style={{fontSize:'12px',color:'var(--text-faint)',whiteSpace:'nowrap',width:'130px'}}>{p.estimated_duration || '—'}</td>
                      <td style={{whiteSpace:'nowrap',width:'130px'}}>
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
              <div className="form-group" style={{background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:'8px',padding:'14px'}}>
                <label className="form-label" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontWeight:600}}>Project Deliverable (.ZIP File)</span>
                  {uploadingZip && <span style={{color:'var(--orange)',fontSize:'11px'}}>Uploading zip archive...</span>}
                </label>

                <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'10px',flexWrap:'wrap'}}>
                  <label className="btn btn-ghost btn-sm" style={{cursor:uploadingZip ? 'not-allowed' : 'pointer',display:'inline-flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,0.08)'}}>
                    <input
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      style={{display:'none'}}
                      onChange={handleZipFileChange}
                      disabled={uploadingZip}
                    />
                    📁 {uploadingZip ? 'Uploading...' : 'Choose .ZIP File to Upload'}
                  </label>
                  {form.zip_url && (
                    <span style={{fontSize:'11px',color:'var(--green)',fontFamily:'JetBrains Mono,monospace',wordBreak:'break-all'}}>
                      ✓ Loaded: {form.zip_url}
                    </span>
                  )}
                </div>

                <input
                  className="form-input"
                  value={form.zip_url}
                  onChange={f('zip_url')}
                  placeholder="Or enter path e.g. /uploads/AI-skin-specialist.zip or external download link"
                />
                {zipUploadError && <div style={{color:'var(--red)',fontSize:'12px',marginTop:'6px'}}>{zipUploadError}</div>}
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
