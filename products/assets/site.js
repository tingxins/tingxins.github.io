/* ═══════════════════════════════════════════════════════════════════════
   tingxins — studio hub
   Vanilla. No dependencies.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ─────────────────────────────  LANGUAGE  ───────────────────────────── */
const META = {
  en: {
    title: 'tingxins — focused iPhone apps',
    desc:  'Focused iPhone apps for real problems: check where a file came from, drill a phrase until it sticks, think something through. Native, quiet, and honest about their limits.',
    badge: 'Download on the App Store'
  },
  zh: {
    title: 'tingxins — 专注的 iPhone 应用',
    desc:  '面向真实问题的 iPhone 应用：核实文件来源、把一句话练到听懂、把一件事想清楚。原生、安静，并如实说明自己的边界。',
    badge: '在 App Store 下载'
  }
};

const BAND = {
  en: ['Native iPhone apps', 'Made by one person', 'One job each', 'Open standards', 'No ads', 'On the App Store'],
  zh: ['原生 iPhone 应用', '一个人做的', '一款只做一件事', '开放标准', '没有广告', '已上架 App Store']
};

function resolveLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'zh' || q === 'en') return q;
  try { const s = localStorage.getItem('tx-lang'); if (s) return s; } catch {}
  return (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function shotSrc(product, base, lang) {
  const zh = (product === 'citizenship' && lang === 'zh') ? 'zh-' : '';
  return `assets/img/${product}/${zh}${base}.png`;
}

function applyLang(lang, persist) {
  root.setAttribute('data-lang', lang);
  root.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : 'en');

  document.title = META[lang].title;
  const d = $('meta[name="description"]');
  if (d) d.setAttribute('content', META[lang].desc);

  $$('.badge__img').forEach(img => {
    img.src = `assets/img/appstore-${lang}.svg`;
    img.alt = META[lang].badge;
    img.width = lang === 'zh' ? 109 : 120;
  });

  $$('.shot[data-shot]').forEach(img => {
    img.src = shotSrc(img.dataset.shot, img.dataset.base, lang);
  });

  buildBand(lang);

  if (persist) { try { localStorage.setItem('tx-lang', lang); } catch {} }
  const url = new URL(location.href);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);

  // fired only after data-lang is live, so listeners read the new language
  document.dispatchEvent(new Event('tx:lang'));
}

function setLang(lang) {
  if (document.startViewTransition && !RM.matches) {
    document.startViewTransition(() => applyLang(lang, true));
  } else {
    applyLang(lang, true);
  }
}

/* ─────────────────────────────  THEME  ───────────────────────────── */
const SYS_LIGHT = matchMedia('(prefers-color-scheme: light)');

function storedTheme() {
  try { return localStorage.getItem('tx-theme'); } catch { return null; }
}
function resolveTheme() {
  return storedTheme() || (SYS_LIGHT.matches ? 'light' : 'dark');
}
function applyTheme(t, persist) {
  root.setAttribute('data-theme', t);
  const btn = $('#themeToggle');
  if (btn) btn.setAttribute('aria-pressed', String(t === 'dark'));
  if (persist) { try { localStorage.setItem('tx-theme', t); } catch {} }
}
// keep following the OS until an explicit choice is stored
SYS_LIGHT.addEventListener('change', e => {
  if (!storedTheme()) applyTheme(e.matches ? 'light' : 'dark', false);
});

/* ─────────────────────────────  MARQUEE  ───────────────────────────── */
function buildBand(lang) {
  const track = $('#bandTrack');
  if (!track) return;
  const items = BAND[lang];
  track.textContent = '';
  for (let pass = 0; pass < 2; pass++) {
    items.forEach(t => {
      const s = document.createElement('span');
      s.textContent = t;
      track.appendChild(s);
    });
  }
}

/* ─────────────────────────  KINETIC HEADLINE  ───────────────────────── */
function splitKinetic(el) {
  if (el.dataset.split) return;
  const isZh = (el.getAttribute('lang') || '').startsWith('zh');
  const text = el.textContent.trim();
  const parts = isZh ? Array.from(text) : text.split(/\s+/);
  el.textContent = '';
  parts.forEach((p, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.style.setProperty('--i', i);
    const inner = document.createElement('i');
    inner.textContent = p;
    w.appendChild(inner);
    el.appendChild(w);
    if (!isZh && i < parts.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.dataset.split = '1';
}

/* ─────────────────────────  REVEAL FALLBACK  ───────────────────────── */
function initReveal() {
  const native = CSS.supports && CSS.supports('animation-timeline', 'view()');
  if (native || RM.matches) return;
  root.classList.add('js-io');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal, .feats li, .nevers li').forEach(el => io.observe(el));
}

/* ─────────────────────────  ACCENT BLEED  ───────────────────────── */
const DEFAULT_ACCENT = { a: '#6EE7D6', a2: '#8AB4FF', deep: '#0B1220' };

function initAccent() {
  const acts = $$('.act[data-accent]');
  if (!acts.length) return;

  const setAccent = ({ a, a2, deep }) => {
    root.style.setProperty('--ac', a);
    root.style.setProperty('--ac2', a2);
    root.style.setProperty('--ac-deep', deep);
  };

  const read = el => {
    const cs = getComputedStyle(el);
    return {
      a:    cs.getPropertyValue('--a').trim()      || DEFAULT_ACCENT.a,
      a2:   cs.getPropertyValue('--a2').trim()     || DEFAULT_ACCENT.a2,
      deep: cs.getPropertyValue('--a-deep').trim() || DEFAULT_ACCENT.deep
    };
  };

  const active = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? active.add(e.target) : active.delete(e.target));
    if (!active.size) { setAccent(DEFAULT_ACCENT); return; }
    // whichever active act sits nearest the viewport centre wins
    const mid = innerHeight / 2;
    let best = null, bestD = Infinity;
    active.forEach(el => {
      const r = el.getBoundingClientRect();
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) { bestD = d; best = el; }
    });
    if (best) setAccent(read(best));
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });

  acts.forEach(a => io.observe(a));
}

/* ─────────────────────────  POINTER EFFECTS  ───────────────────────── */
function initPointer() {
  if (RM.matches || !matchMedia('(hover: hover)').matches) return;

  $$('.magnet').forEach(el => {
    el.addEventListener('pointermove', ev => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', `${clamp((ev.clientX - r.left - r.width / 2) * .16, -6, 6)}px`);
      el.style.setProperty('--ty', `${clamp((ev.clientY - r.top - r.height / 2) * .22, -4, 4)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  });

  $$('.magnet-tilt').forEach(el => {
    let raf = 0;
    el.addEventListener('pointermove', ev => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - .5;
        const py = (ev.clientY - r.top) / r.height - .5;
        el.style.setProperty('--ty', `${clamp(px * 11, -5.5, 5.5)}deg`);
        el.style.setProperty('--tx', `${clamp(-py * 9, -4.5, 4.5)}deg`);
      });
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0deg');
      el.style.setProperty('--ty', '0deg');
    });
  });

  $$('.demo').forEach(el => {
    el.addEventListener('pointermove', ev => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--my', `${((ev.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* ─────────────────────  HERO — THE BOUNDARY  ───────────────────── */
function initBoundary() {
  const cv = $('#boundary');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = 620, H = 620;

  // phone boundary, in logical units
  const BW = 258, BH = 520, RAD = 40;
  const bx = (W - BW) / 2, by = (H - BH) / 2;
  const pad = 9;
  const L = bx + pad, R = bx + BW - pad, T = by + pad, B = by + BH - pad;

  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);

  // deterministic start so the composition is always balanced
  let seed = 20260828;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  const parts = Array.from({ length: 54 }, () => {
    const ang = rnd() * Math.PI * 2;
    const sp = .18 + rnd() * .42;
    return {
      x: L + rnd() * (R - L),
      y: T + rnd() * (B - T),
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      r: .9 + rnd() * 1.9
    };
  });

  let ripples = [];
  let pulse = 0;

  const accent = () => getComputedStyle(root).getPropertyValue('--ac').trim() || '#6EE7D6';

  function frame() {
    const col = accent();
    ctx.clearRect(0, 0, W, H);

    // boundary
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, BW, BH, RAD);
    else ctx.rect(bx, by, BW, BH);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = .28 + pulse * .5;
    ctx.stroke();
    ctx.globalAlpha = .05 + pulse * .06;
    ctx.fillStyle = col;
    ctx.fill();
    ctx.restore();

    // ripples at the point of contact
    ctx.save();
    ctx.strokeStyle = col;
    ripples = ripples.filter(rp => rp.t < 1);
    ripples.forEach(rp => {
      rp.t += .035;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 2 + rp.t * 22, 0, Math.PI * 2);
      ctx.globalAlpha = (1 - rp.t) * .5;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });
    ctx.restore();

    // particles
    ctx.save();
    ctx.fillStyle = col;
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      let hit = null;
      if (p.x < L) { p.x = L; p.vx = Math.abs(p.vx); hit = [L, p.y]; }
      else if (p.x > R) { p.x = R; p.vx = -Math.abs(p.vx); hit = [R, p.y]; }
      if (p.y < T) { p.y = T; p.vy = Math.abs(p.vy); hit = [p.x, T]; }
      else if (p.y > B) { p.y = B; p.vy = -Math.abs(p.vy); hit = [p.x, B]; }
      if (hit && ripples.length < 14) { ripples.push({ x: hit[0], y: hit[1], t: 0 }); pulse = 1; }

      ctx.globalAlpha = .30 + (p.r / 2.8) * .55;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    pulse *= .92;
  }

  if (RM.matches) { frame(); return; }

  let running = false, raf = 0;
  const tick = () => { frame(); raf = requestAnimationFrame(tick); };
  new IntersectionObserver(es => {
    const vis = es[0].isIntersecting;
    if (vis && !running) { running = true; tick(); }
    else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0 }).observe(cv);
}

/* ─────────────────────────  SCREENSHOT TABS  ───────────────────────── */
function initShotTabs() {
  $$('.shot-tabs').forEach(tabs => {
    const product = tabs.dataset.shotTabs;
    const img = $(`.shot[data-shot="${product}"]`);
    if (!img) return;
    const btns = $$('button', tabs);

    const select = (btn) => {
      btns.forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      const base = btn.dataset.shotSrc;
      const next = shotSrc(product, base, root.getAttribute('data-lang'));
      const pre = new Image();
      pre.onload = () => {
        img.dataset.base = base;
        img.src = next;
        img.classList.add('is-on');
      };
      img.classList.remove('is-on');
      pre.src = next;
    };

    tabs.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (btn) select(btn);
    });

    tabs.addEventListener('keydown', e => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   n = (i - 1 + btns.length) % btns.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End')  n = btns.length - 1;
      if (n >= 0) { e.preventDefault(); btns[n].focus(); select(btns[n]); }
    });
  });
}

/* ═══════════════  DEMO 1 — CITIZENSHIP EVIDENCE LADDER  ══════════════ */
const SAMPLES = {
  camera: {
    file: { name: 'IMG_4417.HEIC', meta: '4032 × 3024' },
    layers: {
      signed:    { s: 'found', en: 'Nikon Z6 · 2026-03-11', zh: 'Nikon Z6 · 2026-03-11' },
      declared:  { s: 'none',  en: 'none',                  zh: '无' },
      watermark: { s: 'none',  en: 'none found',            zh: '未读到' },
      inference: { s: 'off',   en: 'not used',              zh: '未启用' },
      context:   { s: 'found', en: 'no re-encode',          zh: '无转码痕迹' }
    },
    note: {
      en: '<b>Signed by the camera.</b> The C2PA claim covers the pixels you are looking at and still validates, so the file has not been altered since capture.',
      zh: '<b>由相机签名。</b>C2PA 声明覆盖了你看到的像素，且校验依然通过——拍摄之后文件没有被改动。'
    }
  },
  ai: {
    file: { name: 'render_0432.png', meta: '2048 × 2048' },
    layers: {
      signed:    { s: 'found', en: 'Firefly · generated',   zh: 'Firefly · 生成' },
      declared:  { s: 'found', en: 'GB 45438 AIGC label',   zh: 'GB 45438 标识' },
      watermark: { s: 'found', en: 'TrustMark detected',    zh: '检出 TrustMark' },
      inference: { s: 'off',   en: 'not used',              zh: '未启用' },
      context:   { s: 'found', en: 'PNG, full resolution',  zh: 'PNG，原始分辨率' }
    },
    note: {
      en: '<b>Declared AI-generated, three ways.</b> A signature, a plaintext label, and a readable watermark all agree. This is the clearest case there is.',
      zh: '<b>三重声明为 AI 生成。</b>签名、明文标识与可读水印三者一致。这是最清楚的一种情况。'
    }
  },
  screenshot: {
    file: { name: 'IMG_5120.PNG', meta: '1290 × 2796' },
    layers: {
      signed:    { s: 'none',  en: 'none',        zh: '无' },
      declared:  { s: 'none',  en: 'none',        zh: '无' },
      watermark: { s: 'none',  en: 'none found',  zh: '未读到' },
      inference: { s: 'off',   en: 'not used',    zh: '未启用' },
      context:   { s: 'found', en: 'screenshot',  zh: '截图' }
    },
    nul: true,
    note: {
      en: '<b>Can’t tell — and that is the answer.</b> A screenshot re-renders the pixels and drops everything attached to the original. Nothing here says the source was real, and nothing here says it wasn’t.',
      zh: '<b>无法判断——这就是结论。</b>截图会重新渲染像素，并丢掉原文件附带的一切。这里既不能说明来源是真的，也不能说明它是假的。'
    }
  },
  reencode: {
    file: { name: 'clip_final.mp4', meta: '1920 × 1080 · 0:24' },
    layers: {
      signed:    { s: 'broken', en: 'no longer matches',   zh: '已不匹配' },
      declared:  { s: 'none',   en: 'none',                zh: '无' },
      watermark: { s: 'found',  en: 'AudioSeal · partial', zh: 'AudioSeal · 部分' },
      inference: { s: 'off',    en: 'not used',            zh: '未启用' },
      context:   { s: 'found',  en: 're-encoded, resized', zh: '转码并缩放' }
    },
    note: {
      en: '<b>Edited after signing.</b> A C2PA claim is present but no longer matches the bytes, so it proves nothing about this file. An audio watermark partly survived.',
      zh: '<b>签名之后被改过。</b>文件里有 C2PA 声明，但已与当前字节不匹配，无法为现在这个文件作证。音频水印残留了一部分。'
    }
  }
};

function initLadder() {
  const wrap = $('#ladderDemo');
  if (!wrap) return;
  const ladder = $('#ladder'), card = $('#fileCard'),
        fName = $('#fileName'), fMeta = $('#fileMeta'), note = $('#ladderNote');
  const btns = $$('.samples button', wrap);
  let timer = 0, current = 'camera';

  function paint(key) {
    const data = SAMPLES[key];
    const lang = root.getAttribute('data-lang');
    fName.textContent = data.file.name;
    fMeta.textContent = data.file.meta;

    $$('li', ladder).forEach((li, i) => {
      const d = data.layers[li.dataset.layer];
      li.style.setProperty('--d', i);
      li.dataset.state = d.s;
      $('.lad__v', li).textContent = d[lang];
    });

    note.innerHTML = data.note[lang];
    note.classList.toggle('is-null', !!data.nul);
    ladder.classList.add('is-resolved');
  }

  function run(key) {
    current = key;
    btns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.sample === key)));
    clearTimeout(timer);

    if (RM.matches) { paint(key); return; }

    ladder.classList.remove('is-resolved');
    card.classList.remove('is-scanning');
    void card.offsetWidth;                       // restart the sweep
    card.classList.add('is-scanning');
    timer = setTimeout(() => { paint(key); card.classList.remove('is-scanning'); }, 700);
  }

  wrap.addEventListener('click', e => {
    const b = e.target.closest('.samples button');
    if (b) run(b.dataset.sample);
  });

  wrap.addEventListener('keydown', e => {
    if (!e.target.closest('.samples')) return;
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   n = (i - 1 + btns.length) % btns.length;
    if (n >= 0) { e.preventDefault(); btns[n].focus(); run(btns[n].dataset.sample); }
  });

  // repaint in the new language without replaying the scan
  document.addEventListener('tx:lang', () => paint(current));
  paint('camera');
}

/* ══════════════════  DEMO 2 — VOCER A/B LOOP  ══════════════════ */
function initLoop() {
  const wave = $('#wave');
  if (!wave) return;

  const DUR = 45, MINGAP = 0.6;
  const bars = $('#waveBars'), region = $('#region'), head = $('#playhead'),
        hA = $('#handleA'), hB = $('#handleB'),
        read = $('#loopRead'), countEl = $('#loopCount'), playBtn = $('#loopPlay');

  let A = 5, B = 7, speed = 0.75, rep = 6, pos = 5, loops = 0;
  let playing = !RM.matches, visible = false, raf = 0, last = 0, holdUntil = 0;

  /* waveform: deterministic, shaped like speech with pauses */
  const N = 120;
  let s = 987654321;
  const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const frag = document.createDocumentFragment();
  const NS = 'http://www.w3.org/2000/svg';
  const amps = [];
  for (let i = 0; i < N; i++) {
    const env = Math.abs(Math.sin(i / N * Math.PI * 5.5)) * .75 + .25;
    const gap = (i % 23 > 19) ? .12 : 1;                 // breathing room between phrases
    const h = clamp((.18 + rnd() * .82) * env * gap, .05, 1);
    amps.push(h);
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', (i * (600 / N) + 1).toFixed(2));
    r.setAttribute('width', (600 / N - 2).toFixed(2));
    r.setAttribute('y', ((1 - h) * 60).toFixed(2));
    r.setAttribute('height', (h * 120).toFixed(2));
    r.setAttribute('rx', '1');
    frag.appendChild(r);
  }
  bars.appendChild(frag);
  const rects = $$('rect', bars);

  const fmt = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const pct = t => (t / DUR) * 100;

  function render() {
    hA.style.left = `${pct(A)}%`;
    hB.style.left = `${pct(B)}%`;
    region.style.left = `${pct(A)}%`;
    region.style.width = `${pct(B - A)}%`;
    head.style.left = `${pct(pos)}%`;

    rects.forEach((r, i) => {
      const t = (i + .5) / N * DUR;
      r.classList.toggle('in', t >= A && t <= B);
    });

    read.textContent = `${fmt(A)} — ${fmt(B)} · repeat ×${rep} · ${speed}×`;
    countEl.textContent = `${loops} / ${rep}`;

    hA.setAttribute('aria-valuenow', A.toFixed(1));
    hA.setAttribute('aria-valuetext', fmt(A));
    hB.setAttribute('aria-valuenow', B.toFixed(1));
    hB.setAttribute('aria-valuetext', fmt(B));
  }

  /* ── dragging ── */
  const timeAt = clientX => {
    const r = wave.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * DUR, 0, DUR);
  };

  function grab(handle, isA) {
    handle.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      handle.setPointerCapture(ev.pointerId);
      handle.classList.add('is-drag');
    });
    handle.addEventListener('pointermove', ev => {
      if (!handle.hasPointerCapture(ev.pointerId)) return;
      const t = timeAt(ev.clientX);
      if (isA) { A = clamp(t, 0, B - MINGAP); if (pos < A) pos = A; }
      else     { B = clamp(t, A + MINGAP, DUR); if (pos > B) pos = A; }
      render();
    });
    const end = ev => { handle.classList.remove('is-drag'); try { handle.releasePointerCapture(ev.pointerId); } catch {} };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);

    handle.addEventListener('keydown', ev => {
      const step = ev.shiftKey ? 1 : 0.25;
      let handled = true;
      if (ev.key === 'ArrowLeft'  || ev.key === 'ArrowDown') { isA ? A = clamp(A - step, 0, B - MINGAP) : (B = clamp(B - step, A + MINGAP, DUR)); }
      else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { isA ? A = clamp(A + step, 0, B - MINGAP) : (B = clamp(B + step, A + MINGAP, DUR)); }
      else if (ev.key === 'Home') { isA ? A = 0 : (B = A + MINGAP); }
      else if (ev.key === 'End')  { isA ? A = B - MINGAP : (B = DUR); }
      else handled = false;
      if (handled) { ev.preventDefault(); pos = A; render(); }
    });
  }
  grab(hA, true);
  grab(hB, false);

  // clicking the waveform moves the nearer handle
  wave.addEventListener('pointerdown', ev => {
    if (ev.target.closest('.loop__handle')) return;
    const t = timeAt(ev.clientX);
    if (Math.abs(t - A) <= Math.abs(t - B)) A = clamp(t, 0, B - MINGAP);
    else B = clamp(t, A + MINGAP, DUR);
    pos = A; render();
  });

  /* ── controls ── */
  const loopBox = wave.closest('.loop');
  $$('[data-speed]', loopBox).forEach(b => b.addEventListener('click', () => {
    speed = parseFloat(b.dataset.speed);
    $$('[data-speed]', loopBox).forEach(x => x.classList.toggle('is-on', x === b));
    render();
  }));
  $$('[data-rep]', loopBox).forEach(b => b.addEventListener('click', () => {
    rep = parseInt(b.dataset.rep, 10);
    loops = 0;
    $$('[data-rep]', loopBox).forEach(x => x.classList.toggle('is-on', x === b));
    render();
  }));

  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.setAttribute('aria-pressed', String(playing));
    if (playing) { last = performance.now(); start(); }
  });

  /* ── playhead ── */
  function step(now) {
    const dt = Math.min((now - last) / 1000, .12);
    last = now;
    if (playing && now > holdUntil) {
      pos += dt * speed;
      if (pos >= B) {
        pos = A;
        loops++;
        if (loops >= rep) { loops = 0; holdUntil = now + 550; }
        render();
      } else {
        head.style.left = `${pct(pos)}%`;
      }
    }
    raf = visible ? requestAnimationFrame(step) : 0;
  }
  function start() {
    if (raf || !visible || RM.matches) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  new IntersectionObserver(es => {
    visible = es[0].isIntersecting;
    if (visible) start();
    else { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: .15 }).observe(wave);

  if (RM.matches) { playing = false; playBtn.setAttribute('aria-pressed', 'false'); }
  render();
}

/* ══════════════════  DEMO 3 — MOSS: GIVE IT A TASK  ══════════════════ */
const CHAT = {
  write: {
    en: [{ who: 'me', t: 'Draft a short thank-you note to a colleague.' },
         { who: 'ai', t: 'Thanks for jumping in on the deadline yesterday — it made a real difference, and I noticed. Coffee is on me this week.' }],
    zh: [{ who: 'me', t: '帮我给同事写一句简短的感谢。' },
         { who: 'ai', t: '昨天赶工的时候你顶上来了，帮了大忙，我记着呢。这周的咖啡我请。' }]
  },
  translate: {
    en: [{ who: 'me', t: 'Translate into English: 明天下午三点开会，请提前十分钟到。' },
         { who: 'ai', t: 'The meeting is at three tomorrow afternoon. Please arrive ten minutes early.' }],
    zh: [{ who: 'me', t: '翻译成英文：明天下午三点开会，请提前十分钟到。' },
         { who: 'ai', t: 'The meeting is at three tomorrow afternoon. Please arrive ten minutes early.' }]
  },
  explain: {
    en: [{ who: 'me', t: 'Explain a hash map like I am in a hurry.' },
         { who: 'ai', t: 'It is a labelled shelf. You hand it a key, it works out which slot that key belongs in, and goes straight there — instead of reading along the whole shelf.' }],
    zh: [{ who: 'me', t: '用最快的方式解释一下哈希表。' },
         { who: 'ai', t: '它就是一个贴了标签的架子。你给它一把钥匙，它算出这把钥匙属于哪个格子，直接过去拿——不用把整个架子翻一遍。' }]
  }
};

function initChat() {
  const demo = $('#chatDemo');
  if (!demo) return;
  const log = $('#chatLog');
  const btns = $$('.samples button', demo);
  let token = 0, current = 'write', started = false;

  async function play(task) {
    current = task;
    btns.forEach(b => b.setAttribute('aria-selected', String(b.dataset.task === task)));
    const me = ++token;
    const lang = root.getAttribute('data-lang');
    const script = CHAT[task][lang];
    const wait = ms => new Promise(r => setTimeout(r, RM.matches ? 0 : ms));
    log.textContent = '';

    for (const msg of script) {
      if (me !== token) return;
      const b = document.createElement('div');
      b.className = `bub bub--${msg.who}`;
      log.appendChild(b);

      if (msg.who === 'me' || RM.matches) {
        b.textContent = msg.t;
        await wait(620);
      } else {
        const caret = document.createElement('span');
        caret.className = 'caret';
        b.appendChild(caret);
        for (let i = 0; i < msg.t.length; i++) {
          if (me !== token) return;
          caret.before(msg.t[i]);
          await wait(lang === 'zh' ? 46 : 20);
        }
        caret.remove();
      }
    }
  }

  demo.addEventListener('click', e => {
    const b = e.target.closest('.samples button');
    if (b) { started = true; play(b.dataset.task); }
  });

  demo.addEventListener('keydown', e => {
    if (!e.target.closest('.samples')) return;
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   n = (i - 1 + btns.length) % btns.length;
    if (n >= 0) { e.preventDefault(); btns[n].focus(); started = true; play(btns[n].dataset.task); }
  });

  document.addEventListener('tx:lang', () => { if (started) play(current); });

  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) { obs.disconnect(); started = true; play('write'); }
  }, { threshold: .3 }).observe(demo);
}

/* ─────────────────────────  ODDS AND ENDS  ───────────────────────── */
function initHeader() {
  const head = $('#siteHead');
  if (!head) return;
  const onScroll = () => head.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─────────────────────────────  BOOT  ───────────────────────────── */
applyTheme(resolveTheme(), false);
applyLang(resolveLang(), false);

$$('.kinetic').forEach(splitKinetic);

$('#langToggle')?.addEventListener('click', () =>
  setLang(root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh'));
$$('[data-set-lang]').forEach(b =>
  b.addEventListener('click', () => setLang(b.dataset.setLang)));
$('#themeToggle')?.addEventListener('click', () =>
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true));

initHeader();
initReveal();
initAccent();
initPointer();
initBoundary();
initShotTabs();
initLadder();
initLoop();
initChat();

})();
