import React, { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api, API_BASE } from "../../utils/api";
import StudentLayout from "../../components/StudentLayout";
import UpiPaymentModal from "../../components/UpiPaymentModal";
import { 
  ArrowLeft, Clock, ArrowRight, CheckCircle2, Download, 
  ExternalLink, FileArchive, Star, ShoppingBag, ShieldCheck, 
  AlertCircle, Sparkles, Check, Smartphone
} from "lucide-react";

function GithubIcon({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const difficultyConfig = {
  Beginner:     { color:"var(--green)",  bg:"var(--green-soft)",  border:"var(--green-border)" },
  Intermediate: { color:"var(--orange)", bg:"var(--orange-soft)", border:"var(--orange-border)" },
  Advanced:     { color:"var(--red)",    bg:"var(--red-soft)",    border:"var(--red-border)" },
};

function parseTechStack(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { /* ignore fallback */ }
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function resumeValue(d) {
  return d === "Advanced" ? 4.8 : d === "Beginner" ? 3.0 : 3.8;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CatalogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Checkout & Payment State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showUpiModal, setShowUpiModal]           = useState(false);
  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  useEffect(() => {
    if (user?.email) {
      setBuyerEmail(user.email);
      setBuyerName(user.name || "Student");
    }
  }, [user]);

  useEffect(() => {
    api("GET", `/api/catalog/${id}`)
      .then(p => {
        setProject(p);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load project details");
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <StudentLayout title="Loading..." subtitle="">
      <div style={{ textAlign:"center", padding:"80px 0", color:"var(--text-faint)" }}>
        Loading project specifications...
      </div>
    </StudentLayout>
  );

  if (error || !project) return (
    <StudentLayout title="Not Found" subtitle="">
      <div style={{ padding:"60px", textAlign:"center", color:"var(--red)" }}>
        {error || "Project not found."}
        <br/>
        <Link to="/browse" className="btn btn-ghost btn-sm" style={{ marginTop:"16px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    </StudentLayout>
  );

  const diff    = difficultyConfig[project.difficulty] || difficultyConfig.Intermediate;
  const tech    = parseTechStack(project.tech_stack);
  const resume  = resumeValue(project.difficulty);
  const objs    = Array.isArray(project.objectives) ? project.objectives : [];
  const isPremium = Boolean(project.is_premium);
  const price = Number(project.price || 0);

  const downloadUrl = (project?.zip_url && (project.zip_url.startsWith('http://') || project.zip_url.startsWith('https://')))
    ? project.zip_url
    : (project?.zip_url && project.zip_url.startsWith('/downloads/'))
      ? project.zip_url
      : `/api/catalog/${project?.id}/download`;

  const downloadFilename = (project?.zip_url && project.zip_url.includes('.'))
    ? project.zip_url.split('/').pop()
    : `${(project?.title || 'project').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

  // Start Razorpay Checkout flow
  const handleInitiatePurchase = async () => {
    if (!user && (!buyerEmail || !buyerEmail.includes('@'))) {
      setShowCheckoutModal(true);
      return;
    }

    setPaying(true);
    setPaymentError("");

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay checkout failed to load. Please check your internet connection.");
      }

      // 1. Create order on server (server verifies price directly from database)
      const orderData = await api("POST", "/api/orders", {
        projectId: project.id,
        buyerEmail: buyerEmail.trim().toLowerCase(),
        buyerName: buyerName.trim() || "Student",
      });

      // 2. Open Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "JobZen",
        description: `Project Source Code: ${project.title.slice(0, 30)}`,
        order_id: orderData.orderId,
        prefill: {
          name: buyerName,
          email: buyerEmail,
        },
        theme: {
          color: "#2563EB",
        },
        handler: async (response) => {
          try {
            // 3. Verify signature on server
            const verifyRes = await api("POST", "/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              buyerEmail,
              buyerName,
            });

            setShowCheckoutModal(false);
            setPurchaseSuccess({
              projectId: project.id,
              paymentId: response.razorpay_payment_id,
              title: project.title,
            });
          } catch (verifyErr) {
            setPaymentError(verifyErr.message || "Payment verification failed.");
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setPaymentError(response.error.description || "Payment failed");
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || "Could not initialize checkout.");
      setPaying(false);
    }
  };

  return (
    <StudentLayout title="Project Details" subtitle="Full project overview">
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"32px 16px 80px" }}>
        {/* Top bar: Back link */}
        <Link
          to="/browse"
          className="btn btn-ghost btn-sm"
          style={{ display:"inline-flex", alignItems:"center", gap:"6px", marginBottom:"20px", paddingLeft:0 }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* -- Header card -- */}
        <div className="card" style={{ padding:"28px", marginBottom:"24px", position:"relative", overflow:"hidden" }}>
          {/* Difficulty badge & Pricing pill */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <span
                style={{
                  fontSize:"11px",
                  fontWeight:700,
                  letterSpacing:"0.06em",
                  textTransform:"uppercase",
                  padding:"3px 10px",
                  borderRadius:"100px",
                  color: diff.color,
                  background: diff.bg,
                  border: `1px solid ${diff.border}`,
                }}
              >
                {project.difficulty}
              </span>

              {isPremium && (
                <span style={{
                  fontSize:"11px",
                  fontWeight:800,
                  fontFamily:"JetBrains Mono, monospace",
                  color:"#F59E0B",
                  background:"rgba(245,158,11,0.12)",
                  border:"1px solid rgba(245,158,11,0.3)",
                  padding:"3px 10px",
                  borderRadius:"100px",
                  display:"inline-flex",
                  alignItems:"center",
                  gap:"4px"
                }}>
                  <Star size={11} fill="#F59E0B" /> Premium Deliverable
                </span>
              )}
            </div>

            {/* Price or Duration */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              {isPremium && (
                <div style={{ fontSize:"22px", fontWeight:900, color:"#F59E0B", fontFamily:"Plus Jakarta Sans, sans-serif" }}>
                  ₹{price.toLocaleString('en-IN')}
                </div>
              )}
              {project.estimated_duration && (
                <span style={{ fontSize:"12px", color:"var(--text-muted)", display:"inline-flex", alignItems:"center", gap:"5px" }}>
                  <Clock size={13} /> {project.estimated_duration}
                </span>
              )}
            </div>
          </div>

          <h1 style={{ fontSize:"24px", fontWeight:800, marginTop:"12px", marginBottom:"8px", lineHeight:1.3 }}>
            {project.title}
          </h1>

          <div style={{ fontSize:"12px", fontFamily:"JetBrains Mono, monospace", color:"var(--primary)", marginBottom:"14px" }}>
            {project.domain}
          </div>

          <p style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:1.6, margin:0 }}>
            {project.short_description}
          </p>

          {/* Quick stats row */}
          <div style={{ display:"flex", gap:"24px", flexWrap:"wrap", marginTop:"20px", paddingTop:"18px", borderTop:"1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize:"11px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Resume Value</div>
              <div style={{ fontSize:"18px", fontWeight:800, color:"var(--primary)" }}>{resumeValue(project.difficulty)} / 5.0</div>
            </div>
            <div>
              <div style={{ fontSize:"11px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Domain Track</div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"var(--text-primary)", marginTop:"2px" }}>{project.domain}</div>
            </div>
            {project.tech_stack && (
              <div>
                <div style={{ fontSize:"11px", color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Tech Stack</div>
                <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginTop:"4px" }}>
                  {parseTechStack(project.tech_stack).map((t, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize:"11px",
                        background:"var(--surface-raised)",
                        border:"1px solid var(--border)",
                        padding:"2px 8px",
                        borderRadius:"4px",
                        fontFamily:"JetBrains Mono, monospace"
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -- Description card -- */}
        {project.full_description && (
          <div className="card" style={{ padding:"24px", marginBottom:"20px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:700, marginBottom:"12px" }}>Overview &amp; Architecture</h2>
            <div style={{ fontSize:"14px", color:"var(--text-secondary)", lineHeight:1.7, whiteSpace:"pre-line" }}>
              {project.full_description}
            </div>
          </div>
        )}

        {/* -- Objectives -- */}
        {objs.length > 0 && (
          <div className="card" style={{ padding:"24px", marginBottom:"20px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:700, marginBottom:"14px" }}>What You Will Build &amp; Learn</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {objs.map((obj, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                  <CheckCircle2 size={16} style={{ color:"var(--green)", marginTop:"2px", flexShrink:0 }} />
                  <span style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:1.5 }}>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -- Prerequisites -- */}
        {project.prerequisites && (
          <div className="card" style={{ padding:"24px", marginBottom:"20px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:700, marginBottom:"14px" }}>Recommended Prerequisites</h2>
            <div style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:1.6 }}>
              {project.prerequisites}
            </div>
          </div>
        )}

        {/* -- Deliverables & Source Code Card -- */}
        <div className="card" style={{
          padding:"24px",
          marginBottom:"20px",
          background: isPremium ? "rgba(245,158,11,0.03)" : "rgba(37,99,235,0.04)",
          border: isPremium ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(59,130,246,0.25)"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px", marginBottom:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <FileArchive size={18} style={{ color: isPremium ? "#F59E0B" : "#60A5FA" }} />
              <h2 style={{ fontSize:"15px", fontWeight:700, margin:0, letterSpacing:"0.02em" }}>
                PROJECT SOURCE CODE &amp; DELIVERABLES
              </h2>
            </div>
            <span style={{
              fontSize:"11px",
              color: isPremium ? "#F59E0B" : "#34D399",
              background: isPremium ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
              border: `1px solid ${isPremium ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`,
              padding:"3px 8px",
              borderRadius:"6px",
              fontWeight:600
            }}>
              {isPremium ? "Razorpay · UPI · PhonePe Accepted" : "Verified Free Deliverable"}
            </span>
          </div>

          <p style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:1.6, margin:"0 0 16px" }}>
            {isPremium
              ? "This verified project package contains the full source code implementation, neural model weights, container deployment configs, and complete technical documentation. Complete payment to download immediately."
              : "The complete implementation source code, trained neural model pipelines, container setup, and comprehensive documentation are ready for exploration and local deployment."}
          </p>

          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
            {isPremium ? (
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                style={{
                  display:"inline-flex", alignItems:"center", gap:"8px",
                  background:"linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  border:"1px solid rgba(245,158,11,0.5)",
                  color:"#000", padding:"10px 22px", borderRadius:"8px",
                  fontWeight:700, fontSize:"14px", cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(245,158,11,0.3)"
                }}
              >
                <ShoppingBag size={17} />
                Buy via UPI (₹{price.toLocaleString('en-IN')})
              </button>
            ) : (
              project.zip_url && (
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  className="btn"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:"8px",
                    background:"linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    border:"1px solid rgba(59,130,246,0.5)",
                    color:"#fff", padding:"10px 20px", borderRadius:"8px",
                    textDecoration:"none", fontWeight:600, fontSize:"13px",
                    boxShadow:"0 4px 16px rgba(37,99,235,0.35)"
                  }}
                >
                  <Download size={17} />
                  <span>Download Project ZIP</span>
                  <span style={{ fontSize:"10px", opacity:0.85, background:"rgba(0,0,0,0.3)", padding:"2px 6px", borderRadius:"4px", fontFamily:"JetBrains Mono,monospace" }}>
                    ZIP ARCHIVE
                  </span>
                </a>
              )
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{
                  display:"inline-flex",
                  alignItems:"center",
                  gap:"8px",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.14)",
                  padding:"10px 18px",
                  borderRadius:"8px",
                  color:"#fff",
                  textDecoration:"none",
                  fontWeight:600,
                  fontSize:"13px"
                }}
              >
                <GithubIcon size={17} />
                <span>GitHub Repository</span>
                <ExternalLink size={13} style={{ opacity:0.65 }} />
              </a>
            )}
          </div>
        </div>

        {/* -- Bottom CTA Bar -- */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px", marginTop:"12px" }}>
          <div>
            <Link to="/browse" className="btn btn-ghost btn-sm" style={{ display:"inline-flex", alignItems:"center", gap:"6px" }}>
              <ArrowLeft size={14} /> Back to Catalog
            </Link>
          </div>

          <div style={{ display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap" }}>
            {isPremium ? (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => setShowUpiModal(true)}
                style={{
                  background:"linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  color:"#000",
                  fontWeight:700,
                  border:"none"
                }}
              >
                <ShoppingBag size={17} /> Buy via UPI (₹{price})
              </button>
            ) : (
              <Link to={`/request?catalog_id=${project.id}`} className="btn btn-primary btn-lg">
                Request This Project <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Guest Checkout Info Modal */}
      {showCheckoutModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(4px)'}} onClick={() => setShowCheckoutModal(false)}>
          <div className="card" style={{width:'100%',maxWidth:'440px',padding:'28px'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h3 style={{margin:0,fontSize:'17px',display:'flex',alignItems:'center',gap:'8px'}}>
                <ShoppingBag size={18} style={{color:'#F59E0B'}} /> Purchase Deliverable
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-faint)'}}>✕</button>
            </div>

            <p style={{fontSize:'13px',color:'var(--text-secondary)',margin:'0 0 16px',lineHeight:1.5}}>
              Enter your email address where you will receive the order receipt and instant ZIP download link:
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleInitiatePurchase(); }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  required
                />
              </div>

              <div style={{
                background:'rgba(245,158,11,0.06)',
                border:'1px solid rgba(245,158,11,0.25)',
                borderRadius:'6px',
                padding:'12px',
                marginBottom:'16px',
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center'
              }}>
                <span style={{fontSize:'13px',color:'var(--text-secondary)'}}>Total Amount:</span>
                <span style={{fontSize:'18px',fontWeight:800,color:'#F59E0B'}}>₹{price.toLocaleString('en-IN')}</span>
              </div>

              {paymentError && (
                <div style={{color:'var(--red)',fontSize:'12px',marginBottom:'14px',display:'flex',alignItems:'center',gap:'5px'}}>
                  <AlertCircle size={14} /> {paymentError}
                </div>
              )}

              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={paying}
                  style={{background:'#F59E0B',color:'#000',fontWeight:700,border:'none'}}
                >
                  {paying ? "Opening..." : "Proceed to Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Success Celebration Modal */}
      {purchaseSuccess && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(5px)'}}>
          <div className="card" style={{width:'100%',maxWidth:'480px',padding:'32px',textAlign:'center'}}>
            <div style={{
              width:'56px',
              height:'56px',
              borderRadius:'50%',
              background:'rgba(52,211,153,0.15)',
              color:'#34D399',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              margin:'0 auto 16px'
            }}>
              <Check size={28} />
            </div>

            <h3 style={{fontSize:'20px',fontWeight:800,margin:'0 0 8px',color:'var(--text-primary)'}}>
              Payment Confirmed! 🎉
            </h3>
            <p style={{fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.6,margin:'0 0 20px'}}>
              Thank you for purchasing <strong>{purchaseSuccess.title}</strong>. Your project package is ready for instant download. A confirmation receipt has also been sent to your email.
            </p>

            <div style={{
              background:'rgba(255,255,255,0.03)',
              border:'1px solid var(--border)',
              borderRadius:'8px',
              padding:'14px',
              marginBottom:'20px',
              fontSize:'12px',
              color:'var(--text-faint)'
            }}>
              Payment ID: <code style={{color:'#34D399'}}>{purchaseSuccess.paymentId}</code>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.location.href = `${API_BASE}/api/download/${purchaseSuccess.projectId}`;
                }}
                style={{
                  display:'inline-flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:'8px',
                  background:'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  padding:'12px',
                  fontSize:'14px',
                  fontWeight:700
                }}
              >
                <Download size={16} /> Download Project ZIP Archive
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => navigate('/purchases')}
                style={{fontSize:'13px'}}
              >
                View in My Purchases &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPI Payment Modal ── */}
      {showUpiModal && (
        <UpiPaymentModal
          project={{ id: project.id, title: project.title, price }}
          buyerName={buyerName}
          buyerEmail={buyerEmail}
          onClose={() => setShowUpiModal(false)}
          onSuccess={() => {}}
        />
      )}
    </StudentLayout>
  );
}
