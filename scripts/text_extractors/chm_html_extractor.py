#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CHM 解压后的 HTML 提取器，默认按 GB2312/GBK 解码。"""

import re
import html
from pathlib import Path
from .base_extractor import BaseTextExtractor


class ChmHtmlExtractor(BaseTextExtractor):
    """CHM 反编译出的 .htm 文件通常是 GB2312 编码。"""
    supported_extensions = ('.htm', '.html')

    def extract(self, path: Path) -> str:
        raw = path.read_bytes()
        text = self._decode(raw)
        return self._clean(text)

    def _decode(self, raw: bytes) -> str:
        # CHM 解压出的 HTML 多为 GB 系列编码
        for enc in ('gb18030', 'gbk', 'gb2312', 'utf-8', 'utf-8-sig'):
            try:
                return raw.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return raw.decode('utf-8', errors='ignore')

    def _clean(self, text: str) -> str:
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<[^>]+>', '', text)
        text = html.unescape(text)
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
