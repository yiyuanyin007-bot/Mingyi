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
