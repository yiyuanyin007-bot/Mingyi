#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AI 路由层：根据文档来源和内容特征，分发给合适的分析器。

当前为规则路由；未来可替换为基于 LLM 的分类器，接口保持不变。
"""

from pathlib import Path
from typing import List, Optional, Type

from analyzers.base_analyzer import BaseAnalyzer, Document
from analyzers.rule_source_card_analyzer import RuleSourceCardAnalyzer
from analyzers.rule_experience_card_analyzer import RuleExperienceCardAnalyzer
from analyzers.rule_formula_card_analyzer import RuleFormulaCardAnalyzer


class AIRouter:
    """路由器：为每个 Document 选择合适的分析器。"""

    def __init__(self):
        self.analyzers = {
            'source_card': RuleSourceCardAnalyzer(),
            'experience_card': RuleExperienceCardAnalyzer(),
            'formula_card': RuleFormulaCardAnalyzer(),
        }

    def route(self, document: Document) -> List[BaseAnalyzer]:
        """返回应调用的分析器列表。可能为空（跳过的文档）。"""
        path = Path(document.path_str)
        name_lower = path.name.lower()
        source_type = document.source_type.lower()
        text = document.text

        # 1. 临床资料 → experience_card
        if source_type == 'clinical' or any(k in name_lower for k in ['转写', '现场笔记', '患者', '医案']):
            return [self.analyzers['experience_card']]

        # 2. 经典原文 / 注家注解 / CHM 原文 → source_card
        if source_type in ('classical', 'annotations', 'annotations-chm', 'extracted-chm'):
            # 若文本包含完整方剂描述（药物+剂量+主治），额外给 formula_card 候选
            if self._looks_like_formula_card(text):
                return [self.analyzers['source_card'], self.analyzers['formula_card']]
            return [self.analyzers['source_card']]

        # 3. 其他文本：若像方剂卡则给 formula_card
        if self._looks_like_formula_card(text):
            return [self.analyzers['formula_card']]

        return []

    def _looks_like_formula_card(self, text: str) -> bool:
        """判断文本是否像完整方剂卡（含多味药+剂量+主治）。"""
        herbs = ['桂枝', '芍药', '甘草', '生姜', '大枣', '麻黄', '杏仁', '葛根',
                 '大黄', '厚朴', '枳实', '芒硝', '柴胡', '黄芩', '人参', '半夏']
        found = sum(1 for h in herbs if h in text)
        # 至少 3 味药 + 剂量 + "主之"
        return found >= 3 and any(u in text for u in ['两', '斤', '升', '合', '枚']) and '主之' in text


def get_router() -> AIRouter:
    return AIRouter()
