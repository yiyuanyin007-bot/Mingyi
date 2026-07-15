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

  // 2. 更新 daily_log（用数组模拟 Set，因为 JSON 序列化会丢失 Set 原型）
  if (!stats.daily_log[today]) {
    stats.daily_log[today] = { cardIds: [], totalQuestions: 0, right: 0, wrong: 0 };
  }
  const todayLog = stats.daily_log[today];
  if (!Array.isArray(todayLog.cardIds)) {
    todayLog.cardIds = [];
  }
  if (!todayLog.cardIds.includes(cardId)) {
    todayLog.cardIds.push(cardId);
  }
  todayLog.totalQuestions++;
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
  return {
    total: log.totalQuestions,
    right: log.right,
    wrong: log.wrong,
    cardCount: (Array.isArray(log.cardIds) ? log.cardIds.length : log.cardIds.size || 0)
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
  Object.values(stats).forEach(cs => {
    Object.entries(cs.vectorErrors).forEach(([vec, count]) => {
      if (!vectorCounts[vec]) vectorCounts[vec] = { total: 0, cards: [] };
      vectorCounts[vec].total += count;
      if (!vectorCounts[vec].cards.includes(cs.cardName)) {
        vectorCounts[vec].cards.push(cs.cardName);
      }
    });
  });
  return Object.entries(vectorCounts)
    .map(([vec, data]) => ({
      vector: vec,
      totalErrors: data.total,
      cardCount: data.cards.length
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
