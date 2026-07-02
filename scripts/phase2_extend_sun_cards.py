#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Phase 2：把太阳病类方卡片从 5 张扩展到 25 张。
- 复用 app/shanghanlun-v8-mvp.html 中已有的 5 张卡片。
- 新增 15 张手工审校的核心太阳病类方。
- 同步更新 data/formula_cards.json 与 data/source_cards.json。
- 生成 data/sun_target_formulas.json 作为目标清单。
"""
from __future__ import annotations

import json
import pathlib
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
MVP_FILE = ROOT / "app" / "shanghanlun-v8-mvp.html"
FORMULA_CARDS = DATA_DIR / "formula_cards.json"
SOURCE_CARDS = DATA_DIR / "source_cards.json"
TARGET_FILE = DATA_DIR / "sun_target_formulas.json"

TARGET_FORMULAS = [
    "桂枝汤", "麻黄汤", "葛根汤", "大青龙汤", "小青龙汤",
    "桂枝加葛根汤", "桂枝加厚朴杏子汤", "桂枝去芍药汤", "桂枝加附子汤",
    "桂枝麻黄各半汤", "桂枝二越婢一汤", "麻黄杏仁甘草石膏汤", "麻杏甘石汤",
    "葛根加半夏汤", "葛根黄芩黄连汤", "小柴胡汤", "大柴胡汤",
    "柴胡加芒硝汤", "柴胡加龙骨牡蛎汤", "栀子豉汤", "栀子甘草豉汤",
    "栀子生姜豉汤", "栀子厚朴汤", "栀子干姜汤", "五苓散", "真武汤",
    "四逆汤", "干姜附子汤", "茯苓四逆汤", "桃核承气汤", "抵当汤",
    "小建中汤", "大承气汤", "调胃承气汤", "白虎加人参汤", "白虎汤",
]

EXTRA_FORMULAS: list[dict] = [
    {
        "id": "da-qing-long-tang",
        "name": "大青龙汤",
        "formula_name": "大青龙汤",
        "desc": "表寒里热，不汗出烦躁",
        "tags": ["太阳病", "解表清里", "烦躁", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳中风，脉浮紧，发热恶寒，身疼痛，不汗出而烦躁者，大青龙汤主之。",
        "necessary": ["不汗出", "烦躁", "身疼痛", "发热恶寒"],
        "common": ["脉浮紧", "恶风寒", "口渴"],
        "excluding": ["汗出", "脉微弱", "但热不寒"],
        "pathology": "风寒外束，阳气闭郁，里有郁热",
        "herbs": [
            {"name": "麻黄", "dosage": "六两"},
            {"name": "桂枝", "dosage": "二两"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "杏仁", "dosage": "四十枚"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "大枣", "dosage": "十枚"},
            {"name": "石膏", "dosage": "如鸡子大"},
        ],
        "usage": "以水九升，先煮麻黄减二升，去上沫，内诸药，煮取三升，去滓，温服一升，取微似汗。汗出多者，温粉粉之。",
        "contraindications": ["脉微弱、汗出恶风者不可服", "少阴证身重烦躁者禁用"],
    },
    {
        "id": "xiao-qing-long-tang",
        "name": "小青龙汤",
        "formula_name": "小青龙汤",
        "desc": "外寒内饮，咳喘主方",
        "tags": ["太阳病", "解表化饮", "咳喘", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "伤寒表不解，心下有水气，干呕发热而咳，或渴，或利，或噎，或小便不利、少腹满，或喘者，小青龙汤主之。",
        "necessary": ["发热而咳", "心下有水气"],
        "common": ["干呕", "或渴", "或利", "或噎", "小便不利", "少腹满", "喘"],
        "excluding": ["汗出恶风", "热盛口渴", "痰黄黏稠"],
        "pathology": "风寒束表，水饮内停，水寒射肺",
        "herbs": [
            {"name": "麻黄", "dosage": "三两"},
            {"name": "芍药", "dosage": "三两"},
            {"name": "细辛", "dosage": "三两"},
            {"name": "干姜", "dosage": "三两"},
            {"name": "甘草", "dosage": "三两"},
            {"name": "桂枝", "dosage": "三两"},
            {"name": "半夏", "dosage": "半升"},
            {"name": "五味子", "dosage": "半升"},
        ],
        "usage": "以水一斗，先煮麻黄减二升，去上沫，内诸药，煮取三升，去滓，温服一升。",
        "contraindications": ["阴虚火旺", "痰热咳喘", "汗出表虚"],
    },
    {
        "id": "gui-zhi-jia-fu-zi-tang",
        "name": "桂枝加附子汤",
        "formula_name": "桂枝加附子汤",
        "desc": "表虚漏汗，卫阳不固",
        "tags": ["太阳病", "固阳解表", "漏汗", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，发汗，遂漏不止，其人恶风，小便难，四肢微急，难以屈伸者，桂枝加附子汤主之。",
        "necessary": ["发汗漏不止", "恶风"],
        "common": ["小便难", "四肢微急", "难以屈伸"],
        "excluding": ["高热汗出", "阳明热盛", "阴虚火旺"],
        "pathology": "卫阳虚弱，腠理不固，津液外泄",
        "herbs": [
            {"name": "桂枝", "dosage": "三两"},
            {"name": "芍药", "dosage": "三两"},
            {"name": "甘草", "dosage": "三两"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "大枣", "dosage": "十二枚"},
            {"name": "附子", "dosage": "一枚"},
        ],
        "usage": "以水七升，煮取三升，去滓，温服一升。",
        "contraindications": ["阳明实热", "阴虚火旺", "汗出而热不退"],
    },
    {
        "id": "gui-zhi-ma-huang-ge-ban-tang",
        "name": "桂枝麻黄各半汤",
        "formula_name": "桂枝麻黄各半汤",
        "desc": "表郁轻证，寒热如疟",
        "tags": ["太阳病", "小汗方", "表郁", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，得之八九日，如疟状，发热恶寒，热多寒少，其人不呕，清便欲自可，一日二三度发，身必痒，宜桂枝麻黄各半汤。",
        "necessary": ["发热恶寒如疟", "热多寒少", "身痒"],
        "common": ["一日二三度发", "面色有热色", "无汗或少汗"],
        "excluding": ["呕", "下利", "脉微弱", "大汗出"],
        "pathology": "表郁日久，小邪不解，营卫不畅",
        "herbs": [
            {"name": "桂枝", "dosage": "一两十六铢"},
            {"name": "芍药", "dosage": "一两"},
            {"name": "生姜", "dosage": "一两"},
            {"name": "甘草", "dosage": "一两"},
            {"name": "麻黄", "dosage": "一两"},
            {"name": "大枣", "dosage": "四枚"},
            {"name": "杏仁", "dosage": "二十四枚"},
        ],
        "usage": "以水五升，先煮麻黄一二沸，去上沫，内诸药，煮取一升八合，去滓，分温再服。",
        "contraindications": ["大汗出", "里热盛", "阴阳俱虚"],
    },
    {
        "id": "gui-zhi-er-yue-bi-yi-tang",
        "name": "桂枝二越婢一汤",
        "formula_name": "桂枝二越婢一汤",
        "desc": "表郁化热，轻证解肌清里",
        "tags": ["太阳病", "小汗方", "表郁化热", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，发热恶寒，热多寒少，脉微弱者，此无阳也，不可发汗，宜桂枝二越婢一汤。",
        "necessary": ["发热恶寒", "热多寒少"],
        "common": ["脉微弱", "微烦渴", "无汗或少汗"],
        "excluding": ["但热不寒", "大汗出", "脉浮紧无汗"],
        "pathology": "表邪郁遏，已有化热之势，正虚邪轻",
        "herbs": [
            {"name": "桂枝", "dosage": "十八铢"},
            {"name": "芍药", "dosage": "十八铢"},
            {"name": "麻黄", "dosage": "十八铢"},
            {"name": "甘草", "dosage": "十八铢"},
            {"name": "大枣", "dosage": "四枚"},
            {"name": "生姜", "dosage": "一两二铢"},
            {"name": "石膏", "dosage": "二十四铢"},
        ],
        "usage": "以水五升，煮麻黄一二沸，去上沫，内诸药，煮取二升，去滓，温服一升。",
        "contraindications": ["脉微弱无阳者慎用", "大汗出", "阳明大热"],
    },
    {
        "id": "ge-gen-jia-ban-xia-tang",
        "name": "葛根加半夏汤",
        "formula_name": "葛根加半夏汤",
        "desc": "二阳合病，不下利但呕",
        "tags": ["太阳病", "太阳阳明合病", "呕吐", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳与阳明合病，不下利但呕者，葛根加半夏汤主之。",
        "necessary": ["不下利", "但呕"],
        "common": ["发热恶寒", "无汗", "项背强痛"],
        "excluding": ["下利", "汗出恶风", "阳明里实"],
        "pathology": "二阳合病，表邪内迫阳明胃，胃气上逆",
        "herbs": [
            {"name": "葛根", "dosage": "四两"},
            {"name": "麻黄", "dosage": "三两"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "芍药", "dosage": "二两"},
            {"name": "桂枝", "dosage": "二两"},
            {"name": "生姜", "dosage": "二两"},
            {"name": "半夏", "dosage": "半升"},
            {"name": "大枣", "dosage": "十二枚"},
        ],
        "usage": "以水一斗，先煮麻黄、葛根减二升，去白沫，内诸药，煮取三升，去滓，温服一升。",
        "contraindications": ["胃阴不足", "津液亏虚", "汗出表虚"],
    },
    {
        "id": "ge-gen-huang-qin-huang-lian-tang",
        "name": "葛根黄芩黄连汤",
        "formula_name": "葛根黄芩黄连汤",
        "desc": "表邪内陷，里热下利",
        "tags": ["太阳病", "协热利", "里热下利", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，桂枝证，医反下之，利遂不止，脉促者，表未解也；喘而汗出者，葛根黄芩黄连汤主之。",
        "necessary": ["下利不止", "喘而汗出", "脉促"],
        "common": ["发热", "口渴", "肛门灼热", "利下臭秽"],
        "excluding": ["虚寒下利", "手足厥冷", "脉微细"],
        "pathology": "表邪内陷，阳明肠热，升降失常",
        "herbs": [
            {"name": "葛根", "dosage": "半斤"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "黄芩", "dosage": "三两"},
            {"name": "黄连", "dosage": "三两"},
        ],
        "usage": "以水八升，先煮葛根减二升，内诸药，煮取二升，去滓，分温再服。",
        "contraindications": ["脾胃虚寒", "寒湿下利", "阳虚滑脱"],
    },
    {
        "id": "wu-ling-san",
        "name": "五苓散",
        "formula_name": "五苓散",
        "desc": "太阳蓄水，化气利水",
        "tags": ["太阳病", "蓄水证", "水逆", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "太阳病，发汗后，若脉浮，小便不利，微热消渴者，五苓散主之。",
        "necessary": ["小便不利", "消渴", "脉浮", "微热"],
        "common": ["烦渴", "水入则吐", "头痛发热"],
        "excluding": ["阳明大热烦渴", "小便自利", "津液大伤"],
        "pathology": "膀胱蓄水，气化不利，津液不布",
        "herbs": [
            {"name": "猪苓", "dosage": "十八铢"},
            {"name": "泽泻", "dosage": "一两六铢"},
            {"name": "白术", "dosage": "十八铢"},
            {"name": "茯苓", "dosage": "十八铢"},
            {"name": "桂枝", "dosage": "半两"},
        ],
        "usage": "为散，以白饮和服方寸匕，日三服，多饮暖水，汗出愈。",
        "contraindications": ["津液大伤而无水饮", "阴虚火旺", "小便自利而渴"],
    },
    {
        "id": "zhen-wu-tang",
        "name": "真武汤",
        "formula_name": "真武汤",
        "desc": "少阴阳虚水泛",
        "tags": ["少阴病", "阳虚水泛", "太阳病变证", "少阴病篇"],
        "source_chapter": "少阴病篇",
        "source_text": "少阴病，二三日不已，至四五日，腹痛，小便不利，四肢沉重疼痛，自下利者，此为有水气。其人或咳，或小便利，或下利，或呕者，真武汤主之。",
        "necessary": ["腹痛", "小便不利", "四肢沉重疼痛", "自下利"],
        "common": ["或咳", "或呕", "畏寒肢冷", "水肿"],
        "excluding": ["实热壅滞", "小便短赤涩痛", "阳明燥结"],
        "pathology": "脾肾阳虚，水湿内停，水气泛滥",
        "herbs": [
            {"name": "茯苓", "dosage": "三两"},
            {"name": "芍药", "dosage": "三两"},
            {"name": "白术", "dosage": "二两"},
            {"name": "生姜", "dosage": "三两"},
            {"name": "附子", "dosage": "一枚"},
        ],
        "usage": "以水八升，煮取三升，去滓，温服七合，日三服。",
        "contraindications": ["阴虚火旺", "实热证", "津液亏虚"],
    },
    {
        "id": "si-ni-tang",
        "name": "四逆汤",
        "formula_name": "四逆汤",
        "desc": "回阳救逆第一方",
        "tags": ["少阴病", "回阳救逆", "阴寒", "少阴病篇"],
        "source_chapter": "少阴病篇",
        "source_text": "少阴病，脉沉者，急温之，宜四逆汤。",
        "necessary": ["脉沉", "四肢厥逆", "恶寒"],
        "common": ["下利清谷", "呕吐", "但欲寐", "身痛"],
        "excluding": ["热厥", "四肢厥冷而胸腹灼热", "口渴引饮"],
        "pathology": "少阴阳衰，阴寒内盛，阳气欲脱",
        "herbs": [
            {"name": "甘草", "dosage": "二两"},
            {"name": "干姜", "dosage": "一两半"},
            {"name": "附子", "dosage": "一枚"},
        ],
        "usage": "以水三升，煮取一升二合，去滓，分温再服。",
        "contraindications": ["热厥", "真热假寒", "阴虚火旺"],
    },
    {
        "id": "bai-hu-tang",
        "name": "白虎汤",
        "formula_name": "白虎汤",
        "desc": "阳明气分大热",
        "tags": ["阳明病", "清气分热", "大汗大渴", "阳明病篇"],
        "source_chapter": "阳明病篇",
        "source_text": "伤寒脉滑而厥者，里有热，白虎汤主之。",
        "necessary": ["身大热", "大汗出", "大烦渴", "脉洪大"],
        "common": ["面赤", "气粗", "恶热", "舌燥"],
        "excluding": ["表证未解", "无大热", "脉浮紧", "阳虚发热"],
        "pathology": "阳明气分热盛，津伤燥热",
        "herbs": [
            {"name": "石膏", "dosage": "一斤"},
            {"name": "知母", "dosage": "六两"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "粳米", "dosage": "六合"},
        ],
        "usage": "以水一斗，煮米熟汤成，去滓，温服一升，日三服。",
        "contraindications": ["表证未解", "阳虚发热", "真寒假热", "湿温身热不扬"],
    },
    {
        "id": "tiao-wei-cheng-qi-tang",
        "name": "调胃承气汤",
        "formula_name": "调胃承气汤",
        "desc": "和胃泄热，润燥软坚",
        "tags": ["阳明病", "攻下剂", "胃实初结", "阳明病篇"],
        "source_chapter": "阳明病篇",
        "source_text": "发汗后恶寒者，虚故也。不恶寒，但热者，实也，当和胃气，与调胃承气汤。",
        "necessary": ["不恶寒但热", "蒸蒸发热", "心烦"],
        "common": ["谵语", "口渴", "大便硬"],
        "excluding": ["恶寒", "表证未解", "虚寒", "孕妇"],
        "pathology": "阳明燥热初结，胃腑不和，腑实未甚",
        "herbs": [
            {"name": "大黄", "dosage": "四两"},
            {"name": "甘草", "dosage": "二两"},
            {"name": "芒硝", "dosage": "半升"},
        ],
        "usage": "以水三升，煮大黄、甘草取一升，去滓，内芒硝，更上火微煮令沸，少少温服之。",
        "contraindications": ["表证未解", "脾胃虚寒", "孕妇", "津亏肠燥无热"],
    },
    {
        "id": "da-chai-hu-tang",
        "name": "大柴胡汤",
        "formula_name": "大柴胡汤",
        "desc": "少阳阳明合病，和解攻里",
        "tags": ["少阳病", "少阳阳明合病", "和解攻里", "少阳病篇"],
        "source_chapter": "少阳病篇",
        "source_text": "呕不止，心下急，郁郁微烦者，为未解也，与大柴胡汤，下之则愈。",
        "necessary": ["呕不止", "心下急", "郁郁微烦", "往来寒热"],
        "common": ["胸胁苦满", "便秘或下利", "苔黄", "口苦"],
        "excluding": ["纯少阳证", "太阴虚寒", "阳明腑实燥结甚者"],
        "pathology": "少阳枢机不利，胆胃热实，兼阳明里实",
        "herbs": [
            {"name": "柴胡", "dosage": "半斤"},
            {"name": "黄芩", "dosage": "三两"},
            {"name": "芍药", "dosage": "三两"},
            {"name": "半夏", "dosage": "半升"},
            {"name": "生姜", "dosage": "五两"},
            {"name": "枳实", "dosage": "四枚"},
            {"name": "大枣", "dosage": "十二枚"},
            {"name": "大黄", "dosage": "二两"},
        ],
        "usage": "以水一斗二升，煮取六升，去滓再煎，温服一升，日三服。",
        "contraindications": ["脾胃虚寒", "少阳纯证无里实", "孕妇"],
    },
    {
        "id": "chai-hu-jia-long-gu-mu-li-tang",
        "name": "柴胡加龙骨牡蛎汤",
        "formula_name": "柴胡加龙骨牡蛎汤",
        "desc": "少阳不和，痰热烦惊",
        "tags": ["少阳病", "烦惊", "痰热", "少阳病篇"],
        "source_chapter": "少阳病篇",
        "source_text": "伤寒八九日，下之，胸满烦惊，小便不利，谵语，一身尽重，不可转侧者，柴胡加龙骨牡蛎汤主之。",
        "necessary": ["胸满烦惊", "小便不利", "谵语", "一身尽重"],
        "common": ["往来寒热", "惊悸", "失眠", "胸胁苦满"],
        "excluding": ["纯阳明腑实", "纯阴虚火旺", "太阴虚寒"],
        "pathology": "少阳不和，痰热内扰，心神不宁，三焦不利",
        "herbs": [
            {"name": "柴胡", "dosage": "四两"},
            {"name": "龙骨", "dosage": "一两半"},
            {"name": "黄芩", "dosage": "一两半"},
            {"name": "生姜", "dosage": "一两半"},
            {"name": "铅丹", "dosage": "一两半"},
            {"name": "人参", "dosage": "一两半"},
            {"name": "桂枝", "dosage": "一两半"},
            {"name": "茯苓", "dosage": "一两半"},
            {"name": "半夏", "dosage": "二合半"},
            {"name": "大黄", "dosage": "二两"},
            {"name": "牡蛎", "dosage": "一两半"},
            {"name": "大枣", "dosage": "六枚"},
        ],
        "usage": "以水八升，煮取四升，内大黄切如棋子，更煮一二沸，去滓，温服一升。",
        "contraindications": ["脾胃虚寒", "孕妇", "无痰热者慎用"],
    },
    {
        "id": "zhi-zi-chi-tang",
        "name": "栀子豉汤",
        "formula_name": "栀子豉汤",
        "desc": "清宣胸膈，除虚烦",
        "tags": ["太阳病变证", "虚烦", "胸膈热", "太阳病篇"],
        "source_chapter": "太阳病篇",
        "source_text": "发汗吐下后，虚烦不得眠，若剧者，必反复颠倒，心中懊憹，栀子豉汤主之。",
        "necessary": ["虚烦不得眠", "心中懊憹"],
        "common": ["反复颠倒", "胸中窒", "心中结痛", "按之心下濡"],
        "excluding": ["实热烦躁", "痰湿内扰", "阳明腑实"],
        "pathology": "热扰胸膈，气机不畅，虚烦不宁",
        "herbs": [
            {"name": "栀子", "dosage": "十四枚"},
            {"name": "香豉", "dosage": "四合"},
        ],
        "usage": "以水四升，先煮栀子得二升半，内豉煮取一升半，去滓，分二服，温进一服。",
        "contraindications": ["脾胃虚寒", "大便溏泄", "无热象者"],
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


def extract_mvp_cards() -> list[dict]:
    text = MVP_FILE.read_text(encoding="utf-8")
    start = text.find("const CARDS = [")
    end = text.find("const EXPERIENCES", start)
    if start < 0 or end < 0:
        raise RuntimeError("无法在 shanghanlun-v8-mvp.html 中找到 CARDS 数组")
    js = text[start + len("const CARDS = "):end].strip().rstrip(";").strip()
    return json.loads(js)


def main() -> None:
    now = datetime.now(timezone.utc).isoformat()

    formula_cards: list[dict] = json.loads(FORMULA_CARDS.read_text(encoding="utf-8"))
    source_cards: list[dict] = json.loads(SOURCE_CARDS.read_text(encoding="utf-8"))

    existing_ids = {c["id"] for c in formula_cards}
    existing_src_ids = {s["id"] for s in source_cards}

    # 1. 复用 v8-mvp 中已有、但当前 JSON 没有的卡片
    mvp_cards = extract_mvp_cards()
    for card in mvp_cards:
        if card["id"] in existing_ids:
            continue
        # 确保 mastery 字段存在且结构完整
        if "mastery" not in card or not isinstance(card["mastery"], dict):
            card["mastery"] = make_mastery()
        formula_cards.append(card)
        src_id = f"{card['id']}-src-001"
        if src_id not in existing_src_ids:
            source_cards.append({
                "id": src_id,
                "type": "source_card",
                "source": "伤寒论",
                "chapter": card.get("source_chapter", "待补充"),
                "article_number": "待补充",
                "text": card["data"]["source_text"],
                "mentioned_formulas": [card["formula_name"]],
                "symptoms": (card["data"]["canonical"]["symptom_profile"].get("necessary", [])
                            + card["data"]["canonical"]["symptom_profile"].get("common", [])),
                "key_conclusion": f"{card['formula_name']}主之。",
            })
            existing_src_ids.add(src_id)
        existing_ids.add(card["id"])

    # 2. 追加 15 张新增核心方
    for spec in EXTRA_FORMULAS:
        if spec["id"] in existing_ids:
            continue
        formula_cards.append(card_from_spec(spec, now))
        source_cards.append(source_card_from_spec(spec))
        existing_ids.add(spec["id"])
        existing_src_ids.add(f"{spec['id']}-src-001")

    # 3. 写回文件
    FORMULA_CARDS.write_text(json.dumps(formula_cards, ensure_ascii=False, indent=2), encoding="utf-8")
    SOURCE_CARDS.write_text(json.dumps(source_cards, ensure_ascii=False, indent=2), encoding="utf-8")

    # 4. 生成目标清单
    present = {c["formula_name"] for c in formula_cards}
    target_list = [
        {"name": name, "in_cards": name in present, "priority": "高" if name in present else "待补充"}
        for name in TARGET_FORMULAS
    ]
    TARGET_FILE.write_text(json.dumps(target_list, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"formula_cards: {len(formula_cards)} 张")
    print(f"source_cards: {len(source_cards)} 张")
    print(f"目标方覆盖率：{sum(1 for x in target_list if x['in_cards'])}/{len(target_list)}")


if __name__ == "__main__":
    main()
