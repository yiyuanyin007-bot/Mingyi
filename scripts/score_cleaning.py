#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""对清洗后的 sample_segments_v1.md / sample_segments_v2.md 做量化评分。"""

import re
from pathlib import Path


def parse_segments(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    segments = []
    for block in text.split("## 片段")[1:]:
        lines = block.splitlines()
        meta = {}
        body_lines = []
        in_body = False
        for line in lines:
            if line.strip() == "```":
                in_body = not in_body
                continue
            if in_body:
                body_lines.append(line)
            elif line.startswith("- 来源："):
                meta["source"] = line.replace("- 来源：", "").strip()
            elif line.startswith("- 候选 ID："):
                meta["id"] = line.replace("- 候选 ID：", "").strip()
        body = "\n".join(body_lines)
        segments.append({**meta, "body": body})
    return segments


def score_segment(seg: dict) -> dict:
    body = seg["body"]
    lines = [ln for ln in body.splitlines() if ln.strip()]
    chars = len(body)
    # 1. 残留 HTML 标签 / 属性（越少越好）
    html_tags = len(re.findall(r"<[^>]*>", body)) + len(re.findall(r'\b\w+="[^"]*"', body))
    # 2. 残留导航噪声（越少越好）
    nav_noise = len(re.findall(r"上一页|下一页|当前页|第\s*\d+\s*页", body))
    # 3. 平均行长度（越高表示合并越充分）
    avg_line_len = sum(len(ln) for ln in lines) / max(len(lines), 1)
    # 4. 中文标点比例（反映语义连贯性）
    chinese_chars = len(re.findall(r"[\u4e00-\u9fff]", body))
    punctuation = len(re.findall(r"[，。；：！？、]", body))
    punct_ratio = punctuation / max(chinese_chars, 1)
    # 5. 过短行比例（<20 字且不含编号，越低越好）
    short_lines = sum(1 for ln in lines if len(ln) < 20 and not re.search(r"^[一二三四五六七八九十百千万]{1,4}[：:]|[【】]\d+[】]", ln.strip()))
    short_ratio = short_lines / max(len(lines), 1)
    # 6. 条文编号保留
    has_article_number = bool(re.search(r"[一二三四五六七八九十百千万]{1,4}[：:]|[【】]\d+[】]", body))
    return {
        "id": seg["id"],
        "source": Path(seg["source"]).name,
        "chars": chars,
        "lines": len(lines),
        "avg_line_len": round(avg_line_len, 1),
        "html_tags": html_tags,
        "nav_noise": nav_noise,
        "punct_ratio": round(punct_ratio, 3),
        "short_ratio": round(short_ratio, 3),
        "has_article_number": has_article_number,
    }


def main():
    v1 = parse_segments(Path("extracted/sample_segments_v1.md"))
    v2 = parse_segments(Path("extracted/sample_segments_v2.md"))
    scores_v1 = [score_segment(s) for s in v1]
    scores_v2 = [score_segment(s) for s in v2]

    report_lines = ["# 清洗策略量化评分", ""]
    report_lines.append("| ID | 来源 | 版本 | 字数 | 行数 | 平均行长度 | HTML残留 | 导航残留 | 短行比例 | 编号保留 |")
    report_lines.append("|---|---|---|---|---|---|---|---|---|---|")
    for a, b in zip(scores_v1, scores_v2):
        report_lines.append(
            f"| {a['id']} | {a['source']} | v1 | {a['chars']} | {a['lines']} | {a['avg_line_len']} | {a['html_tags']} | {a['nav_noise']} | {a['short_ratio']} | {'是' if a['has_article_number'] else '否'} |"
        )
        report_lines.append(
            f"| {b['id']} | {b['source']} | v2 | {b['chars']} | {b['lines']} | {b['avg_line_len']} | {b['html_tags']} | {b['nav_noise']} | {b['short_ratio']} | {'是' if b['has_article_number'] else '否'} |"
        )

    # 聚合
    def agg(scores):
        return {
            "avg_line_len": round(sum(s["avg_line_len"] for s in scores) / len(scores), 1),
            "html_tags": sum(s["html_tags"] for s in scores),
            "nav_noise": sum(s["nav_noise"] for s in scores),
            "short_ratio": round(sum(s["short_ratio"] for s in scores) / len(scores), 3),
            "article_kept": sum(1 for s in scores if s["has_article_number"]),
        }

    av1, av2 = agg(scores_v1), agg(scores_v2)
    report_lines.append("")
    report_lines.append("## 聚合指标")
    report_lines.append("")
    report_lines.append("| 版本 | 平均行长度 | 总 HTML 残留 | 总导航残留 | 平均短行比例 | 编号保留条数 |")
    report_lines.append("|---|---|---|---|---|---|")
    report_lines.append(f"| v1 | {av1['avg_line_len']} | {av1['html_tags']} | {av1['nav_noise']} | {av1['short_ratio']} | {av1['article_kept']}/10 |")
    report_lines.append(f"| v2 | {av2['avg_line_len']} | {av2['html_tags']} | {av2['nav_noise']} | {av2['short_ratio']} | {av2['article_kept']}/10 |")

    out = Path("extracted/cleaning_scores.md")
    out.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"已写入 {out}")


if __name__ == "__main__":
    main()
