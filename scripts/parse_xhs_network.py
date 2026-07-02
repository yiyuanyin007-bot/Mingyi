import json
import requests
from pathlib import Path

ROOT = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）")
OUT_DIR = ROOT / "extracted" / "xiaohongshu_teacher"
OUT_DIR.mkdir(parents=True, exist_ok=True)
LIST_FILE = ROOT / "extracted" / "xhs_network_list2.json"
SESSION = "xiaohongshu-teacher-extract"


def fetch_detail(request_id):
    r = requests.post(
        "http://127.0.0.1:10086/command",
        json={"action": "network", "args": {"cmd": "detail", "requestId": request_id}, "session": SESSION},
    )
    return r.json()


def parse_notes(body):
    if not body or body.get("code") != 0:
        return [], body.get("msg") if body else "no body"
    notes = body.get("data", {}).get("notes", [])
    cursor = body.get("data", {}).get("cursor")
    has_more = body.get("data", {}).get("has_more")
    parsed = []
    for n in notes:
        user = n.get("user", {})
        interact = n.get("interact_info", {})
        cover = n.get("cover") or {}
        parsed.append(
            {
                "note_id": n.get("note_id"),
                "xsec_token": n.get("xsec_token"),
                "display_title": n.get("display_title", ""),
                "type": n.get("type"),
                "time": n.get("time"),
                "liked_count": interact.get("liked_count"),
                "sticky": interact.get("sticky"),
                "user_id": user.get("user_id"),
                "nickname": user.get("nickname"),
                "cover_url": cover.get("url_default", "") if isinstance(cover, dict) else "",
            }
        )
    return parsed, {"cursor": cursor, "has_more": has_more}


def main():
    req_list = json.loads(LIST_FILE.read_text(encoding="utf-8"))
    requests_data = req_list["data"]["requests"]
    posted_requests = [r for r in requests_data if "user_posted" in r["url"]]
    print(f"found {len(posted_requests)} user_posted requests")

    all_notes = []
    meta = []
    for req in posted_requests:
        rid = req["requestId"]
        detail = fetch_detail(rid)
        body = detail.get("data", {}).get("body", {})
        notes, info = parse_notes(body)
        print(f"request {rid}: {len(notes)} notes, cursor={info.get('cursor')}, has_more={info.get('has_more')}")
        all_notes.extend(notes)
        meta.append({"requestId": rid, "url": req["url"], "count": len(notes), **info})

    seen = set()
    unique = []
    for n in all_notes:
        if n["note_id"] in seen:
            continue
        seen.add(n["note_id"])
        unique.append(n)

    catalog = {"meta": meta, "total": len(unique), "notes": unique}
    (OUT_DIR / "notes_catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    md_lines = [
        "# 小红书「针道轩」伤寒笔记目录\n",
        f"> 共收录 {len(unique)} 条笔记\n",
        "> 来源：https://www.xiaohongshu.com/user/profile/577afc1450c4b4209c29137b\n",
        "",
    ]
    for n in unique:
        title = n["display_title"] or "（无标题）"
        url = f"https://www.xiaohongshu.com/explore/{n['note_id']}"
        md_lines.append(f"## {title}")
        md_lines.append(f"- 笔记ID：{n['note_id']}")
        md_lines.append(f"- 链接：{url}")
        md_lines.append(f"- xsec_token：{n['xsec_token']}")
        md_lines.append(f"- 发布时间：{n['time']}")
        md_lines.append(f"- 点赞：{n['liked_count']}")
        md_lines.append(f"- 封面：{n['cover_url']}")
        md_lines.append("")
    (OUT_DIR / "notes_catalog.md").write_text("\n".join(md_lines), encoding="utf-8")
    print(f"saved catalog: {OUT_DIR / 'notes_catalog.json'} and {OUT_DIR / 'notes_catalog.md'}")


if __name__ == "__main__":
    main()
