#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF 文本提取器（MVP 阶段为占位实现）。"""

from pathlib import Path
from .base_extractor import BaseTextExtractor


class PdfExtractor(BaseTextExtractor):
    supported_extensions = ('.pdf',)

    def extract(self, path: Path) -> str:
        # MVP 阶段：提示用户安装 PyMuPDF 或 pdfplumber
        raise NotImplementedError(
            f"PDF 提取需要安装 PyMuPDF：pip install pymupdf\n"
            f"扫描版 PDF 还需配置 Tesseract OCR。"
        )
