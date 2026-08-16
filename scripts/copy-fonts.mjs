/**
 * Copies the three woff2 files out of node_modules into public/fonts/.
 *
 * Astro fingerprints assets imported through the bundler, which makes their URLs
 * unknowable at the time you need to write <link rel="preload">. These three
 * faces all set above-the-fold content, so they must be preloaded, so their URLs
 * must be stable. Hence a copy and a hand-written @font-face block.
 *
 * Only the basic `latin` subset ships. U+02BB and U+02BC — the turned comma in
 * oʻ/gʻ and the tutuq belgisi — live in `latin`, NOT in `latin-ext`, so Uzbek
 * needs no extra file. (Checking latin-ext for them returns a false negative.)
 */
import { mkdir, copyFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'public/fonts');
await mkdir(dest, { recursive: true });

const FILES = [
  ['@fontsource-variable/ibm-plex-sans', 'ibm-plex-sans-latin-wght-normal.woff2'],
  ['@fontsource-variable/ibm-plex-sans', 'ibm-plex-sans-latin-wght-italic.woff2'],
  ['@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2'],
  ['@fontsource/young-serif', 'young-serif-latin-400-normal.woff2'],
];

let total = 0;
for (const [pkg, file] of FILES) {
  const from = path.join(root, 'node_modules', pkg, 'files', file);
  const to = path.join(dest, file);
  await copyFile(from, to);
  const { size } = await stat(to);
  total += size;
  console.log(`[fonts] ${file.padEnd(46)} ${(size / 1024).toFixed(0)}kB`);
}
console.log(`[fonts] ${(total / 1024).toFixed(0)}kB total (${FILES.length} files)`);
