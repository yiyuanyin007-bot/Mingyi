/**
 * CardList 组件 — 卡片列表（纯渲染，props 驱动）
 * 职责：渲染仪表盘中的卡片列表，显示名称、描述、标签、掌握度进度点
 * v1.1: 新增标签点击聚类、搜索高亮支持
 */

import { createElement, delegate } from '@utils/dom.js';

/**
 * 渲染卡片列表
 * @param {HTMLElement} container — 容器元素
 * @param {Array} cards — 卡片数组
 * @param {Object} options — 选项
 * @param {Function} options.onCardClick — 点击卡片回调 (cardId) => void
 * @param {Function} options.onTagClick — 点击标签回调 (tagName) => void
 * @param {string} options.highlightQuery — 高亮关键词（搜索模式）
 * @param {string} options.activeTag — 当前激活的标签（聚类模式）
 */
export function renderCardList(container, cards, options = {}) {
  const { onCardClick, onTagClick, highlightQuery, activeTag } = options;
  container.innerHTML = '';

  const list = createElement('div', { className: 'card-list' });

  cards.forEach(card => {
    const m = card.mastery || {};
    const done = Object.values(m).filter(x => x && x.status === '已掌握').length;
    const total = Object.keys(m).length;

    const item = createElement('div', {
      className: 'card-list-item',
      tabindex: '0',
      dataset: { cardId: card.id }
    });

    // 主内容区
    const main = createElement('div', { className: 'card-list-main' });
    
    // 名称（支持搜索高亮）
    const displayName = highlightQuery 
      ? highlightText(card.name, highlightQuery)
      : card.name;
    const name = createElement('div', { className: 'card-list-name' });
    name.innerHTML = displayName;
    
    const desc = createElement('div', { className: 'card-list-desc' }, card.desc);
    const tags = createElement('div', { className: 'card-list-tags' });

    (card.tags || []).slice(0, 3).forEach(tag => {
      const tagEl = createElement('span', { 
        className: 'tag' + (tag === activeTag ? ' active' : ''),
        dataset: { tag: tag }
      }, tag);
      tags.appendChild(tagEl);
    });

    main.appendChild(name);
    main.appendChild(desc);
    main.appendChild(tags);
    item.appendChild(main);

    // 进度点
    const dots = createElement('div', { className: 'progress-dots' });
    for (let i = 0; i < total; i++) {
      const dot = createElement('div', {
        className: 'progress-dot' + (i < done ? ' done' : '')
      });
      dots.appendChild(dot);
    }
    item.appendChild(dots);

    list.appendChild(item);
  });

  container.appendChild(list);

  // 事件委托：点击卡片项
  if (onCardClick) {
    delegate(list, 'click', '.card-list-item', (e, target) => {
      // 如果点击的是标签，不触发卡片点击
      if (e.target.closest('.tag')) return;
      const cardId = target.dataset.cardId;
      if (cardId) onCardClick(cardId);
    });

    // 键盘导航：Enter 打开卡片
    delegate(list, 'keydown', '.card-list-item', (e, target) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cardId = target.dataset.cardId;
        if (cardId) onCardClick(cardId);
      }
    });
  }

  // 事件委托：点击标签
  if (onTagClick) {
    delegate(list, 'click', '.tag', (e, target) => {
      e.stopPropagation();
      const tag = target.dataset.tag;
      if (tag) onTagClick(tag);
    });
  }
}

/**
 * 高亮文本中的关键词
 * @param {string} text — 原文本
 * @param {string} query — 关键词
 * @returns {string} HTML字符串（含高亮标记）
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}
