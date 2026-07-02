#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
daily-review Skill · MVP 骨架

读取指定日期的临床文件夹，处理录音转写和现场笔记，生成学习建议。

用法：
    python scripts/daily_review.py --date 2026-06-14
    python scripts/daily_review.py --date 2026-06-14 --folder "C:\\path\\to\\clinical\\2026-06-14"

当前限制：
    - 不处理 .m4a 音频，只读取 *_转写.txt
    - 不处理手写 PDF OCR，只读取 .md 和 .txt
    - 只生成建议报告，不自动修改卡片 JSON
"""

import argparse
import os
import re
from datetime import datetime


def find_input_files(folder):
    """找出文件夹内所有可处理的输入文件"""
    files = []
    for root, _, filenames in os.walk(folder):
        for name in filenames:
            if name.endswith("_学习建议.md"):
                continue
            if name.endswith("_转写.txt") or name.endswith(".md"):
                files.append(os.path.join(root, name))
    return files


def read_file(path):
    """读取文本文件内容"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"[读取失败: {e}]"


def extract_patient_blocks(text):
    """
    简单按患者编号拆分文本。
    支持格式：P01、P02、患者1、患者 1 等。
    """
    pattern = r"(?:^|\n)\s*(?:患者\s*)?(P\d+|患者\s*\d+)\s*[：:\n]"
    matches = list(re.finditer(pattern, text, re.IGNORECASE))
    blocks = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        patient_id = m.group(1)
        content = text[start:end].strip()
        blocks.append({"patient_id": patient_id, "content": content})
    if not blocks:
        blocks.append({"patient_id": "未知", "content": text.strip()})
    return blocks


def extract_formula_names(text, formula_list=None):
    """从文本中提取已知方名"""
    if formula_list is None:
        formula_list = ["桂枝汤", "麻黄汤", "葛根汤", "大承气汤", "小柴胡汤"]
    found = []
    for f in formula_list:
        if f in text:
            found.append(f)
    return found


def generate_report(date, folder, files, patient_blocks):
    """生成学习建议报告"""
    lines = []
    lines.append(f"# {date} 学习建议\n")
    lines.append("## 一、今日要点摘要\n")
    lines.append(f"- 处理文件数：{len(files)}")
    lines.append(f"- 识别患者数：{len(patient_blocks)}")

    all_formulas = set()
    for block in patient_blocks:
        all_formulas.update(extract_formula_names(block["content"]))
    if all_formulas:
        lines.append(f"- 涉及方剂：{'、'.join(sorted(all_formulas))}")
    lines.append("")

    lines.append("## 二、逐诊点评\n")
    for block in patient_blocks:
        formulas = extract_formula_names(block["content"])
        lines.append(f"### {block['patient_id']}\n")
        lines.append(f"**涉及方剂**：{'、'.join(formulas) if formulas else '未识别'}\n")
        lines.append(f"**原文摘要**：{block['content'][:120].replace(chr(10), ' ')}...\n")
        lines.append("**点评**：待根据内容进一步分析\n")

    lines.append("## 三、推荐卡片\n")
    if all_formulas:
        for f in sorted(all_formulas):
            lines.append(f"- **{f}**：建议从「症状→方名」向量开始训练")
    else:
        lines.append("- 今日未识别到明确方剂，建议回顾录音和笔记。")
    lines.append("")

    lines.append("## 四、下一步行动\n")
    lines.append("- [ ] 审阅以上推荐，确认是否创建/更新卡片")
    lines.append("- [ ] 把有价值的内容写入经验卡")
    lines.append("- [ ] 更新相关方剂的 symptom_profile\n")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="生成每日学习建议")
    parser.add_argument("--date", required=True, help="日期，如 2026-06-14")
    parser.add_argument("--folder", default=None, help="当天文件夹路径，默认从项目根目录 clinical/ 下查找")
    args = parser.parse_args()

    if args.folder is None:
        # 默认从项目根目录的 clinical/ 下查找
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(script_dir, "..", "..", "..", ".."))
        args.folder = os.path.join(project_root, "clinical", args.date)

    if not os.path.exists(args.folder):
        print(f"文件夹不存在：{args.folder}")
        return

    files = find_input_files(args.folder)
    if not files:
        print(f"未在 {args.folder} 中找到可处理的输入文件")
        return

    all_text = "\n\n".join(read_file(f) for f in files)
    patient_blocks = extract_patient_blocks(all_text)

    report = generate_report(args.date, args.folder, files, patient_blocks)

    output_path = os.path.join(args.folder, f"{args.date}_学习建议.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"已生成：{output_path}")
    print(f"  处理文件：{len(files)}")
    print(f"  识别患者：{len(patient_blocks)}")


if __name__ == "__main__":
    main()
