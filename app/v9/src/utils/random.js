/**
 * 随机工具集
 * 纯函数，可测试
 */

/**
 * Fisher-Yates 洗牌算法
 * 原地打乱数组，返回打乱后的数组（不修改原数组）
 * @param {Array} arr
 * @returns {Array} 新数组
 */
export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 从数组中随机抽取 N 个元素
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
export function pickRandom(arr, n) {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/**
 * 生成 0 到 max-1 的随机整数
 * @param {number} max
 * @returns {number}
 */
export function randomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * 按掌握度排序（弱项优先）
 * 排序规则：level 低的在前 → next_review 早的在前
 * @param {Array} items - { card, vector, mastery, due }
 * @returns {Array} 排序后的新数组
 */
export function sortByWeakness(items) {
  return [...items].sort((a, b) => {
    const levelDiff = (a.mastery?.level || 0) - (b.mastery?.level || 0);
    if (levelDiff !== 0) return levelDiff;
    return (a.mastery?.next_review || 0) - (b.mastery?.next_review || 0);
  });
}
