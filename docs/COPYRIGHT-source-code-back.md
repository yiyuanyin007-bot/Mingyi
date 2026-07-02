// 明医成长录 V1.0  —  第 31 页

// ========== components/LearnView.js ==========
    item.addEventListener('click', () => item.classList.toggle('revealed'));
    grid.appendChild(item);
  });
  section.appendChild(grid);

  toggleBtn.addEventListener('click', () => {
    const items = grid.querySelectorAll('.herb-item');
    const anyHidden = Array.from(items).some(i => !i.classList.contains('revealed'));
    items.forEach(i => i.classList.toggle('revealed', anyHidden));
    toggleBtn.textContent = anyHidden ? '隐藏全部剂量' : '显示全部剂量';
  });

  return section;
}

function buildRevealSection(title, content) {
  const section = createElement('div', { className: 'section' });
  const titleRow = createElement('div', { className: 'section-title-row' });
  titleRow.appendChild(createElement('div', { className: 'section-title' }, title));
  const statusBtn = createElement('button', { className: 'reveal-btn' }, '显示');
  statusBtn.style.pointerEvents = 'none'; // 按钮不可点击，仅作为状态提示
  titleRow.appendChild(statusBtn);
  section.appendChild(titleRow);

  const body = createElement('div', { className: 'section-body reveal-content' }, content);
  section.appendChild(body);

  // 点击整个 section 切换显示/隐藏
  section.addEventListener('click', (e) => {
    // 如果点击的是链接，不阻止默认行为
    if (e.target.tagName === 'A') return;
    const willReveal = !body.classList.contains('revealed');
    body.classList.toggle('revealed', willReveal);
    statusBtn.textContent = willReveal ? '隐藏' : '显示';
  });

  return section;
}


/**
 * 显示剂量换算弹窗
 * @private
 */
function showDoseModal(herbName, dosage) {
  const converted = convertDosage(herbName, dosage);
  if (!converted) {
    alert(`无法换算「${dosage}」，该单位暂不支持`);
    return;

// --- 第 31 页 结束 ---

// 明医成长录 V1.0  —  第 32 页
  }

  const standards = getDoseStandards();
  let html = `
    <div style="margin-bottom:12px;font-size:14px;color:var(--text-secondary);">
      ${herbName}：${converted.original}
    </div>
    <table class="dose-table">
      <thead>
        <tr><th>标准</th><th>剂量</th><th>换算依据</th></tr>
      </thead>
      <tbody>
        ${standards.map(s => {
          const val = converted[s.key];
          return `<tr><td>${s.name}</td><td>${val || '—'}</td><td>${converted.note || ''}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
  `;

  // 创建弹窗
  const overlay = createElement('div', { className: 'dose-modal-overlay' });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  
  const panel = createElement('div', { className: 'dose-modal-panel' });
  panel.innerHTML = html;
  
  const closeBtn = createElement('button', { className: 'btn-secondary', style: 'margin-top:16px;' }, '关闭');
  closeBtn.addEventListener('click', () => overlay.remove());
  panel.appendChild(closeBtn);
  
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// ========== services/ExamService.js ==========
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

// --- 第 32 页 结束 ---

// 明医成长录 V1.0  —  第 33 页
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

// --- 第 33 页 结束 ---

// 明医成长录 V1.0  —  第 34 页
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


// --- 第 34 页 结束 ---

// 明医成长录 V1.0  —  第 35 页
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

// --- 第 35 页 结束 ---

// 明医成长录 V1.0  —  第 36 页

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

// ========== services/MasteryService.js ==========
/**
 * MasteryService — 掌握度计算与统计
 * 职责：基于掌握度数据生成统计信息、覆盖度、薄弱点
 */

/**
 * 计算全部掌握度概览
 * @param {Array} cards - 全部卡片
 * @param {Object} masteryState - 掌握度状态
 * @returns {Object} { totalVectors, masteredCount, dueCount, byStatus }
 */
export function getMasteryOverview(cards, masteryState) {
  let totalVectors = 0;
  let masteredCount = 0;
  let dueCount = 0;
  const byStatus = { '已掌握': 0, '正在学习': 0, '已遗忘': 0, '未知': 0 };

  const now = Date.now();
  cards.forEach(card => {
    const vectors = Object.keys(card.mastery || {});
    vectors.forEach(vec => {
      totalVectors++;

// --- 第 36 页 结束 ---

// 明医成长录 V1.0  —  第 37 页
      const m = masteryState[card.id]?.[vec] || card.mastery[vec];
      const status = m?.status || '未知';
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (status === '已掌握') masteredCount++;
      if ((m?.next_review || 0) <= now) dueCount++;
    });
  });

  return { totalVectors, masteredCount, dueCount, byStatus };
}

/**
 * 获取某类别（如太阳病篇）的向量覆盖度
 * @param {string} categoryKey - 如 "太阳病篇"
 * @param {Array} cards - 全部卡片
 * @param {Object} masteryState - 掌握度状态
 * @returns {Object} { categoryKey, coverage: [{ vector, label, total, mastered, learning, unknown }] }
 */
export function getCategoryCoverage(categoryKey, cards, masteryState) {
  const categoryCards = cards.filter(c => c.source_chapter === categoryKey);
  if (categoryCards.length === 0) return null;

  const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];
  const coverage = vectors.map(vec => {
    const entries = categoryCards.map(c => masteryState[c.id]?.[vec] || c.mastery?.[vec]).filter(Boolean);
    const mastered = entries.filter(m => m.status === '已掌握').length;
    const learning = entries.filter(m => m.status === '正在学习').length;
    const unknown = entries.filter(m => m.status === '未知').length;
    return {
      vector: vec,
      label: getVectorLabel(vec),
      total: entries.length,
      mastered,
      learning,
      unknown
    };
  });

  return { categoryKey, cardIds: categoryCards.map(c => c.id), coverage };
}

/**
 * 获取向量中文标签（本地实现，避免循环依赖）
 */
function getVectorLabel(type) {
  const labels = {
    '0→1': '方名→症状',
    '1→0': '症状→方名',
    '0→2': '方名→核心药组',
    '2→0': '核心药组→方名',

// --- 第 37 页 结束 ---

// 明医成长录 V1.0  —  第 38 页
    '0→contra': '方名→禁忌',
    '0→usage': '方名→煎服法'
  };
  return labels[type] || type;
}

/**
 * 挑选薄弱向量
 * @param {Array} wrongItems - 答错项 [{ type, typeLabel }]
 * @param {Object} categoryCoverage - 类别覆盖度
 * @param {number} limit - 最多返回几条
 * @returns {Array} [{ type, label, reason }]
 */
export function pickWeakVectors(wrongItems, categoryCoverage, limit = 4) {
  const weak = [];
  const add = (type, label, reason) => {
    if (!weak.some(w => w.type === type)) weak.push({ type, label, reason });
  };

  wrongItems.forEach(x => add(x.type, x.typeLabel, '本次答错'));

  if (categoryCoverage) {
    categoryCoverage.coverage.forEach(c => {
      if (weak.length >= limit) return;
      const ratio = c.total > 0 ? c.mastered / c.total : 0;
      if (ratio < 0.5) add(c.vector, c.label, '类别掌握度低');
    });
  }

  return weak.slice(0, limit);
}

// ========== services/RetrievalEngine.js ==========
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


// --- 第 38 页 结束 ---

// 明医成长录 V1.0  —  第 39 页
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

// --- 第 39 页 结束 ---

// 明医成长录 V1.0  —  第 40 页
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

// --- 第 40 页 结束 ---

// 明医成长录 V1.0  —  第 41 页
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

// --- 第 41 页 结束 ---

// 明医成长录 V1.0  —  第 42 页
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

// ========== services/StatsService.js ==========
/**
 * StatsService — 学习数据统计与归档
 * 职责：记录每次答题、维护卡片统计、每日日志、30天归档
 */

const STATS_KEY = 'sh_v9_stats';
const ARCHIVE_PREFIX = 'stats_';

/** 初始化空统计 */
function createEmptyStats() {
  return {
    answer_history: [],
    daily_log: {},

// --- 第 42 页 结束 ---

// 明医成长录 V1.0  —  第 43 页
    card_stats: {},
    last_archive_date: null
  };
}

/** 加载当前统计 */
export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[StatsService] 加载统计失败:', e);
  }
  return createEmptyStats();
}

/** 保存当前统计 */
export function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('[StatsService] 保存统计失败:', e);
  }
}

/** 记录一次答题 */
export function recordAnswerEvent(cardId, cardName, vector, vectorLabel, isCorrect, mode, selectedLabel = null) {
  const stats = loadStats();
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 1. 追加 answer_history
  stats.answer_history.push({
    timestamp: now,
    cardId,
    cardName,
    vector,
    vectorLabel,
    isCorrect,
    mode,
    selectedLabel
  });

  // 2. 更新 daily_log
  if (!stats.daily_log[today]) {
    stats.daily_log[today] = { cardIds: new Set(), totalQuestions: 0, right: 0, wrong: 0 };
  }
  const todayLog = stats.daily_log[today];
  todayLog.cardIds.add(cardId);
  todayLog.totalQuestions++;

// --- 第 43 页 结束 ---

// 明医成长录 V1.0  —  第 44 页
  if (isCorrect) todayLog.right++; else todayLog.wrong++;

  // 3. 更新 card_stats
  if (!stats.card_stats[cardId]) {
    stats.card_stats[cardId] = {
      cardName,
      totalAttempts: 0,
      totalErrors: 0,
      vectorErrors: {},
      optionChoices: {},
      lastError: null,
      consecutiveErrors: 0
    };
  }
  const cs = stats.card_stats[cardId];
  cs.totalAttempts++;
  if (!isCorrect) {
    cs.totalErrors++;
    cs.vectorErrors[vector] = (cs.vectorErrors[vector] || 0) + 1;
    cs.lastError = now;
    cs.consecutiveErrors++;
  } else {
    cs.consecutiveErrors = 0;
  }

  // 记录选项选择（用于后续分析选择模式）
  if (selectedLabel) {
    if (!cs.optionChoices[vector]) cs.optionChoices[vector] = {};
    cs.optionChoices[vector][selectedLabel] = (cs.optionChoices[vector][selectedLabel] || 0) + 1;
  }

  // 4. 清理超过30天的 answer_history
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  stats.answer_history = stats.answer_history.filter(h => new Date(h.timestamp) >= cutoff);

  // 5. 清理超过30天的 daily_log
  Object.keys(stats.daily_log).forEach(date => {
    if (new Date(date) < cutoff) delete stats.daily_log[date];
  });

  saveStats(stats);
}

/** 获取今日统计 */
export function getTodayStats() {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];
  const log = stats.daily_log[today];
  if (!log) return { total: 0, right: 0, wrong: 0, cardCount: 0 };

// --- 第 44 页 结束 ---

// 明医成长录 V1.0  —  第 45 页
  return {
    total: log.totalQuestions,
    right: log.right,
    wrong: log.wrong,
    cardCount: log.cardIds.size || 0
  };
}

/** 获取卡片统计 */
export function getCardStats() {
  return loadStats().card_stats;
}

/** 获取错误率最高的卡片 */
export function getTopErrorCards(minAttempts = 3, limit = 5) {
  const stats = loadStats().card_stats;
  return Object.entries(stats)
    .filter(([_, cs]) => cs.totalAttempts >= minAttempts)
    .map(([id, cs]) => ({
      id,
      cardName: cs.cardName,
      totalAttempts: cs.totalAttempts,
      totalErrors: cs.totalErrors,
      errorRate: cs.totalErrors / cs.totalAttempts,
      consecutiveErrors: cs.consecutiveErrors,
      lastError: cs.lastError
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, limit);
}

/** 获取练习次数最多的卡片 */
export function getTopPracticeCards(limit = 5) {
  const stats = loadStats().card_stats;
  return Object.entries(stats)
    .map(([id, cs]) => ({
      id,
      cardName: cs.cardName,
      totalAttempts: cs.totalAttempts,
      errorRate: cs.totalErrors / Math.max(cs.totalAttempts, 1),
      lastError: cs.lastError
    }))
    .sort((a, b) => b.totalAttempts - a.totalAttempts)
    .slice(0, limit);
}

/** 获取最弱向量 */
export function getWeakVectors() {
  const stats = loadStats().card_stats;
  const vectorCounts = {};

// --- 第 45 页 结束 ---

// 明医成长录 V1.0  —  第 46 页
  Object.values(stats).forEach(cs => {
    Object.entries(cs.vectorErrors).forEach(([vec, count]) => {
      if (!vectorCounts[vec]) vectorCounts[vec] = { total: 0, cards: new Set() };
      vectorCounts[vec].total += count;
      vectorCounts[vec].cards.add(cs.cardName);
    });
  });
  return Object.entries(vectorCounts)
    .map(([vec, data]) => ({
      vector: vec,
      totalErrors: data.total,
      cardCount: data.cards.size
    }))
    .sort((a, b) => b.totalErrors - a.totalErrors)
    .slice(0, 5);
}

/** 生成复习建议 */
export function generateReviewSuggestions(cards) {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();

  const suggestions = [];

  Object.entries(stats.card_stats).forEach(([cardId, cs]) => {
    Object.entries(cs.vectorErrors).forEach(([vec, errorCount]) => {
      const attempts = cs.totalAttempts;
      const errorRate = errorCount / Math.max(attempts, 1);

      // 只考虑累计答题 >= 3 次的
      if (attempts < 3) return;

      // 计算时间衰减：距离上次错误的天数
      const lastErrorDays = cs.lastError
        ? Math.floor((now - new Date(cs.lastError).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const recencyPenalty = 1 / (1 + 0.1 * lastErrorDays);

      // 冷却期：今天错的降低优先级
      const isTodayError = cs.lastError && cs.lastError.startsWith(today);
      const cooldownFactor = isTodayError ? 0.5 : 1.0;

      // 连续错误加成
      const streakFactor = 1 + cs.consecutiveErrors * 0.3;

      const priority = errorRate * recencyPenalty * cooldownFactor * streakFactor;

      const card = cards.find(c => c.id === cardId);
      if (!card) return;

// --- 第 46 页 结束 ---

// 明医成长录 V1.0  —  第 47 页

      suggestions.push({
        cardId,
        cardName: card.name,
        vector: vec,
        vectorLabel: getVectorLabel(vec),
        errorRate,
        errorCount,
        attempts,
        lastErrorDays,
        consecutiveErrors: cs.consecutiveErrors,
        isTodayError,
        priority
      });
    });
  });

  // 按优先级排序
  suggestions.sort((a, b) => b.priority - a.priority);

  // 标记优先级等级
  return suggestions.map((s, idx) => ({
    ...s,
    level: idx < 3 ? 'high' : idx < 8 ? 'medium' : 'low'
  }));
}

function getVectorLabel(type) {
  const labels = {
    '0→1': '方名→症状',
    '1→0': '症状→方名',
    '0→2': '方名→核心药组',
    '2→0': '核心药组→方名',
    '0→contra': '方名→禁忌',
    '0→usage': '方名→煎服法'
  };
  return labels[type] || type;
}

/** 获取某卡片某向量的选项选择统计 */
export function getOptionStats(cardId, vector) {
  const stats = loadStats();
  const cs = stats.card_stats[cardId];
  if (!cs || !cs.optionChoices || !cs.optionChoices[vector]) return {};
  return cs.optionChoices[vector];
}

/** 归档超过30天的数据到 JSON 文件 */
export function archiveOldData() {
  // 注意：归档到文件需要后端支持，这里先提供接口

// --- 第 47 页 结束 ---

// 明医成长录 V1.0  —  第 48 页
  // 在浏览器环境中，可以导出为 JSON 文件供用户下载保存
  const stats = loadStats();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const oldRecords = stats.answer_history.filter(h => new Date(h.timestamp) < cutoff);
  const oldDaily = Object.entries(stats.daily_log).filter(([date]) => new Date(date) < cutoff);

  if (oldRecords.length === 0 && oldDaily.length === 0) return null;

  const archive = {
    archived_at: new Date().toISOString(),
    answer_history: oldRecords,
    daily_log: Object.fromEntries(oldDaily)
  };

  return archive;
}

// ========== services/StorageService.js ==========
/**
 * StorageService — localStorage 抽象层 + 数据迁移
 * 职责：读写用户学习进度，兼容旧版数据，支持导出/导入
 */

import { scheduleNextReview } from '@utils/formatters.js';

/** 旧版 localStorage 键名 */
const OLD_KEY = 'sh_index_v1_state';
/** 新版 localStorage 键名 */
const NEW_KEY = 'sh_v9_state';
/** 当前数据版本 */
const CURRENT_VERSION = 9;

/**
 * 读取旧版数据（兼容 v8）
 * @returns {Object|null} 旧版数据结构或 null
 */
function readOldData() {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[StorageService] 读取旧版数据失败:', e);
    return null;
  }
}

/**
 * 将旧版数据迁移到新版结构

// --- 第 48 页 结束 ---

// 明医成长录 V1.0  —  第 49 页
 * @param {Object} oldData
 * @returns {Object} 新版状态对象
 */
function migrateFromV8(oldData) {
  if (!oldData || !oldData.cards) return createInitialState();

  const state = createInitialState();
  state.stats = oldData.stats || state.stats;

  // 迁移掌握度数据：旧版以 cardId 为键，新版保持相同结构
  Object.entries(oldData.cards).forEach(([cardId, cardData]) => {
    if (cardData.mastery) {
      state.mastery[cardId] = {};
      Object.entries(cardData.mastery).forEach(([vec, m]) => {
        state.mastery[cardId][vec] = {
          level: m.level || 0,
          status: m.status || '未知',
          streak_right: m.streak_right || 0,
          streak_wrong: m.streak_wrong || 0,
          total_rights: m.total_rights || 0,
          total_wrongs: m.total_wrongs || 0,
          last_result: m.last_result || null,
          last_review: m.last_review || null,
          next_review: m.next_review || 0
        };
      });
    }
  });

  return state;
}

/**
 * 创建初始空状态
 * @returns {Object}
 */
function createInitialState() {
  return {
    version: CURRENT_VERSION,
    savedAt: Date.now(),
    stats: { total: 0, right: 0, wrong: 0 },
    mastery: {}
  };
}

/**
 * 加载用户状态（自动迁移旧版数据）
 * @returns {Object} 当前状态
 */
export function loadState() {

// --- 第 49 页 结束 ---

// 明医成长录 V1.0  —  第 50 页
  try {
    // 先尝试读取新版数据
    const newRaw = localStorage.getItem(NEW_KEY);
    if (newRaw) {
      const parsed = JSON.parse(newRaw);
      if (parsed.version === CURRENT_VERSION) {
        return parsed;
      }
    }

    // 无新版数据时，尝试迁移旧版
    const oldData = readOldData();
    if (oldData) {
      console.log('[StorageService] 检测到旧版数据，自动迁移中...');
      const migrated = migrateFromV8(oldData);
      saveState(migrated);
      return migrated;
    }

    return createInitialState();
  } catch (e) {
    console.warn('[StorageService] 加载状态失败:', e);
    return createInitialState();
  }
}

/**
 * 保存用户状态
 * @param {Object} state
 * @returns {boolean} 是否成功
 */
export function saveState(state) {
  try {
    const payload = {
      ...state,
      version: CURRENT_VERSION,
      savedAt: Date.now()
    };
    localStorage.setItem(NEW_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('[StorageService] 保存状态失败:', e);
    return false;
  }
}

/**
 * 导出用户状态为 JSON 字符串（用于手动备份）
 * @returns {string} JSON 字符串
 */

// --- 第 50 页 结束 ---

// 明医成长录 V1.0  —  第 51 页
export function exportState() {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

/**
 * 导入用户状态（从 JSON 字符串）
 * @param {string} jsonStr
 * @returns {boolean} 是否成功
 */
export function importState(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.mastery || !parsed.stats) {
      throw new Error('Invalid state format');
    }
    saveState(parsed);
    return true;
  } catch (e) {
    console.warn('[StorageService] 导入状态失败:', e);
    return false;
  }
}

/**
 * 获取某张卡片的掌握度
 * @param {string} cardId
 * @param {string} vector
 * @returns {Object|null}
 */
export function getMastery(cardId, vector) {
  const state = loadState();
  return state.mastery[cardId]?.[vector] || null;
}

/**
 * 更新掌握度并保存
 * @param {string} cardId
 * @param {string} vector
 * @param {boolean} isCorrect
 */
export function updateMastery(cardId, vector, isCorrect) {
  const state = loadState();
  if (!state.mastery[cardId]) state.mastery[cardId] = {};
  if (!state.mastery[cardId][vector]) {
    state.mastery[cardId][vector] = {
      level: 0, status: '未知', streak_right: 0, streak_wrong: 0,
      total_rights: 0, total_wrongs: 0, last_result: null, last_review: null, next_review: 0
    };
  }

// --- 第 51 页 结束 ---

// 明医成长录 V1.0  —  第 52 页

  const m = state.mastery[cardId][vector];
  if (isCorrect) {
    m.streak_right++;
    m.streak_wrong = 0;
    m.total_rights++;
    m.last_result = 'right';
    if (m.streak_right >= 3) {
      m.level = Math.min(5, m.level + 1);
      m.status = '已掌握';
      m.streak_right = 0;
    } else {
      m.status = '正在学习';
    }
  } else {
    m.streak_wrong++;
    m.streak_right = 0;
    m.total_wrongs++;
    m.last_result = 'wrong';
    if (m.streak_wrong >= 2) {
      m.level = Math.max(0, m.level - 1);
      m.status = m.level >= 3 ? '正在学习' : '已遗忘';
      m.streak_wrong = 0;
    }
  }
  m.last_review = new Date().toISOString();
  m.next_review = scheduleNextReview(m.level);

  saveState(state);
}

/**
 * 获取全局统计
 * @returns {{ total, right, wrong }}
 */
export function getStats() {
  const state = loadState();
  return state.stats;
}

/**
 * 更新全局统计
 * @param {boolean} isCorrect
 */
export function updateStats(isCorrect) {
  const state = loadState();
  state.stats.total++;
  if (isCorrect) state.stats.right++; else state.stats.wrong++;
  saveState(state);
}

// --- 第 52 页 结束 ---

// 明医成长录 V1.0  —  第 53 页

/** 今日统计 localStorage 键名 */
const TODAY_KEY = 'sh_v9_today_stats';
/** 错题本/学习笔记 localStorage 键名 */
const NOTES_KEY = 'sh_v9_notes';

/** 诊断标签映射（认知神经科学） */
export const DIAGNOSIS_TAGS = {
  'confusion':   { label: '🔀 类方混淆',    desc: '概念干扰 — 相似方剂的概念边界模糊' },
  'reverse':     { label: '↔️ 反向盲区',    desc: '提取通路不对称 — 正向记住但反向提取失败' },
  'gap':         { label: '🕳️ 知识缺口',    desc: '编码失败 — 从未真正理解该知识点' },
  'mistake':     { label: '🧠 决策失误',    desc: '执行控制失败 — 知道但做题时选错' }
};

/**
 * 获取诊断标签中文标签
 * @param {string} key — 标签键
 * @returns {string}
 */
export function getDiagnosisLabel(key) {
  return DIAGNOSIS_TAGS[key]?.label || key;
}

/**
 * 加载今日统计（如果日期不是今天则自动重置）
 * @returns {{ date: string, total: number, right: number, wrong: number }}
 */
export function loadTodayStats() {
  try {
    const raw = localStorage.getItem(TODAY_KEY);
    const today = new Date().toISOString().split('T')[0];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) return parsed;
    }
  } catch (e) {
    console.warn('[StorageService] 读取今日统计失败:', e);
  }
  return { date: new Date().toISOString().split('T')[0], total: 0, right: 0, wrong: 0, cardCount: 0 };
}

/**
 * 更新今日统计
 * @param {boolean} isCorrect
 */
export function updateTodayStats(isCorrect) {
  const stats = loadTodayStats();
  stats.total++;
  if (isCorrect) stats.right++; else stats.wrong++;
  try {

// --- 第 53 页 结束 ---

// 明医成长录 V1.0  —  第 54 页
    localStorage.setItem(TODAY_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('[StorageService] 保存今日统计失败:', e);
  }
}

/**
 * 获取今日统计
 * @returns {{ date: string, total: number, right: number, wrong: number }}
 */
export function getTodayStats() {
  return loadTodayStats();
}


/**
 * 加载学习笔记/错题本
 * @returns {Array} 笔记数组
 */
export function loadStudyNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw).notes || [];
  } catch (e) {
    console.warn('[StorageService] 加载笔记失败:', e);
    return [];
  }
}

/**
 * 保存学习笔记
 * @param {Object} data — 笔记数据
 * @returns {Object} 保存后的笔记对象
 */
export function saveStudyNote(data) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{"notes":[]}');
    const note = {
      id: data.id || 'note-' + Date.now(),
      timestamp: data.timestamp || new Date().toISOString(),
      cardId: data.cardId,
      cardName: data.cardName,
      vector: data.vector,
      vectorLabel: data.vectorLabel,
      diagnosis: data.diagnosis,
      diagnosisLabel: getDiagnosisLabel(data.diagnosis),
      question: data.question,
      selected: data.selected,
      correct: data.correct,

// --- 第 54 页 结束 ---

// 明医成长录 V1.0  —  第 55 页
      prompt: data.prompt,
      notes: data.notes,
      reviewSchedule: data.reviewSchedule || createReviewSchedule(new Date())
    };
    notes.notes.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return note;
  } catch (e) {
    console.warn('[StorageService] 保存笔记失败:', e);
    return null;
  }
}

/**
 * 更新学习笔记
 * @param {string} noteId — 笔记ID
 * @param {Object} updates — 更新字段
 * @returns {boolean}
 */
export function updateStudyNote(noteId, updates) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{"notes":[]}');
    const idx = notes.notes.findIndex(n => n.id === noteId);
    if (idx === -1) return false;
    notes.notes[idx] = { ...notes.notes[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.warn('[StorageService] 更新笔记失败:', e);
    return false;
  }
}

/**
 * 删除学习笔记
 * @param {string} noteId — 笔记ID
 * @returns {boolean}
 */
export function deleteStudyNote(noteId) {
  try {
    const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{"notes":[]}');
    notes.notes = notes.notes.filter(n => n.id !== noteId);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.warn('[StorageService] 删除笔记失败:', e);
    return false;
  }
}


// --- 第 55 页 结束 ---

// 明医成长录 V1.0  —  第 56 页
/**
 * 创建复习计划（间隔重复）
 * @param {Date} startDate — 开始日期
 * @returns {Array<number>} 复习时间戳数组
 */
function createReviewSchedule(startDate) {
  const intervals = [1, 3, 7, 14, 30]; // 天
  return intervals.map(days => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.getTime();
  });
}

/**
 * 获取今日待复习的笔记
 * @returns {Array}
 */
export function getDueStudyNotes() {
  const notes = loadStudyNotes();
  const now = Date.now();
  return notes.filter(note => {
    if (!note.reviewSchedule) return false;
    return note.reviewSchedule.some(t => t <= now);
  });
}

/**
 * 获取某张卡片的所有笔记
 * @param {string} cardId
 * @returns {Array}
 */
export function getStudyNotesByCard(cardId) {
  return loadStudyNotes().filter(n => n.cardId === cardId);
}

/**
 * 按诊断标签过滤笔记
 * @param {string} diagnosis — 标签键
 * @returns {Array}
 */
export function getStudyNotesByDiagnosis(diagnosis) {
  return loadStudyNotes().filter(n => n.diagnosis === diagnosis);
}

/**
 * 统计诊断标签分布
 * @returns {Object} { confusion: N, reverse: N, gap: N, mistake: N }
 */
export function getDiagnosisStats() {

// --- 第 56 页 结束 ---

// 明医成长录 V1.0  —  第 57 页
  const notes = loadStudyNotes();
  const stats = { confusion: 0, reverse: 0, gap: 0, mistake: 0 };
  notes.forEach(n => {
    if (stats[n.diagnosis] !== undefined) stats[n.diagnosis]++;
  });
  return stats;
}

// ========== utils/doseConverter.js ==========
/**
 * DoseConverter — 剂量换算工具
 * 职责：将《伤寒论》古方剂量转换为现代四档标准
 * 标准：教材(1两=3g) / 轻量(1两=6g) / 经方(1两=9g) / 原方(1两=15g)
 */

/** 中文数字映射 */
const CN_NUM_MAP = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '百': 100, '千': 1000, '半': 0.5
};

/** 特殊单位映射（无数字前缀） */
const SPECIAL_UNIT_MAP = {
  '方寸匕': { min: 1, max: 2.74, note: '草木1g/金石2.74g' },
  '半方寸匕': { min: 0.5, max: 1.5, note: '一刀圭=1.5g' },
  '一钱匕': { min: 1.5, max: 1.8, note: '一钱匕' },
  '圭': { min: 0.5, max: 0.5, note: '1圭=0.5g' },
  '撮': { min: 2, max: 2, note: '1撮=2g' },
  '一撮': { min: 2, max: 2, note: '1撮=2g' },
  '把': { min: 10, max: 15, note: '竹叶一把≈12g' },
  '一握': { min: 10, max: 15, note: '一握≈12g' },
  '如鸡子大': { min: 50, max: 60, note: '鸡蛋大小，约50-60g' }
};

/** 容量-重量密度映射（g/L） */
const VOLUME_WEIGHT_MAP = {
  '半夏': { perLiter: 130, note: '柯雪帆实测：130g/L' },
  '粳米': { perLiter: 60, note: '仝小林实测：60g/L' },
  '麻仁': { perLiter: 50, note: '柯雪帆实测：50g/L' },
  '赤小豆': { perLiter: 150, note: '仝小林实测：150g/L' },
  '麦冬': { perLiter: 108, note: '仝小林实测：108g/L' }
};

/** 单枚重量映射（g/枚） */
const PIECE_WEIGHT_MAP = {
  '杏仁': { min: 0.3, max: 0.5, note: '0.3-0.5g/枚' },
  '桃仁': { min: 0.3, max: 0.5, note: '0.3-0.5g/枚' },
  '大枣': { min: 3, max: 6, note: '3-6g/枚' },
  '乌梅': { min: 3, max: 6, note: '3-6g/枚' },
  '枳实': { min: 1, max: 2, note: '1-2g/枚' }

// --- 第 57 页 结束 ---

// 明医成长录 V1.0  —  第 58 页
};

/** 四档标准 */
const STANDARDS = {
  modern: { name: '教材', liang: 3 },
  light: { name: '轻量', liang: 6 },
  medium: { name: '经方', liang: 9 },
  full: { name: '原方', liang: 15 }
};

/**
 * 解析中文数字
 * @param {string} str
 * @returns {number|null}
 */
function parseChineseNum(str) {
  if (!str) return null;
  if (str === '半') return 0.5;
  let result = 0, current = 0;
  for (let i = 0; i < str.length; i++) {
    const v = CN_NUM_MAP[str[i]];
    if (v === undefined) continue;
    if (v < 10) { current = v; }
    else {
      if (current === 0) current = 1;
      current *= v;
      result += current;
      current = 0;
    }
  }
  result += current;
  return result;
}

/**
 * 解析剂量字符串
 * @param {string} dosage
 * @returns {{num:number, unit:string, note:string}|null}
 */
function parseChineseDosage(dosage) {
  if (!dosage) return null;
  if (dosage.startsWith('半')) {
    const rest = dosage.slice(1);
    const m = rest.match(/^([^（(]*)/);
    return { num: 0.5, unit: m ? m[1] : rest, note: '' };
  }
  let numStr = '';
  for (let c of dosage) {
    if (CN_NUM_MAP[c] !== undefined) numStr += c;
    else break;

// --- 第 58 页 结束 ---

// 明医成长录 V1.0  —  第 59 页
  }
  if (!numStr) return null;
  const num = parseChineseNum(numStr);
  const rest = dosage.slice(numStr.length);
  const m = rest.match(/^([^（(]*)([（(].*)?$/);
  const unit = m ? m[1] : rest;
  const note = m && m[2] ? m[2] : '';
  return { num, unit, note };
}

/** 格式化输出 */
const fmt = (n) => n.toFixed(1).replace(/\.0$/, '') + 'g';
const fmtMl = (n) => n.toFixed(0) + 'ml';
const fmtRange = (a, b) => {
  const min = a.toFixed(1).replace(/\.0$/, '');
  const max = b.toFixed(1).replace(/\.0$/, '');
  return min === max ? min + 'g' : min + '~' + max + 'g';
};

/**
 * 转换剂量为四档标准
 * @param {string} herbName — 药名
 * @param {string} dosage — 剂量原文（如"三两"）
 * @returns {{original:string, modern:string, light:string, medium:string, full:string, unit:string, type:string, note:string}|null}
 */
export function convertDosage(herbName, dosage) {
  if (!dosage) return null;

  // 先检查特殊单位
  if (SPECIAL_UNIT_MAP[dosage]) {
    const s = SPECIAL_UNIT_MAP[dosage];
    return {
      original: dosage,
      modern: fmtRange(s.min, s.max),
      light: fmtRange(s.min, s.max),
      medium: fmtRange(s.min, s.max),
      full: fmtRange(s.min, s.max),
      unit: dosage, type: 'special', note: s.note
    };
  }

  const parsed = parseChineseDosage(dosage);
  if (!parsed) return null;
  const { num, unit, note: rawNote } = parsed;
  const baseNote = rawNote || '';

  // 重量单位
  if (unit === '两') {
    return { original: dosage, modern: fmt(num * 3), light: fmt(num * 6), medium: fmt(num * 9), full: fmt(num * 15), unit, type: 'weight', note: baseNote };
  }

// --- 第 59 页 结束 ---

// 明医成长录 V1.0  —  第 60 页
  if (unit === '钱') {
    return { original: dosage, modern: fmt(num * 0.3), light: fmt(num * 0.6), medium: fmt(num * 0.9), full: fmt(num * 1.5), unit, type: 'weight', note: baseNote };
  }
  if (unit === '斤') {
    const liang = num * 16;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 1斤=16两' };
  }
  if (unit === '分') {
    const liang = num * 0.025;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 1两=40分' };
  }
  if (unit === '两半') {
    const liang = num + 0.5;
    return { original: dosage, modern: fmt(liang * 3), light: fmt(liang * 6), medium: fmt(liang * 9), full: fmt(liang * 15), unit, type: 'weight', note: baseNote + ' 一两半=1.5两' };
  }

  // 容量单位
  if (unit === '升') {
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(num * density.perLiter), light: fmt(num * density.perLiter), medium: fmt(num * density.perLiter), full: fmt(num * density.perLiter), unit, type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(num * 200), light: fmtMl(num * 200), medium: fmtMl(num * 200), full: fmtMl(num * 200), unit, type: 'volume', note: baseNote };
  }
  if (unit === '合') {
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(num * density.perLiter / 10), light: fmt(num * density.perLiter / 10), medium: fmt(num * density.perLiter / 10), full: fmt(num * density.perLiter / 10), unit, type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(num * 20), light: fmtMl(num * 20), medium: fmtMl(num * 20), full: fmtMl(num * 20), unit, type: 'volume', note: baseNote };
  }
  if (unit === '合半') {
    const total = num + 0.5;
    const density = herbName && VOLUME_WEIGHT_MAP[herbName];
    if (density) {
      return { original: dosage, modern: fmt(total * density.perLiter / 10), light: fmt(total * density.perLiter / 10), medium: fmt(total * density.perLiter / 10), full: fmt(total * density.perLiter / 10), unit: '合', type: 'special', note: baseNote + (density.note ? ' ' + density.note : '') };
    }
    return { original: dosage, modern: fmtMl(total * 20), light: fmtMl(total * 20), medium: fmtMl(total * 20), full: fmtMl(total * 20), unit: '合', type: 'volume', note: baseNote };
  }

  // 计数单位
  if (unit === '枚' || unit === '个') {
    const weight = herbName && PIECE_WEIGHT_MAP[herbName];
    if (weight) {
      return { original: dosage, modern: fmtRange(num * weight.min, num * weight.max), light: fmtRange(num * weight.min, num * weight.max), medium: fmtRange(num * weight.min, num * weight.max), full: fmtRange(num * weight.min, num * weight.max), unit, type: 'special', note: baseNote + (weight.note ? ' ' + weight.note : '') };
    }
    return { original: dosage, modern: null, light: null, medium: null, full: null, unit, type: 'count', note: baseNote };
  }

  // 铢单位

// --- 第 60 页 结束 ---

