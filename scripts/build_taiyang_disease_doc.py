#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""根据 v2 清洗标准，从 raw/ 目标文件夹中提取含「太阳病」的条文/语句，
整合为一份 Markdown 文档，供后续太阳病相关卡片检索使用。
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path, PurePath
from typing import List, Tuple

# 把 scripts 目录加入路径，以便复用 clean_text_v2
sys.path.insert(0, str(Path(__file__).parent))
from clean_text_v2 import clean_v2


ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
OUT_FILE = ROOT / "extracted" / "太阳病.md"

# 跳过的扩展名（二进制、样式、索引、已生成的提取文件）
SKIP_EXTS = {
    ".pdf", ".chm", ".doc", ".docx", ".css", ".js",
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".svg",
    ".hhc", ".hhk",
}
SKIP_NAME_PATTERNS = [
    re.compile(r"raw_.*_extracted\.md$"),  # 自动生成的目录/索引
]

# 句子结束符（含全角、半角及换行，古籍网页常混用 。与 ．）
SENT_END_RE = re.compile(r"([。；？！\n]|\.|．)")


def should_skip_file(path: Path) -> bool:
    ext = path.suffix.lower()
    if ext in SKIP_EXTS:
        return True
    if path.suffix.lower() == ".md" and "raw_" in path.name and "_extracted" in path.name:
        return True
    for pat in SKIP_NAME_PATTERNS:
        if pat.search(path.name):
            return True
    return False


def read_text(path: Path) -> str | None:
    """尝试多种常见编码读取中文古籍/网页文本。"""
    raw = path.read_bytes()
    for enc in ("utf-8", "gb18030", "gbk", "big5"):
        try:
            return raw.decode(enc)
        except (UnicodeDecodeError, LookupError):
            continue
    return None


def normalize_for_dedup(text: str) -> str:
    """仅保留汉字，用于判断两条是否重复。"""
    return re.sub(r"[^\u4e00-\u9fff]", "", text)


def classify_source(rel_path: Path) -> Tuple[str, str]:
    """根据相对路径返回 (大类, 来源名称)。"""
    parts = list(rel_path.parts)
    # 例如 raw\extracted-chm\《伤寒悬解》(1)\1293\110.htm
    # parts[0] 应为 'raw'
    if len(parts) >= 3:
        folder = parts[2]
    elif len(parts) == 2:
        folder = parts[1]
    else:
        folder = parts[-1]

    fname = rel_path.name

    # 倪海厦
    if "倪海夏" in folder or "倪海厦" in folder or "倪海夏" in fname or "倪海厦" in fname:
        return "注家讲解", "倪海厦《人纪·伤寒论》"

    # CHM 经典/注家
    if "伤寒悬解" in folder:
        return "经典注家", "黄元御《伤寒悬解》"
    if "伤寒法祖" in folder:
        return "经典注家", "《伤寒法祖》"
    if "伤寒九十论" in folder:
        return "经典注家", "许叔微《伤寒九十论》"
    if "伤寒心法要诀" in folder:
        return "经典注家", "《伤寒心法要诀》"
    if "伤寒直格" in folder:
        return "经典注家", "《伤寒直格》"
    if "伤寒补例" in folder:
        return "经典注家", "《伤寒补例》"
    # 其他以《伤寒》开头的 CHM 书籍统一归为经典注家
    if folder.startswith("《伤寒"):
        return "经典注家", folder

    # 经典原文（目前 .doc 被跳过，仅做预留）
    if "classical" in parts:
        return "经典原文", folder

    # 其他 annotation
    if "annotations" in parts:
        return "其他注解", folder

    return "其他来源", folder


def split_into_clauses(text: str) -> List[str]:
    """把文本拆成句子/小句。"""
    # 先按结束符切分，保留结束符
    pieces = SENT_END_RE.split(text)
    clauses = []
    buf = ""
    for piece in pieces:
        buf += piece
        if SENT_END_RE.fullmatch(piece):
            stripped = buf.strip()
            if stripped:
                clauses.append(stripped)
            buf = ""
    if buf.strip():
        clauses.append(buf.strip())
    return clauses


def is_quality_clause(clause: str) -> bool:
    """质量过滤：剔除目录、索引、链接碎片等噪声。"""
    chinese = re.findall(r"[\u4e00-\u9fff]", clause)
    chinese_len = len(chinese)
    total_len = len(clause)
    digits = len(re.findall(r"\d", clause))

    if chinese_len < 10 or chinese_len > 500:
        return False
    if chinese_len / total_len < 0.4:
        return False
    if digits / total_len > 0.2:
        return False
    # 目录行常含大量点号与数字
    if clause.count(".") > chinese_len * 0.3:
        return False
    # 跳过纯章节标题（如 "辨太阳病脉证并治法上 9 辨太阳病脉证并 41 ."）
    if re.fullmatch(r"[\d\s\.A-Za-z一二三四五六七八九十百千]+", clause):
        return False
    return True


def extract_taiyang_clauses(text: str) -> List[str]:
    """提取所有含「太阳病」且质量合格的句子。"""
    clauses = split_into_clauses(text)
    results = []
    for clause in clauses:
        if "太阳病" not in clause:
            continue
        if not is_quality_clause(clause):
            continue
        results.append(clause)
    return results


def main():
    # 结构：{ (category, source_name): [ {clause, norm, files} ... ] }
    groups: dict[Tuple[str, str], List[dict]] = {}
    stats = {
        "files_scanned": 0,
        "files_matched": 0,
        "occurrences": 0,
        "clauses_kept": 0,
    }

    for path in sorted(RAW_DIR.rglob("*")):
        if not path.is_file():
            continue
        if should_skip_file(path):
            continue

        stats["files_scanned"] += 1
        text = read_text(path)
        if text is None:
            continue
        if "太阳病" not in text:
            continue

        stats["files_matched"] += 1
        stats["occurrences"] += text.count("太阳病")

        rel = path.relative_to(ROOT)
        category, source_name = classify_source(rel)

        # 来源感知清洗
        cleaned = clean_v2(text, str(rel))
        clauses = extract_taiyang_clauses(cleaned)

        group = groups.setdefault((category, source_name), [])
        seen_norms = {normalize_for_dedup(item["clause"]) for item in group}

        for clause in clauses:
            norm = normalize_for_dedup(clause)
            if not norm or norm in seen_norms:
                continue
            seen_norms.add(norm)
            group.append({
                "clause": clause,
                "norm": norm,
                "files": [str(rel)],
            })
            stats["clauses_kept"] += 1

    # 按 category / source_name 排序，并剔除空组
    sorted_groups = sorted(
        ((k, v) for k, v in groups.items() if v),
        key=lambda x: (x[0][0], x[0][1]),
    )

    # 生成 Markdown
    lines = [
        "# 太阳病条文汇编",
        "",
        f"> 生成时间：{datetime.now().isoformat(timespec='minutes')}",
        "> 清洗策略：v2（来源感知 + 鲁棒 HTML 清洗 + 激进合并）",
        f"> 扫描文件：{stats['files_scanned']} 个",
        f"> 命中文件：{stats['files_matched']} 个",
        f"> 原文出现「太阳病」次数：{stats['occurrences']} 次",
        f"> 去重后保留语句：{stats['clauses_kept']} 条",
        "",
        "---",
        "",
    ]

    # 目录（仅保留非空组）
    lines.append("## 目录")
    lines.append("")
    for (category, source_name), items in sorted_groups:
        anchor = f"{category}-{source_name}".replace("《", "").replace("》", "").replace("·", "")
        anchor = re.sub(r"[^\w\u4e00-\u9fff]", "-", anchor)
        lines.append(f"- [{source_name}（{category}）](#{anchor}) — {len(items)} 条")
    lines.append("")
    lines.append("---")
    lines.append("")

    for (category, source_name), items in sorted_groups:
        anchor = f"{category}-{source_name}".replace("《", "").replace("》", "").replace("·", "")
        anchor = re.sub(r"[^\w\u4e00-\u9fff]", "-", anchor)
        lines.append(f"## {source_name}（{category}） {{#{anchor}}}")
        lines.append("")
        for idx, item in enumerate(items, 1):
            lines.append(f"### {idx}")
            lines.append("")
            lines.append(item["clause"])
            lines.append("")
            # 列出一个代表性来源文件
            src_display = item["files"][0].replace("\\", "/")
            lines.append(f"- 来源：`{src_display}`")
            lines.append("")
        lines.append("---")
        lines.append("")

    OUT_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"已生成 {OUT_FILE}")
    print(f"统计：扫描 {stats['files_scanned']}，命中 {stats['files_matched']}，"
          f"出现 {stats['occurrences']} 次，保留 {stats['clauses_kept']} 条")


if __name__ == "__main__":
    main()
