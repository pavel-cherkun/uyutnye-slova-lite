// Мини-сервер для разработки: node serve.mjs → http://localhost:8765
// SERVE_ROOT=build/yandex MOCK_SDK=1 — проверить сборку для Яндекс Игр с заглушкой SDK (tools/mock-sdk.js)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = process.env.SERVE_ROOT ? resolve(HERE, process.env.SERVE_ROOT) + '/' : HERE;
const PORT = Number(process.env.PORT) || 8765;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };

http.createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = process.env.MOCK_SDK && path === '/sdk.js' ? join(HERE, 'tools/mock-sdk.js') : normalize(join(ROOT, path));
  if (!file.startsWith(ROOT) && !file.startsWith(HERE)) { res.writeHead(403); return res.end(); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': (TYPES[extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
