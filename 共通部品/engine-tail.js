/* 共通部品（後半）：復習問題・スライド制御・一覧・黒ペン・レーザー。スライド固有のスクリプトより後に置く */
/* ---------- 復習問題：カードをクリックすると答えが出る（もう一度押すと隠れる） ---------- */
{
  document.querySelectorAll('.qz').forEach(q => q.addEventListener('click', () => {
    const open = q.classList.toggle('open');
    q.querySelectorAll('.qgb').forEach(g => g.classList.toggle('shown', open));
  }));
  // 図の ? は 1 つずつクリックで開ける。全部開いたら答えの文も出す
  document.querySelectorAll('.qgb').forEach(g => g.addEventListener('click', e => {
    e.stopPropagation();
    g.classList.toggle('shown');
    const q = g.closest('.qz'), all = [...q.querySelectorAll('.qgb')];
    q.classList.toggle('open', all.every(x => x.classList.contains('shown')));
  }));
  document.querySelectorAll('[data-quiz-all]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); b.blur();
    const qs = [...b.closest('.slide').querySelectorAll('.qz')], open = !qs.every(q => q.classList.contains('open'));
    qs.forEach(q => { q.classList.toggle('open', open); q.querySelectorAll('.qgb').forEach(g => g.classList.toggle('shown', open)); });
    b.textContent = open ? '答えをぜんぶ隠す' : '答えをぜんぶ表示';
  }));
  // スライドを開くたびに答えを隠した状態に戻す
  const reset = id => () => {
    const sl = document.querySelector(`.slide[data-id="${id}"]`);
    sl.querySelectorAll('.qz').forEach(q => q.classList.remove('open'));
    sl.querySelectorAll('.qgb').forEach(g => g.classList.remove('shown'));
    sl.querySelector('[data-quiz-all]').textContent = '答えをぜんぶ表示';
  };
  window.onEnter = window.onEnter || {};
  // 「答えをぜんぶ表示」ボタンのあるスライドは、開くたびに答えを隠す
  document.querySelectorAll('.slide[data-id]').forEach(sl => {
    if (!sl.querySelector('[data-quiz-all]')) return;
    const id = sl.dataset.id, prev = onEnter[id], r = reset(id);
    onEnter[id] = () => { r(); if (prev) prev(); };
  });
  // 印刷（配布資料）では答えも見えるようにする
  addEventListener('beforeprint', () => document.querySelectorAll('.qz, .qgb').forEach(q => q.classList.add(q.classList.contains('qz') ? 'open' : 'shown')));
}

/* ---------- スライド制御 ---------- */
const stage = $('#stage');
function fit() {
  // 右上の道具に見出しが重なる画面では、ステージを縮めて道具の下へずらす
  let s = Math.min(innerWidth / 1280, innerHeight / 720);
  stage.style.top = '50%';
  stage.style.transformOrigin = '';
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  const pb = document.getElementById('penbar');
  if (!pb || document.body.classList.contains('overview')) return;
  const r = pb.getBoundingClientRect(), top = (innerHeight - 720 * s) / 2, right = innerWidth / 2 + 640 * s;
  if (r.left < right && r.bottom > top + 40 * s) {
    s = Math.min(innerWidth / 1280, (innerHeight - r.bottom) / 680);
    stage.style.top = (r.bottom - 40 * s) + 'px';
    stage.style.transformOrigin = 'top center';
    stage.style.transform = `translate(-50%,0) scale(${s})`;
  }
}
addEventListener('resize', fit); fit();

const slides = [...document.querySelectorAll('.slide')];
slides.forEach((s, i) => { const p = s.querySelector('.pageno'); if (p) p.textContent = `${i + 1} / ${slides.length}`; });
let cur = 0;
const frags = s => [...s.querySelectorAll('.frag')];
function showFrag(f, on) {
  f.classList.toggle('vis', on);
  if (f.dataset.slideClass) f.closest('.slide').classList.toggle(f.dataset.slideClass, on);
}
function go(n, showAll = false) {
  if (n < 0 || n >= slides.length) return;
  stoppers.forEach(f => f());
  cur = n;
  slides.forEach((s, i) => { s.classList.toggle('active', i === n); s.classList.toggle('past', i < n); });
  frags(slides[n]).forEach(f => showFrag(f, showAll));
  $('#counter').textContent = `${n + 1} / ${slides.length}`;
  $('#progress').style.width = `${(n + 1) / slides.length * 100}%`;
  history.replaceState(null, '', '#' + (n + 1));
  const id = slides[n].dataset.id;
  if (window.onEnter && onEnter[id]) onEnter[id]();
  // 自動再生ボタンのあるスライドは、開いた時点で再生を始める（ボタンで停止できる）
  slides[n].querySelectorAll('[data-autoplay]').forEach(b => b.click());
  ink.render();
}
function next() {
  const f = frags(slides[cur]).find(x => !x.classList.contains('vis'));
  if (f) showFrag(f, true); else go(cur + 1);
}
function prev() {
  const v = frags(slides[cur]).filter(x => x.classList.contains('vis'));
  if (v.length) showFrag(v[v.length - 1], false); else go(cur - 1, true);
}
function fullscreen() {
  if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
}
let overview = false;
function layoutOverview() {
  const cols = innerWidth < 900 ? 2 : innerWidth < 1400 ? 3 : 4;
  const w = (document.body.clientWidth - 48 - 22 * (cols - 1)) / cols;
  stage.style.setProperty('--cols', cols);
  stage.style.setProperty('--z', w / 1280);
  stage.style.setProperty('--ow', `${w}px`);
  stage.style.setProperty('--oh', `${w * 720 / 1280}px`);
}
function markCurrent() { slides.forEach((s, i) => s.classList.toggle('current', i === cur)); }
function toggleOverview(on = !overview) {
  overview = on;
  document.body.classList.toggle('overview', on);
  if (on) {
    stoppers.forEach(f => f());
    layoutOverview(); markCurrent();
    slides[cur].scrollIntoView({ block: 'center' });
  } else {
    document.body.scrollTop = 0;
    go(cur);
  }
}
slides.forEach((s, i) => s.addEventListener('click', () => {
  if (!overview) return;
  cur = i; toggleOverview(false);
}));
addEventListener('resize', () => { if (overview) layoutOverview(); });
addEventListener('keydown', e => {
  // 動画を操作しているときの Space・矢印キーは動画に任せる
  if (e.target.tagName === 'VIDEO' && [' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if (overview) {
    if (['o', 'O', 'Escape'].includes(e.key)) toggleOverview(false);
    else if (e.key === 'Enter') { e.preventDefault(); toggleOverview(false); }
    else if (['ArrowRight', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      cur = Math.max(0, Math.min(slides.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)));
      markCurrent(); slides[cur].scrollIntoView({ block: 'nearest' });
    }
    return;
  }
  if (['SUMMARY','INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)) return;
  if (e.key === 'p' || e.key === 'P') return ink.setTool(ink.tool() === 'pen' ? 'none' : 'pen');
  if (e.key === 'z' || e.key === 'Z') return ink.undo();
  if (e.key === 'o' || e.key === 'O') return toggleOverview(true);
  if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(e.key)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(e.key)) { e.preventDefault(); prev(); }
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(slides.length - 1);
  else if (e.key === 'f' || e.key === 'F') fullscreen();
});
let tx = null;
// スライダー操作や Apple Pencil のタッチはスワイプのページ送りに使わない
addEventListener('touchstart', e => tx = laser.blocksSwipe(e.touches[0]) || e.target.closest('input,select,textarea') ? null : e.touches[0].clientX, { passive: true });
addEventListener('touchend', e => {
  if (tx === null || overview) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 60) dx < 0 ? next() : prev();
});
// Apple Pencil のタッチは、Safari のスクリブル（手書き入力）・スクロール・拡大鏡などの判定に使わせない。
// これらが働くと、速く書いたときにペンの動きが一瞬ページに届かなくなり、固まって見えるため。
// タッチの既定の動作を止めるとクリックも起きなくなるので、ペンで軽くタップしたときはこちらでクリックを送る
let penTap = null;
const findPen = e => penTap && [...e.changedTouches].find(t => t.identifier === penTap.id);
stage.addEventListener('touchstart', e => {
  const t = e.changedTouches[0];
  if (t.touchType !== 'stylus' || overview || e.target.closest('input')) return;
  e.preventDefault();
  penTap = { id: t.identifier, x: t.clientX, y: t.clientY, target: e.target, moved: 0 };
}, { passive: false });
stage.addEventListener('touchmove', e => {
  const t = findPen(e);
  if (!t) return;
  e.preventDefault();
  penTap.moved = Math.max(penTap.moved, Math.hypot(t.clientX - penTap.x, t.clientY - penTap.y));
}, { passive: false });
stage.addEventListener('touchend', e => {
  const t = findPen(e);
  if (!t) return;
  const { target, moved } = penTap;
  penTap = null;
  // ほとんど動かさなかったときはタップとみなしてクリックを送る（ボタン・回路の入力・復習問題のカードなど）
  if (moved < 8) {
    if (typeof target.click === 'function') target.click();
    else target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY }));
  }
});
stage.addEventListener('touchcancel', () => { penTap = null; });
$('#btnNext').onclick = e => { e.currentTarget.blur(); next(); };
$('#btnPrev').onclick = e => { e.currentTarget.blur(); prev(); };
$('#btnFs').onclick = e => { e.currentTarget.blur(); fullscreen(); };
$('#btnOv').onclick = e => { e.currentTarget.blur(); toggleOverview(true); };
$('#btnOvClose').onclick = e => { e.currentTarget.blur(); toggleOverview(false); };
addEventListener('beforeprint', () => slides.forEach(s => frags(s).forEach(f => showFrag(f, true))));
/* ---------- 黒ペン・消しゴム・投げ縄 ----------
   右上の道具で「黒ペン」を選ぶと、Apple Pencil（パソコンではマウス）でスライドに書き込める。指では書かない（指はスワイプやタップに使う）。
   ペン先で軽くタップしただけのときは線を残さず、ボタンや入力の丸のクリックとして扱う。
   書き込みはスライドごとに保持し、ページを戻ると再表示される（再読み込みで消える）。
   「投げ縄」で書き込みを囲むと選択できる。選択した線はドラッグで移動、枠のボタンで複製・コピー・削除。
   コピーした線は別のスライドに移ってから「貼り付け」で貼れる（ページをまたいだ複製）。 */
const ink = (() => {
  const W = 1280, H = 720, COLOR = '#111', SEL = '#3b6cff', PAD = 12;
  const canvas = document.createElement('canvas');
  canvas.id = 'ink';
  stage.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const bar = $('#penbar');
  const pages = slides.map(() => ({ strokes: [], undo: [] }));
  let tool = 'none', active = null;
  document.body.classList.add('tool-none');
  // 投げ縄の選択（sel.items は選択中の線そのもの）とクリップボード（ページをまたいで使う）
  let sel = null, clip = null, lassoPts = null;

  // 選択中の線の操作ボタン（スライドの中に置くので、スライドと一緒に拡大縮小される）
  const lbar = document.createElement('div');
  lbar.id = 'lassoBar';
  lbar.innerHTML = '<button data-act="dup" title="複製 (D)">⧉ 複製</button><button data-act="copy" title="コピー：別のスライドで貼り付けできる (C)">📋 コピー</button><button data-act="del" title="削除 (Delete)">🗑️ 削除</button>';
  stage.appendChild(lbar);
  const st = document.createElement('style');
  st.textContent = `
#lassoBar{position:absolute;z-index:6;display:none;gap:4px;background:#fff;border:2.5px solid #1f1a3d;border-radius:999px;box-shadow:3px 3px 0 #1f1a3d;padding:3px}
#lassoBar button{border:0;background:none;font:800 14px "Hiragino Kaku Gothic ProN","Hiragino Sans","Noto Sans JP",Meiryo,sans-serif;color:#1f1a3d;border-radius:999px;padding:5px 10px;cursor:pointer;white-space:nowrap}
#lassoBar button:hover{background:#dfe8ff}
#penbar button:disabled{opacity:.35;cursor:default}
#inkToast{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);z-index:7;background:#1f1a3d;color:#fff;font:800 15px sans-serif;border-radius:999px;padding:6px 16px;opacity:0;transition:opacity .3s;pointer-events:none}
#inkToast.on{opacity:.92}
body.overview #lassoBar,body.overview #inkToast{display:none!important}`;
  document.head.appendChild(st);
  const toastEl = document.createElement('div');
  toastEl.id = 'inkToast';
  stage.appendChild(toastEl);
  let toastT = 0;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 1600); };

  function resize() {
    const k = Math.min(4096 / W, stage.getBoundingClientRect().width / W * (devicePixelRatio || 1));
    canvas.width = Math.round(W * k); canvas.height = Math.round(H * k);
    render();
  }
  // 筆圧で太さを変え、点の中点を結ぶ曲線でなめらかにする。i 番目の区間は p[i-1]・p[i]・p[i+1] で決まる
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  function drawSeg(p, i) {
    const m0 = i === 1 ? p[0] : mid(p[i - 1], p[i]);
    const m1 = i === p.length - 1 ? p[i] : mid(p[i], p[i + 1]);
    ctx.lineWidth = 4 * (.4 + p[i][2] * 1.2);
    ctx.beginPath(); ctx.moveTo(m0[0], m0[1]); ctx.quadraticCurveTo(p[i][0], p[i][1], m1[0], m1[1]); ctx.stroke();
  }
  function drawStroke(p) { for (let i = 1; i < p.length; i++) drawSeg(p, i); }
  const bbox = items => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    items.forEach(s => s.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
    return [x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD];
  };
  // スライド全体の描き直し（元に戻す・消しゴム・スライド切り替え・投げ縄の操作など）
  function render() {
    if (sel && (sel.page !== cur || !sel.items.every(s => pages[cur].strokes.includes(s)))) setSel(null, false);
    const k = canvas.width / W;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 選択中の線は青く縁取る
    if (sel) {
      ctx.strokeStyle = 'rgba(59,108,255,.35)'; ctx.lineWidth = 12;
      sel.items.forEach(s => { ctx.beginPath(); s.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (s.length === 1) ctx.lineTo(s[0][0] + .1, s[0][1]); ctx.stroke(); });
    }
    ctx.strokeStyle = COLOR;
    pages[cur].strokes.forEach(drawStroke);
    if (active && active.pts) { drawStroke(active.pts); active.drawn = active.pts.length - 2; }
    if (sel) {
      const [x0, y0, x1, y1] = bbox(sel.items);
      ctx.save(); ctx.strokeStyle = SEL; ctx.lineWidth = 2; ctx.setLineDash([7, 5]);
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
      placeBar([x0, y0, x1, y1]);
    }
    if (lassoPts && lassoPts.length > 1) {
      ctx.save(); ctx.strokeStyle = SEL; ctx.fillStyle = 'rgba(59,108,255,.08)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); lassoPts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }
  function placeBar([x0, y0, x1, y1]) {
    lbar.style.display = 'flex';
    const w = lbar.offsetWidth || 230, h = lbar.offsetHeight || 36;
    let left = Math.max(8, Math.min(W - w - 8, x1 - w)), top = y0 - h - 8;
    if (top < 70) top = Math.min(H - h - 8, y1 + 8);
    lbar.style.left = left + 'px'; lbar.style.top = top + 'px';
  }
  function setSel(items, draw = true) {
    sel = items && items.length ? { page: cur, items } : null;
    if (!sel) lbar.style.display = 'none';
    if (draw) render();
  }
  // 書いている途中は、まだ描いていない区間だけを描き足す（毎回全部を描き直すと速く書いたときに固まるため）。
  // 最後の区間は次の点が来ないと形が決まらないので、ペンを離したときに描く
  function drawNew(final) {
    const p = active.pts, upto = final ? p.length - 1 : p.length - 2;
    for (let i = Math.max(1, active.drawn + 1); i <= upto; i++) drawSeg(p, i);
    active.drawn = Math.max(active.drawn, upto);
  }
  // ペンの点はたくさん届くので、画面の書き換え 1 回につき 1 回だけまとめて描く
  let queued = false;
  function flush() {
    queued = false;
    if (!active) return;
    if (active.mode === 'lasso' || active.mode === 'move') render();
    else if (active.pts) drawNew(false);
    else if (active.erase.length) { const qs = active.erase; active.erase = []; if (qs.map(eraseAt).some(Boolean)) render(); }
  }
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(flush); } };
  function toStage(e) {
    const r = stage.getBoundingClientRect();
    // マウスは筆圧が取れないので 0.5 として扱う
    const pr = e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : .5;
    return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H, pr];
  }
  function snapshot() { const pg = pages[cur]; pg.undo.push(pg.strokes.slice()); if (pg.undo.length > 100) pg.undo.shift(); }
  function segDist(q, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
    return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
  }
  // q の近くを通る線を消す。消したら true（描き直しは呼び出し側でまとめて行う）
  function eraseAt(q) {
    const pg = pages[cur];
    const keep = pg.strokes.filter(st => !st.some((pt, i) => segDist(q, st[Math.max(0, i - 1)], pt) < 14));
    if (keep.length === pg.strokes.length) return false;
    if (!active.erased) { snapshot(); active.erased = true; }
    pg.strokes = keep;
    return true;
  }
  // 点が多角形の内側か（投げ縄の判定）
  function inPoly(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const inBox = (q, [x0, y0, x1, y1]) => q[0] >= x0 && q[0] <= x1 && q[1] >= y0 && q[1] <= y1;
  const clone = items => items.map(s => s.map(p => p.slice()));
  const shift = (items, dx, dy) => items.forEach(s => s.forEach(p => { p[0] += dx; p[1] += dy; }));

  // ---- 投げ縄の操作 ----
  function duplicate() {
    if (!sel) return;
    snapshot();
    const items = clone(sel.items); shift(items, 24, 24);
    pages[cur].strokes.push(...items);
    setSel(items); toast('複製しました');
  }
  function copy() {
    if (!sel) return;
    clip = { items: clone(sel.items), from: cur, n: 0 };
    $('#inkPaste').disabled = false;
    toast('コピーしました。別のスライドで「貼り付け」できます');
  }
  function paste() {
    if (!clip) return;
    snapshot();
    const items = clone(clip.items);
    // 同じスライドに貼るときは重ならないように少しずらす
    if (clip.from === cur) { clip.n++; shift(items, 24 * clip.n, 24 * clip.n); }
    pages[cur].strokes.push(...items);
    setTool('lasso'); setSel(items); toast('貼り付けました（ドラッグで移動できます）');
  }
  function del() {
    if (!sel) return;
    snapshot();
    pages[cur].strokes = pages[cur].strokes.filter(s => !sel.items.includes(s));
    setSel(null);
  }
  lbar.addEventListener('pointerdown', e => e.stopPropagation());
  lbar.querySelectorAll('button').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); b.blur();
    ({ dup: duplicate, copy, del })[b.dataset.act]();
  }));

  stage.addEventListener('pointerdown', e => {
    if (overview || active || tool === 'laser' || tool === 'none' || e.target.closest('input') || e.target.closest('#lassoBar')) return;
    if (!(e.pointerType === 'pen' || (e.pointerType === 'mouse' && e.button === 0))) return;
    e.preventDefault();
    const q = toStage(e);
    if (tool === 'lasso') {
      // 選択枠の中をつかんだら移動、外なら新しく囲む
      if (sel && inBox(q, bbox(sel.items))) active = { id: e.pointerId, mode: 'move', start: q, last: q, moved: 0 };
      else { setSel(null, false); lassoPts = [q]; active = { id: e.pointerId, mode: 'lasso', start: q, moved: 0 }; render(); }
      return;
    }
    // ペンの消しゴム側（対応ペンのみ）は消しゴムとして扱う
    const erase = tool === 'eraser' || e.button === 5;
    active = { id: e.pointerId, start: q, moved: 0, pts: erase ? null : [q], drawn: 0, erase: [] };
    if (erase) { if (eraseAt(q)) render(); }
  });
  addEventListener('pointermove', e => {
    if (!active || e.pointerId !== active.id) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of evs.length ? evs : [e]) {
      const q = toStage(ev);
      active.moved = Math.max(active.moved, Math.hypot(q[0] - active.start[0], q[1] - active.start[1]));
      if (active.mode === 'lasso') {
        const last = lassoPts[lassoPts.length - 1];
        if (Math.hypot(q[0] - last[0], q[1] - last[1]) >= 3) lassoPts.push(q);
      } else if (active.mode === 'move') {
        if (!active.began && active.moved >= 3) {
          // 元に戻せるよう、動かす前の状態を残し、選択中の線は複製に差し替えてから動かす
          active.began = true; snapshot();
          const pg = pages[cur], copies = clone(sel.items);
          pg.strokes = pg.strokes.map(s => { const i = sel.items.indexOf(s); return i < 0 ? s : copies[i]; });
          sel.items = copies;
        }
        if (active.began) { shift(sel.items, q[0] - active.last[0], q[1] - active.last[1]); active.last = q; }
      } else if (active.pts) {
        // ほとんど動いていない点は間引く（見た目は変わらず、描く量が減る）
        const last = active.pts[active.pts.length - 1];
        if (Math.hypot(q[0] - last[0], q[1] - last[1]) >= 1.2) active.pts.push(q); else last[2] = Math.max(last[2], q[2]);
      } else active.erase.push(q);
    }
    schedule();
  }, { passive: false });
  function end(e) {
    if (!active || e.pointerId !== active.id) return;
    if (active.mode === 'lasso') {
      const poly = lassoPts; lassoPts = null;
      // 点の半分以上が投げ縄の内側にある線を選ぶ
      const items = active.moved >= 6 ? pages[cur].strokes.filter(s => s.filter(p => inPoly(p, poly)).length * 2 >= s.length) : [];
      active = null; setSel(items);
      return;
    }
    if (active.mode === 'move') { active = null; render(); return; }
    flush();
    // ほとんど動かさなかったペン先はタップ（クリック）として扱い、線は残さない
    if (active.pts && active.moved >= 4) {
      drawNew(true); snapshot(); pages[cur].strokes.push(active.pts); active = null;
    } else { active = null; render(); }
  }
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);

  function setTool(t) {
    tool = t;
    document.body.classList.toggle('tool-none', t === 'none');
    if (t !== 'none') { const s = getSelection(); if (s) s.removeAllRanges(); }
    if (t !== 'lasso') setSel(null);
    bar.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  }
  function undo() { const pg = pages[cur]; if (pg.undo.length) { pg.strokes = pg.undo.pop(); setSel(null, false); render(); } }
  bar.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => { b.blur(); setTool(tool === b.dataset.tool ? 'none' : b.dataset.tool); });
  $('#inkUndo').onclick = e => { e.currentTarget.blur(); undo(); };
  $('#inkPaste').onclick = e => { e.currentTarget.blur(); paste(); };
  $('#inkClear').onclick = e => {
    e.currentTarget.blur();
    if (pages[cur].strokes.length) { snapshot(); pages[cur].strokes = []; setSel(null, false); render(); }
  };
  // 投げ縄の選択中のキー操作（ページ送りより先に受け取る）
  addEventListener('keydown', e => {
    if (overview || e.target.tagName === 'INPUT') return;
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && String(getSelection())) return;
    let f = null;
    if (k === 'l' && !mod) f = () => setTool(tool === 'lasso' ? 'none' : 'lasso');
    else if (sel && (k === 'delete' || k === 'backspace')) f = del;
    else if (sel && k === 'escape') f = () => setSel(null);
    else if (sel && k === 'd') f = duplicate;
    else if (sel && k === 'c') f = copy;
    else if (clip && k === 'v') f = paste;
    if (!f) return;
    e.preventDefault(); e.stopImmediatePropagation(); f();
  }, true);
  addEventListener('resize', resize);
  resize();
  return { render, undo, setTool, tool: () => tool, drawing: () => !!active };
})();

/* ---------- レーザーポインター ----------
   Apple Pencil：ペン先を画面に当てている間だけ赤く光る点を表示し、なぞった軌跡を光らせる（書き込みは残らない）。
   パソコン（マウス）：「レーザー」を選んでいる間、マウスの位置に赤い点が出る（3 秒止めると消える）。
   ボタンを押したままドラッグすると軌跡が光る。ボタン・回路の入力など、クリックできる場所の上では軌跡を描かずクリックを優先する。
   軌跡は離してから約1秒で消える。消えきる前にもう一度当てると、それまでの軌跡は消えずに残り続ける。 */
const laser = (() => {
  const W = 1280, H = 720, LIFE = 1000, IDLE = 3000;
  const canvas = document.createElement('canvas');
  canvas.id = 'laser';
  stage.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  // trail は線ごとの点の配列。fadeFrom は離した時刻（当てている間は null）。hover はマウスの位置
  let trail = [], down = null, raf = 0, fadeFrom = null, hover = null, idleT = 0;

  function resize() {
    const k = Math.min(4096 / W, stage.getBoundingClientRect().width / W * (devicePixelRatio || 1));
    canvas.width = Math.round(W * k); canvas.height = Math.round(H * k);
    kick();
  }
  function toStage(e) {
    const r = stage.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H];
  }
  const level = () => fadeFrom === null ? 1 : Math.max(0, 1 - (performance.now() - fadeFrom) / LIFE);
  const hoverLevel = () => {
    if (!hover || down || ink.tool() !== 'laser' || overview) return 0;
    const t = performance.now() - hover.t;
    return t < IDLE ? 1 : Math.max(0, 1 - (t - IDLE) / 400);
  };
  function dot([x, y], a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, 13);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.35, `rgba(255,90,110,${a})`); g.addColorStop(1, 'rgba(255,30,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
  }
  function frame() {
    raf = 0;
    const k = canvas.width / W, f = level(), hl = hoverLevel();
    if (!f) trail = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // 影のぼかし（shadowBlur）は重いので使わず、太い半透明の線の上に細い線を重ねて光って見せる
    const path = new Path2D();
    trail.forEach(line => { if (!line.length) return; path.moveTo(line[0][0], line[0][1]); line.forEach(q => path.lineTo(q[0], q[1])); });
    ctx.strokeStyle = `rgba(255,40,70,${.18 * f})`; ctx.lineWidth = 6 + 14 * f; ctx.stroke(path);
    ctx.strokeStyle = `rgba(255,40,70,${.8 * f})`; ctx.lineWidth = 2 + 5 * f; ctx.stroke(path);
    if (down) dot(down.pos);
    else if (hl > 0) dot(hover.pos, hl);
    if ((fadeFrom !== null && trail.length) || (hl > 0 && hl < 1)) kick();
    else if (hl === 1) { clearTimeout(idleT); idleT = setTimeout(kick, IDLE + 20 - (performance.now() - hover.t)); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function add(q) {
    const line = trail[trail.length - 1], last = line[line.length - 1];
    // ほとんど動いていない点は間引く
    if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) >= 1.5) line.push(q);
    down.pos = q;
  }
  // クリックできる場所（ボタン・入力の丸・カードなど）の上ではマウスの軌跡を描かない
  const clickable = t => !!t.closest('button,input,select,textarea,a,label,summary,#lassoBar') || ['pointer', 'grab', 'grabbing'].includes(getComputedStyle(t).cursor);

  stage.addEventListener('pointerdown', e => {
    if (overview || down || e.target.closest('input')) return;
    if (!(ink.tool() === 'laser' || (ink.tool() === 'none' && e.pointerType === 'pen'))) return;
    const mouse = e.pointerType === 'mouse';
    if (!(e.pointerType === 'pen' || (mouse && e.button === 0 && !clickable(e.target)))) return;
    e.preventDefault();
    // 前の軌跡が消えきっていなければ残したまま続ける
    if (!level()) trail = [];
    fadeFrom = null; down = { id: e.pointerId, pos: null };
    trail.push([]); add(toStage(e)); kick();
  });
  addEventListener('pointermove', e => {
    if (down && e.pointerId === down.id) {
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (evs.length ? evs : [e]).forEach(ev => add(toStage(ev)));
      kick();
      return;
    }
    if (e.pointerType === 'mouse' && ink.tool() === 'laser' && !overview && stage.contains(e.target)) {
      hover = { pos: toStage(e), t: performance.now() }; kick();
    }
    else if (e.pointerType === 'mouse' && hover && ink.tool() !== 'laser') { hover = null; kick(); }
  }, { passive: false });
  stage.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = null; kick(); } });
  const up = e => { if (down && e.pointerId === down.id) { down = null; fadeFrom = performance.now(); if (e.pointerType === 'mouse') hover = { pos: toStage(e), t: performance.now() }; kick(); } };
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  addEventListener('resize', resize);
  resize();

  // Apple Pencil のタッチはスワイプのページ送りに使わない
  return { blocksSwipe: t => t.touchType === 'stylus' || !!down, refresh: kick };
})();

go(Math.max(0, Math.min(slides.length - 1, (parseInt(location.hash.slice(1)) || 1) - 1)));
