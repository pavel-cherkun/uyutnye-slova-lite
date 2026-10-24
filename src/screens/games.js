// Главный экран: три игры одной цепочкой. Блоки добывают буквы → Эрудит делает из букв вещи →
// Три в ряд играет вещами (цели сгорают) и возвращает буквы. Следующий шаг подсвечен.

import { h, toast, itemPic, modal } from '../ui/common.js';
import { state, totalLetters, totalWords, commit } from '../state.js';
import { getItem } from '../data/items.js';

const tier1Kinds = () => Object.keys(state.items).filter((id) => state.items[id] > 0 && getItem(id).tier === 1).length;
export const M3_MAX = 100;

export const GAMES = [
  {
    id: 'shooter', title: 'Блоки', emoji: '🎯', flow: '→ L', need: () => null,
    tip: 'Веди пальцем и отпускай. Сбитые блоки с буквами — твои. Лёд колется с первого удара, 💣 взрывает соседей, 🔒 сейф прячет вещь.',
  },
  {
    id: 'erudite', title: 'Составь слово', emoji: 'L', flow: 'L → 🎁',
    need: () => (totalLetters() >= 2 ? null : 'Мало букв — сыграй в Блоки'),
    tip: 'Собери слово из своих букв — оно станет вещью.',
  },
  {
    id: 'match3', title: 'Три в ряд', emoji: '🍬', flow: '🎁 → L',
    need: () => (tier1Kinds() >= 3 ? null : `Нужно 3 разные вещи — составь слова из букв (${tier1Kinds()}/3)`),
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
  // следующий шаг: сначала Блоки (и когда мало букв) → Составь слово, пока нет 3 вещей → Три в ряд
  const plays = state.stats.plays || {};
  const step = !plays.shooter || letters < 3 ? 'shooter' : kinds < 3 ? 'erudite' : 'match3';
  const learning = !plays.match3; // пока не сыграли в Три в ряд — подсказываем шаги
  const sampleL = Object.entries(state.letters).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ch]) => ch);
  const sampleI = Object.keys(state.items).filter((id) => state.items[id] > 0 && getItem(id).tier === 1).slice(-5).map((id) => getItem(id));

  const row = (g, sub, num) => {
    const need = g.need();
    const now = step === g.id;
    return h('button.gm-core-btn' + (step === g.id ? '.now' : '') + (need ? '.lock' : ''), {
      onclick: () => (need ? toast(need, 2600) : nav.openGame(g.id)),
    }, h('span.gm-core-ic', gameIcon(g.emoji), learning ? h('i.gm-num', String(num)) : null), h('span.gm-core-tx', h('b', g.title), h('span', sub)),
    h('span.gm-core-go', need ? '🔒' : now ? 'Играть' : '→'),
    learning && now ? h('span.gm-finger', '👆') : null);
  };
  const mid = (chips, text) => h('div.gm-core-mid', h('span.gm-core-arr', '↓'), h('span.gm-core-ltrs', ...chips), h('span.gm-core-n', text));

  root.replaceChildren(h('div.screen.gm-screen',
    h('div.gm-core',
      h('div.gm-core-t', h('b', 'Добывай буквы'), h('i', 'собирай слова')),
      learning ? stepCard(step, kinds) : null,
      row(GAMES[0], totalWords() ? 'Буквы · собери слово из Словаря ★' : 'Сбивай блоки — добывай буквы', 1),
      mid((sampleL.length ? sampleL : ['А', 'О', 'К']).map((ch) => h('span.ltr', ch)), `${letters} ${plural(letters, 'буква', 'буквы', 'букв')}`),
      row(GAMES[1], 'Составь слово — получи вещь-картинку', 2),
      mid(sampleI.length ? sampleI.map((it) => h('span.gm-core-em', itemPic(it))) : [h('span.gm-core-em', '🎁')], `${kinds} ${plural(kinds, 'вещь', 'вещи', 'вещей')}` + (totalWords() ? ` · 📖 ${totalWords()} ${plural(totalWords(), 'слово', 'слова', 'слов')}` : '')),
      row(GAMES[2], `Уровень ${Math.min(lvl, M3_MAX)} из ${M3_MAX} · вещи — фишки`, 3),
      h('div.gm-core-mid', h('span.gm-core-arr', '↺'), h('span.gm-core-n', 'победа: редкая вещь-сюрприз и новые буквы')),
    ),
  ));
}

// Подсказка «что делать сейчас» для новичка
function stepCard(step, kinds) {
  const S = {
    shooter: ['1', 'Сыграй в Блоки', 'Сбивай блоки с буквами — буквы останутся у тебя'],
    erudite: ['2', 'Составь слова из букв', `Каждое слово станет вещью. Нужно 3 разные вещи: ${kinds}/3`],
    match3: ['3', 'Играй в Три в ряд', 'Твои вещи стали фишками. Пройди уровень — получишь редкую вещь'],
  }[step];
  return h('div.gm-step', h('span.gm-step-n', S[0]), h('span.gm-step-tx', h('b', `Шаг ${S[0]} из 3 · ${S[1]}`), h('span', S[2])));
}

/** Окно «Как играть» при первом входе */
export function maybeWelcome(nav) {
  if (state.progress.welcomeSeen) return;
  let m;
  const line = (n, ic, b, t) => h('div.wl-row', h('span.wl-n', n), h('span.wl-ic', ic), h('span.wl-tx', h('b', b), h('span', t)));
  m = modal([
    h('div.modal-title', 'Как играть'),
    line('1', '🎯', 'Блоки', 'Сбивай блоки — добывай буквы'),
    h('div.wl-arr', '↓'),
    line('2', h('span.ltr', 'А'), 'Составь слово', 'Из букв — слова, слова становятся вещами'),
    h('div.wl-arr', '↓'),
    line('3', '🍬', 'Три в ряд', 'Когда будет 3 вещи — играй ими как фишками'),
    h('button.btn.btn-big', { onclick: () => { m.close(); nav.openGame('shooter'); } }, 'Начать с Блоков'),
  ], { onClose: () => { state.progress.welcomeSeen = true; commit(); } });
}

const plural = (n, a, b, c) => { const m = n % 10, m2 = n % 100; return m === 1 && m2 !== 11 ? a : m >= 2 && m <= 4 && (m2 < 12 || m2 > 14) ? b : c; };
