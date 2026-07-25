import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
let failures = 0;
const identities = {
  bri: 'bri.bryantjames.com',
  bryant: 'bryantjames.com'
};
const routes = ['', 'work/', 'work/bibleproject/', 'work/eso-market-tracker/', 'work/healthmedocs/', 'contact/'];
for (const [identity, host] of Object.entries(identities)) {
  const base = path.join(root, 'dist', identity);
  const htmlFiles = await walk(base, '.html');
  if (htmlFiles.length !== 6) fail(`${identity}: expected 6 HTML routes, found ${htmlFiles.length}`);
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const executableScripts = [...html.matchAll(/<script(?! type="application\/ld\+json")([^>]*)>/gi)];
    for (const [, attrs] of executableScripts) if (!/src="\/slider-controls\.js"/.test(attrs)) fail(`${file}: unexpected executable JavaScript found`);
    for (const required of ['<title>', 'rel="canonical"', 'property="og:title"', 'application/ld+json', 'name="robots" content="index,follow,max-image-preview:large"']) if (!html.includes(required)) fail(`${file}: missing ${required}`);
    if (/\bnoindex\b|\bnofollow\b/i.test(html)) fail(`${file}: contains a crawl-blocking directive`);
    for (const match of html.matchAll(/href="(\/[^"]*)"/g)) {
      const url = match[1].split('#')[0]; if (!url || /\.[a-z]+$/i.test(url)) continue;
      const target = path.join(base, url, 'index.html');
      try { await stat(target); } catch { fail(`${file}: broken internal link ${url}`); }
    }
  }
  const robots = await readFile(path.join(base, 'robots.txt'), 'utf8');
  if (!robots.includes('User-agent: *') || !robots.includes('Allow: /') || robots.includes('Disallow: /')) fail(`${identity}: robots.txt does not allow crawling`);
  if (!robots.includes(`Sitemap: https://${host}/sitemap.xml`)) fail(`${identity}: robots.txt has the wrong sitemap URL`);
  const sitemap = await readFile(path.join(base, 'sitemap.xml'), 'utf8');
  for (const route of routes) if (!sitemap.includes(`<loc>https://${host}/${route}</loc>`)) fail(`${identity}: sitemap missing /${route}`);
  if ((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length !== routes.length) fail(`${identity}: sitemap lastmod coverage is incomplete`);
}
const bryantFiles = await walk(path.join(root, 'dist', 'bryant'));
for (const file of bryantFiles) if (/\.(html|xml|txt|css)$/.test(file) && /\bBri\b|bri@|bri\.bryantjames/i.test(await readFile(file, 'utf8'))) fail(`Bryant identity leak: ${file}`);
if (failures) process.exit(1);
console.log('Validated both identities: 12 HTML pages, metadata, links, sitemaps, and only the approved slider-control script.');
function fail(message) { failures++; console.error(`FAIL ${message}`); }
async function walk(dir, suffix = '') { const entries = await readdir(dir, { withFileTypes: true }); const files = []; for (const e of entries) { const p = path.join(dir, e.name); if (e.isDirectory()) files.push(...await walk(p, suffix)); else if (!suffix || p.endsWith(suffix)) files.push(p); } return files; }
