/**
 * NoteService — 统一笔记存储层
 * 职责：整合三个碎片化的笔记存储系统（sh_v9_notes / sh_v9_card_notes / source_notes_v1+source_article_notes_v1）
 *       为统一笔记模型，提供 CRUD、标签管理、按来源查询等功能。
 *
 * 【统一 Note Schema】
 * {
 *   id: 'note-{timestamp}',        // 唯一标识
 *   type: 'exam' | 'card' | 'source' | 'clinical',  // 来源类型
 *   cardId: string,                 // 关联方剂卡片ID（必填）
 *   sourceId: string | null,        // 关联具体条文ID（仅 type=source 时有值）
 *   content: string,                // Markdown 正文
 *   tags: string[],                 // 标签数组（核心标签自动打 + 用户自定义）
 *   createdAt: 'ISO',               // 创建时间
 *   updatedAt: 'ISO',               // 最后修改时间
 *   // exam-specific fields（仅 type=exam 时有值）
 *   vector: string | null,
 *   vectorLabel: string | null,
 *   diagnosis: string | null,
 *   diagnosisLabel: string | null,
 *   question: string | null,
 *   selected: string | null,
 *   correct: string | null,
 *   prompt: string | null,
 *   // source-specific fields（仅 type=source 时有值）
 *   sourceTitle: string | null,
 *   sourceChapter: string | null,
 *   sourceText: string | null,
 *   // review schedule（仅 type=exam 时有值）
 *   reviewSchedule: number[] | null
 * }
 */

/** localStorage 键名 */
const NOTES_KEY = 'sh_v9_unified_notes';

/** 诊断标签映射 */
const DIAGNOSIS_TAGS = {
  'confusion':   { label: '🔀 类方混淆',    desc: '概念干扰 — 相似方剂的概念边界模糊' },
  'reverse':     { label: '↔️ 反向盲区',    desc: '提取通路不对称 — 正向记住但反向提取失败' },
  'gap':         { label: '🕳️ 知识缺口',    desc: '编码失败 — 从未真正理解该知识点' },
  'mistake':     { label: '🧠 决策失误',    desc: '执行控制失败 — 知道但做题时选错' }
};

/**
 * 获取诊断标签中文标签
 * @param {string} key
 * @returns {string}
 */
export function getDiagnosisLabel(key) {
  return DIAGNOSIS_TAGS[key]?.label || key;
}

export { DIAGNOSIS_TAGS };

// ===== 底层存储 =====

function loadAllNotes() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[NoteService] 读取笔记失败:', e);
    return [];
  }
}

function saveAllNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.warn('[NoteService] 保存笔记失败:', e);
    return false;
  }
}

// ===== 迁移：将旧版数据合并到统一存储 =====

/**
 * 从旧版存储迁移数据到统一笔记模型
 * 幂等操作：只迁移尚未迁移的数据（检查旧键是否还存在数据）
 * 迁移后不清除旧键（兼容旧版回滚），但 NoteService 只读写新键。
 */
function migrateOldData() {
  let migrated = false;

  // 1. 从 sh_v9_notes（错题本笔记）迁移
  try {
    const oldNotesRaw = localStorage.getItem('sh_v9_notes');
    if (oldNotesRaw) {
      const oldNotes = JSON.parse(oldNotesRaw);
      if (oldNotes.notes && Array.isArray(oldNotes.notes)) {
        const unified = loadAllNotes();
        const existingIds = new Set(unified.map(n => n.id));
        oldNotes.notes.forEach(oldNote => {
          if (!existingIds.has(oldNote.id)) {
            unified.push({
              id: oldNote.id,
              type: 'exam',
              cardId: oldNote.cardId || '',
              sourceId: null,
              content: oldNote.notes || '',
              tags: [],
              createdAt: oldNote.timestamp || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              vector: oldNote.vector || null,
              vectorLabel: oldNote.vectorLabel || null,
              diagnosis: oldNote.diagnosis || null,
              diagnosisLabel: oldNote.diagnosisLabel || null,
              question: oldNote.question || null,
              selected: oldNote.selected || null,
              correct: oldNote.correct || null,
              prompt: oldNote.prompt || null,
              reviewSchedule: oldNote.reviewSchedule || null
            });
            migrated = true;
          }
        });
        if (migrated) saveAllNotes(unified);
      }
    }
  } catch (e) {
    console.warn('[NoteService] 迁移 sh_v9_notes 失败:', e);
  }

  // 2. 从 sh_v9_card_notes（卡片笔记）迁移
  try {
    const cardNotesRaw = localStorage.getItem('sh_v9_card_notes');
    if (cardNotesRaw) {
      const cardNotes = JSON.parse(cardNotesRaw);
      if (cardNotes.notes) {
        const unified = loadAllNotes();
        const existingIds = new Set(unified.map(n => n.id));
        Object.entries(cardNotes.notes).forEach(([cardId, note]) => {
          const noteId = 'card-note-' + cardId;
          if (!existingIds.has(noteId)) {
            unified.push({
              id: noteId,
              type: 'card',
              cardId: cardId,
              sourceId: null,
              content: note.content || '',
              tags: [],
              createdAt: note.updatedAt || new Date().toISOString(),
              updatedAt: note.updatedAt || new Date().toISOString(),
              vector: null,
              vectorLabel: null,
              diagnosis: null,
              diagnosisLabel: null,
              question: null,
              selected: null,
              correct: null,
              prompt: null,
              reviewSchedule: null
            });
            migrated = true;
          }
        });
        if (migrated) saveAllNotes(unified);
      }
    }
  } catch (e) {
    console.warn('[NoteService] 迁移 sh_v9_card_notes 失败:', e);
  }

  // 3. 从 source_notes_v1（条文面板「我的理解」）迁移
  try {
    const sourceNotesRaw = localStorage.getItem('source_notes_v1');
    if (sourceNotesRaw) {
      const sourceNotes = JSON.parse(sourceNotesRaw);
      const unified = loadAllNotes();
      const existingIds = new Set(unified.map(n => n.id));
      Object.entries(sourceNotes).forEach(([cardId, noteText]) => {
        if (!noteText || typeof noteText !== 'string') return;
        const noteId = 'source-note-' + cardId;
        if (!existingIds.has(noteId)) {
          unified.push({
            id: noteId,
            type: 'source',
            cardId: cardId,
            sourceId: null,
            content: noteText.trim(),
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            vector: null,
            vectorLabel: null,
            diagnosis: null,
            diagnosisLabel: null,
            question: null,
            selected: null,
            correct: null,
            prompt: null,
            reviewSchedule: null
          });
          migrated = true;
        }
      });
      if (migrated) saveAllNotes(unified);
    }
  } catch (e) {
    console.warn('[NoteService] 迁移 source_notes_v1 失败:', e);
  }

  // 4. 从 source_article_notes_v1（per-source 条文笔记）迁移
  try {
    const articleNotesRaw = localStorage.getItem('source_article_notes_v1');
    if (articleNotesRaw) {
      const articleNotes = JSON.parse(articleNotesRaw);
      const unified = loadAllNotes();
      const existingIds = new Set(unified.map(n => n.id));
      Object.entries(articleNotes).forEach(([key, note]) => {
        if (!note) return;
        const noteId = 'article-note-' + key.replace(/[^a-zA-Z0-9_-]/g, '_');
        if (!existingIds.has(noteId)) {
          unified.push({
            id: noteId,
            type: 'source',
            cardId: note.formulaName || note.cardId || '',
            sourceId: key,
            content: note.content || '',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: note.updatedAt || new Date().toISOString(),
            vector: null,
            vectorLabel: null,
            diagnosis: null,
            diagnosisLabel: null,
            question: null,
            selected: null,
            correct: null,
            prompt: null,
            reviewSchedule: null,
            sourceTitle: note.title || null,
            sourceChapter: note.chapter || null,
            sourceText: note.sourceText || null
          });
          migrated = true;
        }
      });
      if (migrated) saveAllNotes(unified);
    }
  } catch (e) {
    console.warn('[NoteService] 迁移 source_article_notes_v1 失败:', e);
  }

  if (migrated) {
    console.log('[NoteService] 旧版笔记数据迁移完成');
  }
  return migrated;
}

// ===== CRUD =====

/**
 * 获取所有笔记
 * @param {Object} options - 过滤选项
 * @param {string} [options.type] - 按来源类型过滤 ('exam' | 'card' | 'source')
 * @param {string} [options.cardId] - 按卡片ID过滤
 * @param {string} [options.diagnosis] - 按诊断标签过滤（仅 type=exam）
 * @returns {Array}
 */
export function getNotes(options = {}) {
  let notes = loadAllNotes();
  if (options.type) {
    notes = notes.filter(n => n.type === options.type);
  }
  if (options.cardId) {
    notes = notes.filter(n => n.cardId === options.cardId);
  }
  if (options.diagnosis) {
    notes = notes.filter(n => n.diagnosis === options.diagnosis);
  }
  // 按更新时间倒序
  return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/**
 * 获取单条笔记
 * @param {string} noteId
 * @returns {Object|null}
 */
export function getNote(noteId) {
  const notes = loadAllNotes();
  return notes.find(n => n.id === noteId) || null;
}

/**
 * 创建笔记
 * @param {Object} data - 笔记数据
 * @param {string} data.type - 来源类型
 * @param {string} data.cardId - 关联方剂卡片ID
 * @param {string} [data.sourceId] - 关联具体条文ID
 * @param {string} [data.content] - Markdown 正文
 * @param {string[]} [data.tags] - 标签数组
 * @param {string} [data.vector] - 学习向量（仅 exam 类型）
 * @param {string} [data.diagnosis] - 诊断标签（仅 exam 类型）
 * @param {string} [data.question] - 问题文本（仅 exam 类型）
 * @param {string} [data.selected] - 用户选择（仅 exam 类型）
 * @param {string} [data.correct] - 正确答案（仅 exam 类型）
 * @param {string} [data.prompt] - 提示词（仅 exam 类型）
 * @param {Object} [extra] - 额外字段
 * @returns {Object} 创建的笔记
 */
export function createNote(data, extra = {}) {
  const notes = loadAllNotes();
  const now = new Date().toISOString();
  const note = {
    id: 'note-' + Date.now(),
    type: data.type || 'card',
    cardId: data.cardId || '',
    sourceId: data.sourceId || null,
    content: data.content || '',
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now,
    // exam-specific
    vector: data.vector || null,
    vectorLabel: data.vectorLabel || null,
    diagnosis: data.diagnosis || null,
    diagnosisLabel: data.diagnosis ? (DIAGNOSIS_TAGS[data.diagnosis]?.label || data.diagnosis) : null,
    question: data.question || null,
    selected: data.selected || null,
    correct: data.correct || null,
    prompt: data.prompt || null,
    reviewSchedule: data.reviewSchedule || null,
    // source-specific
    sourceTitle: null,
    sourceChapter: null,
    sourceText: null,
    // extra fields
    ...extra
  };
  notes.push(note);
  saveAllNotes(notes);
  return note;
}

/**
 * 更新笔记（部分更新）
 * @param {string} noteId
 * @param {Object} updates - 要更新的字段
 * @returns {boolean}
 */
export function updateNote(noteId, updates) {
  const notes = loadAllNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx === -1) return false;
  notes[idx] = {
    ...notes[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveAllNotes(notes);
  return true;
}

/**
 * 删除笔记
 * @param {string} noteId
 * @returns {boolean}
 */
export function deleteNote(noteId) {
  const notes = loadAllNotes();
  const filtered = notes.filter(n => n.id !== noteId);
  if (filtered.length === notes.length) return false;
  saveAllNotes(filtered);
  return true;
}

/**
 * 清空所有笔记
 */
export function clearAllNotes() {
  saveAllNotes([]);
}

/**
 * 获取某张卡片的所有笔记（按类型分组）
 * @param {string} cardId
 * @returns {{ exam: Array, card: Array, source: Array }}
 */
export function getNotesByCard(cardId) {
  const notes = loadAllNotes().filter(n => n.cardId === cardId);
  return {
    exam: notes.filter(n => n.type === 'exam'),
    card: notes.filter(n => n.type === 'card'),
    source: notes.filter(n => n.type === 'source')
  };
}

/**
 * 获取某张卡片的所有笔记（扁平数组版）
 * @param {string} cardId
 * @returns {Array}
 */
export function getNotesByCardFlat(cardId) {
  return loadAllNotes().filter(n => n.cardId === cardId);
}

// ===== 标签管理 =====

/**
 * 添加标签到笔记
 * @param {string} noteId
 * @param {string} tag
 * @returns {boolean}
 */
export function addTag(noteId, tag) {
  const notes = loadAllNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx === -1) return false;
  if (!notes[idx].tags.includes(tag)) {
    notes[idx].tags.push(tag);
    notes[idx].updatedAt = new Date().toISOString();
    saveAllNotes(notes);
  }
  return true;
}

/**
 * 删除笔记上的标签
 * @param {string} noteId
 * @param {string} tag
 * @returns {boolean}
 */
export function removeTag(noteId, tag) {
  const notes = loadAllNotes();
  const idx = notes.findIndex(n => n.id === noteId);
  if (idx === -1) return false;
  notes[idx].tags = notes[idx].tags.filter(t => t !== tag);
  notes[idx].updatedAt = new Date().toISOString();
  saveAllNotes(notes);
  return true;
}

/**
 * 获取所有标签及其使用次数
 * @returns {Object} { tagName: count }
 */
export function getAllTags() {
  const notes = loadAllNotes();
  const tagCount = {};
  notes.forEach(n => {
    n.tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
    // 也收录诊断标签作为隐式标签
    if (n.diagnosis && n.diagnosisLabel) {
      tagCount[n.diagnosisLabel] = (tagCount[n.diagnosisLabel] || 0) + 1;
    }
  });
  return tagCount;
}

// ===== 诊断标签统计 =====

/**
 * 统计诊断标签分布
 * @returns {Object} { confusion: N, reverse: N, gap: N, mistake: N }
 */
export function getDiagnosisStats() {
  const notes = loadAllNotes().filter(n => n.type === 'exam');
  const stats = { confusion: 0, reverse: 0, gap: 0, mistake: 0 };
  notes.forEach(n => {
    if (n.diagnosis && stats[n.diagnosis] !== undefined) {
      stats[n.diagnosis]++;
    }
  });
  return stats;
}

/**
 * 创建复习计划（间隔重复）
 * @param {Date} startDate
 * @returns {number[]}
 */
export function createReviewSchedule(startDate) {
  const intervals = [1, 3, 7, 14, 30];
  return intervals.map(days => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.getTime();
  });
}

/**
 * 获取今日待复习笔记
 * @returns {Array}
 */
export function getDueNotes() {
  const notes = loadAllNotes().filter(n => n.type === 'exam');
  const now = Date.now();
  return notes.filter(n => {
    if (!n.reviewSchedule) return false;
    return n.reviewSchedule.some(t => t <= now);
  });
}

/**
 * 获取笔记统计
 * @returns {{ total: number, byType: Object, byCard: number }}
 */
export function getNoteStats() {
  const notes = loadAllNotes();
  const byType = { exam: 0, card: 0, source: 0, clinical: 0 };
  notes.forEach(n => {
    if (byType[n.type] !== undefined) byType[n.type]++;
  });
  const uniqueCards = new Set(notes.map(n => n.cardId).filter(Boolean));
  return {
    total: notes.length,
    byType,
    byCard: uniqueCards.size
  };
}

/**
 * 搜索笔记（按内容全文搜索）
 * @param {string} query
 * @returns {Array}
 */
export function searchNotes(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return loadAllNotes().filter(n =>
    (n.content && n.content.toLowerCase().includes(q)) ||
    (n.question && n.question.toLowerCase().includes(q)) ||
    (n.cardId && n.cardId.toLowerCase().includes(q)) ||
    (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// 触发旧版数据迁移
migrateOldData();

// 暴露诊断标签映射
export default {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  clearAllNotes,
  getNotesByCard,
  addTag,
  removeTag,
  getAllTags,
  getDiagnosisStats,
  getDueNotes,
  getNoteStats,
  searchNotes,
  DIAGNOSIS_TAGS,
  getDiagnosisLabel
};
