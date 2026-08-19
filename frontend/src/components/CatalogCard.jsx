import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, GraduationCap, ArrowRight, Star, BarChart3 } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const DIFFICULTY = {
  Beginner:     { label:"Beginner",     color:"#34D399", bg:"rgba(16,185,129,0.10)",  border:"rgba(16,185,129,0.22)" },
  Intermediate: { label:"Intermediate", color:"#60A5FA", bg:"rgba(59,130,246,0.10)",  border:"rgba(59,130,246,0.22)" },
  Advanced:     { label:"Advanced",     color:"#FBBF24", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.22)" },
};

function parseTech(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch (_) {}
  return raw.split(",").map(s => s.trim()).filter(Boolean);
}

function suitableFor(difficulty, duration) {
  if (difficulty === "Advanced") return "Final Year";
  if (difficulty === "Beginner") return "Mini Project";
  const d = parseInt(duration || "0", 10);
  return d >= 8 ? "Final Year" : "Mini Project";
}

function resumeVal(difficulty) {
  return difficulty === "Advanced" ? 4.8 : difficulty === "Beginner" ? 3.0 : 3.8;
}

/** Derive a badge: Trending / Final Year / Beginner Friendly / Resume Builder */
function deriveBadge(p) {
  if (p.difficulty === "Beginner")  return { label:"Beginner Friendly", icon:"🌱", cls:"cc-badge--beginner" };
  if (p.difficulty === "Advanced")  return { label:"Final Year Recommended", icon:"🎓", cls:"cc-badge--finalyear" };
  return                                   { label:"Resume Builder",    icon:"💼", cls:"cc-badge--resume" };
}

function Stars({ value }) {
  return (
    <span className="cc-stars" aria-label={value + " out of 5"}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={11}
          fill={i <= Math.round(value) ? "#FBBF24" : "none"}
          stroke={i <= Math.round(value) ? "#FBBF24" : "#3F3F46"}
          strokeWidth={1.5}
        />
      ))}
      <span className="cc-stars-num">{value}</span>
    </span>
  );
}

// ── CatalogCard ─────────────────────────────────────────────────────────────

export default function CatalogCard({ project: p, featured }) {
  const diff    = DIFFICULTY[p.difficulty] || DIFFICULTY.Intermediate;
  const tech    = useMemo(() => parseTech(p.tech_stack), [p.tech_stack]);
  const shown   = tech.slice(0, 4);
  const extra   = tech.length - shown.length;
  const suitable = suitableFor(p.difficulty, p.estimated_duration);
  const resume  = resumeVal(p.difficulty);
  const badge   = deriveBadge(p);

  return (
    <article className={"cc-card" + (featured ? " cc-card--featured" : "")}>
      {/* Badge strip */}
      <span className={"cc-badge " + badge.cls}>
        <span className="cc-badge-icon">{badge.icon}</span> {badge.label}
      </span>

      {/* Top row: domain + difficulty */}
      <div className="cc-top">
        <span className="cc-domain">{p.domain}</span>
        <span className="cc-diff" style={{ color:diff.color, background:diff.bg, borderColor:diff.border }}>
          {diff.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="cc-title">{p.title}</h3>

      {/* Description */}
      <p className="cc-desc">{p.short_description || "No description available."}</p>

      {/* Tech tags */}
      {shown.length > 0 && (
        <div className="cc-tech">
          {shown.map(t => <span key={t} className="cc-tech-tag">{t}</span>)}
          {extra > 0 && <span className="cc-tech-tag cc-tech-more">+{extra}</span>}
        </div>
      )}

      {/* Meta row with compact icons */}
      <div className="cc-meta">
        {p.estimated_duration && (
          <span className="cc-meta-item" title="Duration">
            <Clock size={12} strokeWidth={2} />
            {p.estimated_duration}
          </span>
        )}
        <span className="cc-meta-item cc-meta-suitable" title="Suitable for">
          <GraduationCap size={12} strokeWidth={2} />
          {suitable}
        </span>
        <span className="cc-meta-item" title="Difficulty">
          <BarChart3 size={12} strokeWidth={2} />
          {diff.label}
        </span>
      </div>

      {/* Resume value */}
      <div className="cc-resume-row">
        <span className="cc-resume-label">Resume Value</span>
        <Stars value={resume} />
      </div>

      {/* Actions */}
      <div className="cc-actions">
        <Link to={"/catalog/" + p.id} className="cc-btn-ghost">
          View Details
        </Link>
        <Link to={"/request?catalog_id=" + p.id} className="cc-btn-primary">
          Request Project <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}