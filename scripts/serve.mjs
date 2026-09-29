#!/usr/bin/env node
// Serve the site locally: npm run serve  →  http://localhost:4173
// (Opening site/index.html directly from disk also works.)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' };
const siteDir = path.join(ROOT, 'site');
const port = Number(process.env.PORT || 4173);

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(siteDir, urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath);
  if (!file.startsWith(siteDir)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`Said / Did at http://localhost:${port}  (run "npm run build" after editing entries)`));
