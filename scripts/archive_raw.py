# -*- coding: utf-8 -*-
"""
按照 PROJECT-STRUCTURE.md 规范整理 raw/ 目录。

整改项：
1. raw/annotations/ 中的提取产物（*_extracted.md / *_cleaned.txt）→ extracted/annotations/
2. raw/annotations-chm/ 中的已解压 CHM 目录 → raw/extracted-chm/
3. raw/extracted-chm/ 中的 .chm 源文件 → raw/annotations-chm/
4. raw/annotations-chm/ 中的临时/无关文件 → raw/archive/
5. 删除 raw/annotations/ 下的空目录
6. 生成 raw/archive/归档日志.md
"""
import shutil
from pathlib import Path
from datetime import datetime

ROOT = Path(r'C:\Users\Chen\Desktop\经方学习系统（旧版）')
RAW = ROOT / 'raw'
ARCHIVE = RAW / 'archive'
EXTRACTED_ANNOTATIONS = ROOT / 'extracted' / 'annotations'

MOVES = [
    # (来源, 目标, 说明)
    (RAW / 'annotations' / 'raw_倪海厦伤寒论_extracted.md',
     EXTRACTED_ANNOTATIONS / '倪海厦伤寒论_extracted.md',
     '提取产物：倪海厦伤寒论'),

    (RAW / 'annotations' / 'raw_桂枝类方_extracted.md',
     EXTRACTED_ANNOTATIONS / '桂枝类方_extracted.md',
     '提取产物：桂枝类方'),

    (RAW / 'annotations' / '倪海夏-人纪-伤寒论_cleaned.txt',
     EXTRACTED_ANNOTATIONS / '倪海厦-人纪-伤寒论_cleaned.txt',
     '清洗产物：倪海厦伤寒论'),

    (RAW / 'annotations-chm' / '3伤寒金匮经方',
     RAW / 'extracted-chm' / '3伤寒金匮经方',
     '已解压 CHM：3伤寒金匮经方'),

    (RAW / 'annotations-chm' / '57冯世纶教授经方师承',
     RAW / 'extracted-chm' / '57冯世纶教授经方师承',
     '已解压 CHM：57冯世纶教授经方师承'),

    (RAW / 'annotations-chm' / '60倪海厦大师经方讲座',
     RAW / 'extracted-chm' / '60倪海厦大师经方讲座',
     '已解压 CHM：60倪海厦大师经方讲座'),

    (RAW / 'annotations-chm' / '64伤寒系列',
     RAW / 'extracted-chm' / '64伤寒系列',
     '已解压 CHM：64伤寒系列'),

    (RAW / 'extracted-chm' / '58黄煌教授经方沙龙.chm',
     RAW / 'annotations-chm' / '58黄煌教授经方沙龙.chm',
     'CHM 源文件：58黄煌教授经方沙龙'),

    (RAW / 'annotations-chm' / 'temp_yizongjinjian.pdf',
     ARCHIVE / 'temp_yizongjinjian.pdf',
     '临时文件：医宗金鉴 PDF'),
]

EMPTY_DIRS_TO_REMOVE = [
    RAW / 'annotations' / 'nihaixia',
]


def safe_move(src: Path, dst: Path):
    if not src.exists():
        return f'[SKIP] 源不存在：{src.relative_to(ROOT)}'
    if dst.exists():
        return f'[SKIP] 目标已存在：{dst.relative_to(ROOT)}'
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst))
    return f'[MOVE] {src.relative_to(ROOT)}\n  → {dst.relative_to(ROOT)}'


def main():
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    log_lines = [
        '# raw/ 目录归档日志',
        '',
        f'- 时间：{datetime.now().isoformat()}',
        f'- 执行脚本：{Path(__file__).relative_to(ROOT)}',
        '',
        '## 移动记录',
        '',
    ]

    for src, dst, note in MOVES:
        result = safe_move(src, dst)
        log_lines.append(f'- {note}')
        log_lines.append(f'  {result}')
        log_lines.append('')

    log_lines.append('## 删除的空目录\n')
    for d in EMPTY_DIRS_TO_REMOVE:
        if d.exists() and d.is_dir() and not any(d.iterdir()):
            d.rmdir()
            log_lines.append(f'- [REMOVED] {d.relative_to(ROOT)}')
        else:
            log_lines.append(f'- [SKIP] {d.relative_to(ROOT)}（不存在或非空）')

    log_path = ARCHIVE / f'归档日志_{datetime.now().strftime("%Y-%m-%d")}.md'
    log_path.write_text('\n'.join(log_lines), encoding='utf-8')
    print(f'归档完成，日志：{log_path}')


if __name__ == '__main__':
    main()
