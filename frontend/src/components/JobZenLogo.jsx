import React from 'react';

/**
 * JobZen Logo — Exact match to the final reference image:
 * - C-shaped box (fades out on the right) containing "www" above "obZ"
 * - "J" and "Z" are bold and use an orange-to-red gradient
 * - "ob" and "en" are thin/light and use the theme color (white/dark)
 * - Underline swoosh follows a slight upward curve (fading at both ends)
 */
export default function JobZenLogo({ theme = 'dark', size = 'md' }) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111111';
  const wwwColor  = theme === 'dark' ? '#FFFFFF' : '#333333';
  const orange    = '#FF7A00';
  const red       = '#E31A1A';

  const scales = { sm: 0.55, md: 0.75, lg: 1.0 };
  const s = scales[size] || 0.75;
  const W = Math.round(200 * s);
  const H = Math.round(90  * s);

  const boxGrad = `jz-box-${size}`;
  const textGrad = `jz-text-${size}`;
  const lineGrad = `jz-line-${size}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox="0 0 200 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
      aria-label="JobZen"
    >
      <defs>
        {/* Box gradient: solid orange on left, fading to transparent red on right */}
        <linearGradient id={boxGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={orange} />
          <stop offset="60%" stopColor={red} />
          <stop offset="100%" stopColor={red} stopOpacity="0" />
        </linearGradient>

        {/* Text gradient: solid orange to red */}
        <linearGradient id={textGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={orange} />
          <stop offset="100%" stopColor={red} />
        </linearGradient>

        {/* Line gradient: fades out on both left and right ends */}
        <linearGradient id={lineGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={orange} stopOpacity="0" />
          <stop offset="20%" stopColor={orange} />
          <stop offset="80%" stopColor={red} />
          <stop offset="100%" stopColor={red} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── C-shaped Box fading to the right ── */}
      {/* Positioned above 'obZ', starting at x=60 */}
      <path
        d="M 140 12 L 60 12 A 12 12 0 0 0 60 36 L 140 36"
        stroke={`url(#${boxGrad})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* ── "www" text ── */}
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

      {/* ── "JobZen" wordmark ── */}
      <text
        x="28" y="72"
        fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
        fontSize="46"
        letterSpacing="-1"
        dominantBaseline="auto"
      >
        {/* J and Z are bold + gradient, ob and en are light + theme color */}
        <tspan fill={`url(#${textGrad})`} fontWeight="900">J</tspan>
        <tspan fill={textColor} fontWeight="300">ob</tspan>
        <tspan fill={`url(#${textGrad})`} fontWeight="900">Z</tspan>
        <tspan fill={textColor} fontWeight="300">en</tspan>
      </text>

      {/* ── Underline Swoosh ── */}
      <path
        d="M 22 84 Q 100 77 182 84"
        stroke={`url(#${lineGrad})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
