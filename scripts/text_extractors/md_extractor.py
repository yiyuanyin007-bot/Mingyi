#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Markdown 文本提取器：作为 HTML 提取器的特化版，额外剥离 Markdown 标记。"""

import re
from pathlib import Path
from .base_extractor import BaseTextExtractor


class MdExtractor(BaseTextExtractor):
    supported_extensions = ('.md', '.markdown')

    def extract(self, path: Path) -> str:
        text = path.read_text(encoding='utf-8', errors='ignore')
        return self._clean(text)

    def _clean(self, text: str) -> str:
        # 去掉 YAML frontmatter
        text = re.sub(r'^---\s*\n.*?\n---\s*\n', '', text, flags=re.DOTALL)
        # 去掉代码块
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        # 去掉行内代码
        text = re.sub(r'`[^`]+`', '', text)
        # 去掉图片链接
        text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', text)
        # 去掉普通链接，保留文本
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        # 去掉强调标记
        text = re.sub(r'\*\*+|__+|\*+|_+', '', text)
        # 去掉标题标记
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        # 去掉列表标记
        text = re.sub(r'^[\*\-\+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
        # 去掉表格分隔线
        text = re.sub(r'\n\s*\|[-:\|\s]*\|\s*\n', '\n', text)
        text = text.replace('|', ' ')
        # 统一空白
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
