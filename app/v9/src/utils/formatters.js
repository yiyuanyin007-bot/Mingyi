/**
 * 格式转换工具集
 * 纯函数，无状态依赖，无副作用
 */

/** 向量标签映射（6 向量） */
export const VECTOR_LABELS = {
  '0→1': '方名→症状',
  '1→0': '症状→方名',
  '0→2': '方名→核心药组',
  '2→0': '核心药组→方名',
  '0→contra': '方名→禁忌',
  '0→usage': '方名→煎服法'
};

/**
 * 获取向量中文标签
 * @param {string} type - 向量类型标识
 * @returns {string} 中文标签
 */
export function getVectorLabel(type) {
  return VECTOR_LABELS[type] || type;
}

/**
 * 将卡片 slug（如 gui-zhi-tang）转换为显示名称
 * @param {string} slug - 卡片 ID
 * @param {Array} cards - 卡片数组（数据源）
 * @returns {string} 显示名称，找不到时返回 slug 本身
 */
export function slugToName(slug, cards = []) {
  const card = cards.find(c => c.id === slug);
  return card ? card.name : slug;
}

/**
 * 格式化正确答案用于显示
 * 1→0 / 2→0 题型的 correct 是 slug，需要转换；其他题型直接显示
 * @param {Object} q - 题目对象
 * @param {Array} cards - 卡片数组（数据源）
 * @returns {string} 格式化后的正确答案文本
 */
export function formatCorrectAnswer(q, cards = []) {
  if (!q || !q.correct) return '';
  if (q.type === '1→0' || q.type === '2→0') {
    return slugToName(q.correct, cards);
  }
  return Array.isArray(q.correct) ? q.correct.join('、') : q.correct;
}

/**
 * 获取卡片的核心药物组合
 * 优先读取 canonical.core_combinations，否则退回到首药
 * @param {Object} card - 卡片对象
 * @returns {string} 核心药组字符串
 */
export function getCoreCombo(card) {
  if (!card || !card.data || !card.data.canonical) return '无';
  const c = card.data.canonical;
  if (c.core_combinations) return c.core_combinations;
  if (c.herbs && c.herbs.length > 0) return c.herbs[0].name;
  return '无';
}

/**
 * 统一计算某题型下某卡片的选项标签
 * @param {Object} card - 卡片对象
 * @param {string} type - 题型类型
 * @returns {string} 选项标签
 */
export function getOptionLabel(card, type) {
  if (!card || !card.data || !card.data.canonical) return '无';
  const canonical = card.data.canonical;
  const profile = canonical.symptom_profile || {};

  if (type === '0→1') {
    return (profile.necessary || []).join('、') || '无';
  }
  if (type === '1→0' || type === '2→0') {
    return card.name;
  }
  if (type === '0→2') {
    return getCoreCombo(card);
  }
  if (type === '0→contra') {
    return (canonical.contraindications || [])[0] || '无';
  }
  if (type === '0→usage') {
    return canonical.usage || '无';
  }
  return '无';
}

/**
 * SRS 调度：根据掌握度等级计算下次复习时间
 * @param {number} level - 掌握度等级（0–5）
 * @returns {number} 下次复习时间戳（ms）
 */
export const SRS_INTERVALS = [1, 2, 4, 7, 14, 30];

export function scheduleNextReview(level) {
  const days = SRS_INTERVALS[Math.min(level, SRS_INTERVALS.length - 1)] || 1;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

/**
 * 日期格式化（ISO 8601）
 * @returns {string} 当前时间 ISO 字符串
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * 格式化笔记时间戳为显示文本
 * 支持 ISO 字符串 和 Unix 时间戳（毫秒）两种格式
 * @param {string|number} dateInput - ISO 字符串或 Unix 时间戳
 * @returns {string} 格式化的日期文本（如 '7月14日 15:30'）
 */
export function formatDate(dateInput) {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hours}:${mins}`;
  } catch (e) {
    return String(dateInput);
  }
}
