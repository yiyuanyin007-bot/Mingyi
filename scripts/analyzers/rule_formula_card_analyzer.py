#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""基于规则的 formula_card 分析器。

识别文本中同时包含方名、多味药物及剂量的完整方剂描述段落。
MVP 阶段只做候选提取，不生成完整 JSON。
"""

import re
from typing import List

from analyzers.base_analyzer import BaseAnalyzer, Document, Candidate


HERBS = [
    "桂枝", "芍药", "甘草", "生姜", "大枣", "麻黄", "杏仁", "葛根",
    "大黄", "厚朴", "枳实", "芒硝", "柴胡", "黄芩", "人参", "半夏",
    "茯苓", "白术", "附子", "干姜", "细辛", "五味子", "石膏", "知母",
    "粳米", "瓜蒌", "薤白", "白酒", "枳壳", "桔梗", "贝母"
]

DOSAGE_UNITS = ["两", "斤", "升", "合", "枚", "个", "片", "方寸匕", "分", "半斤", "铢"]

FORMULA_NAMES = [
    "桂枝汤", "麻黄汤", "葛根汤", "大承气汤", "小柴胡汤",
    "桂枝加葛根汤", "桂枝去芍药加附子汤", "桂枝加附子汤",
    "桂枝去芍药汤", "麻黄杏仁甘草石膏汤", "大青龙汤", "小青龙汤"
]


class RuleFormulaCardAnalyzer(BaseAnalyzer):
    name = "rule_formula_card"

    def can_handle(self, document: Document) -> bool:
        text = document.text
        has_formula = any(f in text for f in FORMULA_NAMES)
        herb_count = sum(1 for h in HERBS if h in text)
        has_dosage = any(u in text for u in DOSAGE_UNITS)
        return has_formula and herb_count >= 3 and has_dosage

    def analyze(self, document: Document) -> List[Candidate]:
        paragraphs = self._split_paragraphs(document.text)
        candidates = []

        for idx, para in enumerate(paragraphs, start=1):
            formulas = [f for f in FORMULA_NAMES if f in para]
            if not formulas:
                continue

            herbs_with_dosage = self._extract_herbs(para)
            if len(herbs_with_dosage) < 3:
                continue

            primary_formula = formulas[0]
            candidates.append(Candidate(
                type="formula_card",
                source_file=document.path_str,
                source_location=f"第{idx}段",
                raw_text=para,
                detected_elements=[
                    {"type": "formula_name", "value": primary_formula, "target_card": primary_formula},
                    *[{"type": "herb", "value": f"{h} {d}", "target_card": primary_formula} for h, d in herbs_with_dosage]
                ],
                confidence="low"
            ))

        return candidates

    def _split_paragraphs(self, text: str) -> List[str]:
        paragraphs = re.split(r"\n\s*\n", text.strip())
        return [p.strip() for p in paragraphs if p.strip()]

    def _extract_herbs(self, text: str) -> List[tuple]:
        results = []
        pattern = re.compile(
            r"(" + "|".join(map(re.escape, HERBS)) + r")"
            r"(?:\s*)"
            r"((?:[一二三四五六七八九十百千]+(?:\s*)?)+(" + "|".join(DOSAGE_UNITS) + r"))"
        )
        for match in pattern.finditer(text):
            herb = match.group(1)
            dosage = match.group(2).strip()
            results.append((herb, dosage))
        return results
