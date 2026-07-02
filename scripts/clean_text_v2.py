#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""文本清洗原则 v2（基于 v1 经验 + 来源感知）。

v1 问题：
- 倪海厦 txt 的破碎排版没有被真正合并（仅合并了非空行）。
- CHM 中残缺的 HTML 标签（如 tle="..."）和导航链接没有被清除。
- 没有按来源类型区分策略。

v2 改进：
1. 来源感知：
   - 倪海厦 txt：先激进合并所有换行，再按「条文编号」或「方名+主之」拆分为段落。
   - CHM/HTML：更鲁棒地去标签（含残缺标签），删除表格导航，保留 <h1>/<p>/<strong> 语义块。
2. 通用清洗：
   - 解码 HTML 实体，删除 URL，删除元信息行。
   - 删除内联导航："上一页：... 当前页：... 下一页：..."。
   - 删除过短碎片行（<5 字符且不含中文）。
3. 结构保护：
   - 保留条文编号（"二四："、"【377】"）。
   - 在条文编号前强制分段，方便后续按条提取。
"""

import html
import re


def _remove_metadata(text: str) -> str:
    """删除页眉页脚、导航、版权等元信息。"""
    patterns = [
        # 内联导航（合并在一行的情况）
        r"上一页：.*?当前页：.*?下一页：.*?",
        r"上一页：.*?下一页：.*?",
        # 行级别导航
        r"^\s*上一页：.*$",
        r"^\s*下一页：.*$",
        r"^\s*当前页：.*$",
        # 页码和日期
        r"^\s*第\s*\d+\s*页\s*$",
        r"\d{4}-\d{2}-\d{2}定稿",
        r"^\s*\d{4}-\d{2}-\d{2}\s*$",
        # 倪海厦常见噪声
        r"勤求古訓[^\n]*",
        r"博采眾方[^\n]*",
        r"觀其脈證[^\n]*",
        r"知犯何逆[^\n]*",
        r"倪注《伤寒论》[^\n]*",
        # 版权/说明
        r"本书的原始材料来自于网络[^\n]*",
        r"本书的校正的自发行为[^\n]*",
        r"不收取任何费用[^\n]*",
        r"不得将本书内容用于商业行为[^\n]*",
        r"大非我们在校正的过程中[^\n]*",
    ]
    for pat in patterns:
        text = re.sub(pat, "", text, flags=re.MULTILINE)
    return text


def _strip_html_robust(text: str) -> str:
    """更鲁棒地去除 HTML 标签，包括残缺的属性片段。"""
    # 先完整标签
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
    # 移除 <a> 标签但保留链接文本（如果标签是完整的）
    text = re.sub(r"<a\b[^>]*>(.*?)</a>", r"\1", text, flags=re.DOTALL | re.IGNORECASE)
    # 移除其他完整标签
    text = re.sub(r"<[^>]+>", "", text)
    # 删除残缺属性片段，如 tle="..."> 或 bordercolor="#FFFFFF">
    text = re.sub(r'\b\w+="[^"]*"\s*>', "", text)
    # 删除未闭合的 HTML 标签开头，如 <td align=" 或 <a href=" target="_blank" title="...
    text = re.sub(r'<\w+\b[^>]*?(?:"[^"]*?)?$', "", text, flags=re.MULTILINE)
    # 删除残留尖括号内容
    text = re.sub(r'<[^>]*', "", text)
    # 解码实体
    text = html.unescape(text)
    return text


def _remove_urls(text: str) -> str:
    return re.sub(r"https?://\S+", "", text)


def _split_by_article_numbers(text: str) -> str:
    """在条文编号前加分段。"""
    # 中文数字编号：二四：
    text = re.sub(r"([一二三四五六七八九十百千万]{1,4}[：:])", r"\n\n\1", text)
    # 方括号编号：【377】
    text = re.sub(r"(【\d+】)", r"\n\n\1", text)
    return text


def _drop_fragments(lines: list[str]) -> list[str]:
    """删除过短碎片行（不含中文或长度<5）。"""
    result = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        has_chinese = bool(re.search(r"[\u4e00-\u9fff]", stripped))
        if len(stripped) < 5 and not has_chinese:
            continue
        # 删除纯标点/单字重复行
        if re.fullmatch(r"[，。、；：！？\s]+", stripped):
            continue
        result.append(line)
    return result


def clean_nihaixia_text(text: str) -> str:
    """针对倪海厦 txt 的清洗策略：所有非空行合并为一段，再按条文编号拆分。

    倪海厦 txt 的排版特征：几乎每行后都有空行，空行不是段落分隔，
    而是 PDF/扫描转 txt 的版式残留。因此先全部合并，再按条文编号重分。
    """
    text = _remove_metadata(text)
    text = _strip_html_robust(text)
    text = _remove_urls(text)
    # 删除所有空白行，保留非空行
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    # 用空格连接成连续文本
    text = " ".join(lines)
    # 按条文编号拆分
    text = _split_by_article_numbers(text)
    # 最终整理
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    lines = _drop_fragments(text.split("\n"))
    return "\n".join(lines).strip()


def clean_chm_text(text: str) -> str:
    """针对 CHM HTML 的清洗策略：去标签、去导航、保留语义块。"""
    text = _strip_html_robust(text)
    text = _remove_metadata(text)
    text = _remove_urls(text)
    # 按空行分段
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    # 按条文编号拆分
    text = _split_by_article_numbers(text)
    # 删除表格导航残留
    text = re.sub(r"bordercolor=\"[^\"]*\"", "", text)
    text = re.sub(r"align=\"[^\"]*\"", "", text)
    text = re.sub(r"<td[^>]*>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<tr[^>]*>", "", text, flags=re.IGNORECASE)
    # 最终整理
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    lines = _drop_fragments(text.split("\n"))
    return "\n".join(lines).strip()


def clean_v2(text: str, source_file: str = "") -> str:
    """根据来源选择清洗策略。"""
    if "倪海夏" in source_file and "cleaned" not in source_file:
        return clean_nihaixia_text(text)
    elif ".htm" in source_file.lower() or ".html" in source_file.lower():
        return clean_chm_text(text)
    else:
        # 通用策略：接近 v1，但加上编号拆分和碎片删除
        text = _remove_metadata(text)
        text = _strip_html_robust(text)
        text = _remove_urls(text)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        text = _split_by_article_numbers(text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        lines = _drop_fragments(text.split("\n"))
        return "\n".join(lines).strip()


def main():
    import sys
    from pathlib import Path
    in_file = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("extracted/sample_segments_raw.md")
    out_file = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("extracted/sample_segments_v2.md")

    text = in_file.read_text(encoding="utf-8")
    text = text.replace("\r\n", "\n")

    # 简单块解析：按 "## 片段" 拆分，清洗每个 ``` 块内部
    parts = text.split("## 片段 ")
    cleaned_parts = [parts[0]]
    for part in parts[1:]:
        # 提取来源
        source_match = re.search(r"- 来源：(.*?)(?:\n|$)", "## 片段 " + part)
        source_file = source_match.group(1) if source_match else ""
        # 找到 ``` 块
        tick_open = part.find("```\n")
        tick_close = part.find("\n```", tick_open)
        if tick_open == -1 or tick_close == -1:
            cleaned_parts.append("## 片段 " + part)
            continue
        header = part[:tick_open + 4]
        inner = part[tick_open + 4:tick_close]
        footer = part[tick_close:]
        cleaned_inner = clean_v2(inner, source_file)
        cleaned_parts.append("## 片段 " + header + cleaned_inner + footer)

    out_file.write_text("".join(cleaned_parts), encoding="utf-8")
    print(f"已写入 {out_file}")


if __name__ == "__main__":
    main()
