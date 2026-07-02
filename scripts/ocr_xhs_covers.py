import json
from pathlib import Path
from rapidocr_onnxruntime import RapidOCR

ROOT = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）")
COVERS = ROOT / "extracted" / "xiaohongshu_teacher" / "covers"
OUT_DIR = ROOT / "extracted" / "xiaohongshu_teacher"
CATALOG = OUT_DIR / "notes_catalog.json"


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    notes = catalog["notes"]
    ocr = RapidOCR()
    results = []
    for i, n in enumerate(notes, 1):
        note_id = n["note_id"]
        cover_path = COVERS / f"{note_id}.jpg"
        if not cover_path.exists():
            cover_path = next(COVERS.glob(f"{note_id}.*"), None)
        text = ""
        if cover_path and cover_path.exists():
            try:
                ocr_result = ocr(str(cover_path))
                lines = ocr_result[0] if ocr_result and ocr_result[0] else []
                texts = [line[1] for line in lines]
                text = "\n".join(texts)
            except Exception as e:
                text = f"[OCR ERROR: {e}]"
        results.append(
            {
                "note_id": note_id,
                "display_title": n.get("display_title", ""),
                "time": n.get("time"),
                "liked_count": n.get("liked_count"),
                "cover_url": n.get("cover_url", ""),
                "ocr_text": text,
            }
        )
        if i % 20 == 0:
            print(f"OCR {i}/{len(notes)}")
    (OUT_DIR / "notes_ocr.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    # Markdown
    md_lines = ["# 小红书「针道轩」伤寒笔记 OCR 摘录\n", f"> 共 {len(results)} 条\n", ""]
    for r in results:
        title = r["display_title"] or "（无标题）"
        md_lines.append(f"## {title}")
        md_lines.append(f"- 笔记ID：{r['note_id']}")
        if r.get("time"):
            md_lines.append(f"- 发布时间：{r['time']}")
        md_lines.append(f"- 点赞：{r['liked_count']}")
        md_lines.append("")
        md_lines.append("```")
        md_lines.append(r["ocr_text"])
        md_lines.append("```")
        md_lines.append("")
    (OUT_DIR / "notes_ocr.md").write_text("\n".join(md_lines), encoding="utf-8")
    print(f"saved {OUT_DIR / 'notes_ocr.json'} and {OUT_DIR / 'notes_ocr.md'}")


if __name__ == "__main__":
    main()
