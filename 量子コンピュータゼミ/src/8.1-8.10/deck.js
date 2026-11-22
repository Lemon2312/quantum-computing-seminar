/* =====================================================================
   第8章 n 量子ビットの世界 ― スライド固有のスクリプト
   ===================================================================== */

/* ---------- 8.5 一部の量子ビットの測定 ---------- */
function partial(id, m) {
  // 教科書の例より簡単な例：1/2(|000⟩ + |001⟩ + |010⟩ + |111⟩)
  const T = [['000', 1], ['001', 1], ['010', 1], ['111', 1]], N = 4, PRE = FI(1, 2);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a), FRr = (a, b) => { const g = gcd(a, b); return FI(a / g, b / g); };
  const GC8 = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--purple)'];
  const term = ([k, c], col = true) => `${c === 1 ? '' : c}|${col ? `<u>${k.slice(0, m)}</u>` : k.slice(0, m)}${k.slice(m)}⟩`;
  $(`#${id}St`).innerHTML = `<span>|φ⟩ = ${PRE}(${T.map(([k, c]) => `${c === 1 ? '' : c}|<span class="t" style="color:${GC8[parseInt(k.slice(0, m), 2)]};font-weight:900">${k.slice(0, m)}</span>${k.slice(m)}⟩`).join(' + ')})</span>`;
  $(`#${id}St`).insertAdjacentHTML('beforeend', `<div class="pm-pr">${T.map(([k]) => `<span>|${k}⟩：${FI(1, 4)}</span>`).join('')}<em>（どれも |${FI(1, 2)}|² = ${FI(1, 4)}）</em></div>`);
  const groups = [...Array(2 ** m)].map((_, p) => {
    const pre = bits(p, m), ts = T.filter(([k]) => k.startsWith(pre)), S = ts.reduce((s, [, c]) => s + c * c, 0);
    const state = !ts.length ? '—' : ts.length === 1 ? `|${ts[0][0]}⟩` : `${FI(1, '√' + S)}(${ts.map(t => term(t, false)).join(' + ')})`;
    return { pre, ts, S, html: `<div class="pmg" style="--gc:${GC8[p]}"><div class="gh">${m === 1 ? '0 ビット目' : '0・1 ビット目'}の測定結果が |${pre}⟩ の場合</div>
      <div class="gt">${ts.length ? ts.map(t => `<span class="term">${term(t)}</span>`).join('') : '<span class="none">項がない</span>'}</div>
      <div class="gp"><span class="lab">確率</span>${ts.length ? `${FI(ts.map(([, c]) => c + '²').join(' + '), N)} = <b>${FRr(S, N)}</b>` : '<b>0</b>'}</div>
      ${ts.length ? `<div class="gg"><span class="lab">残った候補（合計 ${FRr(S, N)}）</span><div class="gz">${ts.map(() => `<i style="width:${100 / N}%"></i>`).join('')}</div><span class="lab">× ${FRr(N, S)} で長さ 1 に</span><div class="gz">${ts.map(() => `<i class="up" style="width:${100 / ts.length}%"></i>`).join('')}</div></div>` : ''}
      <div class="gs"><span class="lab">測定後の状態</span>${state}</div></div>` };
  });
  const box = $(`#${id}G`);
  box.innerHTML = groups.map(g => g.html).join('');
  const els = [...box.children], card = box.closest('.pm-card');
  box.closest('.pm-card').classList.add('s2');
}
partial('pm1', 1);
partial('pm2', 2);

/* ---------- 8.6.1 8 × 8 行列 と 2 × 2 行列 ---------- */
{
  const X = [[0, 1], [1, 0]], Z = [[1, 0], [0, -1]];
  const M = kronM(kronM(X, X), Z), e = [0, 0, 0, 0, 0, 1, 0, 0], r = M.map(row => row[5]);
  $('#tpBig').innerHTML = `<span>(X ⊗ X ⊗ Z)|101⟩ =</span>${matH(M, 'm8', (i, j, v) => (j === 5 ? (v ? 'hx' : 'hc') : ''))}${colH(e, (i, x) => (x ? 'hx' : ''))}<span>=</span>${colH(r, (i, x) => (x ? 'hx' : ''))}<span>= <span class="res">−|011⟩</span></span>`;
}


const all3 = [...Array(8)].map((_, i) => [i >> 2 & 1, i >> 1 & 1, i & 1]);
const toffoli = (g, x, Y) => { el('line', { x1: x, y1: Y[0], x2: x, y2: Y[2], class: 'gl' }, g); drawCtl(g, x, Y[0]); drawCtl(g, x, Y[1]); drawTgt(g, x, Y[2]); };
const fCC = v => [v[0], v[1], v[2] ^ (v[0] & v[1])];
const Y3 = [56, 136, 216];

gsim({ svg: '#tfSvg', tbl: '#tfTbl', auto: '#tfAuto', n: 3, Y: Y3, cases: all3, start: 6, draw: toffoli, f: fCC, active: v => v[0] && v[1], table: pairTbl('CCNOT'), bottom: 30 });
// 図にゲートの名前と、制御ビット・標的ビットを書き込む
[['#tfSvg', 'トフォリゲート（CCNOT）', ['制御ビット', '制御ビット', '標的ビット']], ['#frSvg', 'フレドキンゲート（CSWAP）', ['制御ビット', '標的ビット', '標的ビット']]].forEach(([id, name, labs]) => {
  const svg = $(id);
  el('text', { x: 270, y: 18, 'text-anchor': 'middle', style: 'font:900 17px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;fill:var(--ink)' }, svg).textContent = name;
  Y3.forEach((y, q) => el('text', { x: 300, y: y - 12, style: `font:800 14px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;fill:${labs[q] === '制御ビット' ? 'var(--accent-d)' : 'var(--blue)'}` }, svg).textContent = labs[q]);
});
drawQC('#anN', { n: 4, ops: [{ g: 'CX', c: [0, 1, 2], t: 3, col: 0 }], colW: 60, rowH: 40 });
gsim({
  svg: '#frSvg', tbl: '#frTbl', auto: '#frAuto', n: 3, Y: Y3, cases: all3, start: 5, bottom: 30,
  draw: (g, x, Y) => { el('line', { x1: x, y1: Y[0], x2: x, y2: Y[2], class: 'gl' }, g); drawCtl(g, x, Y[0]); drawSw(g, x, Y[1]); drawSw(g, x, Y[2]); },
  f: v => (v[0] ? [v[0], v[2], v[1]] : v.slice()), active: v => v[0] === 1, table: pairTbl('CSWAP'),
});

/* 8 × 8 の行列（CCNOT・CSWAP） */
{
  const perm = f => [...Array(8)].map((_, r) => [...Array(8)].map((_, c) => { const o = f(all3[c]); return parseInt(o.join(''), 2) === r ? 1 : 0; }));
  const mk = (f) => { const M = perm(f); return matH(M, 'm8', (i, j, v) => (i !== j && v ? 'hp' : '')); };
  $('#tfMat').innerHTML = mk(fCC);
  $('#frMat').innerHTML = mk(v => (v[0] ? [v[0], v[2], v[1]] : v));
}

/* ---------- 8.8 重ね合わせ状態に CNOT（2 量子ビット） ---------- */
function ampBars(root, N) {
  root = $(root);
  const nb = Math.log2(N);
  root.style.gridTemplateColumns = `repeat(${N},1fr)`;
  root.innerHTML = [...Array(N)].map(() => '<div class="c"><span class="val"></span><div class="bar"></div></div>').join('');
  root.insertAdjacentHTML('afterend', `<div class="amp8k" style="grid-template-columns:repeat(${N},1fr)">${[...Array(N)].map((_, i) => `<span>|${bits(i, nb)}⟩</span>`).join('')}</div>`);
  const cs = [...root.children];
  return (a, mv = -1, hit = -1) => cs.forEach((c, i) => {
    c.querySelector('.bar').style.height = a[i] * 118 + 'px';
    c.querySelector('.bar').style.borderWidth = a[i] ? '' : '0';
    c.querySelector('.val').innerHTML = a[i] === 1 ? '1' : a[i] ? FI(1, '√2') : '';
    c.classList.toggle('mv', i === mv); c.classList.toggle('hit', i === hit);
  });
}
const TC = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--purple)'];
{
  const qc = drawQC('#spQC', { n: 2, init: true, ops: [{ g: 'H', q: 0, col: 0 }, { g: 'H', q: 1, col: 0 }, { g: 'X', q: 0, col: 1 }, { g: 'X', q: 1, col: 1 }], colW: 90 });
  const draw = ampBars('#spAmp', 4), h = FI(1, 2), bars = [...$('#spAmp').children];
  // 各項を色で追う：X ⊗ X の後は |00⟩ の色が |11⟩ に移る
  const col = (k, i) => (k < 2 ? TC[i] : TC[3 - i]);
  const K = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  const eqs = ['|0⟩|0⟩ = |00⟩', `(H ⊗ H)|00⟩ = ${h}(${K.map((x, j) => `<b style="color:${TC[j]}">${x}</b>`).join(' + ')})`, `(X ⊗ X) → ${h}(${K.slice().reverse().map((x, j) => `<b style="color:${TC[j]}">${x}</b>`).join(' + ')})`];
  stepper('#spStp', 3, k => {
    qc.set(k - 1);
    draw(k ? [.5, .5, .5, .5] : [1, 0, 0, 0]);
    bars.forEach((c, i) => { c.querySelector('.bar').style.background = k ? col(k, i) : ''; c.querySelector('.val').innerHTML = k ? FI(1, 2) : (i ? '' : '1'); });
    $('#spEq').innerHTML = `<span>${eqs[k]}</span>`;
  }, 1900);
}
{
  const before = ampBars('#sp2Amp', 4), after = ampBars('#sp2Amp2', 4), K = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
  before([.5, .5, .5, .5]); $('#sp2Amp').querySelectorAll('.val').forEach(v => v.innerHTML = FI(1, 2));
  const meas = () => { const i = rnd([0, 1, 2, 3]), a = [0, 0, 0, 0]; a[i] = 1; after(a, -1, i); $('#sp2E').innerHTML = K[i]; };
  $('#sp2Go').onclick = e => { e.currentTarget.blur(); meas(); };
  onEnter.sp2 = meas;
  meas();
}

/* ---------- 8.8 計算量 O(2²ⁿ)：縦軸が大きくなると、小さい目盛りは下へ移動する ---------- */
{
  const N = 10, H = 240, ch = $('#cxChart'), ya = $('#cxY');
  ch.innerHTML = [...Array(N)].map((_, i) => `<div class="c"><div class="bar"></div><span class="n">${i + 1}</span></div>`).join('');
  ya.innerHTML = '<span class="tk z" style="bottom:0">0</span>' + [...Array(N)].map((_, i) => `<span class="tk" data-i="${i + 1}">${(4 ** (i + 1)).toLocaleString()}</span>`).join('');
  const cs = [...ch.children], tks = [...ya.querySelectorAll('.tk[data-i]')];
  stepper('#cxStp', N, k => {
    const n = k + 1, mx = 4 ** n;
    cs.forEach((c, i) => { c.querySelector('.bar').style.height = i <= k ? Math.max(4 ** (i + 1) / mx * H, 1) + 'px' : '0'; c.classList.toggle('cur', i === k); });
    tks.forEach(t => { const m = +t.dataset.i, y = 4 ** m / mx * H; t.style.bottom = Math.min(y, H) + 'px'; t.style.opacity = m <= n && (m === n || y >= 22) ? 1 : 0; });
    $('#cxNum').innerHTML = `${n} 量子ビットのとき：(2<sup>${n}</sup>)² = <b>${mx.toLocaleString()}</b> 回の計算`;
  }, 1200);
  // 8 × 8 の行列とベクトルの積
  $('#mvxM').innerHTML = '<i></i>'.repeat(64); $('#mvxV').innerHTML = '<i></i>'.repeat(8); $('#mvxR').innerHTML = '<i></i>'.repeat(8);
}

/* ---------- 8.9 オラクル（一般的な形：n 量子ビットの x、m 量子ビットの y） ---------- */
function oracleBox(svg, o) {
  // o: {ys:[..], ins:[..], outs:[..], slash:[..], x0, x1, label, q}
  o.ys.forEach((y, k) => {
    el('line', { x1: 86, y1: y, x2: o.x2 || 430, y2: y, class: 'w' }, svg);
    el('text', { x: 78, y: y + 8, 'text-anchor': 'end', style: 'font-size:24px' }, svg).textContent = o.ins[k];
    el('text', { x: (o.x2 || 430) + 8, y: y + 8, style: 'font-size:24px' }, svg).textContent = o.outs[k];
    if (o.slash && o.slash[k]) { el('line', { x1: 112, y1: y + 10, x2: 128, y2: y - 10, style: 'stroke:var(--ink);stroke-width:2.5' }, svg); el('text', { x: 124, y: y - 14, style: 'font-size:16px;font-style:italic' }, svg).textContent = o.slash[k]; }
  });
  const top = Math.min(...o.ys) - 34, h = Math.max(...o.ys) - Math.min(...o.ys) + 68;
  el('rect', { x: o.x0, y: top, width: o.x1 - o.x0, height: h, rx: 14, class: 'bx' }, svg);
  rich(el('text', { x: (o.x0 + o.x1) / 2, y: top + h / 2 - (o.q ? 12 : 0), class: 'bxt' }, svg), o.label);
  if (o.q) el('text', { x: (o.x0 + o.x1) / 2, y: top + h / 2 + 26, class: 'q', style: 'font-size:30px' }, svg).textContent = '?';
}
oracleBox($('#orSvg'), { ys: [70, 180], ins: ['|x⟩', '|y⟩'], outs: ['|x⟩', '|y ⊕ f(x)⟩'], slash: ['n', 'm'], x0: 190, x1: 330, label: 'U_{f}', q: true });

/* ---------- 8.10.1 量子で 4 回、古典で足す ---------- */
{
  const svg = $('#q4Svg'), ys = [100, 180, 260, 340], G = ['I', 'X', 'Y', 'Z'], yc = 220;
  el('rect', { x: 110, y: 18, width: 200, height: 370, rx: 18, style: 'fill:#fff1c2;stroke:var(--ink);stroke-width:2.5;stroke-dasharray:7 5' }, svg);
  el('rect', { x: 330, y: 18, width: 180, height: 370, rx: 18, style: 'fill:#dfe8ff;stroke:var(--ink);stroke-width:2.5;stroke-dasharray:7 5' }, svg);
  el('text', { x: 210, y: 50, class: 'lbl', 'text-anchor': 'middle', style: 'fill:var(--accent-d);font-size:17px' }, svg).textContent = '量子コンピュータ';
  el('text', { x: 420, y: 50, class: 'lbl', 'text-anchor': 'middle', style: 'fill:var(--blue);font-size:17px' }, svg).textContent = '古典コンピュータ';
  el('text', { x: 40, y: yc + 8, 'text-anchor': 'middle', style: 'font-size:26px' }, svg).textContent = '|φ⟩';
  ys.forEach((y, k) => {
    el('path', { d: `M66,${yc} C100,${yc} 110,${y} 140,${y}`, style: 'fill:none;stroke:var(--ink);stroke-width:2.5' }, svg);
    el('rect', { x: 140, y: y - 24, width: 140, height: 48, rx: 10, style: 'fill:#fff;stroke:var(--ink);stroke-width:3' }, svg);
    el('text', { x: 210, y: y + 8, 'text-anchor': 'middle', style: 'font-size:24px' }, svg).textContent = `${G[k]}|φ⟩`;
    el('line', { x1: 280, y1: y, x2: 395, y2: y, style: 'stroke:var(--ink);stroke-width:2.5' }, svg);
    el('text', { x: 372, y: y - 8, 'text-anchor': 'middle', style: 'font-size:15px;font-weight:700' }, svg).textContent = ['×(a+d)/2', '×(b+c)/2', '×i(b−c)/2', '×(a−d)/2'][k];
    el('path', { d: `M395,${y} C415,${y} 415,${yc} 430,${yc}`, style: 'fill:none;stroke:var(--ink);stroke-width:2.5' }, svg);
  });
  el('circle', { cx: 452, cy: yc, r: 22, style: 'fill:#fff;stroke:var(--ink);stroke-width:3' }, svg);
  el('text', { x: 452, y: yc + 9, 'text-anchor': 'middle', style: 'font-size:28px;font-weight:700' }, svg).textContent = '＋';
  el('line', { x1: 474, y1: yc, x2: 522, y2: yc, style: 'stroke:var(--ink);stroke-width:2.5' }, svg);
  rich(el('text', { x: 526, y: yc + 8, style: 'font-size:22px' }, svg), 'A_{1}|φ⟩');
}

/* ---------- 8.10.3 σ_{k1} ⊗ σ_{k2} の 16 通り ---------- */
{
  const G = ['I', 'X', 'Y', 'Z'];
  $('#a2G').innerHTML = `<span></span>${G.map((g, j) => `<span class="h">k₂=${j}</span>`).join('')}` + G.map((g, i) => `<span class="h">k₁=${i}</span>${G.map(h => `<span class="t">${g} ⊗ ${h}</span>`).join('')}`).join('');
}

/* ---------- 8.10.4 4ⁿ 回 ---------- */
{
  const g = $('#anDots');
  stepper('#anStp', 5, k => {
    const n = k + 1, s = 2 ** n, sz = Math.min(44, Math.floor(320 / s) - 2);
    g.style.gridTemplateColumns = `repeat(${s},${sz}px)`;
    g.style.gridAutoRows = sz + 'px';
    g.innerHTML = '<i></i>'.repeat(s * s);
    $('#anLbl').innerHTML = `${n} 量子ビットのとき：4<sup>${n}</sup> = <b>${4 ** n}</b> 回の計算`;
  }, 1500);
}

/* ---------- 復習：1 量子ビット・2 量子ビットの量子回路 ---------- */
drawQC('#rvC1', { n: 1, init: true, noNames: true, ops: [{ g: 'H', q: 0, col: 0 }, { g: 'M', q: 0, col: 1 }], colW: 56 });
drawQC('#rvC2', { n: 2, noNames: true, ops: [{ g: 'CX', c: 0, t: 1, col: 0 }], colW: 56, rowH: 44 });
drawQC('#rvC3', { n: 2, noNames: true, ops: [{ g: 'SW', a: 0, b: 1, col: 0 }], colW: 56, rowH: 44 });

/* ---------- 復習：問題を自動でつくる ---------- */
{
  const r1 = [rqSetup('#rq1', RQ.q1), rqSetup('#rq2', RQ.q2)], r2 = [rqSetup('#rq3', RQ.q3), rqSetup('#rq4', RQ.q4)];
  onEnter.rv1 = () => r1.forEach(f => f());
  onEnter.rv2 = () => r2.forEach(f => f());
}

/* ---------- 【補足】オラクルの中身 4 通り：図 8.6 と同じ形（入力 |x⟩|y⟩、出力 |x⟩|y ⊕ f(x)⟩、U_f の枠）で描く ---------- */
{
  const Y = [52, 112];
  const xg = (svg, x, q) => { el('rect', { x: x - 17, y: Y[q] - 17, width: 34, height: 34, rx: 6, style: 'fill:var(--accent);stroke:var(--ink);stroke-width:2.5' }, svg); el('text', { x, y: Y[q] + 7, 'text-anchor': 'middle', style: 'fill:#fff;font:700 20px "Cambria Math",serif' }, svg).textContent = 'X'; };
  const cx = (svg, x) => { el('line', { x1: x, y1: Y[0], x2: x, y2: Y[1], class: 'gl' }, svg); el('circle', { cx: x, cy: Y[0], r: 7, class: 'gd' }, svg); el('circle', { cx: x, cy: Y[1], r: 15, class: 'gt' }, svg); el('path', { d: `M${x - 15},${Y[1]}H${x + 15}M${x},${Y[1] - 15}V${Y[1] + 15}`, class: 'gl' }, svg); };
  const parts = [svg => {}, svg => xg(svg, 180, 1), svg => cx(svg, 180)];
  parts.forEach((draw, k) => {
    const svg = el('svg', { viewBox: '0 0 420 160', class: 'gsim' }, $('#oi' + k));
    Y.forEach((y, q) => {
      el('line', { x1: 46, y1: y, x2: 316, y2: y, class: 'w' }, svg);
      el('text', { x: 40, y: y + 7, 'text-anchor': 'end', style: 'font-size:20px' }, svg).textContent = q ? '|y⟩' : '|x⟩';
      el('text', { x: 322, y: y + 7, style: 'font-size:20px' }, svg).textContent = q ? ['|y ⊕ 0⟩', '|y ⊕ 1⟩', '|y ⊕ x⟩'][k] : '|x⟩';
    });
    el('rect', { x: 82, y: 14, width: 196, height: 136, rx: 8, style: 'fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:6 4' }, svg);
    rich(el('text', { x: 88, y: 34, style: 'font-size:16px;font-style:italic;fill:var(--muted)' }, svg), 'U_{f}');
    draw(svg);
  });
}

/* ---------- 【補足】VQE のくり返し ---------- */
{
  const svg = $('#vqSvg');
  const box = (x, y, w, h, fill, title, lines, who) => {
    el('rect', { x, y, width: w, height: h, rx: 16, style: `fill:${fill};stroke:var(--ink);stroke-width:3` }, svg);
    el('text', { x: x + 14, y: y + 24, class: 'lbl', style: 'font-size:15px' }, svg).textContent = who;
    el('text', { x: x + w / 2, y: y + 52, 'text-anchor': 'middle', style: 'font:800 20px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;fill:var(--ink)' }, svg).textContent = title;
    lines.forEach((t, i) => el('text', { x: x + w / 2, y: y + 82 + i * 26, 'text-anchor': 'middle', style: 'font-size:19px;fill:var(--ink)' }, svg).textContent = t);
  };
  const arrow = d => { el('path', { d, style: 'fill:none;stroke:var(--ink);stroke-width:3' }, svg); };
  const head = (x, y, dir) => { const p = { r: `${x},${y} ${x - 12},${y - 7} ${x - 12},${y + 7}`, d: `${x},${y} ${x - 7},${y - 12} ${x + 7},${y - 12}`, l: `${x},${y} ${x + 12},${y - 7} ${x + 12},${y + 7}`, u: `${x},${y} ${x - 7},${y + 12} ${x + 7},${y + 12}` }[dir]; el('polygon', { points: p, style: 'fill:var(--ink)' }, svg); };
  box(20, 20, 250, 150, '#dfe8ff', 'パラメータ θ を決める', ['（最初は適当に）'], '古典コンピュータ');
  box(290, 20, 250, 150, '#fff1c2', '|ψ(θ)⟩ をつくって測定', ['パウリ行列の項ごとに', '⟨ψ(θ)|σ⋯|ψ(θ)⟩'], '量子コンピュータ');
  box(155, 245, 250, 150, '#dfe8ff', 'E(θ) = Σ α × 測定値', ['E(θ) が小さくなるように', 'θ を更新'], '古典コンピュータ');
  arrow('M270,95 H285'); head(290, 95, 'r');
  arrow('M415,170 V320 H410'); head(405, 320, 'l');
  arrow('M155,320 H145 V175'); head(145, 170, 'u');
  el('text', { x: 280, y: 222, 'text-anchor': 'middle', style: 'font:800 16px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;fill:var(--accent-d)' }, svg).textContent = 'E(θ) が下がらなくなるまでくり返す';
}

/* ---------- 【補足】QAOA の回路の形 ---------- */
{
  const svg = $('#qaSvg'), ys = [70, 120, 170];
  ys.forEach((y, q) => { rich(el('text', { x: 10, y: y + 7, class: 'nm' }, svg), `q_{${q}}`); el('line', { x1: 44, y1: y, x2: 580, y2: y, class: 'w' }, svg); });
  el('text', { x: 66, y: 208, 'text-anchor': 'middle', style: 'font-size:18px' }, svg).textContent = '⋮';
  const blk = (x, w, fill, sup, lab) => {
    el('rect', { x, y: 40, width: w, height: 160, rx: 10, style: `fill:${fill};stroke:var(--ink);stroke-width:3` }, svg);
    const t = el('text', { x: x + w / 2, y: 112, 'text-anchor': 'middle', style: 'font-size:22px;fill:var(--ink)' }, svg);
    if (sup) { el('tspan', {}, t).textContent = 'e'; el('tspan', { dy: -10, 'font-size': '15px' }, t).textContent = sup; } else t.textContent = 'H';
    if (lab) rich(el('text', { x: x + w / 2, y: 150, 'text-anchor': 'middle', class: 'lbl', style: 'font-size:15px' }, svg), lab);
  };
  blk(54, 50, '#fff', '', '');
  blk(124, 110, '#ffd3e6', '−iγĤ', 'コスト Ĥ_{C}');
  blk(254, 110, '#d6f3e2', '−iβĤ', '混ぜる Ĥ_{B}');
  el('text', { x: 410, y: 128, 'text-anchor': 'middle', style: 'font:800 22px sans-serif' }, svg).textContent = '× p 回';
  ys.forEach(y => { el('rect', { x: 490, y: y - 18, width: 36, height: 36, rx: 6, class: 'bx', style: 'fill:#2a2350' }, svg); el('path', { d: `M${496},${y + 8}A12,12 0 0 1 ${520},${y + 8}M508,${y + 8}L516,${y - 6}`, style: 'fill:none;stroke:#fff;stroke-width:2.5' }, svg); });
  el('rect', { x: 90, y: 260, width: 420, height: 90, rx: 16, style: 'fill:#dfe8ff;stroke:var(--ink);stroke-width:3' }, svg);
  el('text', { x: 300, y: 296, 'text-anchor': 'middle', style: 'font:800 18px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif' }, svg).textContent = '古典コンピュータ';
  el('text', { x: 300, y: 326, 'text-anchor': 'middle', style: 'font-size:18px' }, svg).textContent = '測定したビット列のコストを見て γ, β を調整';
  el('path', { d: 'M508,192 V240 H530 V305 H515', style: 'fill:none;stroke:var(--ink);stroke-width:3' }, svg);
  el('path', { d: 'M90,305 H70 V214', style: 'fill:none;stroke:var(--ink);stroke-width:3' }, svg);
  el('polygon', { points: '70,204 63,216 77,216', style: 'fill:var(--ink)' }, svg);
  el('polygon', { points: '510,305 522,298 522,312', style: 'fill:var(--ink)' }, svg);
}

/* ---------- |0⟩^⊗n：n 個の量子ビットがすべて |0⟩ の回路 ---------- */
{
  const svg = $('#ktSvg'), ys = [40, 105, 170, 255], names = ['q_{0}', 'q_{1}', '', 'q_{n−1}'];
  ys.forEach((y, k) => {
    if (k === 2) { el('text', { x: 130, y: 212, 'text-anchor': 'middle', style: 'font-size:30px' }, svg).textContent = '⋮'; return; }
    rich(el('text', { x: 4, y: y + 8, class: 'nm' }, svg), names[k]);
    el('text', { x: 66, y: y + 8, style: 'font-size:24px' }, svg).textContent = '|0⟩';
    el('line', { x1: 104, y1: y, x2: 210, y2: y, class: 'w' }, svg);
  });
  el('path', { d: 'M222,24 Q236,24 236,60 V130 Q236,148 250,148 Q236,148 236,166 V236 Q236,272 222,272', style: 'fill:none;stroke:var(--ink);stroke-width:2.5' }, svg);
  const t = el('text', { x: 254, y: 156, style: 'font-size:22px' }, svg);
  el('tspan', {}, t).textContent = '|0⟩'; el('tspan', { dy: -10, 'font-size': '15px' }, t).textContent = '⊗n';
}

/* ---------- 確率の平方根で割る理由：太枠の箱 ＝ 確率 1 ---------- */
{
  const fill = (id, ps, cls) => { $(id).innerHTML = ps.map(([k, p]) => `<i class="${cls}" style="width:${p * 100}%"><span>|${k}⟩</span><em>${p === .25 ? '¼' : '⅓'}</em></i>`).join(''); };
  fill('#sqA', [['000', .25], ['001', .25], ['010', .25], ['111', .25]], '');
  fill('#sqB', [['000', .25], ['001', .25], ['010', .25]], '');
  fill('#sqC', [['000', 1 / 3], ['001', 1 / 3], ['010', 1 / 3]], 'up');
  $('#sqA').lastElementChild.classList.add('gone');
}

/* ---------- 定理 8.1：X ⊗ X ⊗ Z を回路で ---------- */
{
  const svg = el('svg', { viewBox: '0 0 250 170', class: 'gsim' }, $('#tpQC')), ys = [30, 85, 140], G = ['X', 'X', 'Z'], ins = ['|1⟩', '|0⟩', '|1⟩'], outs = ['|0⟩', '|1⟩', '−|1⟩'];
  ys.forEach((y, k) => {
    el('text', { x: 38, y: y + 7, 'text-anchor': 'end', style: 'font-size:20px' }, svg).textContent = ins[k];
    el('line', { x1: 44, y1: y, x2: 176, y2: y, class: 'w' }, svg);
    el('rect', { x: 92, y: y - 18, width: 36, height: 36, rx: 6, style: `fill:${GC[G[k]]};stroke:var(--ink);stroke-width:2.5` }, svg);
    el('text', { x: 110, y: y + 7, 'text-anchor': 'middle', style: 'fill:#fff;font:700 20px "Cambria Math",serif' }, svg).textContent = G[k];
    el('text', { x: 182, y: y + 7, style: 'font-size:20px' }, svg).textContent = outs[k];
  });
}

/* ---------- 一部の測定の回路：|φ⟩ をつくって、0 ビット目（と 1 ビット目）だけ測定 ---------- */
function measCircuit(id, meas) {
  const svg = el('svg', { viewBox: '0 0 250 160', class: 'gsim' }, $(id)), ys = [30, 80, 130];
  ys.forEach((y, q) => {
    rich(el('text', { x: 2, y: y + 7, class: 'nm', style: 'font-size:19px' }, svg), `q_{${q}}`);
    el('line', { x1: 34, y1: y, x2: meas.includes(q) ? 172 : 236, y2: y, class: 'w' }, svg);
    if (meas.includes(q)) {
      el('rect', { x: 150, y: y - 17, width: 34, height: 34, rx: 6, style: 'fill:#1f1a3d;stroke:var(--ink);stroke-width:2.5' }, svg);
      el('path', { d: `M${155},${y + 8}A12,12 0 0 1 ${179},${y + 8}M167,${y + 8}L175,${y - 6}`, style: 'fill:none;stroke:#fff;stroke-width:2.5;stroke-linecap:round' }, svg);
      el('line', { x1: 184, y1: y - 2.5, x2: 236, y2: y - 2.5, style: 'stroke:var(--ink);stroke-width:2' }, svg);
      el('line', { x1: 184, y1: y + 2.5, x2: 236, y2: y + 2.5, style: 'stroke:var(--ink);stroke-width:2' }, svg);
    }
  });
  el('rect', { x: 52, y: 8, width: 64, height: 144, rx: 10, style: 'fill:#fff1c2;stroke:var(--ink);stroke-width:2.5' }, svg);
  el('text', { x: 84, y: 82, 'text-anchor': 'middle', style: 'font-size:22px' }, svg).textContent = '|φ⟩';
  el('text', { x: 84, y: 102, 'text-anchor': 'middle', class: 'lbl', style: 'font-size:12px' }, svg).textContent = 'をつくる';
}
measCircuit('#pmC1', [0]);
measCircuit('#pmC2', [0, 1]);

/* ---------- 定理 8.1 の一般形の回路：U_k が 1 本ずつ ---------- */
{
  const svg = el('svg', { viewBox: '0 0 360 180', class: 'gsim' }, $('#tpGen')), ys = [26, 72, 118, 160], L = ['1', '2', '', 'n'];
  ys.forEach((y, k) => {
    if (k === 2) { el('text', { x: 180, y: 128, 'text-anchor': 'middle', style: 'font-size:24px' }, svg).textContent = '⋮'; return; }
    rich(el('text', { x: 46, y: y + 7, 'text-anchor': 'end', style: 'font-size:18px' }, svg), `|φ_{${L[k]}}⟩`);
    el('line', { x1: 52, y1: y, x2: 236, y2: y, class: 'w' }, svg);
    el('rect', { x: 124, y: y - 17, width: 40, height: 34, rx: 6, style: 'fill:#9a93bd;stroke:var(--ink);stroke-width:2.5' }, svg);
    rich(el('text', { x: 144, y: y + 7, 'text-anchor': 'middle', style: 'fill:#fff;font:700 18px "Cambria Math",serif' }, svg), `U_{${L[k]}}`);
    rich(el('text', { x: 242, y: y + 7, style: 'font-size:18px' }, svg), `U_{${L[k]}}|φ_{${L[k]}}⟩`);
  });
}

/* ---------- 古典回路：2 ビットそれぞれに NOT ---------- */
{
  const svg = $('#clSvg');
  [28, 74].forEach((y, k) => {
    el('text', { x: 2, y: y + 5, style: 'font-size:15px;font-style:italic' }, svg).textContent = k ? 'b' : 'a';
    el('line', { x1: 14, y1: y, x2: 54, y2: y, class: 'w' }, svg);
    el('path', { d: `M54,${y - 16} L90,${y} L54,${y + 16} Z`, style: 'fill:#fff;stroke:var(--ink);stroke-width:3' }, svg);
    el('circle', { cx: 96, cy: y, r: 6, style: 'fill:#fff;stroke:var(--ink);stroke-width:3' }, svg);
    el('line', { x1: 102, y1: y, x2: 150, y2: y, class: 'w' }, svg);
    el('text', { x: 124, y: y - 8, 'text-anchor': 'middle', style: 'font:800 12px sans-serif' }, svg).textContent = 'NOT';
  });
}

/* ---------- タイトル：n 量子ビットの量子回路（|0⟩^⊗n → H → 2ⁿ × 2ⁿ のユニタリ U → 測定） ---------- */
{
  const svg = $('#ttSvg'), ys = [30, 72, 114, 176], nm = ['q_{0}', 'q_{1}', 'q_{2}', 'q_{n−1}'];
  ys.forEach((y, q) => {
    rich(el('text', { x: 2, y: y + 6, style: 'font-size:17px;font-style:italic' }, svg), nm[q]);
    el('text', { x: 50, y: y + 6, style: 'font-size:17px' }, svg).textContent = '|0⟩';
    el('line', { x1: 80, y1: y, x2: 470, y2: y, class: 'w tt-w', style: `animation-delay:${q * .15}s` }, svg);
    el('rect', { x: 110, y: y - 14, width: 28, height: 28, rx: 5, style: 'fill:var(--blue);stroke:var(--ink);stroke-width:2' }, svg);
    el('text', { x: 124, y: y + 6, 'text-anchor': 'middle', style: 'fill:#fff;font:700 16px "Cambria Math",serif' }, svg).textContent = 'H';
    el('rect', { x: 410, y: y - 14, width: 30, height: 28, rx: 5, style: 'fill:#1f1a3d;stroke:var(--ink);stroke-width:2' }, svg);
    el('path', { d: `M415,${y + 7}A10,10 0 0 1 435,${y + 7}M425,${y + 7}L432,${y - 5}`, style: 'fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round' }, svg);
  });
  el('text', { x: 124, y: 150, 'text-anchor': 'middle', style: 'font-size:20px' }, svg).textContent = '⋮';
  el('text', { x: 64, y: 150, 'text-anchor': 'middle', style: 'font-size:20px' }, svg).textContent = '⋮';
  // 2ⁿ 個の状態がまとめて通っていく光
  ys.forEach((y, q) => el('circle', { cx: 80, cy: y, r: 6, class: 'tt-dot', style: `animation-delay:${q * .12}s` }, svg));
  el('rect', { x: 180, y: 12, width: 190, height: 182, rx: 12, style: 'fill:#fff1c2;stroke:var(--ink);stroke-width:3' }, svg);
  el('text', { x: 275, y: 96, 'text-anchor': 'middle', style: 'font-size:30px;font-style:italic' }, svg).textContent = 'U';
  el('text', { x: 275, y: 124, 'text-anchor': 'middle', class: 'lbl', style: 'font-size:14px' }, svg).textContent = '2ⁿ × 2ⁿ のユニタリ行列';
  $('#ttLbl').innerHTML = '<b>n</b> 量子ビット → <b>2ⁿ</b> 個の基底状態の重ね合わせを、まとめてユニタリ発展';
}
