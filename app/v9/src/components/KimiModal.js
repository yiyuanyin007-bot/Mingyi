/**
 * KimiModal 组件 — Kimi 导师弹窗
 * 职责：生成 prompt、显示弹窗、复制到剪贴板、打开 Kimi 聊天
 */

import { createElement } from '@utils/dom.js';

/**
 * 构建 Kimi 导师 Prompt
 * @param {Object} card — 当前卡片
 * @returns {string} prompt 文本
 */
export function buildTutorPrompt(card) {
  if (!card || !card.data) return '';
  const c = card.data.canonical || {};
  const profile = c.symptom_profile || {};
  return `我正在学习《伤寒论》方剂：${card.name}。
原文/提纲：${card.data.source_text || '暂无'}
必要症：${(profile.necessary || []).join('、')}
常见症：${(profile.common || []).join('、')}
排除症：${(profile.excluding || []).join('、')}
核心药物组合：${c.core_combinations || (c.herbs && c.herbs[0] && c.herbs[0].name) || '无'}
药物：${(c.herbs || []).map(h => h.name).join('、')}
病机：${c.pathology || '暂无'}
煎服法：${c.usage || '暂无'}
禁忌：${(c.contraindications || []).join('、')}

请帮我：
1. 用一句话总结此方核心辨证点；
2. 指出最容易与哪几个方混淆；
3. 给出一道我自测用的场景题。`;
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
