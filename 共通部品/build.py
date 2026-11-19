"""スライドの元ファイル（src/<名前>/）と共通部品から、1 ファイルで完結する HTML を作る。

使い方:  python3 共通部品/build.py 量子コンピュータゼミ/src/8.1-8.10

元ファイルのフォルダには次の 4 つを置く。
  config.json  … {"title": "<title>", "out": "出力先（このフォルダからの相対パス）", "theme": "theme-pop.css"}
  slides.html  … <section class="slide"> を並べたもの。{{1/√2}} と書くと分数になる
  deck.css     … このスライドだけの見た目
  deck.js      … このスライドだけのスクリプト（engine-head.js の関数が使える）
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = os.path.abspath(sys.argv[1])
read = lambda p: open(p, encoding='utf-8').read()
cfg = json.load(open(os.path.join(src, 'config.json'), encoding='utf-8'))


def frac(m):
    n, d = m.group(1).strip(), m.group(2).strip()
    return f'<span class="eq inline"><span class="frac"><span>{n}</span><span>{d}</span></span></span>'


slides = re.sub(r'\{\{([^}]+?)/([^}]+?)\}\}', frac, read(os.path.join(src, 'slides.html')))
assert '{{' not in slides, '{{ … }} の書き方が分数になっていない箇所がある'

css = read(os.path.join(HERE, cfg.get('theme', 'theme-pop.css'))) + '\n' + read(os.path.join(src, 'deck.css'))
js = '\n'.join([read(os.path.join(HERE, 'engine-head.js')), read(os.path.join(src, 'deck.js')), read(os.path.join(HERE, 'engine-tail.js'))])

html = read(os.path.join(HERE, 'template.html'))
for k, v in [('@@TITLE@@', cfg['title']), ('@@CSS@@', css), ('@@SLIDES@@', slides), ('@@JS@@', js)]:
    html = html.replace(k, v)
out = os.path.normpath(os.path.join(src, cfg['out']))
open(out, 'w', encoding='utf-8').write(html)
print(out, f'{len(html) // 1024} KB')
