#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import urllib.request

url = "http://127.0.0.1:10086/command"

def send(action, args):
    data = json.dumps({"action": action, "args": args, "session": "shanghanlun-cards"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    return urllib.request.urlopen(req).read().decode()

# Get cardList HTML and console errors
code = """(() => {
  try {
    return {
      cardsLen: typeof CARDS !== 'undefined' ? CARDS.length : 'undefined',
      firstName: typeof CARDS !== 'undefined' && CARDS[0] ? CARDS[0].name : 'none',
      listHTML: document.getElementById('cardList') ? document.getElementById('cardList').innerHTML.substring(0, 500) : 'no list',
      err: null
    };
  } catch(e) {
    return { err: e.toString() };
  }
})()"""
print(send("evaluate", {"code": code}))
