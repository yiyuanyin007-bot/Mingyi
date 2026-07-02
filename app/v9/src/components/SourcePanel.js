/**
 * SourcePanel — 条文系统滑入面板
 * 职责：右侧滑入面板，展示条文/刘渡舟/胡希恕/对比/我的理解，支持提取练习
 * 
 * 功能：
 * 1. 从 SOURCE_CARDS + source_annotations 融合数据
 * 2. 标签页切换：【条文】→【刘渡舟】→【胡希恕】→【对比】→【我的理解】
 * 3. 分级解锁：根据卡片掌握度最高等级过滤标签页
 * 4. 提取练习：Space键/按钮 toggleMask 遮罩内容
 * 5. 可编辑"我的理解"，保存到 localStorage
 */

import { getMastery } from '@services/StorageService.js';

// localStorage 键
const SOURCE_NOTES_KEY = 'source_notes_v1';

/** 向量键名列表（与系统一致） */
const VECTORS = ['0→1', '1→0', '0→2', '2→0', '0→usage', '0→contra'];

/**
 * 打开条文面板（从学习卡片触发）
 * @param {Object} card - 卡片对象
 * @param {Array} sourceCards - source_cards.json 数据
 * @param {HTMLElement} container - 挂载容器（body）
 */
export function openSourcePanel(card, sourceCards, container) {
  if (!card || !container) return;

  const panel = document.createElement('div');
  panel.className = 'source-panel';
  panel.id = 'sourcePanel';

  // 获取该卡片的最高掌握度等级（用于分级解锁）
  const maxLevel = getMaxMasteryLevel(card);
  const tabs = getDisplayTabs(card, maxLevel);
  const normalized = normalizeSourceAnnotations(card, sourceCards);

  // 获取"我的理解"笔记
  const myNote = loadMyNote(card.id);

  panel.innerHTML = `
    <div class="source-panel-overlay" id="sourcePanelOverlay"></div>
    <div class="source-panel-content" id="sourcePanelContent">
      <div class="source-panel-header">
        <div class="source-panel-title">
          <span class="source-panel-formula">${card.formula_name || card.name}</span>
          <span class="source-panel-subtitle">条文学习</span>
        </div>
        <button class="source-panel-close" id="sourcePanelClose" title="关闭 (Esc)">✕</button>
      </div>
      
      <div class="source-panel-tabs" id="sourcePanelTabs">
        ${tabs.map((tab, i) => `
          <button class="source-panel-tab ${i === 0 ? 'active' : ''}" data-tab="${tab.key}">${tab.label}</button>
        `).join('')}
      </div>
      
      <div class="source-panel-body" id="sourcePanelBody">
        ${tabs.map((tab, i) => `
          <div class="source-panel-section ${i === 0 ? 'active' : ''}" data-section="${tab.key}">
            ${renderTabContent(tab, normalized, myNote, card)}
          </div>
        `).join('')}
      </div>
      
      <div class="source-panel-footer">
        <button class="source-panel-mask-btn" id="sourcePanelMaskBtn">👁 遮罩/显示 (Space)</button>
        <div class="source-panel-hint">按 Space 键切换内容遮罩</div>
      </div>
    </div>
  `;

  container.appendChild(panel);

  // 强制重排触发 CSS transition
  requestAnimationFrame(() => {
    panel.classList.add('open');
  });

  // 绑定事件
  bindPanelEvents(panel, card, normalized, tabs);
}

/**
 * 获取卡片最高掌握度等级
 */
function getMaxMasteryLevel(card) {
  let max = 0;
  const mastery = card.mastery || {};
  VECTORS.forEach(v => {
    const m = mastery[v];
    if (m && m.level !== undefined) {
      max = Math.max(max, m.level);
    }
  });
  return max;
}

/**
 * 根据掌握度等级获取显示的标签页
 * level ≤ 1: 只显示【条文】
 * level 2-3: 显示【条文】+【刘渡舟】
 * level ≥ 4: 显示全部（含【胡希恕】+【对比】+【我的理解】）
 */
function getDisplayTabs(card, maxLevel) {
  const allTabs = [
    { key: 'text', label: '【条文】', requires: 0 },
    { key: 'liuduozhou', label: '【刘渡舟】', requires: 2 },
    { key: 'huxishu', label: '【胡希恕】', requires: 4 },
    { key: 'compare', label: '【对比】', requires: 4 },
    { key: 'mynote', label: '【我的理解】', requires: 0 }
  ];

  return allTabs.filter(tab => {
    if (tab.key === 'mynote') return true; // 我的理解始终显示
    if (maxLevel >= tab.requires) return true;
    return false;
  });
}

/**
 * 标准化 source_annotations 数据
 * 支持旧格式（summary/text）和新格式（数组）
 */
function normalizeSourceAnnotations(card, sourceCards) {
  const result = {
    text: [],         // 原文条文
    liuduozhou: [],   // 刘渡舟讲解
    huxishu: [],      // 胡希恕讲解
    compare: []       // 对比内容
  };

  const annotations = card.source_annotations || [];

  // 1. 从 source_annotations 提取
  if (Array.isArray(annotations)) {
    annotations.forEach(anno => {
      if (!anno) return;
      const sourceType = anno.source || '';
      const content = anno.text || anno.summary || '';
      if (!content) return;

      if (sourceType.includes('刘渡舟')) {
        result.liuduozhou.push({ content, summary: anno.summary || '' });
      } else if (sourceType.includes('胡希恕')) {
        result.huxishu.push({ content, summary: anno.summary || '' });
      } else if (sourceType.includes('原文') || sourceType.includes('伤寒论')) {
        result.text.push({ content, summary: anno.summary || '' });
      }
    });
  } else if (typeof annotations === 'object') {
    // 旧格式对象
    Object.entries(annotations).forEach(([key, val]) => {
      if (!val) return;
      const content = val.text || val.summary || String(val);
      if (key.includes('刘渡舟')) {
        result.liuduozhou.push({ content, summary: val.summary || '' });
      } else if (key.includes('胡希恕')) {
        result.huxishu.push({ content, summary: val.summary || '' });
      } else if (key.includes('原文') || key.includes('text')) {
        result.text.push({ content, summary: val.summary || '' });
      }
    });
  }

  // 2. 从 SOURCE_CARDS 补充原文
  if (sourceCards && card.source_text_ids) {
    card.source_text_ids.forEach(id => {
      const sc = sourceCards.find(s => s.id === id);
      if (sc && sc.text) {
        const exists = result.text.some(t => t.content === sc.text);
        if (!exists) {
          result.text.push({ content: sc.text, summary: sc.summary || '' });
        }
      }
    });
  }

  // 3. 如果有刘渡舟+胡希恕，自动生成对比
  if (result.liuduozhou.length > 0 && result.huxishu.length > 0) {
    result.compare = generateCompare(result.liuduozhou, result.huxishu);
  }

  return result;
}

/**
 * 生成刘渡舟 vs 胡希恕对比内容
 */
function generateCompare(liuduozhou, huxishu) {
  const compareItems = [];
  const maxLen = Math.max(liuduozhou.length, huxishu.length);
  for (let i = 0; i < maxLen; i++) {
    compareItems.push({
      liu: liuduozhou[i] ? liuduozhou[i].content : '暂无',
      hu: huxishu[i] ? huxishu[i].content : '暂无'
    });
  }
  return compareItems;
}

/**
 * 渲染标签页内容
 */
function renderTabContent(tab, normalized, myNote, card) {
  const maskable = true; // 所有内容默认可遮罩

  switch (tab.key) {
    case 'text':
      if (normalized.text.length === 0) {
        return '<div class="source-panel-empty">暂无原文资料</div>';
      }
      return normalized.text.map((t, i) => `
        <div class="source-panel-block maskable" data-maskable="true">
          <div class="source-panel-mask-layer"></div>
          <div class="source-panel-block-title">原文 ${i + 1}</div>
          <div class="source-panel-block-content">${renderMarkdown(t.content)}</div>
          ${t.summary ? `<div class="source-panel-block-summary">摘要：${t.summary}</div>` : ''}
        </div>
      `).join('');

    case 'liuduozhou':
      if (normalized.liuduozhou.length === 0) {
        return '<div class="source-panel-empty">暂无刘渡舟讲解</div>';
      }
      return normalized.liuduozhou.map((t, i) => `
        <div class="source-panel-block maskable" data-maskable="true">
          <div class="source-panel-mask-layer"></div>
          <div class="source-panel-block-title">刘渡舟讲解 ${i + 1}</div>
          <div class="source-panel-block-content">${renderMarkdown(t.content)}</div>
          ${t.summary ? `<div class="source-panel-block-summary">摘要：${t.summary}</div>` : ''}
        </div>
      `).join('');

    case 'huxishu':
      if (normalized.huxishu.length === 0) {
        return '<div class="source-panel-empty">暂无胡希恕讲解</div>';
      }
      return normalized.huxishu.map((t, i) => `
        <div class="source-panel-block maskable" data-maskable="true">
          <div class="source-panel-mask-layer"></div>
          <div class="source-panel-block-title">胡希恕讲解 ${i + 1}</div>
          <div class="source-panel-block-content">${renderMarkdown(t.content)}</div>
          ${t.summary ? `<div class="source-panel-block-summary">摘要：${t.summary}</div>` : ''}
        </div>
      `).join('');

    case 'compare':
      if (normalized.compare.length === 0) {
        return '<div class="source-panel-empty">暂无对比内容（需同时有刘渡舟和胡希恕讲解）</div>';
      }
      return normalized.compare.map((c, i) => `
        <div class="source-panel-compare-item">
          <div class="source-panel-compare-side">
            <div class="source-panel-compare-label liu">刘渡舟</div>
            <div class="source-panel-compare-content">${renderMarkdown(c.liu)}</div>
          </div>
          <div class="source-panel-compare-divider">vs</div>
          <div class="source-panel-compare-side">
            <div class="source-panel-compare-label hu">胡希恕</div>
            <div class="source-panel-compare-content">${renderMarkdown(c.hu)}</div>
          </div>
        </div>
      `).join('');

    case 'mynote':
      return `
        <div class="source-panel-my-note">
          <textarea class="source-panel-textarea" id="sourcePanelTextarea" 
            placeholder="写下你自己的理解...

提示：
• 这个方的核心辨证点是什么？
• 和其他方有什么关键区别？
• 临床使用时最需要注意什么？">${myNote || ''}</textarea>
          <button class="source-panel-save-btn" id="sourcePanelSaveBtn">💾 保存</button>
        </div>
      `;

    default:
      return '<div class="source-panel-empty">暂无内容</div>';
  }
}

/**
 * 简单 Markdown 渲染（支持 **粗体**、换行）
 */
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

/**
 * 绑定面板事件
 */
function bindPanelEvents(panel, card, normalized, tabs) {
  const overlay = panel.querySelector('#sourcePanelOverlay');
  const closeBtn = panel.querySelector('#sourcePanelClose');
  const maskBtn = panel.querySelector('#sourcePanelMaskBtn');
  const tabBtns = panel.querySelectorAll('.source-panel-tab');
  const sections = panel.querySelectorAll('.source-panel-section');
  const saveBtn = panel.querySelector('#sourcePanelSaveBtn');
  const textarea = panel.querySelector('#sourcePanelTextarea');

  // 关闭面板
  const closePanel = () => {
    panel.classList.remove('open');
    setTimeout(() => {
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    }, 300);
  };

  overlay?.addEventListener('click', closePanel);
  closeBtn?.addEventListener('click', closePanel);

  // ESC 关闭
  const handleKey = (e) => {
    if (e.key === 'Escape') {
      closePanel();
      document.removeEventListener('keydown', handleKey);
    }
  };
  document.addEventListener('keydown', handleKey);

  // 标签切换
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sections.forEach(s => {
        s.classList.toggle('active', s.dataset.section === tabKey);
      });
    });
  });

  // 遮罩/显示内容
  let isMasked = false;
  const toggleMask = () => {
    isMasked = !isMasked;
    const maskables = panel.querySelectorAll('[data-maskable="true"]');
    maskables.forEach(el => {
      el.classList.toggle('masked', isMasked);
    });
    if (maskBtn) {
      maskBtn.textContent = isMasked ? '👁 显示内容 (Space)' : '👁 遮罩内容 (Space)';
      maskBtn.classList.toggle('active', isMasked);
    }
  };

  maskBtn?.addEventListener('click', toggleMask);

  // Space 键切换遮罩（不在 textarea 中输入时）
  const handleSpace = (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'TEXTAREA') return;
      e.preventDefault();
      toggleMask();
    }
  };
  document.addEventListener('keydown', handleSpace);

  // 面板移除时清理事件
  panel.addEventListener('transitionend', (e) => {
    if (!panel.classList.contains('open') && e.propertyName === 'opacity') {
      document.removeEventListener('keydown', handleSpace);
    }
  });

  // 保存"我的理解"
  saveBtn?.addEventListener('click', () => {
    const note = textarea?.value?.trim() || '';
    saveMyNote(card.id, note);
    showToast(panel, '笔记已保存');
  });
}

/**
 * 从 localStorage 加载我的笔记
 */
function loadMyNote(cardId) {
  try {
    const raw = localStorage.getItem(SOURCE_NOTES_KEY);
    if (!raw) return '';
    const notes = JSON.parse(raw);
    return notes[cardId] || '';
  } catch (e) {
    return '';
  }
}

/**
 * 保存我的笔记到 localStorage
 */
function saveMyNote(cardId, note) {
  try {
    const raw = localStorage.getItem(SOURCE_NOTES_KEY);
    const notes = raw ? JSON.parse(raw) : {};
    notes[cardId] = note;
    localStorage.setItem(SOURCE_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.warn('[SourcePanel] 保存笔记失败:', e);
    return false;
  }
}

/**
 * 显示提示消息
 */
function showToast(panel, message) {
  const toast = document.createElement('div');
  toast.className = 'source-panel-toast';
  toast.textContent = message;
  panel.querySelector('.source-panel-content')?.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/**
 * 关闭当前打开的条文面板（如果有）
 */
export function closeSourcePanel() {
  const panel = document.getElementById('sourcePanel');
  if (panel) {
    panel.classList.remove('open');
    setTimeout(() => {
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    }, 300);
  }
}
