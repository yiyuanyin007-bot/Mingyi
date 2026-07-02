# -*- coding: utf-8 -*-
"""
清洗 58黄煌教授经方沙龙 CHM 提取出的 HTML 文件。

- 输入：raw/extracted-chm/58黄煌教授经方沙龙/黄煌教授经方沙龙/*.html
- 输出：extracted/黄煌教授经方沙龙/cleaned/<类别>/<标题>.md
- 同时生成：extracted/黄煌教授经方沙龙/catalog.json 与 catalog.md

本脚本只做清洗归档，不修改现有卡片数据。
"""
import json
import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(r'C:\Users\Chen\Desktop\经方学习系统（旧版）')
INPUT_DIR = ROOT / 'raw' / 'extracted-chm' / '58黄煌教授经方沙龙' / '黄煌教授经方沙龙'
OUTPUT_DIR = ROOT / 'extracted' / '黄煌教授经方沙龙'
CLEANED_DIR = OUTPUT_DIR / 'cleaned'

# 根据文件名前缀判断类别
CATEGORY_PATTERNS = [
    (r'黄煌教授\s*我常用的几张经方', '常用经方'),
    (r'黄煌教授经验方', '经验方'),
    (r'黄煌教授五十味药证', '五十味药证'),
    (r'黄煌教授医案', '医案'),
    (r'黄煌教授用', '临床经验'),
    (r'黄煌教授治疗', '临床经验'),
    (r'黄煌经方言论', '经方言论'),
]


def guess_category(filename):
    for pat, cat in CATEGORY_PATTERNS:
        if re.search(pat, filename):
            return cat
    return '其他'


def safe_filename(name):
    """生成安全的文件/目录名，保留中文。"""
    name = re.sub(r'[\\/:*?"<>|]', '_', name)
    name = re.sub(r'\s+', '_', name)
    return name.strip('_')[:80]


def extract_meta(soup, raw_text):
    """从 HTML 中提取标题、作者、日期、原文地址。"""
    title = ''
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    # 如果 title 是乱码或空，尝试第一个大字号标题
    if not title or len(title) < 2:
        big = soup.find('font', size='5')
        if big:
            title = big.get_text(strip=True)

    author = '黄煌'
    date = ''
    source_url = ''

    # 在原始 HTML 文本中找作者、日期、原文地址
    # CHM 页面通常只有「日期」「原文地址」，「作者」默认识别为黄煌
    m = re.search(r'日期[:：]\s*([0-9]{4}-[0-9]{2}-[0-9]{2}\s*[0-9]{2}:[0-9]{2})', raw_text)
    if m:
        date = m.group(1).strip()
    m = re.search(r'原文地址[:：]\s*<a[^>]+href=(?:["\'])?([^"\'>\s]+)', raw_text)
    if m:
        source_url = m.group(1).strip()

    return title, author, date, source_url


def clean_text(soup):
    """提取并清洗正文。"""
    # 优先从 sina_keyword_ad_area2 提取
    content_div = soup.find('div', id='sina_keyword_ad_area2') or soup.find('div', class_='articalContent')
    if content_div:
        text = content_div.get_text(separator='\n')
    else:
        # 去掉 script/style
        for tag in soup(['script', 'style']):
            tag.decompose()
        text = soup.get_text(separator='\n')

    # 解码 HTML 实体已经由 BeautifulSoup 处理，这里再处理残留
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # 去掉纯 &nbsp; 或空格行
        if re.fullmatch(r'[\s\u00a0]+', line):
            continue
        cleaned.append(line)

    # 合并过短的断行：如果一行很短且下一行也不以标点结尾，则合并
    merged = []
    for line in cleaned:
        if merged and len(merged[-1]) < 20 and not merged[-1].endswith(('。', '；', '：', '？', '！', '、', '，', '.', ';', ':', '?', '!')):
            merged[-1] = merged[-1] + line
        else:
            merged.append(line)

    return '\n\n'.join(merged)


def process_html(html_path):
    """处理单个 HTML 文件，返回元数据。"""
    raw_bytes = html_path.read_bytes()
    try:
        raw_text = raw_bytes.decode('gb2312', errors='ignore')
    except Exception:
        raw_text = raw_bytes.decode('gb18030', errors='ignore')

    soup = BeautifulSoup(raw_text, 'html.parser')
    title, author, date, source_url = extract_meta(soup, raw_text)
    body = clean_text(soup)

    if not title:
        title = html_path.stem

    category = guess_category(html_path.name)
    cat_dir = CLEANED_DIR / safe_filename(category)
    cat_dir.mkdir(parents=True, exist_ok=True)

    out_name = safe_filename(title) + '.md'
    out_path = cat_dir / out_name

    # 避免覆盖时重名
    counter = 1
    original_out_path = out_path
    while out_path.exists():
        out_path = original_out_path.with_name(
            original_out_path.stem + f'_{counter}' + original_out_path.suffix
        )
        counter += 1

    word_count = len(body)
    front_matter = {
        'title': title,
        'category': category,
        'author': author,
        'date': date,
        'source_url': source_url,
        'original_file': str(html_path.relative_to(ROOT)),
        'cleaned_path': str(out_path.relative_to(ROOT)),
        'word_count': word_count,
    }

    md_content = '---\n' + json.dumps(front_matter, ensure_ascii=False, indent=2) + '\n---\n\n' + body + '\n'
    out_path.write_text(md_content, encoding='utf-8')

    return front_matter


def build_catalog(entries):
    """生成 catalog.json 与 catalog.md。"""
    catalog_path = OUTPUT_DIR / 'catalog.json'
    catalog_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')

    lines = ['# 黄煌教授经方沙龙 · 清洗目录\n']
    lines.append(f'> 共 {len(entries)} 篇，按类别分组\n')

    by_cat = {}
    for e in entries:
        by_cat.setdefault(e['category'], []).append(e)

    for cat in sorted(by_cat.keys()):
        items = by_cat[cat]
        lines.append(f'\n## {cat}（{len(items)} 篇）\n')
        for e in items:
            lines.append(f"- **{e['title']}**")
            if e['date']:
                lines.append(f"  - 时间：{e['date']}")
            if e['source_url']:
                lines.append(f"  - 原文：<{e['source_url']}>")
            lines.append(f"  - 文件：`{e['cleaned_path']}`")
            lines.append(f"  - 字数：{e['word_count']}")
            lines.append('')

    (OUTPUT_DIR / 'catalog.md').write_text('\n'.join(lines), encoding='utf-8')


def main():
    if not INPUT_DIR.exists():
        print(f'输入目录不存在：{INPUT_DIR}')
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    html_files = sorted(INPUT_DIR.glob('*.html'))
    print(f'发现 {len(html_files)} 个 HTML 文件')

    entries = []
    for p in html_files:
        try:
            meta = process_html(p)
            entries.append(meta)
            print(f'  [OK] {meta["category"]} / {meta["title"]} ({meta["word_count"]} 字)')
        except Exception as e:
            print(f'  [ERR] {p.name}: {e}')

    build_catalog(entries)

    # 简单统计
    total_words = sum(e['word_count'] for e in entries)
    by_cat = {}
    for e in entries:
        by_cat[e['category']] = by_cat.get(e['category'], 0) + 1

    print('\n--- 统计 ---')
    print(f'总篇数：{len(entries)}')
    print(f'总字数：{total_words}')
    for cat, n in sorted(by_cat.items(), key=lambda x: -x[1]):
        print(f'  {cat}: {n} 篇')
    print(f'目录文件：{OUTPUT_DIR / "catalog.json"}')
    print(f'清洗文件输出到：{CLEANED_DIR}')


if __name__ == '__main__':
    main()
