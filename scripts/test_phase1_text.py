import requests
import json

URL = "http://127.0.0.1:10086/command"
SESSION = "jf-phase1-test"

def send(action, args=None):
    return requests.post(URL, json={"action": action, "args": args or {}, "session": SESSION}).json()

title = send("evaluate", {"code": "(()=>document.querySelector('.dashboard-title').textContent)()"})
firstCard = send("evaluate", {"code": "(()=>document.querySelector('.card-list-name').textContent)()"})
reviewBtn = send("evaluate", {"code": "(()=>document.querySelector('#reviewPanel button').textContent)()"})
out = {"title": title, "firstCard": firstCard, "reviewBtn": reviewBtn}
json.dump(out, open('extracted/phase1_text.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('saved')
