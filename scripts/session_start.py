#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
经方学习系统 · 会话启动检查 (session_start.py)
每个会话开始时必须执行，确保项目状态清晰、无遗留问题。

用法：
  python scripts/session_start.py

检查项：
  1. 项目根目录是否存在
  2. 关键文件是否存在（app/index.html, data/*.json, docs/CHANGELOG.md, PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md）
  3. 临时文件残留检查
  4. 上次会话是否未结束（基于 CHANGELOG 最后变更日期）
  5. 架构确认单检查
  6. 输出会话启动摘要
"""

import os
import re
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\Chen\Desktop\经方学习系统（旧版）")


def check_project_exists():
    if not PROJECT_ROOT.exists():
        print(f"[ERROR] 项目根目录不存在: {PROJECT_ROOT}")
        return False
    print(f"[OK] 项目根目录: {PROJECT_ROOT}")
    return True


def check_key_files():
    key_files = [
        "app/index.html",
        "data/formula_cards.json",
        "data/source_cards.json",
        "data/experience_cards.json",
        "data/sun_target_formulas.json",
        "docs/CHANGELOG.md",
        "AGENTS.md",
        "PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md",  # 架构确认单
    ]
    missing = []
    for f in key_files:
        p = PROJECT_ROOT / f
        if p.exists():
            print(f"[OK] {f}")
        else:
            print(f"[MISSING] {f}")
            missing.append(f)
    return missing


def check_temp_files():
    patterns = ["temp_*.json", "tmp_*.txt", "sp-demo-*.json"]
    found = []
    for pattern in patterns:
        for p in PROJECT_ROOT.glob(pattern):
            found.append(p)
        for p in (PROJECT_ROOT / "app").glob(pattern):
            found.append(p)
        for p in (PROJECT_ROOT / "data").glob(pattern):
            found.append(p)
    return found


def check_last_session_status():
    changelog = PROJECT_ROOT / "docs" / "CHANGELOG.md"
    if not changelog.exists():
        print("[WARN] CHANGELOG 不存在，请检查")
        return

    with open(changelog, "r", encoding="utf-8") as f:
        content = f.read()

    # 查找最后变更日期
    dates = re.findall(r"SH-(\d{8})-\d{3}", content)
    if not dates:
        print("[WARN] CHANGELOG 中无变更记录")
        return

    last_date = max(dates)
    last_date_str = f"{last_date[:4]}-{last_date[4:6]}-{last_date[6:]}"
    today = datetime.now().strftime("%Y-%m-%d")

    if last_date_str == today:
        print(f"[OK] 今天已有变更记录 ({last_date_str})")
    else:
        print(f"[INFO] 最后变更日期: {last_date_str}，今天: {today}")

    # 查找是否有未归档的变更
    unarchived = re.findall(r"\|\s*(SH-\d{8}-\d{3})\s*\|\s*✅已执行", content)
    if unarchived:
        print(f"[WARN] 发现 {len(unarchived)} 个已执行但未归档的变更:")
        for entry in unarchived[-3:]:
            print(f"       {entry}")
        print(f"       建议确认后改为 '✅已归档'")
    else:
        print(f"[OK] 无未归档变更")


def check_architecture_checklist():
    checklist = PROJECT_ROOT / "PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md"
    if checklist.exists():
        print("[OK] PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md 存在")
    else:
        print("[MISSING] PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md 不存在")
        print("        如需启动新任务，请先创建架构确认单")
    return checklist.exists()


def main():
    print("=" * 60)
    print("会话启动检查")
    print("=" * 60)
    print()

    # 1. 项目根目录
    if not check_project_exists():
        print("[ERROR] 项目根目录不存在，请检查路径！")
        return

    # 2. 关键文件
    print("\n--- 关键文件检查 ---")
    missing = check_key_files()
    if missing:
        print(f"[WARN] 缺失 {len(missing)} 个关键文件")

    # 3. 临时文件
    print("\n--- 临时文件检查 ---")
    temps = check_temp_files()
    if temps:
        print(f"[WARN] 发现 {len(temps)} 个临时文件残留:")
        for p in temps:
            print(f"       {p}")
        print(f"       建议执行: python scripts/governance.py clean-temp")
    else:
        print("[OK] 无临时文件残留")

    # 4. 上次会话状态
    print("\n--- 上次会话状态 ---")
    check_last_session_status()

    # 5. 架构确认单检查
    print("\n--- 架构确认单检查 ---")
    has_checklist = check_architecture_checklist()

    # 6. 会话启动摘要
    print("\n" + "=" * 60)
    print("会话启动摘要")
    print("=" * 60)
    print(f"项目: 经方学习系统 v8（旧版）")
    print(f"日期: {datetime.now().strftime('%Y-%m-%d')}")
    print(f"路径: {PROJECT_ROOT}")
    print()
    print("会话启动后必须执行:")
    print("  1. 读取 AGENTS.md 了解项目规范")
    print("  2. 读取 CHANGELOG.md 了解当前变更状态")
    print("  3. 任何文件修改前: python scripts/governance.py backup <file> <reason>")
    print("  4. 任何 JSON 修改后: python scripts/governance.py check-json <file>")
    print("  5. 会话结束时: python scripts/governance.py end")
    print()
    print("【架构确认铁律】")
    if has_checklist:
        print("  架构确认单已存在。")
        print("  如本次会话要启动新任务，且涉及多文件/多 Agent 协作：")
        print("  → 必须先完成 PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md")
        print("  → 双方签署后才能编码")
        print("  → 单文件修复可跳过，但仍需口头确认需求")
    else:
        print("  [WARN] 架构确认单缺失，建议创建 PROJECT_STARTUP_ARCHITECTURE_CHECKLIST.md")
    print("=" * 60)


if __name__ == "__main__":
    main()
