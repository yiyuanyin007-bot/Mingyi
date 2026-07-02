#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
素材分拣脚本

读取 "素材分拣/" 文件夹里的文件，按规则移动到项目对应位置。

规则：
- 音频/视频（.m4a/.mp3/.wav/.mp4/.mov/.avi）→ clinical/YYYY-MM-DD/
- 患者转写（*_转写.txt）→ clinical/YYYY-MM-DD/
- 现场笔记（*_现场笔记.* / *_笔记.*）→ clinical/YYYY-MM-DD/
- CHM（.chm）→ raw/annotations-chm/
- 扫描 PDF / 古籍（文件名含「古本」「影印」「原版」）→ raw/annotations/ 或 raw/classical/
- 普通 PDF / DOC / TXT / MD / HTML → raw/annotations/
- 图片（.jpg/.png/.jpeg）→ clinical/YYYY-MM-DD/（默认当作现场资料）

日期优先从文件名提取（YYYY-MM-DD），否则使用今天。
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path


def extract_date(filename):
    """从文件名提取日期 YYYY-MM-DD，找不到返回今天。"""
    match = re.search(r"(\d{4}-\d{2}-\d{2})", filename)
    if match:
        return match.group(1)
    return datetime.now().strftime("%Y-%m-%d")


def decide_destination(root, file_path):
    """决定文件应该去哪，返回 (目标目录, 说明)。"""
    name = file_path.name
    suffix = file_path.suffix.lower()
    date = extract_date(name)

    # 临床音频/视频
    if suffix in [".m4a", ".mp3", ".wav", ".mp4", ".mov", ".avi"]:
        return root / "clinical" / date, "临床录音/视频"

    # 图片：默认当作现场资料
    if suffix in [".jpg", ".jpeg", ".png", ".gif", ".bmp"]:
        return root / "clinical" / date, "现场图片"

    # 患者转写
    if "转写" in name and suffix == ".txt":
        return root / "clinical" / date, "患者录音转写"

    # 现场笔记
    if "现场笔记" in name or "_笔记" in name:
        return root / "clinical" / date, "现场笔记"

    # CHM
    if suffix == ".chm":
        return root / "raw" / "annotations-chm", "CHM 典籍"

    # 经典原文特征
    if any(kw in name for kw in ["伤寒论", "金匮要略", "桂林古本"]):
        if suffix in [".doc", ".docx"]:
            return root / "raw" / "classical", "经典原文 DOC"

    # 扫描版/影印版 PDF
    if any(kw in name for kw in ["影印", "原版", "扫描"]):
        return root / "raw" / "annotations", "影印资料"

    # 默认：注解/参考资料
    if suffix in [".pdf", ".doc", ".docx", ".txt", ".md", ".html", ".htm"]:
        return root / "raw" / "annotations", "参考资料"

    # 未知类型：放到素材分拣/待确认
    return root / "素材分拣" / "待确认", "未知类型，需人工确认"


def main():
    root = Path(__file__).resolve().parent.parent
    inbox = root / "素材分拣"

    if not inbox.exists():
        print("素材分拣文件夹不存在")
        return

    files = [f for f in inbox.iterdir() if f.is_file() and f.suffix.lower() != ".bat"]
    if not files:
        print("素材分拣文件夹为空， nothing to do")
        return

    print(f"发现 {len(files)} 个文件，开始分拣...\n")

    moved_clinical = set()
    for f in files:
        dest_dir, category = decide_destination(root, f)
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / f.name

        # 如果目标已存在，加时间戳后缀
        if dest.exists():
            timestamp = datetime.now().strftime("%H%M%S")
            stem = f.stem
            suffix = f.suffix
            dest = dest_dir / f"{stem}_{timestamp}{suffix}"

        shutil.move(str(f), str(dest))
        print(f"[{category}] {f.name}")
        print(f"  → {dest.relative_to(root)}")

        if "clinical" in str(dest_dir):
            moved_clinical.add(dest_dir.name)

    print("\n分拣完成。")

    # 如果有临床资料，提示可以跑 daily_review
    if moved_clinical:
        dates = sorted(moved_clinical)
        print(f"\n检测到临床资料，日期：{', '.join(dates)}")
        print("可以运行以下命令生成学习建议：")
        for d in dates:
            print(f"  python .agents/skills/text-to-cards/scripts/daily_review.py --date {d}")


if __name__ == "__main__":
    main()
