/**
 * KimiModal 组件 — Kimi 导师弹窗
 * 职责：生成 prompt、显示弹窗、复制到剪贴板、打开 Kimi 聊天
 */

import { createElement } from '@utils/dom.js';

/**
 * 构建 Kimi 导师 Prompt
 * 采用 4 部分结构：方剂概述、配伍精义、生理学深度解读、临床鉴别与自测
 * @param {Object} card — 当前卡片
 * @returns {string} prompt 文本
 */
export function buildTutorPrompt(card) {
  if (!card || !card.data) return '';
  const c = card.data.canonical || {};
  const profile = c.symptom_profile || {};
  const herbs = (c.herbs || []).map(h => `${h.name}${h.dosage ? ' ' + h.dosage : ''}`).join('、');

  return `我正在学习《伤寒论》方剂：**${card.name}**。

**已知信息：**
- 原文/提纲：${card.data.source_text || '暂无'}
- 必要症：${(profile.necessary || []).join('、') || '—'}
- 常见症：${(profile.common || []).join('、') || '—'}
- 排除症：${(profile.excluding || []).join('、') || '—'}
- 药物组成：${herbs || '—'}
- 病机：${c.pathology || '暂无'}
- 煎服法：${c.usage || '暂无'}
- 禁忌：${(c.contraindications || []).join('、') || '无'}

---

请按以下 **4 部分结构** 帮我深入理解此方（请用 Markdown 格式输出）：

## 一、方剂概述与核心辨证
1. 用一句话总结此方核心辨证点（即「见到什么主症就必须想到此方」）。
2. 指出此方在《伤寒论》中的定位（所属篇章、与六经的关系）。
3. 简述此方的主治范围（典型病证 + 现代常见应用场景）。

## 二、药物组成与配伍精义
1. 分析君、臣、佐、使的配伍逻辑。
2. 指出关键药物的独特作用（如桂枝 vs 芍药的比例意义、生姜/大枣的调和作用等）。
3. 如原方有剂量，请说明剂量比例对功效的影响。

## 三、生理学/病机深度解读
1. 从现代医学/生理学角度，解释此方作用的潜在机制（如：桂枝汤如何调节体温中枢/免疫应答/血液循环）。
2. 结合病机，解释为何此方对这些症状有效（病理生理链条）。
3. 指出此方作用的关键靶点（如：汗腺调节、血管舒缩、炎症因子等）。

## 四、临床鉴别与自测
1. 最容易与哪 **2-3 个方** 混淆？请列表对比（辨证要点差异 + 药物差异）。
2. 给出一道我自测用的 **场景病例题**（含：患者主诉、舌脉、关键症状，要求我判断应选何方）。
3. 给出该场景题的答案与解析。

---

**输出要求：**
- 请用 Markdown 格式输出，标题层级清晰。
- 语言简洁专业，适合中医临床学习者。
- 第三部分（生理学解读）请尽量具体，避免空泛描述。`;
}

/**
 * 打开 Kimi 弹窗
 * @param {Object} card — 当前卡片
 * @returns {HTMLElement} 弹窗元素
 */
export function openKimiModal(card) {
  // 如果已有弹窗，先关闭
  closeKimiModal();

  const prompt = buildTutorPrompt(card);
  const overlay = createElement('div', { className: 'tutor-overlay' });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeKimiModal();
  });

  const modal = createElement('div', { className: 'tutor-modal' });

  const title = createElement('div', { className: 'tutor-title' }, '问 Kimi（复制下方 prompt）');
  modal.appendChild(title);

  const textarea = createElement('textarea', {
    className: 'tutor-text',
    readonly: 'readonly'
  }, prompt);
  modal.appendChild(textarea);

  const actions = createElement('div', { className: 'tutor-actions' });

  const btnOpen = createElement('button', { className: 'btn-primary' }, '打开 Kimi 并复制');
  btnOpen.addEventListener('click', () => {
    textarea.select();
    try {
      navigator.clipboard.writeText(prompt);
    } catch (e) {
      document.execCommand('copy');
    }
    const win = window.open('https://kimi.com', '_blank');
    if (!win || win.closed) {
      alert('Prompt 已复制。新标签被浏览器拦截时，请手动打开 https://kimi.com 并粘贴。');
    }
  });
  actions.appendChild(btnOpen);

  const btnCopy = createElement('button', { className: 'btn-secondary' }, '仅复制 Prompt');
  btnCopy.addEventListener('click', async () => {
    textarea.select();
    try {
      await navigator.clipboard.writeText(prompt);
      alert('Prompt 已复制，打开 Kimi 粘贴即可。');
    } catch (e) {
      document.execCommand('copy');
      alert('Prompt 已复制，打开 Kimi 粘贴即可。');
    }
  });
  actions.appendChild(btnCopy);

  const btnClose = createElement('button', { className: 'btn-secondary' }, '关闭');
  btnClose.addEventListener('click', closeKimiModal);
  actions.appendChild(btnClose);

  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return overlay;
}

/**
 * 关闭 Kimi 弹窗
 */
export function closeKimiModal() {
  const el = document.querySelector('.tutor-overlay');
  if (el) el.remove();
}
