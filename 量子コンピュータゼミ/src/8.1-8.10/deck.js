/* =====================================================================
   第8章 n 量子ビットの世界 ― スライド固有のスクリプト
   ===================================================================== */

/* ---------- 8.4 ユニタリ発展：2ⁿ × 2ⁿ のマス目 ---------- */
{
  const g = $('#ueGrid');
  stepper('#ueStp', 5, k => {
    const n = k + 1, s = 2 ** n;
    g.style.gridTemplateColumns = `repeat(${s},1fr)`;
    g.innerHTML = '<i></i>'.repeat(s * s);
    $('#ueLbl').innerHTML = `${n} 量子ビットのとき：<b>${s} × ${s}</b> のユニタリ行列`;
  }, 1500);
}

/* ---------- 8.5 一部の量子ビットの測定 ---------- */
function partial(id, m) {
  const T = [['000', 1], ['001', 2], ['010', 3], ['110', 4], ['111', 5]], N = 55;
  const GC8 = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--purple)'];
  const term = ([k, c], col = true) => `${c === 1 ? '' : c}|${col ? `<u>${k.slice(0, m)}</u>` : k.slice(0, m)}${k.slice(m)}⟩`;
  $(`#${id}St`).innerHTML = `<span>|φ⟩ = ${FI(1, '√55')}(${T.map(([k, c]) => `${c === 1 ? '' : c}|<span class="t" style="color:${GC8[parseInt(k.slice(0, m), 2)]};font-weight:900">${k.slice(0, m)}</span>${k.slice(m)}⟩`).join(' + ')})</span>`;
  const groups = [...Array(2 ** m)].map((_, p) => {
    const pre = bits(p, m), ts = T.filter(([k]) => k.startsWith(pre)), S = ts.reduce((s, [, c]) => s + c * c, 0);
    const state = !ts.length ? '—' : ts.length === 1 ? `|${ts[0][0]}⟩` : `${FI(1, '√' + S)}(${ts.map(t => term(t, false)).join(' + ')})`;
    return { pre, ts, S, html: `<div class="pmg" style="--gc:${GC8[p]}"><div class="gh">左側が |${pre}⟩</div>
      <div class="gt">${ts.length ? ts.map(t => `<span class="term">${term(t)}</span>`).join('') : '<span class="none">項がない</span>'}</div>
      <div class="gp"><span class="lab">確率</span>${ts.length ? `${FI(ts.map(([, c]) => c + '²').join(' + '), N)} = <b>${FI(S, N)}</b>` : '<b>0</b>'}</div>
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

/* ---------- 8.8 重ね合わせ状態に CCNOT ---------- */
function amp8(root) {
  root = $(root);
  root.innerHTML = [...Array(8)].map(() => '<div class="c"><span class="val"></span><div class="bar"></div></div>').join('');
  root.insertAdjacentHTML('afterend', `<div class="amp8k">${[...Array(8)].map((_, i) => `<span>|${bits(i, 3)}⟩</span>`).join('')}</div>`);
  const cs = [...root.children];
  return (a, mv = -1, hit = -1) => cs.forEach((c, i) => {
    c.querySelector('.bar').style.height = a[i] * 118 + 'px';
    c.querySelector('.bar').style.borderWidth = a[i] ? '' : '0';
    c.querySelector('.val').innerHTML = a[i] === 1 ? '1' : a[i] ? '½' : '';
    c.classList.toggle('mv', i === mv); c.classList.toggle('hit', i === hit);
  });
}
const S0 = [1, 0, 0, 0, 0, 0, 0, 0], S1 = [.5, 0, .5, 0, .5, 0, .5, 0], S2 = [.5, 0, .5, 0, .5, 0, 0, .5];
{
  const qc = drawQC('#spQC', { n: 3, init: true, ops: [{ g: 'H', q: 0, col: 0 }, { g: 'H', q: 1, col: 0 }, { g: 'CX', c: [0, 1], t: 2, col: 1 }], colW: 80 });
  const draw = amp8('#spAmp'), h = FI(1, 2);
  const eqs = ['|0⟩|0⟩|0⟩ = |000⟩', `(H ⊗ H ⊗ I)|000⟩ = ${h}(|000⟩ + |010⟩ + |100⟩ + |110⟩)`, `CCNOT → ${h}(|000⟩ + |010⟩ + |100⟩ + <b style="color:var(--purple)">|111⟩</b>)`];
  stepper('#spStp', 3, k => { qc.set(k - 1); draw([S0, S1, S2][k], k === 2 ? 7 : -1); $('#spEq').innerHTML = `<span>${eqs[k]}</span>`; }, 1900);
}
{
  const draw = amp8('#sp2Amp'), reset = () => { draw(S2); $('#sp2Res').innerHTML = 'どれも確率 <span class="math">|1/2|² = 1/4</span>'; };
  $('#sp2Go').onclick = e => {
    e.currentTarget.blur();
    const i = rnd([0, 2, 4, 7]), a = Array(8).fill(0); a[i] = 1;
    draw(a, -1, i);
  };
  $('#sp2Back').onclick = e => { e.currentTarget.blur(); reset(); };
  onEnter.sp2 = reset;
  reset();
}

/* ---------- 8.8 計算量 O(2²ⁿ) ---------- */
{
  const N = 10, ch = $('#cxChart');
  ch.innerHTML = [...Array(N)].map((_, i) => `<div class="c"><div class="bar"></div><span class="n">${i + 1}</span></div>`).join('');
  const cs = [...ch.children];
  stepper('#cxStp', N, k => {
    const n = k + 1;
    cs.forEach((c, i) => { c.querySelector('.bar').style.height = i <= k ? Math.max(4 ** (i + 1) / 4 ** n * 240, 1) + 'px' : '0'; c.classList.toggle('cur', i === k); });
    $('#cxNum').innerHTML = `${n} 量子ビットのとき：(2<sup>${n}</sup>)² = <b>${(4 ** n).toLocaleString()}</b> 回の計算`;
  }, 1200);
}

/* ---------- 8.9 オラクル（図 8.6） ---------- */
{
  const svg = $('#orSvg'), Y = [70, 160], x0 = 190, x1 = 330;
  Y.forEach((y, q) => {
    el('line', { x1: 80, y1: y, x2: 440, y2: y, class: 'w' }, svg);
    el('text', { x: 70, y: y + 8, 'text-anchor': 'end', style: 'font-size:26px' }, svg).textContent = q ? '|y⟩' : '|x⟩';
    el('text', { x: 450, y: y + 8, style: 'font-size:26px' }, svg).textContent = q ? '|y ⊕ f(x)⟩' : '|x⟩';
  });
  el('rect', { x: x0, y: 28, width: x1 - x0, height: 174, rx: 14, class: 'bx' }, svg);
  rich(el('text', { x: (x0 + x1) / 2, y: 100, class: 'bxt' }, svg), 'U_{f}');
  el('text', { x: (x0 + x1) / 2, y: 150, class: 'q' }, svg).textContent = '?';
}

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
    rich(el('text', { x: 365, y: y - 8, 'text-anchor': 'middle', style: 'font-size:19px' }, svg), `×α_{${k}}`);
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

/* ---------- 8.2 2ⁿ 個の複素数を並べたベクトル ---------- */
{
  const v = $('#gqVec');
  stepper('#gqStp', 5, k => {
    const n = k + 1, m = 2 ** n, h = Math.min(40, Math.floor(330 / m));
    v.innerHTML = [...Array(m)].map((_, i) => `<i style="height:${h}px;font-size:${Math.min(24, h - 6)}px">${h >= 20 ? `a<sub>${i}</sub>` : ''}</i>`).join('');
    $('#gqLbl').innerHTML = `${n} 量子ビットのとき：<br>2<sup>${n}</sup> = <b>${m}</b> 個の複素数`;
  }, 1500);
}

/* ---------- 8.2 ビット列 ↔ 10 進法 ↔ 状態ベクトル ---------- */
{
  const b = [1, 0, 0];
  const render = () => {
    const s = b.join(''), k = parseInt(s, 2);
    $('#bdIn').querySelectorAll('button').forEach((x, i) => { x.textContent = b[i]; x.classList.toggle('one', b[i] === 1); });
    $('#bdEq').innerHTML = `<b>|${s}⟩</b> = <b class="k">|${k}⟩</b>`;
    $('#bdVec').innerHTML = [...Array(8)].map((_, i) => `<div class="${i === k ? 'on' : ''}"><span class="ix">a<sub>${i}</sub></span><span class="v">${i === k ? 1 : 0}</span><span class="kt">|${bits(i, 3)}⟩ = |${i}⟩</span></div>`).join('');
  };
  $('#bdIn').innerHTML = '<span class="tiny">クリックで 0 / 1</span>' + [0, 1, 2].map(i => `<button data-i="${i}"></button>`).join('');
  $('#bdIn').querySelectorAll('button').forEach(x => x.addEventListener('click', () => { x.blur(); b[+x.dataset.i] ^= 1; render(); }));
  render();
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
  const parts = [svg => {}, svg => xg(svg, 180, 1), svg => cx(svg, 180), svg => { xg(svg, 130, 0); cx(svg, 180); xg(svg, 230, 0); }];
  parts.forEach((draw, k) => {
    const svg = el('svg', { viewBox: '0 0 420 160', class: 'gsim' }, $('#oi' + k));
    Y.forEach((y, q) => {
      el('line', { x1: 46, y1: y, x2: 316, y2: y, class: 'w' }, svg);
      el('text', { x: 40, y: y + 7, 'text-anchor': 'end', style: 'font-size:20px' }, svg).textContent = q ? '|y⟩' : '|x⟩';
      el('text', { x: 322, y: y + 7, style: 'font-size:20px' }, svg).textContent = q ? '|y ⊕ f(x)⟩' : '|x⟩';
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
