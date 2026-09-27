import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   HeroCanvas – purely decorative futuristic particle / data-flow canvas.
   Renders entirely behind the hero content (z-index: 0, pointer-events: none).
   ───────────────────────────────────────────────────────────────────────── */
export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    /* ── Color palette ── */
    const CYAN = 'rgba(0,229,255,';
    const BLUE = 'rgba(41,121,255,';
    const TEAL = 'rgba(0,200,180,';

    /* ── Particles ── */
    const PCOUNT = 90;
    function mkParticle() {
      const palette = [CYAN, BLUE, TEAL];
      return {
        x:    Math.random() * (W || 1200),
        y:    Math.random() * (H || 800),
        vx:   (Math.random() - 0.5) * 0.35,
        vy:   (Math.random() - 0.5) * 0.35,
        r:    Math.random() * 1.6 + 0.6,
        glow: Math.random() * 8 + 4,
        base: Math.random() * 0.5 + 0.25,
        col:  palette[Math.floor(Math.random() * palette.length)],
      };
    }
    const particles = Array.from({ length: PCOUNT }, mkParticle);

    /* ── Data-stream lines ── */
    const SCOUNT = 18;
    function mkStream() {
      const angle = Math.random() * Math.PI * 2;
      return {
        x:     Math.random() * (W || 1200),
        y:     Math.random() * (H || 800),
        angle,
        len:   Math.random() * 100 + 50,
        speed: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.22 + 0.06,
        width: Math.random() * 0.8 + 0.3,
        col:   Math.random() > 0.5 ? BLUE : CYAN,
      };
    }
    const streams = Array.from({ length: SCOUNT }, mkStream);

    /* ── Floating UI micro-nodes ── */
    const NCOUNT = 28;
    function mkNode() {
      return {
        x:     Math.random() * (W || 1200),
        y:     Math.random() * (H || 800),
        vx:    (Math.random() - 0.5) * 0.25,
        vy:    (Math.random() - 0.5) * 0.25,
        size:  Math.random() * 7 + 3,
        alpha: Math.random() * 0.28 + 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008,
        type:  Math.floor(Math.random() * 4),
        col:   Math.random() > 0.6 ? CYAN : BLUE,
      };
    }
    const nodes = Array.from({ length: NCOUNT }, mkNode);

    /* ── Data packets ── */
    const PKCOUNT = 14;
    function mkPacket() {
      const angle = Math.random() * Math.PI * 2;
      return {
        x:        Math.random() * (W || 1200),
        y:        Math.random() * (H || 800),
        angle,
        speed:    Math.random() * 2.5 + 1,
        alpha:    Math.random() * 0.7 + 0.3,
        trail:    [],
        trailLen: Math.floor(Math.random() * 18 + 8),
        col:      Math.random() > 0.4 ? CYAN : BLUE,
      };
    }
    const packets = Array.from({ length: PKCOUNT }, mkPacket);

    /* ── Hex ring fragments ── */
    const HCOUNT = 10;
    function mkHex() {
      return {
        x:    Math.random() * (W || 1200),
        y:    Math.random() * (H || 800),
        r:    Math.random() * 30 + 14,
        alpha: Math.random() * 0.12 + 0.03,
        rot:  Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.004,
        col:  Math.random() > 0.5 ? CYAN : TEAL,
      };
    }
    const hexes = Array.from({ length: HCOUNT }, mkHex);

    /* ── Scanline pulse ── */
    let scanY = -60;

    /* ── Helpers ── */
    function hexPath(cx, cy, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI) / 3;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    const MAX_CONN = 160;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* 1 · Particle connections */
      for (let i = 0; i < PCOUNT; i++) {
        for (let j = i + 1; j < PCOUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > MAX_CONN * MAX_CONN) continue;
          const t = 1 - Math.sqrt(d2) / MAX_CONN;
          ctx.beginPath();
          ctx.strokeStyle = `${CYAN}${(t * 0.18).toFixed(3)})`;
          ctx.lineWidth = t * 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      /* 2 · Particles */
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glow);
        g.addColorStop(0, `${p.col}${p.base.toFixed(2)})`);
        g.addColorStop(1, `${p.col}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glow, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.col}${Math.min(p.base * 1.6, 1).toFixed(2)})`;
        ctx.fill();
      }

      /* 3 · Data-stream lines */
      for (const s of streams) {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        if (s.x < -s.len || s.x > W + s.len || s.y < -s.len || s.y > H + s.len) {
          Object.assign(s, mkStream());
          s.x = Math.random() * W; s.y = Math.random() * H;
        }
        const ex = s.x + Math.cos(s.angle) * s.len;
        const ey = s.y + Math.sin(s.angle) * s.len;
        const grad = ctx.createLinearGradient(s.x, s.y, ex, ey);
        grad.addColorStop(0,   `${s.col}0)`);
        grad.addColorStop(0.5, `${s.col}${s.alpha.toFixed(3)})`);
        grad.addColorStop(1,   `${s.col}0)`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      /* 4 · Data packets with trails */
      for (const pk of packets) {
        pk.x += Math.cos(pk.angle) * pk.speed;
        pk.y += Math.sin(pk.angle) * pk.speed;
        if (pk.x < 0 || pk.x > W || pk.y < 0 || pk.y > H) {
          Object.assign(pk, mkPacket());
          pk.x = Math.random() * W; pk.y = Math.random() * H;
        }
        pk.trail.push({ x: pk.x, y: pk.y });
        if (pk.trail.length > pk.trailLen) pk.trail.shift();

        for (let i = 1; i < pk.trail.length; i++) {
          const a = (i / pk.trail.length) * pk.alpha * 0.45;
          ctx.beginPath();
          ctx.strokeStyle = `${pk.col}${a.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(pk.trail[i - 1].x, pk.trail[i - 1].y);
          ctx.lineTo(pk.trail[i].x, pk.trail[i].y);
          ctx.stroke();
        }
        const hg = ctx.createRadialGradient(pk.x, pk.y, 0, pk.x, pk.y, 4);
        hg.addColorStop(0, `${pk.col}${pk.alpha.toFixed(2)})`);
        hg.addColorStop(1, `${pk.col}0)`);
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = hg;
        ctx.fill();
      }

      /* 5 · Floating UI micro-nodes */
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
        n.phase += n.speed;
        const a = n.alpha + Math.sin(n.phase) * 0.06;
        ctx.globalAlpha = a;
        ctx.strokeStyle = `${n.col}1)`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        const sz = n.size;
        if (n.type === 0) {
          ctx.arc(n.x, n.y, sz, 0, Math.PI * 2);
        } else if (n.type === 1) {
          ctx.rect(n.x - sz / 2, n.y - sz / 2, sz, sz);
        } else if (n.type === 2) {
          ctx.moveTo(n.x, n.y - sz);
          ctx.lineTo(n.x + sz, n.y);
          ctx.lineTo(n.x, n.y + sz);
          ctx.lineTo(n.x - sz, n.y);
          ctx.closePath();
        } else {
          ctx.moveTo(n.x - sz * 0.7, n.y); ctx.lineTo(n.x + sz * 0.7, n.y);
          ctx.moveTo(n.x, n.y - sz * 0.7); ctx.lineTo(n.x, n.y + sz * 0.7);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      /* 6 · Hex ring fragments */
      for (const h of hexes) {
        h.rot += h.rotV;
        hexPath(h.x, h.y, h.r, h.rot);
        ctx.strokeStyle = `${h.col}${h.alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        hexPath(h.x, h.y, h.r * 0.55, h.rot + Math.PI / 6);
        ctx.strokeStyle = `${h.col}${(h.alpha * 0.55).toFixed(3)})`;
        ctx.stroke();
      }

      /* 7 · Scanline sweep */
      scanY += 0.5;
      if (scanY > H + 60) scanY = -60;
      const sg = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      sg.addColorStop(0,   `${CYAN}0)`);
      sg.addColorStop(0.5, `${CYAN}0.025)`);
      sg.addColorStop(1,   `${CYAN}0)`);
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 30, W, 60);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
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
