#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""HTML 文本提取器：去标签、解码实体、保留段落结构。"""

import re
import html
from pathlib import Path
from .base_extractor import BaseTextExtractor


class HtmlExtractor(BaseTextExtractor):
    supported_extensions = ('.html', '.htm', '.xhtml')

    def extract(self, path: Path) -> str:
        raw = path.read_bytes()
        text = self._decode(raw)
        return self._clean(text)

    def _decode(self, raw: bytes) -> str:
        # 先从内容中探测 charset
        detected = None
        head = raw[:2048].decode('ascii', errors='ignore')
        m = re.search(r'<meta[^>]+charset=["\']?([^"\'>\s]+)', head, re.IGNORECASE)
        if m:
            detected = m.group(1).lower()
        encodings = ['utf-8', 'utf-8-sig']
        if detected and detected not in encodings:
            encodings.insert(0, detected)
        for enc in encodings + ['gb2312', 'gbk', 'gb18030']:
            try:
                return raw.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return raw.decode('utf-8', errors='ignore')

    def _clean(self, text: str) -> str:
        # 去掉 script/style
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
        # 去标签
        text = re.sub(r'<[^>]+>', '', text)
        # 解码 HTML 实体
        text = html.unescape(text)
        # 统一空白
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        text = re.sub(r'[ \t]+', ' ', text)
        # 合并连续空行
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
