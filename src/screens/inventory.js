// Инвентари: буквы (открываются из шапки и в Эрудите) и вещи (из шапки и в Три в ряд).

import { h, modal } from '../ui/common.js';
import { state } from '../state.js';
import { getItem, CATEGORIES, RARITY } from '../data/items.js';
import { ALPHABET, isLetterOpen } from '../data/letters.js';

export function lettersModal() {
  let m;
  const cells = ALPHABET.filter((ch) => ch !== 'Ъ' || state.letters[ch]).map((ch) => {
    const n = state.letters[ch] || 0;
    const open = isLetterOpen(ch);
    return h('div.inv-l' + (n ? '' : '.zero') + (open ? '' : '.closed'), h('span.tile', ch), h('small', open ? '×' + n : '🔒'));
  });
  m = modal([
    h('div.modal-title', 'Мои буквы'),
    h('div.inv-sub', 'Буквы дают Блоки и победы в Три в ряд. Новые буквы алфавита открываются словами.'),
    h('div.inv-lgrid', ...cells),
    h('button.btn', { onclick: () => m.close() }, 'Готово'),
  ]);
  m.el.classList.add('inv-box');
}

export function itemsModal() {
  let m;
  const ids = Object.keys(state.items).filter((id) => state.items[id] > 0 && getItem(id).tier === 1);
  const byCat = {};
  for (const id of ids) (byCat[getItem(id).cat] ||= []).push(id);
  const groups = Object.keys(CATEGORIES).filter((c) => byCat[c]).map((c) => h('div.inv-g',
    h('div.inv-gh', CATEGORIES[c].icon + ' ' + CATEGORIES[c].name),
    h('div.inv-igrid', ...byCat[c].sort((a, b) => getItem(a).word.localeCompare(getItem(b).word)).map((id) => {
      const it = getItem(id);
      return h('div.inv-i', { style: { '--rar': RARITY[it.rarity].color } }, h('span.inv-e', it.emoji), h('span.inv-w', it.word.toLowerCase()), h('b', '×' + state.items[id]));
    }))));
  m = modal([
    h('div.modal-title', 'Мои вещи'),
    h('div.inv-sub', ids.length ? 'Вещи делаются из слов в Эрудите и становятся фишками в Три в ряд.' : 'Пока пусто — собери слово в Эрудите.'),
    h('div.inv-list', ...groups),
    h('button.btn', { onclick: () => m.close() }, 'Готово'),
  ]);
  m.el.classList.add('inv-box');
}

const CSS = `
.inv-box { max-height: 90vh; overflow-y: auto; }
.inv-box > * { flex-shrink: 0; }
.inv-sub { text-align: center; font-weight: 700; font-size: 13px; color: var(--ink-soft); margin: -4px 0 12px; }
.inv-lgrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px 4px; margin-bottom: 14px; }
.inv-l { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.inv-l small { font-weight: 900; font-size: 11px; }
.inv-l.zero .tile { opacity: .35; }
.inv-l.closed .tile { filter: grayscale(1); opacity: .25; }
.inv-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.inv-gh { font-weight: 900; font-size: 14px; margin-bottom: 6px; }
.inv-igrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.inv-i { position: relative; display: flex; flex-direction: column; align-items: center; background: var(--card-soft, #f3f2ec); border-radius: 16px; padding: 6px 2px;
  box-shadow: inset 0 0 0 2px var(--rar); }
.inv-e { font-size: 28px; line-height: 1.1; }
.inv-w { font-size: 10px; font-weight: 800; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inv-i b { position: absolute; top: -4px; right: -2px; background: #111; color: #fff; border-radius: 99px; font-size: 10px; padding: 1px 5px; }
`;
document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }));
