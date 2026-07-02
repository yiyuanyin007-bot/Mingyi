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

targets = [
    ("baidu_health_taiyang", "https://health.baidu.com/m/detail/ar_6705582692774636957"),
    ("baidu_health_shuiniao", "https://m.baidu.com/bh/m/detail/ar_6297026883668045673"),
    ("baidu_baijia_zhongfeng", "https://m.baidu.com/bh/m/detail/ar_9384463645733160875"),
]

for name, page_url in targets:
    send("navigate", {"url": page_url})
    import time
    time.sleep(1.5)
    code = "(() => { return document.body.innerText; })()"
    res = send("evaluate", {"code": code})
    text = res["data"]["value"]
    out = Path(__file__).resolve().parent.parent / "app" / f"{name}.txt"
    out.write_text(text, encoding="utf-8")
    print(f"已写入 {out}，字数 {len(text)}")
