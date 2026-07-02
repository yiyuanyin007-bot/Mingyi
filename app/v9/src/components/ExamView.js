/**
 * ExamView 组件 — 考试/练习视图
 * 职责：显示题目、选项、答题反馈、导航按钮
 * 关键修复：
 *   1. 反馈区域只在已答题（selected != null）时显示 — 避免未作答就提示答案
 *   2. 考试模式：提交前只显示已选高亮；提交后才显示正确/错误
 *   3. 导航按钮位置恒定：左边始终上一题，右边始终下一题/提交/完成
 *   4. 第一题上一题禁用；未答时下一题禁用（练习模式）
 *   5. 新增全局键盘事件支持（在 app.js 中绑定）
 */

import { createElement } from '@utils/dom.js';
import { checkAnswer } from '@services/ExamService.js';
import { formatCorrectAnswer } from '@utils/formatters.js';
import { getOptionStats } from '@services/StatsService.js';

/**
 * 渲染考试视图
 * @param {HTMLElement} container — 容器
 * @param {Object} examState — 考试状态 { mode, questions, current, answers, submitted, finished }
 * @param {Object} callbacks — 回调 { onSelect, onPrev, onNext, onSubmit, onFinish }
 * @param {Array} allCards — 全部卡片数组（用于显示正确答案名称）
 */
export function renderExamView(container, examState, callbacks, allCards) {
  container.innerHTML = '';

  const q = examState.questions[examState.current];
  if (!q) return;

  const isExam = examState.mode === 'exam';
  const answered = examState.answers[examState.current];
  const hasAnswered = answered && answered.selected != null;
  const isLast = examState.current >= examState.questions.length - 1;

  // 外层布局
  const layout = createElement('div', { className: 'exam-layout' });

  // 进度
  let progressText = `题目 ${examState.current + 1} / ${examState.questions.length}`;
  if (q.roundInfo) {
    const ri = q.roundInfo;
    progressText = `第${ri.cardIndex}/${ri.totalCards}方：${ri.cardName}（${ri.vectorIndex}/${ri.totalVectors}向量）— ${examState.current + 1}/${ri.totalQuestions || examState.questions.length}`;
  }
  const progress = createElement('div', { className: 'exam-progress' }, progressText);
  layout.appendChild(progress);

  // 题目文本
  const question = createElement('div', { className: 'exam-question' }, q.text);
  layout.appendChild(question);

  // 题型提示（考试模式提交后显示，帮助用户理解）
  if (isExam && examState.submitted) {
    const hint = createElement('div', { className: 'exam-hint' }, `类型：${q.type}`);
    layout.appendChild(hint);
  }

  // 选项容器
  const optsContainer = createElement('div', { className: 'exam-options' });
  q.options.forEach((opt, idx) => {
    const btn = createElement('button', {
      className: 'exam-option',
      dataset: { idx: String(idx) }
    });

    // 选项标签
    const labelSpan = createElement('span', { className: 'option-label' }, opt.label);
    btn.appendChild(labelSpan);

    // 选项统计提示（既往选择次数 + 概率）
    const optionStats = getOptionStats(q.cardId, q.type);
    if (optionStats && optionStats[opt.label]) {
      const count = optionStats[opt.label];
      const total = Object.values(optionStats).reduce((a, b) => a + b, 0);
      const prob = total > 0 ? Math.round((count / total) * 100) : 0;
      const hint = createElement('span', { className: 'option-hint' }, `已选 ${count} 次 · ${prob}%`);
      btn.appendChild(hint);
    }

    const isSelected = answered && answered.selected && answered.selected.id === opt.id;

    if (isExam && examState.submitted && hasAnswered) {
      // 考试模式已提交后：显示正确/错误，禁用点击
      const isCorrect = checkAnswer(q, opt);
      if (isCorrect) btn.classList.add('correct');
      if (isSelected && !isCorrect) btn.classList.add('wrong');
      btn.disabled = true;
    } else if (isExam && !examState.submitted && isSelected) {
      // 考试模式未提交：已选中的高亮，但不禁用
      btn.classList.add('selected');
    } else if (!isExam && hasAnswered) {
      // 练习模式已答题：显示正确/错误，禁用点击
      const isCorrect = checkAnswer(q, opt);
      if (isCorrect) btn.classList.add('correct');
      if (isSelected && !isCorrect) btn.classList.add('wrong');
      btn.disabled = true;
    }

    btn.addEventListener('click', () => callbacks.onSelect?.(idx));
    optsContainer.appendChild(btn);
  });
  layout.appendChild(optsContainer);

  // 反馈区域
  const feedback = createElement('div', { className: 'exam-feedback' });

  const showFeedback = isExam
    ? (examState.submitted && hasAnswered)
    : hasAnswered;

  if (showFeedback) {
    feedback.classList.add('show');
    if (!answered.selected) {
      feedback.innerHTML = `<strong>未作答。</strong> 正确答案是：${formatCorrectAnswer(q, allCards)}`;
    } else if (answered.isCorrect) {
      const extra = (q.type === '1→0' || q.type === '2→0')
        ? ` 该症状/药物组合指向${formatCorrectAnswer(q, allCards)}`
        : '';
      feedback.innerHTML = `<strong>回答正确。</strong>${extra}`;
    } else {
      feedback.innerHTML = `<strong>回答错误。</strong> 正确答案是：${formatCorrectAnswer(q, allCards)}`;
    }
  }

  layout.appendChild(feedback);

  // 导航按钮 — 位置恒定
  const nav = createElement('div', { className: 'exam-nav' });

  // 上一题 — 始终显示，第一题时禁用
  const prevBtn = createElement('button', { className: 'btn-secondary' }, '上一题');
  prevBtn.disabled = examState.current === 0;
  prevBtn.addEventListener('click', () => {
    if (examState.current > 0) callbacks.onPrev?.();
  });
  nav.appendChild(prevBtn);

  // 右边按钮 — 始终显示在同一位置
  let nextLabel, nextDisabled, nextCallback;

  if (isExam) {
    if (examState.submitted) {
      // 已提交后：最后一题显示"完成"，其余显示"下一题"
      nextLabel = isLast ? '完成' : '下一题';
      nextDisabled = false;
      nextCallback = isLast ? callbacks.onFinish : callbacks.onNext;
    } else {
      // 未提交时：最后一题显示"提交试卷"，其余显示"下一题"
      if (isLast) {
        nextLabel = '提交试卷';
        nextDisabled = false;
        nextCallback = callbacks.onSubmit;
      } else {
        nextLabel = '下一题';
        nextDisabled = false;
        nextCallback = callbacks.onNext;
      }
    }
  } else {
    // 练习模式：最后一题"完成"，其余"下一题"；未答禁用
    nextLabel = isLast ? '完成' : '下一题';
    nextDisabled = !hasAnswered;
    nextCallback = isLast ? callbacks.onFinish : callbacks.onNext;
  }

  const nextBtn = createElement('button', { className: 'btn-primary' }, nextLabel);
  nextBtn.disabled = nextDisabled;
  nextBtn.addEventListener('click', () => nextCallback?.());
  nav.appendChild(nextBtn);

  layout.appendChild(nav);
  container.appendChild(layout);
}
