/* 共通部品（前半）：SVG・ボタン・数式・量子回路・ステップ再生・動く回路。スライド固有のスクリプトより前に置く */
const NS = 'http://www.w3.org/2000/svg';
const $ = s => (typeof s === 'string' ? document.querySelector(s) : s);
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
// "q_{0}" 形式の下付き文字に対応した SVG テキスト
function rich(t, str) {
  t.textContent = '';
  str.split(/(_\{[^}]*\})/).forEach(part => {
    if (!part) return;
    const m = part.match(/^_\{([^}]*)\}$/);
    if (m) { el('tspan', { dy: 6, 'font-size': '68%' }, t).textContent = m[1]; el('tspan', { dy: -6 }, t).textContent = '​'; }
    else el('tspan', {}, t).textContent = part;
  });
  return t;
}
const text = (parent, x, y, str, attrs = {}) => rich(el('text', { x, y, ...attrs }, parent), str);
const stoppers = [];
window.onEnter = window.onEnter || {};

/* ---------- 共通：ボタン・タイマー ---------- */
function looper(btn, step, interval) {
  btn = $(btn);
  let t = null;
  const stop = () => { clearInterval(t); t = null; btn.textContent = '▶ 自動再生'; btn.classList.remove('playing'); };
  btn.addEventListener('click', () => {
    btn.blur();
    if (t) return stop();
    btn.textContent = '■ 停止'; btn.classList.add('playing');
    step(); t = setInterval(step, interval);
  });
  stoppers.push(stop);
  return stop;
}
function timerBag() {
  let ts = [];
  const bag = { later(f, ms) { ts.push(setTimeout(f, ms)); }, clear() { ts.forEach(clearTimeout); ts = []; } };
  stoppers.push(bag.clear);
  return bag;
}
function picker(root, items, onPick) {
  root = $(root);
  const lab = root.dataset.label;
  root.innerHTML = (lab ? `<span class="pk-l">${lab}</span>` : '') +
    items.map((it, i) => `<button data-i="${i}">${it.label}</button>`).join('');
  const bs = [...root.querySelectorAll('button')];
  let cur = -1;
  const set = (i, user = false) => { cur = i; bs.forEach((b, j) => b.classList.toggle('on', i === j)); onPick(items[i], i, user); };
  bs.forEach((b, i) => b.addEventListener('click', e => { e.currentTarget.blur(); set(i, true); }));
  set.cur = () => cur;
  return set;
}
// タブ（data-m を持つボタン）
function tabs(root, onPick) {
  root = $(root);
  const bs = [...root.querySelectorAll('button')];
  let cur = 0;
  const set = (m, user) => { cur = m; bs.forEach(b => b.classList.toggle('on', +b.dataset.m === m)); onPick(m, user); };
  bs.forEach(b => b.addEventListener('click', e => { e.currentTarget.blur(); set(+b.dataset.m, true); }));
  set.cur = () => cur;
  return set;
}
const rnd = a => a[Math.floor(Math.random() * a.length)];
const replay = (e, cls) => { e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); };

/* ---------- 共通：数・ベクトル・行列 ---------- */
const s2 = Math.SQRT1_2;
const near = (a, b) => Math.abs(a - b) < 1e-6;
const FR = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
const R2 = `<span class="eq inline">${FR(1, '√2')}</span>`;
function fmtN(x) {
  if (near(x, 1)) return '1'; if (near(x, 0)) return '0'; if (near(x, .5)) return '½';
  if (near(x, s2)) return FR(1, '√2');
  if (Number.isInteger(x)) return '' + x;
  return x.toFixed(2);
}
const sgn = x => (Math.abs(x) < 1e-9 ? '0' : x < 0 ? '−' + fmtN(-x) : fmtN(x));
const fmtS = x => (Math.abs(x) < 5e-3 ? '0' : (x < 0 ? '−' : '+') + Math.abs(x).toFixed(2));
const vecN = (...xs) => `<span class="vec">${xs.map(x => `<span>${x}</span>`).join('')}</span>`;
const matN = (m, cls = '', cell = () => '') => `<span class="vec ${m.length === 4 ? 'm4' : 'm2'} ${cls}">${m.map((r, i) => r.map((v, j) => `<span class="${cell(i, j)}">${v}</span>`).join('')).join('')}</span>`;
const KETS = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
const coefH = a => (near(a, s2) ? R2 : near(a, .5) ? '½' : a.toFixed(2));
// 係数がそろっていれば  1/√2(|00⟩ + |11⟩)  のようにくくり出す
function ketF(v, kets = KETS, dec = false) {
  const t = v.map((c, i) => [c, i]).filter(([c]) => Math.abs(c) > 1e-9);
  if (!t.length) return '0';
  const co = a => (dec ? a.toFixed(2) : coefH(a));
  const m = Math.abs(t[0][0]);
  if (!dec && t.length > 1 && !near(m, 1) && t.every(([c]) => near(Math.abs(c), m)))
    return `${co(m)}(${t.map(([c, i], j) => (j ? (c < 0 ? ' − ' : ' + ') : (c < 0 ? '−' : '')) + kets[i]).join('')})`;
  return t.map(([c, i], j) => { const a = Math.abs(c); return (c < 0 ? (j ? ' − ' : '−') : (j ? ' + ' : '')) + (near(a, 1) ? '' : co(a)) + kets[i]; }).join('');
}
const kron = (A, B) => [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => A[r >> 1][c >> 1] * B[r & 1][c & 1]));
const kv = (a, b) => [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];
const mv = (M, v) => M.map(r => r.reduce((s, x, j) => s + x * v[j], 0));
const G1 = { I: [[1, 0], [0, 1]], X: [[0, 1], [1, 0]], Z: [[1, 0], [0, -1]], H: [[s2, s2], [s2, -s2]] };
const ST1 = { '|0⟩': [1, 0], '|1⟩': [0, 1], '|+⟩': [s2, s2], '|−⟩': [s2, -s2] };
const CNOT01 = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]];
const CNOT10 = [[1, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0]];
const SWAPM = [[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]];
const BELL = [s2, 0, 0, s2];
const sample4 = v => { let r = Math.random(), i = 0; for (; i < 3; i++) { r -= v[i] * v[i]; if (r < 0) break; } return i; };
const binom = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; };
const name1 = v => Object.keys(ST1).find(k => near(ST1[k][0], v[0]) && near(ST1[k][1], v[1])) || null;
const vec2H = v => vecN(sgn(v[0]), sgn(v[1]));
const vec4H = v => vecN(...v.map(sgn));

/* ---------- 共通：SVG の量子回路 ----------
   ops: {g:'H'|'X'|'Z'|'I'|'SX'|'RZ', q, col} / {g:'CX', c(配列可), t, col} / {g:'SW', a, b, c?, col}
        {g:'M', q, cb, col} / {g:'BAR', col} / {g:'BOX', c0, c1, label, init?, toC?}
   k を指定すると set(k) で「済み・実行中・これから」を切り替えられる（省略時は col） */
const GC = { H: 'var(--blue)', X: 'var(--accent)', Z: 'var(--green)', I: '#9a93bd', SX: 'var(--purple)', RZ: 'var(--teal)' };
function drawQC(root, o) {
  root = $(root);
  root.innerHTML = '';
  const n = o.n, nc = o.nc || 0, cw = o.colW || 62, rh = o.rowH || 56, top = o.top ?? 30, latex = o.style === 'latex';
  const ops = o.ops;
  const ncol = o.cols ?? Math.max(1, ...ops.map(p => (p.c1 ?? p.col ?? 0) + 1));
  const L0 = (o.noNames ? 12 : 48) + (o.init ? 42 : 0);
  const X = c => L0 + 18 + c * cw + cw / 2;
  const Y = q => top + q * rh;
  const cy = Y(n - 1) + rh * .92;
  const W = o.W || X(ncol - 1) + cw / 2 + 22;
  const H = (nc ? cy + 28 : Y(n - 1) + 30) + (o.bottom || 0);
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'qcs' }, root);
  if (o.maxW) svg.style.maxWidth = o.maxW;
  if (o.maxW) svg.style.margin = '0 auto';
  const gHl = el('g', {}, svg);
  const items = [];
  const grp = k => { const g = el('g', { class: 'op' }, svg); g._k = k; items.push(g); return g; };
  const base = grp(-Infinity);
  for (let q = 0; q < n; q++) {
    if (!o.noNames) text(base, 6, Y(q) + 7, (o.names || [])[q] ?? `q_{${q}}`, { class: 'nm' });
    if (o.init) text(base, L0 - 40, Y(q) + 7, '|0⟩', { class: 'init' });
    el('line', { x1: L0, y1: Y(q), x2: W - 6, y2: Y(q), class: 'w' }, base);
  }
  if (nc) {
    const g = grp(o.cK ?? -Infinity);
    el('line', { x1: L0, y1: cy - 2.5, x2: W - 6, y2: cy - 2.5, class: 'cw' }, g);
    el('line', { x1: L0, y1: cy + 2.5, x2: W - 6, y2: cy + 2.5, class: 'cw' }, g);
    if (!o.noNames) text(g, 6, cy + 7, o.cname || 'c', { class: 'nm', 'font-style': o.cname ? 'normal' : 'italic', 'font-size': o.cname ? 17 : 22 });
    el('line', { x1: L0 + 10, y1: cy + 9, x2: L0 + 22, y2: cy - 9, class: 'cw' }, g);
    text(g, L0 + 16, cy - 12, '' + nc, { class: 'cbn', 'text-anchor': 'middle', 'font-size': 13 });
  }
  const gate = (g, x, y, p) => {
    const fill = latex ? '#fff' : (GC[p.g] || '#9a93bd');
    el('rect', { x: x - 20, y: y - 20, width: 40, height: 40, rx: latex ? 2 : 6, class: 'gb', style: `fill:${fill}` }, g);
    const tc = latex ? 'fill:#1f1a3d;font-style:italic' : '';
    if (p.g === 'RZ') {
      text(g, x, y - 5, 'R_{Z}', { class: 'gt', style: tc + ';font-size:16px' });
      text(g, x, y + 12, p.arg || 'π/2', { class: 'gt g-sm', style: tc + ';font-size:10px' });
    } else text(g, x, y + 1, p.label || (p.g === 'SX' ? '√X' : p.g), { class: 'gt' + (p.g === 'SX' ? ' g-sm' : ''), style: tc + (p.g === 'SX' ? ';font-size:16px' : '') });
  };
  for (const p of ops) {
    const g = grp(p.k ?? p.col ?? 0), x = X(p.col ?? 0);
    if (G1[p.g] || GC[p.g]) gate(g, x, Y(p.q), p);
    else if (p.g === 'CX') {
      const cs = [].concat(p.c), all = [...cs, p.t].map(Y);
      el('line', { x1: x, y1: Math.min(...all), x2: x, y2: Math.max(...all), class: 'vl' }, g);
      cs.forEach(c => el('circle', { cx: x, cy: Y(c), r: 7, class: 'ctl' }, g));
      const ty = Y(p.t);
      el('circle', { cx: x, cy: ty, r: 14, class: 'tgt' }, g);
      el('line', { x1: x - 14, y1: ty, x2: x + 14, y2: ty, class: 'vl' }, g);
      el('line', { x1: x, y1: ty - 14, x2: x, y2: ty + 14, class: 'vl' }, g);
    } else if (p.g === 'SW') {
      const ys = [p.a, p.b, ...(p.c !== undefined ? [p.c] : [])].map(Y);
      el('line', { x1: x, y1: Math.min(...ys), x2: x, y2: Math.max(...ys), class: 'vl' }, g);
      [p.a, p.b].forEach(q => { const y = Y(q); el('path', { d: `M${x - 9},${y - 9}L${x + 9},${y + 9}M${x + 9},${y - 9}L${x - 9},${y + 9}`, class: 'sx' }, g); });
      if (p.c !== undefined) el('circle', { cx: x, cy: Y(p.c), r: 7, class: 'ctl' }, g);
    } else if (p.g === 'M') {
      const y = Y(p.q);
      if (nc && p.cb !== undefined) {
        el('line', { x1: x - 2.5, y1: y + 20, x2: x - 2.5, y2: cy - 9, class: 'ma' }, g);
        el('line', { x1: x + 2.5, y1: y + 20, x2: x + 2.5, y2: cy - 9, class: 'ma' }, g);
        el('path', { d: `M${x - 8},${cy - 11}L${x + 8},${cy - 11}L${x},${cy - 1}Z`, class: 'mah' }, g);
        text(g, x + 9, cy + 20, '' + p.cb, { class: 'cbn' });
      }
      el('rect', { x: x - 20, y: y - 20, width: 40, height: 40, rx: latex ? 2 : 6, class: 'mbox', style: latex ? 'fill:#fff' : '' }, g);
      el('path', { d: `M${x - 13},${y + 9}A13,13 0 0 1 ${x + 13},${y + 9}M${x},${y + 9}L${x + 9},${y - 8}`, class: 'mi', style: latex ? 'stroke:#1f1a3d' : '' }, g);
    } else if (p.g === 'BAR') {
      el('rect', { x: x - 9, y: Y(0) - 24, width: 18, height: Y(n - 1) - Y(0) + 48, class: 'bar' }, g);
      el('line', { x1: x, y1: Y(0) - 24, x2: x, y2: Y(n - 1) + 24, class: 'barl' }, g);
    } else if (p.g === 'BOX') {
      const x0 = p.init ? L0 - 44 : X(p.c0) - cw / 2 + 3, x1 = p.init ? L0 + 4 : X(p.c1) + cw / 2 - 3;
      const y0 = Y(p.q0 ?? 0) - 25, y1 = p.toC ? cy + 6 : Y(p.q1 ?? n - 1) + 25;
      el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 4, class: 'box' }, g);
      if (p.label) text(g, (x0 + x1) / 2, y0 - 6, p.label, { class: 'boxl' });
    }
  }
  return {
    svg, X, Y, cy, W, H, L0, cw, rh,
    set(k, hide = false) {
      items.forEach(g => {
        const kk = g._k;
        g.classList.toggle('now', kk === k);
        g.classList.toggle(hide ? 'hid' : 'fut', kk > k);
        g.classList.remove(hide ? 'fut' : 'hid');
      });
    },
    hl(x, y, w, h) { return el('rect', { x, y, width: w, height: h, class: 'hl' }, gHl); },
  };
}

window.onEnter = window.onEnter || {};
const FI = (n, d) => `<span class="eq inline">${FR(n, d)}</span>`;
const MINUS = x => String(x).replace('-', '−');

/* ---------- 共通：ステップ再生（▶ 自動再生・◀・●●●・▶）。図の下に説明文は付けない ---------- */
function stepper(root, n, show, ms = 1700) {
  root = $(root);
  root.classList.add('stpr');
  root.innerHTML = `<button class="b" data-autoplay>▶ 自動再生</button><button class="sb">◀</button><span class="dots">${'<i></i>'.repeat(n)}</span><button class="sb">▶</button>`;
  const [play, pv, nx] = root.querySelectorAll('button'), dots = [...root.querySelectorAll('.dots i')];
  let k = 0, t = null;
  const set = i => { k = (i + n) % n; dots.forEach((d, j) => d.classList.toggle('on', j <= k)); show(k); };
  const stop = () => { clearInterval(t); t = null; play.textContent = '▶ 自動再生'; play.classList.remove('playing'); };
  play.addEventListener('click', () => {
    play.blur();
    if (t) return stop();
    play.textContent = '■ 停止'; play.classList.add('playing');
    set(0); t = setInterval(() => set(k + 1), ms);
  });
  pv.addEventListener('click', () => { pv.blur(); stop(); set(k - 1); });
  nx.addEventListener('click', () => { nx.blur(); stop(); set(k + 1); });
  dots.forEach((d, j) => d.addEventListener('click', () => { stop(); set(j); }));
  stoppers.push(stop);
  set(n - 1);
  return { set, stop };
}

/* ---------- 共通：行列・ベクトル ---------- */
const kronM = (A, B) => A.flatMap(ra => B.map(rb => ra.flatMap(a => rb.map(b => a * b))));
const matH = (M, cls, mark = () => '') => `<span class="vec ${cls}">${M.map((r, i) => r.map((v, j) => `<span class="${mark(i, j, v)}">${MINUS(v)}</span>`).join('')).join('')}</span>`;
const colH = (v, mark = () => '') => `<span class="vec col8">${v.map((x, i) => `<span class="${mark(i, x)}">${MINUS(x)}</span>`).join('')}</span>`;
const bits = (i, n) => i.toString(2).padStart(n, '0');

/* ---------- 8.7・8.9 動く回路（入力の丸をクリックで 0 / 1） ---------- */
function gsim(o) {
  const svg = $(o.svg), n = o.n, Y = o.Y, XI = 74, XG = o.XG || 270, XO = 450, W = 560, H = Y[n - 1] + (o.bottom || 40);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const tb = timerBag();
  el('text', { x: XI, y: 18, class: 'lbl', 'text-anchor': 'middle' }, svg).textContent = '入力';
  el('text', { x: XO + 24, y: 18, class: 'lbl', 'text-anchor': 'middle' }, svg).textContent = '出力';
  const w1 = [], w2 = [];
  for (let q = 0; q < n; q++) {
    text(svg, 6, Y[q] + 7, o.names ? o.names[q] : `q_{${q}}`, { class: 'nm' });
    w1.push(el('line', { x1: XI, y1: Y[q], x2: XG, y2: Y[q], class: 'w' }, svg));
    w2.push(el('line', { x1: XG, y1: Y[q], x2: XO, y2: Y[q], class: 'w' }, svg));
    if (o.inLab && o.inLab[q]) el('text', { x: XI + 34, y: Y[q] - 12, class: 'lbl' }, svg).textContent = o.inLab[q];
    if (o.outLab && o.outLab[q]) el('text', { x: XO + 58, y: Y[q] + 6, class: 'lbl', style: 'font-size:18px;fill:var(--ink)' }, svg).textContent = o.outLab[q];
  }
  const gate = el('g', { class: 'gate' }, svg);
  o.draw(gate, XG, Y);
  let v = o.cases[o.start || 0].slice();
  const inp = Y.map((y, q) => {
    const fix = o.fixed && o.fixed[q] !== undefined;
    const g = el('g', { class: 'inp' + (fix ? ' fix' : '') }, svg);
    el('circle', { cx: XI, cy: y, r: 22 }, g);
    const t = el('text', { x: XI, y: y + 1 }, g);
    if (!fix) g.addEventListener('click', () => { v[q] ^= 1; run(); });
    return { g, t };
  });
  const out = Y.map(y => { const g = el('g', { class: 'out' }, svg); el('rect', { x: XO - 2, y: y - 20, width: 52, height: 40, rx: 10 }, g); return { g, t: el('text', { x: XO + 24, y: y + 1 }, g) }; });
  const msg = o.msg ? el('text', { x: (XI + XO) / 2 + 20, y: H - 8, class: 'msg' }, svg) : null;
  const tbl = $(o.tbl);
  tbl.innerHTML = o.table(o.cases, o.f);
  const idx = () => o.cases.findIndex(c => c.every((x, i) => x === v[i]));
  const run = () => {
    tb.clear();
    const w = o.f(v), on = o.active(v);
    inp.forEach((p, q) => { p.g.classList.toggle('one', v[q] === 1); p.t.textContent = `|${v[q]}⟩`; w1[q].classList.toggle('one', v[q] === 1); w2[q].classList.remove('one'); });
    out.forEach(p => { p.g.classList.remove('one', 'chg'); p.t.textContent = ''; });
    gate.classList.remove('on');
    if (msg) msg.textContent = '';
    const i = idx();
    tbl.querySelectorAll('[data-i]').forEach(s => s.classList.toggle(s.tagName === 'TR' ? 'cur' : 'on', +s.dataset.i === i));
    tb.later(() => gate.classList.toggle('on', on), 200);
    tb.later(() => {
      out.forEach((p, q) => { p.t.textContent = `|${w[q]}⟩`; p.g.classList.toggle('one', w[q] === 1); p.g.classList.toggle('chg', w[q] !== v[q]); w2[q].classList.toggle('one', w[q] === 1); });
      if (msg) { const [s, c] = o.msg(v, w); msg.textContent = s; msg.setAttribute('fill', c); }
    }, 550);
  };
  run();
  let ci = o.start || 0;
  looper(o.auto, () => { ci = (ci + 1) % o.cases.length; v = o.cases[ci].slice(); run(); }, 1900);
}
const ket = a => `|${a.join('')}⟩`;
const pairTbl = name => (cs, f) => [0, 1, 2, 3].flatMap(r => [r, r + 4]).map(i => { const a = cs[i], b = f(a), ch = a.some((x, j) => x !== b[j]); return `<span data-i="${i}">${name}${ket(a)}</span><span class="ar">=</span><span data-i="${i}" class="${ch ? 'chg' : ''}">${ket(b)}</span>`; }).join('');
const drawCtl = (g, x, y) => el('circle', { cx: x, cy: y, r: 9, class: 'gd' }, g);
const drawTgt = (g, x, y) => { el('circle', { cx: x, cy: y, r: 20, class: 'gt' }, g); el('path', { d: `M${x - 20},${y}H${x + 20}M${x},${y - 20}V${y + 20}`, class: 'gl' }, g); };
const drawSw = (g, x, y) => el('path', { d: `M${x - 12},${y - 12}L${x + 12},${y + 12}M${x + 12},${y - 12}L${x - 12},${y + 12}`, class: 'gl', style: 'stroke-width:5;stroke-linecap:round' }, g);

