// Точка входа: шапка (буквы и вещи), главный экран из трёх игр, запуск мини-игр.

import * as store from './state.js';
import { state, subscribe, totalLetters, totalItems } from './state.js';
import { h, toast, showReward, modal } from './ui/common.js';
import { renderGames, GAMES, gameIcon, flowNodes } from './screens/games.js';
import { lettersModal, itemsModal } from './screens/inventory.js';
import { openSettings, maybeIosHint } from './screens/settings.js';
import { loadDict } from './data/dict.js';
import { setupDevice } from './ui/device.js';
import { syncLetters } from './progression.js';
import { hold } from './ui/fx.js';

const app = document.getElementById('app');
let hudEl, screenEl;
let gameOpen = false;
const nav = { openGame, refresh, go: refresh };

function boot() {
  hudEl = h('div.hud');
  screenEl = h('div', { style: { display: 'contents' } });
  app.replaceChildren(hudEl, screenEl);
  renderHud();
  refresh();
  setTimeout(maybeIosHint, 600);
}

// Шапка строится один раз, дальше меняются только числа (иначе кнопки пересоздаются под пальцем)
let hudRefs = null;
let prevHud = {};
function renderHud() {
  if (!hudEl) return;
  const vals = { letters: totalLetters(), items: totalItems() };
  if (!hudRefs) {
    const pill = (k, ic, label, onclick) => {
      const num = h('span.hud-num', '');
      const el = h('button.hud-pill.hud-big', { 'data-k': k, onclick }, ic, num, h('span.hud-lbl', label));
      return { el, num };
    };
    const pills = {
      letters: pill('letters', h('span.ltr', 'А'), 'буквы', lettersModal),
      items: pill('items', h('span.ic', '🎁'), 'вещи', itemsModal),
    };
    hudEl.replaceChildren(
      h('div.hud-res', pills.letters.el, pills.items.el),
      h('button.hud-gear', { onclick: openSettings, 'aria-label': 'Настройки' }, '⚙️'),
    );
    hudRefs = { pills };
  }
  for (const [k, ref] of Object.entries(hudRefs.pills)) {
    if (ref.num.textContent !== String(vals[k])) {
      ref.num.textContent = vals[k];
      if (prevHud[k] != null) { ref.el.classList.remove('bump'); void ref.el.offsetWidth; ref.el.classList.add('bump'); }
    }
  }
  prevHud = vals;
}

function refresh() {
  if (!screenEl) return;
  renderGames(screenEl, nav);
}

// обновления после сохранений — не чаще раза в кадр
let hudQueued = false;
subscribe(() => {
  if (hudQueued) return;
  hudQueued = true;
  requestAnimationFrame(() => { hudQueued = false; renderHud(); });
});

async function openGame(id) {
  const g = GAMES.find((x) => x.id === id);
  if (!g || gameOpen) return;
  const need = g.need();
  if (need) { toast(need, 2600); return; }
  let mod;
  try {
    mod = await import(`./games/${id}.js`);
  } catch (e) {
    console.error(e);
    toast('Не удалось загрузить игру');
    return;
  }
  // правила — одной фразой при первом запуске
  const seen = (state.progress.tipsSeen ||= []);
  if (!seen.includes(id) && g.tip) {
    const go = await new Promise((resolve) => {
      let started = false;
      const m = modal([
        h('div.hm-big', gameIcon(g.emoji)),
        h('div.modal-title', g.title),
        h('div.tip-flow', flowNodes(g.flow)),
        h('div.center', g.tip),
        h('button.btn.btn-big', { onclick: () => { started = true; m.close(); resolve(true); } }, 'Играть'),
      ], { onClose: () => { if (!started) resolve(false); } });
    });
    seen.push(id); store.commit();
    if (!go) return;
  }

  gameOpen = true;
  hold(true); // большие окна подождут конца партии
  const layer = h('div#game-layer');
  app.append(layer);
  let cleanup = null;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try { cleanup && cleanup(); } catch (e) { console.error(e); }
    layer.remove();
    gameOpen = false;
    renderHud();
    refresh();
  };
  const ctx = {
    store,
    finish(reward = {}, title = 'Награда') {
      (state.stats.plays ||= {})[id] = (state.stats.plays[id] || 0) + 1;
      store.applyReward(reward);
      close();
      showReward(title, reward);
      store.commit();
      hold(false);
    },
    exit: () => { close(); hold(false); },
  };
  try {
    cleanup = mod.mount(layer, ctx);
  } catch (e) {
    console.error(e);
    toast('Ошибка в игре: ' + e.message);
    close();
  }
}

setupDevice();
syncLetters();
app.replaceChildren(h('div.splash', h('div.splash-logo', h('span.ltr.ltr-big', 'А')), h('div.splash-text', 'Раскладываем буквы…')));
loadDict().then(boot);
