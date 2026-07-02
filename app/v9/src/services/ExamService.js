/**
 * ExamService — 出题逻辑
 * 职责：根据卡片和向量生成题目、生成选项（去重）、判分
 */

import { getCoreCombo, getOptionLabel } from '@utils/formatters.js';
import { shuffle } from '@utils/random.js';
import { areOptionsUnique } from '@utils/validators.js';

/**
 * 为指定卡片的指定向量生成一道题目
 * @param {Object} card - 卡片对象
 * @param {string} vector - 向量类型
 * @returns {Object|null} 题目对象或 null（数据不足时）
 */
export function generateQuestionForVector(card, vector) {
  if (!card || !card.data || !card.data.canonical) return null;
  const c = card.data.canonical;
  const profile = c.symptom_profile || {};
  const allSymptoms = [...(profile.necessary || []), ...(profile.common || [])];

  switch (vector) {
    case '0→1': {
      const necessaryJoined = (profile.necessary || []).join('、');
      if (!necessaryJoined) return null;
      return {
        type: '0→1', cardId: card.id,
        text: `${card.name}的必要症状包括哪些？`,
        correct: necessaryJoined
      };
    }
    case '1→0': {
      if (allSymptoms.length === 0) return null;
      return {
        type: '1→0', cardId: card.id,
        text: `患者出现 ${allSymptoms.slice(0, 2).join('、')}，最可能选哪个方？`,
        correct: card.id
      };
    }
    case '0→2': {
      const core = getCoreCombo(card);
      if (!core || core === '无') return null;
      return {
        type: '0→2', cardId: card.id,
        text: `${card.name}的核心药物组合是？`,
        correct: [core]
      };
    }
    case '2→0': {
      const core = getCoreCombo(card);
      if (!core || core === '无') return null;
      return {
        type: '2→0', cardId: card.id,
        text: `药物组合"${core}"对应哪个方？`,
        correct: card.name  // 改为 card.name，与选项 label 对齐
      };
    }
    case '0→contra': {
      if (!c.contraindications || c.contraindications.length === 0) return null;
      return {
        type: '0→contra', cardId: card.id,
        text: `${card.name}的禁忌是什么？`,
        correct: [c.contraindications[0]]
      };
    }
    case '0→usage': {
      if (!c.usage) return null;
      return {
        type: '0→usage', cardId: card.id,
        text: `${card.name}的煎服法是什么？`,
        correct: c.usage
      };
    }
    default:
      return null;
  }
}

/**
 * 生成某张卡片的全部 6 向量题目
 * @param {Object} card
 * @returns {Array} 题目数组（过滤掉数据不足的）
 */
export function generateQuestions(card) {
  const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];
  return vectors
    .map(v => generateQuestionForVector(card, v))
    .filter(Boolean);
}

/**
 * 生成 4 个选项（1 正确 + 3 干扰项），保证标签唯一
 * @param {string} cardId - 目标卡片 ID
 * @param {string} type - 题型
 * @param {Array} allCards - 全部卡片数组
 * @returns {Array} 选项对象数组 [{ id, label }]
 */
export function generateOptions(cardId, type, allCards = []) {
  const target = allCards.find(c => c.id === cardId);
  if (!target) return [];

  const correctLabel = getOptionLabel(target, type);
  const opts = [{ id: target.id, label: correctLabel }];
  const usedLabels = new Set([correctLabel]);

  const others = shuffle(allCards.filter(c => c.id !== cardId));
  for (const c of others) {
    if (opts.length >= 4) break;
    const label = getOptionLabel(c, type);
    if (!usedLabels.has(label)) {
      usedLabels.add(label);
      opts.push({ id: c.id, label });
    }
  }

  // 兜底：如果题库太小凑不齐 4 个
  let fallbackIndex = 1;
  while (opts.length < 4) {
    const fallback = `选项 ${fallbackIndex++}`;
    if (!usedLabels.has(fallback)) {
      usedLabels.add(fallback);
      opts.push({ id: `fallback-${opts.length}`, label: fallback });
    }
  }

  return shuffle(opts);
}

/**
 * 判断答案是否正确
 * @param {Object} question
 * @param {Object} selectedOption
 * @returns {boolean}
 */
export function checkAnswer(question, selectedOption) {
  if (!question || !selectedOption) return false;
  if (question.type === '1→0' || question.type === '2→0') {
    // 1→0: correct 是 card.id，用 id 比较
    // 2→0: correct 是 card.name，用 label 比较（或 id 兜底）
    return selectedOption.id === question.correct || selectedOption.label === question.correct;
  }
  if (Array.isArray(question.correct)) {
    return question.correct.includes(selectedOption.label);
  }
  return selectedOption.label === question.correct;
}

/**
 * 生成每日复习题目
 * 弱项优先：due + level 低 → 未 due 但 level 低 → 已掌握随机抽检
 * @param {Array} cards - 全部卡片
 * @param {Object} masteryState - 掌握度状态对象 { cardId: { vector: mastery } }
 * @param {number} count - 题目数量（默认 5）
 * @returns {Array} 题目数组
 */
export function generateDailyReview(cards, masteryState, count = 5) {
  const allVectors = [];
  cards.forEach(card => {
    const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];
    vectors.forEach(v => {
      const m = masteryState[card.id]?.[v];
      const due = m ? (m.next_review || 0) <= Date.now() : true;
      allVectors.push({ card, vector: v, mastery: m, due });
    });
  });

  // 按 due + level 排序
  allVectors.sort((a, b) => {
    if (a.due !== b.due) return a.due ? -1 : 1;
    const levelA = a.mastery?.level || 0;
    const levelB = b.mastery?.level || 0;
    if (levelA !== levelB) return levelA - levelB;
    return (a.mastery?.next_review || 0) - (b.mastery?.next_review || 0);
  });

  let selected = allVectors.slice(0, count);
  // 如果不足 count，补充已掌握的随机
  if (selected.length < count) {
    const mastered = allVectors.filter(x => x.mastery?.status === '已掌握');
    const needed = count - selected.length;
    selected = selected.concat(shuffle(mastered).slice(0, needed));
  }

  return selected
    .map(s => {
      const q = generateQuestionForVector(s.card, s.vector);
      if (!q) return null;
      q.options = generateOptions(s.card.id, s.vector, cards);
      return q;
    })
    .filter(Boolean);
}
