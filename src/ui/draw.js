// «Нарисуй слово»: слово из Словаря рисуется пальцем и становится вещью-картинкой
// (её фишка появляется в Три в ряд). Рисунок обрезается по краям и сохраняется маленьким PNG.

import { h, modal, toast, confetti } from './common.js';
import { state, commit } from '../state.js';
import { sfx, buzz } from './device.js';

const OUT = 128;        // размер сохранённой картинки, px
const PAD = 8;          // поля вокруг рисунка в сохранённой картинке
const MIN_W = 7;        // тоньше линии на маленькой фишке не видно
const COLORS = ['#111111', '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#30b0ff', '#5856d6', '#ff5fa2', '#8e5a2b', '#ffffff'];
const SIZES = [{ w: 4, label: 'тонко' }, { w: 9, label: 'средне' }, { w: 18, label: 'толсто' }];

/** Открыть холст для слова. onDone(url) — после сохранения. */
export function drawWord(word, onDone) {
  const strokes = [];   // { color, w, pts: [x, y, …] } — в координатах холста 0..1
  let color = COLORS[0];
  let size = SIZES[1].w;
  let cur = null;

  const canvas = h('canvas.dw-canvas');
  const g = canvas.getContext('2d');
  const old = state.drawings[word];
  const doneBtn = h('button.btn.btn-big', { onclick: save, disabled: true }, 'Готово');
  const undoBtn = h('button.dw-tool', { onclick: undo, 'aria-label': 'Отменить' }, '↶');
  const clearBtn = h('button.dw-tool', { onclick: clear, 'aria-label': 'Стереть всё' }, '🗑️');

  const colorEls = COLORS.map((c) => h('button.dw-color', { style: { '--c': c }, 'aria-label': 'цвет', onclick: () => { color = c; paintTools(); } }));
  const sizeEls = SIZES.map((s) => h('button.dw-size', { 'aria-label': s.label, onclick: () => { size = s.w; paintTools(); } }, h('i', { style: { width: s.w + 'px', height: s.w + 'px' } })));
  function paintTools() {
    colorEls.forEach((el, i) => el.classList.toggle('on', COLORS[i] === color));
    sizeEls.forEach((el, i) => el.classList.toggle('on', SIZES[i].w === size));
    sizeEls.forEach((el) => el.querySelector('i').style.background = color === '#ffffff' ? '#ddd' : color);
    doneBtn.disabled = !strokes.length;
    undoBtn.disabled = clearBtn.disabled = !strokes.length;
  }

  let m;
  m = modal([
    h('div.modal-title', 'Нарисуй: ' + word.toLowerCase()),
    h('div.dw-sub', old ? 'Новый рисунок заменит старый' : 'Твой рисунок станет вещью — и фишкой в Три в ряд'),
    h('div.dw-stage', canvas, old ? h('img.dw-old', { src: old, alt: '' }) : null),
    h('div.dw-row', ...colorEls),
    h('div.dw-row', ...sizeEls, h('span.dw-gap'), undoBtn, clearBtn),
    h('div.row', h('button.btn.btn-ghost', { onclick: () => m.close() }, 'Отмена'), doneBtn),
  ], { dismissable: false });
  m.el.classList.add('dw-box');

  // размер холста — по ширине окна, чёткость — по devicePixelRatio
  let px = 280, dpr = 1;
  requestAnimationFrame(() => {
    px = Math.round(canvas.getBoundingClientRect().width) || 280;
    dpr = Math.min(3, devicePixelRatio || 1);
    canvas.width = canvas.height = px * dpr;
    redraw();
  });

  function drawStroke(ctx, s, k, ox = 0, oy = 0) {
    const p = s.pts;
    ctx.strokeStyle = ctx.fillStyle = s.color;
    ctx.lineWidth = Math.max(k.min || 0, s.w * k.w);
    ctx.lineCap = ctx.lineJoin = 'round';
    const X = (i) => ox + p[i] * k.s, Y = (i) => oy + p[i + 1] * k.s;
    if (p.length <= 2) { ctx.beginPath(); ctx.arc(X(0), Y(0), ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); return; }
    // сглаживание: кривые через середины отрезков
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    for (let i = 2; i < p.length - 2; i += 2) {
      ctx.quadraticCurveTo(X(i), Y(i), (X(i) + X(i + 2)) / 2, (Y(i) + Y(i + 2)) / 2);
    }
    ctx.lineTo(X(p.length - 2), Y(p.length - 2));
    ctx.stroke();
  }
  function redraw() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    const k = { s: canvas.width, w: dpr };
    for (const s of strokes) drawStroke(g, s, k);
    paintTools();
  }

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ok */ }
    cur = { color, w: size * (px / 280), pts: pos(e) };
    strokes.push(cur);
    stage.classList.add('drawing');
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!cur) return;
    const [x, y] = pos(e);
    const p = cur.pts;
    // не копим точки ближе пикселя
    if (Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) * px < 1.5) return;
    p.push(x, y);
    redraw();
  });
  const up = () => { cur = null; };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  const stage = canvas.parentElement || canvas;

  function undo() { strokes.pop(); redraw(); }
  function clear() { strokes.length = 0; redraw(); }

  // сохранить: обрезать по рисунку, вписать в квадрат OUT×OUT с полями
  function save() {
    if (!strokes.length) return;
    let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
    for (const s of strokes) {
      const r = (s.w / px) / 2;
      for (let i = 0; i < s.pts.length; i += 2) {
        x0 = Math.min(x0, s.pts[i] - r); x1 = Math.max(x1, s.pts[i] + r);
        y0 = Math.min(y0, s.pts[i + 1] - r); y1 = Math.max(y1, s.pts[i + 1] + r);
      }
    }
    const span = Math.max(x1 - x0, y1 - y0, 0.05);
    const k = (OUT - PAD * 2) / span; // единица холста → пиксели картинки
    const out = document.createElement('canvas');
    out.width = out.height = OUT;
    const o = out.getContext('2d');
    const ox = PAD + ((OUT - PAD * 2) - (x1 - x0) * k) / 2 - x0 * k;
    const oy = PAD + ((OUT - PAD * 2) - (y1 - y0) * k) / 2 - y0 * k;
    for (const s of strokes) drawStroke(o, s, { s: k, w: k / px, min: MIN_W }, ox, oy);
    const url = out.toDataURL('image/png');
    const first = !Object.keys(state.drawings).length;
    state.drawings[word] = url;
    state.dex['card:' + word] = 1;
    commit();
    m.close();
    sfx('reward'); buzz([10, 40, 10]);
    confetti(innerWidth / 2, innerHeight / 3, 40);
    toast(first ? `«${word.toLowerCase()}» теперь вещь — ищи её фишкой в Три в ряд` : `«${word.toLowerCase()}» нарисовано!`, 2600);
    onDone && onDone(url);
  }

  paintTools();
}

const CSS = `
.dw-box { max-height: 96vh; overflow-y: auto; }
.dw-box > * { flex-shrink: 0; }
.dw-sub { text-align:center; font-weight:700; font-size:13px; color:var(--ink-soft); margin:-4px 0 10px; }
.dw-stage { position:relative; width:min(78vw, 300px); aspect-ratio:1; margin:0 auto 10px; border:3px solid var(--ink); border-radius:22px;
  background:#fff; background-image:radial-gradient(rgba(17,17,17,.09) 1.2px, transparent 1.3px); background-size:18px 18px;
  box-shadow:0 5px 0 var(--ink); overflow:hidden; }
.dw-canvas { position:absolute; inset:0; width:100%; height:100%; touch-action:none; display:block; z-index:1; }
.dw-old { position:absolute; inset:12%; width:76%; height:76%; object-fit:contain; opacity:.16; pointer-events:none; }
.dw-stage.drawing .dw-old { display:none; }
.dw-row { display:flex; gap:6px; justify-content:center; align-items:center; flex-wrap:wrap; margin-bottom:8px; }
.dw-color { width:26px; height:26px; border-radius:50%; background:var(--c); border:2.5px solid var(--ink); box-shadow:0 2px 0 var(--ink); padding:0; }
.dw-color.on { transform:scale(1.2); box-shadow:0 0 0 3px #fff, 0 0 0 5px var(--ink); }
.dw-size { width:38px; height:34px; border-radius:12px; background:#fff; border:2.5px solid var(--ink); display:flex; align-items:center; justify-content:center; padding:0; }
.dw-size i { display:block; border-radius:50%; }
.dw-size.on { background:var(--lime); }
.dw-gap { flex:1; }
.dw-tool { width:38px; height:34px; border-radius:12px; background:#fff; border:2.5px solid var(--ink); font-size:17px; font-weight:900; padding:0; }
.dw-tool:disabled { opacity:.35; }
`;
document.head.append(Object.assign(document.createElement('style'), { textContent: CSS }));
