// Network and text helpers shared by capture, check-sources and watch-pages.
import { createHash } from 'node:crypto';

export const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 said-did-archiver';

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithTimeout(url, { timeout = 30000, ...opts } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, {
      redirect: 'follow',
      ...opts,
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', ...(opts.headers || {}) },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Rough visible-text extraction from HTML, for pages fetched without a browser. */
export function htmlToText(html) {
  let s = String(html);
  const main = /<main[\s>][\s\S]*?<\/main>/i.exec(s);
  if (main) s = main[0];
  s = s
    .replace(/<(script|style|noscript|svg|template|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|li|ul|ol|h[1-6]|tr|table|blockquote|header|footer|nav|pre)>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ');
  return normalizeText(decodeEntities(s));
}

/** Collapse whitespace so cosmetic markup changes don't register as edits. */
export function normalizeText(s) {
  return String(s)
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

// Credential formats GitHub push protection blocks. A page about a leak can
// print a live key; a snapshot keeps the page's text with the key masked.
const CREDENTIALS = [
  /\b[ps]k\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // Mapbox
  /\brubygems_[0-9a-f]{48}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{60,}/g,
  /\bnpm_[A-Za-z0-9]{36}\b/g,
  /\bpypi-AgE[A-Za-z0-9_-]{50,}/g,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{35}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}/g,
  /\b[rs]k_live_[A-Za-z0-9]{20,}/g,
];

/** Mask credentials in text. Returns the masked text and how many were found. */
export function redactCredentials(text) {
  let count = 0;
  let out = String(text);
  for (const re of CREDENTIALS) out = out.replace(re, () => { count++; return '[credential removed]'; });
  return { text: out, count };
}

export const hasCredential = (text) => redactCredentials(text).count > 0;

export function pageTitle(html) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(String(html));
  return m ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : null;
}

// ── social posts ─────────────────────────────────────────────────────────
export const isXUrl = (url) => /^https?:\/\/(www\.|mobile\.)?(twitter|x)\.com\/[^/]+\/status\/\d+/i.test(url);
export const isBlueskyUrl = (url) => /^https?:\/\/bsky\.app\/profile\/[^/]+\/post\/[^/?#]+/i.test(url);

/**
 * Parse the HTML that X's oEmbed endpoint returns into { text, date, author }.
 * The markup is a <blockquote class="twitter-tweet"><p>…</p>— Name (@handle) <a>Date</a></blockquote>.
 */
export function parseTweetEmbed(html) {
  const p = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  const text = p ? normalizeText(decodeEntities(p[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))) : null;
  const links = [...html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)];
  const date = links.length ? decodeEntities(links[links.length - 1][1]).trim() : null;
  const by = /&mdash;\s*([^<]+?)\s*<a/i.exec(html) || /—\s*([^<]+?)\s*<a/i.exec(html);
  return { text, date, author: by ? decodeEntities(by[1]).trim() : null };
}

/** Fetch a post's text through X's public oEmbed endpoint. A 404 usually means deleted or protected. */
export async function fetchXPost(url) {
  const api = `https://publish.twitter.com/oembed?omit_script=1&dnt=true&url=${encodeURIComponent(url)}`;
  const res = await fetchWithTimeout(api, { headers: { accept: 'application/json' } });
  if (!res.ok) return { ok: false, status: res.status };
  const json = await res.json();
  return { ok: true, status: res.status, raw: json, ...parseTweetEmbed(json.html || ''), author_url: json.author_url };
}

/**
 * Fetch a post's full details from X's embed ("syndication") endpoint: the
 * complete text of long posts, attached photos, and the post it quotes. oEmbed
 * truncates long posts and drops images, and some statements (a signed letter,
 * a screenshot of a memo) exist only as an image.
 */
export async function fetchXPostDetails(id) {
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
  const res = await fetchWithTimeout(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${token}`, { headers: { accept: 'application/json' } });
  if (!res.ok) return { ok: false, status: res.status };
  const raw = await res.json();
  if (raw.__typename === 'TweetTombstone') return { ok: false, status: 410, raw };
  const photos = (t) => (t?.photos ?? []).map((p) => p.url).filter(Boolean);
  const q = raw.quoted_tweet;
  return {
    ok: true, status: res.status, raw,
    text: raw.note_tweet?.text ?? raw.text ?? null,
    photos: photos(raw),
    quoted: q ? { url: `https://x.com/${q.user?.screen_name}/status/${q.id_str}`, author: q.user?.screen_name ?? null, text: q.note_tweet?.text ?? q.text ?? null, photos: photos(q) } : null,
  };
}

/** Fetch a Bluesky post through the public AppView API. */
export async function fetchBlueskyPost(url) {
  const m = /bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/i.exec(url);
  if (!m) return { ok: false, status: 0 };
  const [, actor, rkey] = m;
  const base = 'https://public.api.bsky.app/xrpc';
  let did = actor;
  if (!actor.startsWith('did:')) {
    const r = await fetchWithTimeout(`${base}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`, { headers: { accept: 'application/json' } });
    if (!r.ok) return { ok: false, status: r.status };
    did = (await r.json()).did;
  }
  const uri = `at://${did}/app.bsky.feed.post/${rkey}`;
  const res = await fetchWithTimeout(`${base}/app.bsky.feed.getPostThread?depth=0&parentHeight=0&uri=${encodeURIComponent(uri)}`, { headers: { accept: 'application/json' } });
  if (!res.ok) return { ok: false, status: res.status };
  const json = await res.json();
  const post = json.thread?.post;
  return { ok: !!post, status: res.status, raw: json, text: post?.record?.text ?? null, date: post?.record?.createdAt ?? null, author: post?.author?.handle ?? actor };
}

// ── Internet Archive ─────────────────────────────────────────────────────
const WAYBACK_RE = /\/web\/(\d{14})\//;

/**
 * Ask the Wayback Machine to save a URL now. Uses the authenticated Save Page
 * Now API when IA_ACCESS_KEY and IA_SECRET_KEY are set (more reliable, higher
 * limits), otherwise the anonymous endpoint. Returns { url, timestamp, method } or throws.
 */
export async function waybackSave(url, { log = () => {} } = {}) {
  const { IA_ACCESS_KEY, IA_SECRET_KEY } = process.env;
  if (IA_ACCESS_KEY && IA_SECRET_KEY) {
    const auth = { authorization: `LOW ${IA_ACCESS_KEY}:${IA_SECRET_KEY}`, accept: 'application/json' };
    const res = await fetchWithTimeout('https://web.archive.org/save', {
      method: 'POST',
      timeout: 60000,
      headers: { ...auth, 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url, capture_all: '1', skip_first_archive: '1' }),
    });
    const job = await res.json().catch(() => ({}));
    if (!job.job_id) throw new Error(`Save Page Now refused: ${job.message || res.status}`);
    for (let i = 0; i < 40; i++) {
      await sleep(3000);
      const st = await (await fetchWithTimeout(`https://web.archive.org/save/status/${job.job_id}`, { headers: auth })).json();
      if (st.status === 'success') {
        return { url: `https://web.archive.org/web/${st.timestamp}/${st.original_url || url}`, timestamp: st.timestamp, method: 'spn2' };
      }
      if (st.status === 'error') throw new Error(`Save Page Now failed: ${st.message || st.status_ext}`);
      log('  waiting for the Wayback Machine…');
    }
    throw new Error('Save Page Now timed out');
  }
  const res = await fetchWithTimeout(`https://web.archive.org/save/${url}`, { timeout: 120000 });
  const candidates = [res.headers.get('content-location'), res.headers.get('location'), res.url];
  for (const c of candidates) {
    const m = c && WAYBACK_RE.exec(c);
    if (m) return { url: `https://web.archive.org/web/${m[1]}/${url}`, timestamp: m[1], method: 'spn' };
  }
  const body = await res.text().catch(() => '');
  const m = WAYBACK_RE.exec(body);
  if (res.ok && m) return { url: `https://web.archive.org/web/${m[1]}/${url}`, timestamp: m[1], method: 'spn' };
  throw new Error(`Wayback Machine did not return a snapshot (HTTP ${res.status})`);
}

/** Look up the closest existing Wayback snapshot, without creating one. */
export async function waybackClosest(url, timestamp) {
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}${timestamp ? `&timestamp=${timestamp}` : ''}`;
  const res = await fetchWithTimeout(api, { headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  const snap = (await res.json())?.archived_snapshots?.closest;
  return snap?.available ? { url: snap.url.replace(/^http:/, 'https:'), timestamp: snap.timestamp, method: 'existing' } : null;
}

// ── optional headless browser ────────────────────────────────────────────
let browserPromise;
/** Returns a Playwright Chromium browser, or null when Playwright or its browser is not installed. */
export async function getBrowser() {
  if (browserPromise === undefined) {
    browserPromise = (async () => {
      try {
        const { chromium } = await import('playwright');
        return await chromium.launch();
      } catch {
        return null;
      }
    })();
  }
  return browserPromise;
}
export async function closeBrowser() {
  if (browserPromise) (await browserPromise)?.close();
  browserPromise = undefined;
}

/** Render a page in Chromium and return { text, title, screenshot (Buffer|null), status }. */
export async function renderPage(url, { screenshot = true } = {}) {
  const browser = await getBrowser();
  if (!browser) return null;
  const context = await browser.newContext({ userAgent: USER_AGENT, viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
  const page = await context.newPage();
  try {
    let response;
    let navError;
    try {
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch {
      response = await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch((err) => { navError = err; return null; });
    }
    if (!response) throw new Error(`the browser could not load the page${navError ? `: ${navError.message.split('\n')[0]}` : ''}`);
    await page.waitForTimeout(1500);
    const text = await page.evaluate(() => (document.querySelector('main') || document.body)?.innerText || '');
    const title = await page.title();
    // Full page, capped at 12,000px tall so long articles stay a reasonable size in git.
    const height = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 900);
    const shot = screenshot
      ? await page.screenshot({ fullPage: true, type: 'jpeg', quality: 62, clip: { x: 0, y: 0, width: 1280, height: Math.min(Math.max(height, 900), 12000) } }).catch(() => null)
      : null;
    return { text: normalizeText(text), title, screenshot: shot, status: response?.status() ?? null };
  } finally {
    await context.close();
  }
}
