#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
同步卡片数据：把 .agents/skills/text-to-cards/data/ 复制到根目录 data/
"""

import shutil
from pathlib import Path


def main():
    root = Path(__file__).resolve().parent.parent
    src = root / ".agents" / "skills" / "text-to-cards" / "data"
    dst = root / "data"

    if not src.exists():
        print(f"源目录不存在：{src}")
        return

    dst.mkdir(parents=True, exist_ok=True)

    for name in ["formula_cards.json", "source_cards.json", "experience_cards.json"]:
        s = src / name
        d = dst / name
        if s.exists():
            shutil.copy2(s, d)
            print(f"已同步：{name}")
        else:
            print(f"源文件缺失：{name}")

    print(f"\n同步完成。目标：{dst}")


if __name__ == "__main__":
    main()
