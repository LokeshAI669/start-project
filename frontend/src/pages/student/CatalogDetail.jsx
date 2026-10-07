import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api, API_BASE } from "../../utils/api";
import StudentLayout from "../../components/StudentLayout";
import { 
  ArrowLeft, Clock, ArrowRight, CheckCircle2, Download, 
  ExternalLink, FileArchive, ShieldCheck,
  AlertCircle
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

export default function CatalogDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const objs    = Array.isArray(project.objectives) ? project.objectives : [];

  // Determine the best download URL for the project
  const downloadUrl = (project?.zip_url && (project.zip_url.startsWith('http://') || project.zip_url.startsWith('https://')))
    ? project.zip_url
    : (project?.zip_url && project.zip_url.startsWith('/downloads/'))
      ? project.zip_url
      : project?.zip_storage_key
        ? `${API_BASE}/api/download/${project?.id}`
        : null;

  const downloadFilename = (project?.zip_url && project.zip_url.includes('.'))
    ? project.zip_url.split('/').pop()
    : `${(project?.title || 'project').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

  const hasDownload = !!downloadUrl;

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
          {/* Difficulty badge & FREE badge */}
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

              {/* Always show FREE badge — all projects are free for students */}
              <span style={{
                fontSize:"11px",
                fontWeight:800,
                color:"#34D399",
                background:"rgba(52,211,153,0.12)",
                border:"1px solid rgba(52,211,153,0.35)",
                padding:"3px 10px",
                borderRadius:"100px",
                display:"inline-flex",
                alignItems:"center",
                gap:"4px"
              }}>
                ✦ Free for Students
              </span>
            </div>

            {project.estimated_duration && (
              <span style={{ fontSize:"12px", color:"var(--text-muted)", display:"inline-flex", alignItems:"center", gap:"5px" }}>
                <Clock size={13} /> {project.estimated_duration}
              </span>
            )}
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
          background: "rgba(37,99,235,0.04)",
          border: "1px solid rgba(59,130,246,0.25)"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px", marginBottom:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <FileArchive size={18} style={{ color:"#60A5FA" }} />
              <h2 style={{ fontSize:"15px", fontWeight:700, margin:0, letterSpacing:"0.02em" }}>
                PROJECT SOURCE CODE &amp; DELIVERABLES
              </h2>
            </div>
            <span style={{
              fontSize:"11px",
              color:"#34D399",
              background:"rgba(16,185,129,0.12)",
              border:"1px solid rgba(16,185,129,0.3)",
              padding:"3px 8px",
              borderRadius:"6px",
              fontWeight:600
            }}>
              Free for All Students
            </span>
          </div>

          <p style={{ fontSize:"13px", color:"var(--text-secondary)", lineHeight:1.6, margin:"0 0 16px" }}>
            The complete implementation source code, trained neural model pipelines, container setup, and comprehensive documentation are ready for exploration and local deployment — completely free for all students.
          </p>

          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
            {hasDownload ? (
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
                  FREE ZIP
                </span>
              </a>
            ) : (
              <div style={{
                display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.1)",
                color:"var(--text-faint)", padding:"10px 20px", borderRadius:"8px",
                fontSize:"13px",
              }}>
                <AlertCircle size={15} />
                <span>Download coming soon — check GitHub below</span>
              </div>
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

          {/* Security / integrity note */}
          <div style={{
            marginTop:"16px",
            paddingTop:"12px",
            borderTop:"1px solid var(--border)",
            display:"flex",
            alignItems:"center",
            gap:"6px",
            fontSize:"12px",
            color:"var(--text-faint)"
          }}>
            <ShieldCheck size={14} style={{ color:"#34D399" }} />
            All projects are verified, regularly updated, and freely available to enrolled students.
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
            <Link to={`/request?catalog_id=${project.id}`} className="btn btn-primary btn-lg">
              Request This Project <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
