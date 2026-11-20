// スライドの確認：JS エラー・はみ出し（本文・カード）・本文下の余白を一覧にし、必要なスライドだけ撮影する。
// 使い方:  node 共通部品/check.js <スライド.html> [撮影するページ番号（例 3,5-7 / all）] [出力フォルダ] [ipad]
// 動く図は最後のステップ、復習問題は答えを全部開いた状態、自動でつくる問題は問題と答えを出した状態で確認する。問題のあるページだけ表示する。
const { chromium, devices } = require('playwright');
const path = require('path');
(async () => {
  const [file, pagesArg = '', outDir = '.', mode] = process.argv.slice(2);
  const want = new Set();
  pagesArg.split(',').filter(Boolean).forEach(r => { const [a, b] = r.split('-').map(Number); for (let i = a; i <= (b || a); i++) want.add(i); });
  const b = await chromium.launch();
  const ctx = mode === 'ipad' ? await b.newContext({ ...devices['iPad Pro 11 landscape'] }) : await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(file) + '#1'); await p.waitForTimeout(400);
  const n = await p.evaluate(() => slides.length);
  for (let i = 0; i < n; i++) {
    await p.evaluate(i => go(i, true), i); await p.waitForTimeout(700);
    await p.evaluate(() => {
      const s = slides[cur];
      s.querySelectorAll('.stpr').forEach(r => { const d = r.querySelectorAll('.dots i'); d[d.length - 1].click(); });
      s.querySelectorAll('[data-quiz-all]').forEach(x => x.click());
      s.querySelectorAll('.rq-new').forEach(x => x.click()); s.querySelectorAll('.rq-ans').forEach(x => x.click());
      s.querySelectorAll('[data-autoplay].playing').forEach(x => !x.closest('.stpr') && x.click());
    });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const s = slides[cur], bad = [];
      s.querySelectorAll('.body, .card, .pmg, .qz, .tpc, .rvc8, .pmr-c, .sl, .defbox, .point').forEach(e => {
        if (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) bad.push(`${e.className}（縦 ${e.scrollHeight - e.clientHeight} / 横 ${e.scrollWidth - e.clientWidth}px）`);
      });
      const bd = s.querySelector('.body'), sr = s.getBoundingClientRect();
      const room = bd ? Math.round((sr.bottom - [...bd.querySelectorAll('*')].reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0)) / (sr.height / 720)) : null;
      return { bad, room };
    });
    if (r.bad.length || (r.room !== null && r.room < 60)) console.log(`${i + 1}: はみ出し ${JSON.stringify(r.bad)} 本文下の余白 ${r.room}px`);
    if (pagesArg === 'all' || want.has(i + 1)) await p.screenshot({ path: path.join(outDir, `${mode || 'pc'}${String(i + 1).padStart(2, '0')}.png`) });
  }
  console.log(`${n} 枚を確認。JS エラー: ${errs.length ? errs.join(' / ') : 'なし'}`);
  await b.close();
})();
