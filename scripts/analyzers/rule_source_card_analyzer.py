#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""基于规则的 source_card 分析器。

复用并重构了 text-to-cards/scripts/segment_text.py 的核心逻辑，
输出统一为 Candidate 对象。
"""

import re
from typing import List

from analyzers.base_analyzer import BaseAnalyzer, Document, Candidate


COMMON_SYMPTOMS = [
    "头痛", "头项强痛", "项背强几几", "项背强痛", "发热", "恶风", "恶寒",
    "汗出", "无汗", "喘", "胸胁苦满", "默默不欲饮食", "心烦", "喜呕",
    "往来寒热", "谵语", "潮热", "大便硬", "绕脐痛", "手足濈然汗出",
    "骨节疼痛", "身疼", "腰痛", "脉浮缓", "脉浮紧", "脉浮", "脉紧",
    "汗出而喘", "无汗而喘", "不恶寒", "反恶热", "呕", "渴", "自利",
    "下利", "腹满", "腹痛", "便秘", "小便不利", "项背强"
]

FORMULA_NAME_TO_ID = {
    "桂枝汤": "gui-zhi-tang",
    "麻黄汤": "ma-huang-tang",
    "葛根汤": "ge-gen-tang",
    "大承气汤": "da-cheng-qi-tang",
    "小柴胡汤": "xiao-chai-hu-tang",
    "桂枝加葛根汤": "gui-zhi-jia-ge-gen-tang",
    "桂枝去芍药加附子汤": "gui-zhi-qu-shaoyao-jia-fuzi-tang",
    "桂枝加附子汤": "gui-zhi-jia-fuzi-tang",
    "桂枝去芍药汤": "gui-zhi-qu-shaoyao-tang",
    "麻黄杏仁甘草石膏汤": "ma-huang-xing-ren-gan-cao-shi-gao-tang",
    "大青龙汤": "da-qing-long-tang",
    "小青龙汤": "xiao-qing-long-tang",
    "白虎汤": "bai-hu-tang",
    "四逆汤": "si-ni-tang",
    "理中汤": "li-zhong-tang",
}


def load_scope_from_config(root_path) -> List[str]:
    """从 config/scope_伤寒论常用方.txt 加载方名范围。"""
    import os
    candidates = [
        root_path / "config" / "scope_伤寒论常用方.txt",
        root_path / "config" / "scope_桂枝类方.txt",
    ]
    names = []
    for p in candidates:
        if p.exists():
            try:
                with open(p, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            names.append(line)
            except Exception:
                pass
    return names


class RuleSourceCardAnalyzer(BaseAnalyzer):
    name = "rule_source_card"

    def __init__(self, scope: List[str] = None):
        self.scope = set(scope or list(FORMULA_NAME_TO_ID.keys()))

    def can_handle(self, document: Document) -> bool:
        return '主之' in document.text or '可与' in document.text or '宜' in document.text

    def analyze(self, document: Document) -> List[Candidate]:
        # 如果没有显式 scope，尝试从 config 加载
        if not self.scope:
            from pathlib import Path
            root = Path(document.path_str)
            # 向上找项目根目录
            for parent in [root] + list(root.parents):
                if (parent / "config").exists():
                    scope = load_scope_from_config(parent)
                    if scope:
                        self.scope = set(scope)
                        break
            if not self.scope:
                self.scope = set(FORMULA_NAME_TO_ID.keys())

        paragraphs = self._split_paragraphs(document.text)
        candidates = []
        entry_id = 0

        for para_idx, paragraph in enumerate(paragraphs, start=1):
            sentences = self._split_sentences(paragraph)
            for sent_idx, sentence in enumerate(sentences, start=1):
                formula_names = self._detect_formula_names(sentence)
                if not formula_names:
                    continue
                if not self._looks_like_source_text(sentence):
                    continue

                primary_formula, association_confidence = self._resolve_primary_formula(sentence, formula_names)
                symptoms = self._detect_symptoms(sentence)

                entry_id += 1
                candidates.append(Candidate(
                    type="source_card",
                    source_file=document.path_str,
                    source_location=f"第{para_idx}段第{sent_idx}句",
                    raw_text=sentence,
                    detected_elements=[
                        {"type": "formula_name", "value": primary_formula, "target_card": FORMULA_NAME_TO_ID.get(primary_formula, primary_formula)},
                        {"type": "source_text", "value": sentence, "target_card": FORMULA_NAME_TO_ID.get(primary_formula, primary_formula)},
                        *[{"type": "symptom", "value": s, "target_card": FORMULA_NAME_TO_ID.get(primary_formula, primary_formula)} for s in symptoms]
                    ],
                    confidence="high" if (symptoms and association_confidence == "high") else "medium"
                ))

        return candidates

    def _split_paragraphs(self, text: str) -> List[str]:
        paragraphs = re.split(r"\n\s*\n", text.strip())
        return [p.strip() for p in paragraphs if p.strip()]

    def _split_sentences(self, paragraph: str) -> List[str]:
        raw = re.split(r"([。；？！])", paragraph)
        sentences = []
        current = ""
        for part in raw:
            current += part
            if part and part[-1] in "。；？！":
                sentences.append(current.strip())
                current = ""
        if current.strip():
            sentences.extend(self._split_long_sentence(current.strip()))
        return sentences

    def _split_long_sentence(self, sentence: str) -> List[str]:
        if len(sentence) > 80 and "，" in sentence:
            parts = sentence.split("，")
            return [p.strip() + ("，" if i < len(parts) - 1 else "") for i, p in enumerate(parts) if p.strip()]
        return [sentence]

    def _detect_formula_names(self, sentence: str) -> List[str]:
        found = []
        # 优先匹配长名称（避免"桂枝汤"匹配到"桂枝加葛根汤"）
        for name in sorted(self.scope, key=len, reverse=True):
            if name in sentence and name not in found:
                found.append(name)
        return found

    def _looks_like_source_text(self, sentence: str) -> bool:
        return bool(re.search(r"主之|可与|宜\s*$", sentence))

    def _resolve_primary_formula(self, sentence: str, formula_names: List[str]) -> tuple:
        """判断句子真正的主治方剂。

        优先匹配紧邻结论词（主之/可与/宜）的方名，
        而非句中第一个出现的方名。
        返回 (primary_formula, confidence)。
        """
        # 找结论词位置
        conclusion_match = re.search(r"(主之|可与|宜)[。；？！\s]*$", sentence)
        if not conclusion_match:
            return formula_names[0], "low"

        conclusion_start = conclusion_match.start()
        # 向前看最多 30 个字符（通常方名在结论词前很近）
        context = sentence[max(0, conclusion_start - 30):conclusion_start]

        # 在结论词前找离结论词最近的方名（右匹配），避免句首误方名被当作主方
        best_name = None
        best_end = -1
        for name in formula_names:
            idx = context.rfind(name)
            if idx != -1:
                end = idx + len(name)
                if end > best_end:
                    best_end = end
                    best_name = name

        if best_name:
            return best_name, "high"

        # 若上下文中没有，退回到句中第一个方名
        return formula_names[0], "medium"

    def _detect_symptoms(self, sentence: str) -> List[str]:
        return [s for s in COMMON_SYMPTOMS if s in sentence]
