// Сборка архива для Яндекс Игр: node tools/build-yandex.mjs
// Кладёт в build/yandex только игру (index.html + src), убирает PWA (манифест, service worker),
// подключает SDK Яндекса относительным путём /sdk.js и упаковывает всё в build/yandex-games.zip.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'build', 'yandex');
const ZIP = join(ROOT, 'build', 'yandex-games.zip');
const SKIP = new Set(['CONTRACT.md']);

rmSync(OUT, { recursive: true, force: true });
rmSync(ZIP, { force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'src'), join(OUT, 'src'), { recursive: true, filter: (p) => !SKIP.has(p.split('/').pop()) });

let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const drop = [
  /\s*<link rel="manifest"[^>]*>/,
  /\s*<link rel="icon"[^>]*>/,
  /\s*<link rel="apple-touch-icon"[^>]*>/,
  /\s*<meta name="apple-mobile-web-app-[^>]*>/g,
  /\s*<meta name="mobile-web-app-capable"[^>]*>/,
  /\s*<script>\s*if \('serviceWorker'[\s\S]*?<\/script>/,
];
for (const re of drop) html = html.replace(re, '');
if (/serviceWorker|manifest|googleapis/.test(html)) throw new Error('index.html: осталась PWA-обвязка или внешние шрифты');
// SDK — до кода игры; YaGames.init вызывает src/platform.js
html = html.replace('<script type="module" src="src/main.js"></script>', '<script src="/sdk.js"></script>\n  <script type="module" src="src/main.js"></script>');
if (!html.includes('/sdk.js')) throw new Error('index.html: не удалось вставить SDK');
writeFileSync(join(OUT, 'index.html'), html);

// проверки Яндекса: латиница без пробелов в именах, никаких внешних адресов в коде
let size = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = relative(OUT, p);
    if (!/^[A-Za-z0-9._\-/]+$/.test(rel)) throw new Error('Имя файла не подходит для Яндекс Игр: ' + rel);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    size += statSync(p).size;
    if (/\.(js|css|html)$/.test(name)) {
      const text = readFileSync(p, 'utf8');
      const ext = text.match(/https?:\/\/[^\s'"`)]+/g)?.filter((u) => !u.startsWith('http://www.w3.org'));
      if (ext?.length) throw new Error(`${rel}: внешние адреса ${ext.join(', ')}`);
    }
  }
};
walk(OUT);

execFileSync('zip', ['-qr', ZIP, '.'], { cwd: OUT });
console.log(`Готово: ${relative(ROOT, ZIP)} — ${(statSync(ZIP).size / 1e6).toFixed(2)} МБ (распаковано ${(size / 1e6).toFixed(2)} МБ)`);
if (!existsSync(ZIP)) process.exit(1);
