// Finding posts by in-scope accounts: Wayback Machine CDX (free, includes
// deleted posts), X API v2 (needs a bearer token), and Bluesky (public API,
// optional app password). Pure helpers are exported for tests.
import { decodeEntities, fetchWithTimeout, fetchXPost, fetchXPostDetails, normalizeText, sleep } from './web.mjs';

// ── X post ids ───────────────────────────────────────────────────────────
const TWITTER_EPOCH = 1288834974657n;

/** An X post id (a "snowflake") encodes its creation time. Returns a Date, or null for pre-2010 ids. */
export function snowflakeDate(id) {
  try {
    const n = BigInt(id);
    if (n < 1n << 22n) return null;
    return new Date(Number((n >> 22n) + TWITTER_EPOCH));
  } catch {
    return null;
  }
}

export function xStatusId(url) {
  const m = /(?:twitter|x)\.com\/[^/?#]+\/status(?:es)?\/(\d+)/i.exec(String(url));
  return m ? m[1] : null;
}

/**
 * Turn Wayback CDX JSON rows into one candidate per post id, with post dates
 * from the id. Keeps the earliest capture that loaded (HTTP 200), else the
 * earliest capture of any kind. Newest post first.
 */
export function parseCdxRows(rows, handle) {
  const [header, ...data] = Array.isArray(rows) ? rows : [];
  if (!header) return [];
  const col = Object.fromEntries(header.map((h, i) => [h, i]));
  const byId = new Map();
  for (const row of data) {
    if (!Array.isArray(row) || row.length < header.length) continue;
    const original = row[col.original];
    const id = xStatusId(original);
    if (!id) continue;
    const ts = row[col.timestamp];
    const status = col.statuscode === undefined ? '200' : row[col.statuscode];
    const prev = byId.get(id);
    if (prev) {
      const better = (status === '200') !== (prev.archived_status === '200') ? status === '200' : ts < prev.archived_at;
      if (!better) continue;
    }
    const date = snowflakeDate(id);
    byId.set(id, {
      id,
      handle,
      url: `https://x.com/${handle}/status/${id}`,
      date: date ? date.toISOString().slice(0, 10) : null,
      archived_at: ts,
      archived_status: status,
      archive: `https://web.archive.org/web/${ts}/${original}`,
      archive_raw: `https://web.archive.org/web/${ts}id_/${original}`,
    });
  }
  return [...byId.values()].sort(newestFirst);
}

/** Order posts newest first by id (ids grow with time; comparing them as strings does not work). */
export function newestFirst(a, b) {
  const x = BigInt(a.id), y = BigInt(b.id);
  return x === y ? 0 : x > y ? -1 : 1;
}

/**
 * Split a CDX JSON page into its rows and the resume key for the next page.
 * With showResumeKey=true the server ends a page that has more after it with
 * an empty row and then a one-item row holding the key.
 */
export function splitCdxResume(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return { rows: Array.isArray(rows) ? rows : [], resumeKey: null };
  const last = rows[rows.length - 1];
  const beforeLast = rows[rows.length - 2];
  if (Array.isArray(last) && last.length === 1 && Array.isArray(beforeLast) && beforeLast.length === 0) {
    return { rows: rows.slice(0, -2), resumeKey: last[0] };
  }
  return { rows, resumeKey: null };
}

/** Pull the post text out of an archived X/Twitter page (server-rendered og:description, used before 2023). */
export function textFromArchivedPost(html) {
  const meta = /<meta[^>]+property=["']og:description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i.exec(html)
    || /<meta[^>]+content=["']([\s\S]*?)["'][^>]*property=["']og:description["'][^>]*>/i.exec(html);
  if (meta) return normalizeText(decodeEntities(meta[1])).replace(/^[“"]|[”"]$/g, '');
  const p = /<p[^>]*class=["'][^"']*tweet-text[^"']*["'][^>]*>([\s\S]*?)<\/p>/i.exec(html);
  return p ? normalizeText(decodeEntities(p[1].replace(/<[^>]+>/g, ''))) : null;
}

// ── Wayback CDX ──────────────────────────────────────────────────────────
// Every URL form X posts have been archived under. twitter.com also covers
// www.twitter.com: the index folds "www." away.
export const cdxPrefixes = (handle) => [
  `twitter.com/${handle}/status/`,
  `twitter.com/${handle}/statuses/`,
  `mobile.twitter.com/${handle}/status/`,
  `x.com/${handle}/status/`,
];

/** Fetch with retries for rate limits, server errors and dropped connections. */
async function fetchPatiently(url, opts, { tries = 5, wait = 20000 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetchWithTimeout(url, opts);
      if ((res.status === 429 || res.status >= 500) && attempt < tries) {
        await sleep(wait * attempt);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= tries) throw err;
      await sleep(wait * attempt);
    }
  }
}

/**
 * List every archived post URL for an X account, across all URL forms, page by
 * page so no account is cut short. Newest post first.
 */
export async function waybackPosts(handle, { from, to, pageSize = 10000, onPage } = {}) {
  const all = [];
  for (const prefix of cdxPrefixes(handle)) {
    let resumeKey = null;
    let pages = 0;
    do {
      const params = new URLSearchParams({
        url: prefix,
        matchType: 'prefix',
        output: 'json',
        fl: 'timestamp,original,statuscode',
        filter: 'statuscode:[23]..',
        collapse: 'urlkey',
        limit: String(pageSize),
        showResumeKey: 'true',
      });
      // CDX's from/to filter on capture time, which is never before the post: a lower bound is safe.
      if (from) params.set('from', from.replace(/-/g, ''));
      if (resumeKey) params.set('resumeKey', resumeKey);
      const res = await fetchPatiently(`https://web.archive.org/cdx/search/cdx?${params}`, { timeout: 180000, headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`Wayback CDX returned HTTP ${res.status} for ${prefix}`);
      const text = await res.text();
      const page = splitCdxResume(text.trim() ? JSON.parse(text) : []);
      // Pages start with the header row; keep it once.
      const isHeader = (r) => Array.isArray(r) && r[0] === 'timestamp';
      if (!all.length) all.push(['timestamp', 'original', 'statuscode']);
      all.push(...page.rows.filter((r) => !isHeader(r)));
      pages++;
      onPage?.({ prefix, pages, rows: all.length - 1 });
      resumeKey = page.resumeKey !== resumeKey ? page.resumeKey : null;
      await sleep(1500);
    } while (resumeKey && pages < 2000);
  }
  return parseCdxRows(all, handle).filter((c) => (!from || (c.date && c.date >= from)) && (!to || (c.date && c.date <= to)));
}

/**
 * An account's public profile through X's embed endpoint: display name and
 * how many posts it has made (including reposts). Null when X won't say.
 */
export async function fetchXProfile(handle) {
  // One try: X rate-limits this endpoint hard, and the count is a nice-to-have.
  const res = await fetchWithTimeout(`https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(handle)}`, { timeout: 30000 });
  if (!res.ok) return null;
  const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(await res.text());
  if (!m) return null;
  const entries = JSON.parse(m[1])?.props?.pageProps?.timeline?.entries ?? [];
  const user = entries.map((e) => e.content?.tweet?.user).find((u) => u?.screen_name?.toLowerCase() === handle.toLowerCase());
  return user ? { name: user.name, posts: user.statuses_count ?? null, protected: !!user.protected } : null;
}

/**
 * Fill in the text of a candidate: first from X's embed data (full text of
 * long posts, the post it quotes, who it replies to), then from oEmbed, then
 * from the archived copy. A live 404 with an archived copy suggests the post
 * was deleted or the account made private.
 */
export async function hydrateXCandidate(c) {
  try {
    const d = await fetchXPostDetails(c.id);
    c.live_status = d.status;
    if (d.ok) {
      c.text = d.text;
      if (d.raw?.in_reply_to_screen_name) c.reply_to = d.raw.in_reply_to_screen_name;
      if (d.quoted) c.quoted = { url: d.quoted.url, text: d.quoted.text };
      return c;
    }
  } catch (err) {
    c.live_status = `error: ${err.message}`;
  }
  if (![404, 410].includes(c.live_status)) {
    try {
      const live = await fetchXPost(c.url);
      c.live_status = live.status;
      if (live.ok) {
        c.text = live.text;
        return c;
      }
    } catch (err) {
      c.live_status = `error: ${err.message}`;
    }
  }
  if ([404, 410].includes(c.live_status)) c.possibly_deleted = true;
  try {
    const res = await fetchWithTimeout(c.archive_raw, { timeout: 45000 });
    if (res.ok) c.text = textFromArchivedPost(await res.text());
  } catch { /* leave text empty */ }
  return c;
}

// ── X API v2 ─────────────────────────────────────────────────────────────
/**
 * Read an account's posts through the X API (needs X_BEARER_TOKEN). Uses the
 * user timeline endpoint, which returns up to the ~3,200 most recent posts;
 * what your token can read depends on its X API access tier.
 */
export async function xApiPosts(handle, { from, to, max = 800 } = {}) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error('X_BEARER_TOKEN is not set');
  const headers = { authorization: `Bearer ${token}`, accept: 'application/json' };
  const api = 'https://api.x.com/2';
  const who = await fetchWithTimeout(`${api}/users/by/username/${encodeURIComponent(handle)}`, { headers });
  if (!who.ok) throw new Error(`X API user lookup returned HTTP ${who.status}${who.status === 403 ? ' (your API tier may not include this endpoint)' : ''}`);
  const userId = (await who.json()).data?.id;
  if (!userId) throw new Error(`X API: no user @${handle}`);
  const out = [];
  let next;
  do {
    const params = new URLSearchParams({ max_results: '100', 'tweet.fields': 'created_at' });
    if (from) params.set('start_time', `${from}T00:00:00Z`);
    if (to) params.set('end_time', `${to}T23:59:59Z`);
    if (next) params.set('pagination_token', next);
    const res = await fetchWithTimeout(`${api}/users/${userId}/tweets?${params}`, { headers });
    if (res.status === 429) throw new Error('X API rate limit reached; try again later');
    if (!res.ok) throw new Error(`X API timeline returned HTTP ${res.status}`);
    const json = await res.json();
    for (const t of json.data ?? []) {
      out.push({ id: t.id, handle, url: `https://x.com/${handle}/status/${t.id}`, date: t.created_at?.slice(0, 10), text: t.text, via: 'x-api' });
    }
    next = json.meta?.next_token;
  } while (next && out.length < max);
  return out;
}

// ── Bluesky ──────────────────────────────────────────────────────────────
let bskySession;
async function bskyAuth() {
  const { BSKY_HANDLE, BSKY_APP_PASSWORD } = process.env;
  if (!BSKY_HANDLE || !BSKY_APP_PASSWORD) return null;
  if (!bskySession) {
    const res = await fetchWithTimeout('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ identifier: BSKY_HANDLE, password: BSKY_APP_PASSWORD }),
    });
    if (!res.ok) throw new Error(`Bluesky login failed (HTTP ${res.status})`);
    bskySession = await res.json();
  }
  return bskySession.accessJwt;
}

export function bskyPostUrl(post) {
  const rkey = String(post.uri).split('/').pop();
  return `https://bsky.app/profile/${post.author?.handle}/post/${rkey}`;
}

/**
 * Bluesky posts by an account. With search terms, uses searchPosts (one query
 * per term); without, walks the author feed. Logging in with an app password
 * (BSKY_HANDLE, BSKY_APP_PASSWORD) avoids limits on anonymous search.
 */
export async function blueskyPosts(handle, { terms = [], from, to, max = 500 } = {}) {
  const jwt = await bskyAuth();
  // The public.api.bsky.app cache refuses searchPosts (HTTP 403); api.bsky.app serves it without login.
  const base = jwt ? 'https://bsky.social/xrpc' : 'https://api.bsky.app/xrpc';
  const headers = { accept: 'application/json', ...(jwt ? { authorization: `Bearer ${jwt}` } : {}) };
  const seen = new Map();
  const add = (post) => {
    if (seen.has(post.uri)) return;
    const date = (post.record?.createdAt || post.indexedAt || '').slice(0, 10);
    if ((from && date < from) || (to && date > to)) return;
    seen.set(post.uri, { id: post.uri, handle, url: bskyPostUrl(post), date, text: post.record?.text ?? '', via: 'bluesky' });
  };
  if (terms.length) {
    for (const q of terms) {
      const params = new URLSearchParams({ q, author: handle, limit: '100', sort: 'latest' });
      if (from) params.set('since', `${from}T00:00:00Z`);
      if (to) params.set('until', `${to}T23:59:59Z`);
      const res = await fetchWithTimeout(`${base}/app.bsky.feed.searchPosts?${params}`, { headers });
      if (!res.ok) throw new Error(`Bluesky search returned HTTP ${res.status}${res.status === 403 || res.status === 401 ? ' (set BSKY_HANDLE and BSKY_APP_PASSWORD)' : ''}`);
      for (const post of (await res.json()).posts ?? []) add(post);
    }
  } else {
    let cursor;
    do {
      const params = new URLSearchParams({ actor: handle, limit: '100', filter: 'posts_no_replies' });
      if (cursor) params.set('cursor', cursor);
      const res = await fetchWithTimeout(`${base}/app.bsky.feed.getAuthorFeed?${params}`, { headers });
      if (!res.ok) throw new Error(`Bluesky feed returned HTTP ${res.status}`);
      const json = await res.json();
      for (const item of json.feed ?? []) add(item.post);
      cursor = json.cursor;
      const oldest = json.feed?.at(-1)?.post?.record?.createdAt?.slice(0, 10);
      if (from && oldest && oldest < from) break;
    } while (cursor && seen.size < max);
  }
  return [...seen.values()];
}
