#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""文本清洗原则 v1（基于先验规则）。

原则：
1. 解码 HTML 实体并去除 HTML 标签。
2. 删除纯导航/元信息行：上一页/下一页/当前页、页码、日期、版权、"勤求古訓"等。
3. 合并段落内的人工换行（单换行）为一个空格，保留空行作为段落分隔。
4. 删除空行和全空白行。
5. 保留条文编号（如 "二四："、"【377】"）。
6. 删除 URL 及 a 标签残留文本。
"""

import html
import re


def clean_v1(text: str) -> str:
    # 1. 去 HTML 标签 + 解码实体
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)

    # 2. 删除 URL
    text = re.sub(r"https?://\S+", "", text)

    # 3. 删除导航/元信息行（整行匹配）
    metadata_patterns = [
        r"^\s*上一页：.*$",
        r"^\s*下一页：.*$",
        r"^\s*当前页：.*$",
        r"^\s*第\s*\d+\s*页\s*$",
        r"^\s*\d{4}-\d{2}-\d{2}.*$",
        r"^\s*勤求古訓.*$",
        r"^\s*博采眾方.*$",
        r"^\s*觀其脈證.*$",
        r"^\s*知犯何逆.*$",
        r"^\s*倪注《伤寒论》.*$",
        r"^\s*本书的原始材料.*$",
        r"^\s*本书的校正的自发行为.*$",
        r"^\s*大非我们在校正的过程中.*$",
    ]
    for pat in metadata_patterns:
        text = re.sub(pat, "", text, flags=re.MULTILINE)

    # 4. 合并段落内换行：非空行后的单换行 -> 空格；连续空行保留一个
    lines = text.splitlines()
    merged = []
    prev_empty = True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if not prev_empty:
                merged.append("")
            prev_empty = True
        else:
            if prev_empty or not merged:
                merged.append(stripped)
            else:
                merged[-1] += " " + stripped
            prev_empty = False
    text = "\n".join(merged)

    # 5. 删除多余空行，段落之间保留一个空行
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 6. 清理行内多余空格
    text = re.sub(r"[ \t]+", " ", text)

    return text.strip()


def main():
    import sys
    from pathlib import Path
    in_file = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("extracted/sample_segments_raw.md")
    out_file = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("extracted/sample_segments_v1.md")

    text = in_file.read_text(encoding="utf-8")
    text = text.replace("\r\n", "\n")

    # 简单块解析：按 "## 片段" 拆分，清洗每个 ``` 块内部
    parts = text.split("## 片段 ")
    cleaned_parts = [parts[0]]  # 标题部分保留
    for part in parts[1:]:
        # 找到 ``` 块
        tick_open = part.find("```\n")
        tick_close = part.find("\n```", tick_open)
        if tick_open == -1 or tick_close == -1:
            cleaned_parts.append("## 片段 " + part)
            continue
        header = part[:tick_open + 4]  # 包含 ```\n
        inner = part[tick_open + 4:tick_close]
        footer = part[tick_close:]
        cleaned_inner = clean_v1(inner)
        cleaned_parts.append("## 片段 " + header + cleaned_inner + footer)

    out_file.write_text("".join(cleaned_parts), encoding="utf-8")
    print(f"已写入 {out_file}")


if __name__ == "__main__":
    main()
