#!/usr/bin/env node
// Link previews for the public site: one small page per entry, at e/<id>/, whose
// Open Graph tags carry the entry's title, a one-line summary and a card image,
// so a link pasted into a chat or a post shows the receipt itself. Each page
// sends a visitor on to the entry in the site (#e-<id>).
//
//   npm run cards        after "npm run build"; writes site/e/ and site/card.png
//   npm run cards -- --no-images   pages only (no Playwright needed)
//
// The Site workflow runs this before publishing. The output is generated, not
// committed (see .gitignore).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib.mjs';
import { getBrowser, closeBrowser } from './web.mjs';

// The same marks as site/app.js (Simple Icons, CC0); the logos are the companies' trademarks.
export const LOGO = {
  openai: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
  anthropic: 'M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z',
};
const ORG = { openai: 'OpenAI', anthropic: 'Anthropic' };
const STATUS = { open: 'Standing', kept: 'Kept', broken: 'Broken', reversed: 'Reversed', eroded: 'Eroded', contradicted: 'Contradicted' };
const FAILED = new Set(['broken', 'reversed', 'eroded', 'contradicted']);
const DAY = 86400000;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDay = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short' });
function fmtDate(s) {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(String(s || ''));
  if (!m) return String(s || '');
  const t = Date.UTC(+m[1], (+m[2] || 1) - 1, +m[3] || 1);
  return m[3] ? fmtDay.format(t) : m[2] ? fmtMonth.format(t) : m[1];
}
/** The time between two entries, as the site says it: "18 days", "7 months", "3.8 years". */
export function span(days) {
  const a = Math.abs(days);
  if (a < 45) return `${a} ${a === 1 ? 'day' : 'days'}`;
  const months = Math.round(a / 30.44);
  if (months < 24) return `${months} months`;
  return `${Math.round((a / 365.25) * 10) / 10} years`;
}
export function clip(text, n) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, t.lastIndexOf(' ', n))}…` : t;
}

/**
 * What a card shows for one entry: the statement and what became of it where the
 * record pairs them, otherwise the entry on its own.
 */
export function cardFor(e, byId) {
  const said = e.type === 'said' ? e : byId.get(e.contradicts?.[0]);
  const did = e.type === 'did' ? e : byId.get(e.contradicted_by?.[0]);
  if (said && did) {
    const gap = Math.round((did.time - said.time) / DAY);
    return { org: e.org, status: said.status, left: { stamp: 'Said', date: said.date, text: said.quote || said.title, quoted: !!said.quote }, gap: `${span(gap)} ${gap < 0 ? 'before' : 'later'}`, right: { stamp: 'Did', date: did.date, text: did.title } };
  }
  if (e.type === 'said' && e.outcome) {
    const gap = Math.round((e.outcome.time - e.time) / DAY);
    return { org: e.org, status: e.status, left: { stamp: 'Said', date: e.date, text: e.quote || e.title, quoted: !!e.quote }, gap: `${span(gap)} ${gap < 0 ? 'before' : 'later'}`, right: { stamp: gap < 0 ? 'On record' : 'Outcome', date: e.outcome.date, text: e.outcome.text } };
  }
  if (e.revision) {
    return { org: e.org, left: { stamp: 'Before', date: '', text: e.revision.before }, gap: `edited ${fmtDate(e.date)}`, right: { stamp: 'After', date: '', text: e.revision.after } };
  }
  return { org: e.org, status: e.status, single: { stamp: e.type === 'said' ? 'Said' : 'Did', date: e.date, title: e.title, text: e.quote } };
}

/** One line for previews: the quote or summary, with what became of it. */
export function describe(e, byId) {
  const c = cardFor(e, byId);
  const status = c.status && STATUS[c.status] ? `${STATUS[c.status]}. ` : '';
  if (c.single) return clip(`${status}${c.single.text ? `“${c.single.text}”` : e.summary || ''}`, 220);
  const head = (x) => [x.stamp, x.date && fmtDate(x.date)].filter(Boolean).join(' ');
  return clip(`${status}${head(c.left)}: ${c.left.text} ${head(c.right)} (${c.gap}): ${c.right.text}`, 240);
}

const logoSvg = (org, size) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${LOGO[org] || ''}" fill="currentColor"/></svg>`;
const statusTag = (s) => (s && STATUS[s] ? `<span class="pill ${FAILED.has(s) ? 'fail' : s === 'kept' ? 'held' : 'open'}">${FAILED.has(s) ? '× ' : s === 'kept' ? '✓ ' : '○ '}${esc(STATUS[s])}</span>` : '');
const side = (x, cls) => `<div class="side ${cls}"><div class="meta"><span class="stamp ${cls}">${esc(x.stamp)}</span>${x.date ? `<span class="date">${esc(fmtDate(x.date))}</span>` : ''}</div><p class="text">${x.quoted ? '“' : ''}${esc(clip(x.text, 260))}${x.quoted ? '”' : ''}</p></div>`;

const STYLE = `
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;background:#fff;color:#0b0b0b;font-family:Geist,system-ui,sans-serif}
.card{height:630px;padding:52px 64px 44px;display:grid;grid-template-rows:auto 1fr auto;gap:28px}
.top,.bottom{display:flex;align-items:center;justify-content:space-between;gap:24px}
.wordmark{font:600 34px/1 Geist,sans-serif;letter-spacing:-0.04em}.wordmark i{font-style:normal;color:#6f6f6f;font-weight:300;margin:0 6px}
.org{display:flex;align-items:center;gap:12px;font:600 28px/1 Geist,sans-serif}
.meta{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.stamp{font:600 17px/1 'Geist Mono',monospace;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px 5px;border:2px solid #0b0b0b}
.stamp.did{background:#0b0b0b;color:#fff}
.date{font:500 19px/1 'Geist Mono',monospace;color:#4a4a4a;letter-spacing:.02em}
.pair{display:grid;grid-template-columns:1fr 150px 1fr;align-items:start;border-top:2px solid #0b0b0b;padding-top:26px}
.gap{align-self:center;text-align:center;font:600 24px/1.2 Geist,sans-serif;padding:0 10px}
.text{font:400 27px/1.35 Geist,sans-serif;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:7;overflow:hidden}
.side.said .text{border-left:3px solid #0b0b0b;padding-left:16px}
.single{border-top:2px solid #0b0b0b;padding-top:26px}
.single h1{font:600 44px/1.15 Geist,sans-serif;letter-spacing:-0.02em;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.quote{margin-top:18px;font:400 27px/1.35 Geist,sans-serif;color:#2a2a2a;border-left:3px solid #0b0b0b;padding-left:16px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.pill{font:600 20px/1 'Geist Mono',monospace;padding:8px 12px;border:2px solid}
.pill.fail{color:#b42318;border-color:#e8a29b;background:#fdf1f0}.pill.held{color:#127046;border-color:#9bd1b5;background:#effaf4}.pill.open{color:#8f5a00;border-color:#e5c690;background:#fdf7ec}
.host{font:500 20px/1 'Geist Mono',monospace;color:#4a4a4a}
.lede{font:400 34px/1.35 Geist,sans-serif;color:#2a2a2a;max-width:900px;align-self:center}
.figures{border-top:2px solid #0b0b0b;padding-top:22px}
.fig{display:grid;gap:8px}.fig b{font:600 54px/1 Geist,sans-serif}.fig span{font:500 18px/1 'Geist Mono',monospace;text-transform:uppercase;letter-spacing:.04em;color:#4a4a4a}
`;
const shell = (inner) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@500;600&display=block">
<style>${STYLE}</style></head><body><div class="card">${inner}</div></body></html>`;

export function cardHtml(c, host) {
  const body = c.single
    ? `<div class="single"><div class="meta"><span class="stamp ${c.single.stamp === 'Said' ? 'said' : 'did'}">${esc(c.single.stamp)}</span><span class="date">${esc(fmtDate(c.single.date))}</span></div>
       <h1>${esc(clip(c.single.title, 150))}</h1>${c.single.text ? `<p class="quote">“${esc(clip(c.single.text, 200))}”</p>` : ''}</div>`
    : `<div class="pair">${side(c.left, 'said')}<div class="gap">${esc(c.gap)}</div>${side(c.right, 'did')}</div>`;
  return shell(`<div class="top"><span class="wordmark">Said<i>/</i>Did</span><span class="org">${logoSvg(c.org, 30)}${esc(ORG[c.org] || c.org)}</span></div>
${body}
<div class="bottom">${statusTag(c.status) || '<span></span>'}<span class="host">${esc(host)}</span></div>`);
}

function homeCardHtml(D) {
  const said = D.entries.filter((e) => e.type === 'said');
  const n = (pred) => said.filter(pred).length;
  const figures = [[said.length, 'statements', '#0b0b0b'], [n((e) => FAILED.has(e.status)), 'didn’t hold up', '#b42318'], [n((e) => e.status === 'kept'), 'kept', '#127046'], [n((e) => e.status === 'open'), 'still standing', '#8f5a00']];
  return shell(`<div class="top"><span class="wordmark" style="font-size:64px">Said<i>/</i>Did</span><span class="org">${logoSvg('openai', 36)}${logoSvg('anthropic', 36)}</span></div>
<p class="lede">What OpenAI and Anthropic said they would do, and what they did next. Every entry sourced and dated.</p>
<div class="bottom figures">${figures.map(([k, label, color]) => `<span class="fig"><b style="color:${color}">${k}</b><span>${label}</span></span>`).join('')}</div>`);
}

function pageHtml(e, D, base, withImage) {
  const byId = new Map(D.entries.map((x) => [x.id, x]));
  const url = `${base}e/${e.id}/`;
  const desc = describe(e, byId);
  const title = `${e.title} · Said / Did`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Said / Did">
<meta property="og:title" content="${esc(e.title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${withImage ? `<meta property="og:image" content="${esc(`${url}card.png`)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(desc)}">
<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<meta http-equiv="refresh" content="0; url=../../#e-${esc(e.id)}">
<script>location.replace('../../#e-${e.id}');</script>
</head><body><p><a href="../../#e-${esc(e.id)}">${esc(e.title)}</a></p></body></html>
`;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const src = await readFile(path.join(ROOT, 'site', 'data.js'), 'utf8');
  const D = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  const base = D.site.url || '';
  if (!base) throw new Error('data/site.yaml needs a url for link previews');
  const host = base.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const browser = args.has('--no-images') ? null : await getBrowser();
  if (!browser && !args.has('--no-images')) console.warn('Playwright is not available: writing pages without card images.');
  const out = path.join(ROOT, 'site', 'e');
  await rm(out, { recursive: true, force: true });
  const byId = new Map(D.entries.map((x) => [x.id, x]));
  let page;
  if (browser) {
    page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.setContent(cardHtml(cardFor(D.entries[0], byId), host), { waitUntil: 'networkidle' }).catch(() => {});
  }
  const shoot = async (html, file) => {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: file, type: 'png' });
  };
  for (const e of D.entries) {
    const dir = path.join(out, e.id);
    await mkdir(dir, { recursive: true });
    if (page) await shoot(cardHtml(cardFor(e, byId), host), path.join(dir, 'card.png'));
    await writeFile(path.join(dir, 'index.html'), pageHtml(e, D, base, !!page));
  }
  if (page) await shoot(homeCardHtml(D), path.join(ROOT, 'site', 'card.png'));
  await closeBrowser();
  console.log(`wrote ${D.entries.length} entry pages${page ? ' with card images, and the home card' : ''} under site/e/`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
