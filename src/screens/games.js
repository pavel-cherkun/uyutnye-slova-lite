// Главный экран: три игры одной цепочкой. Блоки добывают буквы → Эрудит делает из букв вещи →
// Три в ряд играет вещами (цели сгорают) и возвращает буквы. Следующий шаг подсвечен.

import { h, toast, modal } from '../ui/common.js';
import { state, totalLetters, commit } from '../state.js';
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
  const lvl = Math.min(state.progress.match3Level || 1, M3_MAX);
  // следующий шаг: сначала Блоки (и когда мало букв) → Составь слово, пока нет 3 вещей → Три в ряд
  const plays = state.stats.plays || {};
  const step = !plays.shooter || letters < 3 ? 'shooter' : kinds < 3 ? 'erudite' : 'match3';
  const learning = !plays.match3; // пока не сыграли в Три в ряд — номера шагов и палец

  // одна строка под названием: только то, что важно сейчас
  const status = {
    shooter: `${letters} ${plural(letters, 'буква', 'буквы', 'букв')}`,
    erudite: `${kinds} ${plural(kinds, 'вещь', 'вещи', 'вещей')}`,
    match3: kinds < 3 ? `нужно 3 вещи · ${kinds}/3` : `уровень ${lvl}`,
  };
  const row = (g, num) => {
    const need = g.need();
    const now = step === g.id;
    return h('button.gm-core-btn' + (now ? '.now' : '') + (need ? '.lock' : ''), {
      onclick: () => (need ? toast(need, 2600) : nav.openGame(g.id)),
    }, h('span.gm-core-ic', gameIcon(g.emoji), learning ? h('i.gm-num', String(num)) : null),
    h('span.gm-core-tx', h('b', g.title), h('span', status[g.id])),
    h('span.gm-core-go', need ? '🔒' : '▶'),
    learning && now ? h('span.gm-finger', '👆') : null);
  };

  root.replaceChildren(h('div.screen.gm-screen',
    h('div.gm-core',
      h('div.gm-core-t', h('b', 'Добывай буквы'), h('i', 'собирай слова')),
      row(GAMES[0], 1),
      h('div.gm-core-arr', '↓'),
      row(GAMES[1], 2),
      h('div.gm-core-arr', '↓'),
      row(GAMES[2], 3),
    ),
  ));
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
