#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from pathlib import Path

text = Path("extracted/太阳病.md").read_text(encoding="utf-8")
formulas = [
    "桂枝汤", "麻黄汤", "葛根汤", "大青龙汤", "小青龙汤",
    "桂枝加葛根汤", "桂枝加厚朴杏子汤", "桂枝去芍药汤", "桂枝加附子汤",
    "桂枝麻黄各半汤", "桂枝二越婢一汤", "麻黄杏仁甘草石膏汤", "麻杏甘石汤",
    "葛根加半夏汤", "葛根黄芩黄连汤", "小柴胡汤", "大柴胡汤",
    "柴胡加芒硝汤", "柴胡加龙骨牡蛎汤", "栀子豉汤", "栀子甘草豉汤",
    "栀子生姜豉汤", "栀子厚朴汤", "栀子干姜汤", "五苓散", "真武汤",
    "四逆汤", "干姜附子汤", "茯苓四逆汤", "桃核承气汤", "抵当汤",
    "小建中汤", "大承气汤", "调胃承气汤", "白虎加人参汤", "白虎汤",
]
out = Path("extracted/coverage_check.md")
lines = ["| 方剂 | 太阳病.md中是否出现 |", "|---|---|"]
for f in formulas:
    found = f in text
    lines.append(f"| {f} | {'是' if found else '否'} |")
out.write_text("\n".join(lines), encoding="utf-8")
print(f"已写入 {out}")
