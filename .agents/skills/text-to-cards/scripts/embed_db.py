#!/usr/bin/env python3
# -*- coding: utf-8 -*-
r"""
将 JSON 数据库嵌入到前端 HTML 中，生成可直接双击打开的版本。

输入：
  - C:\Users\Chen\Desktop\shanghanlun-v7.html
  - data/formula_cards.json
输出：
  - shanghanlun-v7-db.html
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DESKTOP_HTML = r"C:\Users\Chen\Desktop\shanghanlun-v7.html"
DATA_FILE = os.path.join(BASE_DIR, "data", "formula_cards.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "shanghanlun-v7-db.html")


def main():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        cards = json.load(f)

    with open(DESKTOP_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. 替换硬编码的 CARDS 数组
    # 找到 const CARDS = [ ... ]; 这一段
    pattern = r"const CARDS = \[\s*\{[\s\S]*?\}\s*\];"
    replacement = f"const CARDS = {json.dumps(cards, ensure_ascii=False, indent=2)};"
    html_new = re.sub(pattern, replacement, html)

    if html_new == html:
        raise RuntimeError("未能找到 CARDS 数组进行替换")

    # 2. 改进临床模式组卷：优先使用 confusable_formulas
    old_build = """function buildClinicalGroup(anchorId, count) {
  const group = [anchorId];
  const others = CARDS.filter(c => c.id !== anchorId).map(c => c.id);
  // Fisher-Yates 洗牌
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const needed = Math.min(count - 1, others.length);
  for (let i = 0; i < needed; i++) {
    group.push(others[i]);
  }
  return group;
}"""

    new_build = """function buildClinicalGroup(anchorId, count) {
  const group = [anchorId];
  const anchor = CARDS.find(c => c.id === anchorId);
  if (!anchor) return group;

  // 优先使用卡片自带的易混方
  let preferred = (anchor.data.confusable_formulas || [])
    .filter(id => id !== anchorId && CARDS.some(c => c.id === id));

  // 若易混方不足，随机补齐
  const others = CARDS.filter(c => c.id !== anchorId && !preferred.includes(c.id)).map(c => c.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  const needed = Math.min(count - 1, CARDS.length - 1);
  const pool = [...preferred, ...others];
  for (let i = 0; i < needed; i++) {
    if (pool[i]) group.push(pool[i]);
  }
  return group;
}"""

    html_new = html_new.replace(old_build, new_build)

    # 3. 在学习详情中增加"易混方"展示
    old_learn = """    <div class="section-title">⚠️ 禁忌</div>
      <div class="detail-text" id="detailContraindications"></div>
      <div class="learn-hint" id="learnHint">"""

    new_learn = """    <div class="section-title">⚠️ 禁忌</div>
      <div class="detail-text" id="detailContraindications"></div>
      <div class="section-title" id="confusableTitle" style="display:none;">🔀 易混方</div>
      <div class="detail-text" id="detailConfusable" style="display:none;"></div>
      <div class="learn-hint" id="learnHint">"""

    html_new = html_new.replace(old_learn, new_learn)

    # 4. 在 renderLearnCenter 中填充易混方
    old_render = """  document.getElementById('detailContraindications').textContent =
    card.data.contraindications.join('、') || '无明确禁忌';

  // 更新学习提示"""

    new_render = """  document.getElementById('detailContraindications').textContent =
    card.data.contraindications.join('、') || '无明确禁忌';

  // 易混方
  const confusable = card.data.confusable_formulas || [];
  const confusableTitle = document.getElementById('confusableTitle');
  const detailConfusable = document.getElementById('detailConfusable');
  if (confusable.length > 0) {
    confusableTitle.style.display = 'block';
    detailConfusable.style.display = 'block';
    detailConfusable.innerHTML = confusable.map(id => {
      const c = CARDS.find(x => x.id === id);
      return c ? `<span class="tag">${c.name}</span>` : '';
    }).join(' ');
  } else {
    confusableTitle.style.display = 'none';
    detailConfusable.style.display = 'none';
  }

  // 更新学习提示"""

    html_new = html_new.replace(old_render, new_render)

    # 5. 更新标题，提示这是数据库版
    html_new = html_new.replace(
        "<title>《伤寒论》训练系统 v7</title>",
        "<title>《伤寒论》训练系统 v7 · DB版</title>"
    )
    html_new = html_new.replace(
        '<div class="topbar-title">《伤寒论》训练系统 v7</div>',
        '<div class="topbar-title">《伤寒论》训练系统 v7 · DB版</div>'
    )

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(html_new)

    print(f"已生成 {OUTPUT_FILE}")
    print(f"  方剂卡数量: {len(cards)}")
    print(f"  输出文件大小: {os.path.getsize(OUTPUT_FILE)} bytes")


if __name__ == "__main__":
    main()
