#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path
from typing import Optional

from .base_extractor import BaseTextExtractor
from .txt_extractor import TxtExtractor
from .html_extractor import HtmlExtractor
from .md_extractor import MdExtractor
from .chm_html_extractor import ChmHtmlExtractor
from .doc_extractor import DocExtractor
from .pdf_extractor import PdfExtractor


# 默认提取器注册表，按扩展名匹配
DEFAULT_EXTRACTORS = [
    TxtExtractor(),
    MdExtractor(),
    HtmlExtractor(),
    DocExtractor(),
    PdfExtractor(),
]


def get_extractor(path: Path, is_chm_html: bool = False) -> Optional[BaseTextExtractor]:
    """根据文件路径选择合适的提取器。"""
    ext = path.suffix.lower()

    if is_chm_html:
        return ChmHtmlExtractor()

    if ext in ('.md', '.markdown'):
        return MdExtractor()
    if ext == '.txt':
        return TxtExtractor()
    if ext in ('.html', '.htm'):
        return HtmlExtractor()
    if ext in ('.doc', '.docx'):
        return DocExtractor()
    if ext == '.pdf':
        return PdfExtractor()

    # fallback：尝试按通用文本读取
    if ext in ('.text', ''):
        return TxtExtractor()

    return None


def extract_text(path: Path, source_type: str = "") -> str:
    """便捷函数：提取文件文本。"""
    is_chm_html = source_type == "annotations-chm" or "extracted-chm" in str(path)
    extractor = get_extractor(path, is_chm_html=is_chm_html)
    if not extractor:
        raise ValueError(f"不支持的文件格式: {path.suffix}")
    return extractor.extract(path)
