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
  const VIEWS = ['receipts', 'timeline', 'patterns', 'watchlist', 'method'];
  const DAY = 86400000;
  const NOW = Date.now();

  const state = { view: 'receipts', org: 'all', pattern: '', person: '', q: '' };

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
  function haystack(e) {
    const sources = [...(e.sources || []), ...(e.updates || []).flatMap((u) => u.sources || [])];
    return [e.title, e.quote, e.summary, e.note, e.venue, e.response, e.breaks_if, ...(e.who || []).map(actorName),
      ...(e.updates || []).map((u) => u.text), ...sources.flatMap((s) => [s.title, s.publisher])]
      .filter(Boolean).join(' ').toLowerCase();
  }
  const hayCache = new Map();
  function matches(e) {
    if (state.org !== 'all' && e.org !== state.org) return false;
    if (state.pattern && !e.patterns.includes(state.pattern)) return false;
    if (state.person && !e.who.includes(state.person)) return false;
    if (state.q) {
      if (!hayCache.has(e.id)) hayCache.set(e.id, haystack(e));
      if (!state.q.toLowerCase().split(/\s+/).every((w) => hayCache.get(e.id).includes(w))) return false;
    }
    return true;
  }
  const anyFilter = () => state.org !== 'all' || state.pattern || state.person || state.q;

  // Receipts: said → did pairs, plus self-contained before/after revisions.
  const revisionReceipts = D.entries
    .filter((e) => e.type === 'did' && e.revision && !e.contradicts.length)
    .map((e) => ({ revision: e.id }));
  const allReceipts = [...D.receipts, ...revisionReceipts].sort(
    (a, b) => byId.get(b.did || b.revision).time - byId.get(a.did || a.revision).time,
  );
  function receiptMatches(r) {
    if (r.revision) return matches(byId.get(r.revision));
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
  const orgTag = (org) => h('span', { class: 'org' }, h('span', { class: `org-mark ${org}`, 'aria-hidden': 'true' }), orgName(org));
  const stamp = (type) => h('span', { class: `stamp ${type}` }, type === 'said' ? 'Said' : 'Did');
  const statusPill = (s) => h('span', { class: `pill s-${s}`, title: STATUS_DEF[s] }, STATUS_LABEL[s] || s);
  const concretePill = (c) => c && h('span', { class: 'pill c', title: CONCRETE_DEF[c] }, c);
  /** Pattern tags. Clicking one follows that pattern (filters every view); clicking it again stops. */
  const patternChips = (ids, toView) => ids.map((p) => h('button', {
    class: 'chip',
    type: 'button',
    'aria-pressed': String(state.pattern === p),
    title: state.pattern === p ? 'Stop following this pattern' : `Follow this pattern: ${patternById.get(p)?.name}`,
    onclick: (ev) => { ev.stopPropagation(); setFilter({ pattern: state.pattern === p ? '' : p }, toView); },
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
        h('button', { class: 'clear label', type: 'button', onclick: () => setFilter({ pattern: '' }) }, 'Stop following')),
      h('h3', null, p.name),
      h('p', null, p.thesis),
      entries.length > 0 && h('p', { class: 'pbrief-meta' },
        h('span', null, `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ${yearSpan(entries)}`),
        h('span', { class: 'pbrief-orgs' }, orgs.map(([o, n]) => h('span', { class: 'org' }, h('span', { class: `org-mark ${o}`, 'aria-hidden': 'true' }), `${orgName(o)} ${n}`))),
        outcomeTally(entries)),
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
        class: 'chip', type: 'button', 'aria-pressed': String(state.pattern === p.id),
        onclick: () => setFilter({ pattern: state.pattern === p.id ? '' : p.id }),
      }, p.name, h('span', { class: 'n' }, n)))),
      !state.pattern && untagged > 0 && h('span', { class: 'pstrip-note' }, `${untagged} of ${pool.length} entries fit no pattern yet and appear only in the full timeline.`));
  }
  const snapDate = (dir) => (/(\d{4}-\d{2}-\d{2})/.exec(dir || '') || [])[1];
  const quoteBlock = (text, e) => text && h('div', { class: 'quote-wrap' },
    h('blockquote', { class: 'quote' }, `“${text.trim()}”`),
    e?.quote_check?.status === 'matched' && h('span', { class: 'verified', title: `Found word for word in ${e.quote_check.snapshot}` },
      `✓ Matched to source snapshot, ${fmtDate(snapDate(e.quote_check.snapshot))}`));
  const titleButton = (e) => h('button', { class: 'side-title', type: 'button', onclick: () => openEntry(e.id) }, e.title);

  // Update the address-bar hash without scrolling; some embedded frames refuse this, which is fine.
  function setHash(hash) {
    try { history.replaceState(null, '', hash); } catch { /* ignore */ }
  }

  // ── views ──────────────────────────────────────────────────────────────
  function viewHead(title, text) {
    return h('div', { class: 'view-head' }, h('h2', null, title), text && h('p', null, text));
  }
  function empty() {
    return h('p', { class: 'empty' }, 'Nothing matches these filters. ',
      h('button', { class: 'clear', type: 'button', onclick: clearFilters }, 'Clear filters'));
  }

  function renderReceipts() {
    const list = allReceipts.filter(receiptMatches);
    const frag = [viewHead('Receipts',
      'Each receipt pairs a public statement with a later action that contradicts it, or a policy text with its quiet rewrite. Between them is the time from the words to the deed.'),
    patternBrief(D.entries.filter(matches))];
    if (!list.length) return [...frag, empty()];
    frag.push(h('div', { class: 'receipts' }, list.map((r) => (r.revision ? revisionCard(byId.get(r.revision)) : receiptCard(r)))));
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
        h('div', { class: 'side-head' }, statusPill(s.status), concretePill(s.concreteness)),
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
        h('button', { class: 'btn', type: 'button', onclick: () => copyReceipt(s, d) }, 'Copy receipt'),
      ),
    );
  }

  function revisionCard(e) {
    return h('article', { class: 'receipt', id: `r-${e.id}` },
      h('div', { class: 'side said' },
        h('div', { class: 'side-head' }, h('span', { class: 'stamp said' }, 'Before'), orgTag(e.org)),
        h('div', { class: 'diff' }, h('div', { class: 'minus' }, h('b', null, '−'), e.revision.before)),
      ),
      h('div', { class: 'gap' }, h('span', { class: 'label' }, 'Edited'), h('span', { class: 'gap-n' }, fmtDate(e.date).split(',')[0].split(' ')[0]), h('span', { class: 'label' }, String(e.date).slice(0, 4)), arrow()),
      h('div', { class: 'side did' },
        h('div', { class: 'side-head' }, h('span', { class: 'stamp did' }, 'After'), h('span', { class: 'label' }, fmtDate(e.date))),
        titleButton(e),
        h('div', { class: 'diff' }, h('div', { class: 'plus' }, h('b', null, '+'), e.revision.after)),
      ),
      h('div', { class: 'receipt-foot' },
        patternChips(e.patterns),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn', type: 'button', onclick: () => copyReceipt(null, e) }, 'Copy receipt'),
      ),
    );
  }

  function clip(text, n) {
    const t = String(text).trim();
    return t.length > n ? `${t.slice(0, t.lastIndexOf(' ', n))}…` : t;
  }

  function renderTimeline() {
    const list = D.entries.filter(matches);
    const frag = [viewHead('Timeline', 'Everything in the record, in date order. A hollow mark is a statement; a solid mark is an action. The tags on each entry name the patterns it belongs to; pick one to follow it through the years.'),
      patternStrip(), patternBrief(list)];
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
          h('article', { class: `tl-card ${e.type}`, style: row },
            h('span', { class: 'tl-meta' }, stamp(e.type), h('span', { class: 'label' }, fmtDate(e.date)), orgTag(e.org)),
            h('button', { class: 't', type: 'button', onclick: () => openEntry(e.id) }, e.title),
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
    const years = [];
    const minY = Math.min(...D.entries.map((e) => +String(e.date).slice(0, 4)));
    const maxY = Math.max(new Date(NOW).getUTCFullYear(), ...D.entries.map((e) => +String(e.date).slice(0, 4)));
    for (let y = minY; y <= maxY; y++) years.push(y);
    const rows = D.patterns
      .map((p) => ({ p, hits: pool.filter((e) => e.patterns.includes(p.id)) }))
      .filter((r) => r.hits.length)
      .sort((a, b) => b.hits.length - a.hits.length || a.p.name.localeCompare(b.p.name));

    const frag = [viewHead('Patterns',
      'The same moves, repeated. Each row is a pattern and each mark is an entry, placed in the year it happened. A row that keeps filling in is a pattern you can plan around.')];
    if (!rows.length) return [...frag, empty()];

    const grid = h('div', { class: 'rgrid', role: 'table', 'aria-label': 'Pattern recurrence by year', style: `grid-template-columns: minmax(200px, 1.6fr) repeat(${years.length}, minmax(34px, 1fr))` },
      h('span', { role: 'columnheader', class: 'yh' }),
      years.map((y) => h('span', { role: 'columnheader', class: 'yh' }, `’${String(y).slice(2)}`)),
      rows.map(({ p, hits }) => [
        h('button', { class: 'rname', type: 'button', role: 'rowheader', title: `Show ${p.name} in the timeline`, onclick: () => setFilter({ pattern: p.id }, 'timeline') },
          h('span', null, p.name), h('span', { class: 'n' }, hits.length)),
        years.map((y) => h('span', { class: 'cell', role: 'cell' },
          hits.filter((e) => +String(e.date).slice(0, 4) === y).map((e) => h('button', {
            class: `dot ${e.org} ${e.type}`,
            type: 'button',
            title: `${fmtDate(e.date)} · ${orgName(e.org)} · ${e.type.toUpperCase()}: ${e.title}`,
            'aria-label': `${fmtDate(e.date)}, ${orgName(e.org)}: ${e.title}`,
            onclick: () => openEntry(e.id),
          })))),
      ]),
    );
    frag.push(
      h('div', { class: 'grid-wrap' }, grid,
        h('div', { class: 'legend' },
          h('span', null, h('span', { class: 'dot openai said', 'aria-hidden': 'true' }), 'OpenAI said'),
          h('span', null, h('span', { class: 'dot openai did', 'aria-hidden': 'true' }), 'OpenAI did'),
          h('span', null, h('span', { class: 'dot anthropic said', 'aria-hidden': 'true' }), 'Anthropic said'),
          h('span', null, h('span', { class: 'dot anthropic did', 'aria-hidden': 'true' }), 'Anthropic did'),
        )),
    );
    frag.push(h('div', { class: 'patterns-list' }, rows.map(({ p, hits }) => h('section', { class: 'pcard', id: `p-${p.id}` },
      h('span', { class: 'label' }, `${hits.length} entr${hits.length === 1 ? 'y' : 'ies'} · ${[...new Set(hits.map((e) => orgName(e.org)))].join(' + ')} · ${yearSpan(hits)}`),
      h('h3', null, p.name),
      h('p', null, p.thesis),
      h('p', { class: 'pbrief-meta' }, outcomeTally(hits)),
      p.tells?.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Tells'), h('ul', null, p.tells.map((t) => h('li', null, t)))),
      p.watch_for && h('div', { class: 'forecast' }, h('span', { class: 'label' }, 'If the pattern holds (analysis)'), h('p', null, p.watch_for)),
      h('div', { class: 'hits' }, hits.map((e) => h('button', { class: 'hit', type: 'button', onclick: () => openEntry(e.id) },
        h('span', { class: 'mono' }, String(e.date).slice(0, 7)), h('span', { class: `dot sm ${e.org} ${e.type}`, 'aria-hidden': 'true' }),
        h('span', { class: 'ht' }, e.title, e.status && h('span', { class: `mark s-${e.status}`, title: STATUS_LABEL[e.status] }, h('span', { class: 'sr' }, ` (${STATUS_LABEL[e.status]})`)))))),
      h('button', { class: 'btn', type: 'button', onclick: () => setFilter({ pattern: p.id }, 'timeline') }, `Follow ${p.name} on the timeline`),
    ))));
    return frag;
  }

  function renderWatchlist() {
    const said = D.entries.filter((e) => e.type === 'said' && matches(e));
    const open = said.filter((e) => e.status === 'open').sort((a, b) => b.time - a.time);
    const kept = said.filter((e) => e.status === 'kept').sort((a, b) => b.time - a.time);
    const frag = [viewHead('Watchlist',
      'Promises still in force. Each says what would count as breaking it, so the test is written down before anyone needs it.'),
    patternBrief(D.entries.filter(matches))];
    if (!open.length && !kept.length) return [...frag, empty()];
    const card = (e) => {
      const days = Math.max(0, Math.round((NOW - e.time) / DAY));
      return h('article', { class: `wcard ${e.status}` },
        h('div', { class: 'main' },
          h('div', { class: 'side-head' }, orgTag(e.org), statusPill(e.status), concretePill(e.concreteness)),
          titleButton(e),
          quoteBlock(e.quote, e),
          !e.quote && e.summary && h('p', null, clip(e.summary, 260)),
          e.breaks_if && h('div', { class: 'breaks' }, h('span', { class: 'label' }, 'Counts as broken if'), h('p', null, e.breaks_if)),
          e.patterns.length > 0 && h('div', { class: 'side-head' }, patternChips(e.patterns)),
        ),
        h('div', { class: 'age' },
          h('span', { class: 'label' }, e.status === 'kept' ? 'Held for' : 'Standing for'),
          h('span', { class: 'gap-n' }, span(days).n),
          h('span', { class: 'label' }, `${span(days).unit} · since ${fmtDate(e.date)}`),
        ),
      );
    };
    if (open.length) frag.push(h('div', { class: 'watch' }, open.map(card)));
    if (kept.length) frag.push(h('h3', { class: 'section-sub' }, 'Held under pressure'), h('div', { class: 'watch' }, kept.map(card)));
    return frag;
  }

  function renderMethod() {
    const repo = D.site.repo;
    return [
      viewHead('Method', 'How this record is kept, and what counts as evidence.'),
      h('div', { class: 'prose' },
        h('p', null, 'Every entry is either something a company or one of its leaders ', h('b', null, 'said'), ' (a principle, a commitment, a claim, a denial) or something they ', h('b', null, 'did'), '. A "did" entry that contradicts an earlier "said" entry links back to it, and that link is a receipt.'),
        h('h3', null, 'Standards'),
        h('ul', null,
          h('li', null, 'Every entry cites at least one source. Primary sources (the company’s own post, the original social post, testimony) are preferred; reporting is labeled as reporting.'),
          h('li', null, 'Quotes are verbatim. A paraphrase never goes in a quote field.'),
          h('li', null, 'Each entry records the company’s or person’s own response where one exists (“Their side”).'),
          h('li', null, 'Commentary is labeled as commentary and kept separate from the facts.'),
          h('li', null, 'Snapshots and archive links are taken at capture time, so a deleted post or an edited page still has a record.'),
          h('li', null, 'Kept promises are recorded too. A record that only counts failures is easier to dismiss.'),
        ),
        h('h3', null, 'Where entries come from'),
        h('p', null, 'Company announcements, filings, testimony and reporting, plus the public posts of the companies and their people. For posts on Twitter (now X), every archived post of 77 accounts was pulled from the Wayback Machine, including posts later deleted. As of September 2026, 18,627 of them (each account’s posts on these topics, plus every possibly deleted post) were read and given a decision: change the record, follow up, context for an existing entry, or no action.'),
        h('p', null, 'Limits: posts nobody archived can’t be found this way; for Elon Musk only the latest year was read; and for nine accounts with mostly off-topic posts, posts that didn’t mention the labs or safety were read as one-line excerpts. The decisions, per-account counts and what became of each follow-up are in ', h('code', null, 'inbox/sweep/TRIAGE.md'), ' in the repository.'),
        h('p', null, 'Beyond Twitter, a September 2026 review read the companies’ system cards, risk reports and safety frameworks against each other, checked policy versions, court records, testimony and investigative reporting, and looked for each company’s counterpart to the other’s entries. What it covered, the two companies side by side, and what may still be missing are in ', h('code', null, 'COVERAGE.md'), ' in the repository.'),
        h('h3', null, 'Who is in scope'),
        h('p', null, 'Organizations, and people speaking in a public or official role: executives, founders, board members, and staff who speak publicly about the company’s mission, safety or policy. No private individuals, private accounts, family members or personal lives.'),
        h('h3', null, 'Status of a statement'),
        h('div', { class: 'defs' }, Object.keys(STATUS_DEF).flatMap((k) => [statusPill(k), h('span', null, STATUS_DEF[k])])),
        h('h3', null, 'Patterns'),
        h('p', null, 'Patterns are this record’s analysis, not anyone’s words: a pattern is a move that recurs across the years or across both companies. Each entry is tagged with every pattern it shows, and some entries fit none. A promise that held keeps its tag when it was a test of the pattern, so following a pattern shows where it held as well as where it didn’t. Pick a pattern on the timeline, or from any entry, to follow it through every view.'),
        h('h3', null, 'How concrete was it?'),
        h('p', null, 'Vague promises can’t be broken, which is often the point. Each statement is graded on how testable it was when made.'),
        h('div', { class: 'defs' }, Object.keys(CONCRETE_DEF).flatMap((k) => [concretePill(k), h('span', null, CONCRETE_DEF[k])])),
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
        s.snapshot && (D.site.repo
          ? h('a', { href: `${D.site.repo}/tree/HEAD/${s.snapshot}`, target: '_blank', rel: 'noopener' }, `snapshot ${snapDate(s.snapshot) || ''}`)
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
        stamp(e.type), h('span', { class: 'label' }, fmtDate(e.date)), orgTag(e.org),
        e.status && statusPill(e.status), concretePill(e.concreteness),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn', type: 'button', onclick: () => copyReceipt(pairs[0]?.[0] || (e.type === 'said' ? e : null), pairs[0]?.[1] || (e.type === 'did' ? e : null)) }, 'Copy'),
        h('button', { class: 'btn', type: 'button', onclick: () => dialog.close(), 'aria-label': 'Close' }, 'Close'),
      ),
      h('div', { class: 'd-body' },
        h('h2', { id: 'entry-title' }, e.title),
        (e.who.length > 0 || e.venue) && h('p', { class: 'label' }, [e.who.map(actorName).join(', '), e.venue].filter(Boolean).join(' · ')),
        e.quote && h('div', { class: `side ${e.type}`, style: 'padding:0;background:none' }, quoteBlock(e.quote, e)),
        e.summary && h('p', null, e.summary),
        e.revision && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'What changed'),
          h('div', { class: 'diff' }, h('div', { class: 'minus' }, h('b', null, '−'), e.revision.before), h('div', { class: 'plus' }, h('b', null, '+'), e.revision.after))),
        e.breaks_if && h('div', { class: 'breaks' }, h('span', { class: 'label' }, 'Counts as broken if'), h('p', null, e.breaks_if)),
        (e.contradicts.length + e.contradicted_by.length + e.related.length > 0) && h('div', { class: 'd-section links' },
          h('span', { class: 'label' }, 'Connected entries'),
          linkList(e.contradicts, 'contradicts'), linkList(e.contradicted_by, 'contradicted by'), linkList(e.related, 'related')),
        e.updates?.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Since then'),
          h('ul', { class: 'updates' }, e.updates.map((u) => h('li', null, h('span', { class: 'mono' }, fmtDate(u.date)),
            h('div', null, h('p', null, u.text), u.sources?.length > 0 && sourceList(u.sources)))))),
        e.response && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Their side'), h('p', null, e.response)),
        e.note && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Commentary'), h('p', { class: 'note' }, e.note)),
        e.patterns.length > 0 && h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Patterns (analysis)'),
          e.patterns.map((id) => patternById.get(id)).filter(Boolean).map((p) => h('div', { class: 'd-pattern' },
            h('p', null, h('b', null, p.name), ' ', h('span', { class: 'muted' }, p.thesis)),
            h('div', { class: 'side-head' },
              h('button', { class: 'chip', type: 'button', onclick: () => { dialog.close(); setFilter({ pattern: p.id }, 'timeline'); setHash('#timeline'); } }, 'Follow on the timeline'),
              h('button', { class: 'chip', type: 'button', onclick: () => { dialog.close(); location.hash = `p-${p.id}`; } }, 'About this pattern'))))),
        h('div', { class: 'd-section' }, h('span', { class: 'label' }, 'Sources'), sourceList(e.sources)),
        D.site.repo && e.file && h('p', { class: 'label' }, h('a', { href: `${D.site.repo}/blob/HEAD/${e.file}`, target: '_blank', rel: 'noopener' }, 'View or correct this entry')),
      ),
    );
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    if (!fromHash) setHash(`#e-${id}`);
  }
  dialog.addEventListener('close', () => {
    if (location.hash.startsWith('#e-')) setHash(`#${state.view}`);
  });
  dialog.addEventListener('click', (ev) => { if (ev.target === dialog) dialog.close(); });

  // ── copy a receipt as plain text, for posting ─────────────────────────
  function permalink(id) {
    const base = D.site.url || location.href.split('#')[0];
    return `${base}#e-${id}`;
  }
  function receiptText(s, d) {
    const lines = [];
    const src = (e) => e.sources?.[0]?.archive || e.sources?.[0]?.url;
    if (s) {
      lines.push(`SAID — ${orgName(s.org)}, ${fmtDate(s.date)}${s.who.length ? ` (${s.who.map(actorName).filter((n) => n !== orgName(s.org)).join(', ') || orgName(s.org)})` : ''}:`);
      lines.push(s.quote ? `“${s.quote.trim()}”` : s.title);
      if (src(s)) lines.push(src(s));
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
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.append(t); }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function copyReceipt(s, d) {
    const text = receiptText(s, d);
    const fallback = () => {
      const ta = h('textarea', { class: 'copy-fallback', readonly: true, 'aria-label': 'Receipt text' });
      ta.value = text;
      const host = dialog.open ? dialog.querySelector('.d-body') : view;
      host.prepend(ta);
      ta.focus();
      ta.select();
      toast('Select the text and copy it');
    };
    try {
      navigator.clipboard.writeText(text).then(() => toast('Receipt copied'), fallback);
    } catch {
      fallback();
    }
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
  };
  tabs.replaceChildren(...VIEWS.map((v) => h('button', {
    class: 'tab', type: 'button', role: 'tab', id: `tab-${v}`, 'aria-selected': 'false', 'aria-controls': 'view',
    onclick: () => go(v),
  }, v[0].toUpperCase() + v.slice(1), counts[v] != null && h('span', { class: 'count' }, counts[v]))));

  orgSeg.replaceChildren(...['all', 'openai', 'anthropic'].map((o) => h('button', {
    type: 'button', 'aria-pressed': String(state.org === o), onclick: () => setFilter({ org: o }),
  }, o === 'all' ? 'Both' : orgName(o))));
  patternSel.replaceChildren(h('option', { value: '' }, 'All patterns'), ...D.patterns.map((p) => h('option', { value: p.id }, p.name)));
  personSel.replaceChildren(h('option', { value: '' }, 'Everyone'), ...personActors.map((a) => h('option', { value: a.id }, `${a.name}${a.org ? ` (${orgName(a.org)})` : ''}`)));
  patternSel.addEventListener('change', () => setFilter({ pattern: patternSel.value }));
  personSel.addEventListener('change', () => setFilter({ person: personSel.value }));
  let qTimer;
  search.addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(() => setFilter({ q: search.value.trim() }), 150); });
  document.getElementById('clear').addEventListener('click', clearFilters);

  function setFilter(patch, toView) {
    Object.assign(state, patch);
    if (toView) state.view = toView;
    render();
  }
  function clearFilters() {
    Object.assign(state, { org: 'all', pattern: '', person: '', q: '' });
    search.value = '';
    render();
  }
  function go(v) {
    state.view = v;
    setHash(`#${v}`);
    render();
    window.scrollTo({ top: Math.min(window.scrollY, document.querySelector('.controls').offsetTop) });
  }

  function syncControls() {
    for (const b of tabs.children) b.setAttribute('aria-selected', String(b.id === `tab-${state.view}`));
    view.setAttribute('aria-labelledby', `tab-${state.view}`);
    [...orgSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(['all', 'openai', 'anthropic'][i] === state.org)));
    patternSel.value = state.pattern;
    personSel.value = state.person;
    if (document.activeElement !== search) search.value = state.q;
    document.getElementById('clear').hidden = !anyFilter();
    const shown = D.entries.filter(matches).length;
    countEl.textContent = anyFilter() ? `${shown} of ${D.entries.length} entries match` : `${D.entries.length} entries`;
  }

  function render() {
    syncControls();
    const renderers = { receipts: renderReceipts, timeline: renderTimeline, patterns: renderPatterns, watchlist: renderWatchlist, method: renderMethod };
    view.replaceChildren(...[renderers[state.view]()].flat().filter(Boolean));
  }

  // ── masthead numbers ───────────────────────────────────────────────────
  const s = D.stats;
  document.getElementById('stats').replaceChildren(
    h('div', { class: 'stat' }, h('span', { class: 'stat-n' }, s.said), h('span', { class: 'label' }, 'Statements on record')),
    h('div', { class: 'stat' }, h('span', { class: 'stat-n is-did' }, s.broken), h('span', { class: 'label' }, 'Didn’t hold up')),
    h('div', { class: 'stat' }, h('span', { class: 'stat-n is-open' }, s.open), h('span', { class: 'label' }, 'Still standing, being watched')),
    s.median_gap_days != null && h('div', { class: 'stat' }, h('span', { class: 'stat-n' }, fmtSpan(s.median_gap_days)), h('span', { class: 'label' }, 'Median time, word to deed')),
  );

  // ── routing: #receipts, #timeline, #patterns, #watchlist, #method, #e-<id>, #p-<pattern>
  function fromHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash.startsWith('e-') && byId.has(hash.slice(2))) {
      render();
      openEntry(hash.slice(2), { fromHash: true });
      return;
    }
    if (hash.startsWith('p-') && patternById.has(hash.slice(2))) {
      state.view = 'patterns';
      render();
      document.getElementById(hash)?.scrollIntoView({ block: 'start' });
      return;
    }
    if (VIEWS.includes(hash)) state.view = hash;
    render();
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
