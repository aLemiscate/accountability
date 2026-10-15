/* Said / Did: renders the record built by scripts/build.mjs (window.SAID_DID). */
(() => {
  'use strict';

  const D = window.SAID_DID;
  const view = document.getElementById('view');
  if (!D) {
    view.textContent = 'No data found. Run "npm run build" to generate site/data.js.';
    return;
  }

  // ── lookups ────────────────────────────────────────────────────────────
  const byId = new Map(D.entries.map((e) => [e.id, e]));
  const actorById = new Map(D.actors.map((a) => [a.id, a]));
  const patternById = new Map(D.patterns.map((p) => [p.id, p]));
  const ORG_NAME = { openai: 'OpenAI', anthropic: 'Anthropic' };
  const STATUS_LABEL = {
    open: 'Standing', kept: 'Kept', broken: 'Broken', reversed: 'Reversed',
    eroded: 'Eroded', contradicted: 'Contradicted',
  };
  const STATUS_DEF = {
    open: 'Still in force. Being watched against its "breaks if" test.',
    kept: 'Tested under real pressure and held, so far.',
    broken: 'A concrete commitment that was not honored.',
    reversed: 'Explicitly withdrawn, replaced, or contradicted by a later public position.',
    eroded: 'Not formally withdrawn, but hollowed out in practice.',
    contradicted: 'A factual claim or denial that later evidence contradicts.',
  };
  const CONCRETE_DEF = {
    measurable: 'Has a number, a date, or a test an outsider can check.',
    conditional: 'An if-then commitment; only as strong as who decides the "if".',
    directional: 'States a direction or value, with no mechanism.',
    aspirational: 'A mission-level aim that cannot be failed as written.',
  };
  const RECEIPTS_PAGE = 15;
  const VIEWS = ['receipts', 'timeline', 'patterns', 'watchlist', 'commitments', 'fineprint', 'method'];
  const VIEW_LABEL = { fineprint: 'Fine print' };
  const GRADE_LABEL = { kept: 'Kept', standing: 'Standing', eroded: 'Eroded', broken: 'Broken', unknown: 'Unknown' };
  const GRADE_CLASS = { kept: 's-kept', standing: 's-open', eroded: 's-eroded', broken: 's-broken', unknown: 's-unknown' };
  const GRADE_DEF = {
    kept: 'Met, with evidence an outsider can check.',
    standing: 'Still in force, and nothing public shows it broken.',
    eroded: 'Dropped, weakened or only partly met.',
    broken: 'Not honored.',
    unknown: 'Cannot be checked from outside the company.',
  };
  const DAY = 86400000;
  const NOW = Date.now();

  // Fine print: the log of changes to the companies' policy, terms, pricing and help pages.
  const policyPages = D.policy || [];
  const policyPageById = new Map(policyPages.map((p) => [p.page, p]));
  const allChanges = policyPages.flatMap((p) => p.changes.map((c, i) => ({ ...c, page: p.page, org: p.org, key: `f-${p.page}-${i}` })))
    .sort((a, b) => b.time - a.time || a.key.localeCompare(b.key));
  const DISCLOSURE = {
    announced: ['Announced', 'A post, blog, release notes, email or in-product notice about it was found.'],
    page: ['Noted on the page', 'The page itself carried a new date, a changelog or a note.'],
    none: ['No notice found', 'No new date, no note on the page, and no announcement found. “Found”: it does not prove none was made.'],
    'n/a': ['Not applicable', 'Wording, typo and layout fixes.'],
    unchecked: ['Not checked', 'How this change was made known wasn’t checked.'],
  };
  // The filters the view offers, and the words that stand for them in a link.
  const FP_FILTERS = [['', 'All changes'], ['announced', 'Announced'], ['page', 'Noted on the page'], ['none', 'No notice found'], ['cut', 'Cuts made without notice']];
  const FP_WORD = { announced: 'announced', page: 'onpage', none: 'quiet', cut: 'cuts' };
  const FP_BY_WORD = Object.fromEntries(Object.entries(FP_WORD).map(([k, w]) => [w, k]));
  const FP_PAGE = 30;

  const state = { view: 'receipts', org: 'all', pattern: '', person: '', q: '', order: 'newest', fp: '', page: '' };
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  // ── tiny DOM builder (text is always set as text, never parsed as HTML) ──
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style') el.setAttribute('style', v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const SVG = 'http://www.w3.org/2000/svg';
  // Company marks (from Simple Icons, CC0; the logos are the companies' trademarks,
  // used only to say whose entry it is). The badge keeps the page's shape code
  // (circle OpenAI, square Anthropic) so a mark reads even where the logo is tiny,
  // and its fill keeps the type code: outlined = said, solid = did.
  const LOGO = {
    openai: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
    anthropic: 'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z',
  };
  // The badge and the logo are drawn in one SVG, so the logo stays centered in its
  // ring however the browser rounds the mark's position. Both paths are already
  // centered on (12, 12) in their 24-unit boxes; the scale leaves an even margin.
  const LOGO_SCALE = { openai: 0.58, anthropic: 0.6 };
  function badge(org) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    const ring = document.createElementNS(SVG, org === 'anthropic' ? 'rect' : 'circle');
    if (org === 'anthropic') {
      for (const [k, v] of Object.entries({ x: 0.8, y: 0.8, width: 22.4, height: 22.4, rx: 4.2 })) ring.setAttribute(k, v);
    } else {
      for (const [k, v] of Object.entries({ cx: 12, cy: 12, r: 11.2 })) ring.setAttribute(k, v);
    }
    ring.setAttribute('class', 'badge');
    const glyph = document.createElementNS(SVG, 'path');
    glyph.setAttribute('d', LOGO[org] || '');
    glyph.setAttribute('class', 'glyph');
    glyph.setAttribute('transform', `translate(12 12) scale(${LOGO_SCALE[org] ?? 0.6}) translate(-12 -12)`);
    s.append(ring, glyph);
    return s;
  }
  // The bare logo, for running text: next to a company's name, or beside a count.
  function glyph(org) {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', `og ${org}`);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', LOGO[org] || '');
    s.append(p);
    return s;
  }
  // A mark for one entry: a button in the pattern grid, a plain span in keys and lists.
  function logoMark(e, { tag = 'span', size = '', ...attrs } = {}) {
    return h(tag, { class: `lm ${e.org} ${e.type}${size ? ` ${size}` : ''}`, ...attrs }, badge(e.org));
  }

  // Marks land on fractional pixel positions (the grid's columns are fractions of the
  // page width), so each one would be anti-aliased a little differently. Nudge every
  // mark onto the device-pixel grid so they all render alike.
  function snapMarks() {
    const marks = [...document.querySelectorAll('.lm')];
    for (const m of marks) m.style.transform = '';
    const dpr = window.devicePixelRatio || 1;
    const rects = marks.map((m) => m.getBoundingClientRect());
    marks.forEach((m, i) => {
      const dx = Math.round(rects[i].left * dpr) / dpr - rects[i].left;
      const dy = Math.round(rects[i].top * dpr) / dpr - rects[i].top;
      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) m.style.transform = `translate(${dx.toFixed(3)}px, ${dy.toFixed(3)}px)`;
    });
  }
  let snapQueued = 0;
  const queueSnap = () => { cancelAnimationFrame(snapQueued); snapQueued = requestAnimationFrame(snapMarks); };
  window.addEventListener('resize', queueSnap);
  document.fonts?.ready.then(queueSnap);

  // One tooltip for the page, shown on hover and on keyboard focus. Text only.
  let tip = null;
  let tipFor = null;
  function hideTip() { tip?.remove(); tip = null; tipFor = null; }
  function showTip(anchor, e) {
    hideTip();
    tipFor = anchor;
    tip = h('div', { class: 'tip', role: 'tooltip' },
      h('span', { class: 'tip-meta' }, `${fmtDate(e.date)} · ${orgName(e.org)} ${e.type}`),
      h('span', { class: 'tip-title' }, e.title),
      e.status && h('span', { class: 'tip-status' }, statusPill(e.status)));
    document.body.append(tip);
    const r = anchor.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left + r.width / 2 - t.width / 2, document.documentElement.clientWidth - t.width - 8));
    const top = r.top - t.height - 8 >= 8 ? r.top - t.height - 8 : r.bottom + 8;
    tip.style.left = `${left + window.scrollX}px`;
    tip.style.top = `${top + window.scrollY}px`;
  }
  // A tip shown on hover goes when the page scrolls. The focused mark's tip stays, since it
  // sits in page coordinates and moves with the mark (as when focus is brought out from under the bar).
  window.addEventListener('scroll', () => { if (tipFor !== document.activeElement) hideTip(); }, { passive: true });
  window.addEventListener('resize', hideTip);
  function arrow() {
    const s = document.createElementNS(SVG, 'svg');
    s.setAttribute('viewBox', '0 0 72 10');
    s.setAttribute('class', 'gap-arrow');
    s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', 'M1 5 H66 M61 1 L67 5 L61 9');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.5');
    s.append(p);
    return s;
  }

  // ── where a jump lands ─────────────────────────────────────────────────
  // Jumps the reader asks for land below the sticky bar, take keyboard focus with
  // them, and mark the spot: the focus outline, held for a moment, then faded.
  // With reduced motion the jump is instant and the outline stays until the
  // reader next clicks, types or scrolls.
  const masthead = document.querySelector('.masthead');
  const controls = document.querySelector('.controls');
  // The bar's height, for the scroll margins in styles.css. Zero on phones, where it doesn't stick.
  function syncBar() {
    const stuck = getComputedStyle(controls).position === 'sticky';
    document.documentElement.style.setProperty('--bar', `${stuck ? controls.offsetHeight : 0}px`);
  }
  if (window.ResizeObserver) new ResizeObserver(syncBar).observe(controls);
  matchMedia('(max-width: 760px)').addEventListener?.('change', syncBar);
  // Where the bar sits before it sticks, which is where every view begins. (A stuck
  // bar reports its stuck position as its offsetTop, so measure the masthead.)
  const viewTop = () => masthead.offsetTop + masthead.offsetHeight;
  const CLEAR_ON = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
  const ringed = (el) => { try { return el.matches(':focus-visible'); } catch { return false; } }; // older browsers lack it
  function mark(el) {
    if (!el) return;
    el.classList.remove('arrived', 'arrived-still');
    // Where a keyboard user's focus ring already shows the spot, a second outline would only repeat it.
    const f = document.activeElement;
    if (f && el.contains(f) && !f.hasAttribute('data-landing') && ringed(f)) return;
    if (calm.matches) {
      el.classList.add('arrived-still');
      const clear = () => {
        el.classList.remove('arrived-still');
        for (const t of CLEAR_ON) removeEventListener(t, clear, true);
      };
      // Armed a moment later, so the jump's own scrolling doesn't clear it.
      setTimeout(() => { for (const t of CLEAR_ON) addEventListener(t, clear, true); }, 300);
      return;
    }
    void el.offsetWidth; // restarts the fade when the same spot is marked twice
    el.classList.add('arrived');
    const done = (ev) => {
      if (ev.target !== el) return;
      el.classList.remove('arrived');
      el.removeEventListener('animationend', done);
    };
    el.addEventListener('animationend', done);
  }
  // Focus without scrolling, so the next Tab continues from where the reader landed.
  function focusAt(el) {
    if (!el) return;
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) {
      el.tabIndex = -1;
      el.setAttribute('data-landing', ''); // a heading or row: the mark shows it instead of a focus ring
    }
    el.focus({ preventScroll: true });
  }
  // Scroll a target to the top of the view, then mark it once it has arrived. A short trip
  // glides, so the reader sees which way the page moved; a long one is instant.
  function bring(target, { ring = target, focus = ring, glide = true } = {}) {
    if (!target) return;
    syncBar(); // the bar can have changed height in this same render, and the scroll margin goes by it
    // How far the page has to move, and whether it can: a target already there, or one the
    // page can't scroll any further towards, is marked at once.
    const dy = target.getBoundingClientRect().top - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    const room = dy > 0 ? document.documentElement.scrollHeight - innerHeight - scrollY : scrollY;
    const smooth = glide && !calm.matches && Math.abs(dy) < 2 * innerHeight && Math.min(Math.abs(dy), room) >= 1;
    const from = scrollY;
    target.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
    focusAt(focus);
    if (!smooth) { mark(ring); return; }
    let done = false;
    const arrive = () => { if (done) return; done = true; removeEventListener('scrollend', ended); mark(ring); };
    const ended = () => { if (scrollY !== from) arrive(); }; // not a scroll that ended before this one began
    addEventListener('scrollend', ended);
    setTimeout(arrive, 1000); // for browsers without scrollend
  }

  // ── formatting ─────────────────────────────────────────────────────────
  const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
  const fmtMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short' });
  function parseDate(s) {
    const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(String(s || ''));
    if (!m) return null;
    return { time: Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1), precision: m[3] ? 'day' : m[2] ? 'month' : 'year' };
  }
  function fmtDate(s) {
    const d = parseDate(s);
    if (!d) return String(s || '');
    if (d.precision === 'day') return fmtDay.format(d.time);
    if (d.precision === 'month') return fmtMonth.format(d.time);
    return String(s);
  }
  /** Elapsed time as a number and a unit, e.g. { n: '317', unit: 'days' } or { n: '2.4', unit: 'years' }. */
  function span(days) {
    const a = Math.abs(days);
    if (a < 45) return { n: String(a), unit: a === 1 ? 'day' : 'days' };
    const months = Math.round(a / 30.44);
    if (months < 24) return { n: String(months), unit: 'months' };
    return { n: String(Math.round((a / 365.25) * 10) / 10), unit: 'years' };
  }
  const fmtSpan = (days) => { const x = span(days); return `${x.n} ${x.unit}`; };
  const orgName = (id) => ORG_NAME[id] || id;
  const actorName = (id) => actorById.get(id)?.name || id;
  const personActors = D.actors.filter((a) => a.kind !== 'org');

  // ── filtering ──────────────────────────────────────────────────────────
  // Search folds case and curly quotes on both sides, one character for one
  // character, so a match found in the folded text can be marked in the original.
  const fold = (t) => String(t).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const qWords = () => (state.q ? fold(state.q).split(/\s+/).filter(Boolean) : []);
  const hasAll = (text, words) => { const t = fold(text); return words.every((w) => t.includes(w)); };
  const patternName = (id) => patternById.get(id)?.name || id;
  // Every searchable field of an entry, labeled, so the timeline can say where a match was.
  function fields(e) {
    const sources = [...(e.sources || []), ...(e.updates || []).flatMap((u) => u.sources || [])];
    return [
      ['Quote', e.quote], ['Summary', e.summary],
      ['Before', e.revision?.before], ['After', e.revision?.after], ['Outcome', e.outcome?.text],
      ...(e.updates || []).map((u) => ['Update', u.text]),
      ['Person', (e.who || []).map(actorName).join(', ')], ['Where', e.venue],
      ['Pattern', e.patterns.map(patternName).join(', ')],
      ['Counts as broken if', e.breaks_if], ['Their side', e.response], ['Note', e.note],
      ...sources.map((x) => ['Source', [x.title, x.publisher].filter(Boolean).join(', ')]),
    ].filter(([, t]) => t);
  }
  function haystack(e) {
    return fold([e.title, orgName(e.org), ...fields(e).map(([, t]) => t)].join(' '));
  }
  const hayCache = new Map();
  function matches(e) {
    if (state.org !== 'all' && e.org !== state.org) return false;
    if (state.pattern && !e.patterns.includes(state.pattern)) return false;
    if (state.person && !e.who.includes(state.person)) return false;
    if (state.q) {
      if (!hayCache.has(e.id)) hayCache.set(e.id, haystack(e));
      if (!qWords().every((w) => hayCache.get(e.id).includes(w))) return false;
    }
    return true;
  }
  /** The text with the searched words marked. Returns the plain string when there is nothing to mark. */
  function hl(text) {
    const words = qWords().filter((w) => w.length > 1);
    if (!words.length || !text) return text;
    const low = fold(text);
    if (low.length !== text.length) return text;
    const spans = [];
    for (const w of words) for (let i = low.indexOf(w); i !== -1; i = low.indexOf(w, i + w.length)) spans.push([i, i + w.length]);
    if (!spans.length) return text;
    spans.sort((a, b) => a[0] - b[0]);
    const out = [];
    let at = 0;
    for (const [a, b] of spans) {
      if (b <= at) continue;
      const from = Math.max(a, at);
      if (from > at) out.push(text.slice(at, from));
      // Overlapping words join the mark before them.
      if (from === at && out.length && typeof out[out.length - 1] !== 'string') out[out.length - 1].append(text.slice(from, b));
      else out.push(h('mark', { class: 'qhit' }, text.slice(from, b)));
      at = b;
    }
    if (at < text.length) out.push(text.slice(at));
    return out;
  }
  // In the timeline only the title shows, so when the words matched somewhere
  // else the card says where, with the match in its context.
  function matchContext(e) {
    const words = qWords();
    const missing = words.filter((w) => !fold(e.title).includes(w));
    if (!missing.length) return null;
    for (const [label, t] of fields(e)) {
      const low = fold(t);
      const w = missing.find((x) => low.includes(x));
      if (!w) continue;
      const at = low.indexOf(w);
      let a = Math.max(0, at - 60);
      let b = Math.min(t.length, at + w.length + 90);
      const sa = t.indexOf(' ', a);
      if (a > 0 && sa !== -1 && sa < at) a = sa + 1;
      const sb = t.lastIndexOf(' ', b);
      if (b < t.length && sb > at + w.length) b = sb;
      const piece = `${a > 0 ? '…' : ''}${t.slice(a, b)}${b < t.length ? '…' : ''}`;
      return h('p', { class: 'why' }, h('span', { class: 'label' }, label), ' ', hl(piece));
    }
    return null;
  }
  const anyFilter = () => state.org !== 'all' || state.pattern || state.person || state.q;

  // Receipts: said → did pairs, self-contained before/after revisions, and failed
  // statements whose outcome is recorded on the statement itself.
  const revisionReceipts = D.entries
    .filter((e) => e.type === 'did' && e.revision && !e.contradicts.length)
    .map((e) => ({ revision: e.id }));
  const outcomeReceipts = D.entries
    .filter((e) => e.type === 'said' && e.outcome)
    .map((e) => ({
      said: e.id,
      outcome: true,
      gap_days: Math.round((e.outcome.time - e.time) / DAY),
      approx: e.precision !== 'day' || e.outcome.precision !== 'day',
    }));
  const receiptTime = (r) => (r.outcome ? byId.get(r.said).outcome.time : byId.get(r.did || r.revision).time);
  const allReceipts = [...D.receipts, ...revisionReceipts, ...outcomeReceipts].sort((a, b) => receiptTime(b) - receiptTime(a));
  // The id each receipt's card carries (receiptCard, outcomeCard, revisionCard).
  const receiptKey = (r) => (r.revision ? `r-${r.revision}` : r.outcome ? `r-${r.said}--outcome` : `r-${r.said}--${r.did}`);
  function receiptMatches(r) {
    if (r.revision) return matches(byId.get(r.revision));
    if (r.outcome) return matches(byId.get(r.said));
    const s = byId.get(r.said);
    const d = byId.get(r.did);
    if (state.org !== 'all' && s.org !== state.org) return false;
    const saved = state.org;
    state.org = 'all';
    const ok = matches(s) || matches(d);
    state.org = saved;
    return ok;
  }

  // ── shared pieces ──────────────────────────────────────────────────────
  const orgTag = (org) => h('span', { class: `org ${org}` }, glyph(org), orgName(org));
  const stamp = (type) => h('span', { class: `stamp ${type}` }, type === 'said' ? 'Said' : 'Did');
  const statusPill = (s) => h('span', { class: `pill s-${s}`, title: STATUS_DEF[s] }, STATUS_LABEL[s] || s);
  // "Measurable commitment", "Directional claim": how testable the statement was, in words.
  const concretePill = (c, kind) => c && h('span', { class: 'pill c', title: CONCRETE_DEF[c] },
    `${c[0].toUpperCase()}${c.slice(1)}${kind ? ` ${kind}` : ''}`);
  /** Pattern tags. Clicking one follows that pattern (filters every view); clicking it again stops. */
  const patternChips = (ids, toView) => ids.map((p) => h('button', {
    class: 'chip',
    type: 'button',
    'aria-pressed': String(state.pattern === p),
    'data-p': p,
    title: state.pattern === p ? 'Stop following this pattern' : `Follow this pattern: ${patternById.get(p)?.name}`,
    onclick: (ev) => { ev.stopPropagation(); setFilter({ pattern: state.pattern === p ? '' : p }, toView, ev.currentTarget); },
  }, patternById.get(p)?.name || p));
  const FAILED = new Set(['broken', 'reversed', 'eroded', 'contradicted']);
  /** How the statements in a set of entries turned out, e.g. "4 didn't hold · 1 standing · 2 actions". */
  function outcomeTally(entries) {
    const said = entries.filter((e) => e.type === 'said');
    const parts = [
      [said.filter((e) => FAILED.has(e.status)).length, 'didn’t hold', 'fail'],
      [said.filter((e) => e.status === 'open').length, 'standing', 'standing'],
      [said.filter((e) => e.status === 'kept').length, 'held', 'held'],
    ].filter(([n]) => n > 0);
    const did = entries.length - said.length;
    return h('span', { class: 'tally' },
      parts.map(([n, word, tone]) => h('span', { class: `t-${tone}` }, `${n} ${word}`)),
      did > 0 && h('span', null, `${did} action${did === 1 ? '' : 's'}`));
  }
  const yearSpan = (entries) => {
    const ys = entries.map((e) => +String(e.date).slice(0, 4));
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    return lo === hi ? String(lo) : `${lo}–${hi}`;
  };
  /** Where a pattern is industry-wide: one sourced sentence on another company doing the same thing. */
  function industryNote(ind) {
    return h('div', { class: 'industry' },
      h('span', { class: 'label' }, 'Across the industry'),
      h('p', null, ind.text, ' ', (ind.sources || []).map((s, i) => [i ? ' · ' : '',
        h('a', { href: s.url, target: '_blank', rel: 'noopener' }, [s.publisher, s.date && fmtDate(s.date)].filter(Boolean).join(', '))])));
  }
  /** Shown above a view while a pattern is being followed: what the pattern is and how its entries turned out. */
  function patternBrief(entries) {
    const p = patternById.get(state.pattern);
    if (!p) return null;
    const orgs = ['openai', 'anthropic'].map((o) => [o, entries.filter((e) => e.org === o).length]).filter(([, n]) => n);
    return h('section', { class: 'pbrief', 'aria-label': `Following the pattern ${p.name}` },
      h('div', { class: 'pbrief-head' },
        h('span', { class: 'label' }, 'Following a pattern'),
        h('span', { class: 'spacer' }),
        h('button', { class: 'clear label', type: 'button', onclick: () => { location.hash = `p-${p.id}`; } }, 'All patterns'),
        h('button', { class: 'clear label', type: 'button', 'data-p': p.id, onclick: (ev) => setFilter({ pattern: '' }, null, ev.currentTarget) }, 'Stop following')),
      h('h3', null, p.name),
      h('p', null, p.thesis),
      entries.length > 0 && h('p', { class: 'pbrief-meta' },
        h('span', null, `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ${yearSpan(entries)}`),
        h('span', { class: 'pbrief-orgs' }, orgs.map(([o, n]) => h('span', { class: `org ${o}` }, glyph(o), `${orgName(o)} ${n}`))),
        outcomeTally(entries)),
      p.industry && industryNote(p.industry),
      (p.tells?.length > 0 || p.watch_for) && h('details', null,
        h('summary', { class: 'label' }, 'Tells, and what to expect if it holds'),
        p.tells?.length > 0 && h('ul', null, p.tells.map((t) => h('li', null, t))),
        p.watch_for && h('div', { class: 'forecast' }, h('span', { class: 'label' }, 'If the pattern holds (analysis)'), h('p', null, p.watch_for))),
    );
  }
  /** A row of every pattern with its count, for picking one to follow from the timeline. */
  function patternStrip() {
    const saved = state.pattern;
    state.pattern = '';
    const pool = D.entries.filter(matches);
    state.pattern = saved;
    const rows = D.patterns.map((p) => [p, pool.filter((e) => e.patterns.includes(p.id)).length]).filter(([, n]) => n);
    const untagged = pool.filter((e) => !e.patterns.length).length;
    return h('div', { class: 'pstrip', role: 'group', 'aria-label': 'Follow a pattern' },
      h('span', { class: 'label' }, 'Follow a pattern'),
      h('div', { class: 'pstrip-chips' }, rows.map(([p, n]) => h('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(state.pattern === p.id), 'data-p': p.id,
        onclick: (ev) => setFilter({ pattern: state.pattern === p.id ? '' : p.id }, null, ev.currentTarget),
      }, p.name, h('span', { class: 'n' }, n)))),
      !state.pattern && untagged > 0 && h('span', { class: 'pstrip-note' }, `${untagged} of ${pool.length} entries fit no pattern yet and appear only in the full timeline.`));
  }
  const snapDate = (dir) => (/(\d{4}-\d{2}-\d{2})/.exec(dir || '') || [])[1];
  const quoteBlock = (text, e) => text && h('div', { class: 'quote-wrap' },
    h('blockquote', { class: 'quote' }, '“', hl(text.trim()), '”'),
    e?.quote_check?.status === 'matched' && verifiedLine(e));
  // A snapshot's folder online: the archive repository holds the full copy (raw page,
  // screenshot, PDF); this repository keeps only its text.
  const snapshotHref = (dir) => {
    const base = D.site.archive || D.site.repo;
    return base ? `${base}/tree/HEAD/${dir}` : null;
  };
  // The check line under a quote. Where the build kept the passage around the quote,
  // it opens to show the quote in its source, highlighted, with links to the original.
  function verifiedLine(e) {
    const qc = e.quote_check;
    const when = fmtDate(snapDate(qc.snapshot));
    const line = `✓ Quote matches the saved source (${when})`;
    if (!qc.excerpt) return h('span', { class: 'verified', title: `Found word for word in ${qc.snapshot}` }, line);
    const src = (e.sources || []).find((s) => s.snapshot === qc.snapshot);
    return h('details', { class: 'insource' },
      h('summary', { class: 'verified' }, line, h('span', { class: 'see' }, 'See it in the source')),
      h('div', { class: 'insource-body' },
        h('p', { class: 'label' }, `Saved copy${src?.publisher ? ` of ${src.publisher}` : ''} · captured ${when}`),
        src?.title && h('p', { class: 'insource-title' }, src.title),
        h('p', { class: 'passage' }, qc.excerpt.map((part, i) => (i % 2 ? h('mark', null, part) : part))),
        h('p', { class: 'insource-links' },
          src?.url && h('a', { href: src.url, target: '_blank', rel: 'noopener' }, 'Original'),
          src?.archive && h('a', { href: src.archive, target: '_blank', rel: 'noopener' }, 'Archived copy'),
          snapshotHref(qc.snapshot) && h('a', { href: snapshotHref(qc.snapshot), target: '_blank', rel: 'noopener' }, 'Full saved copy')),
      ));
  }
  const titleButton = (e) => h('button', { class: 'side-title', type: 'button', onclick: () => openEntry(e.id) }, hl(e.title));

  // Update the address-bar hash without scrolling; some embedded frames refuse this, which is fine.
  function setHash(hash) {
    try { history.replaceState(null, '', hash); } catch { /* ignore */ }
  }
  // A view and its filters as a link: "#timeline.openai.silent-edit". Words joined by
  // dots, so the link survives hosts that keep only plain anchors. The search box
  // isn't included; it holds free text.
  const PEOPLE = new Set(personActors.map((a) => a.id));
  function hashFor(st) {
    const parts = [st.view];
    if (st.org !== 'all') parts.push(st.org);
    if (st.pattern) parts.push(st.pattern);
    if (st.person) parts.push(st.person);
    if (st.view === 'timeline' && st.order === 'oldest') parts.push('oldest');
    if (st.view === 'fineprint' && st.fp) parts.push(FP_WORD[st.fp]);
    if (st.view === 'fineprint' && st.page) parts.push(st.page);
    return `#${parts.join('.')}`;
  }
  function applyHash(hash) {
    const [v, ...words] = hash.split('.');
    if (!VIEWS.includes(v)) return false;
    Object.assign(state, { view: v, org: 'all', pattern: '', person: '', order: 'newest', fp: '', page: '' });
    for (const w of words) {
      if (w === 'openai' || w === 'anthropic') state.org = w;
      else if (patternById.has(w)) state.pattern = w;
      else if (PEOPLE.has(w)) state.person = w;
      else if (w === 'oldest') state.order = 'oldest';
      else if (FP_BY_WORD[w]) state.fp = FP_BY_WORD[w];
      else if (policyPageById.has(w)) state.page = w;
    }
    return true;
  }
  // Shared links point at the public site, wherever this copy is being read.
  const siteBase = () => D.site.url || location.href.split('#')[0];
  // A file the build publishes next to the page; from the public site, so it also works in the single-file copy.
  const siteFile = (f) => `${D.site.url || ''}${f}`;
  // Share a link: the phone's share sheet where there is one, else the clipboard.
  async function shareLink(url, title, button) {
    if (navigator.share) {
      try { await navigator.share({ url, title }); return; } catch (err) { if (err?.name === 'AbortError') return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      confirmCopied(button, 'Link copied');
    } catch {
      toast(url);
    }
  }

  // ── views ──────────────────────────────────────────────────────────────
  function viewHead(title, text) {
    return h('div', { class: 'view-head' }, h('h2', null, title), text && h('p', null, text));
  }
  function empty() {
    return h('p', { class: 'empty' }, 'Nothing matches these filters. ',
      h('button', { class: 'clear', type: 'button', onclick: clearFilters }, 'Clear filters'));
  }

  // The newest developments in the record: entries and updates, by the date they happened.
  function latestStrip() {
    const items = [];
    for (const e of D.entries.filter(matches)) {
      items.push({ e, time: e.time, date: e.date, text: null });
      (e.updates || []).forEach((u) => { const d = parseDate(u.date); if (d) items.push({ e, time: d.time, date: u.date, text: u.text }); });
    }
    items.sort((a, b) => b.time - a.time);
    // One item per entry: its newest development.
    const seen = new Set();
    const top = items.filter(({ e }) => !seen.has(e.id) && seen.add(e.id)).slice(0, 4);
    if (!top.length) return null;
    return h('section', { class: 'latest', 'aria-label': 'Latest developments' },
      h('div', { class: 'latest-head' },
        h('span', { class: 'label' }, 'Latest'),
        D.site.url && h('a', { class: 'label', href: `${D.site.url}feed.xml`, target: '_blank', rel: 'noopener' }, 'Follow by RSS')),
      h('div', { class: 'latest-list' }, top.map(({ e, date, text }) => h('button', { class: 'latest-item', type: 'button', onclick: () => openEntry(e.id) },
        h('span', { class: 'latest-meta' }, h('span', { class: 'label' }, fmtDate(date)), orgTag(e.org), text && h('span', { class: 'label' }, 'Update')),
        h('span', { class: 'latest-title' }, clip(e.title, 110)),
        text && h('span', { class: 'latest-text' }, clip(text, 130))))));
  }

  function renderReceipts() {
    const list = allReceipts.filter(receiptMatches);
    const frag = [viewHead('Receipts',
      'Each receipt puts something a company said next to what happened after: an action that contradicted it, what became of a promise, or a policy page before and after a quiet edit. The figure between them is the time from one to the other. Newest first.'),
    patternBrief(D.entries.filter(matches)), !state.q && latestStrip()];
    if (!list.length) return [...frag, empty()];
    // The first page of receipts, then more on request, so the page doesn't run to dozens of screens.
    // After a filter change the list runs a page past the receipt the reader was on, so
    // there is room below it to hold it where it was.
    const card = (r) => {
      const el = r.revision ? revisionCard(byId.get(r.revision)) : r.outcome ? outcomeCard(r) : receiptCard(r);
      el.dataset.key = receiptKey(r);
      el.dataset.t = receiptTime(r);
      return el;
    };
    const kept = keptIndex(list);
    const first = kept < 0 ? RECEIPTS_PAGE : kept + 1 + RECEIPTS_PAGE;
    const box = h('div', { class: 'receipts' }, list.slice(0, first).map(card));
    frag.push(box);
    if (list.length > first) {
      let shown = first;
      const note = h('span', { class: 'label' });
      const more = h('button', { class: 'btn', type: 'button' });
      const all = h('button', { class: 'clear label', type: 'button' }, `Show all ${list.length}`);
      const bar = h('div', { class: 'more-bar' }, more, all, note);
      const sync = () => {
        more.textContent = `Show ${Math.min(RECEIPTS_PAGE, list.length - shown)} more`;
        note.textContent = `${shown} of ${list.length} receipts shown`;
        if (shown >= list.length) bar.remove();
      };
      const reveal = (n) => {
        const added = list.slice(shown, shown + n).map(card);
        box.append(...added);
        shown += added.length;
        sync();
        armEdits();
        added[0]?.querySelector('.side-title, button')?.focus({ preventScroll: true });
        mark(added[0]); // where the new batch begins
      };
      more.addEventListener('click', () => reveal(RECEIPTS_PAGE));
      all.addEventListener('click', () => reveal(list.length));
      sync();
      frag.push(bar);
    }
    return frag;
  }

  function receiptCard(r) {
    const s = byId.get(r.said);
    const d = byId.get(r.did);
    return h('article', { class: 'receipt', id: `r-${s.id}--${d.id}` },
      h('div', { class: 'side said' },
        h('div', { class: 'side-head' }, stamp('said'), h('span', { class: 'label' }, fmtDate(s.date)), orgTag(s.org)),
        titleButton(s),
        quoteBlock(s.quote, s),
        h('div', { class: 'side-head' }, statusPill(s.status), concretePill(s.concreteness, s.kind)),
      ),
      h('div', { class: 'gap', title: r.approx ? 'Approximate: one of the dates is known only to the month' : null },
        h('span', { class: 'label' }, 'Later'),
        h('span', { class: 'gap-n' }, `${r.approx ? '~' : ''}${span(r.gap_days).n}`),
        h('span', { class: 'label' }, span(r.gap_days).unit),
        arrow(),
      ),
      h('div', { class: 'side did' },
        h('div', { class: 'side-head' }, stamp('did'), h('span', { class: 'label' }, fmtDate(d.date)), orgTag(d.org)),
        titleButton(d),
        quoteBlock(d.quote, d),
        !d.quote && d.summary && h('p', null, clip(d.summary, 240)),
      ),
      h('div', { class: 'receipt-foot' },
        patternChips([...new Set([...s.patterns, ...d.patterns])]),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn', type: 'button', onclick: (ev) => copyReceipt(s, d, ev.currentTarget) }, 'Copy receipt'),
      ),
    );
  }

  // A failed statement with no separate action: the other side is what became of it.
  // When the company's own earlier record already contradicted it, the gap runs backward.
  function outcomeCard(r) {
    const s = byId.get(r.said);
    const earlier = r.gap_days < 0;
    const g = span(r.gap_days);
    return h('article', { class: 'receipt', id: `r-${s.id}--outcome` },
      h('div', { class: 'side said' },
        h('div', { class: 'side-head' }, stamp('said'), h('span', { class: 'label' }, fmtDate(s.date)), orgTag(s.org)),
        titleButton(s),
        quoteBlock(s.quote, s),
        h('div', { class: 'side-head' }, statusPill(s.status), concretePill(s.concreteness, s.kind)),
      ),
      h('div', { class: 'gap', title: r.approx ? 'Approximate: one of the dates is known only to the month or year' : null },
        h('span', { class: 'label' }, earlier ? 'Already' : 'Later'),
        h('span', { class: 'gap-n' }, `${r.approx ? '~' : ''}${g.n}`),
        h('span', { class: 'label' }, earlier ? `${g.unit} before` : g.unit),
        arrow(),
      ),
      h('div', { class: 'side did' },
        h('div', { class: 'side-head' }, h('span', { class: 'stamp did' }, earlier ? 'On record' : 'Outcome'), h('span', { class: 'label' }, fmtDate(s.outcome.date)), orgTag(s.org)),
        h('p', null, hl(s.outcome.text)),
        h('button', { class: 'chip', type: 'button', onclick: () => openEntry(s.id) }, 'Sources and details'),
      ),
      h('div', { class: 'receipt-foot' },
        patternChips(s.patterns),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn', type: 'button', onclick: (ev) => copyReceipt(s, null, ev.currentTarget) }, 'Copy receipt'),
      ),
    );
  }

  function revisionCard(e) {
    return h('article', { class: 'receipt', id: `r-${e.id}`, 'data-edit': e.id },
      h('div', { class: 'side said' },
        h('div', { class: 'side-head' }, h('span', { class: 'stamp said' }, 'Before'), orgTag(e.org)),
        h('div', { class: 'diff' }, h('div', { class: 'minus' }, h('b', null, '−'), h('span', { class: 'rev-text' }, hl(e.revision.before)))),
      ),
      h('div', { class: 'gap' }, h('span', { class: 'label' }, 'Edited'), h('span', { class: 'gap-n' }, fmtDate(e.date).split(',')[0].split(' ')[0]), h('span', { class: 'label' }, String(e.date).slice(0, 4)), arrow()),
      h('div', { class: 'side did' },
        h('div', { class: 'side-head' }, h('span', { class: 'stamp did' }, 'After'), h('span', { class: 'label' }, fmtDate(e.date))),
        titleButton(e),
        h('div', { class: 'diff' }, h('div', { class: 'plus' }, h('b', null, '+'), h('span', { class: 'rev-text' }, hl(e.revision.after)))),
      ),
      h('div', { class: 'receipt-foot' },
        patternChips(e.patterns),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn', type: 'button', onclick: (ev) => copyReceipt(null, e, ev.currentTarget) }, 'Copy receipt'),
      ),
    );
  }

  function clip(text, n) {
    const t = String(text).trim();
    return t.length > n ? `${t.slice(0, t.lastIndexOf(' ', n))}…` : t;
  }

  function renderTimeline() {
    const matched = D.entries.filter(matches);
    // Newest first by default: most readers come for what changed lately.
    const list = state.order === 'oldest' ? matched : [...matched].reverse();
    const frag = [viewHead('Timeline', 'Everything in the record. Statements are on the left and actions on the right, each with the company that made it. The tags name the patterns an entry belongs to; pick one to follow it across the years.'),
      h('div', { class: 'seg order', role: 'group', 'aria-label': 'Order' },
        [['newest', 'Newest first'], ['oldest', 'Oldest first']].map(([k, label]) => h('button', {
          type: 'button', 'aria-pressed': String(state.order === k), onclick: () => setFilter({ order: k }),
        }, label))),
      patternStrip(), patternBrief(matched)];
    if (!list.length) return [...frag, empty()];
    const years = new Map();
    for (const e of list) {
      const y = String(e.date).slice(0, 4);
      if (!years.has(y)) years.set(y, []);
      years.get(y).push(e);
    }
    let first = true;
    for (const [y, items] of years) {
      const block = h('section', { class: 'year', 'aria-label': y },
        h('h3', { class: 'year-label', style: 'grid-row: 1' }, y),
        first && h('div', { class: 'cols-head', style: 'grid-row: 2' }, h('span', { class: 'label said-h' }, 'Said'), h('span', { class: 'label did-h' }, 'Did')),
      );
      items.forEach((e, i) => {
        const row = `grid-row: ${i + 3}`;
        block.append(
          h('div', { class: 'tl-spine', style: row, 'aria-hidden': 'true' }, h('span', { class: `tl-dot ${e.type}` })),
          h('article', { class: `tl-card ${e.type}`, style: row, 'data-key': e.id, 'data-t': e.time },
            h('span', { class: 'tl-meta' }, stamp(e.type), h('span', { class: 'label' }, fmtDate(e.date)), orgTag(e.org)),
            h('button', { class: 't', type: 'button', onclick: () => openEntry(e.id) }, hl(e.title)),
            state.q && matchContext(e),
            (e.status || e.contradicts.length > 0) && h('span', { class: 'tl-meta' },
              e.status && statusPill(e.status),
              e.contradicts.length > 0 && h('span', { class: 'label' }, `contradicts ${e.contradicts.length === 1 ? 'an earlier statement' : `${e.contradicts.length} statements`}`)),
            e.patterns.length > 0 && h('span', { class: 'tl-patterns' }, patternChips(e.patterns)),
          ),
        );
      });
      first = false;
      frag.push(block);
    }
    return frag;
  }

  function renderPatterns() {
    const saved = state.pattern;
    state.pattern = '';
    const pool = D.entries.filter(matches);
    state.pattern = saved;
    const minY = Math.min(...D.entries.map((e) => +String(e.date).slice(0, 4)));
    const maxY = Math.max(new Date(NOW).getUTCFullYear(), ...D.entries.map((e) => +String(e.date).slice(0, 4)));
    const rows = D.patterns
      .map((p) => ({ p, hits: pool.filter((e) => e.patterns.includes(p.id)) }))
      .filter((r) => r.hits.length)
      .sort((a, b) => b.hits.length - a.hits.length || a.p.name.localeCompare(b.p.name));

    const frag = [viewHead('Patterns',
      'The same moves, repeated. Each row is a pattern and each mark is one entry, placed in the year it happened; the logo shows which company. A row that keeps filling in is a pattern you can plan around.')];
    if (!rows.length) return [...frag, empty()];

    // Years with only a handful of marks share one column, so the busy years get the room.
    const perYear = new Map();
    for (const e of pool) if (e.patterns.length) perYear.set(+String(e.date).slice(0, 4), (perYear.get(+String(e.date).slice(0, 4)) || 0) + 1);
    let cut = maxY;
    while (cut > minY && (perYear.get(cut - 1) || 0) >= 5) cut--;
    const bins = [];
    if (cut > minY) bins.push({ from: minY, to: cut - 1, early: true, label: `${minY}–${String(cut - 1).slice(2)}`, short: `’${String(minY).slice(2)}–${String(cut - 1).slice(2)}`, sub: `${cut - minY} years` });
    for (let y = cut; y <= maxY; y++) bins.push({ from: y, to: y, label: String(y) });
    const inBin = (e, b) => { const y = +String(e.date).slice(0, 4); return y >= b.from && y <= b.to; };
    // Within a year, OpenAI's marks come first, then Anthropic's, each in date order, so the two can be compared at a glance.
    const ORDER = { openai: 0, anthropic: 1 };
    const byOrgThenDate = (a, b) => (ORDER[a.org] ?? 2) - (ORDER[b.org] ?? 2) || String(a.date).localeCompare(String(b.date));
    const counts = (hits) => ['openai', 'anthropic']
      .map((o) => [o, hits.filter((e) => e.org === o).length]).filter(([, n]) => n)
      .map(([o, n]) => `${orgName(o)} ${n}`).join(' · ');

    const key = h('div', { class: 'legend' },
      [['openai', 'said'], ['openai', 'did'], ['anthropic', 'said'], ['anthropic', 'did']].map(([org, type]) =>
        h('span', null, logoMark({ org, type }, { 'aria-hidden': 'true' }), `${orgName(org)} ${type}`)),
      h('span', { class: 'legend-note' }, 'Outlined: something the company said. Filled: something it did. Hover or tab to a mark for its title; click to open it.'));

    const grid = h('div', { class: 'rgrid', role: 'table', 'aria-label': 'Each pattern by year: one mark per entry', style: `--recent: ${bins.filter((b) => !b.early).length}` },
      h('span', { class: 'corner', 'aria-hidden': 'true' }),
      bins.map((b) => h('span', { role: 'columnheader', class: `yh${b.early ? ' early' : ''}`, 'aria-label': b.early ? `${b.from} to ${b.to}` : b.label },
        h('span', { class: `yh-long${b.short ? ' has-short' : ''}` }, b.label), b.short && h('span', { class: 'yh-short', 'aria-hidden': 'true' }, b.short), b.sub && h('span', { class: 'yh-sub' }, b.sub))),
      rows.map(({ p, hits }) => [
        h('button', { class: 'rname', type: 'button', role: 'rowheader', title: `Show ${p.name} on the timeline`, onclick: () => setFilter({ pattern: p.id }, 'timeline') },
          h('span', { class: 'rname-t' }, p.name),
          h('span', { class: 'rname-n' }, `${hits.length} · ${counts(hits)}`)),
        bins.map((b) => h('span', { class: `cell${b.early ? ' early' : ''}`, role: 'cell' },
          hits.filter((e) => inBin(e, b)).sort(byOrgThenDate).map((e) => logoMark(e, {
            tag: 'button',
            type: 'button',
            'aria-label': `${fmtDate(e.date)}, ${orgName(e.org)} ${e.type}: ${e.title}`,
            onclick: () => { hideTip(); openEntry(e.id); },
            onpointerenter: (ev) => showTip(ev.currentTarget, e),
            onpointerleave: hideTip,
            onfocus: (ev) => showTip(ev.currentTarget, e),
            onblur: hideTip,
          })))),
      ]),
    );
    frag.push(h('div', { class: 'grid-wrap' }, key, grid));
    frag.push(h('div', { class: 'patterns-list' }, rows.map(({ p, hits }) => h('section', { class: 'pcard', id: `p-${p.id}` },
      h('span', { class: 'label' }, `${hits.length} entr${hits.length === 1 ? 'y' : 'ies'} · ${[...new Set(hits.map((e) => orgName(e.org)))].join(' + ')} · ${yearSpan(hits)}`),
      h('h3', null, p.name),
      h('p', null, p.thesis),
      h('p', { class: 'pbrief-meta' }, outcomeTally(hits)),
      p.tells?.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Tells'), h('ul', null, p.tells.map((t) => h('li', null, t)))),
      p.watch_for && h('div', { class: 'forecast' }, h('span', { class: 'label' }, 'If the pattern holds (analysis)'), h('p', null, p.watch_for)),
      p.industry && industryNote(p.industry),
      h('div', { class: 'hits' }, hits.map((e) => h('button', { class: 'hit', type: 'button', onclick: () => openEntry(e.id) },
        h('span', { class: 'mono' }, String(e.date).slice(0, 7)), logoMark(e, { size: 'sm', 'aria-hidden': 'true' }),
        h('span', { class: 'ht' }, e.title, e.status && h('span', { class: `mark s-${e.status}`, title: STATUS_LABEL[e.status] }, h('span', { class: 'sr' }, ` (${STATUS_LABEL[e.status]})`)))))),
      h('button', { class: 'btn', type: 'button', onclick: () => setFilter({ pattern: p.id }, 'timeline') }, `Follow ${p.name} on the timeline`),
    ))));
    return frag;
  }

  // A promise's own deadline: the last moment of the period it names, and how to say it.
  function dueOf(e) {
    if (!e.due) return null;
    const d = parseDate(e.due);
    if (!d) return null;
    const t = new Date(d.time);
    const end = d.precision === 'year' ? Date.UTC(t.getUTCFullYear() + 1, 0, 1) - 1
      : d.precision === 'month' ? Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1) - 1 : d.time + DAY - 1;
    return { end, when: d.precision === 'day' ? fmtDate(e.due) : `end of ${fmtDate(e.due)}`, passed: end < NOW };
  }
  // "Due end of March 2027", or "Deadline passed" once it has.
  function dueLine(e) {
    const d = dueOf(e);
    if (!d) return null;
    return h('p', { class: `label due${d.passed && e.status === 'open' ? ' passed' : ''}` }, d.passed ? `Deadline passed: ${d.when}` : `Due ${d.when}`);
  }

  function renderWatchlist() {
    const said = D.entries.filter((e) => e.type === 'said' && matches(e));
    const open = said.filter((e) => e.status === 'open');
    // Promises with a deadline first, soonest (or already passed) at the top; then the rest, newest first.
    const dated = open.filter((e) => dueOf(e)).sort((a, b) => dueOf(a).end - dueOf(b).end);
    const undated = open.filter((e) => !dueOf(e)).sort((a, b) => b.time - a.time);
    const kept = said.filter((e) => e.status === 'kept').sort((a, b) => b.time - a.time);
    const frag = [viewHead('Watchlist',
      'Promises still in force, and the ones that held. Each open promise says in advance what would count as breaking it. Those with a deadline come first, soonest due at the top.'),
    patternBrief(D.entries.filter(matches))];
    if (!open.length && !kept.length) return [...frag, empty()];
    const card = (e) => {
      const due = e.status === 'open' && dueOf(e);
      const days = due ? Math.round((due.end - NOW) / DAY) : Math.max(0, Math.round((NOW - e.time) / DAY));
      // data-t is what its section is ordered by: the deadline under "Coming due", else the date.
      return h('article', { class: `wcard ${e.status}${due?.passed ? ' passed' : ''}`, 'data-key': e.id, 'data-t': due ? due.end : e.time },
        h('div', { class: 'age' },
          due ? [
            h('span', { class: 'label' }, due.passed ? 'Deadline passed' : 'Due in'),
            h('span', { class: 'gap-n' }, span(Math.abs(days)).n),
            h('span', { class: 'label' }, `${span(Math.abs(days)).unit}${due.passed ? ' ago' : ''} · ${due.when}`),
          ] : [
            h('span', { class: 'label' }, e.status === 'kept' ? 'Held for' : 'Standing for'),
            h('span', { class: 'gap-n' }, span(days).n),
            h('span', { class: 'label' }, `${span(days).unit} · since ${fmtDate(e.date)}`),
          ],
        ),
        h('div', { class: 'main' },
          h('div', { class: 'side-head' }, orgTag(e.org), statusPill(e.status), concretePill(e.concreteness, e.kind)),
          titleButton(e),
          quoteBlock(e.quote, e),
          !e.quote && e.summary && h('p', null, hl(clip(e.summary, 260))),
          e.breaks_if && h('div', { class: 'breaks' }, h('span', { class: 'label' }, 'Counts as broken if'), h('p', null, e.breaks_if)),
          e.last_checked && h('p', { class: 'label checked' }, `Last checked ${fmtDate(e.last_checked)}`),
          e.patterns.length > 0 && h('div', { class: 'side-head' }, patternChips(e.patterns)),
        ),
      );
    };
    const section = (key, title, note, items) => items.length > 0 && [
      h('h3', { class: 'section-sub', id: `w-${key}` }, title, h('span', { class: 'section-n' }, items.length)),
      note && h('p', { class: 'section-note' }, note),
      h('div', { class: 'watch', 'data-group': key }, items.map(card)),
    ];
    frag.push(
      section('due', 'Coming due', 'Promises that name a date. When it passes, the record checks whether they were met.', dated),
      section('open', 'No fixed deadline', 'Open-ended promises, newest first. Each is checked against its test whenever the record is updated.', undated),
      section('kept', 'Held under pressure', 'Promises that were tested and kept, so far.', kept),
    );
    return frag.flat().filter(Boolean);
  }

  const gradePill = (g) => h('span', { class: `pill ${GRADE_CLASS[g] || ''}`, title: GRADE_DEF[g] }, GRADE_LABEL[g] || g);
  const keptLine = (t) => t && `${t.kept} of ${t.total} kept`;
  const restLine = (t) => t && ['standing', 'eroded', 'broken', 'unknown'].filter((g) => t[g]).map((g) => `${t[g]} ${g}`).join(' · ');

  function renderCommitments() {
    const orgs = state.org === 'all' ? ['openai', 'anthropic'] : [state.org];
    // A search narrows each document to the commitments that match it, in the
    // commitment's words, its grades' evidence, or the document's own title.
    const words = qWords();
    const shown = (d) => (words.length
      ? d.commitments.filter((c) => hasAll([d.title, d.summary, c.section, c.text, ...Object.values(c.grades || {}).map((g) => g.evidence)].filter(Boolean).join(' '), words))
      : d.commitments);
    const docs = (D.commitments || []).filter((d) => d.parties.some((o) => orgs.includes(o)) && shown(d).length);
    const frag = [viewHead('Commitments',
      'Every commitment in the formal documents each company signed or published, one by one, graded for each company: kept; standing (in force, with nothing public showing it broken); eroded; broken; or unknown, when it can’t be checked from outside. Open a document below for each commitment, its grade and the evidence.')];
    if (!docs.length) return [...frag, empty()];
    const total = Object.fromEntries(orgs.map((o) => [o, { total: 0, kept: 0, standing: 0, eroded: 0, broken: 0, unknown: 0 }]));
    for (const d of docs) for (const o of orgs) for (const [k, v] of Object.entries(d.tally?.[o] || {})) total[o][k] += v;
    // A thin bar of the grades, in the status colors, so documents can be compared at a glance.
    const GRADES = ['kept', 'standing', 'eroded', 'broken', 'unknown'];
    const bar = (t) => h('span', { class: 'gbar', 'aria-hidden': 'true' },
      GRADES.filter((g) => t[g]).map((g) => h('span', { class: `g-${g}`, style: `flex-grow: ${t[g]}` })));
    const cell = (t, o) => (t
      ? h('td', { 'data-org': orgName(o) }, h('span', { class: 'ck' }, keptLine(t)), bar(t), h('span', { class: 'cr' }, restLine(t)))
      : h('td', { class: 'na', 'data-org': orgName(o) }, 'not a party'));
    frag.push(h('div', { class: 'ctable-wrap' }, h('table', { class: 'ctable' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Document'), orgs.map((o) => h('th', { scope: 'col' }, orgName(o))))),
      h('tbody', null, docs.map((d) => h('tr', null,
        h('th', { scope: 'row' }, h('a', { href: `#c-${d.id}`, onclick: (ev) => {
          if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return; // opening it in a new tab or window
          ev.preventDefault();
          const doc = document.getElementById(`c-${d.id}`);
          bring(doc, { ring: doc?.querySelector('h3') });
        } }, d.title)),
        orgs.map((o) => cell(d.tally?.[o], o))))),
      h('tfoot', null, h('tr', null, h('th', { scope: 'row' }, words.length ? 'These documents' : 'All documents'), orgs.map((o) => cell(total[o], o)))),
    )));
    frag.splice(1, 0, h('div', { class: 'gkey', 'aria-hidden': 'true' },
      GRADES.map((g) => h('span', null, h('span', { class: `sw g-${g}` }), GRADE_LABEL[g]))));
    frag.push(h('p', { class: 'cnote' }, 'Documents differ in length and in how much can be checked from outside, so counts across documents are not a score. Read the evidence.'));
    for (const d of docs) {
      const list = shown(d);
      frag.push(h('section', { class: 'cdoc', id: `c-${d.id}` },
        h('h3', null, hl(d.title)),
        h('div', { class: 'pbrief-meta' }, h('span', null, fmtDate(d.date)), h('span', { class: 'pbrief-orgs' }, d.parties.map(orgTag)),
          d.parties.filter((o) => orgs.includes(o)).map((o) => h('span', null, `${orgName(o)}: ${keptLine(d.tally?.[o])}`))),
        d.summary && h('p', null, d.summary),
        h('details', { open: words.length > 0 },
          h('summary', null, words.length ? `${list.length} of the ${d.commitments.length} commitments match` : `The ${d.commitments.length} commitments`),
          h('ol', { class: 'clist' }, list.map((c) => h('li', { class: 'citem' },
            h('div', { class: 'cmeta' }, [c.section, c.versions].filter(Boolean).join(' · ')),
            h('blockquote', null, hl(c.text)),
            orgs.filter((o) => c.grades?.[o]).map((o) => h('div', { class: 'cgrade' },
              h('div', { class: 'side-head' }, orgTag(o), gradePill(c.grades[o].grade)),
              h('p', null, hl(c.grades[o].evidence)),
              (c.grades[o].entries || []).length > 0 && h('div', { class: 'hits' }, linkList(c.grades[o].entries, 'see')),
              (c.grades[o].sources || []).length > 0 && sourceList(c.grades[o].sources),
            )))))),
        h('details', null, h('summary', null, 'Sources'), sourceList(d.sources)),
      ));
    }
    return frag;
  }

  /** A change in the policy log fits the company, page, kind of notice and search. */
  function changeMatches(c, { fp = state.fp } = {}) {
    if (state.org !== 'all' && c.org !== state.org) return false;
    if (state.page && c.page !== state.page) return false;
    if (fp === 'cut' ? !c.cut : fp && c.disclosure !== fp) return false;
    const words = qWords();
    return !words.length || hasAll([c.change, c.notice, c.when, policyPageById.get(c.page)?.title].filter(Boolean).join(' '), words);
  }
  // A saved copy of a page: a Wayback Machine capture, or a copy kept in the repository.
  const copyLink = (x) => h('a', { href: x.archive || `${D.site.repo}/blob/HEAD/${x.file}`, target: '_blank', rel: 'noopener' }, fmtDate(x.date));
  // Where each phrase a change quotes was found: the first and last saved copies of the page that hold it.
  function quoteEvidence(c) {
    const qs = c.quotes || [];
    const found = qs.filter((q) => q.first);
    if (!found.length) return null;
    const line = found.length === 1 ? '✓ Quote found in archived copies of the page' : `✓ ${found.length === qs.length ? `All ${qs.length}` : `${found.length} of ${qs.length}`} quotes found in archived copies of the page`;
    return h('details', { class: 'insource' },
      h('summary', { class: 'verified' }, line, h('span', { class: 'see' }, 'See which copies')),
      h('div', { class: 'insource-body' },
        h('p', { class: 'label' }, 'Earliest and latest saved copy holding each quote'),
        h('ul', { class: 'qev' }, found.map((q) => h('li', null,
          h('span', { class: 'qev-q' }, '“', q.text, '”'),
          h('span', { class: 'qev-when' }, q.first.date === q.last.date ? ['In the copy of ', copyLink(q.first)] : ['In copies from ', copyLink(q.first), ' to ', copyLink(q.last)])))),
      ));
  }
  // How a change was made known. Entry ids in backticks link to those entries.
  function noticeText(text) {
    return String(text).split(/`([^`]+)`/).map((part, i) => {
      if (i % 2 === 0) return hl(part);
      const e = byId.get(part);
      return e ? h('button', { class: 'linkish', type: 'button', onclick: () => openEntry(e.id) }, e.title) : part;
    });
  }
  // When a change was made: the day, or the two archived copies it falls between, and what the log adds.
  const humanDates = (t) => String(t).replace(/\b\d{4}-\d{2}(?:-\d{2})?\b/g, (d) => fmtDate(d));
  function whenParts(c) {
    const m = /^(\d{4}-\d{2}(?:-\d{2})?) to (\d{4}-\d{2}(?:-\d{2})?)\s*(.*)$/.exec(c.when || '');
    if (m) return { big: [fmtDate(m[1]), h('br'), `to ${fmtDate(m[2])}`], note: m[3] ? humanDates(m[3]) : 'between two archived copies' };
    return { big: fmtDate(c.date), note: c.when ? humanDates(c.when) : null };
  }
  function changeCard(c) {
    const pg = policyPageById.get(c.page);
    const [label, def] = DISCLOSURE[c.disclosure] || [c.disclosure, ''];
    return h('article', { class: `fcard ${c.disclosure === 'none' ? 'quiet' : ''}`, 'data-key': c.key, 'data-t': c.time },
      h('div', { class: 'fwhen' },
        h('span', { class: 'f-date' }, whenParts(c).big),
        whenParts(c).note && h('span', { class: 'label' }, whenParts(c).note)),
      h('div', { class: 'main' },
        h('div', { class: 'side-head' },
          orgTag(c.org),
          h('button', { class: 'chip', type: 'button', 'data-p': c.page, 'aria-pressed': String(state.page === c.page), title: state.page === c.page ? 'Show every page' : 'Show only this page',
            onclick: (ev) => setFilter({ page: state.page === c.page ? '' : c.page }, null, ev.currentTarget) }, pg?.title || c.page)),
        h('p', { class: 'fchange' }, hl(c.change)),
        quoteEvidence(c),
        h('div', { class: 'fnotice' },
          h('span', { class: `pill d-${c.disclosure === 'n/a' ? 'na' : c.disclosure}`, title: def }, label),
          c.cut && h('span', { class: 'pill cut', title: 'This change cut what users get or what the company had promised, with no notice found. Sorting changes this way is a judgment.' }, 'Cut without notice'),
          c.notice !== 'n/a' && h('span', { class: 'fnotice-text' }, noticeText(c.notice))),
      ),
    );
  }

  function renderFineprint() {
    const orgs = state.org === 'all' ? ['openai', 'anthropic'] : [state.org];
    const frag = [viewHead('Fine print',
      'Every change found in the archived history of both companies’ usage policies, terms, privacy policies, pricing pages, usage-limit help pages and model-retirement pages, and how each one was made known. Words in quotation marks are the page’s own, and each was found in a saved copy of it. Newest first.')];
    // Both companies side by side: how many changes, and how each was made known.
    const inOrg = (o) => allChanges.filter((c) => c.org === o);
    const n = (o, pred) => inOrg(o).filter(pred).length;
    // Shares are of the changes whose notice was checked.
    const checked = (o) => n(o, (c) => c.disclosure !== 'unchecked');
    const versions = (o) => policyPages.filter((p) => p.org === o).reduce((sum, p) => sum + (+(/([\d,]+) versions/.exec(p.versions || '')?.[1] || '0').replace(/,/g, '')), 0);
    const rows = [
      ['Pages compared', (o) => policyPages.filter((p) => p.org === o).length],
      ['Archived versions read', versions],
      ['Changes found', (o) => inOrg(o).length],
      ...['announced', 'page', 'none', 'n/a', 'unchecked'].map((d) => [DISCLOSURE[d][0], (o) => n(o, (c) => c.disclosure === d), d]),
      ['Cuts made without notice', (o) => n(o, (c) => c.cut), 'cut'],
    ];
    frag.push(h('div', { class: 'ctable-wrap' }, h('table', { class: 'ctable ftable' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Pages'), orgs.map((o) => h('th', { scope: 'col' }, orgName(o))))),
      h('tbody', null, rows.filter(([, f]) => orgs.some((o) => f(o) > 0)).map(([label, f, key]) => h('tr', { class: key ? `r-${key === 'n/a' ? 'na' : key}` : '' },
        h('th', { scope: 'row', title: DISCLOSURE[key]?.[1] }, label),
        orgs.map((o) => h('td', { 'data-org': orgName(o) }, h('span', { class: 'ck' }, f(o).toLocaleString('en-US')),
          key && key !== 'unchecked' && h('span', { class: 'cr' }, `${Math.round((f(o) / checked(o)) * 100)}% of ${checked(o)}`)))))),
    )));
    frag.push(h('p', { class: 'cnote' }, 'Shares are of the changes whose notice was checked. “No notice found” means none turned up in the company’s posts, blogs and release notes or in a news search; it does not prove none was made. A cut is a change that reduced what users get or what the company had promised; sorting changes that way is a judgment. OpenAI’s pages have more archived versions, so compare shares, not raw counts. How the pages were compared, and what couldn’t be, is in ',
      h('a', { href: `${D.site.repo}/blob/HEAD/inbox/history/CHANGES.md`, target: '_blank', rel: 'noopener' }, 'the method notes'),
      '. The whole log is also on ', h('a', { href: siteFile('fine-print.html') }, 'one plain page'), ' and in ', h('a', { href: siteFile('fine-print.csv'), download: '' }, 'a spreadsheet'), '.'));

    // Filters: the kind of notice, and one page.
    const fpCount = (k) => allChanges.filter((c) => changeMatches(c, { fp: k })).length;
    const pageSel = h('select', { class: 'fp-page', onchange: (ev) => setFilter({ page: ev.currentTarget.value }, null, ev.currentTarget) },
      h('option', { value: '' }, 'Every page'),
      ['openai', 'anthropic'].filter((o) => orgs.includes(o)).map((o) => h('optgroup', { label: orgName(o) },
        policyPages.filter((p) => p.org === o).map((p) => h('option', { value: p.page, selected: state.page === p.page }, p.title)))));
    frag.push(h('div', { class: 'pstrip fstrip', role: 'group', 'aria-label': 'Show changes' },
      h('span', { class: 'label' }, 'Show'),
      h('div', { class: 'pstrip-chips' }, FP_FILTERS.map(([k, label]) => h('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(state.fp === k), 'data-fp': k,
        onclick: (ev) => setFilter({ fp: k }, null, ev.currentTarget),
      }, label, h('span', { class: 'n' }, fpCount(k))))),
      h('label', { class: 'field' }, h('span', { class: 'label' }, 'Page'), pageSel)));

    // One page picked: what to know about its history.
    const pg = policyPageById.get(state.page);
    if (pg) {
      frag.push(h('section', { class: 'pbrief', 'aria-label': `About ${pg.title}` },
        h('div', { class: 'pbrief-head' },
          h('span', { class: 'label' }, 'One page'),
          h('span', { class: 'spacer' }),
          h('button', { class: 'clear label fp-all', type: 'button', onclick: (ev) => setFilter({ page: '' }, null, ev.currentTarget) }, 'Every page')),
        h('h3', null, pg.title),
        h('p', { class: 'pbrief-meta' }, orgTag(pg.org), pg.versions && h('span', null, pg.versions),
          pg.url && h('a', { href: pg.url, target: '_blank', rel: 'noopener' }, 'The page today'),
          pg.url && h('a', { href: `https://web.archive.org/web/*/${pg.url}`, target: '_blank', rel: 'noopener' }, 'Every archived copy')),
        pg.note && h('p', null, pg.note),
        pg.after && h('p', null, pg.after)));
    }

    const list = allChanges.filter((c) => changeMatches(c));
    if (!list.length) return [...frag, empty()];
    // A page of changes, then more on request; after a filter change, far enough to include the one the reader was on.
    const kept = pendingKeep ? list.findIndex((c) => c.key === pendingKeep.key) : -1;
    const first = kept < 0 ? FP_PAGE : kept + 1 + FP_PAGE;
    const box = h('div', { class: 'flist' }, list.slice(0, first).map(changeCard));
    frag.push(box);
    if (list.length > first) {
      let shown = first;
      const note = h('span', { class: 'label' });
      const more = h('button', { class: 'btn', type: 'button' });
      const all = h('button', { class: 'clear label', type: 'button' }, `Show all ${list.length}`);
      const bar = h('div', { class: 'more-bar' }, more, all, note);
      const sync = () => {
        more.textContent = `Show ${Math.min(FP_PAGE, list.length - shown)} more`;
        note.textContent = `${shown} of ${list.length} changes shown`;
        if (shown >= list.length) bar.remove();
      };
      const reveal = (k) => {
        const added = list.slice(shown, shown + k).map(changeCard);
        box.append(...added);
        shown += added.length;
        sync();
        added[0]?.querySelector('button')?.focus({ preventScroll: true });
        mark(added[0]);
      };
      more.addEventListener('click', () => reveal(FP_PAGE));
      all.addEventListener('click', () => reveal(list.length));
      sync();
      frag.push(bar);
    }
    // Pages whose history showed nothing worth a row still say what was read.
    const quietPages = policyPages.filter((p) => !p.changes.length && orgs.includes(p.org) && (!state.page || p.page === state.page));
    if (quietPages.length && !state.fp && !state.q) {
      frag.push(h('h3', { class: 'section-sub' }, 'Pages read in summary', h('span', { class: 'section-n' }, quietPages.length)),
        h('p', { class: 'section-note' }, 'For these pages the history is summed up rather than logged change by change.'),
        h('div', { class: 'fsum' }, quietPages.map((p) => h('div', null,
          h('div', { class: 'side-head' }, orgTag(p.org), h('b', null, p.title), p.versions && h('span', { class: 'label' }, p.versions)),
          h('p', null, p.note)))));
    }
    return frag;
  }

  function renderMethod() {
    const repo = D.site.repo;
    return [
      viewHead('Method', 'How this record is kept, and what counts as evidence.'),
      h('section', { class: 'key', 'aria-label': 'How to read an entry' },
        h('h3', null, 'How to read an entry'),
        h('dl', { class: 'key-list' },
          h('dt', null, stamp('said')), h('dd', null, 'Something a company or one of its leaders said: a principle, a commitment, a claim or a denial, quoted word for word.'),
          h('dt', null, stamp('did')), h('dd', null, 'Something a company did: an action, a policy rewrite, a disclosure.'),
          h('dt', null, h('span', { class: 'stamp did' }, 'Outcome')), h('dd', null, 'What became of a statement when there is no single action to point to, such as a date that passed with nothing shipped.'),
          h('dt', null, h('span', { class: 'key-orgs' }, orgTag('openai'), orgTag('anthropic'))), h('dd', null, 'Whose entry it is. On the Patterns grid each entry is one mark: the logo in a circle (OpenAI) or a square (Anthropic), outlined for said and filled for did.'),
          h('dt', null, statusPill('broken')), h('dd', null, 'How a statement turned out. The full list of statuses is below.'),
          h('dt', null, concretePill('measurable', 'commitment')), h('dd', null, 'How testable the statement was when it was made, from measurable to aspirational.'),
          h('dt', null, h('span', { class: 'label' }, 'Counts as broken if')), h('dd', null, 'The test for an open promise, written down before anyone needs it.'),
          h('dt', null, h('span', { class: 'verified' }, '✓ Quote matches the saved source')), h('dd', null, 'The quote was found word for word in a copy of the source saved by this record, so an edited or deleted page doesn’t erase it. Open the line to see the quote highlighted in the saved passage.'),
        )),
      h('div', { class: 'prose' },
        h('p', null, 'Every entry is either something a company or one of its leaders ', h('b', null, 'said'), ' (a principle, a commitment, a claim, a denial) or something they ', h('b', null, 'did'), '. A "did" entry that contradicts an earlier "said" entry links back to it, and that link is a receipt. A statement that failed with no separate action to point to (a date that passed with nothing shipped, a claim the company\'s own earlier paper contradicts) carries a dated outcome instead, shown as a receipt too. Every statement graded broken, reversed, eroded or contradicted has one.'),
        h('p', null, 'Claims are not limited to safety and ethics. Capability and benchmark claims, promised features and release dates, usage limits and what a plan includes, and promises about how a product behaves are recorded too when they are notable and can be checked, whether they held up or not.'),
        h('h3', null, 'Standards'),
        h('ul', null,
          h('li', null, 'Every entry cites at least one source. Primary sources (the company’s own post, the original social post, testimony) are preferred; reporting is labeled as reporting.'),
          h('li', null, 'Quotes are verbatim. A paraphrase never goes in a quote field.'),
          h('li', null, 'Each entry records the company’s or person’s own response where one exists (“Their side”).'),
          h('li', null, 'Commentary is labeled as commentary and kept separate from the facts.'),
          h('li', null, 'Snapshots and archive links are taken at capture time, so a deleted post or an edited page still has a record.'),
          h('li', null, 'Kept promises are recorded too. A record that only counts failures is easier to dismiss.'),
        ),
        h('h3', null, 'Who writes it'),
        h('p', null, 'Claude, an AI model made by Anthropic, does most of the research and writing for this record: it finds and reads the sources, drafts the entries and built this site. Anthropic is one of the two companies the record covers, which is a conflict of interest worth weighing. That is one reason every claim links to its source, so it can be checked without trusting the writer, and one reason both companies are held to the same rules.'),
        h('p', null, 'Apart from the first version, published on September 29, 2026, every change to the entries has come through a pull request, merged only when the repository’s owner said to, and the full history is public. Automated jobs also commit page snapshots, snapshot and archive links, and source checks on their own. Where a source has a saved copy, the build checks each quote against it word for word.'),
        h('h3', null, 'Where entries come from'),
        h('p', null, 'Company announcements, filings, testimony and reporting, plus the public posts of the companies and their people. For posts on Twitter/X, every archived post of 77 accounts was pulled from the Wayback Machine, including posts later deleted. All 82,863 posts these accounts wrote from December 2015 on that have text in the archive were read in full and given a decision: change the record, follow up, context for an existing entry, or no action. That reading looked for safety, ethics and policy claims. A second reading looked for every other kind of notable claim (capabilities and benchmarks, features and release dates, usage limits and plan terms, promises about how a product behaves, and dated predictions) in the 41,679 posts each person wrote while at the company or after leaving it, including 5,154 collected after the first reading. Every collected post now has a decision; the logs are in the repository.'),
        h('p', null, 'Limits: posts nobody archived can’t be found this way, and for Elon Musk only the latest year was read. The decisions, per-account counts and what became of each follow-up are in ', h('code', null, 'inbox/sweep/TRIAGE.md'), ' in the repository.'),
        h('p', null, 'Beyond Twitter/X, a September 2026 review read the companies’ system cards, risk reports and safety frameworks against each other, checked policy versions, court records, testimony and investigative reporting, and looked for each company’s counterpart to the other’s entries. An October 2026 review did the same for product, pricing and capability claims. What they covered, the two companies side by side, and what may still be missing are in ', h('code', null, 'COVERAGE.md'), ' in the repository.'),
        h('p', null, 'A fairness review in October 2026 then worked through seven gaps, the same way for both companies. It read in full 194 of the 201 long-form spoken appearances found for ten company leaders since 2021 (podcasts and testimony; the rest had no usable recording or transcript). It graded every commitment in nine formal documents for each company: OpenAI kept 31 of 127, Anthropic 39 of 127 (see Commitments). It compared 1,932 archived versions of 33 policy, terms, pricing, usage-limit and model-retirement pages, and logged 211 changes and how each was made known (see Fine print). It re-read the 9,021 replies by company accounts and executives next to the posts they answered (all but 1,576 could be retrieved). It gave every “did” entry the company’s response, or says none was found, and re-checked every open promise (the date is on the Watchlist). It set both companies’ federal and state lobbying filings against what they said in public about regulation: Anthropic’s filings name the bills it lobbied on, while OpenAI’s have named none since 2024. And where a pattern’s behavior is industry-wide, it added one sourced example from another company. Counts, method and what couldn’t be done are in ', h('code', null, 'COVERAGE.md'), '.'),
        h('h3', null, 'Who is in scope'),
        h('p', null, 'Organizations, and people speaking in a public or official role: executives, founders, board members, and staff who speak publicly about the company’s mission, products, safety or policy. No private individuals, private accounts, family members or personal lives.'),
        h('h3', null, 'Status of a statement'),
        h('div', { class: 'defs' }, Object.keys(STATUS_DEF).flatMap((k) => [statusPill(k), h('span', null, STATUS_DEF[k])])),
        h('h3', null, 'Patterns'),
        h('p', null, 'Patterns are this record’s analysis, not anyone’s words: a pattern is a move that recurs across the years or across both companies. Each entry is tagged with every pattern it shows, and some entries fit none. A promise that held keeps its tag when it was a test of the pattern, so following a pattern shows where it held as well as where it didn’t. Where the behavior is industry-wide, a pattern also gives one sourced example from another company, as context: the record has no entries about other companies. Pick a pattern on the timeline, or from any entry, to follow it through every view.'),
        h('h3', null, 'How concrete was it?'),
        h('p', null, 'Vague promises can’t be broken, which is often the point. Each statement is graded on how testable it was when made.'),
        h('div', { class: 'defs' }, Object.keys(CONCRETE_DEF).flatMap((k) => [concretePill(k), h('span', null, CONCRETE_DEF[k])])),
        h('h3', null, 'Following and sharing'),
        h('p', null, 'New entries and updates to existing ones are listed in an RSS feed',
          D.site.url ? [' (', h('a', { href: `${D.site.url}feed.xml`, target: '_blank', rel: 'noopener' }, 'feed.xml'), ')'] : null,
          '. The address of each view carries its filters, so a filtered view can be shared as it is, and each entry has its own link.'),
        h('h3', { id: 'data' }, 'The record as data'),
        h('p', null, 'The whole record can be downloaded, rebuilt from the repository each time the site is published:'),
        h('ul', null,
          h('li', null, h('a', { href: siteFile('said-did.json'), download: '' }, 'said-did.json'), ': everything, with every field: entries, receipts, commitments and their grades, the fine print log, people and patterns.'),
          h('li', null, h('a', { href: siteFile('entries.csv'), download: '' }, 'entries.csv'), ': one row per entry, for a spreadsheet.'),
          h('li', null, h('a', { href: siteFile('fine-print.csv'), download: '' }, 'fine-print.csv'), ': one row per change in the fine print log.'),
          h('li', null, h('a', { href: siteFile('record.html') }, 'record.html'), ' and ', h('a', { href: siteFile('fine-print.html') }, 'fine-print.html'), ': the same, as plain pages to read, print or save.'),
        ),
        h('p', null, 'Each entry, opened, gives a citation for itself. To cite the record as a whole: ', h('span', { class: 'cite' }, recordCitation()),
          ' ', h('button', { class: 'clear label', type: 'button', onclick: (ev) => copyText(recordCitation(), ev.currentTarget, 'Citation copied') }, 'Copy')),
        D.commit && repo && h('p', null, 'This copy of the site was built from commit ', h('a', { href: `${repo}/tree/${D.commit}`, target: '_blank', rel: 'noopener' }, h('code', null, D.commit)),
          ', which stays at that address after the record changes. Link to it when a citation has to point at a version that won’t move.'),
        h('h3', null, 'Corrections and additions'),
        h('p', null, 'The record lives in a public repository as one file per entry. To add an entry or correct one, open an issue or a pull request with the source.',
          repo ? [' ', h('a', { href: repo, target: '_blank', rel: 'noopener' }, 'Repository')] : null),
        h('h3', null, 'Related work'),
        h('ul', null,
          h('li', null, h('a', { href: 'https://www.openaifiles.org/', target: '_blank', rel: 'noopener' }, 'The OpenAI Files'), ': a compilation of documented concerns about OpenAI’s governance and leadership.'),
          h('li', null, h('a', { href: 'https://ailabwatch.org/resources/commitments', target: '_blank', rel: 'noopener' }, 'AI Lab Watch'), ': tracks commitments made by frontier AI companies.'),
          h('li', null, h('a', { href: 'https://tracker.safer-ai.org/', target: '_blank', rel: 'noopener' }, 'SaferAI risk-management ratings'), ': grades companies’ safety frameworks.'),
        ),
        h('p', { class: 'label' }, `Record built ${fmtDay.format(new Date(D.generated))} · ${D.stats.entries} entries`),
      ),
    ];
  }

  // ── entry dialog ───────────────────────────────────────────────────────
  const dialog = document.getElementById('entry');
  function sourceList(sources) {
    return h('ul', { class: 'sources' }, (sources || []).map((s) => h('li', null,
      h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title),
      h('span', { class: 'src-meta' },
        s.publisher && h('span', null, s.publisher),
        s.date && h('span', null, fmtDate(s.date)),
        s.type && h('span', null, s.type),
        s.archive && h('a', { href: s.archive, target: '_blank', rel: 'noopener' }, `archived ${archiveStamp(s.archive)}`),
        s.snapshot && (snapshotHref(s.snapshot)
          ? h('a', { href: snapshotHref(s.snapshot), target: '_blank', rel: 'noopener' }, `snapshot ${snapDate(s.snapshot) || ''}`)
          : h('span', null, `snapshot ${s.snapshot}`)),
      ),
    )));
  }
  function archiveStamp(url) {
    const m = /\/web\/(\d{8})/.exec(url);
    return m ? m[1] : 'copy';
  }
  function linkList(ids, verb) {
    return ids.map((id) => byId.get(id)).filter(Boolean).map((x) => h('button', { class: 'hit', type: 'button', onclick: () => openEntry(x.id) },
      h('span', { class: 'mono' }, verb), stamp(x.type), h('span', { class: 'ht' }, `${fmtDate(x.date)} — ${x.title}`)));
  }

  function openEntry(id, { fromHash = false } = {}) {
    const e = byId.get(id);
    if (!e) return;
    const pairs = [
      ...e.contradicts.map((sid) => [byId.get(sid), e]),
      ...e.contradicted_by.map((did) => [e, byId.get(did)]),
    ];
    dialog.replaceChildren(
      h('div', { class: 'd-head' },
        h('div', { class: 'd-meta' }, stamp(e.type), h('span', { class: 'label' }, fmtDate(e.date)), orgTag(e.org)),
        h('div', { class: 'd-actions' },
          h('button', { class: 'btn', type: 'button', onclick: (ev) => copyReceipt(pairs[0]?.[0] || (e.type === 'said' ? e : null), pairs[0]?.[1] || (e.type === 'did' ? e : null), ev.currentTarget) }, 'Copy receipt'),
          h('button', { class: 'btn', type: 'button', onclick: (ev) => shareLink(permalink(e.id), e.title, ev.currentTarget) }, navigator.share ? 'Share' : 'Copy link'),
          h('button', { class: 'btn close', type: 'button', onclick: () => dialog.close(), 'aria-label': 'Close' }, h('span', { 'aria-hidden': 'true' }, '×')),
        ),
        (e.status || e.concreteness) && h('div', { class: 'd-tags' }, e.status && statusPill(e.status), concretePill(e.concreteness, e.kind)),
      ),
      h('div', { class: 'd-body' },
        h('h2', { id: 'entry-title' }, hl(e.title)),
        (e.who.length > 0 || e.venue) && h('p', { class: 'label' }, [e.who.map(actorName).join(', '), e.venue].filter(Boolean).join(' · ')),
        e.quote && h('div', { class: `side ${e.type}`, style: 'padding:0;background:none' }, quoteBlock(e.quote, e)),
        e.summary && h('p', null, hl(e.summary)),
        e.revision && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'What changed'),
          h('div', { class: 'diff' }, h('div', { class: 'minus' }, h('b', null, '−'), h('span', { class: 'rev-text' }, hl(e.revision.before))), h('div', { class: 'plus' }, h('b', null, '+'), h('span', { class: 'rev-text' }, hl(e.revision.after))))),
        e.breaks_if && h('div', { class: 'breaks' }, h('span', { class: 'label' }, 'Counts as broken if'), h('p', null, e.breaks_if)),
        dueLine(e),
        e.outcome && h('div', { class: 'd-section' }, h('span', { class: 'label' }, `Outcome, ${fmtDate(e.outcome.date)}`), h('p', null, hl(e.outcome.text))),
        e.last_checked && h('p', { class: 'label checked' }, `Status last checked against the record on ${fmtDate(e.last_checked)}`),
        (e.contradicts.length + e.contradicted_by.length + e.related.length > 0) && h('div', { class: 'd-section links' },
          h('span', { class: 'label' }, 'Connected entries'),
          linkList(e.contradicts, 'contradicts'), linkList(e.contradicted_by, 'contradicted by'), linkList(e.related, 'related')),
        e.updates?.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Since then'),
          h('ul', { class: 'updates' }, e.updates.map((u) => h('li', null, h('span', { class: 'mono' }, fmtDate(u.date)),
            h('div', null, h('p', null, hl(u.text)), u.sources?.length > 0 && sourceList(u.sources)))))),
        e.response && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Their side'), h('p', null, e.response)),
        e.note && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Commentary'), h('p', { class: 'note' }, e.note)),
        e.patterns.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Patterns (analysis)'),
          e.patterns.map((id) => patternById.get(id)).filter(Boolean).map((p) => h('div', { class: 'd-pattern' },
            h('p', null, h('b', null, p.name), ' ', h('span', { class: 'muted' }, p.thesis)),
            h('div', { class: 'side-head' },
              h('button', { class: 'chip', type: 'button', onclick: () => { dialog.close(); setFilter({ pattern: p.id }, 'timeline'); } }, 'Follow on the timeline'),
              h('button', { class: 'chip', type: 'button', onclick: () => { dialog.close(); location.hash = `p-${p.id}`; } }, 'About this pattern'))))),
        h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Sources'), sourceList(e.sources)),
        h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Cite this entry'),
          h('p', { class: 'cite' }, citation(e), ' ',
            h('button', { class: 'clear label', type: 'button', onclick: (ev) => copyText(citation(e), ev.currentTarget, 'Citation copied') }, 'Copy'))),
        D.site.repo && e.file && h('p', { class: 'label' }, h('a', { href: `${D.site.repo}/blob/HEAD/${e.file}`, target: '_blank', rel: 'noopener' }, 'View or correct this entry')),
      ),
    );
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (!fromHash) setHash(`#e-${id}`);
  }
  dialog.addEventListener('close', () => {
    if (location.hash.startsWith('#e-')) setHash(hashFor(state));
  });
  // Keyboard focus that lands under the sticky bar, or under the entry window's own
  // sticky header, is brought out from under it. Clicks are left alone.
  document.addEventListener('focusin', (ev) => {
    const el = ev.target;
    if (!(el instanceof Element) || !ringed(el)) return;
    const inEntry = dialog.contains(el);
    const cover = inEntry ? dialog.querySelector('.d-head') : controls;
    if (!cover || (!inEntry && getComputedStyle(controls).position !== 'sticky')) return;
    if (cover.contains(el) || !(cover.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) return;
    const ring = el.matches('.tl-card .t') ? el.closest('.tl-card') : el; // a timeline title rings its whole card
    const under = cover.getBoundingClientRect().bottom + 8 - ring.getBoundingClientRect().top;
    if (under > 0) (inEntry ? dialog : window).scrollBy(0, -under);
  });
  dialog.addEventListener('click', (ev) => { if (ev.target === dialog) dialog.close(); });

  // ── copy a receipt as plain text, for posting ─────────────────────────
  // The public site gives each entry a page whose link preview shows the receipt.
  function permalink(id) {
    return D.site.url ? `${D.site.url}e/${id}/` : `${location.href.split('#')[0]}#e-${id}`;
  }
  function receiptText(s, d) {
    const lines = [];
    // Link the source the quote was matched in, else the first primary source.
    const src = (e) => {
      const list = e.sources || [];
      const s = list.find((x) => x.snapshot && x.snapshot === e.quote_check?.snapshot) || list.find((x) => x.type === 'primary') || list[0];
      return s?.archive || s?.url;
    };
    if (s) {
      lines.push(`SAID — ${orgName(s.org)}, ${fmtDate(s.date)}${s.who.length ? ` (${s.who.map(actorName).filter((n) => n !== orgName(s.org)).join(', ') || orgName(s.org)})` : ''}:`);
      lines.push(s.quote ? `“${s.quote.trim()}”` : s.title);
      if (src(s)) lines.push(src(s));
    }
    if (s && !d && s.outcome) {
      const gap = Math.round((s.outcome.time - s.time) / DAY);
      lines.push('', `${gap < 0 ? 'ALREADY ON RECORD' : 'OUTCOME'} — ${fmtDate(s.outcome.date)}, ${fmtSpan(gap)} ${gap < 0 ? 'before' : 'later'}:`, s.outcome.text);
    }
    if (d) {
      if (lines.length) lines.push('');
      const gap = s ? ` — ${fmtSpan(Math.round((d.time - s.time) / DAY))} later` : '';
      lines.push(`DID — ${fmtDate(d.date)}${gap}:`);
      lines.push(d.title);
      if (d.revision) lines.push(`Before: ${d.revision.before}`, `After: ${d.revision.after}`);
      if (src(d)) lines.push(src(d));
    }
    const pats = [...new Set([...(s?.patterns || []), ...(d?.patterns || [])])].map((p) => patternById.get(p)?.name).filter(Boolean);
    if (pats.length) lines.push('', `Pattern${pats.length > 1 ? 's' : ''}: ${pats.join(', ')}`);
    lines.push('', `Full receipt: ${permalink((d || s).id)}`);
    return lines.join('\n');
  }
  // Citations name the site, the entry and the day it was read, since the record keeps changing.
  const today = () => fmtDay.format(new Date());
  function citation(e) {
    return `${D.site.title}. “${e.title}.” ${orgName(e.org)} ${e.type === 'said' ? 'statement' : 'action'}, ${fmtDate(e.date)}. Entry ${e.id}. ${permalink(e.id)}. Accessed ${today()}.`;
  }
  function recordCitation() {
    return `${D.site.title}: ${D.site.tagline} ${siteBase()}. Accessed ${today()}.`;
  }
  // Copy plain text, or show it selected for copying where the clipboard is refused.
  function copyText(text, button, done) {
    const fallback = () => {
      const ta = h('textarea', { class: 'copy-fallback', readonly: true, 'aria-label': 'Text to copy' });
      ta.value = text;
      const host = dialog.open ? dialog.querySelector('.d-body') : view;
      host.prepend(ta);
      ta.focus();
      ta.select();
      toast('Select the text and copy it');
    };
    try {
      navigator.clipboard.writeText(text).then(() => confirmCopied(button, done), fallback);
    } catch {
      fallback();
    }
  }
  function confirmCopied(button, msg) {
    toast(msg);
    if (!button) return;
    const label = button.dataset.label || button.textContent;
    button.dataset.label = label;
    button.classList.add('done');
    button.textContent = `✓ ${msg}`;
    clearTimeout(button._t);
    button._t = setTimeout(() => { button.textContent = label; button.classList.remove('done'); }, 1600);
  }
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.append(t); }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function copyReceipt(s, d, button) {
    copyText(receiptText(s, d), button, 'Receipt copied');
  }

  // ── controls ───────────────────────────────────────────────────────────
  const tabs = document.getElementById('tabs');
  const orgSeg = document.getElementById('org');
  const patternSel = document.getElementById('pattern');
  const personSel = document.getElementById('person');
  const search = document.getElementById('q');
  const countEl = document.getElementById('count');

  const counts = {
    receipts: allReceipts.length,
    timeline: D.entries.length,
    patterns: D.patterns.length,
    watchlist: D.entries.filter((e) => e.status === 'open' || e.status === 'kept').length,
    commitments: (D.commitments || []).reduce((n, d) => n + d.commitments.length, 0),
    fineprint: allChanges.length,
  };
  tabs.replaceChildren(...VIEWS.map((v) => h('button', {
    class: 'tab', type: 'button', role: 'tab', id: `tab-${v}`, 'aria-selected': 'false', 'aria-controls': 'view',
    onclick: () => go(v),
  }, VIEW_LABEL[v] || v[0].toUpperCase() + v.slice(1), counts[v] != null && h('span', { class: 'count' }, counts[v]))));

  orgSeg.replaceChildren(...['all', 'openai', 'anthropic'].map((o) => h('button', {
    type: 'button', 'aria-pressed': String(state.org === o), onclick: (ev) => setFilter({ org: o }, null, ev.currentTarget),
  }, o === 'all' ? 'Both' : orgName(o))));
  patternSel.replaceChildren(h('option', { value: '' }, 'All patterns'), ...D.patterns.map((p) => h('option', { value: p.id }, p.name)));
  personSel.replaceChildren(h('option', { value: '' }, 'Everyone'), ...personActors.map((a) => h('option', { value: a.id }, `${a.name}${a.org ? ` (${orgName(a.org)})` : ''}`)));
  patternSel.addEventListener('change', () => setFilter({ pattern: patternSel.value }, null, patternSel));
  personSel.addEventListener('change', () => setFilter({ person: personSel.value }, null, personSel));
  let qTimer;
  search.addEventListener('input', () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      const q = search.value.trim();
      const changed = q !== state.q;
      setFilter({ q });
      // New results are read from the top, so a reader deep in the old list goes back to its start.
      if (changed && state.view !== 'method' && scrollY > viewTop()) scrollTo({ top: viewTop() });
    }, 150);
  });
  const clearButton = document.getElementById('clear');
  clearButton.addEventListener('click', clearFilters);
  const shareView = document.getElementById('share-view');
  shareView.textContent = navigator.share ? 'Share this view' : 'Copy link to this view';
  shareView.addEventListener('click', () => shareLink(`${siteBase()}${hashFor(state)}`, document.title, shareView));
  const moreToggle = document.getElementById('more-toggle');
  moreToggle.addEventListener('click', () => {
    const open = moreToggle.getAttribute('aria-expanded') !== 'true';
    moreToggle.setAttribute('aria-expanded', String(open));
    document.querySelector('.filters').classList.toggle('open', open);
  });

  // `from` is the control the reader used, when they used one (a search or the order
  // toggle passes none). A change made from a control keeps the reader's place: the card
  // they were on stays where it was on screen, and the match count marks the change.
  function setFilter(patch, toView, from) {
    const keep = from && !toView ? anchorFor(from) : null;
    const had = !!from && from === document.activeElement;
    pulse = !!from || !!toView;
    Object.assign(state, patch);
    if (toView) state.view = toView;
    setHash(hashFor(state));
    render(keep);
    if (keep) holdPlace(keep);
    else if (toView) {
      // Following a pattern into another view lands on the brief that says what is being followed.
      const brief = view.querySelector('.pbrief');
      bring(brief, { ring: brief?.querySelector('h3'), glide: false });
    }
    if (had) settle(from);
  }
  function clearFilters(ev) {
    const from = ev?.currentTarget;
    const keep = anchorFor(from);
    const had = !!from && from === document.activeElement;
    pulse = true;
    Object.assign(state, { org: 'all', pattern: '', person: '', q: '', fp: '', page: '' });
    search.value = '';
    setHash(hashFor(state));
    render(keep);
    if (keep) holdPlace(keep);
    if (had) settle(from);
  }
  // When the render replaced or hid the control the reader used, keyboard focus goes to
  // its stand-in, so the next Tab goes on from here rather than from the top of the page.
  function settle(from) {
    if (from.isConnected && from.offsetParent) return; // still there
    const f = document.activeElement;
    if (f && f !== document.body && f !== from) return; // already placed, on the kept card or a brief
    const p = from.dataset.p; // a pattern-strip tag, or "Stop following": that pattern's tag in the strip
    const fp = from.dataset.fp; // a Fine print filter: the same filter, redrawn
    focusAt(from === clearButton ? orgSeg.querySelector('[aria-pressed="true"]')
      : fp != null ? [...view.querySelectorAll('.fstrip .chip')].find((c) => c.dataset.fp === fp)
        : from.matches('.fp-page, .fp-all') ? view.querySelector('.fp-page')
          : p && ([...view.querySelectorAll('.pstrip .chip')].find((c) => c.dataset.p === p) || view.querySelector('.view-head h2')));
  }
  function go(v) {
    state.view = v;
    setHash(hashFor(state));
    render();
    window.scrollTo({ top: Math.min(window.scrollY, viewTop()) });
  }

  // ── keeping the reader's place across a filter change ────────────────────
  // The card a reader is on: the one holding the control they used, or else the first
  // card showing below the sticky bar, once they have scrolled down into the list.
  let pendingKeep = null;
  const barBottom = () => Math.max(0, controls.getBoundingClientRect().bottom);
  // How much of the page the bar covers once it sticks: none on phones, where it scrolls away.
  const barHeight = () => (getComputedStyle(controls).position === 'sticky' ? controls.getBoundingClientRect().height : 0);
  function anchorFor(from) {
    const cards = view.querySelectorAll('[data-key]');
    if (!cards.length) return null;
    const bar = barBottom();
    let card = from?.closest?.('[data-key]');
    const inCard = !!card;
    if (!card) {
      if (cards[0].getBoundingClientRect().top >= bar) return null; // still above the list: nothing to keep
      card = [...cards].find((c) => c.getBoundingClientRect().bottom > bar + 24);
      if (!card) return null;
    }
    return {
      key: card.dataset.key,
      t: +card.dataset.t,
      group: card.closest('[data-group]')?.dataset.group, // a Watchlist section
      top: card.getBoundingClientRect().top,
      height: barHeight(),
      open: [...card.querySelectorAll('details')].map((d) => d.open),
      chip: inCard && from.dataset.p,
      inCard,
    };
  }
  // Receipts render in pages; render far enough to include the kept card, or the one nearest it in time.
  function keptIndex(list) {
    if (!pendingKeep) return -1;
    const i = list.findIndex((r) => receiptKey(r) === pendingKeep.key);
    if (i >= 0) return i;
    let best = -1;
    let gap = Infinity;
    list.forEach((r, j) => { const g = Math.abs(receiptTime(r) - pendingKeep.t); if (g < gap) { gap = g; best = j; } });
    return best;
  }
  function holdPlace(keep) {
    let cards = [...view.querySelectorAll('[data-key]')];
    let card = cards.find((c) => c.dataset.key === keep.key);
    const moved = !card;
    if (moved) {
      // The filter removed it: the card nearest to it in its list's order stands in, from the same section.
      if (keep.group) cards = cards.filter((c) => c.closest('[data-group]')?.dataset.group === keep.group);
      if (!cards.length) return;
      card = cards.reduce((a, c) => (Math.abs(+c.dataset.t - keep.t) < Math.abs(+a.dataset.t - keep.t) ? c : a));
    } else {
      // A passage the reader had opened in it stays open, so nothing in the card moves.
      card.querySelectorAll('details').forEach((d, i) => { if (keep.open[i]) d.open = true; });
    }
    // Hold it where it was on the screen, so a tag the reader clicked stays under the pointer.
    // Read from the bar, the list keeps its distance below the bar, which a filter can make
    // taller. (Its height, since where it ends on screen moves with the page until it sticks.)
    const grew = keep.inCard ? 0 : barHeight() - keep.height;
    window.scrollBy(0, card.getBoundingClientRect().top - (keep.top + grew));
    // A stand-in shows from its start, and the tag clear of the bar.
    const tag = keep.inCard && [...card.querySelectorAll('.chip')].find((c) => c.dataset.p === keep.chip);
    const show = moved ? card : tag;
    const under = show ? barBottom() + 8 - show.getBoundingClientRect().top : 0;
    if (under > 0) window.scrollBy(0, -under);
    if (keep.inCard) focusAt(tag || card.querySelector('.side-title, .t'));
    if (keep.inCard || moved) mark(card);
  }

  function syncControls() {
    for (const b of tabs.children) b.setAttribute('aria-selected', String(b.id === `tab-${state.view}`));
    view.setAttribute('aria-labelledby', `tab-${state.view}`);
    [...orgSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['all', 'openai', 'anthropic'][i] === state.org)));
    patternSel.value = state.pattern;
    personSel.value = state.person;
    if (document.activeElement !== search) search.value = state.q;
    document.getElementById('clear').hidden = !(anyFilter() || (state.view === 'fineprint' && (state.fp || state.page)));
    const extra = [state.pattern, state.person].filter(Boolean).length;
    moreToggle.textContent = extra ? `More filters (${extra} on)` : 'More filters';
    const shown = D.entries.filter(matches).length;
    // The number is marked when a filter changes it, and reads in ink while any filter is on.
    // It is rewritten only when it changes, so a screen reader isn't told the same count again.
    const words = anyFilter() ? ` of ${D.entries.length} entries match` : ' entries';
    if (countEl.textContent !== `${shown}${words}`) {
      countEl.replaceChildren(h('span', { class: `n${pulse && lastShown != null && shown !== lastShown && !calm.matches ? ' tick' : ''}` }, shown), words);
    }
    countEl.classList.toggle('on', !!anyFilter());
    lastShown = shown;
    pulse = false;
  }
  let lastShown = null;
  let pulse = false;

  // An edit receipt plays its edit once, the first time it comes into view: the
  // old wording is struck through, then the new wording is marked. Both stay
  // readable throughout, and without motion they simply start in that end state.
  const playedEdits = new Set();
  const editWatch = 'IntersectionObserver' in window && new IntersectionObserver((seen) => {
    for (const s of seen) {
      if (!s.isIntersecting) continue;
      s.target.classList.add('rev-play');
      playedEdits.add(s.target.dataset.edit);
      editWatch.unobserve(s.target);
    }
  }, { threshold: 0.4 });
  function armEdits() {
    if (!editWatch) return;
    editWatch.disconnect();
    if (calm.matches) return;
    for (const el of view.querySelectorAll('[data-edit]')) {
      if (playedEdits.has(el.dataset.edit)) continue;
      el.classList.add('rev-armed');
      editWatch.observe(el);
    }
  }

  function render(keep = null) {
    syncControls();
    const renderers = { receipts: renderReceipts, timeline: renderTimeline, patterns: renderPatterns, watchlist: renderWatchlist, commitments: renderCommitments, fineprint: renderFineprint, method: renderMethod };
    hideTip();
    pendingKeep = keep;
    const y = window.scrollY;
    view.replaceChildren(...[renderers[state.view]()].flat().filter(Boolean));
    // Taking out a control that has focus makes the browser lay the page out with the view
    // empty for a moment, which scrolls it up when that empty page is short. Put it back.
    if (window.scrollY !== y) window.scrollTo({ top: y });
    pendingKeep = null;
    armEdits();
    queueSnap();
  }

  // ── masthead numbers ───────────────────────────────────────────────────
  // Each figure is split by company, since that is the first thing a reader asks,
  // and each one opens the view that holds those entries.
  const said = D.entries.filter((e) => e.type === 'said');
  const byOrg = (pred) => ['openai', 'anthropic'].map((o) => [o, said.filter((e) => e.org === o && pred(e)).length]);
  // A figure opens its view and lands on the part of it the figure counts.
  const tile = (pred, label, tone, target, spot) => {
    const split = byOrg(pred);
    const n = split.reduce((a, [, k]) => a + k, 0);
    return h('a', { class: 'stat', href: `#${target}`, onclick: (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return; // opening it in a new tab or window
      ev.preventDefault();
      applyHash(target);
      // Like the link it is, it adds a step to the history, so Back returns to where the reader was.
      if (location.hash !== `#${target}`) { try { history.pushState(null, '', `#${target}`); } catch { /* ignore */ } }
      render();
      const to = (spot && document.getElementById(spot)) || view.querySelector('.view-head');
      bring(to, { ring: to.matches('h2, h3') ? to : to.querySelector('h2'), glide: false });
    } },
      h('span', { class: `stat-n${tone ? ` ${tone}` : ''}` }, n),
      h('span', { class: 'label' }, label),
      h('span', { class: 'stat-split' }, split.map(([o, k]) => h('span', { class: `org-n ${o}` }, glyph(o), h('span', { class: 'sr' }, `${orgName(o)}: `), k))));
  };
  document.getElementById('stats').replaceChildren(
    tile(() => true, 'Statements on record', '', 'timeline'),
    tile((e) => FAILED.has(e.status), 'Didn’t hold up', 'is-did', 'receipts'),
    tile((e) => e.status === 'kept', 'Kept', 'is-held', 'watchlist', 'w-kept'),
    tile((e) => e.status === 'open', 'Still standing, being watched', 'is-open', 'watchlist'),
  );
  const s = D.stats;
  const next = D.entries.filter((e) => e.status === 'open' && dueOf(e) && !dueOf(e).passed).sort((a, b) => dueOf(a).end - dueOf(b).end)[0];
  document.getElementById('stats-note').replaceChildren(
    next && h('span', null, 'Next deadline: ', h('a', { class: 'linkish', href: `#e-${next.id}`, onclick: (ev) => { ev.preventDefault(); openEntry(next.id); } }, next.title),
      `, ${dueOf(next).when} (in ${fmtSpan(Math.round((dueOf(next).end - NOW) / DAY))}).`),
    s.median_gap_days != null && h('span', null, `Median time from a statement to the action that contradicted it: ${fmtSpan(s.median_gap_days)}.`),
    // OpenAI has the larger share of the record; say why, so the gap isn't read as a thumb on the scale.
    h('span', null, `OpenAI has ${D.entries.filter((e) => e.org === 'openai').length} entries to Anthropic’s ${D.entries.filter((e) => e.org === 'anthropic').length}: it is older and larger, has made more public commitments, and more of its conduct has been litigated and reported. `,
      h('a', { href: `${D.site.repo}/blob/HEAD/COVERAGE.md#the-two-companies-side-by-side`, target: '_blank', rel: 'noopener' }, 'How the record checks both companies the same way'), '.'),
    h('span', { class: 'updated' }, `Updated ${fmtDate(String(D.generated).slice(0, 10))} · ${D.entries.length} entries`));

  // ── routing: #receipts, #timeline, #patterns, #watchlist, #commitments, #method, #e-<id>, #p-<pattern>, #c-<document>
  function fromHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash.startsWith('e-') && byId.has(hash.slice(2))) {
      render();
      openEntry(hash.slice(2), { fromHash: true });
      return;
    }
    // One pattern, or one Commitments document: land on it, lifting a filter that would hide it.
    const one = hash.startsWith('p-') && patternById.has(hash.slice(2)) ? 'patterns'
      : hash.startsWith('c-') && (D.commitments || []).some((d) => `c-${d.id}` === hash) ? 'commitments' : null;
    if (one) {
      state.view = one;
      render();
      if (!document.getElementById(hash)) {
        Object.assign(state, { org: 'all', person: '', q: '' });
        search.value = '';
        render();
      }
      const card = document.getElementById(hash);
      bring(card, { ring: card?.querySelector('h3'), glide: false });
      return;
    }
    applyHash(hash);
    render();
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
