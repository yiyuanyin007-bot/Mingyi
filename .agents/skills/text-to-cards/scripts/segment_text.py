#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
text-to-cards 第一步：文本切分与元素识别

用法：
    python segment_text.py --input <源文本路径> --scope <范围清单文件路径> --output <原始文件路径>

范围清单文件格式：每行一个方名，如：
    桂枝汤
    麻黄汤
    葛根汤
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path

# ============== 内置词库（初版，后续迭代） ==============

COMMON_SYMPTOMS = [
    "头痛", "头项强痛", "项背强几几", "项背强痛", "发热", "恶风", "恶寒",
    "汗出", "无汗", "喘", "胸胁苦满", "默默不欲饮食", "心烦", "喜呕",
    "往来寒热", "谵语", "潮热", "大便硬", "绕脐痛", "手足濈然汗出",
    "骨节疼痛", "身疼", "腰痛", "脉浮缓", "脉浮紧", "脉浮", "脉紧",
    "汗出而喘", "无汗而喘", "不恶寒", "反恶热", "呕", "渴", "自利",
    "下利", "腹满", "腹痛", "便秘", "小便不利"
]

COMMON_HERBS = [
    "桂枝", "芍药", "甘草", "生姜", "大枣", "麻黄", "杏仁", "葛根",
    "大黄", "厚朴", "枳实", "芒硝", "柴胡", "黄芩", "人参", "半夏",
    "茯苓", "白术", "附子", "干姜", "细辛", "五味子", "石膏", "知母",
    "粳米", "瓜蒌", "薤白", "白酒", "枳壳", "桔梗", "贝母"
]

DOSAGE_UNITS = ["两", "斤", "升", "合", "枚", "个", "片", "方寸匕", "分", "半斤"]

USAGE_KEYWORDS = [
    "以水", "煮取", "去滓", "温服", "日三服", "分温再服", "先煮",
    "内诸药", "适寒温", "服一升", "啜粥", "温覆", "更上微火", "得下",
    "去上沫", "去白沫", "温服八合", "煮取二升", "煮取三升"
]

CONTRAINDICATION_KEYWORDS = ["不可", "不得", "勿", "忌", "禁", "反", "非", "无汗"]

PATHOLOGY_KEYWORDS = ["为", "因", "故", "机", "属", "邪", "正", "营卫", "气血", "表里", "寒热", "虚实"]

EXPERIENCE_KEYWORDS = ["云", "曰", "师", "案", "愚见", "余临证", "按", "注", "笔者认为", "经验"]

FORMULA_NAME_TO_ID = {
    "桂枝汤": "gui-zhi-tang",
    "麻黄汤": "ma-huang-tang",
    "葛根汤": "ge-gen-tang",
    "大承气汤": "da-cheng-qi-tang",
    "小柴胡汤": "xiao-chai-hu-tang",
    "桂枝加葛根汤": "gui-zhi-jia-ge-gen-tang",
    "桂枝去芍药加附子汤": "gui-zhi-qu-shaoyao-jia-fuzi-tang",
}

# ============== 工具函数 ==============


def load_scope(scope_path: str) -> list[str]:
    """读取范围清单文件，返回方名列表。"""
    path = Path(scope_path)
    if not path.exists():
        raise FileNotFoundError(f"范围清单文件不存在: {scope_path}")
    names = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                names.append(line)
    return names


def split_paragraphs(text: str) -> list[str]:
    """按空行切分段落。"""
    paragraphs = re.split(r"\n\s*\n", text.strip())
    return [p.strip() for p in paragraphs if p.strip()]


def split_sentences(paragraph: str) -> list[str]:
    """按中文标点切分句子。"""
    # 保留标点在句尾
    raw = re.split(r"([。；？！])", paragraph)
    sentences = []
    current = ""
    for part in raw:
        current += part
        if part and part[-1] in "。；？！":
            sentences.append(current.strip())
            current = ""
    if current.strip():
        # 没有结束标点的尾巴，按语义尝试切分
        sentences.extend(split_long_sentence(current.strip()))
    return sentences


def split_long_sentence(sentence: str) -> list[str]:
    """对无标点长句做简单语义切分。"""
    # 超过 80 字，尝试按 "，" 切分
    if len(sentence) > 80 and "，" in sentence:
        parts = sentence.split("，")
        return [p.strip() + ("，" if i < len(parts) - 1 else "") for i, p in enumerate(parts) if p.strip()]
    return [sentence]


def detect_formula_names(sentence: str, scope: list[str]) -> list[dict]:
    """识别句子中的方名。"""
    elements = []
    for name in scope:
        if name in sentence:
            elements.append({
                "type": "formula_name",
                "value": name,
                "target_card": FORMULA_NAME_TO_ID.get(name, name),
                "target_field": "formula_name",
                "confidence": "high"
            })
    return elements


def detect_source_text(sentence: str, scope: list[str]) -> list[dict]:
    """识别完整条文。"""
    elements = []
    if re.search(r"主之|可与|宜\s*$", sentence):
        for name in scope:
            if name in sentence:
                elements.append({
                    "type": "source_text",
                    "value": sentence,
                    "target_card": FORMULA_NAME_TO_ID.get(name, name),
                    "target_field": "data.source_text",
                    "confidence": "high"
                })
                break
    return elements


def detect_symptoms(sentence: str, formula_name: str | None) -> list[dict]:
    """识别症状。"""
    elements = []
    if not formula_name:
        return elements
    for symptom in COMMON_SYMPTOMS:
        if symptom in sentence:
            elements.append({
                "type": "symptom",
                "value": symptom,
                "target_card": FORMULA_NAME_TO_ID.get(formula_name, formula_name),
                "target_field": "data.symptoms",
                "confidence": "medium"
            })
    return elements


def detect_herbs(sentence: str, formula_name: str | None) -> list[dict]:
    """识别药物及剂量。"""
    elements = []
    if not formula_name:
        return elements
    for herb in COMMON_HERBS:
        if herb not in sentence:
            continue
        # 找 herb 后面跟着剂量
        pattern = re.compile(re.escape(herb) + r"(?:\s*)((?:[一二三四五六七八九十百千]+(?:\s*)?)+(" + "|".join(DOSAGE_UNITS) + r"))")
        for match in pattern.finditer(sentence):
            dosage = match.group(1).strip()
            elements.append({
                "type": "herb",
                "value": f"{herb} {dosage}",
                "target_card": FORMULA_NAME_TO_ID.get(formula_name, formula_name),
                "target_field": "data.herbs",
                "confidence": "high"
            })
    return elements


def detect_usage(sentence: str, formula_name: str | None) -> list[dict]:
    """识别用法。"""
    elements = []
    if not formula_name:
        return elements
    if any(kw in sentence for kw in USAGE_KEYWORDS):
        elements.append({
            "type": "usage",
            "value": sentence,
            "target_card": FORMULA_NAME_TO_ID.get(formula_name, formula_name),
            "target_field": "data.usage",
            "confidence": "medium"
        })
    return elements


def detect_contraindications(sentence: str, formula_name: str | None) -> list[dict]:
    """识别禁忌。"""
    elements = []
    if not formula_name:
        return elements
    if any(kw in sentence for kw in CONTRAINDICATION_KEYWORDS):
        # 提取具体禁忌内容（括号内或整句）
        value = sentence
        bracket_match = re.search(r"[（(]([^()]+)[)）]", sentence)
        if bracket_match:
            value = bracket_match.group(1)
        elements.append({
            "type": "contraindication",
            "value": value,
            "target_card": FORMULA_NAME_TO_ID.get(formula_name, formula_name),
            "target_field": "data.contraindications",
            "confidence": "low"
        })
    return elements


def detect_pathology(sentence: str, formula_name: str | None) -> list[dict]:
    """识别病机。"""
    elements = []
    if not formula_name:
        return elements
    # 简单规则：包含病机关键词，且长度适中
    if any(kw in sentence for kw in PATHOLOGY_KEYWORDS) and 8 <= len(sentence) <= 40:
        # 避免把症状句误判为病机
        if not re.search(r"主之|发热|汗出|头痛|恶风", sentence):
            elements.append({
                "type": "pathology",
                "value": sentence,
                "target_card": FORMULA_NAME_TO_ID.get(formula_name, formula_name),
                "target_field": "data.pathology",
                "confidence": "low"
            })
    return elements


def detect_experience(sentence: str, formula_name: str | None) -> list[dict]:
    """识别经验/注释。"""
    elements = []
    if any(kw in sentence for kw in EXPERIENCE_KEYWORDS):
        target = FORMULA_NAME_TO_ID.get(formula_name, formula_name) if formula_name else "unknown"
        elements.append({
            "type": "experience",
            "value": sentence,
            "target_card": target,
            "target_field": "content",
            "confidence": "low"
        })
    return elements


def get_primary_formula_name(elements: list[dict]) -> str | None:
    """从已识别元素中获取主要方名。"""
    for e in elements:
        if e["type"] == "formula_name":
            return e["value"]
    return None


def process_text(text: str, scope: list[str]) -> list[dict]:
    """处理整个文本，返回提取条目列表。"""
    paragraphs = split_paragraphs(text)
    entries = []
    entry_id = 0

    for para_idx, paragraph in enumerate(paragraphs, start=1):
        sentences = split_sentences(paragraph)
        for sent_idx, sentence in enumerate(sentences, start=1):
            elements = []

            # 1. 先识别方名
            formula_elements = detect_formula_names(sentence, scope)
            elements.extend(formula_elements)
            primary_formula = get_primary_formula_name(formula_elements)

            # 2. 识别 source_text
            elements.extend(detect_source_text(sentence, scope))

            # 3. 其他元素（依赖方名）
            elements.extend(detect_symptoms(sentence, primary_formula))
            elements.extend(detect_herbs(sentence, primary_formula))
            elements.extend(detect_usage(sentence, primary_formula))
            elements.extend(detect_contraindications(sentence, primary_formula))
            elements.extend(detect_pathology(sentence, primary_formula))
            elements.extend(detect_experience(sentence, primary_formula))

            if not elements:
                continue

            entry_id += 1
            entries.append({
                "id": entry_id,
                "status": "pending",
                "source_location": f"原文第{para_idx}段第{sent_idx}句",
                "paragraph_context": paragraph,
                "atomic_sentence": sentence,
                "detected_elements": elements
            })

    return entries


def render_markdown(entries: list[dict], source_name: str, scope: list[str]) -> str:
    """渲染原始提取文件。"""
    today = datetime.now().strftime("%Y-%m-%d")
    lines = [
        "# 卡片原始提取文件",
        "",
        f"- 源文本：{source_name}",
        f"- 提取日期：{today}",
        f"- 提取范围：{json.dumps(scope, ensure_ascii=False)}",
        f"- 总条目数：{len(entries)}",
        "- 待审阅：0（请手动统计）",
        "- 已采纳：0",
        "- 已跳过：0",
        "",
        "---",
        "",
        "## 使用说明",
        "",
        "1. 逐条检查 `detected_elements`；",
        "2. 不对的，把 `status` 改成 `skipped`，在 `reviewer_note` 写原因；",
        "3. 对的，把 `status` 改成 `adopted`；",
        "4. 审阅完成后，再进入第二步生成卡片 JSON。",
        "",
        "---",
        "",
    ]

    for entry in entries:
        lines.append(f"### 条目 #{entry['id']:03d}")
        lines.append("")
        lines.append("```yaml")
        yaml_body = {
            "status": entry["status"],
            "source_location": entry["source_location"],
            "paragraph_context": entry["paragraph_context"],
            "atomic_sentence": entry["atomic_sentence"],
            "detected_elements": entry["detected_elements"],
            "reviewer_note": ""
        }
        # 简单 YAML 序列化
        lines.append(f"status: {yaml_body['status']}")
        lines.append(f"source_location: \"{yaml_body['source_location']}\"")
        lines.append(f"paragraph_context: \"{yaml_body['paragraph_context']}\"")
        lines.append(f"atomic_sentence: \"{yaml_body['atomic_sentence']}\"")
        lines.append("detected_elements:")
        for e in yaml_body["detected_elements"]:
            lines.append("  - type: " + e["type"])
            lines.append("    value: \"" + e["value"] + "\"")
            lines.append("    target_card: " + e["target_card"])
            lines.append("    target_field: " + e["target_field"])
            lines.append("    confidence: " + e["confidence"])
        lines.append("reviewer_note: \"\"")
        lines.append("```")
        lines.append("")
        lines.append("**你的批注写在这里。**")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="text-to-cards 第一步：文本切分与元素识别")
    parser.add_argument("--input", required=True, help="源文本文件路径（.txt 或 .md）")
    parser.add_argument("--scope", required=True, help="范围清单文件路径，每行一个方名")
    parser.add_argument("--output", required=True, help="输出原始提取文件路径（.md）")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"源文本文件不存在: {args.input}")

    scope = load_scope(args.scope)
    if not scope:
        raise ValueError("范围清单为空")

    with open(input_path, "r", encoding="utf-8") as f:
        text = f.read()

    entries = process_text(text, scope)
    markdown = render_markdown(entries, input_path.name, scope)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(markdown)

    print(f"提取完成，共 {len(entries)} 条，输出到: {output_path}")


if __name__ == "__main__":
    main()
