/**
 * WrongBookView — 错题本视图
 * 职责：显示所有错题记录、按诊断标签过滤、删除、进入学习、详情弹窗、重做、掌握、编辑笔记、问Kimi、一键复习
 * v2.0: 从 V8 迁移错题本完整交互功能
 */

import { createElement, escapeHtml } from '@utils/dom.js';
import { getVectorLabel } from '@utils/formatters.js';
import { generateQuestionForVector, generateOptions } from '@services/ExamService.js';
import {
  loadStudyNotes,
  deleteStudyNote,
  updateStudyNote,
  DIAGNOSIS_TAGS,
  getDiagnosisLabel
} from '@services/StorageService.js';

/**
 * 渲染错题本
 * @param {HTMLElement} container — 容器
 * @param {Array} allCards — 全部卡片数组
 * @param {Object} callbacks — { onViewCard, onClose, onRetryWrong, onStartWrongBookReview }
 */
export function renderWrongBookView(container, allCards, callbacks) {
  container.innerHTML = '';

  const notes = loadStudyNotes();
  const dueToday = getDueStudyNotes(notes);

  // 头部
  const header = createElement('div', { className: 'wrongbook-header' });
  header.innerHTML = `
    <div class="wrongbook-title">
      📚 错题本
      <span class="wrongbook-badge">${notes.length}</span>
      <span class="wrongbook-subtitle">— ${dueToday.length} 题今日待复习</span>
    </div>
  `;
  container.appendChild(header);

  // 诊断标签过滤 + 一键复习
  const filterBar = createElement('div', { className: 'wrongbook-filters' });
  const allBtn = createElement('button', { className: 'wrongbook-filter active' }, '全部');
  allBtn.addEventListener('click', () => {
    renderNotesList(notes, allCards, listContainer, callbacks);
    updateFilterActive(filterBar, allBtn);
  });
  filterBar.appendChild(allBtn);

  Object.entries(DIAGNOSIS_TAGS).forEach(([key, tag]) => {
    const count = notes.filter(n => n.diagnosis === key).length;
    const btn = createElement('button', { className: 'wrongbook-filter' }, `${tag.label} (${count})`);
    btn.addEventListener('click', () => {
      const filtered = notes.filter(n => n.diagnosis === key);
      renderNotesList(filtered, allCards, listContainer, callbacks);
      updateFilterActive(filterBar, btn);
    });
    filterBar.appendChild(btn);
  });

  // 一键复习全部按钮
  const reviewAllBtn = createElement('button', { className: 'btn-review-all' }, '🔁 一键复习全部');
  reviewAllBtn.addEventListener('click', () => startWrongBookReview(notes, allCards, callbacks));
  filterBar.appendChild(reviewAllBtn);

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

  // 按时间倒序（默认）
  const sorted = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sorted.forEach(note => {
    const card = allCards.find(c => c.id === note.cardId);
    const cardName = card ? card.name : note.cardId;
    const tag = DIAGNOSIS_TAGS[note.diagnosis];

    const item = createElement('div', { className: 'wrong-card', dataset: { noteId: note.id } });

    const doneCount = note.reviewSchedule ? note.reviewSchedule.filter(r => typeof r === 'object' && r.done).length : 0;
    const totalCount = note.reviewSchedule ? note.reviewSchedule.length : 0;

    item.innerHTML = `
      <span class="wrong-card-tag ${note.diagnosis}">${tag?.label || note.diagnosis}</span>
      <div class="wrong-card-title">${escapeHtml(note.question)}</div>
      <div class="wrong-card-meta">${escapeHtml(cardName)} · ${note.vectorLabel}</div>
      <div class="wrong-card-stats">
        <span>❌ ${escapeHtml(note.selected)}</span>
        <span>✅ ${escapeHtml(note.correct)}</span>
      </div>
      <div class="wrong-card-bar">
        ${note.reviewSchedule ? note.reviewSchedule.map(r => {
          const isDone = typeof r === 'object' && r.done;
          return `<div class="wrong-card-bar-dot ${isDone ? 'done' : ''}"></div>`;
        }).join('') : ''}
      </div>
      ${note.notes ? '<div style="font-size:11px;color:var(--text-secondary);">💡 有笔记</div>' : ''}
    `;

    item.addEventListener('click', () => showWrongDetailModal(note, allCards, callbacks));
    list.appendChild(item);
  });

  container.appendChild(list);
}

/**
 * 显示错题详情弹窗
 * @private
 */
function showWrongDetailModal(note, allCards, callbacks) {
  const doneCount = note.reviewSchedule ? note.reviewSchedule.filter(r => r.done).length : 0;
  const tag = DIAGNOSIS_TAGS[note.diagnosis];

  const card = allCards.find(c => c.id === note.cardId);
  const cardName = card ? card.name : note.cardId;

  let html = `
    <div class="wrong-detail-header">${tag?.label || note.diagnosis} · ${escapeHtml(cardName)} · ${note.vectorLabel}</div>
    <div class="wrong-detail-meta">📅 ${note.timestamp.split('T')[0]} · 复习进度 ${doneCount}/${note.reviewSchedule ? note.reviewSchedule.length : 0}</div>
    <div class="wrong-detail-question">${escapeHtml(note.question)}</div>
    <div class="wrong-detail-choices">
      <div class="wrong-detail-choice wrong">❌ 你的选择：${escapeHtml(note.selected)}</div>
      <div class="wrong-detail-choice right">✅ 正确答案：${escapeHtml(note.correct)}</div>
    </div>
  `;

  if (note.notes) {
    html += `
      <div class="wrong-detail-notes">
        <div class="wrong-detail-notes-label">📝 学习笔记</div>
        <div class="wrong-detail-notes-body">${escapeHtml(note.notes)}</div>
      </div>
    `;
  }

  html += `
    <div class="wrong-detail-actions">
      <button class="btn-ai" id="btnKimi-${note.id}">🤖 去 Kimi 学</button>
      <button class="btn-retry" id="btnRetry-${note.id}">🔁 重做这题</button>
      <button class="btn-master" id="btnMaster-${note.id}">✅ 标记已掌握</button>
      <button class="btn-ghost" id="btnEdit-${note.id}">✏️ 编辑笔记</button>
      <button class="btn-ghost" id="btnDelete-${note.id}">🗑️ 删除</button>
    </div>
    <div class="wrong-detail-review-schedule">
      📅 艾宾浩斯复习计划：${note.reviewSchedule ? note.reviewSchedule.map(r => {
        const isDone = typeof r === 'object' && r.done;
        const dateStr = typeof r === 'object' ? (r.date || r) : formatDate(new Date(r));
        return (isDone ? '✅' : '⬜') + ' ' + dateStr;
      }).join(' · ') : '无'}
    </div>
    <div style="text-align:center;margin-top:16px;">
      <button class="modal-btn" id="btnClose-${note.id}">关闭</button>
    </div>
  `;

  showModal(html, 'wrong-detail-modal');

  // 绑定按钮事件
  setTimeout(() => {
    const kimiBtn = document.getElementById(`btnKimi-${note.id}`);
    if (kimiBtn) kimiBtn.addEventListener('click', () => openKimiFromNote(note, allCards));

    const retryBtn = document.getElementById(`btnRetry-${note.id}`);
    if (retryBtn) retryBtn.addEventListener('click', () => retryWrongNote(note, allCards, callbacks));

    const masterBtn = document.getElementById(`btnMaster-${note.id}`);
    if (masterBtn) masterBtn.addEventListener('click', () => masterWrongNote(note.id, allCards, callbacks));

    const editBtn = document.getElementById(`btnEdit-${note.id}`);
    if (editBtn) editBtn.addEventListener('click', () => editWrongNote(note, allCards));

    const deleteBtn = document.getElementById(`btnDelete-${note.id}`);
    if (deleteBtn) deleteBtn.addEventListener('click', () => {
      if (confirm('确定要删除这条错题记录吗？删除后不可恢复。')) {
        deleteStudyNote(note.id);
        closeModal();
        // 刷新列表
        const notes = loadStudyNotes();
        renderWrongBookView(document.getElementById('wrongBookContainer'), allCards, callbacks);
      }
    });

    const closeBtn = document.getElementById(`btnClose-${note.id}`);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }, 0);
}

/**
 * 重做这题
 * @private
 */
function retryWrongNote(note, allCards, callbacks) {
  const card = allCards.find(c => c.id === note.cardId);
  if (!card) return;
  const q = generateQuestionForVector(card, note.vector);
  if (!q) { alert('暂无可练习题目'); return; }
  q.options = generateOptions(q.cardId, q.type, allCards);
  closeModal();
  callbacks.onRetryWrong?.(note.cardId, note.vector);
}

/**
 * 标记已掌握
 * @private
 */
function masterWrongNote(noteId, allCards, callbacks) {
  if (!confirm('确定标记为已掌握？此题将从错题本中移除。')) return;
  deleteStudyNote(noteId);
  closeModal();
  showToast('已标记掌握');
  // 刷新列表
  const container = document.getElementById('wrongBookContainer');
  if (container) {
    renderWrongBookView(container, allCards, callbacks);
  }
}

/**
 * 编辑笔记
 * @private
 */
function editWrongNote(note, allCards) {
  const card = allCards.find(c => c.id === note.cardId);
  const cardName = card ? card.name : note.cardId;

  const html = `
    <div class="modal-title">✏️ 编辑学习笔记</div>
    <div class="modal-body">
      <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">
        ${escapeHtml(cardName)} · ${note.vectorLabel} · ${getDiagnosisLabel(note.diagnosis)}
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">
        题目：${escapeHtml(note.question)}
      </div>
      <textarea id="editNoteTextarea" style="width:100%;min-height:120px;padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-panel);color:var(--text);font-size:13px;resize:vertical;">${escapeHtml(note.notes || '')}</textarea>
    </div>
    <div class="modal-actions">
      <button class="modal-btn primary" id="btnSaveNote-${note.id}">保存修改</button>
      <button class="modal-btn" id="btnCancelNote-${note.id}">取消</button>
    </div>
  `;

  showModal(html, 'ai-study-modal');

  setTimeout(() => {
    const saveBtn = document.getElementById(`btnSaveNote-${note.id}`);
    if (saveBtn) {
      saveBtn.addEventListener('click', () => saveEditedNote(note.id));
    }
    const cancelBtn = document.getElementById(`btnCancelNote-${note.id}`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        closeModal();
        setTimeout(() => showWrongDetailModal(note, allCards, callbacks), 200);
      });
    }
  }, 0);
}

/**
 * 保存编辑后的笔记
 * @private
 */
function saveEditedNote(noteId) {
  const newNotes = document.getElementById('editNoteTextarea');
  if (!newNotes) return;
  const value = newNotes.value.trim();
  if (updateStudyNote(noteId, { notes: value })) {
    showToast('笔记已更新');
    closeModal();
  }
}

/**
 * 问Kimi
 * @private
 */
function openKimiFromNote(note, allCards) {
  const prompt = generateDiagnosisPrompt(note, allCards);
  try {
    navigator.clipboard.writeText(prompt);
  } catch (e) {
    document.execCommand('copy');
  }
  window.open('https://kimi.moonshot.cn', '_blank');
  showToast('Prompt 已复制，请粘贴到 Kimi');
}

/**
 * 生成诊断分析 Prompt
 * @private
 */
function generateDiagnosisPrompt(note, allCards) {
  const card = allCards.find(c => c.id === note.cardId);
  const cardName = card ? card.name : note.cardId;
  const diagnosisLabel = getDiagnosisLabel(note.diagnosis);
  return `我是中医学习者，我在练习《伤寒论》方剂时遇到了一道错题，请帮我分析：

方剂：${cardName}
向量：${note.vectorLabel}
题目：${note.question}
我的选择：${note.selected}
正确答案：${note.correct}
诊断标签：${diagnosisLabel}

请分析：
1. 我为什么错（认知层面的原因）
2. 这个方剂和正确答案的关键区别是什么
3. 我应该如何强化记忆（具体方法）
4. 推荐我下一步练习哪个方向`;
}

/**
 * 一键复习全部错题
 * @private
 */
function startWrongBookReview(notes, allCards, callbacks) {
  if (notes.length === 0) { alert('错题本为空'); return; }
  const questions = notes.map(n => {
    const card = allCards.find(c => c.id === n.cardId);
    if (!card) return null;
    const q = generateQuestionForVector(card, n.vector);
    if (!q) return null;
    q.options = generateOptions(q.cardId, q.type, allCards);
    return q;
  }).filter(Boolean);
  if (questions.length === 0) { alert('暂无可复习题目'); return; }
  callbacks.onStartWrongBookReview?.(questions);
}

/**
 * 获取今日待复习笔记
 * @private
 */
function getDueStudyNotes(notes) {
  const now = Date.now();
  return notes.filter(note => {
    if (!note.reviewSchedule) return false;
    return note.reviewSchedule.some(t => {
      let time;
      if (typeof t === 'object' && t !== null) {
        // 对象格式 { done, date }
        time = t.date ? new Date(t.date).getTime() : 0;
      } else if (typeof t === 'number') {
        // 时间戳格式
        time = t;
      } else {
        time = new Date(t).getTime();
      }
      return time <= now;
    });
  });
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
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  } catch (e) {
    return isoString;
  }
}

/**
 * 显示弹窗（兼容 V8 弹窗样式）
 * @private
 */
function showModal(html, modalClass) {
  closeModal();
  const overlay = createElement('div', { className: 'modal-overlay' });
  const modal = createElement('div', { className: modalClass || 'modal' });
  modal.innerHTML = html;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

/**
 * 关闭弹窗
 * @private
 */
function closeModal() {
  const el = document.querySelector('.modal-overlay');
  if (el) el.remove();
}

/**
 * 显示 Toast 提示
 * @private
 */
function showToast(message) {
  const toast = createElement('div', {
    className: 'save-toast',
    style: 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;z-index:10000;font-size:13px;'
  }, message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
