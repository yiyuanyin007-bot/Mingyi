/**
 * ClinicalService — 临床录入数据服务层
 * 职责：症状解析、方剂匹配、十问歌评估、档案 CRUD
 * 参考源：app/index.html 行 7690-8289 (V8 临床录入系统)
 */

import { loadData } from '@services/DataService.js';
import { createNote } from '@services/NoteService.js';

/** 数据缓存 */
let _symptomIndex = null;
let _formulaCards = null;
let _articleMap = null;
let _loaded = false;

/** 档案 localStorage 键名（与 V8 兼容） */
const CL_KEY = 'clinical_records_v1';

// ──────────────────────────────────────────────
// 数据加载
// ──────────────────────────────────────────────

/**
 * 加载临床所需参考数据
 * @returns {Promise<void>}
 */
export async function loadClinicalData() {
  if (_loaded) return;
  const [si, fc, am] = await Promise.all([
    loadData('symptomIndex').catch(async () => {
      const res = await fetch('/data/symptom_expression_index.json');
      return res.ok ? res.json() : null;
    }),
    loadData('cards'),
    loadData('articleMap').catch(async () => {
      const res = await fetch('/data/source_article_map.json');
      return res.ok ? res.json() : null;
    })
  ]);
  _symptomIndex = si;
  _formulaCards = fc;
  _articleMap = am;
  _loaded = true;
}

/**
 * 获取当前加载的方剂卡片列表
 * @returns {Array|null}
 */
export function getFormulaCards() {
  return _formulaCards;
}

/**
 * 获取症状索引
 * @returns {Object|null}
 */
export function getSymptomIndex() {
  return _symptomIndex;
}

// ──────────────────────────────────────────────
// 症状解析引擎
// ──────────────────────────────────────────────

/** 脉象模式列表 */
const PULSE_PATTERNS = [
  '浮缓', '浮紧', '浮数', '沉细', '沉紧',
  '迟', '数', '滑', '涩', '弦', '弱', '虚', '实', '洪', '微'
];

/** 直接关键词映射 */
const DIRECT_KEYWORDS = {
  '汗出': ['汗出', '出汗', '有汗', '自汗', '盗汗'],
  '无汗': ['无汗', '不出汗', '没汗', '皮肤干燥'],
  '恶风': ['恶风', '怕风', '畏风', '风吹难受'],
  '恶寒': ['恶寒', '怕冷', '畏寒', '寒战'],
  '头痛': ['头痛', '头疼', '头胀'],
  '身痛': ['身痛', '身体疼痛', '周身疼痛', '全身酸痛'],
  '发热': ['发热', '发烧', '身热', '潮热'],
  '口渴': ['口渴', '口干', '想喝水', '渴欲饮水'],
  '不渴': ['不渴', '口不渴', '不想喝水'],
  '呕吐': ['呕吐', '吐', '恶心', '干呕'],
  '下利': ['下利', '腹泻', '拉肚子', '便溏'],
  '便秘': ['便秘', '大便难', '几日未行'],
  '喘': ['喘', '气喘', '呼吸急促'],
  '胸胁苦满': ['胸胁', '胁下', '两胁'],
  '心烦': ['心烦', '烦躁', '心中烦'],
  '但欲寐': ['但欲寐', '只想睡', '昏昏欲睡'],
  '四肢厥逆': ['四肢冷', '手足冷', '手脚冰凉', '厥冷']
};

/**
 * 从文本中解析症状
 * @param {string} text - 患者症状文本（如 IMA 粘贴）
 * @returns {{ std: string[], quotes: string[], conf: Object<string, number> }}
 */
export function parseText(text) {
  const std = [];
  const quotes = [];
  const conf = {};
  const seen = new Set();

  if (!text) return { std, quotes, conf };

  // 1. 从 symptom_expression_index 匹配标准症状
  if (_symptomIndex && _symptomIndex.symptoms) {
    Object.entries(_symptomIndex.symptoms).forEach(([sym, info]) => {
      if (info.expressions) {
        info.expressions.forEach(expr => {
          if (text.includes(expr) && !seen.has(sym)) {
            seen.add(sym);
            std.push(sym);
            quotes.push(expr);
            conf[sym] = 0.95;
          }
        });
      }
    });
  }

  // 2. 脉象匹配
  PULSE_PATTERNS.forEach(p => {
    const sym = '脉' + p;
    if (text.includes(p) && !seen.has(sym)) {
      seen.add(sym);
      std.push(sym);
      conf[sym] = 0.9;
    }
  });

  // 3. 直接关键词匹配
  Object.entries(DIRECT_KEYWORDS).forEach(([sym, keywords]) => {
    if (!seen.has(sym)) {
      for (const kw of keywords) {
        if (text.includes(kw)) {
          seen.add(sym);
          std.push(sym);
          quotes.push(kw);
          conf[sym] = 0.9;
          break;
        }
      }
    }
  });

  return { std, quotes, conf };
}

// ──────────────────────────────────────────────
// 方剂匹配引擎
// ──────────────────────────────────────────────

/**
 * 基于症状特征向量，匹配最相关的方剂
 * @param {string[]} symptomVector - 已解析的标准症状列表
 * @param {Object} [options] - 匹配选项
 * @param {number} [options.topN=5] - 返回前 N 个结果
 * @param {number} [options.minNecessaryRate=0.5] - 必要症状最低匹配率
 * @returns {Array<Object>} 排序后的匹配结果
 */
export function matchFormulas(symptomVector, options = {}) {
  const { topN = 5, minNecessaryRate = 0.5 } = options;
  if (!_formulaCards || !Array.isArray(_formulaCards)) return [];
  if (!symptomVector || symptomVector.length === 0) return [];

  const results = [];

  _formulaCards.forEach(card => {
    const profile = card.data?.canonical?.symptom_profile;
    if (!profile) return;

    const necessary = profile.necessary || [];
    const common = profile.common || [];
    const excluding = profile.excluding || [];

    // 必要症状匹配率
    const necessaryMatch = necessary.filter(s => symptomVector.includes(s));
    const necessaryRate = necessary.length > 0 ? necessaryMatch.length / necessary.length : 1;
    if (necessaryRate < minNecessaryRate) return;

    // 禁忌症状命中
    const excludingHit = excluding.filter(s => symptomVector.includes(s));
    const disqualified = excludingHit.length > 0;

    // 常见症状匹配
    const commonMatch = common.filter(s => symptomVector.includes(s));

    // 评分：必要症状每个 3 分，常见症状每个 1 分
    let score = necessaryMatch.length * 3 + commonMatch.length * 1;

    // 文章关联加分（如果有文章 symptom_pool 匹配）
    let articleBoost = 0;
    let articleId = null;
    if (_articleMap && Array.isArray(_articleMap)) {
      _articleMap.forEach(art => {
        if (art.formulas && art.formulas.includes(card.id) && art.symptom_pool) {
          const overlap = art.symptom_pool.filter(s => symptomVector.includes(s));
          const overlapRate = overlap.length / art.symptom_pool.length;
          if (overlapRate > 0.5) {
            articleBoost = 2;
            articleId = art.id;
          }
        }
      });
    }
    score += articleBoost;
    if (disqualified) score -= 5;

    results.push({
      formula_id: card.id,
      formula_name: card.formula_name || card.name,
      score,
      necessary_match: necessaryMatch,
      necessary_miss: necessary.filter(s => !symptomVector.includes(s)),
      common_match: commonMatch,
      common_miss: common.filter(s => !symptomVector.includes(s)),
      excluding_hit: excludingHit,
      disqualified,
      article_boost: articleBoost,
      article_id: articleId,
      herbs: card.data?.canonical?.herbs || [],
      contraindications: card.data?.canonical?.contraindications || [],
      usage: card.data?.canonical?.usage || '',
      pathology: card.data?.canonical?.pathology || '',
      formula_name_cn: card.name || card.formula_name
    });
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

// ──────────────────────────────────────────────
// 十问歌评估引擎
// ──────────────────────────────────────────────

/** 十问歌维度定义 */
const TEN_QUESTIONS = [
  { id: 'cold_heat',      label: '寒热',     keywords: ['发热', '恶寒', '恶风', '潮热', '五心烦热', '畏寒', '寒热往来'] },
  { id: 'sweat',          label: '汗',       keywords: ['汗出', '无汗', '自汗', '盗汗'] },
  { id: 'head_body',      label: '头身',     keywords: ['头痛', '身痛', '胸胁', '胁下', '胸胁苦满', '腰痛', '关节'] },
  { id: 'chest_abdomen',  label: '胸腹',     keywords: ['胸满', '胁满', '腹胀', '腹痛', '心下', '痞', '少腹'] },
  { id: 'diet_taste',     label: '饮食口味', keywords: ['口渴', '不渴', '口干', '口苦', '纳呆', '纳差', '呕吐', '恶心'] },
  { id: 'stool',          label: '二便',     keywords: ['下利', '便秘', '大便', '小便', '腹泻', '便溏'] },
  { id: 'sleep',          label: '睡眠',     keywords: ['心烦', '失眠', '但欲寐', '不得眠', '烦躁'] },
  { id: 'ear_nose',       label: '耳鼻',     keywords: ['耳鸣', '耳聋', '鼻塞', '流涕'] },
  { id: 'thirst_drink',   label: '口渴饮',   keywords: ['口渴', '渴欲', '饮水', '不渴'] },
  { id: 'pulse_tongue',   label: '脉舌',     keywords: ['脉', '舌', '苔'] }
];

/**
 * 评估信息采集完整性（十问歌维度）
 * @param {string[]} symptomVector - 已解析的症状列表
 * @returns {{ dimensions: Array<{id: string, label: string, covered: boolean, matched: string[]}>, total: number, covered: number, rate: number, stars: number }}
 */
export function evaluateCollection(symptomVector) {
  const sv = symptomVector || [];
  const dimensions = TEN_QUESTIONS.map(dim => {
    const matched = dim.keywords.filter(kw =>
      sv.some(s => s.includes(kw) || kw.includes(s))
    );
    return {
      id: dim.id,
      label: dim.label,
      covered: matched.length > 0,
      matched
    };
  });

  const covered = dimensions.filter(d => d.covered).length;
  const total = dimensions.length;
  const rate = total > 0 ? covered / total : 0;

  // ⭐ 评级法
  let stars = 0;
  if (rate >= 0.8) stars = 5;
  else if (rate >= 0.6) stars = 4;
  else if (rate >= 0.4) stars = 3;
  else if (rate >= 0.2) stars = 2;
  else if (rate > 0) stars = 1;

  return { dimensions, total, covered, rate, stars };
}

// ──────────────────────────────────────────────
// 档案 CRUD（与 V8 clinical_records_v1 兼容）
// ──────────────────────────────────────────────

/**
 * 加载所有就诊档案
 * @returns {Array}
 */
export function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(CL_KEY) || '[]');
  } catch (e) {
    console.warn('[ClinicalService] 加载档案失败:', e);
    return [];
  }
}

/**
 * 保存所有就诊档案
 * @param {Array} records - 档案数组
 */
export function saveRecords(records) {
  try {
    localStorage.setItem(CL_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('[ClinicalService] 保存档案失败:', e);
  }
}

/**
 * 生成档案 ID（P-YYYYMMDD-HHMMSS-NNN）
 * @returns {string}
 */
export function generateRecordId() {
  const now = new Date();
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const t = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const records = loadRecords();
  const seq = String(records.filter(r => r.id && r.id.startsWith('P-' + d)).length + 1).padStart(3, '0');
  return 'P-' + d + '-' + t + '-' + seq;
}

/**
 * 创建新就诊档案
 * @param {Object} data - 就诊数据
 * @param {string} data.inputText - 原始输入文本
 * @param {string[]} data.symptoms - 解析后的症状列表
 * @param {Array} data.matchResults - 方剂匹配结果
 * @param {Object} data.collectionEval - 十问歌评估结果
 * @param {string} [data.patientName] - 患者姓名（默认"匿名"）
 * @param {string} [data.relatedPersonId] - 关联的患者档案 ID
 * @returns {Object} 新创建的档案
 */
export function createRecord(data) {
  const records = loadRecords();
  const record = {
    id: generateRecordId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    patientName: data.patientName || '匿名',
    relatedPersonId: data.relatedPersonId || null,
    inputText: data.inputText || '',
    symptoms: data.symptoms || [],
    symptomQuotes: data.symptomQuotes || [],
    matchResults: data.matchResults || [],
    collectionEval: data.collectionEval || null,
    note: data.note || '',
    // 与 V8 数据结构兼容
    _v8_compat: true
  };
  records.push(record);
  saveRecords(records);

  // 同步创建笔记（统一笔记存储）
  try {
    const topMatch = (data.matchResults && data.matchResults.length > 0)
      ? `${data.matchResults[0].formula_name_cn || data.matchResults[0].formula_name} (${data.matchResults[0].score}分)`
      : '无匹配';
    const symptomSummary = (data.symptoms || []).slice(0, 10).join('、') + ((data.symptoms || []).length > 10 ? '…' : '');
    const noteContent = [
      `**患者**: ${data.patientName || '匿名'}`,
      `**时间**: ${record.createdAt}`,
      `**症状**: ${symptomSummary || '无'}`,
      `**首选方**: ${topMatch}`,
      `**十问歌采集**: ${data.collectionEval ? `${data.collectionEval.covered}/${data.collectionEval.total} 维度` : '未评估'}`,
      data.note ? `\n**笔记**: ${data.note}` : ''
    ].filter(Boolean).join('\n');

    createNote({
      type: 'clinical',
      cardId: data.relatedPersonId || record.id,
      content: noteContent,
      tags: ['临床记录', data.patientName || '匿名']
    }, {
      recordId: record.id,
      patientName: data.patientName || '匿名'
    });
  } catch (e) {
    console.warn('[ClinicalService] 同步笔记失败:', e);
    // 不影响主流程
  }

  return record;
}

/**
 * 获取单个档案
 * @param {string} id - 档案 ID
 * @returns {Object|null}
 */
export function getRecord(id) {
  const records = loadRecords();
  return records.find(r => r.id === id) || null;
}

/**
 * 更新档案
 * @param {string} id - 档案 ID
 * @param {Object} updates - 要更新的字段
 * @returns {boolean}
 */
export function updateRecord(id, updates) {
  const records = loadRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
  saveRecords(records);
  return true;
}

/**
 * 删除档案
 * @param {string} id - 档案 ID
 * @returns {boolean}
 */
export function deleteRecord(id) {
  const records = loadRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return false;
  records.splice(idx, 1);
  saveRecords(records);
  return true;
}

/**
 * 关联档案到同一人
 * @param {string} recordId - 档案 ID
 * @param {string} personId - 患者 ID
 * @returns {boolean}
 */
export function linkRecordToPerson(recordId, personId) {
  return updateRecord(recordId, { relatedPersonId: personId });
}

/**
 * 获取某人的所有档案
 * @param {string} personId - 患者 ID
 * @returns {Array}
 */
export function getRecordsByPerson(personId) {
  return loadRecords().filter(r => r.relatedPersonId === personId);
}

/**
 * 粘合函数（兼容 V8 clInit 调用约定）
 * 供 ClinicalView 初始化时调用
 * @returns {Promise<{ records: Array }>}
 */
export async function initClinical() {
  await loadClinicalData();
  const records = loadRecords();
  return { records };
}
