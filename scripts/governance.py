#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
经方学习系统 · 治理检查工具 (governance.py)
自动化执行文件管理铁律：备份、验证、登记、清理。

用法：
  python scripts/governance.py backup <file> <reason>     备份文件到 archive
  python scripts/governance.py check-json <file>          验证 JSON 合法性
  python scripts/governance.py check                       检查项目健康状态
  python scripts/governance.py entry <reason> <file>      生成 CHANGELOG 条目
  python scripts/governance.py end                         会话结束自检
  python scripts/governance.py clean-temp                 清理临时文件
"""

import sys
import os
import json
import shutil
import re
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(r"C:\Users\Chen\Desktop\经方学习系统（旧版）")
ARCHIVE_DIRS = {
    "app": PROJECT_ROOT / "app" / "archive",
    "data": PROJECT_ROOT / "data" / "archive",
    "docs": PROJECT_ROOT / "docs" / "archive",
}
CHANGELOG_PATH = PROJECT_ROOT / "docs" / "CHANGELOG.md"


def ensure_archive_dirs():
    for d in ARCHIVE_DIRS.values():
        d.mkdir(parents=True, exist_ok=True)


def backup_file(filepath: str, reason: str) -> str:
    """备份文件到对应 archive 目录，返回备份路径。"""
    src = Path(filepath)
    if not src.is_absolute():
        src = PROJECT_ROOT / filepath
    if not src.exists():
        print(f"[ERROR] 文件不存在: {src}")
        return ""

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
    print(f"[OK] 备份完成: {dst}")
    return str(dst)


def check_json(filepath: str) -> bool:
    """验证 JSON 文件合法性。"""
    src = Path(filepath)
    if not src.is_absolute():
        src = PROJECT_ROOT / filepath
    if not src.exists():
        print(f"[ERROR] 文件不存在: {src}")
        return False

    try:
        with open(src, "r", encoding="utf-8") as f:
            data = json.load(f)
        size = len(json.dumps(data, ensure_ascii=False))
        print(f"[OK] JSON 合法: {src} ({size} chars)")
        return True
    except json.JSONDecodeError as e:
        print(f"[ERROR] JSON 语法错误: {src}")
        print(f"       {e}")
        return False
    except Exception as e:
        print(f"[ERROR] 读取失败: {src} → {e}")
        return False


def check_project_health():
    """检查项目健康状态：临时文件、JSON 合法性、未备份风险。"""
    print("=" * 60)
    print("项目健康检查")
    print("=" * 60)

    # 1. 检查临时文件
    temp_patterns = ["temp_*.json", "tmp_*.txt", "sp-demo-*.json"]
    temp_found = []
    for pattern in temp_patterns:
        for p in PROJECT_ROOT.glob(pattern):
            temp_found.append(p)
        for p in (PROJECT_ROOT / "app").glob(pattern):
            temp_found.append(p)
        for p in (PROJECT_ROOT / "data").glob(pattern):
            temp_found.append(p)

    if temp_found:
        print(f"[WARN] 发现 {len(temp_found)} 个临时文件:")
        for p in temp_found:
            print(f"       {p}")
        print("       建议执行: python scripts/governance.py clean-temp")
    else:
        print("[OK] 无临时文件残留")

    # 2. 检查 JSON 文件合法性
    json_files = list((PROJECT_ROOT / "data").glob("*.json"))
    json_errors = 0
    for p in json_files:
        if not check_json(str(p)):
            json_errors += 1
    if json_errors == 0:
        print(f"[OK] 所有 {len(json_files)} 个 JSON 文件合法")
    else:
        print(f"[ERROR] {json_errors} 个 JSON 文件存在语法错误")

    # 3. 检查 CHANGELOG 是否存在
    if CHANGELOG_PATH.exists():
        print(f"[OK] CHANGELOG 存在: {CHANGELOG_PATH}")
    else:
        print(f"[ERROR] CHANGELOG 缺失: {CHANGELOG_PATH}")

    print("=" * 60)


def generate_changelog_entry(reason: str, affected_files: str):
    """生成 CHANGELOG 条目模板，输出到控制台。"""
    today = datetime.now().strftime("%Y-%m-%d")
    date_compact = datetime.now().strftime("%Y%m%d")

    # 尝试推断当前最大编号
    max_num = 0
    if CHANGELOG_PATH.exists():
        with open(CHANGELOG_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        pattern = rf"SH-{date_compact}-(\d{{3}})"
        matches = re.findall(pattern, content)
        if matches:
            max_num = max(int(m) for m in matches)

    next_num = max_num + 1
    entry_id = f"SH-{date_compact}-{next_num:03d}"

    template = f"""
┌──────────────────────────────────────────────────────────────┐
│ 请将以下条目添加到 CHANGELOG.md 的 "## {today}" 表格中       │
└──────────────────────────────────────────────────────────────┘

| {entry_id} | ✅已执行 | 用户确认 | {reason} | 具体描述... | {affected_files} | Chen |

提示：
- 将 "具体描述..." 替换为实际变更内容
- 确认后状态改为 "✅已归档"
- 来源字段可选：用户确认 / 用户指正 / 文献依据 / 测试反馈 / 内部思考
"""
    print(template)
    return entry_id


def session_end_check():
    """会话结束自检清单。"""
    print("=" * 60)
    print("会话结束自检清单")
    print("=" * 60)

    checks = {
        "所有修改文件已备份": False,
        "所有 JSON 文件已验证": False,
        "所有变更已登记 CHANGELOG": False,
        "新增文档已分配 DOC 编号": False,
        "临时文件已清理": False,
    }

    # 1. 检查临时文件
    temp_found = []
    for pattern in ["temp_*.json", "tmp_*.txt", "sp-demo-*.json"]:
        for p in PROJECT_ROOT.glob(pattern):
            temp_found.append(p)
        for p in (PROJECT_ROOT / "app").glob(pattern):
            temp_found.append(p)
        for p in (PROJECT_ROOT / "data").glob(pattern):
            temp_found.append(p)

    if not temp_found:
        checks["临时文件已清理"] = True
        print("[✓] 临时文件已清理")
    else:
        print(f"[✗] 发现 {len(temp_found)} 个临时文件，执行: python scripts/governance.py clean-temp")

    # 2. 检查 JSON 合法性
    json_files = list((PROJECT_ROOT / "data").glob("*.json"))
    bad_json = 0
    for p in json_files:
        try:
            with open(p, "r", encoding="utf-8") as f:
                json.load(f)
        except:
            bad_json += 1
    if bad_json == 0:
        checks["所有 JSON 文件已验证"] = True
        print(f"[✓] 所有 {len(json_files)} 个 JSON 文件合法")
    else:
        print(f"[✗] {bad_json} 个 JSON 文件需要验证")

    # 3. CHANGELOG 检查
    if CHANGELOG_PATH.exists():
        print("[✓] CHANGELOG 已登记（请人工确认最新条目完整性）")
    else:
        print("[✗] CHANGELOG 缺失")

    print("=" * 60)
    passed = sum(checks.values())
    total = len(checks)
    print(f"自检通过: {passed}/{total}")
    if passed < total:
        print("[WARN] 未通过项请立即处理！")
    print("=" * 60)


def clean_temp_files():
    """清理临时文件。"""
    patterns = ["temp_*.json", "tmp_*.txt", "sp-demo-*.json", "temp_*.json"]
    removed = 0
    for pattern in patterns:
        for p in PROJECT_ROOT.glob(pattern):
            p.unlink()
            print(f"[OK] 删除: {p}")
            removed += 1
        for p in (PROJECT_ROOT / "app").glob(pattern):
            p.unlink()
            print(f"[OK] 删除: {p}")
            removed += 1
        for p in (PROJECT_ROOT / "data").glob(pattern):
            p.unlink()
            print(f"[OK] 删除: {p}")
            removed += 1
    print(f"[OK] 共删除 {removed} 个临时文件")


def check_sp_cases(filepath: str = "data/sp_cases.json"):
    """
    验证 SP 病例 JSON 的完整性和一致性。
    检查项：
    1. formula_id 在 formula_cards.json 中存在
    2. source_article 与 answer_key.correct_article_id 一致
    3. 干扰项数量为 4
    4. symptom_pool 有对应的口语表达索引
    5. difficulty_config 与 difficulty 等级一致
    """
    sp_path = PROJECT_ROOT / filepath
    if not sp_path.exists():
        print(f"[ERROR] SP 病例文件不存在: {sp_path}")
        return False

    formula_cards_path = PROJECT_ROOT / "data/formula_cards.json"
    expression_index_path = PROJECT_ROOT / "data/symptom_expression_index.json"
    article_map_path = PROJECT_ROOT / "data/source_article_map.json"

    # 加载依赖数据
    try:
        with open(formula_cards_path, "r", encoding="utf-8") as f:
            formula_cards = json.load(f)
        formula_ids = {c["id"] for c in formula_cards}
    except Exception as e:
        print(f"[ERROR] 无法加载 formula_cards.json: {e}")
        return False

    try:
        with open(expression_index_path, "r", encoding="utf-8") as f:
            expr_index = json.load(f)
        expr_keys = set(expr_index.get("symptoms", {}).keys())
    except Exception as e:
        print(f"[ERROR] 无法加载 symptom_expression_index.json: {e}")
        return False

    try:
        with open(article_map_path, "r", encoding="utf-8") as f:
            article_map = {e["id"]: e for e in json.load(f)}
    except Exception as e:
        print(f"[ERROR] 无法加载 source_article_map.json: {e}")
        return False

    # 加载 SP 病例
    try:
        with open(sp_path, "r", encoding="utf-8") as f:
            cases = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[ERROR] SP 病例 JSON 语法错误: {e}")
        return False

    print(f"=" * 60)
    print(f"SP 病例验证: {filepath} (共 {len(cases)} 例)")
    print(f"=" * 60)

    errors = []
    warnings = []

    for i, case in enumerate(cases):
        case_id = case.get("session_id", f"case-{i}")
        ak = case.get("answer_key", {})
        cfid = ak.get("correct_formula_id", "")
        caid = ak.get("correct_article_id", "")
        sa = case.get("source_article", "")

        # 1. formula_id 验证
        if cfid not in formula_ids:
            errors.append(f"[{case_id}] formula_id '{cfid}' 不在 formula_cards.json 中")

        # 2. article_id 一致性
        if sa != caid:
            errors.append(f"[{case_id}] source_article '{sa}' != answer_key.correct_article_id '{caid}'")

        # 3. 干扰项数量
        options = case.get("question", {}).get("options", [])
        distractors = [o for o in options if not o.get("is_correct", False)]
        if len(distractors) != 4:
            warnings.append(f"[{case_id}] 干扰项数量={len(distractors)}，期望 4")

        # 4. 口语表达索引覆盖
        symptom_pool = case.get("chief_complaint", {}).get("l0_symptoms", [])
        for symptom in symptom_pool:
            if symptom not in expr_keys:
                warnings.append(f"[{case_id}] 症状 '{symptom}' 在 symptom_expression_index.json 中无对应表达")

        # 5. 难度配置一致性
        dc = case.get("difficulty_config", {})
        difficulty = case.get("difficulty", 1)
        expected_slots = {1: 8, 2: 5, 3: 3}
        if dc.get("inquiry_slots") != expected_slots.get(difficulty):
            warnings.append(f"[{case_id}] difficulty={difficulty} 但 inquiry_slots={dc.get('inquiry_slots')}，期望 {expected_slots.get(difficulty)}")

        # 6. 人格 ID 有效性
        persona = case.get("patient", {}).get("persona_id", "")
        valid_personas = {
            "anxious-middle-aged-female", "silent-elderly-male",
            "talkative-elderly-female", "skeptical-patient", "intellectual-young-adult"
        }
        if persona not in valid_personas:
            warnings.append(f"[{case_id}] persona_id '{persona}' 不是预定义人格")

    # 7. 检查是否有重复 session_id
    session_ids = [c.get("session_id", "") for c in cases]
    duplicates = [sid for sid in set(session_ids) if session_ids.count(sid) > 1]
    if duplicates:
        errors.append(f"发现重复 session_id: {duplicates}")

    # 输出结果
    if errors:
        print(f"[ERROR] 发现 {len(errors)} 个错误:")
        for e in errors:
            print(f"       {e}")
    else:
        print(f"[OK] 无错误")

    if warnings:
        print(f"[WARN] 发现 {len(warnings)} 个警告:")
        for w in warnings:
            print(f"       {w}")
    else:
        print(f"[OK] 无警告")

    print(f"=" * 60)
    return len(errors) == 0


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "backup":
        if len(sys.argv) < 4:
            print("用法: python scripts/governance.py backup <file> <reason>")
            sys.exit(1)
        backup_file(sys.argv[2], sys.argv[3])

    elif cmd == "check-json":
        if len(sys.argv) < 3:
            print("用法: python scripts/governance.py check-json <file>")
            sys.exit(1)
        check_json(sys.argv[2])

    elif cmd == "check":
        check_project_health()

    elif cmd == "entry":
        if len(sys.argv) < 4:
            print("用法: python scripts/governance.py entry <reason> <file>")
            sys.exit(1)
        generate_changelog_entry(sys.argv[2], sys.argv[3])

    elif cmd == "end":
        session_end_check()

    elif cmd == "clean-temp":
        clean_temp_files()

    elif cmd == "check-data":
        if len(sys.argv) > 2 and sys.argv[2] == "--all":
            check_data_integrity()
        elif len(sys.argv) > 2:
            check_json(sys.argv[2])
        else:
            check_data_integrity()

    elif cmd == "check-sp":
        sp_file = sys.argv[2] if len(sys.argv) > 2 else "data/sp_cases.json"
        check_sp_cases(sp_file)

    else:
        print(f"[ERROR] 未知命令: {cmd}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
