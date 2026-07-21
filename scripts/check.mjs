import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
for (const identity of ['bri', 'bryant']) {
  const base = path.join(root, 'dist', identity);
  const htmlFiles = await walk(base, '.html');
  if (htmlFiles.length !== 6) fail(`${identity}: expected 6 HTML routes, found ${htmlFiles.length}`);
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    if (/<script(?! type="application\/ld\+json")/i.test(html)) fail(`${file}: executable JavaScript found`);
    for (const required of ['<title>', 'rel="canonical"', 'property="og:title"', 'application/ld+json']) if (!html.includes(required)) fail(`${file}: missing ${required}`);
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      const url = match[1].split('#')[0]; if (!url || /\.[a-z]+$/i.test(url)) continue;
      const target = path.join(base, url, 'index.html');
      try { await stat(target); } catch { fail(`${file}: broken internal link ${url}`); }
    }
  }
  for (const file of ['robots.txt', 'sitemap.xml']) try { await stat(path.join(base, file)); } catch { fail(`${identity}: missing ${file}`); }
}
const bryantFiles = await walk(path.join(root, 'dist', 'bryant'));
for (const file of bryantFiles) if (/\.(html|xml|txt|css)$/.test(file) && /\bBri\b|bri@|bri\.bryantjames/i.test(await readFile(file, 'utf8'))) fail(`Bryant identity leak: ${file}`);
if (failures) process.exit(1);
console.log('Validated both identities: 12 HTML pages, metadata, links, sitemaps, and zero executable JavaScript.');
function fail(message) { failures++; console.error(`FAIL ${message}`); }
async function walk(dir, suffix = '') { const entries = await readdir(dir, { withFileTypes: true }); const files = []; for (const e of entries) { const p = path.join(dir, e.name); if (e.isDirectory()) files.push(...await walk(p, suffix)); else if (!suffix || p.endsWith(suffix)) files.push(p); } return files; }
