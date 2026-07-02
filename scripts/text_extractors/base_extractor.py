#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""文本提取器基类。"""

from abc import ABC, abstractmethod
from pathlib import Path


class BaseTextExtractor(ABC):
    """将原始文件（txt/html/doc/pdf 等）提取为纯文本。"""

    supported_extensions: tuple = ()

    @abstractmethod
    def extract(self, path: Path) -> str:
        """返回清洗后的纯文本。"""
        pass

    def can_extract(self, path: Path) -> bool:
        return path.suffix.lower() in self.supported_extensions
