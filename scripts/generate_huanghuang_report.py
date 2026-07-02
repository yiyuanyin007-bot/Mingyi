# -*- coding: utf-8 -*-
"""生成黄煌教授经方沙龙清洗报告。"""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(r'C:\Users\Chen\Desktop\经方学习系统（旧版）')
CATALOG = ROOT / 'extracted' / '黄煌教授经方沙龙' / 'catalog.json'
REPORT = ROOT / 'docs' / '黄煌教授经方沙龙_清洗报告.md'

def main():
    entries = json.loads(CATALOG.read_text(encoding='utf-8'))
    total = len(entries)
    total_words = sum(e['word_count'] for e in entries)
    by_cat = Counter(e['category'] for e in entries)
    # 异常判定：明确的服务维护页，或字数过少可能为碎片/提取失败
    error_pages = [e for e in entries if '维护' in e['title'] or '无法访问' in e['title']]
    short_pages = [e for e in entries if e['word_count'] < 400]
    no_source = [e for e in entries if not e['source_url']]
    no_date = [e for e in entries if not e['date']]

    lines = [
        '# 黄煌教授经方沙龙 · 清洗报告',
        '',
        '> 来源：`raw/extracted-chm/58黄煌教授经方沙龙/`',
        '> 输出：`extracted/黄煌教授经方沙龙/`',
        '> 清洗脚本：`scripts/clean_huanghuang_chm.py`',
        '> 状态：仅清洗归档，未接入卡片系统',
        '',
        '## 一、总体统计',
        '',
        f'- 清洗文件总数：**{total}**',
        f'- 总字符数：**{total_words:,}**',
        f'- 平均每篇字符数：**{total_words // total if total else 0}**',
        '',
        '## 二、类别分布',
        '',
        '| 类别 | 篇数 | 占比 |',
        '|---|---|---|',
    ]
    for cat, n in sorted(by_cat.items(), key=lambda x: -x[1]):
        pct = round(n / total * 100, 1)
        lines.append(f'| {cat} | {n} | {pct}% |')

    lines.extend([
        '',
        '## 三、清洗策略',
        '',
        '1. **编码处理**：原始 HTML 声明为 `gb2312`，脚本优先使用 `gb2312` 解码，失败时回退 `gb18030`。',
        '2. **正文提取**：优先从 `<div id="sina_keyword_ad_area2" class="articalContent">` 提取；不存在时回退到 `<body>`。',
        '3. **噪声去除**：删除 `<script>`、`<style>`、空行、纯 `&nbsp;` 行。',
        '4. **短行合并**：将长度小于 20 字符且未以标点结尾的断行合并到上一行，减少 HTML 内联标签造成的碎片化。',
        '5. **元数据提取**：标题、作者（默认黄煌）、发布时间、新浪博客原文地址。',
        '6. **分类规则**：根据文件名前缀归入「常用经方 / 经验方 / 五十味药证 / 医案 / 临床经验 / 经方言论 / 其他」。',
        '',
        '## 四、输出文件',
        '',
        '- `extracted/黄煌教授经方沙龙/catalog.json`：所有文件元数据（标题、类别、原文地址、字数等）。',
        '- `extracted/黄煌教授经方沙龙/catalog.md`：按类别分组的人工可读目录。',
        '- `extracted/黄煌教授经方沙龙/cleaned/<类别>/<标题>.md`：清洗后的正文，含 JSON front matter。',
        '',
        '## 五、质量评估',
        '',
        f'- **明确异常页**：{len(error_pages)} 篇（服务维护提示页）',
        f'- **字数偏少（<400 字）**：{len(short_pages)} 篇（多为简短医案，需人工确认是否完整）',
        f'- **缺失原文地址**：{len(no_source)} 篇',
        f'- **缺失发布时间**：{len(no_date)} 篇',
        '',
    ])

    if error_pages:
        lines.append('### 异常页')
        lines.append('')
        for e in error_pages:
            lines.append(f"- `{e['title']}` — {e['word_count']} 字 — `{e['cleaned_path']}`")
        lines.append('')

    if short_pages:
        lines.append('### 字数偏少篇目（前 15）')
        lines.append('')
        for e in sorted(short_pages, key=lambda x: x['word_count'])[:15]:
            lines.append(f"- `{e['title']}` — {e['word_count']} 字 — `{e['cleaned_path']}`")
        lines.append('')

    lines.extend([
        '## 六、后续可做的事',
        '',
        '1. **医案结构化**：从 81 篇医案中提取「患者信息 / 主诉 / 处方 / 思路」，生成 `experience_cards.json`。',
        '2. **药证卡片化**：将 27 篇「五十味药证」拆成单味药卡片，补充到学习系统的药物说明。',
        '3. **常用经方/经验方链接化**：把「我常用的几张经方」「八味除烦汤」「八味解郁汤」等作为参考资料 URL 注入 `formula_cards.json`。',
        '4. **断行优化**：当前清洗仍有部分行因原文内联标签而断开，如需更高质量，可再跑一轮「括号/标点续行合并」。',
        '',
        '## 七、文件索引',
        '',
        '- 清洗脚本：`scripts/clean_huanghuang_chm.py`',
        '- 清洗目录：`extracted/黄煌教授经方沙龙/catalog.md`',
        '- 原始资料：`raw/extracted-chm/58黄煌教授经方沙龙/`',
        '',
    ])

    REPORT.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Report written to {REPORT}')

if __name__ == '__main__':
    main()
