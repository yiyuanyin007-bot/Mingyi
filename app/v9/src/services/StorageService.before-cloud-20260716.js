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
  const notes = loadStudyNotes();
  const stats = { confusion: 0, reverse: 0, gap: 0, mistake: 0 };
  notes.forEach(n => {
    if (stats[n.diagnosis] !== undefined) stats[n.diagnosis]++;
  });
  return stats;
}
