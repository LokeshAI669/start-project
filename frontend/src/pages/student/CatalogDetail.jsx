import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import StudentLayout from "../../components/StudentLayout";
import { ArrowLeft, Clock, Bookmark, ArrowRight, CheckCircle2 } from "lucide-react";

const difficultyConfig = {
  Beginner:     { color:"var(--green)",  bg:"var(--green-soft)",  border:"var(--green-border)" },
  Intermediate: { color:"var(--orange)", bg:"var(--orange-soft)", border:"var(--orange-border)" },
  Advanced:     { color:"var(--red)",    bg:"var(--red-soft)",    border:"var(--red-border)" },
};

function parseTechStack(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch (_) {}
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function resumeValue(d) {
  return d === "Advanced" ? 4.8 : d === "Beginner" ? 3.0 : 3.8;
}

export default function CatalogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
        <Link to="/browse" className="btn btn-ghost btn-sm" style={{ marginTop:"16px" }}>? Back to Catalog</Link>
      </div>
    </StudentLayout>
  );

  const diff    = difficultyConfig[project.difficulty] || difficultyConfig.Intermediate;
  const tech    = parseTechStack(project.tech_stack);
  const resume  = resumeValue(project.difficulty);
  const objs    = Array.isArray(project.objectives) ? project.objectives : [];

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
              ? Resume Value: {resume}/5
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

        {/* -- CTA -- */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"8px" }}>
          <Link to={`/request?catalog_id=${project.id}`} className="btn btn-primary btn-lg">
            Request This Project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
