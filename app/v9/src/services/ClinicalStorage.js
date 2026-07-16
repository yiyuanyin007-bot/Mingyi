/**
 * ClinicalStorage — 临床录入持久化层
 * 职责：档案 + 患者数据的 localStorage 操作，导出/导入，API 风格统一
 * 键名与 V8 兼容：clinical_records_v1
 */

// ──────────────────────────────────────────────
// 键名常量
// ──────────────────────────────────────────────

const STORAGE_KEYS = {
  records: 'clinical_records_v1',
  currentPerson: 'sh_current_person_id',
  template: 'sh_clinical_template'
};

// ──────────────────────────────────────────────
// 档案 CRUD
// ──────────────────────────────────────────────

/**
 * 获取全部档案
 * @returns {Array}
 */
export function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.records) || '[]');
  } catch {
    console.warn('[ClinicalStorage] 读取失败，返回空数组');
    return [];
  }
}

/**
 * 保存全部档案（全量覆盖）
 * @param {Array} records
 */
export function setAll(records) {
  try {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  } catch (e) {
    console.warn('[ClinicalStorage] 写入失败:', e?.message);
  }
}

/**
 * 按 ID 获取单条档案
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getById(id) {
  return getAll().find(r => r.id === id);
}

/**
 * 添加新档案
 * @param {Object} record
 * @returns {Object} 添加后的档案
 */
export function add(record) {
  const records = getAll();
  records.push(record);
  setAll(records);
  return record;
}

/**
 * 更新档案
 * @param {string} id
 * @param {Object} updates
 * @returns {boolean}
 */
export function update(id, updates) {
  const records = getAll();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
  setAll(records);
  return true;
}

/**
 * 删除档案
 * @param {string} id
 * @returns {boolean}
 */
export function remove(id) {
  const records = getAll();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  setAll(records);
  return true;
}

/**
 * 获取最近 N 条档案（按创建时间降序）
 * @param {number} [n=50]
 * @returns {Array}
 */
export function getRecent(n = 50) {
  return getAll()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, n);
}

/**
 * 搜索档案（按患者姓名或症状模糊匹配）
 * @param {string} query
 * @returns {Array}
 */
export function search(query) {
  if (!query || query.trim() === '') return getRecent(50);
  const q = query.toLowerCase();
  return getAll().filter(r =>
    (r.patientName && r.patientName.includes(q)) ||
    (r.symptoms && r.symptoms.some(s => s.includes(q))) ||
    (r.inputText && r.inputText.toLowerCase().includes(q)) ||
    (r.note && r.note.toLowerCase().includes(q))
  ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

/**
 * 按患者关联 ID 获取档案
 * @param {string} personId
 * @returns {Array}
 */
export function getByPerson(personId) {
  return getAll()
    .filter(r => r.relatedPersonId === personId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

// ──────────────────────────────────────────────
// 模版管理
// ──────────────────────────────────────────────

/**
 * 保存临床录入模板
 * @param {Object} template
 */
export function saveTemplate(template) {
  try {
    localStorage.setItem(STORAGE_KEYS.template, JSON.stringify(template));
  } catch (e) {
    console.warn('[ClinicalStorage] 模板保存失败:', e?.message);
  }
}

/**
 * 加载临床录入模板
 * @returns {Object|null}
 */
export function loadTemplate() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.template);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// 导出/导入
// ──────────────────────────────────────────────

/**
 * 导出全部档案为 JSON 字符串
 * @returns {string}
 */
export function exportRecords() {
  const records = getAll();
  const exportData = {
    version: 'v9-clinical-1',
    exportedAt: new Date().toISOString(),
    count: records.length,
    records
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * 导入档案（追加模式，跳过已存在的 ID）
 * @param {string} jsonStr - JSON 字符串
 * @returns {{ imported: number, skipped: number, errors: string[] }}
 */
export function importRecords(jsonStr) {
  const result = { imported: 0, skipped: 0, errors: [] };
  try {
    const data = JSON.parse(jsonStr);
    if (!data.records || !Array.isArray(data.records)) {
      result.errors.push('无效格式：缺少 records 数组');
      return result;
    }
    const existing = getAll();
    const existingIds = new Set(existing.map(r => r.id));
    data.records.forEach(r => {
      if (!r.id) {
        result.errors.push('跳过无 id 的记录');
        return;
      }
      if (existingIds.has(r.id)) {
        result.skipped++;
      } else {
        existing.push(r);
        existingIds.add(r.id);
        result.imported++;
      }
    });
    setAll(existing);
  } catch (e) {
    result.errors.push('JSON 解析错误: ' + (e?.message || ''));
  }
  return result;
}

// ──────────────────────────────────────────────
// 统计
// ──────────────────────────────────────────────

/**
 * 获取档案统计数据
 * @returns {{ total: number, byPatientName: Object, lastMonth: number, averageSymptoms: number }}
 */
export function getStats() {
  const records = getAll();
  const byPatientName = {};
  records.forEach(r => {
    const name = r.patientName || '匿名';
    byPatientName[name] = (byPatientName[name] || 0) + 1;
  });

  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const lastMonth = records.filter(r => new Date(r.createdAt || 0).getTime() > oneMonthAgo).length;

  const totalSymptoms = records.reduce((sum, r) => sum + (r.symptoms?.length || 0), 0);
  const averageSymptoms = records.length > 0 ? Math.round((totalSymptoms / records.length) * 10) / 10 : 0;

  return { total: records.length, byPatientName, lastMonth, averageSymptoms };
}
