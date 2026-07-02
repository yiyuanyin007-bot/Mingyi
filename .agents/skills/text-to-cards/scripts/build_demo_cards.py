#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建演示用卡片数据库（v0.2 · 按 DeepSeek battle 结论修正）

输入：5 张种子方剂卡
输出：
  - data/formula_cards.json   方剂卡（含 symptom_profile / lineage）
  - data/source_cards.json    原文条文卡
  - data/experience_cards.json 经验卡（含 efficacy 客观化记录）

v0.2 修正：
  - 症状从 core/secondary 改为 necessary/common/excluding
  - 删除静态 confusable_formulas
  - 增加 lineage 字段
  - 增加经验卡 efficacy 字段
"""

import json
import os
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)


def slugify(name: str) -> str:
    mapping = {
        "桂枝汤": "gui-zhi-tang",
        "麻黄汤": "ma-huang-tang",
        "葛根汤": "ge-gen-tang",
        "大承气汤": "da-cheng-qi-tang",
        "小柴胡汤": "xiao-chai-hu-tang",
        "桂枝加葛根汤": "gui-zhi-jia-ge-gen-tang",
        "桂枝加厚朴杏子汤": "gui-zhi-jia-houpo-xingzi-tang",
        "桂枝去芍药汤": "gui-zhi-qu-shaoyao-tang",
    }
    return mapping.get(name, re.sub(r"[^\w]", "-", name).lower())


SEED_CARDS = [
    {
        "formula_name": "桂枝汤",
        "role": "主方",
        "desc": "太阳中风主方",
        "tags": ["太阳病", "解表剂", "风伤卫", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，头痛，发热，汗出，恶风，桂枝汤主之。",
        "symptom_profile": {
            "necessary": ["汗出", "恶风"],
            "common": ["头痛", "发热", "脉浮缓"],
            "excluding": ["无汗", "脉浮紧"],
        },
        "pathology": "风邪袭表，营卫不和",
        "herbs": [
            {"name": "桂枝", "dosage": "三两"},
            {"name": "芍药", "dosage": "三两"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "大枣", "dosage": "十二枚"},
        ],
        "usage": "以水七升，微火煮取三升，去滓，适寒温，服一升",
        "contraindications": ["无汗", "脉浮紧（麻黄汤证）"],
        "known_variants": ["桂枝加葛根汤", "桂枝加厚朴杏子汤", "桂枝去芍药汤"],
        "reference_source": "伤寒论原文",
    },
    {
        "formula_name": "麻黄汤",
        "role": "主方",
        "desc": "太阳伤寒主方",
        "tags": ["太阳病", "解表剂", "寒伤营", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风，无汗而喘者，麻黄汤主之。",
        "symptom_profile": {
            "necessary": ["无汗", "喘"],
            "common": ["头痛发热", "身疼腰痛", "骨节疼痛", "恶风", "脉浮紧"],
            "excluding": ["汗出", "脉浮缓"],
        },
        "pathology": "寒邪束表，营卫闭塞，肺气不宣",
        "herbs": [
            {"name": "麻黄", "dosage": "三两"},
            {"name": "桂枝", "dosage": "二两"},
            {"name": "杏仁", "dosage": "七十枚"},
            {"name": "甘草", "dosage": "一两"},
        ],
        "usage": "以水九升，先煮麻黄减二升，去上沫，内诸药，煮取二升半，去滓，温服八合",
        "contraindications": ["汗出", "脉浮缓（桂枝汤证）"],
        "known_variants": [],
        "reference_source": "伤寒论原文",
    },
    {
        "formula_name": "葛根汤",
        "role": "主方",
        "desc": "太阳阳明合病",
        "tags": ["太阳病", "太阳阳明合病", "项背强痛", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，项背强几几，无汗恶风，葛根汤主之。",
        "symptom_profile": {
            "necessary": ["项背强痛", "无汗", "恶风"],
            "common": ["头痛", "发热"],
            "excluding": ["汗出"],
        },
        "pathology": "太阳阳明合病，津液不升，经脉失养",
        "herbs": [
            {"name": "葛根", "dosage": "四两"},
            {"name": "麻黄", "dosage": "三两"},
            {"name": "桂枝", "dosage": "二两"},
            {"name": "芍药", "dosage": "二两"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "大枣", "dosage": "十二枚"},
            {"name": "甘草", "dosage": "二两"},
        ],
        "usage": "以水一斗，先煮麻黄、葛根减二升，去白沫，内诸药，煮取三升，去滓，温服一升",
        "contraindications": ["汗出（用桂枝加葛根汤）"],
        "known_variants": [],
        "reference_source": "伤寒论原文",
    },
    {
        "formula_name": "大承气汤",
        "role": "主方",
        "desc": "阳明腑实重证",
        "tags": ["阳明病", "攻下剂", "重证", "阳明病篇"],
        "source_chapter": "阳明病篇",
        "source_text": "阳明病，谵语，潮热，大便硬，大承气汤主之。",
        "symptom_profile": {
            "necessary": ["大便硬", "潮热"],
            "common": ["谵语", "绕脐痛", "手足濈然汗出"],
            "excluding": ["表证未解", "津液内竭之便秘"],
        },
        "pathology": "阳明腑实，燥屎内结，热结肠腑",
        "herbs": [
            {"name": "大黄", "dosage": "四两"},
            {"name": "厚朴", "dosage": "半斤"},
            {"name": "枳实", "dosage": "五枚"},
            {"name": "芒硝", "dosage": "三合"},
        ],
        "usage": "以水一斗，先煮二物取五升，去滓，内大黄煮取二升，去滓，内芒硝，更上微火一两沸，分温再服。得下，余勿服。",
        "contraindications": ["表证未解", "津液内竭之便秘"],
        "known_variants": [],
        "reference_source": "伤寒论原文",
    },
    {
        "formula_name": "小柴胡汤",
        "role": "主方",
        "desc": "少阳病主方",
        "tags": ["少阳病", "和解剂", "枢机之剂", "少阳病篇"],
        "source_chapter": "少阳病篇",
        "source_text": "伤寒五六日，中风，往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕，小柴胡汤主之。",
        "symptom_profile": {
            "necessary": ["往来寒热", "胸胁苦满"],
            "common": ["默默不欲饮食", "心烦喜呕"],
            "excluding": ["纯少阳证见阳明里实"],
        },
        "pathology": "少阳枢机不利，正邪分争",
        "herbs": [
            {"name": "柴胡", "dosage": "半斤"},
            {"name": "黄芩", "dosage": "三两"},
            {"name": "人参", "dosage": "三两"},
            {"name": "半夏", "dosage": "半升"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "大枣", "dosage": "十二枚"},
            {"name": "甘草", "dosage": "三两"},
        ],
        "usage": "以水一斗二升，煮取六升，去滓，再煎取三升，温服一升，日三服",
        "contraindications": ["纯少阳证见阳明里实（需合方）"],
        "known_variants": [],
        "reference_source": "伤寒论原文",
    },
]


def create_empty_mastery():
    vectors = {
        "0→1": "方名→症状",
        "1→0": "症状→方名",
        "0→2": "方名→药物",
        "2→0": "药物→方名",
        "0→usage": "方名→煎服法",
        "0→contra": "方名→禁忌",
    }
    return {
        vid: {
            "label": label,
            "level": 0,
            "status": "未知",
            "last_result": None,
            "last_review": None,
            "streak_right": 0,
            "streak_wrong": 0,
            "total_rights": 0,
            "total_wrongs": 0,
            "history": [],
        }
        for vid, label in vectors.items()
    }


def build_formula_cards():
    formula_cards = []
    source_text_map = {}
    for seed in SEED_CARDS:
        formula_id = slugify(seed["formula_name"])
        source_text_map[formula_id] = seed["source_text"]

        card = {
            "id": formula_id,
            "type": "formula_card",
            "name": seed["formula_name"],
            "formula_name": seed["formula_name"],
            "role": seed["role"],
            "desc": seed["desc"],
            "tags": seed["tags"],
            "source_chapter": seed["source_chapter"],
            "source_text_ids": [formula_id + "-src-001"],
            "lineage": {
                "base_formula": seed["formula_name"],
                "variant_path": [],
                "reference_source": seed["reference_source"],
            },
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "data": {
                "source_text": seed["source_text"],
                "canonical": {
                    "symptom_profile": seed["symptom_profile"],
                    "pathology": seed["pathology"],
                    "herbs": seed["herbs"],
                    "usage": seed["usage"],
                    "contraindications": seed["contraindications"],
                },
                "empirical_distribution": {
                    "symptom_frequency": {},
                    "note": "MVP 阶段为空，后续由临床数据填充",
                },
                "variants": [slugify(v) for v in seed["known_variants"]],
                "allow_multiple": False,
                "mapping_note": "",
            },
            "experience_ids": [],
            "mastery": create_empty_mastery(),
        }
        formula_cards.append(card)

    return formula_cards


def build_source_cards(formula_cards, source_text_map):
    source_cards = []
    for card in formula_cards:
        source_id = card["id"] + "-src-001"
        text = source_text_map.get(card["id"], "")
        # 把 canonical 的必要+常见症状作为 mentioned symptoms
        profile = card["data"]["canonical"]["symptom_profile"]
        mentioned = profile["necessary"] + profile["common"]

        source_cards.append({
            "id": source_id,
            "type": "source_card",
            "source": "伤寒论",
            "chapter": card["source_chapter"],
            "article_number": "待补充",
            "text": text,
            "mentioned_formulas": [card["formula_name"]],
            "symptoms": mentioned,
            "key_conclusion": card["formula_name"] + "主之。",
        })
    return source_cards


def build_experience_cards(formula_cards):
    """生成一张示例经验卡，展示 efficacy 字段结构"""
    experiences = []
    gui = next((c for c in formula_cards if c["id"] == "gui-zhi-tang"), None)
    if gui:
        experiences.append({
            "id": "gui-zhi-tang_exp-001",
            "type": "experience_card",
            "parent_formula_id": "gui-zhi-tang",
            "source_text_id": "gui-zhi-tang-src-001",
            "title": "桂枝汤治汗出恶风一例",
            "source": "个人医案",
            "source_type": "个人医案",
            "topic": "临床应用",
            "content": "患者表现为汗出、恶风、脉浮缓，予桂枝汤原方。服后汗出减少，恶风减轻。",
            "lineage": {
                "base_formula": "桂枝汤",
                "variant_path": [],
                "reference_source": "个人临床",
            },
            "efficacy": {
                "subjective_effective": True,
                "objective_change": ["汗出减少", "恶风减轻"],
                "confidence_level": "中",
            },
            "unlock_level": 1,
            "tags": ["桂枝汤", "汗出", "恶风"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        })
    return experiences


def main():
    formula_cards = build_formula_cards()
    source_text_map = {c["id"]: c["data"]["source_text"] for c in formula_cards}
    source_cards = build_source_cards(formula_cards, source_text_map)
    experience_cards = build_experience_cards(formula_cards)

    # 把经验卡关联到方剂卡
    for exp in experience_cards:
        parent = next((c for c in formula_cards if c["id"] == exp["parent_formula_id"]), None)
        if parent:
            parent["experience_ids"].append(exp["id"])

    with open(os.path.join(DATA_DIR, "formula_cards.json"), "w", encoding="utf-8") as f:
        json.dump(formula_cards, f, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA_DIR, "source_cards.json"), "w", encoding="utf-8") as f:
        json.dump(source_cards, f, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA_DIR, "experience_cards.json"), "w", encoding="utf-8") as f:
        json.dump(experience_cards, f, ensure_ascii=False, indent=2)

    print(f"已生成 {len(formula_cards)} 张方剂卡")
    print(f"已生成 {len(source_cards)} 张条文卡")
    print(f"已生成 {len(experience_cards)} 张经验卡")


if __name__ == "__main__":
    main()
