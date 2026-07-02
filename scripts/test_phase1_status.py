import requests
import json

URL = "http://127.0.0.1:10086/command"
SESSION = "jf-phase1-test"

def send(action, args=None):
    return requests.post(URL, json={"action": action, "args": args or {}, "session": SESSION}).json()

url = send("evaluate", {"code": "(()=>location.href)()"})
body = send("evaluate", {"code": "(()=>document.body.innerHTML.length)()"})
title = send("evaluate", {"code": "(()=>document.title)()"})
out = {"url": url, "bodyLen": body, "title": title}
json.dump(out, open('extracted/phase1_status.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('saved')
