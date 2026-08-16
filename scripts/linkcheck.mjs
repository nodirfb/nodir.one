import fs from 'node:fs';
import path from 'node:path';
const pages = new Set(), hrefs = new Map();
const walk = (d, fn) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name); f.isDirectory() ? walk(p, fn) : fn(p, f.name); } };
walk('dist', (p, n) => { if (n === 'index.html') {
  const rel = path.relative('dist', path.dirname(p)).split(path.sep).filter(Boolean).join('/');
  pages.add(rel ? `/${rel}/` : '/'); } });
walk('dist', (p, n) => { if (n.endsWith('.html'))
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/href="(\/[^"#]*)"/g))
    hrefs.set(m[1], (hrefs.get(m[1]) ?? 0) + 1); });
console.log('built pages :', [...pages].sort().join('  '));
const bad = [...hrefs.keys()].filter((h) => !path.extname(h) && !pages.has(h));
console.log(bad.length ? 'BROKEN      : ' + bad.join('  ') : 'no broken internal page links');
