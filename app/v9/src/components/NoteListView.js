/**
 * NoteListView — 笔记列表页
 * 职责：展示所有笔记（按方剂分组），支持搜索、筛选、编辑、删除
 *
 * 用法：
 *   import { showNoteList } from '@components/NoteListView.js';
 *   showNoteList();
 *
 * 设计：
 * - 全屏覆盖层（overlay），点击背景关闭
 * - 顶部：标题 + 统计 + 搜索框 + 关闭按钮
 * - 主体：按卡片分组的笔记列表（卡片名 → 笔记条目）
 * - 每条笔记：预览 + 标签 + 时间 + 编辑/删除按钮
 */

import { createElement } from '@utils/dom.js';
import { getNotes, getNotesByCard, deleteNote, getAllTags, searchNotes, getNoteStats } from '@services/NoteService.js';
import { openNoteEditor } from '@components/NoteEditor.js';
import { formatDate } from '@utils/formatters.js';

/**
 * 显示笔记列表
 * @param {Object} options - 配置项
 * @param {string} options.cardId - 可选，只显示某张卡片的笔记
 * @param {Function} options.onUpdate - 笔记被编辑/删除后的回调
 */
export function showNoteList(options = {}) {
  const overlay = createElement('div', { className: 'note-list-overlay' });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeNoteList(overlay); });

  const panel = createElement('div', { className: 'note-list-panel' });

  // === Header ===
  const header = createElement('div', { className: 'note-list-header' });
  const stats = getNoteStats();
  const titleText = options.cardId ? '卡片笔记' : `全部笔记（${stats.total || 0}）`;
  header.appendChild(createElement('div', { className: 'note-list-title' }, `📝 ${titleText}`));

  const closeBtn = createElement('button', { className: 'note-list-close' }, '✕');
  closeBtn.addEventListener('click', () => closeNoteList(overlay));
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // === Search bar ===
  if (!options.cardId) {
    const searchBar = createElement('div', { className: 'note-list-search' });
    const searchInput = createElement('input', {
      className: 'note-list-search-input',
      type: 'text',
      placeholder: '🔍 搜索笔记内容或标签...'
    });
    searchBar.appendChild(searchInput);
    panel.appendChild(searchBar);

    // 延迟搜索
    let searchTimer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const q = searchInput.value.trim();
        renderNotes(panel, options.cardId, q, () => closeNoteList(overlay));
      }, 300);
    });
  }

  // === Notes body ===
  const body = createElement('div', { className: 'note-list-body' });
  panel.appendChild(body);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // 渲染笔记
  renderNotesInContainer(body, options.cardId, '', () => closeNoteList(overlay), options);

  // 动画
  requestAnimationFrame(() => overlay.classList.add('open'));

  // ESC 关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') { closeNoteList(overlay); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

function closeNoteList(overlay) {
  overlay.classList.remove('open');
  setTimeout(() => overlay.remove(), 300);
}

/** 重新渲染笔记（保留 panel 引用） */
function renderNotes(panel, cardId, query, onClose) {
  const body = panel.querySelector('.note-list-body');
  if (!body) return;
  renderNotesInContainer(body, cardId, query, onClose);
}

/** 在指定容器中渲染笔记列表 */
function renderNotesInContainer(body, cardId, query, onClose, options = {}) {
  body.innerHTML = '';

  let notes;
  if (query) {
    notes = searchNotes(query);
  } else if (cardId) {
    notes = getNotesByCard(cardId);
  } else {
    notes = getNotes();
  }

  if (!notes || notes.length === 0) {
    body.appendChild(createElement('div', {
      className: 'note-list-empty',
      style: 'text-align:center;padding:40px;color:var(--text-muted);font-size:15px;'
    }, query ? '没有匹配的笔记' : '还没有笔记，在学习页面中记下你的学习心得吧 📝'));
    return;
  }

  // 按 cardId 分组
  const groups = {};
  notes.forEach(n => {
    const key = n.cardId || '_unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  Object.entries(groups).forEach(([gCardId, gNotes]) => {
    // 按更新时间降序
    gNotes.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    const cardName = gNotes[0]?.cardName || gCardId;
    const typeIcons = { exam: '📝', card: '📖', source: '📜' };

    const groupEl = createElement('div', { className: 'note-list-group' });

    // Group header
    const groupHeader = createElement('div', { className: 'note-list-group-header' });
    groupHeader.appendChild(createElement('span', { className: 'note-list-group-name' }, `${cardName}`));
    groupHeader.appendChild(createElement('span', { className: 'note-list-group-count' }, `${gNotes.length} 条`));
    groupEl.appendChild(groupHeader);

    // Note items
    gNotes.forEach(note => {
      const item = createElement('div', { className: 'note-list-item' });

      // Type badge
      const typeBadge = createElement('span', { className: 'note-list-type-badge' }, typeIcons[note.type] || '📄');
      item.appendChild(typeBadge);

      // Content preview
      const contentWrap = createElement('div', { className: 'note-list-content' });
      const preview = note.content
        ? note.content.replace(/#{1,6}\s/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 120)
        : '(空笔记)';
      contentWrap.appendChild(createElement('div', { className: 'note-list-preview' }, preview));
      // Tags
      if (note.tags && note.tags.length) {
        const tagWrap = createElement('div', { className: 'note-list-tags' });
        note.tags.slice(0, 4).forEach(t => {
          tagWrap.appendChild(createElement('span', { className: 'note-list-tag' }, t));
        });
        if (note.tags.length > 4) {
          tagWrap.appendChild(createElement('span', { className: 'note-list-tag note-list-tag-more' }, `+${note.tags.length - 4}`));
        }
        contentWrap.appendChild(tagWrap);
      }
      // Meta
      const meta = createElement('div', { className: 'note-list-meta' });
      const dateStr = note.updatedAt ? formatDate(note.updatedAt) : '';
      meta.textContent = `${dateStr}`;
      contentWrap.appendChild(meta);

      item.appendChild(contentWrap);

      // Actions
      const actions = createElement('div', { className: 'note-list-item-actions' });
      const btnEdit = createElement('button', { className: 'note-list-btn' }, '✏️');
      btnEdit.title = '编辑';
      btnEdit.addEventListener('click', (e) => {
        e.stopPropagation();
        openNoteEditor({
          cardId: note.cardId,
          cardName: cardName,
          type: note.type,
          existingNote: note,
          onSave: () => {
            // 重新渲染
            renderNotesInContainer(body, cardId, query, onClose, options);
            options.onUpdate?.();
          }
        });
      });
      actions.appendChild(btnEdit);

      const btnDel = createElement('button', { className: 'note-list-btn note-list-btn-del' }, '🗑️');
      btnDel.title = '删除';
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('确定删除这条笔记吗？')) {
          deleteNote(note.id);
          renderNotesInContainer(body, cardId, query, onClose, options);
          options.onUpdate?.();
        }
      });
      actions.appendChild(btnDel);

      item.appendChild(actions);

      // 点击条目编辑
      item.addEventListener('click', () => {
        openNoteEditor({
          cardId: note.cardId,
          cardName: cardName,
          type: note.type,
          existingNote: note,
          onSave: () => {
            renderNotesInContainer(body, cardId, query, onClose, options);
            options.onUpdate?.();
          }
        });
      });

      groupEl.appendChild(item);
    });

    body.appendChild(groupEl);
  });
}
