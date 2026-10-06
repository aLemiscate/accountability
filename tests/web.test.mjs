import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasCredential, htmlToText, isBlueskyUrl, isXUrl, pageTitle, parseTweetEmbed, redactCredentials } from '../scripts/web.mjs';

test('parses the text, author and date out of an X oEmbed snippet', () => {
  const html = '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">But over the past years, safety culture and processes have taken a backseat to shiny products.</p>&mdash; Jan Leike (@janleike) <a href="https://twitter.com/janleike/status/1791498184671605209?ref_src=twsrc%5Etfw">May 17, 2024</a></blockquote>\n';
  const post = parseTweetEmbed(html);
  assert.equal(post.text, 'But over the past years, safety culture and processes have taken a backseat to shiny products.');
  assert.equal(post.author, 'Jan Leike (@janleike)');
  assert.equal(post.date, 'May 17, 2024');
});

test('recognizes social post URLs', () => {
  assert.ok(isXUrl('https://x.com/janleike/status/1791498184671605209'));
  assert.ok(isXUrl('https://twitter.com/sama/status/1'));
  assert.ok(!isXUrl('https://x.com/janleike'));
  assert.ok(isBlueskyUrl('https://bsky.app/profile/someone.bsky.social/post/3kabc'));
});

test('extracts readable text and drops scripts and styles', () => {
  const html = '<html><head><title>Policy &amp; Terms</title><style>p{}</style></head><body><nav>Menu</nav><main><h1>Usage</h1><p>Do not use for <b>weapons</b>.</p><script>track()</script><ul><li>One</li><li>Two</li></ul></main></body></html>';
  assert.equal(pageTitle(html), 'Policy & Terms');
  assert.equal(htmlToText(html), 'Usage\nDo not use for weapons .\n• One\n• Two');
});

test('list items with attributes do not leak markup into the text', () => {
  const html = '<main><ul><li class="menu-item" data-text="Markets">Markets</li><li id="footnote-1">A footnote.</li></ul></main>';
  assert.equal(htmlToText(html), '• Markets\n• A footnote.');
});

test('masks credentials so a snapshot can be committed', () => {
  // Built at runtime so this file holds no credential-shaped string itself.
  const key = 'rubygems_' + 'ab12'.repeat(12);
  const mapbox = 'pk.' + 'eyJ' + 'u'.repeat(20) + '.' + 'v'.repeat(20);
  const { text, count } = redactCredentials(`leaked key ${key} and ${mapbox} here`);
  assert.equal(count, 2);
  assert.equal(text, 'leaked key [credential removed] and [credential removed] here');
  assert.ok(hasCredential(key));
  assert.ok(!hasCredential('rubygems_ is a prefix, and sk-learn is a library'));
});
