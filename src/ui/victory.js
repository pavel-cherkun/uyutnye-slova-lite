// Долгая победа: заголовок → звёзды по одной → буквы счётчиком → сундук трясётся и открывается
// → вещь-сюрприз → полоска главы заполняется → кнопки. Тап по экрану — промотать анимацию.
// И короткая неудача: «Почти!» и одна большая кнопка «Ещё раз».

import { h, confetti, itemPic } from './common.js';
import { getItem, RARITY } from '../data/items.js';
import { sfx, buzz } from './device.js';

/** Переменная награда: примерно каждая пятая победа — сюрприз сверху */
export function rollLucky() {
  const r = Math.random();
  if (r < 0.12) return { kind: 'x2', text: '🍀 Удача! Буквы ×2' };
  if (r < 0.2) return { kind: 'gold', text: '✨ Золотой сундук!' };
  return null;
}

/** Звёзды по запасу: сколько ходов осталось от общего числа */
export const starsFor = (left, total) => (left / total >= 0.4 ? 3 : left / total >= 0.15 ? 2 : 1);

/**
 * opts: { title, stars, letters: 'АБВ', items: {id: n}, isNew: Set, lucky, chapter: {label, from, to, max}, buttons: [{label, primary, onclick}] }
 */
export function celebrate(opts) {
  const back = h('div.vc-back', h('div.vc-rays'));
  const box = h('div.vc-box');
  back.append(box);
  document.body.append(back);

  let skip = false;
  const timers = [];
  const wait = (ms) => new Promise((r) => { if (skip) return r(); const t = setTimeout(r, ms); timers.push([t, r]); });
  back.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    skip = true;
    for (const [t, r] of timers.splice(0)) { clearTimeout(t); r(); }
  });
  const close = () => { back.classList.add('vc-out'); setTimeout(() => back.remove(), 250); };

  (async () => {
    // 1. заголовок
    sfx('win'); buzz([30, 50, 30]);
    box.append(h('div.vc-title', opts.title));
    const r = box.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + 40, 60);
    await wait(700);

    // 2. звёзды по одной
    const starsEl = h('div.vc-stars', [0, 1, 2].map(() => h('span.vc-star', '★')));
    box.append(starsEl);
    for (let i = 0; i < 3; i++) {
      await wait(380);
      const s = starsEl.children[i];
      if (i < opts.stars) { s.classList.add('on'); sfx('coin'); buzz(15); } else s.classList.add('off');
    }
    await wait(350);

    // 3. удача (переменная награда)
    let letters = opts.letters || '';
    let items = { ...(opts.items || {}) };
    if (opts.lucky) {
      box.append(h('div.vc-lucky', opts.lucky.text));
      sfx('reward'); buzz([20, 40, 20, 40, 20]);
      confetti(innerWidth / 2, innerHeight / 2, 50);
      await wait(900);
    }

    // 4. буквы счётчиком
    if (letters.length) {
      const num = h('b', '0');
      box.append(h('div.vc-letters', h('span.ltr', 'А'), '+', num, h('span', ' букв')));
      for (let i = 1; i <= letters.length; i++) {
        num.textContent = String(i);
        if (i % 2) sfx('tap');
        await wait(Math.max(25, 280 / letters.length));
      }
      await wait(300);
    }

    // 5. сундук: трясётся и открывается
    const ids = Object.keys(items);
    if (ids.length) {
      const gold = opts.lucky && opts.lucky.kind === 'gold';
      const chest = h('div.vc-chest' + (gold ? '.gold' : ''), '🎁');
      box.append(chest);
      for (let i = 0; i < 3; i++) {
        await wait(320);
        chest.classList.remove('shake'); void chest.offsetWidth; chest.classList.add('shake');
        sfx('tap'); buzz(10);
      }
      await wait(380);
      chest.remove();
      const cards = h('div.vc-cards');
      box.append(cards);
      for (const id of ids) {
        const it = getItem(id);
        const card = h('div.vc-card.rar-' + it.rarity, { style: { '--rar': RARITY[it.rarity].color } },
          h('div.vc-card-e', itemPic(it)), h('div.vc-card-w', it.word.toLowerCase()),
          h('div.vc-card-r', RARITY[it.rarity].name), opts.isNew && opts.isNew.has(id) ? h('div.vc-new', 'НОВОЕ') : null);
        cards.append(card);
        const big = it.rarity === 'e' || it.rarity === 'l';
        sfx(big ? 'win' : 'reward'); buzz(big ? [30, 50, 30, 50, 60] : [15, 30, 15]);
        const cr = card.getBoundingClientRect();
        confetti(cr.left + cr.width / 2, cr.top + cr.height / 2, big ? 80 : 40);
        await wait(500);
      }
      await wait(300);
    }

    // 6. полоска главы
    if (opts.chapter) {
      const { label, from, to, max } = opts.chapter;
      const fill = h('i', { style: { width: (from / max) * 100 + '%' } });
      const cnt = h('b', `${from}/${max}`);
      box.append(h('div.vc-chap', h('div.vc-chap-t', h('span', label), cnt), h('div.vc-bar', fill)));
      await wait(250);
      fill.style.width = (to / max) * 100 + '%';
      cnt.textContent = `${to}/${max}`;
      sfx('coin');
      await wait(700);
    }

    // 7. кнопки
    box.append(h('div.vc-btns', (opts.buttons || []).map((b) => h('button.btn.btn-big' + (b.primary ? '' : '.btn-ghost'), {
      onclick: () => { close(); b.onclick && b.onclick(); },
    }, b.label))));
  })();

  return { close };
}

/** Короткая неудача: что осталось совсем чуть-чуть и большая кнопка «Ещё раз» */
export function nearMiss({ title = 'Почти!', left, extra = [], onRetry, onMenu }) {
  const back = h('div.vc-back.vc-soft');
  const box = h('div.vc-box.vc-miss',
    h('div.vc-title', title),
    left ? h('div.vc-left', left) : null,
    h('button.btn.btn-big.vc-retry', { onclick: () => { close(); onRetry(); } }, '↺ Ещё раз'),
    ...extra.filter(Boolean).map((b) => h('button.btn.btn-big' + (b.violet ? '.btn-violet' : '.btn-ghost'), { onclick: (e) => { if (b.keep !== true) close(); b.onclick(e); } }, b.label)),
    h('button.vc-menu', { onclick: () => { close(); onMenu(); } }, 'В меню'),
  );
  back.append(box);
  document.body.append(back);
  sfx('error'); buzz([40, 30, 40]);
  const close = () => { back.classList.add('vc-out'); setTimeout(() => back.remove(), 200); };
  return { close };
}

const CSS = `
.vc-back { position:fixed; inset:0; z-index:400; display:flex; align-items:center; justify-content:center; padding:16px;
  background:rgba(12,12,12,.86); animation:vc-in .25s; overflow:hidden; }
.vc-back.vc-soft { background:rgba(12,12,12,.6); }
.vc-back.vc-out { opacity:0; transition:opacity .2s; }
@keyframes vc-in { from { opacity:0; } }
.vc-rays { position:absolute; left:50%; top:42%; width:180vmax; height:180vmax; margin:-90vmax 0 0 -90vmax; pointer-events:none;
  background:repeating-conic-gradient(rgba(200,255,46,.13) 0 10deg, transparent 10deg 20deg); animation:vc-spin 14s linear infinite; }
@keyframes vc-spin { to { transform:rotate(360deg); } }
.vc-box { position:relative; width:100%; max-width:380px; display:flex; flex-direction:column; align-items:center; gap:14px; color:#fff; text-align:center; }
.vc-miss { background:#fff; color:var(--ink); border:3px solid var(--ink); border-radius:28px; padding:20px 16px 14px; box-shadow:0 8px 0 var(--ink);
  animation:vc-pop .35s cubic-bezier(.3,1.6,.6,1); }
.vc-title { font-family:var(--display); font-weight:900; font-size:34px; line-height:1; letter-spacing:-1px; text-transform:uppercase;
  animation:vc-pop .5s cubic-bezier(.3,1.8,.5,1); }
.vc-back:not(.vc-soft) .vc-title { color:var(--lime); text-shadow:0 4px 0 #000; }
@keyframes vc-pop { from { transform:scale(.3) rotate(-6deg); opacity:0; } }
.vc-stars { display:flex; gap:10px; }
.vc-star { font-size:58px; line-height:1; color:#333; transform:scale(.6); transition:transform .3s cubic-bezier(.3,2,.5,1), color .2s; }
.vc-star.on { color:#ffd60a; transform:scale(1.15) rotate(-8deg); text-shadow:0 0 18px rgba(255,214,10,.8); }
.vc-star.on:nth-child(2) { transform:scale(1.35) translateY(-8px); }
.vc-star.off { transform:scale(.9); }
.vc-lucky { font-family:var(--display); font-weight:900; font-size:22px; background:#ffd60a; color:#111; border:3px solid #111; border-radius:16px;
  padding:6px 14px; box-shadow:0 5px 0 #000; transform:rotate(-3deg); animation:vc-pop .45s cubic-bezier(.3,1.8,.5,1); }
.vc-letters { display:flex; align-items:center; gap:6px; font-family:var(--display); font-weight:900; font-size:30px; }
.vc-letters span:last-child { font-size:18px; opacity:.7; }
.vc-chest { font-size:92px; line-height:1; filter:drop-shadow(0 6px 0 #000); animation:vc-pop .4s cubic-bezier(.3,1.8,.5,1); }
.vc-chest.gold { filter:drop-shadow(0 0 22px #ffd60a) drop-shadow(0 6px 0 #000); }
.vc-chest.shake { animation:vc-shake .3s; }
@keyframes vc-shake { 25% { transform:rotate(-12deg) scale(1.08); } 50% { transform:rotate(10deg) scale(1.12); } 75% { transform:rotate(-6deg) scale(1.05); } }
.vc-cards { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
.vc-card { position:relative; width:130px; background:#fff; color:#111; border:3px solid #111; border-radius:22px; padding:12px 8px 10px;
  box-shadow:0 0 0 4px var(--rar), 0 0 34px var(--rar); animation:vc-flip .55s cubic-bezier(.3,1.6,.5,1); }
@keyframes vc-flip { from { transform:rotateY(90deg) scale(.5); } }
.vc-card-e { font-size:62px; line-height:1.1; }
.vc-card-w { font-family:var(--display); font-weight:900; font-size:17px; }
.vc-card-r { display:inline-block; margin-top:4px; font-size:11px; font-weight:900; text-transform:uppercase; background:var(--rar); color:#fff;
  border-radius:99px; padding:2px 8px; }
.vc-new { position:absolute; top:-12px; right:-10px; background:var(--pink, #ff5fa2); color:#fff; font-weight:900; font-size:11px; border:2px solid #111;
  border-radius:99px; padding:2px 7px; transform:rotate(8deg); }
.vc-chap { width:100%; background:#1d1c22; border-radius:18px; padding:10px 12px; }
.vc-chap-t { display:flex; justify-content:space-between; font-weight:800; font-size:13px; margin-bottom:6px; }
.vc-bar { height:14px; background:#2c2b33; border-radius:99px; overflow:hidden; }
.vc-bar i { display:block; height:100%; background:var(--lime); border-radius:99px; transition:width .7s cubic-bezier(.3,1.3,.5,1); }
.vc-btns { width:100%; display:flex; flex-direction:column; gap:10px; animation:vc-pop .35s; }
.vc-left { display:flex; gap:8px; justify-content:center; align-items:center; font-weight:900; font-size:16px; flex-wrap:wrap; }
.vc-retry { font-size:22px !important; background:var(--lime) !important; color:#111 !important; }
.vc-menu { background:none; border:0; font-weight:800; font-size:14px; color:var(--ink-soft); padding:6px; text-decoration:underline; font-family:inherit; }
`;
document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }));
