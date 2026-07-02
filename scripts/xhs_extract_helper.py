import requests
import json
import sys
from pathlib import Path

BASE = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）/extracted")
SESSION = "xiaohongshu-teacher-extract"
URL = "http://127.0.0.1:10086/command"


def send(action, args=None):
    payload = {"action": action, "args": args or {}, "session": SESSION}
    r = requests.post(URL, json=payload)
    return r.json()


def save(name, data):
    path = BASE / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved {path}")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "snapshot"
    if cmd == "snapshot":
        res = send("snapshot")
        save("xhs_snapshot.json", res)
    elif cmd == "eval":
        code = sys.argv[2]
        res = send("evaluate", {"code": code})
        save("xhs_eval.json", res)
    elif cmd == "notes":
        # Try to extract note list from DOM anchors
        code = r"""
(() => {
  const notes = [];
  const links = document.querySelectorAll('a[href*="/explore/"]');
  links.forEach(a => {
    const href = a.href;
    const titleEl = a.querySelector('.title, .note-title, span, .desc');
    const title = titleEl ? titleEl.innerText.trim() : '';
    const img = a.querySelector('img');
    const imgSrc = img ? img.src : '';
    if (href && href.includes('/explore/')) {
      notes.push({href, title, imgSrc});
    }
  });
  return JSON.stringify(notes.slice(0, 200));
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_notes.json", res)
    elif cmd == "initial":
        code = r"""
(() => {
  const scripts = Array.from(document.querySelectorAll('script'));
  const found = scripts.map(s => ({id: s.id, text: s.textContent.slice(0, 200)}))
    .filter(x => /INITIAL|REDUX|window\.__|SSR/.test(x.id + x.text));
  return JSON.stringify(found);
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_initial.json", res)
    elif cmd == "html":
        code = r"""
(() => {
  return JSON.stringify(document.documentElement.innerHTML.length);
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_html_len.json", res)
    elif cmd == "sample":
        code = r"""
(() => {
  const titleSel = 'h1.title, .title, [class*="title"], [class*="note-title"]';
  const contentSel = '.content, .note-content, .desc, [class*="content"], [class*="desc"], [class*="detail-desc"]';
  const titleEl = document.querySelector(titleSel);
  const contentEl = document.querySelector(contentSel);
  const title = titleEl ? titleEl.innerText.trim() : document.title;
  const content = contentEl ? contentEl.innerText.trim() : '';
  const candidates = [];
  document.querySelectorAll('main, article, .note-container, .note-page, .detail-page, #app > div').forEach(el => {
    const text = el.innerText.trim();
    if (text.length > 50) candidates.push({tag: el.tagName, cls: el.className.slice(0,80), text: text.slice(0,800)});
  });
  return JSON.stringify({url: location.href, title, content: content.slice(0,2000), candidates: candidates.slice(0,5)});
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_note_sample.json", res)
    elif cmd == "scroll":
        import time
        for i in range(int(sys.argv[2]) if len(sys.argv) > 2 else 3):
            res = send("evaluate", {"code": "(()=>{ window.scrollTo(0,document.body.scrollHeight); return document.body.scrollHeight; })()"})
            print("scroll", i, res)
            time.sleep(2)
    elif cmd == "status":
        code = r"""
(() => {
  const f = window.__INITIAL_STATE__.feed.feeds._value;
  const cards = document.querySelectorAll('a[href*="/explore/"]');
  return JSON.stringify({
    feedLen: Array.isArray(f) ? f.length : Object.keys(f).length,
    cardCount: cards.length,
    feedSample: Array.isArray(f) ? f.slice(0, 1).map(x => typeof x === 'object' ? Object.keys(x) : x) : Object.keys(f).slice(0, 3)
  });
})()
"""
        res = send("evaluate", {"code": code})
        print(json.dumps(res, ensure_ascii=False, indent=2))
    elif cmd == "cards":
        code = r"""
(() => {
  const cards = [];
  document.querySelectorAll('a[href*="/explore/"]').forEach(a => {
    const href = a.href;
    const m = href.match(/explore\/([a-f0-9]+)/);
    if (!m) return;
    const id = m[1];
    const title = a.getAttribute('title') || '';
    const img = a.querySelector('img');
    const alt = img ? (img.alt || '') : '';
    const spans = Array.from(a.querySelectorAll('span')).map(s => s.innerText.trim()).filter(t => t.length > 2);
    const allText = a.innerText.trim().slice(0, 200);
    cards.push({id, href, title, alt, spans: spans.slice(0, 4), allText});
  });
  return JSON.stringify({count: cards.length, cards: cards.slice(0, 20)});
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_cards.json", res)
        arr = json.loads(res.get("data", {}).get("value", "[]"))
        print("cards count sample:", arr.get("count"))
    elif cmd == "click":
        note_id = sys.argv[2]
        code = f"""
(() => {{
  const a = document.querySelector('a[href*="{note_id}"]');
  if (a) {{ a.click(); return 'clicked'; }}
  return 'not found';
}})()
"""
        res = send("evaluate", {"code": code})
        print(json.dumps(res, ensure_ascii=False, indent=2))
    elif cmd == "noteinfo3":
        note_id = sys.argv[2]
        code = f"""
(() => {{
  const n = window.__INITIAL_STATE__.note.noteDetailMap["{note_id}"].note;
  const out = {{}};
  for (const k in n) {{
    try {{
      const v = n[k];
      out[k] = typeof v === "string" ? v.slice(0, 800) : JSON.stringify(v).slice(0, 800);
    }} catch (e) {{ out[k] = "err: " + e.message; }}
  }}
  return JSON.stringify(out);
}})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_note_info3.json", res)
        print(json.dumps(res, ensure_ascii=False, indent=2)[:2000])
    elif cmd == "noteinfo2":
        note_id = sys.argv[2]
        code = f"""
(() => {{
  const n = window.__INITIAL_STATE__.note.noteDetailMap["{note_id}"].note;
  const out = {{keys: Object.keys(n)}};
  for (const k of ["title", "desc", "content", "display_title", "type", "time", "tags", "note_id", "xsec_token"]) {{
    const v = n[k];
    if (v !== undefined) out[k] = typeof v === "string" ? v.slice(0, 1000) : JSON.stringify(v).slice(0, 1000);
  }}
  if (n.imageList && n.imageList.length) out.imageCount = n.imageList.length;
  if (n.imageList && n.imageList.length) out.firstImage = n.imageList[0].url_default || n.imageList[0].url || "";
  return JSON.stringify(out);
}})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_note_info2.json", res)
        print(json.dumps(res, ensure_ascii=False, indent=2)[:1500])
    elif cmd == "noteinfo":
        note_id = sys.argv[2]
        code = f"""
(() => {{
  const map = window.__INITIAL_STATE__.note.noteDetailMap;
  const info = map["{note_id}"];
  if (!info) return JSON.stringify({{keys: Object.keys(map).slice(0, 5), error: "not found"}});
  const out = {{keys: Object.keys(info)}};
  for (const k of ["title", "desc", "content", "display_title", "type", "time", "tags"]) {{
    const v = info[k];
    if (v !== undefined) out[k] = typeof v === "string" ? v.slice(0, 1000) : JSON.stringify(v).slice(0, 1000);
  }}
  if (info.imageList && info.imageList.length) out.imageCount = info.imageList.length;
  return JSON.stringify(out);
}})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_note_info.json", res)
        print(json.dumps(res, ensure_ascii=False, indent=2)[:1000])
    elif cmd == "fetch":
        api_url = sys.argv[2]
        out_name = sys.argv[3] if len(sys.argv) > 3 else "xhs_fetch.json"
        code = f"""
(() => {{
  return fetch({json.dumps(api_url)}).then(r => r.text()).then(t => t.slice(0, 50000));
}})()
"""
        res = send("evaluate", {"code": code})
        save(out_name, res)
        print(json.dumps(res, ensure_ascii=False, indent=2)[:800])
    elif cmd == "extract":
        url = sys.argv[2]
        send("navigate", {"url": url})
        import time
        time.sleep(2)
        code = r"""
(() => {
  const titleSel = 'h1.title, .title, [class*="title"], [class*="note-title"]';
  const contentSel = '.content, .note-content, .desc, [class*="content"], [class*="desc"], [class*="detail-desc"]';
  const titleEl = document.querySelector(titleSel);
  const contentEl = document.querySelector(contentSel);
  const title = titleEl ? titleEl.innerText.trim() : document.title;
  const content = contentEl ? contentEl.innerText.trim() : '';
  return JSON.stringify({url: location.href, title, content});
})()
"""
        res = send("evaluate", {"code": code})
        save("xhs_single_extract.json", res)
        print(json.dumps(res, ensure_ascii=False, indent=2)[:500])
    else:
        print("unknown cmd", cmd)


if __name__ == "__main__":
    main()
