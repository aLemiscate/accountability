// The record as plain HTML, for readers and machines that don't run the site's
// JavaScript: search engines, link scrapers, the Wayback Machine, screen readers
// on locked-down machines, and anyone printing or saving the page.
//
// The build writes site/record.html (every entry on one page) and
// site/sitemap.xml. (A robots.txt would be ignored: crawlers read it only at the
// root of the domain, and this site lives under /accountability/.) scripts/cards.mjs puts the same entry text in each
// e/<id>/ page.

const ORG = { openai: 'OpenAI', anthropic: 'Anthropic' };
const STATUS = { open: 'Standing', kept: 'Kept', broken: 'Broken', reversed: 'Reversed', eroded: 'Eroded', contradicted: 'Contradicted' };
const CONCRETE = { measurable: 'Measurable commitment', conditional: 'Conditional commitment', directional: 'Directional statement', aspirational: 'Aspirational statement' };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short' });
// The footer line saying how the record may be reused (data/site.yaml `license`).
const licenseSpan = (D) => (D.site.license ? `<span>The record is licensed <a href="${esc(D.site.license.url)}">${esc(D.site.license.name)}</a>: reuse it with credit to ${esc(D.site.title)}. Quoted words and archived pages belong to their authors.</span>` : '');
export function fmtDate(s) {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(String(s || ''));
  if (!m) return String(s || '');
  const t = Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1);
  return m[3] ? fmtDay.format(t) : m[2] ? fmtMonth.format(t) : m[1];
}

/**
 * One entry as an <article>: what was said or done, by whom and when, its
 * status, what became of it, the company's response, commentary (labeled),
 * later updates and every source. `home` is the path back to the site, so the
 * entry can link to its own view there and to the entries it is paired with.
 */
export function entryArticle(e, D, { home = './', level = 3 } = {}) {
  const byId = new Map(D.entries.map((x) => [x.id, x]));
  const actor = new Map(D.actors.map((a) => [a.id, a.name]));
  const h = `h${level}`;
  const link = (id) => (byId.has(id) ? `<a href="${esc(home)}#e-${esc(id)}">${esc(byId.get(id).title)}</a>` : esc(id));
  const people = (e.who || []).filter((id) => id !== e.org).map((id) => actor.get(id)).filter(Boolean);
  const meta = [
    e.type === 'said' ? 'Said' : 'Did',
    `<time datetime="${esc(e.date)}">${esc(fmtDate(e.date))}</time>`,
    ORG[e.org] || e.org,
    people.length && esc(people.join(', ')),
    e.status && STATUS[e.status] && `Status: ${STATUS[e.status]}`,
    e.concreteness && CONCRETE[e.concreteness],
  ].filter(Boolean).join(' · ');
  const part = (label, body) => (body ? `<div class="r-part"><p class="label">${label}</p>${body}</div>` : '');
  const p = (t) => (t ? `<p>${esc(t)}</p>` : '');
  const pairs = [
    ...(e.contradicts || []).map((id) => `<li>Contradicts: ${link(id)}</li>`),
    ...(e.contradicted_by || []).map((id) => `<li>Contradicted by: ${link(id)}</li>`),
    ...(e.related || []).map((id) => `<li>Related: ${link(id)}</li>`),
  ];
  const sources = (e.sources || []).map((s) => `<li><a href="${esc(s.url)}">${esc(s.title || s.url)}</a>${[s.publisher, s.date && fmtDate(s.date), s.type].filter(Boolean).length ? ` <span class="r-meta">${esc([s.publisher, s.date && fmtDate(s.date), s.type].filter(Boolean).join(' · '))}</span>` : ''}${s.archive ? ` <a class="r-meta" href="${esc(s.archive)}">archived copy</a>` : ''}</li>`);
  return `<article class="r-entry" id="e-${esc(e.id)}">
<${h}><a href="${esc(home)}#e-${esc(e.id)}">${esc(e.title)}</a></${h}>
<p class="r-meta">${meta}</p>
${e.quote ? `<blockquote>“${esc(e.quote)}”</blockquote>` : ''}
${p(e.summary)}
${e.revision ? part('Before', p(e.revision.before)) + part('After', p(e.revision.after)) : ''}
${e.breaks_if ? part('Counts as broken if', p(e.breaks_if)) : ''}
${e.outcome ? part(`${e.outcome.time < e.time ? 'Already on record' : 'Outcome'}, ${esc(fmtDate(e.outcome.date))}`, p(e.outcome.text)) : ''}
${part('Their response', p(e.response))}
${part('Commentary', p(e.note))}
${e.updates?.length ? part('Updates', `<ul>${e.updates.map((u) => `<li><time datetime="${esc(u.date)}">${esc(fmtDate(u.date))}</time>: ${esc(u.text)}</li>`).join('')}</ul>`) : ''}
${pairs.length ? `<ul class="r-links">${pairs.join('')}</ul>` : ''}
${sources.length ? part('Sources', `<ul>${sources.join('')}</ul>`) : ''}
</article>`;
}

/** Every entry on one page, newest first, grouped by year. */
export function recordHtml(D) {
  const base = D.site.url || './';
  const entries = [...D.entries].sort((a, b) => b.time - a.time || a.id.localeCompare(b.id));
  const years = [...new Set(entries.map((e) => String(e.date).slice(0, 4)))];
  const said = D.entries.filter((e) => e.type === 'said');
  const count = (pred) => said.filter(pred).length;
  const failed = count((e) => ['broken', 'reversed', 'eroded', 'contradicted'].includes(e.status));
  const title = `${D.site.title}: the whole record`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(D.site.description)}">
<link rel="canonical" href="${esc(base)}record.html">
<link rel="alternate" type="application/atom+xml" title="Said / Did: new entries and updates" href="feed.xml">
<link rel="stylesheet" href="styles.css">
</head>
<body class="record">
<header class="masthead"><div class="wrap">
<p class="wordmark"><a href="./">${esc(D.site.title)}</a></p>
<h1 class="r-title">The whole record</h1>
<p class="lede">${esc(D.site.description)}</p>
<p class="r-meta">${D.entries.length} entries: ${said.length} statements and ${D.entries.length - said.length} actions. Of the statements, ${failed} didn't hold up, ${count((e) => e.status === 'kept')} were kept and ${count((e) => e.status === 'open')} are still standing. Updated ${esc(fmtDate(String(D.generated).slice(0, 10)))}. Newest first.</p>
<p>This is the plain version of the record, one page with every entry and its sources. <a href="./">The site</a> has the same entries with receipts, a timeline, patterns and filters. Changes to the companies' policy, terms and pricing pages are on <a href="fine-print.html">a page of their own</a>.</p>
<p>Claude, an AI model made by Anthropic, does most of the research and writing for this record. Anthropic is one of the two companies it covers, so every entry links to its sources, and both companies are held to the same rules. <a href="./#method">How the record is kept</a>.</p>
<nav class="r-years" aria-label="Years">${years.map((y) => `<a href="#y-${y}">${y}</a>`).join(' ')}</nav>
</div></header>
<main class="wrap">
${years.map((y) => `<section id="y-${y}"><h2 class="r-year">${y}</h2>
${entries.filter((e) => String(e.date).startsWith(y)).map((e) => entryArticle(e, D, { home: './' })).join('\n')}
</section>`).join('\n')}
</main>
<footer><div class="wrap"><span>Facts are sourced. Commentary is labeled.</span><span>Researched and drafted with Claude, an AI model made by Anthropic, one of the two companies covered.</span><span><a href="${esc(D.site.repo)}/blob/HEAD/METHODOLOGY.md">Methodology</a></span><span><a href="feed.xml">RSS feed</a></span>${licenseSpan(D)}</div></footer>
</body>
</html>
`;
}

const DISCLOSURE = {
  announced: 'Announced',
  page: 'Noted on the page',
  none: 'No notice found',
  'n/a': 'Not applicable (wording, typo and layout fixes)',
  unchecked: 'Not checked',
};

/**
 * The Fine print view as plain HTML: every logged change to the companies'
 * policy, terms, pricing and help pages, page by page, oldest first, with the
 * archived copies that hold each quoted phrase.
 */
export function finePrintHtml(D) {
  const base = D.site.url || './';
  const pages = D.policy || [];
  const changes = pages.flatMap((p) => p.changes.map((c) => ({ ...c, org: p.org })));
  const count = (org, pred) => changes.filter((c) => c.org === org && pred(c)).length;
  const copy = (x) => `<a href="${esc(x.archive || `${D.site.repo}/blob/HEAD/${x.file}`)}">${esc(fmtDate(x.date))}</a>`;
  const entryLinks = (t) => esc(t).replace(/`([^`]+)`/g, (m, id) => {
    const e = D.entries.find((x) => x.id === id);
    return e ? `<a href="./#e-${esc(id)}">${esc(e.title)}</a>` : esc(id);
  });
  const change = (c) => {
    const found = (c.quotes || []).filter((q) => q.first);
    return `<article class="r-entry">
<p class="r-meta"><time datetime="${esc(c.date)}">${esc(c.when || fmtDate(c.date))}</time> · ${esc(DISCLOSURE[c.disclosure] || c.disclosure)}${c.cut ? ' · Cut made without notice (a judgment)' : ''}</p>
<p>${esc(c.change)}</p>
${c.notice && c.notice !== 'n/a' ? `<div class="r-part"><p class="label">How it was made known</p><p>${entryLinks(c.notice)}</p></div>` : ''}
${found.length ? `<div class="r-part"><p class="label">Quotes found in archived copies of the page</p><ul>${found.map((q) => `<li>“${esc(q.text)}”: ${q.first.date === q.last.date ? copy(q.first) : `${copy(q.first)} to ${copy(q.last)}`}</li>`).join('')}</ul></div>` : ''}
</article>`;
  };
  const title = `${D.site.title}: the fine print`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Every change found in the archived history of OpenAI's and Anthropic's usage policies, terms, privacy policies, pricing and help pages, and how each was made known.">
<link rel="canonical" href="${esc(base)}fine-print.html">
<link rel="stylesheet" href="styles.css">
</head>
<body class="record">
<header class="masthead"><div class="wrap">
<p class="wordmark"><a href="./">${esc(D.site.title)}</a></p>
<h1 class="r-title">The fine print</h1>
<p class="lede">Every change found in the archived history of both companies' usage policies, terms, privacy policies, pricing pages, usage-limit help pages and model-retirement pages, and how each one was made known.</p>
<p class="r-meta">${['openai', 'anthropic'].map((o) => `${ORG[o]}: ${pages.filter((p) => p.org === o).length} pages, ${count(o, () => true)} changes, ${count(o, (c) => c.disclosure === 'none')} with no notice found, ${count(o, (c) => c.cut)} of them cuts`).join('. ')}. Updated ${esc(fmtDate(String(D.generated).slice(0, 10)))}.</p>
<p>"No notice found" means no new date or note on the page and no announcement found; it does not prove none was made. A cut is a change that reduced what users get or what the company had promised, and sorting changes that way is a judgment. Words in quotation marks are the page's own, and each was found in a saved copy of it. <a href="./#fineprint">The same log on the site</a>, with filters. <a href="${esc(D.site.repo)}/blob/HEAD/inbox/history/CHANGES.md">How the pages were compared</a>.</p>
<nav class="r-years" aria-label="Pages">${pages.map((p) => `<a href="#${esc(p.page)}">${esc(p.title)}</a>`).join(' ')}</nav>
</div></header>
<main class="wrap">
${pages.map((p) => `<section id="${esc(p.page)}"><h2 class="r-year">${esc(p.title)}</h2>
<p class="r-meta">${esc([ORG[p.org], p.versions].filter(Boolean).join(' · '))}${p.url ? ` · <a href="${esc(p.url)}">the page today</a> · <a href="https://web.archive.org/web/*/${esc(p.url)}">every archived copy</a>` : ''}</p>
${p.note ? `<p class="r-note">${esc(p.note)}</p>` : ''}
${p.changes.map(change).join('\n')}
${p.after ? `<p class="r-note">${esc(p.after)}</p>` : ''}
</section>`).join('\n')}
</main>
<footer><div class="wrap"><span>Facts are sourced. Commentary is labeled.</span><span>Researched and drafted with Claude, an AI model made by Anthropic, one of the two companies covered.</span><span><a href="${esc(D.site.repo)}/blob/HEAD/METHODOLOGY.md">Methodology</a></span><span><a href="record.html">The whole record</a></span>${licenseSpan(D)}</div></footer>
</body>
</html>
`;
}

/** The home page and the plain pages. Entry pages redirect into the site, so they are left out. */
export function sitemapXml(D) {
  const base = D.site.url;
  const day = String(D.generated).slice(0, 10);
  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(base)}</loc><lastmod>${day}</lastmod></url>
  <url><loc>${esc(base)}record.html</loc><lastmod>${day}</lastmod></url>
  <url><loc>${esc(base)}fine-print.html</loc><lastmod>${day}</lastmod></url>
</urlset>
`;
}
