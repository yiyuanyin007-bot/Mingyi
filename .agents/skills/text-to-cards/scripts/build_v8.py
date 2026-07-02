#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建 MVP v8 前端原型。

输入：
  - templates/v8-mvp.html
  - data/formula_cards.json
  - data/source_cards.json
  - data/experience_cards.json
输出：
  - shanghanlun-v8-mvp.html
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TEMPLATE = os.path.join(BASE_DIR, "templates", "v8-mvp.html")
OUTPUT = os.path.join(BASE_DIR, "shanghanlun-v8-mvp.html")


def load_json(name):
    path = os.path.join(BASE_DIR, "data", name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    cards = load_json("formula_cards.json")
    sources = load_json("source_cards.json")
    experiences = load_json("experience_cards.json")

    with open(TEMPLATE, "r", encoding="utf-8") as f:
        html = f.read()

    html = html.replace("{{CARDS_JSON}}", json.dumps(cards, ensure_ascii=False, indent=2))
    html = html.replace("{{EXPERIENCES_JSON}}", json.dumps(experiences, ensure_ascii=False, indent=2))
    html = html.replace("{{SOURCE_CARDS_JSON}}", json.dumps(sources, ensure_ascii=False, indent=2))

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"已生成 {OUTPUT}")
    print(f"  方剂卡: {len(cards)}")
    print(f"  经验卡: {len(experiences)}")
    print(f"  文件大小: {os.path.getsize(OUTPUT)} bytes")


if __name__ == "__main__":
    main()
