#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import urllib.request

url = "http://127.0.0.1:10086/command"

def send(action, args):
    data = json.dumps({"action": action, "args": args, "session": "shanghanlun-cards"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read().decode())

send("evaluate", {"code": "window.scrollTo(0, document.body.scrollHeight)"})
ss = send("screenshot", {"path": "C:/Users/Chen/Desktop/经方学习系统（旧版）/app/screenshot_card_bottom.png"})
print(json.dumps(ss, ensure_ascii=False, indent=2))
