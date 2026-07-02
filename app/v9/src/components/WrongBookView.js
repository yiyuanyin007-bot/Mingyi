/**
 * WrongBookView — 错题本视图
 * 职责：显示所有错题记录、按诊断标签过滤、删除、进入学习
 */

import { createElement } from '@utils/dom.js';
import { 
  loadStudyNotes, 
  deleteStudyNote, 
  DIAGNOSIS_TAGS,
  getDiagnosisLabel 
} from '@services/StorageService.js';

/**
 * 渲染错题本
 * @param {HTMLElement} container — 容器
 * @param {Array} allCards — 全部卡片数组
 * @param {Object} callbacks — { onViewCard, onClose }
 */
export function renderWrongBookView(container, allCards, callbacks) {
  container.innerHTML = '';

  const notes = loadStudyNotes();
  
  // 头部
  const header = createElement('div', { className: 'wrongbook-header' });
  header.innerHTML = `
    <div class="wrongbook-title">错题本</div>
    <div class="wrongbook-stats">共 ${notes.length} 条记录</div>
  `;
  container.appendChild(header);

  // 诊断标签过滤
  const filterBar = createElement('div', { className: 'wrongbook-filters' });
  const allBtn = createElement('button', { className: 'wrongbook-filter active' }, '全部');
  allBtn.addEventListener('click', () => {
    renderNotesList(notes, allCards, container);
    updateFilterActive(filterBar, allBtn);
  });
  filterBar.appendChild(allBtn);

  Object.entries(DIAGNOSIS_TAGS).forEach(([key, tag]) => {
    const count = notes.filter(n => n.diagnosis === key).length;
    const btn = createElement('button', { className: 'wrongbook-filter' }, `${tag.label} (${count})`);
    btn.addEventListener('click', () => {
      const filtered = notes.filter(n => n.diagnosis === key);
      renderNotesList(filtered, allCards, container);
      updateFilterActive(filterBar, btn);
    });
    filterBar.appendChild(btn);
  });
  container.appendChild(filterBar);

  // 列表容器
  const listContainer = createElement('div', { className: 'wrongbook-list-container' });
  container.appendChild(listContainer);

  // 渲染列表
  renderNotesList(notes, allCards, listContainer, callbacks);

  // 返回按钮
  const footer = createElement('div', { className: 'wrongbook-footer' });
  const backBtn = createElement('button', { className: 'btn-secondary' }, '返回仪表盘');
  backBtn.addEventListener('click', () => callbacks.onClose?.());
  footer.appendChild(backBtn);
  container.appendChild(footer);
}

/**
 * 渲染笔记列表
 * @private
 */
function renderNotesList(notes, allCards, container, callbacks) {
  container.innerHTML = '';

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="wrongbook-empty">
        <div class="wrongbook-empty-icon">📚</div>
        <div class="wrongbook-empty-text">暂无错题记录</div>
        <div class="wrongbook-empty-hint">做错题目后选择诊断标签，记录会自动保存到这里</div>
      </div>
    `;
    return;
  }

  const list = createElement('div', { className: 'wrongbook-list' });
  
  // 按时间倒序
  const sorted = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sorted.forEach(note => {
    const card = allCards.find(c => c.id === note.cardId);
    const cardName = card ? card.name : note.cardId;
    const tag = DIAGNOSIS_TAGS[note.diagnosis];
    
    const item = createElement('div', { className: 'wrongbook-item', dataset: { noteId: note.id } });
    
    item.innerHTML = `
      <div class="wrongbook-item-header">
        <span class="wrongbook-item-name">${cardName}</span>
        <span class="wrongbook-item-tag ${note.diagnosis}">${tag?.label || note.diagnosis}</span>
      </div>
      <div class="wrongbook-item-vector">${note.vectorLabel}</div>
      <div class="wrongbook-item-answers">
        <span class="wrong-answer">你的：${note.selected}</span>
        <span class="correct-answer">正确：${note.correct}</span>
      </div>
      <div class="wrongbook-item-time">${formatDate(note.timestamp)}</div>
    `;

    // 操作按钮
    const actions = createElement('div', { className: 'wrongbook-item-actions' });
    
    const viewBtn = createElement('button', { className: 'btn-text' }, '查看此方');
    viewBtn.addEventListener('click', () => callbacks?.onViewCard?.(note.cardId));
    actions.appendChild(viewBtn);

    const deleteBtn = createElement('button', { className: 'btn-text-danger' }, '删除');
    deleteBtn.addEventListener('click', () => {
      if (confirm('确定删除这条错题记录？')) {
        deleteStudyNote(note.id);
        item.remove();
        // 如果删空了，显示空状态
        if (list.children.length === 0) {
          renderNotesList([], allCards, container, callbacks);
        }
      }
    });
    actions.appendChild(deleteBtn);

    item.appendChild(actions);
    list.appendChild(item);
  });

  container.appendChild(list);
}

/**
 * 更新过滤按钮激活状态
 * @private
 */
function updateFilterActive(container, activeBtn) {
  container.querySelectorAll('.wrongbook-filter').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');
}

/**
 * 格式化日期
 * @private
 */
function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch (e) {
    return isoString;
  }
}
