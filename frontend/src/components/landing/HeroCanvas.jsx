import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   HeroCanvas – lightweight decorative particle canvas.
   Performance optimisations vs. original:
     • Particle count: 90 → 40
     • O(n²) connection loop removed — replaced with pre-built static pairs
     • All per-frame RadialGradient / LinearGradient creation removed
     • Streams / packets / hex / nodes layers removed (saved ~4 draw passes)
     • Page Visibility API: pauses when tab is hidden
     • Simple solid-color dots instead of glow gradients
   ───────────────────────────────────────────────────────────────────────── */
export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animId;
    let W = 0, H = 0;

    /* ── Resize ── */
    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* ── Particles (40 instead of 90) ── */
    const PCOUNT = 40;
    const px    = new Float32Array(PCOUNT);
    const py    = new Float32Array(PCOUNT);
    const pvx   = new Float32Array(PCOUNT);
    const pvy   = new Float32Array(PCOUNT);
    const pr    = new Float32Array(PCOUNT);
    const pA    = new Float32Array(PCOUNT);
    const pIsBlue = new Uint8Array(PCOUNT);

    for (let i = 0; i < PCOUNT; i++) {
      px[i]      = Math.random() * (W || 1200);
      py[i]      = Math.random() * (H || 800);
      pvx[i]     = (Math.random() - 0.5) * 0.28;
      pvy[i]     = (Math.random() - 0.5) * 0.28;
      pr[i]      = Math.random() * 1.5 + 0.5;
      pA[i]      = Math.random() * 0.45 + 0.2;
      pIsBlue[i] = Math.random() > 0.5 ? 1 : 0;
    }

    /* ── Pre-built connection pairs (computed once, not every frame) ── */
    const CONN_DIST  = 160;
    const CONN_DIST2 = CONN_DIST * CONN_DIST;
    const pairsI = [];
    const pairsJ = [];
    for (let i = 0; i < PCOUNT; i++) {
      for (let j = i + 1; j < PCOUNT; j++) {
        const dx = px[i] - px[j], dy = py[i] - py[j];
        if (dx * dx + dy * dy < CONN_DIST2) {
          pairsI.push(i);
          pairsJ.push(j);
        }
      }
    }

    /* ── Pause when tab is hidden ── */
    let paused = false;
    const onVis = () => { paused = document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    /* ── Draw ── */
    function draw() {
      animId = requestAnimationFrame(draw);
      if (paused) return;
      ctx.clearRect(0, 0, W, H);

      /* Pass 1 – connection lines (pre-built pairs, O(k) not O(n²)) */
      ctx.lineWidth = 0.5;
      for (let k = 0; k < pairsI.length; k++) {
        const i = pairsI[k], j = pairsJ[k];
        const dx = px[i] - px[j], dy = py[i] - py[j];
        const d  = Math.sqrt(dx * dx + dy * dy);
        const t  = 1 - d / CONN_DIST;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,229,255,${(t * 0.14).toFixed(3)})`;
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      }

      /* Pass 2 – particle dots */
      for (let i = 0; i < PCOUNT; i++) {
        px[i] += pvx[i]; py[i] += pvy[i];
        if (px[i] < 0) px[i] = W; else if (px[i] > W) px[i] = 0;
        if (py[i] < 0) py[i] = H; else if (py[i] > H) py[i] = 0;

        ctx.beginPath();
        ctx.arc(px[i], py[i], pr[i], 0, Math.PI * 2);
        ctx.fillStyle = pIsBlue[i]
          ? `rgba(41,121,255,${pA[i].toFixed(2)})`
          : `rgba(0,229,255,${pA[i].toFixed(2)})`;
        ctx.fill();
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hero-canvas-bg"
      aria-hidden="true"
    />
  );
}
