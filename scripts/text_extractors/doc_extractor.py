#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""DOC/DOCX 文本提取器（MVP 阶段为占位实现）。"""

from pathlib import Path
from .base_extractor import BaseTextExtractor


class DocExtractor(BaseTextExtractor):
    supported_extensions = ('.doc', '.docx')

    def extract(self, path: Path) -> str:
        # MVP 阶段：提示用户安装 python-docx 或 antiword
        raise NotImplementedError(
            f"DOC/DOCX 提取需要安装 python-docx：pip install python-docx\n"
            f"然后实现 {self.__class__.__name__}.extract()"
        )
