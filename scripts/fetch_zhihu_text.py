#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import urllib.request
from pathlib import Path

url = "http://127.0.0.1:10086/command"

def send(action, args):
    data = json.dumps({"action": action, "args": args, "session": "shanghanlun-compare"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read().decode())

code = """(() => {
  const article = document.querySelector('.Post-RichTextContainer') || document.querySelector('.RichContent-inner') || document.querySelector('article') || document.body;
  return article.innerText;
})()"""
res = send("evaluate", {"code": code})
text = res["data"]["value"]
out = Path(__file__).resolve().parent.parent / "app" / "zhihu_article_taiyang_c.txt"
out.write_text(text, encoding="utf-8")
print(f"已写入 {out}，字数 {len(text)}")
