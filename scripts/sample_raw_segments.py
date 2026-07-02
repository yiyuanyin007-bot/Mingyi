#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 raw/ 源文件中抽取 200-300 字的代表性片段，用于清洗原则探索。

抽取策略：
1. 优先从已有候选的 source_location 附近抽取（这些位置已经被算法识别为"可能重要"）。
2. 覆盖不同来源：倪海厦 txt、伤寒悬解 CHM、伤寒法祖 CHM、伤寒九十论 CHM 等。
3. 每个片段长度 200-300 字，保留原始上下文（不清洗）。
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
RAW_DIR = ROOT / "raw"
INDEX_FILE = ROOT / "extracted" / "index.json"
OUTPUT_FILE = ROOT / "extracted" / "sample_segments_raw.md"


def load_candidates():
    if not INDEX_FILE.exists():
        return []
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        idx = json.load(f)
    return idx.get("candidates", [])


def read_raw_text(source_file: str) -> str:
    path = ROOT / source_file
    if not path.exists():
        return ""
    raw = path.read_bytes()
    for enc in ("utf-8", "gb18030", "gbk", "gb2312"):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode("utf-8", errors="replace")


def extract_segment(text: str, keyword: str, radius: int = 150) -> str:
    """以 keyword 为中心，截取半径 radius 内的文本，再向前后扩展到 200-300 字边界。"""
    idx = text.find(keyword)
    if idx == -1:
        # 随机取一段
        if len(text) <= 300:
            return text
        start = random.randint(0, len(text) - 300)
        return text[start : start + 300]

    start = max(0, idx - radius)
    end = min(len(text), idx + radius)
    # 向前扩展到句子开头
    while start > 0 and text[start] not in "\n。；？！":
        start -= 1
    if start > 0:
        start += 1
    # 向后扩展到句子结尾或 300 字
    while end < len(text) and end - start < 300 and text[end] not in "\n。；？！":
        end += 1
    if end < len(text) and text[end] in "。；？！":
        end += 1
    segment = text[start:end].strip()
    # 确保长度在 200-300 之间
    if len(segment) < 200 and end < len(text):
        segment = text[start : min(len(text), start + 300)].strip()
    return segment


def main():
    candidates = load_candidates()
    # 按来源分组
    by_source = {}
    for c in candidates:
        by_source.setdefault(c["source_file"], []).append(c)

    # 选择代表性的来源
    target_sources = [
        ("raw\\annotations\\倪海夏-人纪- 伤寒论.txt", 4),
        ("extracted\\annotations\\倪海厦-人纪-伤寒论_cleaned.txt", 2),
        ("raw\\extracted-chm\\《伤寒悬解》(1)\\1293\\510.htm", 2),
        ("raw\\extracted-chm\\《伤寒法祖》\\837\\12.htm", 2),
        ("raw\\extracted-chm\\《伤寒九十论》\\306\\18.htm", 1),
        ("raw\\extracted-chm\\《伤寒心法要诀》\\881\\31.htm", 1),
    ]

    samples = []
    for source_file, count in target_sources:
        text = read_raw_text(source_file)
        if not text:
            continue
        cands = by_source.get(source_file, [])
        if cands:
            chosen = random.sample(cands, min(count, len(cands)))
        else:
            chosen = []
        for c in chosen:
            raw = c.get("raw_text", "")
            # 取 raw_text 中第一个方名或症状作为 keyword
            keyword = ""
            for el in c.get("detected_elements", []):
                if el.get("type") == "formula_name":
                    keyword = el.get("value", "")
                    break
            if not keyword and raw:
                keyword = raw[:10]
            segment = extract_segment(text, keyword)
            samples.append({
                "source_file": source_file,
                "candidate_id": c.get("id", ""),
                "confidence": c.get("confidence", ""),
                "segment": segment,
            })

    # 写 Markdown
    lines = ["# 原始文本抽样（用于清洗原则探索）\n", f"共 {len(samples)} 个片段\n\n"]
    for i, s in enumerate(samples, 1):
        lines.append(f"## 片段 {i}\n\n")
        lines.append(f"- 来源：{s['source_file']}\n")
        lines.append(f"- 候选 ID：{s['candidate_id']}\n")
        lines.append(f"- 原置信度：{s['confidence']}\n")
        lines.append(f"- 字数：{len(s['segment'])}\n\n")
        lines.append("```\n")
        lines.append(s["segment"])
        lines.append("\n```\n\n---\n\n")

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text("".join(lines), encoding="utf-8")
    print(f"已写入 {OUTPUT_FILE}，共 {len(samples)} 个片段")


if __name__ == "__main__":
    main()
