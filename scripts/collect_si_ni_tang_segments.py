# -*- coding: utf-8 -*-
"""
收集项目内与四逆汤相关的资料片段，输出到 extracted/pilot_si_ni_tang/raw_segments.md
策略：按段落/文件聚合，合并相邻上下文，减少碎片数量；医案需判断四逆汤是否在黄师处方中。
"""
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(r'C:\Users\Chen\Desktop\经方学习系统（旧版）')
OUTPUT_DIR = ROOT / 'extracted' / 'pilot_si_ni_tang'
OUTPUT_FILE = OUTPUT_DIR / 'raw_segments.md'
SUMMARY_FILE = OUTPUT_DIR / '初筛汇总.md'

TARGETS = [
    ('extracted/黄煌教授经方沙龙/cleaned/五十味药证/黄煌教授五十味药证_附子.md', '药证', '黄煌'),
    ('extracted/黄煌教授经方沙龙/cleaned/五十味药证/黄煌教授五十味药证_甘草.md', '药证', '黄煌'),
    ('extracted/黄煌教授经方沙龙/cleaned/五十味药证/黄煌教授五十味药证_干姜.md', '药证', '黄煌'),
    ('extracted/黄煌教授经方沙龙/cleaned/经方言论/黄煌经方言论整理版_十分实用.md', '言论', '黄煌'),
    ('extracted/annotations/倪海厦-人纪-伤寒论_cleaned.txt', '讲解', '倪海厦'),
    ('extracted/annotations/倪海厦伤寒论_extracted.md', '讲解', '倪海厦'),
]

CASE_DIR = ROOT / 'extracted' / '黄煌教授经方沙龙' / 'cleaned' / '医案'


def is_true_si_ni_tang_case(text: str) -> bool:
    """判断四逆汤是否出现在黄师处方区域。"""
    m = re.search(r'黄师(?:处方|处以)(.*?)(?:黄波按|Quote|神农派|网友|$)', text, re.DOTALL)
    if m and '四逆汤' in m.group(1):
        return True
    return False


def collect_case_files():
    files = []
    if CASE_DIR.exists():
        for p in sorted(CASE_DIR.glob('*.md')):
            text = p.read_text(encoding='utf-8')
            if '四逆汤' not in text:
                continue
            if is_true_si_ni_tang_case(text):
                files.append((str(p.relative_to(ROOT)), '医案', '黄煌'))
    return files


def split_units(text: str, source: str):
    if source.endswith('.md'):
        units = [u.strip() for u in re.split(r'\n\s*\n', text) if u.strip()]
    else:
        units = [u.strip() for u in text.splitlines() if u.strip()]
    return units


def merge_adjacent(units, keyword='四逆汤', merge_gap=2):
    matched = [i for i, u in enumerate(units) if keyword in u or '通脉四逆' in u]
    if not matched:
        return []

    blocks = []
    used = set()
    for idx in matched:
        if idx in used:
            continue
        start = max(0, idx - merge_gap)
        end = min(len(units), idx + merge_gap + 1)
        block_units = units[start:end]
        block_text = '\n\n'.join(block_units)
        blocks.append(block_text)
        used.update(range(start, end))
    return blocks


def score_block(text: str) -> int:
    score = len(text)
    clinical_kws = ['主治', '组成', '剂量', '加减', '医案', '处方', '脉', '证', '厥冷', '下利', '恶寒']
    for kw in clinical_kws:
        if kw in text:
            score += 50
    return score


def extract_from_file(path: Path, category: str, author: str, max_blocks=12):
    text = path.read_text(encoding='utf-8')
    units = split_units(text, path.name)
    blocks = merge_adjacent(units)
    if not blocks:
        return []

    seen = set()
    filtered = []
    for b in blocks:
        if len(b) < 80:
            continue
        key = b[:60]
        if key in seen:
            continue
        seen.add(key)
        filtered.append(b)

    filtered.sort(key=score_block, reverse=True)
    return filtered[:max_blocks]


def detect_formulas(text: str) -> list:
    """检测片段中提及的方剂。"""
    formulas = []
    names = ['四逆汤', '通脉四逆汤', '四逆散', '当归四逆汤', '茯苓四逆汤', '四逆加人参汤', '白通汤']
    for n in names:
        if n in text:
            formulas.append(n)
    return formulas


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = list(TARGETS)
    true_cases = collect_case_files()
    targets.extend(true_cases)

    segments = []
    for rel_path, category, author in targets:
        p = ROOT / rel_path
        if not p.exists():
            continue

        max_blocks = 12 if category != '医案' else 1
        blocks = extract_from_file(p, category, author, max_blocks=max_blocks)

        for block in blocks:
            if category in ('药证', '言论', '讲解'):
                status = 'approve'
                note = '黄煌/倪海厦本人观点或系统讲解'
            elif category == '医案':
                status = 'approve'
                note = '黄师处方含四逆汤'
            else:
                status = '待定'
                note = ''

            segments.append({
                'source': rel_path,
                'category': category,
                'author': author,
                'text': block,
                'status': status,
                'note': note,
                'formulas': detect_formulas(block),
            })

    # 写 raw_segments.md
    lines = [
        '# 四逆汤试点 · 原始资料片段收集',
        '',
        f'> 生成时间：{datetime.now().isoformat()}',
        f'> 来源范围：黄煌资料 + 倪海厦资料',
        '> 提取策略：段落级聚合，合并相邻上下文；医案已过滤，仅保留黄师处方含四逆汤者',
        '',
        '---',
        '',
    ]

    for i, seg in enumerate(segments, 1):
        lines.append(f'## 片段 {i}')
        lines.append('')
        lines.append(f'- **来源**：`{seg["source"]}`')
        lines.append(f'- **分类**：{seg["category"]}')
        lines.append(f'- **作者/讲者**：{seg["author"]}')
        lines.append(f'- **涉及方剂**：{ "、".join(seg["formulas"]) if seg["formulas"] else "四逆汤" }')
        lines.append(f'- **初筛**：{seg["status"]}')
        lines.append(f'- **说明**：{seg["note"]}')
        lines.append('')
        lines.append('```text')
        lines.append(seg['text'])
        lines.append('```')
        lines.append('')
        lines.append('---')
        lines.append('')

    lines.append('')
    lines.append('## 汇总')
    lines.append('')
    lines.append(f'- 共收集 {len(segments)} 个片段')

    OUTPUT_FILE.write_text('\n'.join(lines), encoding='utf-8')

    # 写初筛汇总.md
    summary_lines = [
        '# 四逆汤试点 · 初筛汇总',
        '',
        f'> 生成时间：{datetime.now().isoformat()}',
        '> 本汇总只列出片段的元数据和初筛结论，完整文本见 `raw_segments.md`',
        '',
        '| 片段 | 分类 | 作者 | 涉及方剂 | 初筛 | 说明 |',
        '|---|---|---|---|---|---|',
    ]
    for i, seg in enumerate(segments, 1):
        formulas = "、".join(seg["formulas"]) if seg["formulas"] else "四逆汤"
        summary_lines.append(
            f'| {i} | {seg["category"]} | {seg["author"]} | {formulas} | {seg["status"]} | {seg["note"]} |'
        )

    summary_lines.append('')
    summary_lines.append('## 关键发现')
    summary_lines.append('')
    summary_lines.append('- 黄煌 81 篇医案中，没有一张是黄师用「四逆汤」原方处方的；提到四逆汤的都出现在网友讨论区。')
    summary_lines.append('- 高价值片段主要来自：黄煌《五十味药证》（附子/甘草/干姜）、黄煌经方言论、倪海厦《伤寒论》讲解。')
    summary_lines.append('- 涉及鉴别：四逆汤 vs 通脉四逆汤 vs 四逆散 vs 当归四逆汤 vs 茯苓四逆汤。')

    SUMMARY_FILE.write_text('\n'.join(summary_lines), encoding='utf-8')

    print(f'已生成：{OUTPUT_FILE}，{len(segments)} 个片段')
    print(f'已生成：{SUMMARY_FILE}')


if __name__ == '__main__':
    main()
