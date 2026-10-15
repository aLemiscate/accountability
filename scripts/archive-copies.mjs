#!/usr/bin/env node
// Copy saved snapshot files into a checkout of the archive repository.
//
//   npm run archive-copies -- <archive checkout> [--dry-run]
//
// The raw page copies (page.html, screenshots, PDFs, post images) are too big
// to keep in this repository, so .gitignore leaves them out of snapshots/ and
// they live in the archive repository (data/site.yaml `archive`) under the same
// paths. Text files and meta.json stay here too, for the quote check.
//
// This copies every file under snapshots/ that the archive's HEAD doesn't have
// yet, text and meta included, so each folder there is complete. It reads what
// the archive holds from git, so a blobless, sparse checkout (as the Capture and
// Watch workflows use) is enough. It doesn't commit; the caller does, with
// `git add --sparse snapshots`.
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const target = args.find((a) => !a.startsWith('--'));
if (!target || !existsSync(path.join(target, '.git'))) {
  console.error('usage: npm run archive-copies -- <checkout of the archive repository> [--dry-run]');
  process.exit(1);
}

/** Files the archive already holds, as paths like snapshots/<dir>/<file>. */
function archived(dir) {
  try {
    const out = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', 'snapshots'], { cwd: dir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return new Set(out.split('\n').filter(Boolean));
  } catch {
    return new Set(); // an empty repository has no HEAD yet
  }
}

const have = archived(target);
const snapDir = path.join(ROOT, 'snapshots');
let files = 0;
const folders = new Set();
for (const d of (await readdir(snapDir, { withFileTypes: true })).filter((x) => x.isDirectory())) {
  for (const f of (await readdir(path.join(snapDir, d.name), { withFileTypes: true })).filter((x) => x.isFile())) {
    const rel = `snapshots/${d.name}/${f.name}`;
    if (have.has(rel)) continue;
    files++;
    folders.add(d.name);
    if (dryRun) continue;
    await mkdir(path.join(target, 'snapshots', d.name), { recursive: true });
    await copyFile(path.join(ROOT, rel), path.join(target, rel));
  }
}
console.log(`${dryRun ? 'Would copy' : 'Copied'} ${files} file(s) from ${folders.size} snapshot folder(s) to ${target}`);
