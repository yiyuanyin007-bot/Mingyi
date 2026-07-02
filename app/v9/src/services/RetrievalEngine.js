/**
 * RetrievalEngine — 检索练习引擎（再来一组 / 关联学习）
 * 职责：基于错题画像生成针对性检索练习，认知科学驱动
 * 理论支撑：Hebbian关联、工作记忆4±1、组块化、交错练习
 */

import { generateQuestionForVector } from '@services/ExamService.js';
import { getVectorLabel } from '@utils/formatters.js';

/**
 * 生成"再来一组"检索练习题目
 * @param {Array} answers — 上一组考试答案 [{ question, selected, isCorrect }]
 * @param {Array} allCards — 全部卡片数组
 * @returns {Array} 题目数组（含 roundInfo）
 */
export function generateRetrievalRound(answers, allCards) {
  const wrongAnswers = (answers || []).filter(a => !a.isCorrect);

  // 1. 提取薄弱方，按错题数排序，取前3个（工作记忆限制 4±1）
  const cardWrongCount = {};
  wrongAnswers.forEach(a => {
    const cid = a.question?.cardId;
    if (cid) cardWrongCount[cid] = (cardWrongCount[cid] || 0) + 1;
  });
  const weakCardIds = Object.entries(cardWrongCount)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, 3);

  if (weakCardIds.length === 0) {
    // Fallback：无错题时随机抽3个方
    return generateFallbackRound(allCards);
  }

  // 2. 为每个薄弱方生成2-3个向量题目（关联学习）
  const cardGroups = [];
  weakCardIds.forEach((cardId, cardIdx) => {
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;

    const wrongVectors = new Set();
    wrongAnswers.forEach(a => {
      if (a.question?.cardId === cardId) wrongVectors.add(a.question.type);
    });

    const vectors = [];
    // 必包含：错题向量（纠错）
    wrongVectors.forEach(v => { if (!vectors.includes(v)) vectors.push(v); });
    // 必包含：反向向量（交叉验证，Hebbian关联）
    const reverseMap = {'0→1':'1→0', '1→0':'0→1', '0→2':'2→0', '2→0':'0→2', '0→contra':'0→contra', '0→usage':'0→usage'};
    wrongVectors.forEach(v => {
      const rv = reverseMap[v];
      if (rv && rv !== v && !vectors.includes(rv)) vectors.push(rv);
    });
    // 可选：药组向量（关联学习）
    if (card.data?.canonical?.herbs?.length > 0 && !vectors.includes('0→2')) {
      vectors.push('0→2');
    }
    // 截断到每方最多3个
    if (vectors.length > 3) vectors.length = 3;

    const questions = [];
    vectors.forEach((v, vi) => {
      const q = generateQuestionForVector(card, v);
      if (q) {
        questions.push({
          ...q,
          options: null, // 由调用方生成选项
          roundInfo: {
            cardIndex: cardIdx + 1,
            totalCards: weakCardIds.length,
            cardName: card.name,
            vectorIndex: vi + 1,
            totalVectors: vectors.length
          }
        });
      }
    });

    if (questions.length > 0) {
      cardGroups.push({ cardId, cardName: card.name, questions });
    }
  });

  // 3. 合并：同一方的题连续出现（组块化），不同方之间切换
  let allQuestions = [];
  cardGroups.forEach(g => { allQuestions = allQuestions.concat(g.questions); });

  // 截断到10题（避免认知超载）
  if (allQuestions.length > 10) allQuestions = allQuestions.slice(0, 10);

  // 更新总题数
  const totalQ = allQuestions.length;
  allQuestions.forEach(q => { if (q.roundInfo) q.roundInfo.totalQuestions = totalQ; });

  return allQuestions;
}

/**
 * 生成错题画像分析
 * @param {Array} answers — 考试答案
 * @param {Array} allCards — 全部卡片
 * @returns {Object} 画像数据
 */
export function generateWrongProfile(answers, allCards) {
  const wrongAnswers = (answers || []).filter(a => !a.isCorrect);
  const total = (answers || []).length;

  if (wrongAnswers.length === 0) {
    return { hasWeakness: false, message: '暂无错题，继续保持！' };
  }

  // 薄弱方统计
  const cardStats = {};
  const vectorStats = {};
  const diagnosisMap = { confusion: '类方混淆', reverse: '反向盲区', gap: '知识缺口', mistake: '决策失误' };

  wrongAnswers.forEach(a => {
    const cid = a.question?.cardId;
    const vec = a.question?.type;
    if (cid) {
      cardStats[cid] = (cardStats[cid] || 0) + 1;
    }
    if (vec) {
      vectorStats[vec] = (vectorStats[vec] || 0) + 1;
    }
  });

  // 最薄弱方
  const topWeakCard = Object.entries(cardStats)
    .sort((a, b) => b[1] - a[1])[0];
  const weakCard = topWeakCard ? allCards.find(c => c.id === topWeakCard[0]) : null;

  // 最薄弱向量
  const topWeakVector = Object.entries(vectorStats)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    hasWeakness: true,
    totalWrong: wrongAnswers.length,
    total,
    weakCard: weakCard ? { id: weakCard.id, name: weakCard.name, count: topWeakCard[1] } : null,
    weakVector: topWeakVector ? { type: topWeakVector[0], label: getVectorLabel(topWeakVector[0]), count: topWeakVector[1] } : null,
    cardDistribution: cardStats,
    vectorDistribution: vectorStats,
    suggestions: generateSuggestions(cardStats, vectorStats, weakCard)
  };
}

/**
 * 生成学习建议
 * @private
 */
function generateSuggestions(cardStats, vectorStats, weakCard) {
  const suggestions = [];
  const cardCount = Object.keys(cardStats).length;
  
  if (cardCount >= 3) {
    suggestions.push('你犯错的方剂分布较广，建议聚焦前3个薄弱方做关联学习');
  } else if (cardCount === 1 && weakCard) {
    suggestions.push(`${weakCard.name}是你的主要薄弱点，建议从所有6个向量全面复习`);
  }

  if (vectorStats['0→1'] && vectorStats['1→0']) {
    suggestions.push('双向向量（0→1和1→0）都有错误，建议加强方证互推练习');
  }
  if (vectorStats['0→2'] || vectorStats['2→0']) {
    suggestions.push('药组向量薄弱，建议加强药物记忆与方-药关联');
  }

  if (suggestions.length === 0) {
    suggestions.push('继续当前节奏，保持错题本的诊断标签记录');
  }

  return suggestions;
}

/**
 * 无错题时的Fallback题目生成
 * @private
 */
function generateFallbackRound(allCards) {
  if (!allCards || allCards.length === 0) return [];
  const randomCards = [...allCards].sort(() => Math.random() - 0.5).slice(0, 3);
  const questions = [];
  randomCards.forEach((card, ci) => {
    const q = generateQuestionForVector(card, '0→1');
    if (q) {
      questions.push({
        ...q,
        roundInfo: {
          cardIndex: ci + 1,
          totalCards: randomCards.length,
          cardName: card.name,
          vectorIndex: 1,
          totalVectors: 1,
          totalQuestions: 1,
          fallback: true
        }
      });
    }
  });
  return questions;
}
