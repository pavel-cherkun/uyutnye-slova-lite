// Платформа: Яндекс Игры (SDK подключает сборка tools/build-yandex.mjs) или обычный браузер.
// Вне Яндекса всё работает как заглушка: рекламы нет, облака нет.

let ysdk = null;
let player = null;
let inGame = false;      // идёт мини-игра (для разметки геймплея)
let paused = false;      // платформа попросила паузу (реклама, вкладка)
const pauseFns = new Set();

export const isYandex = () => !!ysdk;
export const hasAds = () => !!ysdk;

/** Подписка на паузу/возобновление от платформы: fn(true) — пауза, fn(false) — дальше */
export function onPause(fn) { pauseFns.add(fn); return () => pauseFns.delete(fn); }
const setPaused = (p) => {
  if (paused === p) return;
  paused = p;
  for (const fn of pauseFns) { try { fn(p); } catch (e) { console.error(e); } }
};

export async function initPlatform() {
  if (!window.YaGames) return;
  try {
    ysdk = await window.YaGames.init();
  } catch (e) {
    console.warn('YaGames.init', e);
    ysdk = null;
    return;
  }
  // язык определяем через SDK; игра на русском, для остальных — тоже русский словарь
  const lang = ysdk.environment?.i18n?.lang || 'ru';
  document.documentElement.lang = lang;
  ysdk.on?.('game_api_pause', () => { gameplayStop(); setPaused(true); });
  ysdk.on?.('game_api_resume', () => { setPaused(false); if (inGame) gameplayStart(); });
  try { player = await ysdk.getPlayer({ scopes: false }); } catch { player = null; }
}

/** Игра загружена и готова к действиям игрока */
export function gameReady() {
  try { ysdk?.features?.LoadingAPI?.ready(); } catch (e) { console.warn(e); }
}

export function gameplayStart() { try { ysdk?.features?.GameplayAPI?.start(); } catch { /* нет */ } }
export function gameplayStop() { try { ysdk?.features?.GameplayAPI?.stop(); } catch { /* нет */ } }
export function enterGame() { inGame = true; gameplayStart(); }
export function leaveGame() { inGame = false; gameplayStop(); }

// звук и игра на паузе, пока вкладка скрыта
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { gameplayStop(); setPaused(true); }
  else { setPaused(false); if (inGame) gameplayStart(); }
});

/** Полноэкранная реклама в логической паузе (частоту ограничивает платформа). Всегда завершается. */
export function showInterstitial() {
  if (!ysdk) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const end = () => { if (done) return; done = true; setPaused(false); resolve(); };
    try {
      ysdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: () => setPaused(true),
          onClose: end,
          onError: end,
          onOffline: end,
        },
      });
    } catch { end(); }
    setTimeout(end, 60000); // страховка: игра не должна зависнуть
  });
}

/** Реклама за награду. Возвращает true, если награду нужно выдать. */
export function showRewarded() {
  if (!ysdk) return Promise.resolve(false);
  return new Promise((resolve) => {
    let rewarded = false;
    let done = false;
    const end = () => { if (done) return; done = true; setPaused(false); resolve(rewarded); };
    try {
      ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => setPaused(true),
          onRewarded: () => { rewarded = true; },
          onClose: end,
          onError: end,
        },
      });
    } catch { end(); }
  });
}

// ---------- Облачные сохранения ----------
const CLOUD_LIMIT = 190000; // у Яндекса 200 КБ на игрока

/** Сохранение из облака (или null) */
export async function cloudLoad() {
  if (!player) return null;
  try {
    const data = await player.getData(['save']);
    return data && data.save ? JSON.parse(data.save) : null;
  } catch (e) {
    console.warn('cloudLoad', e);
    return null;
  }
}

let cloudTimer = null;
let cloudJson = null;
function cloudPush(flush) {
  clearTimeout(cloudTimer);
  cloudTimer = null;
  if (!player || !cloudJson) return;
  const json = cloudJson;
  cloudJson = null;
  player.setData({ save: json }, flush).catch((e) => console.warn('cloudSave', e));
}

/** Отложенная отправка в облако (не чаще раза в 15 с; сразу — при сворачивании) */
export function cloudSave(state) {
  if (!player) return;
  let json = JSON.stringify(state);
  // рисунки тяжёлые: если не влезают, в облако идёт сохранение без них (локально они остаются)
  if (json.length > CLOUD_LIMIT) json = JSON.stringify({ ...state, drawings: {} });
  if (json.length > CLOUD_LIMIT) return;
  cloudJson = json;
  if (!cloudTimer) cloudTimer = setTimeout(() => cloudPush(false), 15000);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cloudPush(true); });
addEventListener('pagehide', () => cloudPush(true));
