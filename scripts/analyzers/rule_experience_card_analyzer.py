#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""基于规则的经验卡分析器。

处理临床转写、现场笔记等，提取疑似医案/经验片段。
MVP 阶段较宽松，主要识别含方名 + 疗效描述的段落。
"""

import re
from typing import List

from analyzers.base_analyzer import BaseAnalyzer, Document, Candidate


FORMULA_NAMES = [
    "桂枝汤", "麻黄汤", "葛根汤", "大承气汤", "小柴胡汤",
    "桂枝加葛根汤", "桂枝去芍药加附子汤", "桂枝加附子汤",
    "桂枝去芍药汤", "麻黄杏仁甘草石膏汤", "大青龙汤", "小青龙汤"
]

EFFICACY_KEYWORDS = [
    "好转", "减轻", "消失", "改善", "有效", "无效", "加重",
    "汗出减少", "恶风减轻", "热退", "痛减", "眠安", "便通"
]


class RuleExperienceCardAnalyzer(BaseAnalyzer):
    name = "rule_experience_card"

    def can_handle(self, document: Document) -> bool:
        # 临床经验类文档默认处理
        if document.source_type == 'clinical':
            return True
        text = document.text
        has_formula = any(f in text for f in FORMULA_NAMES)
        has_efficacy = any(k in text for k in EFFICACY_KEYWORDS)
        return has_formula and has_efficacy

    def analyze(self, document: Document) -> List[Candidate]:
        paragraphs = self._split_paragraphs(document.text)
        candidates = []

        for idx, para in enumerate(paragraphs, start=1):
            formulas = [f for f in FORMULA_NAMES if f in para]
            has_efficacy = any(k in para for k in EFFICACY_KEYWORDS)

            if not formulas or not has_efficacy:
                continue

            # 简单提取：含方名 + 疗效的段落作为一个经验候选
            candidates.append(Candidate(
                type="experience_card",
                source_file=document.path_str,
                source_location=f"第{idx}段",
                raw_text=para,
                detected_elements=[
                    {"type": "formula_name", "value": f, "target_card": f}
                    for f in formulas
                ] + [
                    {"type": "efficacy_signal", "value": k}
                    for k in EFFICACY_KEYWORDS if k in para
                ],
                confidence="low"
            ))

        return candidates

    def _split_paragraphs(self, text: str) -> List[str]:
        paragraphs = re.split(r"\n\s*\n", text.strip())
        return [p.strip() for p in paragraphs if p.strip()]
