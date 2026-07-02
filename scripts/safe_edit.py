#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
经方学习系统 · 安全编辑脚本 (safe_edit.py)
强制走"备份→编辑→验证→登记"完整流程，不通过此脚本则"不备份"变得困难。

用法：
  python scripts/safe_edit.py <file> <reason>    安全编辑流程

流程：
  1. 自动备份原文件到 archive
  2. 提示用户（或AI）进行修改
  3. 验证 JSON 文件合法性（如果是 .json）
  4. 生成 CHANGELOG 条目建议
  5. 输出下一步操作建议

注意：本脚本不直接执行编辑，而是创建备份并验证编辑后的结果。
"""

import sys
import os
import json
import shutil
import re
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\Chen\Desktop\经方学习系统（旧版）")
ARCHIVE_DIRS = {
    "app": PROJECT_ROOT / "app" / "archive",
    "data": PROJECT_ROOT / "data" / "archive",
    "docs": PROJECT_ROOT / "docs" / "archive",
}


def ensure_archive_dirs():
    for d in ARCHIVE_DIRS.values():
        d.mkdir(parents=True, exist_ok=True)


def backup_file(src: Path, reason: str) -> Path:
    """备份文件到对应 archive 目录。"""
    rel = src.relative_to(PROJECT_ROOT)
    parts = rel.parts

    if parts[0] == "app":
        archive_dir = ARCHIVE_DIRS["app"]
    elif parts[0] == "data":
        archive_dir = ARCHIVE_DIRS["data"]
    elif parts[0] == "docs":
        archive_dir = ARCHIVE_DIRS["docs"]
    else:
        archive_dir = PROJECT_ROOT / "archive"
        archive_dir.mkdir(parents=True, exist_ok=True)

    ensure_archive_dirs()
    stem = src.stem
    suffix = src.suffix
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_reason = re.sub(r'[^\w\-]', '_', reason)[:30]
    backup_name = f"{stem}-before-{safe_reason}-{timestamp}{suffix}"
    dst = archive_dir / backup_name

    shutil.copy2(src, dst)
    print(f"[STEP 1/5] ✅ 备份完成: {dst}")
    return dst


def verify_json(src: Path) -> bool:
    """验证 JSON 合法性。"""
    if not src.suffix == ".json":
        print("[STEP 3/5] ⏭️ 跳过 JSON 验证（非 JSON 文件）")
        return True

    try:
        with open(src, "r", encoding="utf-8") as f:
            data = json.load(f)
        size = len(json.dumps(data, ensure_ascii=False))
        print(f"[STEP 3/5] ✅ JSON 验证通过 ({size} chars)")
        return True
    except json.JSONDecodeError as e:
        print(f"[STEP 3/5] ❌ JSON 语法错误: {e}")
        print(f"       建议: 先修复 JSON 错误，再重新运行本脚本验证")
        return False


def suggest_changelog_entry(reason: str, affected_file: Path):
    """生成 CHANGELOG 条目建议。"""
    today = datetime.now().strftime("%Y-%m-%d")
    date_compact = datetime.now().strftime("%Y%m%d")
    
    changelog_path = PROJECT_ROOT / "docs" / "CHANGELOG.md"
    max_num = 0
    if changelog_path.exists():
        with open(changelog_path, "r", encoding="utf-8") as f:
            content = f.read()
        pattern = rf"SH-{date_compact}-(\d{{3}})"
        matches = re.findall(pattern, content)
        if matches:
            max_num = max(int(m) for m in matches)
    
    next_num = max_num + 1
    entry_id = f"SH-{date_compact}-{next_num:03d}"
    rel_path = affected_file.relative_to(PROJECT_ROOT)

    print(f"\n[STEP 4/5] 📋 CHANGELOG 登记建议")
    print(f"{'='*60}")
    print(f"条目编号: {entry_id}")
    print(f"影响文件: {rel_path}")
    print(f"变更原因: {reason}")
    print(f"\n请将此行添加到 docs/CHANGELOG.md 的 {today} 表格中:")
    print(f"| {entry_id} | ✅已执行 | 用户确认 | {reason} | 具体描述... | {rel_path} | Chen |")
    print(f"{'='*60}\n")

    return entry_id


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    filepath = sys.argv[1]
    reason = sys.argv[2]

    src = Path(filepath)
    if not src.is_absolute():
        src = PROJECT_ROOT / filepath

    if not src.exists():
        print(f"[ERROR] 文件不存在: {src}")
        sys.exit(1)

    print(f"{'='*60}")
    print(f"安全编辑流程: {src.name}")
    print(f"变更原因: {reason}")
    print(f"{'='*60}\n")

    # Step 1: 备份
    backup_path = backup_file(src, reason)

    # Step 2: 提示编辑
    print(f"[STEP 2/5] 📝 请现在修改文件: {src}")
    print(f"           备份已存在: {backup_path}")
    print(f"           修改完成后，按回车继续验证...")
    input()

    # Step 3: 验证
    verify_json(src)

    # Step 4: 生成 CHANGELOG 建议
    suggest_changelog_entry(reason, src)

    # Step 5: 完成提示
    print(f"[STEP 5/5] ✅ 安全编辑流程完成")
    print(f"           请确认:")
    print(f"           1. 文件已修改且验证通过")
    print(f"           2. CHANGELOG 已登记")
    print(f"           3. 临时文件已清理")
    print(f"\n           运行结束自检: python scripts/governance.py end")


if __name__ == "__main__":
    main()
