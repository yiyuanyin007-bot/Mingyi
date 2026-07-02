#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TXT 文本提取器，支持 UTF-8 / GB2312 / GBK 自动检测。"""

import re
from pathlib import Path
from .base_extractor import BaseTextExtractor


class TxtExtractor(BaseTextExtractor):
    supported_extensions = ('.txt',)

    def extract(self, path: Path) -> str:
        raw = path.read_bytes()
        text = self._decode(raw)
        return self._clean(text)

    def _decode(self, raw: bytes) -> str:
        for enc in ('utf-8', 'utf-8-sig', 'gb2312', 'gbk', 'gb18030'):
            try:
                return raw.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        # 最后尝试忽略错误解码
        return raw.decode('utf-8', errors='ignore')

    def _clean(self, text: str) -> str:
        # 统一换行符
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        # 去除 BOM
        text = text.lstrip('\ufeff')
        # 合并连续空行
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
