#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
经方学习系统 · 解耦式提炼管道

三层架构：
  1. 脚本层（本文件）：扫描 raw/、格式提取、IO、写 extracted/
  2. 路由层：scripts/ai_router.py —— 为每个 Document 选择分析器
  3. 分析层：scripts/analyzers/*.py —— 具体提取算法（规则版 / LLM 版）

用法：
    python scripts/extract_pipeline.py
    python scripts/extract_pipeline.py --sample 100    # 仅处理前 100 个文件（用于测试）
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List

import sys
sys.path.insert(0, str(Path(__file__).parent))

from text_extractors import extract_text
from ai_router import get_router
from analyzers.base_analyzer import Candidate


ROOT = Path(__file__).parent.parent
RAW_DIR = ROOT / "raw"
EXTRACTED_DIR = ROOT / "extracted"
INDEX_FILE = EXTRACTED_DIR / "index.json"


def detect_source_type(path: Path) -> str:
    """根据相对路径判断来源类型。"""
    rel = path.relative_to(RAW_DIR)
    parts = rel.parts
    if not parts:
        return "unknown"
    first = parts[0]
    mapping = {
        "classical": "classical",
        "annotations": "annotations",
        "annotations-chm": "annotations-chm",
        "extracted-chm": "extracted-chm",
        "clinical": "clinical",
    }
    return mapping.get(first, "unknown")


def scan_raw_files(sample_limit: int = 0) -> List[Path]:
    """扫描 raw/ 下所有支持的文件。"""
    supported_exts = {'.txt', '.md', '.markdown', '.html', '.htm', '.doc', '.docx', '.pdf'}
    files = []
    for p in RAW_DIR.rglob('*'):
        if p.is_file() and p.suffix.lower() in supported_exts:
            files.append(p)
    files.sort()
    if sample_limit and sample_limit < len(files):
        files = files[:sample_limit]
    return files


def make_document(path: Path) -> "Document":
    """从文件路径创建 Document 对象。"""
    from analyzers.base_analyzer import Document
    source_type = detect_source_type(path)
    title = path.stem
    try:
        text = extract_text(path, source_type=source_type)
    except NotImplementedError as e:
        print(f"  [跳过] {path.name}: {e}")
        return None
    except Exception as e:
        print(f"  [错误] {path.name}: {e}")
        return None

    # 使用相对路径，保证候选和索引的可移植性
    try:
        rel_path = path.relative_to(ROOT)
    except ValueError:
        rel_path = path

    return Document(
        path=rel_path,
        source_type=source_type,
        title=title,
        text=text,
        metadata={"extracted_at": datetime.now().isoformat()}
    )


def write_candidates_to_markdown(candidates: List[Candidate], output_path: Path):
    """把候选列表写入 Markdown+YAML 文件。"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"# 提取候选：{output_path.stem}\n", f"\n生成时间：{datetime.now().isoformat()}\n\n"]

    for c in candidates:
        lines.append(f"## {c.id}\n\n")
        lines.append("```yaml\n")
        yaml_dict = {
            "id": c.id,
            "type": c.type,
            "source_file": c.source_file,
            "source_location": c.source_location,
            "confidence": c.confidence,
            "status": c.status,
            "reviewer_note": c.reviewer_note,
            "extracted_at": c.extracted_at,
        }
        lines.append(json.dumps(yaml_dict, ensure_ascii=False, indent=2))
        lines.append("\n```\n\n")
        lines.append("**原文：**\n")
        lines.append(f"> {c.raw_text}\n\n")
        if c.detected_elements:
            lines.append("**识别元素：**\n")
            for e in c.detected_elements:
                t = e.get("type", "")
                v = e.get("value", "")
                target = e.get("target_card", "")
                if target and target != v:
                    lines.append(f"- {t}: {v} → {target}\n")
                else:
                    lines.append(f"- {t}: {v}\n")
            lines.append("\n")
        lines.append("---\n\n")

    output_path.write_text("".join(lines), encoding='utf-8')


def update_index(documents: List["Document"], all_candidates: List[Candidate]):
    """更新 extracted/index.json 注册表。"""
    index = {"version": "1.0", "sources": [], "candidates": [], "cards": []}
    if INDEX_FILE.exists():
        try:
            index = json.loads(INDEX_FILE.read_text(encoding='utf-8'))
        except Exception:
            pass

    # 按来源聚合候选
    by_source = {}
    for c in all_candidates:
        by_source.setdefault(c.source_file, []).append(c)

    # 更新 sources
    existing_sources = {s["path"]: s for s in index.get("sources", [])}
    for doc in documents:
        rel_path = str(doc.path).replace('/', '\\')
        existing_sources[rel_path] = {
            "path": rel_path,
            "type": doc.source_type,
            "last_extracted": datetime.now().isoformat(),
            "candidate_count": len(by_source.get(str(doc.path), []))
        }
    index["sources"] = list(existing_sources.values())

    # 更新 candidates
    existing_cands = {c["id"]: c for c in index.get("candidates", [])}
    for c in all_candidates:
        existing_cands[c.id] = c.to_dict()
    index["candidates"] = list(existing_cands.values())

    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description="经方学习系统解耦式提炼管道")
    parser.add_argument("--sample", type=int, default=0, help="仅处理前 N 个文件（用于测试）")
    args = parser.parse_args()

    print(f"扫描 {RAW_DIR} ...")
    files = scan_raw_files(sample_limit=args.sample)
    print(f"发现 {len(files)} 个待处理文件")

    router = get_router()
    all_candidates = []
    documents = []

    for path in files:
        rel_path = path.relative_to(ROOT)
        print(f"处理: {rel_path}")
        doc = make_document(path)
        if not doc:
            continue
        documents.append(doc)

        analyzers = router.route(doc)
        if not analyzers:
            print(f"  [跳过] 没有合适的分析器")
            continue

        for analyzer in analyzers:
            try:
                cands = analyzer.analyze(doc)
                print(f"  [{analyzer.name}] 发现 {len(cands)} 个候选")
                all_candidates.extend(cands)
            except Exception as e:
                print(f"  [{analyzer.name}] 错误: {e}")

    # 按类型分组写入 Markdown
    groups = {}
    for c in all_candidates:
        groups.setdefault(c.type, []).append(c)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    for ctype, cands in groups.items():
        folder = EXTRACTED_DIR / (ctype + "s" if not ctype.endswith("s") else ctype + "s")
        if ctype == "source_card":
            folder = EXTRACTED_DIR / "source_cards"
        elif ctype == "experience_card":
            folder = EXTRACTED_DIR / "experiences"
        elif ctype == "formula_card":
            folder = EXTRACTED_DIR / "formula_elements"

        output_file = folder / f"batch_{timestamp}.md"
        write_candidates_to_markdown(cands, output_file)
        print(f"已写入: {output_file} ({len(cands)} 条)")

    update_index(documents, all_candidates)
    print(f"已更新索引: {INDEX_FILE}")
    print(f"总计候选: {len(all_candidates)}")


if __name__ == "__main__":
    main()
