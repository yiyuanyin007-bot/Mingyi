/**
 * NoteEditor — 统一笔记浮窗组件
 * 职责：以浮窗（Modal）形式编辑/创建笔记，支持 Markdown 预览、标签管理、多类型笔记（exam/card/source）
 *
 * 【调用方式】
 *    import { openNoteEditor } from '@components/NoteEditor.js';
 *    openNoteEditor({
 *      cardId: 'gui-zhi-tang',
 *      cardName: '桂枝汤',
 *      type: 'card',           // 'exam' | 'card' | 'source'
 *      existingNote: null,     // 已有笔记对象（编辑模式）
 *      onSave: (note) => { }   // 保存后回调
 *    });
 */

import { createElement } from '@utils/dom.js';
import { getNote, createNote, updateNote, getNotesByCard, getDiagnosisLabel, DIAGNOSIS_TAGS } from '@services/NoteService.js';

/**
 * 打开笔记浮窗
 * @param {Object} options
 * @param {string} options.cardId - 方剂卡片ID
 * @param {string} [options.cardName] - 方剂名称（显示用）
 * @param {string} options.type - 笔记类型 'exam' | 'card' | 'source'
 * @param {Object} [options.existingNote] - 已有笔记（编辑模式）
 * @param {Object} [options.examData] - 考试数据（type=exam 时传入）
 * @param {string} [options.sourceData] - 条文数据（type=source 时传入用于自动填充内容）
 * @param {Function} [options.onSave] - 保存后回调 (note) => void
 * @param {Function} [options.onClose] - 关闭后回调
 */
export function openNoteEditor(options) {
  const {
    cardId,
    cardName,
    type = 'card',
    existingNote = null,
    examData = null,
    sourceData = null,
    onSave = null,
    onClose = null
  } = options;

  // 关闭已有浮窗
  const existing = document.querySelector('.note-editor-overlay');
  if (existing) existing.remove();

  // 已有笔记则进入编辑模式
  let currentNote = existingNote;
  let content = existingNote ? existingNote.content : '';
  const tags = existingNote ? [...(existingNote.tags || [])] : [];
  let tempTag = '';

  // Overlay
  const overlay = createElement('div', { className: 'note-editor-overlay' });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeEditor();
    }
  });

  // Panel
  const panel = createElement('div', { className: 'note-editor-panel' });

  // ===== Header =====
  const header = createElement('div', { className: 'note-editor-header' });
  const titleText = existingNote ? '✏️ 编辑笔记' : '📝 记笔记';
  header.appendChild(createElement('div', { className: 'note-editor-title' }, titleText));

  const typeLabel = {
    exam: '错题本',
    card: '方剂笔记',
    source: '条文笔记'
  }[type] || '笔记';
  header.appendChild(createElement('div', { className: 'note-editor-type-badge' }, typeLabel));

  const closeBtn = createElement('button', { className: 'note-editor-close' }, '✕');
  closeBtn.addEventListener('click', closeEditor);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // ===== Card name =====
  const nameBar = createElement('div', { className: 'note-editor-name-bar' });
  nameBar.textContent = cardName || cardId || '';
  panel.appendChild(nameBar);

  // ===== Content tabs: 编辑 | 预览 =====
  const tabBar = createElement('div', { className: 'note-editor-tab-bar' });
  const tabEdit = createElement('button', { className: 'note-editor-tab active' }, '✏️ 编辑');
  const tabPreview = createElement('button', { className: 'note-editor-tab' }, '👁️ 预览');
  tabBar.appendChild(tabEdit);
  tabBar.appendChild(tabPreview);
  panel.appendChild(tabBar);

  // Content area
  const contentArea = createElement('div', { className: 'note-editor-content-area' });

  // 编辑区（textarea）
  const textarea = createElement('textarea', {
    className: 'note-editor-textarea',
    placeholder: '在此记录笔记...\n支持 Markdown 语法：\n# 标题\n**粗体**\n- 列表\n> 引用'
  });
  textarea.value = content;
  contentArea.appendChild(textarea);

  // 预览区（默认隐藏）
  const previewArea = createElement('div', { className: 'note-editor-preview markdown-body' });
  previewArea.style.display = 'none';
  contentArea.appendChild(previewArea);

  panel.appendChild(contentArea);

  // Markdown 渲染函数
  function renderMarkdown(text) {
    if (!text) return '<div style="color:var(--text-muted);">暂无内容</div>';
    let html = escapeHtml(text);
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    const lines = html.split('\n');
    let inList = false;
    let result = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) { result.push('<ul>'); inList = true; }
        result.push('<li>' + trimmed.substring(2) + '</li>');
      } else {
        if (inList) { result.push('</ul>'); inList = false; }
        result.push(line);
      }
    }
    if (inList) result.push('</ul>');
    html = result.join('\n');
    html = html.replace(/(<\/(?:h[1-6]|blockquote|li|ul|pre)>)\n/g, '$1');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Tab switching
  tabEdit.addEventListener('click', () => {
    tabEdit.classList.add('active');
    tabPreview.classList.remove('active');
    textarea.style.display = 'block';
    previewArea.style.display = 'none';
  });
  tabPreview.addEventListener('click', () => {
    tabEdit.classList.remove('active');
    tabPreview.classList.add('active');
    textarea.style.display = 'none';
    previewArea.style.display = 'block';
    previewArea.innerHTML = renderMarkdown(textarea.value);
  });

  // ===== Tags area =====
  const tagsArea = createElement('div', { className: 'note-editor-tags-area' });
  tagsArea.appendChild(createElement('div', { className: 'note-editor-tags-label' }, '🏷️ 标签'));

  // Tags list
  const tagsList = createElement('div', { className: 'note-editor-tags-list' });

  function renderTags() {
    tagsList.innerHTML = '';
    if (tags.length === 0) {
      const empty = createElement('span', { className: 'note-editor-tags-empty' }, '暂无标签，输入标签名按回车添加');
      tagsList.appendChild(empty);
    } else {
      tags.forEach(tag => {
        const tagEl = createElement('span', { className: 'note-editor-tag' });
        tagEl.appendChild(document.createTextNode(tag));
        const removeBtn = createElement('span', { className: 'note-editor-tag-remove' }, '×');
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = tags.indexOf(tag);
          if (idx >= 0) tags.splice(idx, 1);
          renderTags();
        });
        tagEl.appendChild(removeBtn);
        tagsList.appendChild(tagEl);
      });
    }
  }
  renderTags();
  tagsArea.appendChild(tagsList);

  // Tag input
  const tagInputWrap = createElement('div', { className: 'note-editor-tag-input-wrap' });
  const tagInput = createElement('input', {
    className: 'note-editor-tag-input',
    type: 'text',
    placeholder: '输入标签后按回车添加'
  });
  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = tagInput.value.trim();
      if (val && !tags.includes(val)) {
        tags.push(val);
        renderTags();
      }
      tagInput.value = '';
    }
  });
  tagInputWrap.appendChild(tagInput);

  // Quick tag buttons
  const quickTags = createElement('div', { className: 'note-editor-quick-tags' });
  const commonTags = ['六经辨证', '方证对应', '类方鉴别', '药证', '煎服法', '禁忌'];
  commonTags.forEach(t => {
    const btn = createElement('button', {
      className: 'note-editor-quick-tag' + (tags.includes(t) ? ' active' : '')
    }, t);
    btn.addEventListener('click', () => {
      const idx = tags.indexOf(t);
      if (idx >= 0) {
        tags.splice(idx, 1);
      } else {
        tags.push(t);
      }
      renderTags();
      // refresh quick tag states
      tagInputWrap.querySelectorAll('.note-editor-quick-tag').forEach(b => {
        b.classList.toggle('active', tags.includes(b.textContent));
      });
    });
    quickTags.appendChild(btn);
  });
  tagInputWrap.appendChild(quickTags);

  tagsArea.appendChild(tagInputWrap);
  panel.appendChild(tagsArea);

  // ===== Footer actions =====
  const actions = createElement('div', { className: 'note-editor-actions' });

  const btnSave = createElement('button', { className: 'btn-primary' }, '💾 保存');
  btnSave.addEventListener('click', saveNote);

  const btnCancel = createElement('button', { className: 'btn-secondary' }, '取消');
  btnCancel.addEventListener('click', closeEditor);

  actions.appendChild(btnSave);
  actions.appendChild(btnCancel);
  panel.appendChild(actions);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Focus textarea
  setTimeout(() => textarea.focus(), 100);

  // ===== Functions =====

  function saveNote() {
    const newContent = textarea.value.trim();
    if (!newContent && tags.length === 0) {
      closeEditor();
      return;
    }

    if (currentNote) {
      // 更新已有笔记
      updateNote(currentNote.id, {
        content: newContent || '',
        tags: tags
      });
      const updated = getNote(currentNote.id);
      if (onSave) onSave(updated);
    } else {
      // 创建新笔记
      const noteData = {
        type: type,
        cardId: cardId,
        content: newContent || '',
        tags: tags,
        ...(examData ? {
          vector: examData.vector || null,
          vectorLabel: examData.vectorLabel || null,
          diagnosis: examData.diagnosis || null,
          question: examData.question || null,
          selected: examData.selected || null,
          correct: examData.correct || null,
          prompt: examData.prompt || null,
          reviewSchedule: examData.reviewSchedule || null
        } : {})
      };
      const created = createNote(noteData);
      currentNote = created;
      if (onSave) onSave(created);
    }

    showToast('笔记已保存');
  }

  function closeEditor() {
    overlay.remove();
    if (onClose) onClose();
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'note-editor-toast';
    toast.textContent = message;
    overlay.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // ESC close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
      if (onClose) onClose();
    }
  };
  document.addEventListener('keydown', escHandler);
}

export default { openNoteEditor };
