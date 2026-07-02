#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import urllib.request

url = "http://127.0.0.1:10086/command"

def send(action, args):
    data = json.dumps({"action": action, "args": args, "session": "shanghanlun-cards"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    return json.loads(urllib.request.urlopen(req).read().decode())

send("navigate", {"url": "file:///C:/Users/Chen/Desktop/%E7%BB%8F%E6%96%B9%E5%AD%A6%E4%B9%A0%E7%B3%BB%E7%BB%9F%EF%BC%88%E6%97%A7%E7%89%88%EF%BC%89/app/shanghanlun-v8-mvp.html"})
import time
time.sleep(0.5)
send("evaluate", {"code": "window.scrollTo(0, document.body.scrollHeight)"})
ss = send("screenshot", {"path": "C:/Users/Chen/Desktop/经方学习系统（旧版）/app/screenshot_dashboard_bottom.png"})
print(json.dumps(ss, ensure_ascii=False, indent=2))
