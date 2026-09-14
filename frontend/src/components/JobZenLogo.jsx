import React from 'react';

/**
 * HireProject Logo
 * - "H" and "P" are bold + orange-to-red gradient
 * - "ire" and "roject" are thin/light in white
 * - C-shaped box fades to the right above the text
 * - Underline swoosh below
 */
export default function JobZenLogo({ theme = 'dark', size = 'md' }) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111111';
  const wwwColor  = theme === 'dark' ? '#FFFFFF' : '#333333';
  const orange    = '#FF7A00';
  const red       = '#E31A1A';

  const scales = { sm: 0.45, md: 0.6, lg: 1.0 };
  const s = scales[size] || 0.75;
  const W = Math.round(280 * s);
  const H = Math.round(90  * s);

  const reactId = React.useId();
  const fallbackId = Math.random().toString(36).substring(2,7);
  const idSuffix = reactId ? reactId.replace(/:/g, '') : fallbackId;

  const boxGrad  = `hp-box-${size}-${idSuffix}`;
  const textGrad = `hp-text-${size}-${idSuffix}`;
  const lineGrad = `hp-line-${size}-${idSuffix}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox="0 0 280 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
      aria-label="HireProject Review Portal"
    >
      <defs>
        {/* Box gradient: solid orange on left, fading to transparent red on right */}
        <linearGradient id={boxGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={orange} />
          <stop offset="60%"  stopColor={red} />
          <stop offset="100%" stopColor={red} stopOpacity="0" />
        </linearGradient>

        {/* Text gradient: orange to red */}
        <linearGradient id={textGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={orange} />
          <stop offset="100%" stopColor={red} />
        </linearGradient>

        {/* Line gradient: fades at both ends */}
        <linearGradient id={lineGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={orange} stopOpacity="0" />
          <stop offset="15%"  stopColor={orange} />
          <stop offset="85%"  stopColor={red} />
          <stop offset="100%" stopColor={red}    stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── C-shaped Box fading right ── */}
      <path
        d="M 220 12 L 60 12 A 12 12 0 0 0 60 36 L 220 36"
        stroke={`url(#${boxGrad})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── "www" text inside box ── */}
      <text
        x="67" y="25"
        textAnchor="start"
        dominantBaseline="middle"
        fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
        fontWeight="800"
        fontSize="14"
        fill={wwwColor}
        letterSpacing="2"
      >www</text>

      {/* ── "HireProject" wordmark ── */}
      <text
        x="8" y="72"
        fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
        fontSize="44"
        letterSpacing="-1"
        dominantBaseline="auto"
      >
        {/* H is bold + gradient */}
        <tspan fill={`url(#${textGrad})`} fontWeight="900">H</tspan>
        {/* ire is thin + white */}
        <tspan fill={textColor} fontWeight="300">ire</tspan>
        {/* P is bold + gradient */}
        <tspan fill={`url(#${textGrad})`} fontWeight="900">P</tspan>
        {/* roject is thin + white */}
        <tspan fill={textColor} fontWeight="300">roject</tspan>
      </text>

      {/* ── Underline Swoosh ── */}
      <path
        d="M 6 84 Q 140 77 274 84"
        stroke={`url(#${lineGrad})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
