// Главный экран: три игры одной цепочкой. Блоки добывают буквы → Эрудит делает из букв вещи →
// Три в ряд играет вещами (цели сгорают) и возвращает буквы. Следующий шаг подсвечен.

import { h, toast } from '../ui/common.js';
import { state, totalLetters, totalWords } from '../state.js';
import { getItem } from '../data/items.js';

const tier1Kinds = () => Object.keys(state.items).filter((id) => state.items[id] > 0 && getItem(id).tier === 1).length;
export const M3_MAX = 100;

export const GAMES = [
  {
    id: 'shooter', title: 'Блоки', emoji: '🎯', flow: '→ L', need: () => null,
    tip: 'Веди пальцем и отпускай. Сбитые блоки с буквами — твои. Лёд колется с первого удара, 💣 взрывает соседей, 🔒 сейф прячет вещь.',
  },
  {
    id: 'erudite', title: 'Эрудит', emoji: 'L', flow: 'L → 🎁',
    need: () => (totalLetters() >= 2 ? null : 'Мало букв — сыграй в Блоки'),
    tip: 'Собери слово из своих букв — оно станет вещью.',
  },
  {
    id: 'match3', title: 'Три в ряд', emoji: '🍬', flow: '🎁 → L',
    need: () => (tier1Kinds() >= 3 ? null : `Нужно 3 разные вещи — собери слова в Эрудите (${tier1Kinds()}/3)`),
    tip: 'Фишки — твои вещи. Собери цели — они сгорят, а взамен придёт редкая вещь-сюрприз и буквы.',
  },
];

// «L» — буква-плитка (эмодзи 🔤 на телефонах рисуется латиницей abc)
export const gameIcon = (e) => (e === 'L' ? h('span.ltr.ltr-big', 'А') : e);
export const flowNodes = (flow) => flow.split(' ').map((t, i) => [i ? ' ' : '', t === 'L' ? h('span.ltr', 'А') : t]);

export function renderGames(root, nav) {
  const letters = totalLetters();
  const kinds = tier1Kinds();
  const lvl = state.progress.match3Level || 1;
  // следующий шаг: мало букв → Блоки, мало вещей → Эрудит, иначе Три в ряд
  const step = letters < 3 ? 'shooter' : kinds < 3 ? 'erudite' : 'match3';
  const sampleL = Object.entries(state.letters).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ch]) => ch);
  const sampleI = Object.keys(state.items).filter((id) => state.items[id] > 0 && getItem(id).tier === 1).slice(-5).map((id) => getItem(id).emoji);

  const row = (g, sub) => {
    const need = g.need();
    return h('button.gm-core-btn' + (step === g.id ? '.now' : '') + (need ? '.lock' : ''), {
      onclick: () => (need ? toast(need, 2600) : nav.openGame(g.id)),
    }, h('span.gm-core-ic', gameIcon(g.emoji)), h('span.gm-core-tx', h('b', g.title), h('span', sub)),
    h('span.gm-core-go', need ? '🔒' : step === g.id ? 'Играть' : '→'));
  };
  const mid = (chips, text) => h('div.gm-core-mid', h('span.gm-core-arr', '↓'), h('span.gm-core-ltrs', ...chips), h('span.gm-core-n', text));

  root.replaceChildren(h('div.screen.gm-screen',
    h('div.gm-core',
      h('div.gm-core-t', h('b', 'Слова'), h('i', 'становятся вещами')),
      row(GAMES[0], totalWords() ? 'Буквы · собери слово из Словаря ★' : 'Сбивай блоки — добывай буквы'),
      mid((sampleL.length ? sampleL : ['А', 'О', 'К']).map((ch) => h('span.ltr', ch)), `${letters} ${plural(letters, 'буква', 'буквы', 'букв')}`),
      row(GAMES[1], 'Собери слово — получи вещь-картинку'),
      mid(sampleI.length ? sampleI.map((e) => h('span.gm-core-em', e)) : [h('span.gm-core-em', '🎁')], `${kinds} ${plural(kinds, 'вещь', 'вещи', 'вещей')}` + (totalWords() ? ` · 📖 ${totalWords()} ${plural(totalWords(), 'слово', 'слова', 'слов')}` : '')),
      row(GAMES[2], `Уровень ${Math.min(lvl, M3_MAX)} из ${M3_MAX} · вещи — фишки`),
      h('div.gm-core-mid', h('span.gm-core-arr', '↺'), h('span.gm-core-n', 'победа: редкая вещь-сюрприз и новые буквы')),
    ),
  ));
}

const plural = (n, a, b, c) => { const m = n % 10, m2 = n % 100; return m === 1 && m2 !== 11 ? a : m >= 2 && m <= 4 && (m2 < 12 || m2 > 14) ? b : c; };
