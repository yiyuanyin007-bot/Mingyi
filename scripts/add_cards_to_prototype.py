#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 5 张太阳病篇方剂卡片追加到 v8 MVP 原型中，使总卡片数达到 10 张。"""

import json
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = ROOT / "app"
HTML_FILE = APP_DIR / "shanghanlun-v8-mvp.html"
BACKUP_FILE = APP_DIR / "archive" / "shanghanlun-v8-mvp-before-10cards.html"


def make_mastery():
    return {
        "0→1": {"label": "方名→症状", "level": 0, "status": "未知",
                 "last_result": None, "last_review": None,
                 "streak_right": 0, "streak_wrong": 0,
                 "total_rights": 0, "total_wrongs": 0, "history": []},
        "1→0": {"label": "症状→方名", "level": 0, "status": "未知",
                 "last_result": None, "last_review": None,
                 "streak_right": 0, "streak_wrong": 0,
                 "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→2": {"label": "方名→药物", "level": 0, "status": "未知",
                 "last_result": None, "last_review": None,
                 "streak_right": 0, "streak_wrong": 0,
                 "total_rights": 0, "total_wrongs": 0, "history": []},
        "2→0": {"label": "药物→方名", "level": 0, "status": "未知",
                 "last_result": None, "last_review": None,
                 "streak_right": 0, "streak_wrong": 0,
                 "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→usage": {"label": "方名→煎服法", "level": 0, "status": "未知",
                     "last_result": None, "last_review": None,
                     "streak_right": 0, "streak_wrong": 0,
                     "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→contra": {"label": "方名→禁忌", "level": 0, "status": "未知",
                     "last_result": None, "last_review": None,
                     "streak_right": 0, "streak_wrong": 0,
                     "total_rights": 0, "total_wrongs": 0, "history": []},
    }


def new_cards():
    now = datetime.now().isoformat()
    return [
        {
            "id": "gui-zhi-jia-ge-gen-tang",
            "type": "formula_card",
            "name": "桂枝加葛根汤",
            "formula_name": "桂枝加葛根汤",
            "role": "主方",
            "desc": "太阳中风兼项背强痛",
            "tags": ["太阳病", "项背强几几", "汗出", "恶风", "太阳病篇"],
            "source_chapter": "太阳病篇",
            "source_text_ids": ["gui-zhi-jia-ge-gen-tang-src-001"],
            "lineage": {"base_formula": "桂枝汤", "variant_path": ["加葛根"], "reference_source": "伤寒论原文"},
            "created_at": now,
            "updated_at": now,
            "data": {
                "source_text": "太阳病，项背强几几，反汗出恶风者，桂枝加葛根汤主之。",
                "canonical": {
                    "symptom_profile": {
                        "necessary": ["项背强几几", "汗出", "恶风"],
                        "common": ["发热", "头痛", "脉浮缓"],
                        "excluding": ["无汗"]
                    },
                    "pathology": "太阳中风，津液不升，经脉失养",
                    "herbs": [
                        {"name": "葛根", "dosage": "四两"},
                        {"name": "桂枝", "dosage": "三两"},
                        {"name": "芍药", "dosage": "三两"},
                        {"name": "甘草", "dosage": "二两"},
                        {"name": "生姜", "dosage": "三两"},
                        {"name": "大枣", "dosage": "十二枚"}
                    ],
                    "usage": "以水一斗，先煮葛根减二升，去上沫，内诸药，煮取三升，去滓，温服一升。覆取微似汗，不须啜粥。",
                    "contraindications": ["无汗项背强（葛根汤证）"]
                },
                "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
                "variants": [],
                "allow_multiple": False,
                "mapping_note": ""
            },
            "experience_ids": [],
            "mastery": make_mastery()
        },
        {
            "id": "gui-zhi-jia-houpo-xingzi-tang",
            "type": "formula_card",
            "name": "桂枝加厚朴杏子汤",
            "formula_name": "桂枝加厚朴杏子汤",
            "role": "主方",
            "desc": "太阳中风兼肺气上逆微喘",
            "tags": ["太阳病", "下之后", "微喘", "表未解", "太阳病篇"],
            "source_chapter": "太阳病篇",
            "source_text_ids": ["gui-zhi-jia-houpo-xingzi-tang-src-001"],
            "lineage": {"base_formula": "桂枝汤", "variant_path": ["加厚朴", "加杏仁"], "reference_source": "伤寒论原文"},
            "created_at": now,
            "updated_at": now,
            "data": {
                "source_text": "太阳病，下之微喘者，表未解故也，桂枝加厚朴杏子汤主之。",
                "canonical": {
                    "symptom_profile": {
                        "necessary": ["汗出", "恶风", "微喘"],
                        "common": ["发热", "头痛", "脉浮缓"],
                        "excluding": ["无汗而喘", "喘甚热盛"]
                    },
                    "pathology": "太阳中风，表未解，肺气上逆",
                    "herbs": [
                        {"name": "桂枝", "dosage": "三两"},
                        {"name": "芍药", "dosage": "三两"},
                        {"name": "甘草", "dosage": "二两"},
                        {"name": "生姜", "dosage": "三两"},
                        {"name": "大枣", "dosage": "十二枚"},
                        {"name": "厚朴", "dosage": "二两"},
                        {"name": "杏仁", "dosage": "五十枚"}
                    ],
                    "usage": "煮法同桂枝汤，温服一升，覆取微似汗。",
                    "contraindications": ["肺热实喘", "无汗表实"]
                },
                "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
                "variants": [],
                "allow_multiple": False,
                "mapping_note": ""
            },
            "experience_ids": [],
            "mastery": make_mastery()
        },
        {
            "id": "gui-zhi-qu-shaoyao-tang",
            "type": "formula_card",
            "name": "桂枝去芍药汤",
            "formula_name": "桂枝去芍药汤",
            "role": "主方",
            "desc": "太阳中风误下后胸阳不振",
            "tags": ["太阳病", "误下", "脉促", "胸满", "太阳病篇"],
            "source_chapter": "太阳病篇",
            "source_text_ids": ["gui-zhi-qu-shaoyao-tang-src-001"],
            "lineage": {"base_formula": "桂枝汤", "variant_path": ["去芍药"], "reference_source": "伤寒论原文"},
            "created_at": now,
            "updated_at": now,
            "data": {
                "source_text": "太阳病，下之后，脉促胸满者，桂枝去芍药汤主之。",
                "canonical": {
                    "symptom_profile": {
                        "necessary": ["脉促", "胸满"],
                        "common": ["汗出", "恶风", "发热"],
                        "excluding": ["胸满腹痛", "胸满烦惊"]
                    },
                    "pathology": "太阳中风，误下伤阳，胸阳不振",
                    "herbs": [
                        {"name": "桂枝", "dosage": "三两"},
                        {"name": "甘草", "dosage": "二两"},
                        {"name": "生姜", "dosage": "三两"},
                        {"name": "大枣", "dosage": "十二枚"}
                    ],
                    "usage": "煮法同桂枝汤，温服一升。",
                    "contraindications": ["阴虚火旺", "胸满属实"]
                },
                "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
                "variants": ["gui-zhi-qu-shaoyao-jia-fuzi-tang"],
                "allow_multiple": False,
            "mapping_note": ""
            },
            "experience_ids": [],
            "mastery": make_mastery()
        },
        {
            "id": "ma-huang-xing-ren-gan-cao-shi-gao-tang",
            "type": "formula_card",
            "name": "麻黄杏仁甘草石膏汤",
            "formula_name": "麻黄杏仁甘草石膏汤",
            "role": "主方",
            "desc": "邪热壅肺之汗出而喘",
            "tags": ["太阳病", "汗出", "喘", "无大热", "太阳病篇"],
            "source_chapter": "太阳病篇",
            "source_text_ids": ["ma-huang-xing-ren-gan-cao-shi-gao-tang-src-001"],
            "lineage": {"base_formula": "麻黄汤", "variant_path": ["去桂枝", "加石膏"], "reference_source": "伤寒论原文"},
            "created_at": now,
            "updated_at": now,
            "data": {
                "source_text": "发汗后，不可更行桂枝汤。汗出而喘，无大热者，可与麻黄杏仁甘草石膏汤。",
                "canonical": {
                    "symptom_profile": {
                        "necessary": ["汗出", "喘", "无大热"],
                        "common": ["口渴", "咳痰黄", "脉浮数"],
                        "excluding": ["无汗而喘", "表虚汗出恶风"]
                    },
                    "pathology": "邪热壅肺，肺失宣降",
                    "herbs": [
                        {"name": "麻黄", "dosage": "四两"},
                        {"name": "杏仁", "dosage": "五十个"},
                        {"name": "甘草", "dosage": "二两"},
                        {"name": "石膏", "dosage": "半斤"}
                    ],
                    "usage": "以水七升，煮麻黄减二升，去上沫，内诸药，煮取二升，去滓，温服一升。",
                    "contraindications": ["表虚汗出恶风", "无热喘证"]
                },
                "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
                "variants": [],
                "allow_multiple": False,
                "mapping_note": ""
            },
            "experience_ids": [],
            "mastery": make_mastery()
        },
        {
            "id": "xiao-jian-zhong-tang",
            "type": "formula_card",
            "name": "小建中汤",
            "formula_name": "小建中汤",
            "role": "主方",
            "desc": "中焦虚寒、气血两虚之里急",
            "tags": ["太阳病", "心中悸", "烦", "腹中痛", "太阳病篇"],
            "source_chapter": "太阳病篇",
            "source_text_ids": ["xiao-jian-zhong-tang-src-001"],
            "lineage": {"base_formula": "桂枝汤", "variant_path": ["倍芍药", "加饴糖"], "reference_source": "伤寒论原文"},
            "created_at": now,
            "updated_at": now,
            "data": {
                "source_text": "伤寒二三日，心中悸而烦者，小建中汤主之。",
                "canonical": {
                    "symptom_profile": {
                        "necessary": ["心中悸", "烦", "腹中痛"],
                        "common": ["面色萎黄", "食欲不振", "四肢酸痛", "手足烦热"],
                        "excluding": ["实热腹痛", "食积腹痛"]
                    },
                    "pathology": "中焦虚寒，气血两虚，化源不足",
                    "herbs": [
                        {"name": "桂枝", "dosage": "三两"},
                        {"name": "甘草", "dosage": "三两"},
                        {"name": "大枣", "dosage": "十二枚"},
                        {"name": "芍药", "dosage": "六两"},
                        {"name": "生姜", "dosage": "三两"},
                        {"name": "胶饴", "dosage": "一升"}
                    ],
                    "usage": "以水七升，煮取三升，去滓，内饴，更上微火消解，温服一升，日三服。",
                    "contraindications": ["湿热中满", "实热腹痛", "呕吐酸腐"]
                },
                "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
                "variants": [],
                "allow_multiple": False,
                "mapping_note": ""
            },
            "experience_ids": [],
            "mastery": make_mastery()
        },
    ]


def main():
    lines = HTML_FILE.read_text(encoding="utf-8").splitlines(keepends=True)

    # 备份
    BACKUP_FILE.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(HTML_FILE, BACKUP_FILE)

    # 提取旧 CARDS（第 450 行是 const CARDS = [，第 1237 行是 ];）
    start_idx = 449   # 0-based，对应第 450 行
    end_idx = 1236    # 0-based，对应第 1237 行，即 "}];"
    old_cards_text = "".join(lines[start_idx + 1:end_idx])
    old_cards = json.loads("[" + old_cards_text + "]")

    # 追加新卡片
    combined = old_cards + new_cards()

    # 序列化：json.dumps 已包含外层 []，所以不要再额外包一层
    serialized = json.dumps(combined, ensure_ascii=False, indent=2)
    new_block = ["const CARDS = "] + [ln + "\n" for ln in serialized.splitlines()] + [";\n"]

    # 替换
    new_lines = lines[:start_idx] + new_block + lines[end_idx + 1:]
    HTML_FILE.write_text("".join(new_lines), encoding="utf-8")

    print(f"已备份 {BACKUP_FILE}")
    print(f"已更新 {HTML_FILE}")
    print(f"卡片总数：{len(combined)}")


if __name__ == "__main__":
    main()
