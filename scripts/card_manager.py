#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
候选卡片生命周期管理器。

对 extracted/index.json 和 extracted/*/*.md 进行审阅操作：
  --list      列出候选
  --show      显示单条候选详情
  --approve   采纳候选
  --reject    拒绝候选
  --delete    删除候选
  --reextract 对单个来源文件重新跑提取

用法示例：
    python scripts/card_manager.py list --type source_card --limit 20
    python scripts/card_manager.py show src-d92648ca8c53
    python scripts/card_manager.py approve src-d92648ca8c53 --note "主方正确"
    python scripts/card_manager.py reject src-d92648ca8c53 --note "主方归属错误"
    python scripts/card_manager.py delete src-d92648ca8c53
    python scripts/card_manager.py reextract "extracted\\annotations\\倪海厦-人纪-伤寒论_cleaned.txt"
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ai_router import get_router
from extract_pipeline import EXTRACTED_DIR, INDEX_FILE, make_document
from extract_pipeline import write_candidates_to_markdown

ROOT = Path(__file__).parent.parent


def load_index() -> dict:
    """加载 extracted/index.json，不存在则返回空结构。"""
    if not INDEX_FILE.exists():
        return {"version": "1.0", "sources": [], "candidates": [], "cards": []}
    return json.loads(INDEX_FILE.read_text(encoding="utf-8"))


def save_index(index: dict):
    """保存 extracted/index.json。"""
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")


def find_markdown_file(candidate_id: str) -> Path | None:
    """根据候选 ID 找到所在的 Markdown 文件。"""
    for md_path in EXTRACTED_DIR.rglob("*.md"):
        text = md_path.read_text(encoding="utf-8")
        if f"## {candidate_id}" in text:
            return md_path
    return None


def parse_markdown_candidates(text: str) -> tuple[str, list[dict]]:
    """把 Markdown 审阅文件解析为 (header, entries)。"""
    parts = re.split(r"\n## ", text)
    header = parts[0]
    entries = []
    for part in parts[1:]:
        lines = part.split("\n", 1)
        cid = lines[0].strip()
        body = lines[1] if len(lines) > 1 else ""
        m = re.search(r"```yaml\s*\n(.*?)\n```", body, re.DOTALL)
        if m:
            try:
                data = json.loads(m.group(1))
            except json.JSONDecodeError:
                data = None
            before_yaml = body[: m.start()]
            after_yaml = body[m.end() :]
        else:
            data = None
            before_yaml = body
            after_yaml = ""
        entries.append(
            {"id": cid, "before_yaml": before_yaml, "after_yaml": after_yaml, "data": data}
        )
    return header, entries


def render_markdown(header: str, entries: list[dict]) -> str:
    """把解析后的结构重新渲染为 Markdown。"""
    chunks = [header.rstrip()]
    for e in entries:
        chunks.append(f"## {e['id']}")
        body_parts = [e["before_yaml"].rstrip()]
        if e["data"]:
            body_parts.append("```yaml\n" + json.dumps(e["data"], ensure_ascii=False, indent=2) + "\n```")
        body_parts.append(e["after_yaml"].rstrip())
        chunks.append("\n".join(p for p in body_parts if p))
    return "\n\n".join(chunks) + "\n"


def update_candidate_in_markdown(candidate_id: str, updates: dict) -> bool:
    """在所有 Markdown 审阅文件中更新指定候选的字段。"""
    found = False
    for md_path in EXTRACTED_DIR.rglob("*.md"):
        text = md_path.read_text(encoding="utf-8")
        header, entries = parse_markdown_candidates(text)
        changed = False
        for e in entries:
            if e["id"] == candidate_id and e["data"]:
                e["data"].update(updates)
                changed = True
        if changed:
            md_path.write_text(render_markdown(header, entries), encoding="utf-8")
            found = True
    return found


def delete_candidate_from_markdown(candidate_id: str) -> bool:
    """从 Markdown 审阅文件中删除指定候选。"""
    found = False
    for md_path in EXTRACTED_DIR.rglob("*.md"):
        text = md_path.read_text(encoding="utf-8")
        header, entries = parse_markdown_candidates(text)
        new_entries = [e for e in entries if e["id"] != candidate_id]
        if len(new_entries) != len(entries):
            md_path.write_text(render_markdown(header, new_entries), encoding="utf-8")
            found = True
    return found


def cmd_list(args):
    index = load_index()
    cands = index.get("candidates", [])
    if args.type:
        cands = [c for c in cands if c.get("type") == args.type]
    if args.status:
        cands = [c for c in cands if c.get("status") == args.status]
    if args.source:
        cands = [c for c in cands if args.source in c.get("source_file", "")]
    if args.confidence:
        cands = [c for c in cands if c.get("confidence") == args.confidence]

    total = len(cands)
    display = cands[: args.limit] if args.limit else cands
    print(f"共 {total} 条候选" + (f"，显示前 {len(display)} 条" if total > len(display) else ""))
    for c in display:
        note = c.get("reviewer_note", "")
        note_preview = f" | {note[:30]}" if note else ""
        print(
            f"{c['id']} | {c['type']:14} | {c['confidence']:6} | {c['status']:8} | "
            f"{c.get('source_file', '')}{note_preview}"
        )
    return 0


def cmd_show(args):
    index = load_index()
    for c in index.get("candidates", []):
        if c["id"] == args.id:
            print(json.dumps(c, ensure_ascii=False, indent=2))
            return 0
    print(f"未找到候选: {args.id}", file=sys.stderr)
    return 1


def cmd_approve(args):
    index = load_index()
    found = None
    for c in index.get("candidates", []):
        if c["id"] == args.id:
            found = c
            break
    if not found:
        print(f"未找到候选: {args.id}", file=sys.stderr)
        return 1

    updates = {"status": "approved", "reviewed_at": datetime.now().isoformat()}
    if args.note:
        updates["reviewer_note"] = args.note

    found.update(updates)
    save_index(index)
    update_candidate_in_markdown(args.id, updates)
    print(f"已采纳: {args.id}")
    return 0


def cmd_reject(args):
    index = load_index()
    found = None
    for c in index.get("candidates", []):
        if c["id"] == args.id:
            found = c
            break
    if not found:
        print(f"未找到候选: {args.id}", file=sys.stderr)
        return 1

    updates = {"status": "rejected", "reviewed_at": datetime.now().isoformat()}
    if args.note:
        updates["reviewer_note"] = args.note

    found.update(updates)
    save_index(index)
    update_candidate_in_markdown(args.id, updates)
    print(f"已拒绝: {args.id}")
    return 0


def cmd_delete(args):
    index = load_index()
    before = len(index.get("candidates", []))
    index["candidates"] = [c for c in index.get("candidates", []) if c["id"] != args.id]
    after = len(index["candidates"])
    if after == before:
        print(f"未找到候选: {args.id}", file=sys.stderr)
        return 1

    save_index(index)
    delete_candidate_from_markdown(args.id)
    print(f"已删除: {args.id}")
    return 0


def cmd_reextract(args):
    source_path = ROOT / args.source
    if not source_path.exists():
        print(f"来源文件不存在: {source_path}", file=sys.stderr)
        return 1

    print(f"重新提取: {source_path}")
    doc = make_document(source_path)
    if not doc:
        print("文档创建失败", file=sys.stderr)
        return 1

    router = get_router()
    analyzers = router.route(doc)
    if not analyzers:
        print("没有合适的分析器", file=sys.stderr)
        return 1

    new_candidates = []
    for analyzer in analyzers:
        try:
            cands = analyzer.analyze(doc)
            print(f"  [{analyzer.name}] 发现 {len(cands)} 个候选")
            new_candidates.extend(cands)
        except Exception as e:
            print(f"  [{analyzer.name}] 错误: {e}", file=sys.stderr)

    if not new_candidates:
        print("未产生新候选")
        return 0

    # 合并到 index.json：旧候选保留，新增候选追加
    index = load_index()
    existing_ids = {c["id"] for c in index.get("candidates", [])}
    added = 0
    for c in new_candidates:
        if c.id not in existing_ids:
            index["candidates"].append(c.to_dict())
            added += 1

    # 更新 sources 条目
    source_key = str(doc.path).replace("/", "\\")
    sources = {s["path"]: s for s in index.get("sources", [])}
    sources[source_key] = {
        "path": source_key,
        "type": doc.source_type,
        "last_extracted": datetime.now().isoformat(),
        "candidate_count": len([c for c in index["candidates"] if c.get("source_file") == source_key]),
    }
    index["sources"] = list(sources.values())

    save_index(index)

    # 写入按类型的 batch 文件
    groups = {}
    for c in new_candidates:
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
        output_file = folder / f"reextract_{timestamp}.md"
        write_candidates_to_markdown(cands, output_file)
        print(f"已写入: {output_file}")

    print(f"重新提取完成：新增 {added} 条候选（去重前 {len(new_candidates)} 条）")
    return 0


def main():
    parser = argparse.ArgumentParser(description="候选卡片生命周期管理器")
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="列出候选")
    p_list.add_argument("--type", choices=["source_card", "formula_card", "experience_card"], help="按类型过滤")
    p_list.add_argument("--status", choices=["pending", "approved", "rejected"], help="按状态过滤")
    p_list.add_argument("--confidence", choices=["high", "medium", "low"], help="按置信度过滤")
    p_list.add_argument("--source", help="按来源文件路径子串过滤")
    p_list.add_argument("--limit", type=int, default=50, help="最多显示条数（默认 50）")

    p_show = sub.add_parser("show", help="显示单条候选")
    p_show.add_argument("id", help="候选 ID")

    p_approve = sub.add_parser("approve", help="采纳候选")
    p_approve.add_argument("id", help="候选 ID")
    p_approve.add_argument("--note", help="审阅备注")

    p_reject = sub.add_parser("reject", help="拒绝候选")
    p_reject.add_argument("id", help="候选 ID")
    p_reject.add_argument("--note", help="审阅备注")

    p_delete = sub.add_parser("delete", help="删除候选")
    p_delete.add_argument("id", help="候选 ID")

    p_reextract = sub.add_parser("reextract", help="对单个来源文件重新跑提取")
    p_reextract.add_argument("source", help="来源文件相对路径")

    args = parser.parse_args()

    handlers = {
        "list": cmd_list,
        "show": cmd_show,
        "approve": cmd_approve,
        "reject": cmd_reject,
        "delete": cmd_delete,
        "reextract": cmd_reextract,
    }
    return handlers[args.command](args)


if __name__ == "__main__":
    sys.exit(main())
