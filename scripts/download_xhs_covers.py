import json
import requests
from pathlib import Path

ROOT = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）")
CATALOG = ROOT / "extracted" / "xiaohongshu_teacher" / "notes_catalog.json"
IMG_DIR = ROOT / "extracted" / "xiaohongshu_teacher" / "covers"
IMG_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def main():
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    notes = catalog["notes"]
    results = []
    for i, n in enumerate(notes, 1):
        url = n.get("cover_url", "")
        note_id = n["note_id"]
        if not url:
            results.append({"note_id": note_id, "status": "no_url"})
            continue
        ext = url.split("!")[0].split(".")[-1]
        if ext not in ("jpg", "jpeg", "png", "webp"):
            ext = "jpg"
        path = IMG_DIR / f"{note_id}.{ext}"
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                path.write_bytes(r.content)
                results.append({"note_id": note_id, "status": "ok", "size": len(r.content), "path": str(path)})
            else:
                results.append({"note_id": note_id, "status": f"http_{r.status_code}"})
        except Exception as e:
            results.append({"note_id": note_id, "status": "error", "msg": str(e)})
        if i % 20 == 0:
            print(f"downloaded {i}/{len(notes)}")
    ok = sum(1 for r in results if r["status"] == "ok")
    print(f"done: {ok}/{len(notes)} ok")
    (IMG_DIR / "_download_log.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
