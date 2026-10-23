// Настройки и установка на экран.

import { h, toast, modal, confirmDialog } from '../ui/common.js';
import { state, commit, resetSave } from '../state.js';
import {
  isIOS, isStandalone, canFullscreen, enterFullscreen, exitFullscreen, canInstall, install,
} from '../ui/device.js';

function toggle(label, key, onChange) {
  const on = !!state.settings[key];
  return h('button.st-row', {
    onclick: () => { state.settings[key] = !on; commit(); onChange && onChange(!on); },
  }, h('span', label), h('span.st-sw' + (on ? '.on' : ''), h('span.st-knob')));
}

export function settingsCard(rerender) {
  const standalone = isStandalone();
  return h('div.card.stack',
    h('b', '⚙️ Настройки'),
    standalone
      ? h('div.small.muted', '📱 Игра запущена как приложение — на весь экран.')
      : canFullscreen
        ? toggle('Полный экран', 'fullscreen', (on) => { on ? enterFullscreen() : exitFullscreen(); rerender(); })
        : null,
    toggle('Звуки', 'sound', rerender),
    toggle('Вибрация', 'vibro', rerender),
    !standalone ? installBlock() : null,
  );
}

function installBlock() {
  if (canInstall()) {
    return h('button.btn.btn-violet.btn-sm', {
      onclick: async () => { if (await install()) toast('Игра на экране «Домой» 🎉'); },
    }, '📲 Установить на экран «Домой»');
  }
  if (isIOS && !canFullscreen) {
    return h('div.st-hint',
      h('b', '📲 Как играть на весь экран на iPhone'),
      h('div', 'Нажми «Поделиться» ⬆️ внизу Safari → «На экран „Домой“». Игра откроется как приложение, без адресной строки, и прогресс будет храниться надёжнее.'),
    );
  }
  return null;
}

/** Одноразовая подсказка про установку на iPhone (там полноэкранного режима в браузере нет) */
export function maybeIosHint() {
  if (!isIOS || canFullscreen || isStandalone() || state.progress.iosHintShown) return;
  state.progress.iosHintShown = true;
  commit();
  const m = modal([
    h('div.hm-big', '📲'),
    h('div.modal-title', 'Играть на весь экран'),
    h('div.center', 'На iPhone игра открывается на весь экран, если добавить её на экран «Домой»: «Поделиться» ⬆️ → «На экран „Домой“».'),
    h('button.btn.btn-big', { onclick: () => m.close() }, 'Понятно'),
  ]);
}


/** Окно настроек (шестерёнка в шапке) */
export function openSettings() {
  let m;
  const draw = () => m.el.replaceChildren(
    settingsCard(draw),
    h('button.btn.btn-ghost', { onclick: async () => { if (await confirmDialog('Начать игру заново? Все буквы и вещи пропадут.', 'Начать заново')) resetSave(); } }, 'Начать заново'),
    h('button.btn', { onclick: () => m.close() }, 'Готово'),
  );
  m = modal([]);
  draw();
}
