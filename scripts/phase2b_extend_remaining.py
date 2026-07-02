#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 2b：补充剩余 10 张太阳病类方核心目标方。
- 新增：柴胡加芒硝汤、栀子甘草豉汤、栀子生姜豉汤、栀子厚朴汤、栀子干姜汤、
       干姜附子汤、茯苓四逆汤、桃核承气汤、抵当汤、白虎加人参汤。
- 麻杏甘石汤 与 麻黄杏仁甘草石膏汤 为同一方剂，仅作别名标记，不再新建卡片。
- 同步更新 data/formula_cards.json、data/source_cards.json、data/sun_target_formulas.json。
"""
from __future__ import annotations

import json
import pathlib
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
FORMULA_CARDS = DATA_DIR / "formula_cards.json"
SOURCE_CARDS = DATA_DIR / "source_cards.json"
TARGET_FILE = DATA_DIR / "sun_target_formulas.json"

# 别名映射：target 中的名字 -> 已存在卡片的 formula_name
ALIAS_MAP = {
    "麻杏甘石汤": "麻黄杏仁甘草石膏汤",
}

EXTRA_FORMULAS: list[dict] = [
    {
        "id": "chai-hu-jia-mang-xiao-tang",
        "name": "柴胡加芒硝汤",
        "formula_name": "柴胡加芒硝汤",
        "desc": "少阳兼阳明里实，和解泻热",
        "tags": ["少阳病", "少阳阳明合病", "和解泻热", "少阳病篇"],
        "source_chapter": "少阳病篇",
        "source_text": "伤寒十三日，不解，胸胁满而呕，日晡所发潮热，已而微利。此本柴胡证，下之以不得利，今反利者，知医以丸药下之，此非其治也。潮热者，实也。先宜服小柴胡汤以解外，后以柴胡加芒硝汤主之。",
        "necessary": ["胸胁满而呕", "日晡所发潮热", "已而微利"],
        "common": ["寒热往来", "心烦", "口苦", "腹满拒按", "大便微利"],
        "excluding": ["纯少阳证无里实", "阳明腑实燥结甚", "虚寒"],
        "pathology": "少阳枢机不利，兼阳明里实，误下后邪热内结",
        "herbs": [
            {"name": "柴胡", "dosage": "二两十六铢"},
            {"name": "黄芩", "dosage": "一两"},
            {"name": "人参", "dosage": "一两"},
            {"name": "甘草", "dosage": "一两（炙）"},
            {"name": "生姜", "dosage": "一两（切）"},
            {"name": "半夏", "dosage": "二十铢（洗）"},
            {"name": "大枣", "dosage": "四枚（擘）"},
            {"name": "芒硝", "dosage": "二两"},
        ],
        "usage": "上八味，以水四升，煮取二升，去滓，内芒硝，更煮微沸，分温再服，不解更作。",
        "contraindications": ["脾胃虚寒", "孕妇", "少阳纯证无里实", "芒硝泻下过度"],
    },
    {
        "id": "zhi-zi-gan-cao-chi-tang",
        "name": "栀子甘草豉汤",
        "formula_name": "栀子甘草豉汤",
        "desc": "虚烦少气，清热除烦益气",
        "tags": ["太阳病变证", "虚烦", "少气", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "发汗吐下后，虚烦不得眠，若剧者，必反复颠倒，心中懊憹，栀子豉汤主之；若少气者，栀子甘草豉汤主之。",
        "necessary": ["发汗吐下后", "虚烦不得眠", "少气"],
        "common": ["心中懊憹", "反复颠倒", "胸中窒", "口干"],
        "excluding": ["实热烦躁", "痰湿内扰", "阳明腑实", "无热象"],
        "pathology": "热扰胸膈，兼有气虚，气机不畅",
        "herbs": [
            {"name": "栀子", "dosage": "十四枚（擘）"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "香豉", "dosage": "四合（绵裹）"},
        ],
        "usage": "上三味，以水四升，先煮栀子取二升半，内甘草、香豉，煮取一升半，去滓，分二服，温进一服。得吐者，止后服。",
        "contraindications": ["脾胃虚寒", "大便溏泄", "无热象者"],
    },
    {
        "id": "zhi-zi-sheng-jiang-chi-tang",
        "name": "栀子生姜豉汤",
        "formula_name": "栀子生姜豉汤",
        "desc": "虚烦兼呕，清热和胃止呕",
        "tags": ["太阳病变证", "虚烦", "呕吐", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "发汗吐下后，虚烦不得眠，若剧者，必反复颠倒，心中懊憹，栀子豉汤主之；若呕者，栀子生姜豉汤主之。",
        "necessary": ["发汗吐下后", "虚烦不得眠", "呕"],
        "common": ["心中懊憹", "反复颠倒", "胸中窒", "胃脘不和"],
        "excluding": ["实热呕吐", "寒湿呕吐", "无热象"],
        "pathology": "热扰胸膈，胃气上逆",
        "herbs": [
            {"name": "栀子", "dosage": "十四枚（擘）"},
            {"name": "生姜", "dosage": "五两"},
            {"name": "香豉", "dosage": "四合（绵裹）"},
        ],
        "usage": "上三味，以水四升，先煮栀子、生姜取二升半，内豉，煮取一升半，去滓，分二服，温进一服。得吐者，止后服。",
        "contraindications": ["脾胃虚寒", "胃阴不足", "无热象者"],
    },
    {
        "id": "zhi-zi-hou-po-tang",
        "name": "栀子厚朴汤",
        "formula_name": "栀子厚朴汤",
        "desc": "心烦腹满，清宣郁热行气",
        "tags": ["太阳病变证", "心烦", "腹满", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "伤寒下后，心烦腹满，卧起不安者，栀子厚朴汤主之。",
        "necessary": ["心烦", "腹满", "卧起不安"],
        "common": ["下后余热", "胸闷", "按之软", "苔黄"],
        "excluding": ["阳明腑实燥结", "虚寒腹胀", "痰湿壅滞"],
        "pathology": "下后余热留扰胸膈与腹，气机壅滞",
        "herbs": [
            {"name": "栀子", "dosage": "十四枚（擘）"},
            {"name": "厚朴", "dosage": "四两（炙，去皮）"},
            {"name": "枳实", "dosage": "四枚（水浸，炙令黄）"},
        ],
        "usage": "上三味，以水三升半，煮取一升半，去滓，分二服，温进一服。得吐者，止后服。",
        "contraindications": ["脾胃虚寒", "大便溏泄", "阳明腑实"],
    },
    {
        "id": "zhi-zi-gan-jiang-tang",
        "name": "栀子干姜汤",
        "formula_name": "栀子干姜汤",
        "desc": "上焦余热，中焦虚寒，寒热并用",
        "tags": ["太阳病变证", "寒热错杂", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "伤寒，医以丸药大下之，身热不去，微烦者，栀子干姜汤主之。",
        "necessary": ["身热不去", "微烦", "丸药大下后"],
        "common": ["下后脾胃虚寒", "心下痞", "腹痛", "便溏"],
        "excluding": ["阳明大热", "实热烦躁", "阴虚火旺"],
        "pathology": "上焦余热未清，中焦脾胃虚寒，寒热错杂",
        "herbs": [
            {"name": "栀子", "dosage": "十四枚（擘）"},
            {"name": "干姜", "dosage": "二两"},
        ],
        "usage": "上二味，以水三升半，煮取一升半，去滓，分二服，温进一服。得吐者，止后服。",
        "contraindications": ["纯实热证", "阴虚火旺", "无脾胃虚寒者"],
    },
    {
        "id": "gan-jiang-fu-zi-tang",
        "name": "干姜附子汤",
        "formula_name": "干姜附子汤",
        "desc": "阳气暴虚，阴寒内盛，急救回阳",
        "tags": ["太阳病", "阳虚", "急救回阳", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "下之后，复发汗，昼日烦躁不得眠，夜而安静，不呕不渴，无表证，脉沉微，身无大热者，干姜附子汤主之。",
        "necessary": ["昼日烦躁不得眠", "夜而安静", "脉沉微", "身无大热"],
        "common": ["下后复发汗", "不呕不渴", "无表证", "四肢厥冷"],
        "excluding": ["热厥", "阳明热盛", "少阳证", "表证未解"],
        "pathology": "阳气暴虚，阴寒内盛，虚阳与阴争",
        "herbs": [
            {"name": "干姜", "dosage": "一两"},
            {"name": "附子", "dosage": "一枚（生用，去皮，切八片）"},
        ],
        "usage": "上二味，以水三升，煮取一升，去滓顿服。",
        "contraindications": ["热厥", "真热假寒", "阴虚火旺", "孕妇"],
    },
    {
        "id": "fu-ling-si-ni-tang",
        "name": "茯苓四逆汤",
        "formula_name": "茯苓四逆汤",
        "desc": "回阳益阴，宁心安神",
        "tags": ["少阴病", "阴阳两虚", "烦躁", "少阴病篇"],
        "source_chapter": "少阴病篇",
        "source_text": "发汗，若下之，病仍不解，烦躁者，茯苓四逆汤主之。",
        "necessary": ["发汗或下后", "病仍不解", "烦躁"],
        "common": ["四肢厥逆", "恶寒", "脉微细", "心悸"],
        "excluding": ["实热烦躁", "阴虚火旺", "痰热扰心"],
        "pathology": "阴阳两虚，阳虚为主，水饮内停，心神不宁",
        "herbs": [
            {"name": "茯苓", "dosage": "四两"},
            {"name": "人参", "dosage": "一两"},
            {"name": "附子", "dosage": "一枚（生用，去皮，破八片）"},
            {"name": "甘草", "dosage": "二两（炙）"},
            {"name": "干姜", "dosage": "一两半"},
        ],
        "usage": "上五味，以水五升，煮取三升，去滓，温服七合，日三服。",
        "contraindications": ["实热证", "阴虚火旺", "津液大伤而无阳虚"],
    },
    {
        "id": "tao-he-cheng-qi-tang",
        "name": "桃核承气汤",
        "formula_name": "桃核承气汤",
        "desc": "下焦蓄血，逐瘀泻热",
        "tags": ["太阳病", "蓄血证", "逐瘀泻热", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病不解，热结膀胱，其人如狂，血自下，下者愈。其外不解者，尚未可攻，当先解其外；外解已，但少腹急结者，乃可攻之，宜桃核承气汤。",
        "necessary": ["少腹急结", "其人如狂", "小便自利", "热结膀胱"],
        "common": ["烦躁谵语", "至夜发热", "经血紫黑", "大便不通"],
        "excluding": ["小便不利", "血虚无瘀", "孕妇", "表证未解"],
        "pathology": "瘀热互结下焦，血蓄膀胱",
        "herbs": [
            {"name": "桃仁", "dosage": "五十个（去皮尖）"},
            {"name": "大黄", "dosage": "四两"},
            {"name": "桂枝", "dosage": "二两（去皮）"},
            {"name": "甘草", "dosage": "二两（炙）"},
            {"name": "芒硝", "dosage": "二两"},
        ],
        "usage": "上五味，以水七升，煮取二升半，去滓，内芒硝，更上火，微沸下火，先食温服五合，日三服，当微利。",
        "contraindications": ["表证未解", "孕妇", "血虚无瘀", "脾胃虚弱"],
    },
    {
        "id": "di-dang-tang",
        "name": "抵当汤",
        "formula_name": "抵当汤",
        "desc": "下焦蓄血重证，破血逐瘀",
        "tags": ["太阳病", "蓄血重证", "破血逐瘀", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，六七日，表证仍在，脉微而沉，反不结胸，其人发狂者，以热在下焦，少腹当硬满，小便自利者，下血乃愈。所以然者，以太阳随经，瘀热在里故也，抵当汤主之。",
        "necessary": ["少腹硬满", "其人发狂", "小便自利", "脉微而沉"],
        "common": ["身黄", "善忘", "大便色黑易解", "少腹拒按"],
        "excluding": ["小便不利", "血虚体弱", "孕妇", "出血倾向"],
        "pathology": "瘀热互结下焦血分，蓄血重证",
        "herbs": [
            {"name": "水蛭", "dosage": "三十个（熬）"},
            {"name": "虻虫", "dosage": "三十个（去翅足，熬）"},
            {"name": "桃仁", "dosage": "二十个（去皮尖）"},
            {"name": "大黄", "dosage": "三两（酒洗）"},
        ],
        "usage": "上四味，以水五升，煮取三升，去滓，温服一升。不下更服。",
        "contraindications": ["孕妇", "血虚体弱", "出血倾向", "脾胃虚寒", "表证未解"],
    },
    {
        "id": "bai-hu-jia-ren-shen-tang",
        "name": "白虎加人参汤",
        "formula_name": "白虎加人参汤",
        "desc": "阳明气分热盛，气津两伤",
        "tags": ["阳明病", "气津两伤", "大汗大渴", "阳明病篇"],
        "source_chapter": "阳明病篇",
        "source_text": "服桂枝汤，大汗出后，大烦渴不解，脉洪大者，白虎加人参汤主之。",
        "necessary": ["大汗出", "大烦渴不解", "脉洪大"],
        "common": ["身大热", "口舌干燥", "时时恶风", "欲饮水数升", "背微恶寒"],
        "excluding": ["表证未解", "无大热", "脉浮紧", "阳虚发热", "真寒假热"],
        "pathology": "阳明气分热盛，气津两伤",
        "herbs": [
            {"name": "石膏", "dosage": "一斤（碎）"},
            {"name": "知母", "dosage": "六两"},
            {"name": "甘草", "dosage": "二两（炙）"},
            {"name": "粳米", "dosage": "六合"},
            {"name": "人参", "dosage": "三两"},
        ],
        "usage": "上五味，以水一斗，煮米熟汤成，去滓，温服一升，日三服。",
        "contraindications": ["表证未解", "阳虚发热", "真寒假热", "脾胃虚寒", "湿温身热不扬"],
    },
]


def make_mastery() -> dict:
    return {
        "0→1": {"label": "方名→症状", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
        "1→0": {"label": "症状→方名", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→2": {"label": "方名→药物", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
        "2→0": {"label": "药物→方名", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→usage": {"label": "方名→煎服法", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                   "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
        "0→contra": {"label": "方名→禁忌", "level": 0, "status": "未知", "last_result": None, "last_review": None,
                    "streak_right": 0, "streak_wrong": 0, "total_rights": 0, "total_wrongs": 0, "history": []},
    }


def card_from_spec(spec: dict, now: str) -> dict:
    return {
        "id": spec["id"],
        "type": "formula_card",
        "name": spec["name"],
        "formula_name": spec["formula_name"],
        "role": "主方",
        "desc": spec["desc"],
        "tags": spec["tags"],
        "source_chapter": spec["source_chapter"],
        "source_text_ids": [f"{spec['id']}-src-001"],
        "lineage": {"base_formula": spec["formula_name"], "variant_path": [], "reference_source": "伤寒论原文"},
        "created_at": now,
        "updated_at": now,
        "data": {
            "source_text": spec["source_text"],
            "canonical": {
                "symptom_profile": {
                    "necessary": spec["necessary"],
                    "common": spec["common"],
                    "excluding": spec["excluding"],
                },
                "pathology": spec["pathology"],
                "herbs": spec["herbs"],
                "usage": spec["usage"],
                "contraindications": spec["contraindications"],
            },
            "empirical_distribution": {"symptom_frequency": {}, "note": "MVP 阶段为空，后续由临床数据填充"},
            "variants": [],
            "allow_multiple": False,
            "mapping_note": "",
        },
        "experience_ids": [],
        "mastery": make_mastery(),
    }


def source_card_from_spec(spec: dict) -> dict:
    return {
        "id": f"{spec['id']}-src-001",
        "type": "source_card",
        "source": "伤寒论",
        "chapter": spec["source_chapter"],
        "article_number": "待补充",
        "text": spec["source_text"],
        "mentioned_formulas": [spec["formula_name"]],
        "symptoms": spec["necessary"] + spec["common"],
        "key_conclusion": f"{spec['formula_name']}主之。",
    }


def main() -> None:
    now = datetime.now(timezone.utc).isoformat()

    formula_cards: list[dict] = json.loads(FORMULA_CARDS.read_text(encoding="utf-8"))
    source_cards: list[dict] = json.loads(SOURCE_CARDS.read_text(encoding="utf-8"))

    existing_ids = {c["id"] for c in formula_cards}
    existing_src_ids = {s["id"] for s in source_cards}
    existing_names = {c["formula_name"] for c in formula_cards}

    added = 0
    for spec in EXTRA_FORMULAS:
        if spec["id"] in existing_ids or spec["formula_name"] in existing_names:
            print(f"跳过已存在：{spec['formula_name']}")
            continue
        formula_cards.append(card_from_spec(spec, now))
        source_cards.append(source_card_from_spec(spec))
        existing_ids.add(spec["id"])
        existing_src_ids.add(f"{spec['id']}-src-001")
        existing_names.add(spec["formula_name"])
        added += 1

    FORMULA_CARDS.write_text(json.dumps(formula_cards, ensure_ascii=False, indent=2), encoding="utf-8")
    SOURCE_CARDS.write_text(json.dumps(source_cards, ensure_ascii=False, indent=2), encoding="utf-8")

    # 更新目标清单（含别名处理）
    target_list: list[dict] = json.loads(TARGET_FILE.read_text(encoding="utf-8"))
    present = {c["formula_name"] for c in formula_cards}
    for item in target_list:
        name = item["name"]
        if name in present:
            item["in_cards"] = True
            item["priority"] = "高"
        elif name in ALIAS_MAP and ALIAS_MAP[name] in present:
            item["in_cards"] = True
            item["priority"] = "高"
        else:
            item["in_cards"] = False
            item["priority"] = "待补充"
    TARGET_FILE.write_text(json.dumps(target_list, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"新增 formula_card：{added} 张")
    print(f"当前 formula_cards：{len(formula_cards)} 张")
    print(f"当前 source_cards：{len(source_cards)} 张")
    print(f"目标方覆盖率：{sum(1 for x in target_list if x['in_cards'])}/{len(target_list)}")


if __name__ == "__main__":
    main()
