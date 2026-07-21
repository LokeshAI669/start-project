import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';
import JobZenLogo from '../../components/JobZenLogo';


export default function SubmitRequest() {
  const { token, user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const catalogId = searchParams.get('catalog_id');

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget]           = useState('');
  const [currency, setCurrency]       = useState('₹');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [attachment, setAttachment]   = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  useEffect(() => {
    if (catalogId) {
      setLoading(true);
      api('GET', `/api/catalog/${catalogId}`)
        .then(data => {
          if (data) {
            setProjectName(data.title || '');
            let desc = data.short_description || '';
            if (data.full_description) desc += '\n\n' + data.full_description;
            if (data.objectives && data.objectives.length > 0) {
              desc += '\n\nObjectives:\n- ' + data.objectives.join('\n- ');
            }
            if (data.tech_stack) {
              desc += '\n\nTech Stack: ' + data.tech_stack;
            }
            setDescription(desc);
          }
        })
        .catch(err => console.error("Failed to fetch catalog project:", err))
        .finally(() => setLoading(false));
    }
  }, [catalogId]);
  const validateStep1 = () => {
    if (!projectName.trim()) return setError('Project name is required.'), false;
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) return setError('Enter a valid budget.'), false;
    if (!description.trim() || description.length < 20) return setError('Description must be at least 20 characters.'), false;
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!preferredDate) return setError('Meeting date is required.');
    if (!preferredTime) return setError('Meeting time is required.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('project_name', projectName.trim());
      formData.append('budget', Number(budget));
      formData.append('currency', currency);
      formData.append('description', description.trim());
      formData.append('preferred_date', preferredDate);
      formData.append('preferred_time', preferredTime);
      if (catalogId) formData.append('catalog_project_id', catalogId);
      if (attachment) formData.append('attachment', attachment);

      await api('POST', '/api/requests', formData);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div className="card" style={{padding:'48px',textAlign:'center',maxWidth:'440px'}}>
        <div style={{fontSize:'3.5rem',marginBottom:'16px'}}></div>
        <h2 style={{marginBottom:'8px'}}>Request Submitted!</h2>
        <p style={{color:'var(--text-faint)',marginBottom:'28px'}}>Your project request has been submitted. You'll receive an email confirmation shortly.</p>
        <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
          <Link to="/dashboard" className="btn btn-primary">View Dashboard</Link>
          <button className="btn btn-ghost" onClick={() => { setSuccess(false); setStep(1); setProjectName(''); setBudget(''); setDescription(''); setPreferredDate(''); setPreferredTime(''); setAttachment(null); }}>Submit Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',padding:'40px 24px'}}>
      <div style={{maxWidth:'600px',margin:'0 auto',position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
          <JobZenLogo theme={theme} size="sm" />
          <button onClick={() => navigate('/profile')} className="topbar-profile-btn" title="Profile">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{marginBottom:'24px',display:'inline-flex',alignItems:'center',gap:'6px'}}>
           Back to Dashboard
        </Link>

        <h1 style={{fontSize:'1.6rem',fontWeight:800,marginBottom:'6px'}}>Submit Project Request</h1>
        <p style={{color:'var(--text-faint)',fontSize:'13px',marginBottom:'32px'}}>Fill in the details below — your supervisor will be notified.</p>

        {/* Step indicator */}
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'32px'}}>
          {[1, 2].map(n => (
            <React.Fragment key={n}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',background: step >= n ? 'var(--orange)' : 'var(--bg-elevated)',border:`2px solid ${step >= n ? 'var(--orange)' : 'var(--border)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color: step >= n ? '#fff' : 'var(--text-faint)',transition:'all 0.2s ease'}}>{n}</div>
              {n < 2 && <div style={{flex:1,height:'2px',background: step > n ? 'var(--orange)' : 'var(--border)',transition:'background 0.2s ease'}} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{padding:'32px'}}>
          {step === 1 && (
            <>
              <h3 style={{marginTop:0,marginBottom:'24px'}}>Step 1: Project Details</h3>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" type="text" placeholder="e.g. E-Commerce Mobile App" value={projectName} onChange={e => setProjectName(e.target.value)} />
              </div>
              <div style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'12px'}}>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="₹">₹ INR</option>
                    <option value="$">$ USD</option>
                    <option value="₦">₦ NGN</option>
                    <option value="€">€ EUR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget *</label>
                  <input className="form-input" type="number" placeholder="e.g. 50000" value={budget} onChange={e => setBudget(e.target.value)} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Project Description * <span style={{color:'var(--text-faint)',fontWeight:400}}>(min 20 chars)</span></label>
                <textarea className="form-input" rows={5} style={{resize:'vertical'}} placeholder="Describe your project goals, features, and requirements..." value={description} onChange={e => setDescription(e.target.value)} />
                <div style={{textAlign:'right',fontSize:'11px',color: description.length < 20 ? 'var(--red)' : 'var(--text-faint)',marginTop:'4px'}}>{description.length} / 20 min</div>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Attachment <span style={{color:'var(--text-faint)',fontWeight:400}}>(optional)</span></label>
                {attachment ? (
                  <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',background:'var(--bg-elevated)',borderRadius:'8px',border:'1px solid var(--border)'}}>
                    <span style={{flex:1,fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{attachment.name}</span>
                    <button type="button" onClick={() => setAttachment(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)'}}></button>
                  </div>
                ) : (
                  <label style={{display:'flex',alignItems:'center',gap:'8px',padding:'12px 16px',border:'2px dashed var(--border)',borderRadius:'8px',cursor:'pointer',color:'var(--text-faint)',fontSize:'13px',transition:'all 0.2s'}}>
                     Click to upload a file
                    <input type="file" style={{display:'none'}} onChange={e => setAttachment(e.target.files[0])} />
                  </label>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{marginTop:0,marginBottom:'24px'}}>Step 2: Meeting Preference</h3>
              <div style={{background:'var(--bg-elevated)',borderRadius:'10px',padding:'16px 18px',marginBottom:'24px',border:'1px solid var(--border)'}}>
                <div style={{fontSize:'12px',color:'var(--text-faint)',marginBottom:'4px'}}>Project</div>
                <div style={{fontWeight:700}}>{projectName}</div>
                <div style={{color:'var(--orange)',fontSize:'13px',marginTop:'2px'}}>{currency}{Number(budget).toLocaleString('en-IN')}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Meeting Date *</label>
                <input className="form-input" type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Meeting Time *</label>
                <input className="form-input" type="time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} />
              </div>
            </>
          )}

          {error && <div className="form-error show" style={{marginTop:'16px'}}>{error}</div>}

          <div style={{display:'flex',gap:'12px',marginTop:'28px',justifyContent:'flex-end'}}>
            {step === 2 && <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>}
            {step === 1 && <button className="btn btn-primary" onClick={handleNext}>Next Step →</button>}
            {step === 2 && (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
