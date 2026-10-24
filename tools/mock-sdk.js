// Заглушка SDK Яндекс Игр для локальной проверки сборки (в архив не попадает).
// Пишет все вызовы в window.__ya.log; реклама «показывается» 300 мс.
(() => {
  const log = [];
  const handlers = {};
  const data = {};
  window.__ya = { log, data, fire: (ev) => (handlers[ev] || []).forEach((f) => f()) };
  const ad = (kind, cb, reward) => {
    log.push(kind);
    cb.onOpen && cb.onOpen();
    setTimeout(() => { if (reward) cb.onRewarded && cb.onRewarded(); cb.onClose && cb.onClose(true); }, 300);
  };
  window.YaGames = {
    init: async () => {
      log.push('init');
      return {
        environment: { i18n: { lang: 'ru' } },
        on: (ev, fn) => { (handlers[ev] ||= []).push(fn); log.push('on:' + ev); },
        features: {
          LoadingAPI: { ready: () => log.push('ready') },
          GameplayAPI: { start: () => log.push('start'), stop: () => log.push('stop') },
        },
        adv: {
          showFullscreenAdv: ({ callbacks }) => ad('fullscreen', callbacks),
          showRewardedVideo: ({ callbacks }) => ad('rewarded', callbacks, true),
        },
        getPlayer: async () => ({
          getData: async () => { log.push('getData'); return { ...data }; },
          setData: async (d, flush) => { log.push('setData' + (flush ? ':flush' : '')); Object.assign(data, d); },
        }),
      };
    },
  };
})();
