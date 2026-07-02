#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""提取分析器基类与统一数据结构。

所有分析器（规则版、LLM 版）都继承 BaseAnalyzer，返回 Candidate 列表。
这样脚本层和路由层不需要关心具体算法。
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from pathlib import Path
import hashlib


@dataclass
class Document:
    """经过格式提取后的文档单元。"""
    path: Path                      # 原始文件路径（项目内相对路径或绝对路径）
    source_type: str                # 来源分类：classical / annotations / annotations-chm / clinical 等
    title: str                      # 文档标题（从文件名或元数据提取）
    text: str                       # 清洗后的纯文本
    metadata: dict = field(default_factory=dict)

    @property
    def path_str(self) -> str:
        return str(self.path)


@dataclass
class Candidate:
    """一个提取候选。"""
    type: str                       # source_card / formula_card / experience_card
    source_file: str                # 来源文件路径
    source_location: str            # 在源文件中的位置描述
    raw_text: str                   # 原始文本片段
    detected_elements: List[dict] = field(default_factory=list)
    confidence: str = "medium"      # high / medium / low
    status: str = "pending"         # pending / approved / rejected
    reviewer_note: str = ""
    extracted_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def __post_init__(self):
        if not hasattr(self, '_id'):
            self._id = self._generate_id()

    def _generate_id(self) -> str:
        """基于来源和文本生成稳定 ID。"""
        content = f"{self.source_file}::{self.source_location}::{self.raw_text[:200]}"
        h = hashlib.sha256(content.encode('utf-8')).hexdigest()[:12]
        prefix = {
            'source_card': 'src',
            'formula_card': 'formula',
            'experience_card': 'exp'
        }.get(self.type, 'cand')
        return f"{prefix}-{h}"

    @property
    def id(self) -> str:
        return self._id

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "source_file": self.source_file,
            "source_location": self.source_location,
            "raw_text": self.raw_text,
            "detected_elements": self.detected_elements,
            "confidence": self.confidence,
            "status": self.status,
            "reviewer_note": self.reviewer_note,
            "extracted_at": self.extracted_at
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Candidate":
        c = cls(
            type=d["type"],
            source_file=d["source_file"],
            source_location=d["source_location"],
            raw_text=d["raw_text"],
            detected_elements=d.get("detected_elements", []),
            confidence=d.get("confidence", "medium"),
            status=d.get("status", "pending"),
            reviewer_note=d.get("reviewer_note", ""),
            extracted_at=d.get("extracted_at", datetime.now().isoformat())
        )
        return c


class BaseAnalyzer(ABC):
    """分析器抽象基类。"""

    name: str = "base"

    @abstractmethod
    def analyze(self, document: Document) -> List[Candidate]:
        """分析文档，返回候选列表。"""
        pass

    def can_handle(self, document: Document) -> bool:
        """可选：快速判断是否能处理该文档。"""
        return True
