/* The masthead's night sky: small round stars of slightly different sizes,
   each twinkling at its own pace, a little brighter near a mouse pointer.
   Decoration only. It carries no data, sits behind the text, fades out toward
   the page, pauses when nobody can see it, and holds still for anyone who
   prefers reduced motion. */
(() => {
  'use strict';
  const host = document.querySelector('.masthead');
  if (!host || !window.HTMLCanvasElement) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'gridfield';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const PER_PX = 0.00026;  // stars per square pixel of masthead
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, ink = '#000', raf = 0, visible = true, pointer = null, stars = [];
  const t0 = performance.now();
  // A fixed generator, so the sky is the same on every load and in every screenshot.
  let seed = 20231107;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function measure() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = host.clientWidth; h = host.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink = getComputedStyle(host).getPropertyValue('--ink').trim() || '#000';
    seed = 20231107;
    stars = Array.from({ length: Math.round(w * h * PER_PX) }, () => {
      const bright = rnd() < 0.08;
      return {
        x: rnd() * w, y: rnd() * h,
        r: bright ? 1.5 : 0.5 + rnd() * 0.7,
        base: bright ? 0.75 : 0.25 + rnd() * 0.45,
        amp: 0.2 + rnd() * 0.35,
        speed: (Math.PI * 2) / (2500 + rnd() * 5500),
        phase: rnd() * Math.PI * 2,
      };
    });
  }

  // Full strength at the top right; lighter over the text column, gone by the bottom edge.
  const fade = (x, y) => Math.max(0, 1 - y / h) ** 1.2 * (0.45 + 0.55 * Math.min(1, x / Math.max(1, w * 0.8)));
  // On load the sky comes up along a diagonal, top left first.
  const rise = (t, x, y) => Math.min(1, Math.max(0, (t - (x / w + y / h) * 450) / 500));
  const near = (x, y) => {
    if (!pointer) return 0;
    const d = Math.hypot(x - pointer.x, y - pointer.y);
    return d < 110 ? (1 - d / 110) ** 2 : 0;
  };

  function draw(now) {
    const moving = !still.matches;
    const t = moving ? now - t0 : 1e6;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ink;
    for (const s of stars) {
      const a = (s.base + s.amp * Math.sin(t * s.speed + s.phase) + 0.5 * near(s.x, s.y)) * fade(s.x, s.y) * rise(t, s.x, s.y);
      if (a <= 0.01) continue;
      ctx.globalAlpha = Math.min(1, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = moving && visible && !document.hidden ? requestAnimationFrame(draw) : 0;
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }
  measure();
  start();
  new ResizeObserver(() => { measure(); start(); }).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  still.addEventListener?.('change', start);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { measure(); start(); });
  host.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    const r = host.getBoundingClientRect();
    pointer = { x: ev.clientX - r.left, y: ev.clientY - r.top };
  });
  host.addEventListener('pointerleave', () => { pointer = null; });
})();
