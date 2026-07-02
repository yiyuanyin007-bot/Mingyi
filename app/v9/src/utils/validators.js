/**
 * 输入校验与数据验证工具集
 */

/**
 * 检查值是否为非空字符串
 * @param {*} val
 * @returns {boolean}
 */
export function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * 检查数组是否为非空数组
 * @param {*} arr
 * @returns {boolean}
 */
export function isNonEmptyArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * 校验选项是否唯一（用于去重检查）
 * @param {Array} options - 选项数组，每个选项应有 label 字段
 * @returns {boolean} true 表示全部唯一
 */
export function areOptionsUnique(options) {
  if (!Array.isArray(options)) return false;
  const labels = options.map(o => o.label);
  return labels.length === new Set(labels).size;
}

/**
 * 校验题目对象是否合法
 * @param {Object} q - 题目对象
 * @returns {boolean}
 */
export function isValidQuestion(q) {
  if (!q || typeof q !== 'object') return false;
  if (!isNonEmptyString(q.type)) return false;
  if (!isNonEmptyString(q.cardId)) return false;
  if (!isNonEmptyString(q.text)) return false;
  if (!isNonEmptyArray(q.options)) return false;
  if (!areOptionsUnique(q.options)) return false;
  return true;
}

/**
 * 校验掌握度字段结构
 * @param {Object} m
 * @returns {boolean}
 */
export function isValidMastery(m) {
  if (!m || typeof m !== 'object') return false;
  if (typeof m.level !== 'number') return false;
  if (!isNonEmptyString(m.status)) return false;
  return true;
}

/**
 * 简单 JSON schema 校验：检查卡片是否包含必要字段
 * @param {Object} card
 * @returns {Object} { valid: boolean, missing: string[] }
 */
export function validateCardSchema(card) {
  const required = ['id', 'type', 'name', 'formula_name', 'data'];
  const missing = required.filter(key => !(key in card));
  return { valid: missing.length === 0, missing };
}
