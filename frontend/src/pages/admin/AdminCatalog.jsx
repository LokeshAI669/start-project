import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api, API_BASE } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';
import CustomSelect from '../../components/CustomSelect';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CatalogFilters from '../../components/admin/CatalogFilters';
import { useCatalogFilters } from '../../hooks/useCatalogFilters';
import { CheckCircle2, AlertCircle, Trash2, RefreshCw, UploadCloud, FileArchive, DollarSign, Star, ShoppingCart } from 'lucide-react';

const DOMAINS = ['Web Development','Mobile Development','AI/ML','Artificial Intelligence','Data Science','Cybersecurity','Cloud Computing','IoT','Blockchain','UI/UX Design','Game Development','Other'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];
const STATUSES = [
  { value: 'published', label: 'Published (Visible to students)' },
  { value: 'draft', label: 'Draft (Admin only)' },
  { value: 'hidden', label: 'Hidden (Archived)' }
];

const emptyForm = {
  title: '',
  domain: '',
  short_description: '',
  difficulty: 'Intermediate',
  full_description: '',
  tech_stack: '',
  estimated_duration: '',
  objectives: '',
  prerequisites: '',
  github_url: '',
  zip_url: '',
  is_premium: false,
  price: '',
  status: 'published',
  zip_storage_key: '',
  zip_file_name: '',
  zip_file_size: 0,
  zip_version: 1,
  zip_updated_at: null,
};

export default function AdminCatalog() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const filters = useCatalogFilters(items, { pageSize: 25, debounceMs: 300 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // ZIP upload progress & state
  const [uploadingZip, setUploadingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setZipUploadError('');
    setUploadProgress(0);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      title: item.title || '',
      domain: item.domain || '',
      short_description: item.short_description || '',
      difficulty: item.difficulty || 'Intermediate',
      full_description: item.full_description || '',
      tech_stack: item.tech_stack || '',
      estimated_duration: item.estimated_duration || '',
      objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : (item.objectives || ''),
      prerequisites: item.prerequisites || '',
      github_url: item.github_url || '',
      zip_url: item.zip_url || '',
      is_premium: Boolean(item.is_premium),
      price: item.price !== null && item.price !== undefined ? String(item.price) : '',
      status: item.status || 'published',
      zip_storage_key: item.zip_storage_key || '',
      zip_file_name: item.zip_file_name || (item.zip_url ? item.zip_url.split('/').pop() : ''),
      zip_file_size: item.zip_file_size || 0,
      zip_version: item.zip_version || 1,
      zip_updated_at: item.zip_updated_at || null,
    });
    setError('');
    setZipUploadError('');
    setUploadProgress(0);
    setShowForm(true);
  };

  // Upload ZIP with live progress bar using XMLHttpRequest
  const handleZipFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (max 200MB)
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setZipUploadError('Please select a valid .zip archive file.');
      return;
    }
    const MAX_SIZE = 200 * 1024 * 1024; // 200 MB
    if (file.size > MAX_SIZE) {
      setZipUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 200 MB.`);
      return;
    }

    setZipUploadError('');
    setUploadingZip(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('zip_file', file);
    if (editItem?.id) {
      formData.append('projectId', editItem.id);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploadingZip(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          setForm(prev => ({
            ...prev,
            zip_storage_key: res.storageKey || '',
            zip_file_name: res.filename || file.name,
            zip_file_size: res.size || file.size,
            zip_version: res.version || (prev.zip_version + 1),
            zip_updated_at: new Date().toISOString(),
            zip_url: res.storageKey ? `/private-storage/${res.storageKey}` : prev.zip_url,
          }));
        } catch {
          setZipUploadError('Invalid response from server.');
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setZipUploadError(res.error || `Upload failed with status ${xhr.status}`);
        } catch {
          setZipUploadError(`Upload failed (${xhr.status})`);
        }
      }
      e.target.value = '';
    };

    xhr.onerror = () => {
      setUploadingZip(false);
      setZipUploadError('Network error occurred during ZIP upload.');
      e.target.value = '';
    };

    const token = localStorage.getItem('token');
    xhr.open('POST', `${API_BASE}/api/catalog/upload-zip`);
    if (token && token !== 'admin' && token !== 'student') {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  };

  const handleRemoveZip = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this ZIP archive from storage?')) return;
    try {
      if (editItem?.id) {
        await api('DELETE', `/api/catalog/${editItem.id}/remove-zip`);
      }
      setForm(prev => ({
        ...prev,
        zip_storage_key: '',
        zip_file_name: '',
        zip_file_size: 0,
        zip_url: '',
        zip_version: 1,
        zip_updated_at: null
      }));
    } catch (err) {
      setZipUploadError(err.message || 'Failed to remove ZIP file');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.domain) return setError('Title and domain are required.');
    if (form.is_premium && (!form.price || Number(form.price) <= 0)) {
      return setError('Price is required and must be greater than ₹0 for Premium projects.');
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        price: form.is_premium ? Number(form.price) : 0,
        objectives: form.objectives ? form.objectives.split('\n').filter(Boolean) : []
      };

      if (editItem) {
        await api('PUT', `/api/catalog/${editItem.id}`, payload);
      } else {
        await api('POST', '/api/catalog', payload);
      }

      setShowForm(false);
      await fetchItems();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate / remove this project from the catalog? (If students have purchased it, it will be safely soft-deleted so their downloads remain accessible)')) return;
    try {
      await api('DELETE', `/api/catalog/${id}`);
      await fetchItems();
    } catch (e) {
      alert(e.message);
    }
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
          <Link to="/admin/orders" className="sidebar-item">
            <span style={{ display:'inline-flex', alignItems:'center', gap:'8px' }}>
              <ShoppingCart size={15} /> Sales &amp; Orders
            </span>
          </Link>
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
              <p style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'2px'}}>{filters.subtitle}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center', position:'absolute', top:0, right:0}}>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Project</button>
          </div>
        </div>

        {/* Filters Section */}
        <CatalogFilters
          searchInput={filters.searchInput}
          onSearchChange={filters.setSearchInput}
          domainFilter={filters.domainFilter}
          onDomainChange={filters.setDomainFilter}
          domainOptions={filters.domainOptions}
          difficultyFilter={filters.difficultyFilter}
          onDifficultyChange={filters.setDifficultyFilter}
          difficultyOptions={filters.difficultyOptions}
          durationFilter={filters.durationFilter}
          onDurationChange={filters.setDurationFilter}
          durationOptions={filters.durationOptions}
          premiumFilter={filters.premiumFilter}
          onPremiumChange={filters.setPremiumFilter}
          premiumOptions={filters.premiumOptions}
          sortOption={filters.sortOption}
          onSortChange={filters.setSortOption}
          sortOptions={filters.sortOptions}
          isFilterActive={filters.isFilterActive}
          activeChips={filters.activeChips}
          onClearFilters={filters.clearFilters}
        />

        {loading ? (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-faint)'}}>Loading projects...</div>
        ) : (items || []).length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'60px'}}>
            <p style={{color:'var(--text-faint)'}}>No catalog projects yet. Add the first one!</p>
          </div>
        ) : filters.filteredProjects.length === 0 ? (
          <div className="catalog-empty-state">
            <div className="catalog-empty-title">No projects match your filters</div>
            <p className="catalog-empty-desc">Try adjusting your search query, domain, difficulty, duration, or premium filter.</p>
            <button className="btn btn-primary btn-sm" onClick={filters.clearFilters}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="card" style={{padding:0, overflow:'hidden', width:'100%'}}>
            <div className="table-responsive" style={{width:'100%', overflowX:'auto', WebkitOverflowScrolling:'touch', touchAction:'pan-x pan-y'}} onWheel={(e) => { if (e.deltaY && !e.shiftKey) e.currentTarget.scrollLeft += e.deltaY; }}>
              <table className="data-table" style={{minWidth:'920px', width:'100%', tableLayout:'fixed'}}>
                <thead>
                  <tr>
                    <th style={{width:'240px', minWidth:'240px'}}>Title &amp; Type</th>
                    <th style={{width:'130px', minWidth:'130px', whiteSpace:'nowrap'}}>Domain</th>
                    <th style={{width:'110px', minWidth:'110px', whiteSpace:'nowrap'}}>Price</th>
                    <th style={{width:'120px', minWidth:'120px', whiteSpace:'nowrap'}}>Difficulty</th>
                    <th style={{width:'150px', minWidth:'150px', whiteSpace:'nowrap'}}>ZIP Deliverable</th>
                    <th style={{width:'100px', minWidth:'100px', whiteSpace:'nowrap'}}>Status</th>
                    <th style={{width:'120px', minWidth:'120px', whiteSpace:'nowrap'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filters.paginatedProjects.map(p => {
                    const hasZip = Boolean(p.zip_storage_key || p.zip_url);
                    return (
                      <tr key={p.id}>
                        <td style={{fontWeight:600,width:'240px',minWidth:'240px',wordBreak:'break-word'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                            <span>{p.title}</span>
                            {p.is_premium ? (
                              <span style={{
                                fontSize:'10px',
                                fontWeight:700,
                                fontFamily:'JetBrains Mono, monospace',
                                color:'#F59E0B',
                                background:'rgba(245,158,11,0.14)',
                                border:'1px solid rgba(245,158,11,0.3)',
                                padding:'2px 7px',
                                borderRadius:'100px',
                                display:'inline-flex',
                                alignItems:'center',
                                gap:'3px'
                              }}>
                                <Star size={10} fill="#F59E0B" /> Premium
                              </span>
                            ) : (
                              <span style={{fontSize:'10px',color:'var(--text-faint)',background:'rgba(255,255,255,0.05)',padding:'2px 6px',borderRadius:'4px'}}>
                                Free
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{whiteSpace:'nowrap',width:'130px'}}>
                          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:'10px',background:'var(--orange-soft)',color:'var(--orange)',padding:'3px 8px',borderRadius:'99px'}}>
                            {p.domain}
                          </span>
                        </td>
                        <td style={{fontWeight:700,fontSize:'13px',whiteSpace:'nowrap',width:'110px',color: p.is_premium ? '#F59E0B' : 'var(--text-faint)'}}>
                          {p.is_premium ? `₹${Number(p.price || 0).toLocaleString('en-IN')}` : 'Free'}
                        </td>
                        <td style={{fontSize:'12px',color:'var(--text-faint)',whiteSpace:'nowrap',width:'120px'}}>
                          {p.difficulty}
                        </td>
                        <td style={{whiteSpace:'nowrap',width:'150px'}}>
                          {hasZip ? (
                            <span style={{
                              fontSize:'11px',
                              fontFamily:'JetBrains Mono, monospace',
                              color:'#34D399',
                              background:'rgba(52,211,153,0.12)',
                              border:'1px solid rgba(52,211,153,0.3)',
                              padding:'3px 8px',
                              borderRadius:'6px',
                              display:'inline-flex',
                              alignItems:'center',
                              gap:'4px'
                            }}>
                              <FileArchive size={12} /> ZIP v{p.zip_version || 1}
                            </span>
                          ) : (
                            <span style={{fontSize:'11px',color:'var(--text-faint)',display:'inline-flex',alignItems:'center',gap:'4px'}}>
                              <AlertCircle size={12} /> No ZIP
                            </span>
                          )}
                        </td>
                        <td style={{whiteSpace:'nowrap',width:'100px'}}>
                          <span style={{
                            fontSize:'10px',
                            fontWeight:600,
                            textTransform:'uppercase',
                            padding:'2px 7px',
                            borderRadius:'4px',
                            background: p.status === 'published' ? 'rgba(52,211,153,0.1)' : p.status === 'draft' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.06)',
                            color: p.status === 'published' ? '#34D399' : p.status === 'draft' ? '#F59E0B' : 'var(--text-faint)',
                            border: `1px solid ${p.status === 'published' ? 'rgba(52,211,153,0.25)' : p.status === 'draft' ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)'}`
                          }}>
                            {p.status || 'published'}
                          </span>
                        </td>
                        <td style={{whiteSpace:'nowrap',width:'120px'}}>
                          <div style={{display:'flex',gap:'8px'}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                            <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filters.totalPages > 1 && (
              <div className="catalog-pagination-bar">
                <div className="catalog-pagination-info">
                  Showing {(filters.currentPage - 1) * filters.pageSize + 1}–{Math.min(filters.currentPage * filters.pageSize, filters.totalFiltered)} of {filters.totalFiltered} projects
                </div>
                <div className="catalog-pagination-actions">
                  <button
                    className="catalog-page-btn"
                    onClick={() => filters.setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={filters.currentPage === 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                  <span style={{ padding: '0 8px', fontSize: '12px', color: 'var(--text-faint)' }}>
                    Page {filters.currentPage} of {filters.totalPages}
                  </span>
                  <button
                    className="catalog-page-btn"
                    onClick={() => filters.setCurrentPage(p => Math.min(filters.totalPages, p + 1))}
                    disabled={filters.currentPage === filters.totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Project Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}} onClick={() => setShowForm(false)}>
          <div className="card" style={{width:'100%',maxWidth:'680px',padding:'32px',maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',borderBottom:'1px solid var(--border)',paddingBottom:'16px'}}>
              <div>
                <h3 style={{margin:0,fontSize:'18px'}}>{editItem ? 'Edit / Replace Project' : 'Add New Project'}</h3>
                <p style={{margin:'4px 0 0',color:'var(--text-faint)',fontSize:'12px'}}>
                  Changes reflect instantly across the student Hire Project portal.
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)',fontSize:'18px'}}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Premium Toggle Switch */}
              <div style={{
                background: form.is_premium ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${form.is_premium ? 'rgba(245,158,11,0.35)' : 'var(--border)'}`,
                borderRadius:'8px',
                padding:'16px 20px',
                marginBottom:'20px',
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                transition:'all 0.2s ease'
              }}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <span style={{
                    width:'36px',
                    height:'36px',
                    borderRadius:'8px',
                    background: form.is_premium ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    color: form.is_premium ? '#000' : 'var(--text-faint)'
                  }}>
                    <Star size={18} fill={form.is_premium ? '#000' : 'none'} />
                  </span>
                  <div>
                    <div style={{fontWeight:700,fontSize:'14px',color: form.is_premium ? '#F59E0B' : 'var(--text-primary)'}}>
                      Premium Project Deliverable
                    </div>
                    <div style={{fontSize:'12px',color:'var(--text-faint)'}}>
                      Enable paid access with Razorpay and unlock direct source code ZIP download for buyers.
                    </div>
                  </div>
                </div>

                <label style={{position:'relative',display:'inline-block',width:'48px',height:'26px',cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    checked={form.is_premium}
                    onChange={(e) => setForm(prev => ({ ...prev, is_premium: e.target.checked }))}
                    style={{opacity:0,width:0,height:0}}
                  />
                  <span style={{
                    position:'absolute',
                    cursor:'pointer',
                    top:0,left:0,right:0,bottom:0,
                    backgroundColor: form.is_premium ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                    transition:'.2s',
                    borderRadius:'26px'
                  }} />
                  <span style={{
                    position:'absolute',
                    height:'20px',
                    width:'20px',
                    left: form.is_premium ? '25px' : '3px',
                    bottom:'3px',
                    backgroundColor:'white',
                    transition:'.2s',
                    borderRadius:'50%'
                  }} />
                </label>
              </div>

              {/* Conditional Premium Settings: Price & ZIP Upload */}
              {form.is_premium && (
                <div style={{
                  background:'rgba(245,158,11,0.03)',
                  border:'1px dashed rgba(245,158,11,0.3)',
                  borderRadius:'8px',
                  padding:'18px',
                  marginBottom:'20px'
                }}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label" style={{color:'#F59E0B',fontWeight:600}}>
                        Price in INR (₹) *
                      </label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#F59E0B',fontWeight:700}}>₹</span>
                        <input
                          type="number"
                          className="form-input"
                          style={{paddingLeft:'30px',borderColor:'rgba(245,158,11,0.4)',fontWeight:600}}
                          value={form.price}
                          onChange={f('price')}
                          placeholder="e.g. 499, 999, 1499"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{margin:0}}>
                      <label className="form-label">Publishing Status</label>
                      <CustomSelect
                        value={form.status}
                        onChange={val => setForm({...form, status: val})}
                        options={STATUSES}
                      />
                    </div>
                  </div>

                  {/* Private ZIP Upload / Replace Component */}
                  <div style={{marginTop:'12px'}}>
                    <label className="form-label" style={{fontWeight:600,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>Private Project ZIP Archive (Max 200 MB)</span>
                      {form.zip_version > 1 && (
                        <span style={{fontSize:'11px',color:'#F59E0B',fontFamily:'JetBrains Mono,monospace'}}>
                          Version {form.zip_version}
                        </span>
                      )}
                    </label>

                    {/* Progress Bar when uploading */}
                    {uploadingZip && (
                      <div style={{margin:'10px 0'}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'4px',color:'var(--orange)'}}>
                          <span>Uploading &amp; securing ZIP in private storage...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div style={{width:'100%',height:'6px',background:'rgba(255,255,255,0.1)',borderRadius:'3px',overflow:'hidden'}}>
                          <div style={{width:`${uploadProgress}%`,height:'100%',background:'#2563EB',transition:'width 0.2s ease'}} />
                        </div>
                      </div>
                    )}

                    {/* Current File Info or Empty State */}
                    {form.zip_file_name || form.zip_storage_key ? (
                      <div style={{
                        background:'rgba(0,0,0,0.3)',
                        border:'1px solid rgba(52,211,153,0.3)',
                        borderRadius:'6px',
                        padding:'12px 14px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'space-between',
                        gap:'10px',
                        flexWrap:'wrap'
                      }}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <FileArchive size={18} style={{color:'#34D399'}} />
                          <div>
                            <div style={{fontSize:'12px',fontWeight:600,color:'#34D399',fontFamily:'JetBrains Mono,monospace'}}>
                              {form.zip_file_name || 'project-deliverable.zip'}
                            </div>
                            <div style={{fontSize:'11px',color:'var(--text-faint)'}}>
                              {form.zip_file_size > 0 ? `${(form.zip_file_size / (1024 * 1024)).toFixed(1)} MB • ` : ''}
                              Version {form.zip_version || 1} • Secured in Private Storage
                            </div>
                          </div>
                        </div>

                        <div style={{display:'flex',gap:'8px'}}>
                          <label className="btn btn-ghost btn-sm" style={{cursor:uploadingZip ? 'not-allowed' : 'pointer',display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11px'}}>
                            <input
                              type="file"
                              accept=".zip,application/zip,application/x-zip-compressed"
                              style={{display:'none'}}
                              onChange={handleZipFileChange}
                              disabled={uploadingZip}
                            />
                            <RefreshCw size={12} /> Replace ZIP
                          </label>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{color:'var(--red)',display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'11px'}}
                            onClick={handleRemoveZip}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{textAlign:'center',padding:'20px',border:'2px dashed rgba(255,255,255,0.12)',borderRadius:'8px'}}>
                        <UploadCloud size={28} style={{color:'var(--text-faint)',marginBottom:'6px'}} />
                        <div style={{fontSize:'13px',fontWeight:600,color:'var(--text-secondary)'}}>
                          Attach Project Source Code ZIP
                        </div>
                        <p style={{fontSize:'11px',color:'var(--text-faint)',margin:'4px 0 12px'}}>
                          Archive will be securely saved to private bucket storage. Buyers receive a signed 5-minute link upon payment.
                        </p>
                        <label className="btn btn-primary btn-sm" style={{cursor:uploadingZip ? 'not-allowed' : 'pointer',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                          <input
                            type="file"
                            accept=".zip,application/zip,application/x-zip-compressed"
                            style={{display:'none'}}
                            onChange={handleZipFileChange}
                            disabled={uploadingZip}
                          />
                          Browse &amp; Upload ZIP (Max 200MB)
                        </label>
                      </div>
                    )}

                    {zipUploadError && (
                      <div style={{color:'var(--red)',fontSize:'12px',marginTop:'8px',display:'flex',alignItems:'center',gap:'5px'}}>
                        <AlertCircle size={13} /> {zipUploadError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Project Metadata */}
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input className="form-input" value={form.title} onChange={f('title')} placeholder="e.g. AI-Powered Dermatology Diagnostic Platform" required />
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
                <input className="form-input" value={form.short_description} onChange={f('short_description')} placeholder="One-line summary for catalog cards" />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description &amp; Architecture</label>
                <textarea className="form-input" rows={4} style={{resize:'vertical'}} value={form.full_description} onChange={f('full_description')} placeholder="Comprehensive description, system components, key features..." />
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div className="form-group">
                  <label className="form-label">Tech Stack</label>
                  <input className="form-input" value={form.tech_stack} onChange={f('tech_stack')} placeholder="e.g. Next.js, FastAPI, Groq Vision, Docker" />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input className="form-input" value={form.estimated_duration} onChange={f('estimated_duration')} placeholder="e.g. 6 - 8 Weeks" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Objectives <span style={{color:'var(--text-faint)',fontWeight:400}}>(one per line)</span></label>
                <textarea className="form-input" rows={3} style={{resize:'vertical'}} value={form.objectives} onChange={f('objectives')} placeholder="Develop multimodal computer vision pipelines&#10;Implement voice synthesis for interactions&#10;Construct RAG-powered clinical chatbot" />
              </div>

              <div className="form-group">
                <label className="form-label">Prerequisites</label>
                <input className="form-input" value={form.prerequisites} onChange={f('prerequisites')} placeholder="e.g. Python, Docker, PyTorch" />
              </div>

              {/* Status for non-premium projects if premium is off */}
              {!form.is_premium && (
                <div className="form-group">
                  <label className="form-label">Publishing Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={val => setForm({...form, status: val})}
                    options={STATUSES}
                  />
                </div>
              )}

              {error && (
                <div className="form-error show" style={{marginBottom:'16px',display:'flex',alignItems:'center',gap:'6px'}}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'24px',borderTop:'1px solid var(--border)',paddingTop:'16px'}}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploadingZip}>
                  {saving ? 'Saving Project...' : editItem ? 'Save All Changes' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
