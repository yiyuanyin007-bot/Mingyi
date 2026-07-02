/**
 * PracticeSummary — 练习/考试结束后的错题回顾面板
 * 职责：显示错题列表、正确答案对比、诊断标签、问Kimi、支持查看方剂/重做/返回
 * v1.1: 新增诊断标签、错题直接问Kimi、笔记保存
 */

import { createElement } from '@utils/dom.js';
import { getVectorLabel } from '@utils/formatters.js';
import { saveStudyNote, getDiagnosisLabel, DIAGNOSIS_TAGS } from '@services/StorageService.js';
import { openKimiModal } from '@components/KimiModal.js';

/**
 * 打开错题回顾面板
 * @param {Object} examState — 考试状态 { answers: [{ question, selected, isCorrect }] }
 * @param {Array} allCards — 全部卡片数组
 * @param {Object} callbacks — { onViewCard, onRetryWrong, onReturn, onAskKimi }
 */
export function openPracticeSummary(examState, allCards, callbacks) {
  // 关闭已有面板
  closePracticeSummary();

  const wrongAnswers = examState.answers.filter(a => !a.isCorrect);
  const total = examState.answers.length;
  const right = total - wrongAnswers.length;
  const rate = total > 0 ? Math.round(right / total * 100) : 0;

  // 遮罩层
  const overlay = createElement('div', { className: 'practice-summary-overlay' });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePracticeSummary();
  });

  // 面板
  const panel = createElement('div', { className: 'practice-summary-panel' });

  // 标题
  const header = createElement('div', { className: 'practice-summary-header' });
  header.appendChild(createElement('div', { className: 'practice-summary-title' }, '练习完成'));
  const closeBtn = createElement('div', { className: 'practice-summary-close', style: 'cursor:pointer;' }, '✕');
  closeBtn.addEventListener('click', () => {
    closePracticeSummary();
    callbacks.onReturn?.();
  });
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // 统计概览
  const stats = createElement('div', { className: 'practice-summary-stats' });
  stats.innerHTML = `
    <span>本次答题：${total}题</span>
    <span style="color:var(--success);">✓ ${right}对</span>
    <span style="color:var(--error);">✗ ${wrongAnswers.length}错</span>
    <span>正确率 ${rate}%</span>
  `;
  panel.appendChild(stats);

  // 错题直接问Kimi（错题≤3时）
  if (wrongAnswers.length > 0 && wrongAnswers.length <= 3) {
    const askKimiSection = createElement('div', { className: 'practice-summary-ask-kimi' });
    const askBtn = createElement('button', { className: 'btn-kimi' }, '🤖 问Kimi — 分析这' + wrongAnswers.length + '道错题');
    askBtn.addEventListener('click', () => {
      const prompt = buildWrongQuestionPrompt(wrongAnswers, allCards);
      callbacks.onAskKimi?.(prompt) || alert('Kimi提示词已生成，请复制到Kimi对话框');
    });
    askKimiSection.appendChild(askBtn);
    panel.appendChild(askKimiSection);
  }

  // 错题回顾
  if (wrongAnswers.length > 0) {
    const wrongTitle = createElement('div', { className: 'practice-summary-subtitle' },
      `错题回顾（共 ${wrongAnswers.length} 题）`);
    panel.appendChild(wrongTitle);

    const wrongList = createElement('div', { className: 'practice-summary-list' });
    wrongAnswers.forEach((a, idx) => {
      const card = allCards.find(c => c.id === a.question.cardId);
      const cardName = card ? card.name : a.question.cardId;
      const vecLabel = getVectorLabel(a.question.type);

      const item = createElement('div', { className: 'practice-summary-item', dataset: { index: idx } });

      // 方名 + 向量
      const itemTitle = createElement('div', { className: 'practice-summary-item-title' },
        `${idx + 1}. ${cardName} — ${vecLabel}`);
      item.appendChild(itemTitle);

      // 你的答案
      const yourAnswer = a.selected ? a.selected.label : '未作答';
      item.appendChild(createElement('div', { className: 'practice-summary-item-answer wrong' },
        `你的答案：${yourAnswer}`));

      // 正确答案
      const correctAnswer = Array.isArray(a.question.correct)
        ? a.question.correct.join('、')
        : a.question.correct;
      item.appendChild(createElement('div', { className: 'practice-summary-item-answer correct' },
        `正确答案：${correctAnswer}`));

      // 诊断标签
      const diagSection = createElement('div', { className: 'practice-summary-diagnosis' });
      diagSection.appendChild(createElement('div', { className: 'diagnosis-label' }, '诊断标签：'));
      const diagBtns = createElement('div', { className: 'diagnosis-btns' });
      
      Object.entries(DIAGNOSIS_TAGS).forEach(([key, tag]) => {
        const btn = createElement('button', { 
          className: 'diagnosis-btn',
          dataset: { diagnosis: key, noteIndex: idx }
        }, tag.label);
        btn.addEventListener('click', () => {
          // 保存错题到错题本
          saveWrongAnswerNote(a, cardName, key, tag.label);
          // 视觉反馈
          diagBtns.querySelectorAll('.diagnosis-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          // 显示已保存提示
          showSaveToast('已保存到错题本');
        });
        diagBtns.appendChild(btn);
      });
      diagSection.appendChild(diagBtns);
      item.appendChild(diagSection);

      // 操作按钮
      const actions = createElement('div', { className: 'practice-summary-item-actions' });

      const viewBtn = createElement('button', { className: 'btn-secondary' }, '查看此方');
      viewBtn.addEventListener('click', () => {
        closePracticeSummary();
        callbacks.onViewCard?.(a.question.cardId);
      });
      actions.appendChild(viewBtn);

      const retryBtn = createElement('button', { className: 'btn-primary' }, '只练这题');
      retryBtn.addEventListener('click', () => {
        closePracticeSummary();
        callbacks.onRetryWrong?.(a.question.cardId, a.question.type);
      });
      actions.appendChild(retryBtn);

      item.appendChild(actions);
      wrongList.appendChild(item);
    });
    panel.appendChild(wrongList);
  }

  // 底部按钮
  const footer = createElement('div', { className: 'practice-summary-footer' });

  if (wrongAnswers.length > 0) {
    const retrievalBtn = createElement('button', { className: 'btn-retrieval' }, '🔄 再来一组');
    retrievalBtn.addEventListener('click', () => {
      closePracticeSummary();
      callbacks.onRetrieval?.();
    });
    footer.appendChild(retrievalBtn);

    const retryAllBtn = createElement('button', { className: 'btn-primary' }, '重做错题');
    retryAllBtn.addEventListener('click', () => {
      closePracticeSummary();
      callbacks.onRetryWrong?.('all');
    });
    footer.appendChild(retryAllBtn);
  }

  const backBtn = createElement('button', { className: 'btn-secondary' }, '返回仪表盘');
  backBtn.addEventListener('click', () => {
    closePracticeSummary();
    callbacks.onReturn?.();
  });
  footer.appendChild(backBtn);

  panel.appendChild(footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  return overlay;
}

/**
 * 关闭错题回顾面板
 */
export function closePracticeSummary() {
  const el = document.querySelector('.practice-summary-overlay');
  if (el) el.remove();
}

/**
 * 保存错题到错题本
 * @private
 */
function saveWrongAnswerNote(answer, cardName, diagnosisKey, diagnosisLabel) {
  saveStudyNote({
    cardId: answer.question.cardId,
    cardName: cardName,
    vector: answer.question.type,
    vectorLabel: getVectorLabel(answer.question.type),
    diagnosis: diagnosisKey,
    diagnosisLabel: diagnosisLabel,
    question: answer.question.text || answer.question.prompt,
    selected: answer.selected?.label || '未作答',
    correct: Array.isArray(answer.question.correct) 
      ? answer.question.correct.join('、') 
      : answer.question.correct,
    prompt: '',
    notes: ''
  });
}

/**
 * 构建错题问Kimi的prompt
 * @private
 */
function buildWrongQuestionPrompt(wrongAnswers, allCards) {
  let prompt = '我是中医学习者，刚刚练习《伤寒论》方剂时错了以下题目，请帮我分析原因并给出针对性学习建议：\n\n';
  wrongAnswers.forEach((a, i) => {
    const card = allCards.find(c => c.id === a.question.cardId);
    const cardName = card ? card.name : a.question.cardId;
    prompt += `${i + 1}. ${cardName} — ${getVectorLabel(a.question.type)}\n`;
    prompt += `   你的答案：${a.selected?.label || '未作答'}\n`;
    prompt += `   正确答案：${Array.isArray(a.question.correct) ? a.question.correct.join('、') : a.question.correct}\n\n`;
  });
  prompt += '请分析：\n1. 我为什么错（认知层面的原因）\n2. 这个方剂和正确答案的关键区别是什么\n3. 我应该如何强化记忆（具体方法）\n4. 推荐我下一步练习哪个方向';
  return prompt;
}

/**
 * 显示保存提示
 * @private
 */
function showSaveToast(message) {
  const toast = createElement('div', { className: 'save-toast' }, message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
