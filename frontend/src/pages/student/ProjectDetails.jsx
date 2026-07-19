import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { api } from '../../utils/api';


const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtCurrency = (c, b) => `${c || '₹'}${Number(b).toLocaleString('en-IN')}`;

export default function ProjectDetails() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling]     = useState(false);
  const [rescheduleMsg, setRescheduleMsg]   = useState('');
  const [showReschedule, setShowReschedule] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!projectId) { navigate('/dashboard'); return; }
    fetchProject();
  }, [token, projectId]);

  const fetchProject = async () => {
    try {
      const data = await api('GET', '/api/requests/mine');
      const found = data.find(r => r.id === Number(projectId));
      if (!found) { navigate('/dashboard'); return; }
      setProject(found);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) return setRescheduleMsg('Both date and time are required.');
    setRescheduling(true);
    setRescheduleMsg('');
    try {
      const updated = await api('PATCH', `/api/requests/${projectId}/reschedule`, {
        preferred_date: rescheduleDate,
        preferred_time: rescheduleTime,
      });
      setProject(updated);
      setShowReschedule(false);
      setRescheduleMsg('');
    } catch (e) {
      setRescheduleMsg(e.message);
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'var(--text-faint)'}}>Loading...</div>;
  if (error)   return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',color:'var(--red)'}}>{error}</div>;
  if (!project) return null;

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',padding:'40px 24px'}}>
      <div style={{maxWidth:'760px',margin:'0 auto'}}>
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{marginBottom:'24px',display:'inline-flex',alignItems:'center',gap:'6px'}}>
           Back to Dashboard
        </Link>

        <div className="card" style={{marginBottom:'20px',padding:'28px 32px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px'}}>
            <div>
              <h2 style={{margin:0,fontSize:'1.5rem',fontWeight:800}}>{project.project_name}</h2>
              <div style={{color:'var(--text-faint)',fontSize:'13px',marginTop:'4px'}}>
                Submitted {fmtDate(project.created_at)}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              {project.status === 'Accepted' && <span className="badge badge-accepted">Accepted</span>}
              {project.status === 'Denied'   && <span className="badge badge-denied">Denied</span>}
              {project.status === 'Pending'  && <span className="badge badge-pending">Pending</span>}
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
          <div className="card" style={{padding:'20px 24px'}}>
            <div style={{color:'var(--text-faint)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}>Budget</div>
            <div style={{fontSize:'1.4rem',fontWeight:800,color:'var(--orange)'}}>{fmtCurrency(project.currency, project.budget)}</div>
          </div>
          <div className="card" style={{padding:'20px 24px'}}>
            <div style={{color:'var(--text-faint)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}>Requested Meeting</div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',fontWeight:600}}>
               {fmtDate(project.preferred_date)}
               {project.preferred_time}
            </div>
          </div>
        </div>

        {project.confirmed_date && (
          <div className="card" style={{padding:'20px 24px',marginBottom:'20px',borderColor:'var(--green-border)',background:'var(--green-soft)'}}>
            <div style={{color:'var(--green)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}> Confirmed Meeting</div>
            <div style={{fontSize:'14px',fontWeight:600}}>
              {fmtDate(project.confirmed_date)} at {project.confirmed_time}
            </div>
          </div>
        )}

        <div className="card" style={{padding:'24px 28px',marginBottom:'20px'}}>
          <div style={{color:'var(--text-faint)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px',fontFamily:'JetBrains Mono,monospace'}}>Description</div>
          <p style={{lineHeight:'1.7',margin:0,color:'var(--text-secondary)'}}>{project.description}</p>
        </div>

        {project.admin_note && (
          <div className="card" style={{padding:'20px 24px',marginBottom:'20px',borderColor: project.status==='Accepted' ? 'var(--green-border)' : 'var(--red-border)',background: project.status==='Accepted' ? 'var(--green-soft)' : 'var(--red-soft)'}}>
            <div style={{color: project.status==='Accepted' ? 'var(--green)' : 'var(--red)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}>Admin Note</div>
            <p style={{margin:0,lineHeight:'1.6'}}>{project.admin_note}</p>
          </div>
        )}

        {project.attachment_url && (
          <div className="card" style={{padding:'20px 24px',marginBottom:'20px'}}>
            <div style={{color:'var(--text-faint)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'8px',fontFamily:'JetBrains Mono,monospace'}}>Attachment</div>
            <a href={`http://localhost:3000${project.attachment_url}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"> View Attachment</a>
          </div>
        )}

        {project.status === 'Denied' && (
          <div className="card" style={{padding:'24px 28px'}}>
            <h3 style={{marginTop:0,marginBottom:'16px'}}>Request Reschedule</h3>
            <p style={{color:'var(--text-faint)',fontSize:'13px',marginBottom:'20px'}}>Your request was denied. You can request a new meeting date below.</p>
            {!showReschedule && (
              <button className="btn btn-primary" onClick={() => setShowReschedule(true)}>Reschedule Meeting</button>
            )}
            {showReschedule && (
              <form onSubmit={handleReschedule}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">New Date</label>
                    <input type="date" className="form-input" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="form-group" style={{marginBottom:0}}>
                    <label className="form-label">New Time</label>
                    <input type="time" className="form-input" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} required />
                  </div>
                </div>
                {rescheduleMsg && <div className="form-error show" style={{marginBottom:'12px'}}>{rescheduleMsg}</div>}
                <div style={{display:'flex',gap:'10px'}}>
                  <button type="submit" className="btn btn-primary" disabled={rescheduling}>{rescheduling ? 'Submitting...' : 'Confirm Reschedule'}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowReschedule(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
