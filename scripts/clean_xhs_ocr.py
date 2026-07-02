import json
import re
from pathlib import Path

ROOT = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）")
OCR = ROOT / "extracted" / "xiaohongshu_teacher" / "notes_ocr.json"
OUT = ROOT / "extracted" / "xiaohongshu_teacher" / "伤寒论条文_小红书针道轩.md"


def extract_number(title):
    m = re.search(r"第(\d+)条", title)
    return int(m.group(1)) if m else 0


def clean_text(text):
    # Remove standalone "《伤寒论》" header line if present
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if lines and lines[0] in ("《伤寒论》", "伤寒论》"):
        lines = lines[1:]
    # Join broken lines that don't end with sentence punctuation
    s = "".join(lines)
    # Insert space around article number for readability
    s = re.sub(r"[\s\n]+", "", s)
    return s


def main():
    data = json.loads(OCR.read_text(encoding="utf-8"))
    entries = []
    for r in data:
        num = extract_number(r.get("display_title", ""))
        text = clean_text(r.get("ocr_text", ""))
        entries.append({
            "number": num,
            "title": r.get("display_title", ""),
            "note_id": r["note_id"],
            "text": text,
        })
    entries.sort(key=lambda x: x["number"], reverse=True)

    lines = ["# 《伤寒论》条文摘录（小红书「针道轩」）\n", f"> 共 {len(entries)} 条，来源见 extracted/xiaohongshu_teacher/\n", ""]
    for e in entries:
        lines.append(f"## {e['title']}")
        lines.append(f"- 笔记ID：{e['note_id']}")
        lines.append(f"- 条文编号：第 {e['number']} 条")
        lines.append("")
        lines.append(f"{e['text']}")
        lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"saved {OUT}")


if __name__ == "__main__":
    main()
