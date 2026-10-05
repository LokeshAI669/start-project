import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../utils/api";
import StudentLayout from "../../components/StudentLayout";
import { ArrowLeft, Clock, ArrowRight, CheckCircle2, Download, ExternalLink, FileArchive } from "lucide-react";

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
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("GET", `/api/catalog/${id}`)
      .then(setProject)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <StudentLayout title="Project Details" subtitle="">
      <div style={{ padding:"60px", textAlign:"center", color:"var(--text-faint)" }}>Loading...</div>
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

  const downloadUrl = (project?.zip_url && (project.zip_url.startsWith('http://') || project.zip_url.startsWith('https://')))
    ? project.zip_url
    : (project?.zip_url && project.zip_url.startsWith('/downloads/'))
      ? project.zip_url
      : `/api/catalog/${project?.id}/download`;

  const downloadFilename = (project?.zip_url && project.zip_url.includes('.'))
    ? project.zip_url.split('/').pop()
    : `${(project?.title || 'project').replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

  return (
    <StudentLayout title="Project Details" subtitle="Full project overview">
      <div style={{ maxWidth:"820px", margin:"0 auto" }}>
        <Link to="/browse" className="btn btn-ghost btn-sm" style={{ marginBottom:"24px", display:"inline-flex", alignItems:"center", gap:"6px" }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        {/* -- Header card -- */}
        <div className="card" style={{ padding:"28px 32px", marginBottom:"18px" }}>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"14px" }}>
            <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"9px", textTransform:"uppercase", letterSpacing:".08em", color:"var(--orange)", background:"var(--orange-soft)", border:"1px solid var(--orange-border)", padding:"3px 10px", borderRadius:"99px" }}>
              {project.domain}
            </span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontFamily:"JetBrains Mono,monospace", fontSize:"10px", fontWeight:600, color:diff.color, background:diff.bg, border:`1px solid ${diff.border}`, padding:"3px 10px", borderRadius:"6px" }}>
              {project.difficulty}
            </span>
            {project.estimated_duration && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontFamily:"JetBrains Mono,monospace", fontSize:"10px", color:"var(--text-faint)", background:"var(--bg-elevated)", border:"1px solid var(--border)", padding:"3px 10px", borderRadius:"6px" }}>
                <Clock size={11}/> {project.estimated_duration}
              </span>
            )}
            <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontFamily:"JetBrains Mono,monospace", fontSize:"10px", color:"var(--text-faint)", background:"var(--bg-elevated)", border:"1px solid var(--border)", padding:"3px 10px", borderRadius:"6px" }}>
              ★ Resume Value: {resume}/5
            </span>
          </div>
          <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.03em", marginBottom:"12px" }}>{project.title}</h1>
          {project.short_description && (
            <p style={{ color:"var(--text-secondary)", lineHeight:"1.7", margin:0 }}>{project.short_description}</p>
          )}
        </div>

        {/* -- Tech stack -- */}
        {tech.length > 0 && (
          <div className="card" style={{ padding:"22px 28px", marginBottom:"18px" }}>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"10px", textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:"14px" }}>Technology Stack</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {tech.map(tag => (
                <span key={tag} style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"11px", fontWeight:600, color:"var(--orange)", background:"var(--orange-soft)", border:"1px solid var(--orange-border)", padding:"4px 12px", borderRadius:"6px" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* -- Full description -- */}
        {project.full_description && (
          <div className="card" style={{ padding:"24px 28px", marginBottom:"18px" }}>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"10px", textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:"12px" }}>Project Description</div>
            <p style={{ lineHeight:"1.75", margin:0, color:"var(--text-secondary)", whiteSpace:"pre-wrap" }}>{project.full_description}</p>
          </div>
        )}

        {/* -- Objectives -- */}
        {objs.length > 0 && (
          <div className="card" style={{ padding:"24px 28px", marginBottom:"18px" }}>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"10px", textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:"14px" }}>Learning Objectives</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {objs.map((o, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                  <CheckCircle2 size={15} style={{ color:"var(--green)", flexShrink:0, marginTop:"2px" }} />
                  <span style={{ fontSize:"13.5px", color:"var(--text-secondary)", lineHeight:"1.6" }}>{o}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -- Prerequisites -- */}
        {project.prerequisites && (
          <div className="card" style={{ padding:"22px 28px", marginBottom:"18px" }}>
            <div style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"10px", textTransform:"uppercase", letterSpacing:".08em", color:"var(--text-faint)", marginBottom:"10px" }}>Prerequisites</div>
            <p style={{ margin:0, fontSize:"13.5px", color:"var(--text-secondary)", lineHeight:"1.7" }}>{project.prerequisites}</p>
          </div>
        )}

        {/* -- Deliverables & Source Code -- */}
        {(project.github_url || project.zip_url) && (
          <div className="card" style={{
            padding:"26px 30px",
            marginBottom:"20px",
            border:"1px solid rgba(59, 130, 246, 0.35)",
            background:"linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, rgba(24, 24, 27, 0.8) 100%)",
            boxShadow:"0 8px 30px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <FileArchive size={17} style={{ color:"#60A5FA" }} />
                <span style={{ fontFamily:"JetBrains Mono,monospace", fontSize:"11px", textTransform:"uppercase", letterSpacing:".08em", color:"#60A5FA", fontWeight:700 }}>
                  Project Source Code & Deliverables
                </span>
              </div>
              <span style={{ fontSize:"11px", color:"var(--green)", background:"var(--green-soft)", border:"1px solid var(--green-border)", padding:"3px 10px", borderRadius:"99px", fontWeight:600 }}>
                Verified Deliverable Available
              </span>
            </div>
            
            <p style={{ fontSize:"13.5px", color:"var(--text-secondary)", lineHeight:"1.65", margin:"0 0 18px 0" }}>
              The complete implementation source code, trained neural model pipelines, container setup, and complete documentation are ready for exploration and local deployment.
            </p>

            <div style={{ display:"flex", flexWrap:"wrap", gap:"12px" }}>
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

              {project.zip_url && (
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  className="btn"
                  style={{
                    display:"inline-flex",
                    alignItems:"center",
                    gap:"8px",
                    background:"linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    border:"1px solid rgba(59,130,246,0.5)",
                    color:"#fff",
                    padding:"10px 20px",
                    borderRadius:"8px",
                    textDecoration:"none",
                    fontWeight:600,
                    fontSize:"13px",
                    boxShadow:"0 4px 16px rgba(37,99,235,0.35)"
                  }}
                >
                  <Download size={17} />
                  <span>Download Project ZIP</span>
                  <span style={{ fontSize:"10px", opacity:0.85, background:"rgba(0,0,0,0.3)", padding:"2px 6px", borderRadius:"4px", fontFamily:"JetBrains Mono,monospace" }}>
                    ZIP ARCHIVE
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* -- CTA -- */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px", marginTop:"12px" }}>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none" }}
              >
                <GithubIcon size={14} /> GitHub
              </a>
            )}
            {project.zip_url && (
              <a
                href={downloadUrl}
                download={downloadFilename}
                className="btn btn-ghost btn-sm"
                style={{ display:"inline-flex", alignItems:"center", gap:"6px", textDecoration:"none", color:"#60A5FA" }}
              >
                <Download size={14} /> Download ZIP
              </a>
            )}
          </div>

          <Link to={`/request?catalog_id=${project.id}`} className="btn btn-primary btn-lg">
            Request This Project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
