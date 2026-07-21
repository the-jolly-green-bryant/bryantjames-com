import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..', 'dist', process.argv[2] || 'bri');
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => { try { let file = path.join(root, decodeURIComponent(req.url.split('?')[0])); if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); const data = await readFile(file); res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.css') ? 'text/css' : file.endsWith('.webp') ? 'image/webp' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/plain'); res.end(data); } catch { res.statusCode = 404; res.end('Not found'); } }).listen(port, () => console.log(`Previewing ${root} at http://localhost:${port}`));
