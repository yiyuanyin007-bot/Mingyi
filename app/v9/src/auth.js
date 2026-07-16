/**
 * auth.js — 前端登录/注册/登出/Token 管理
 *
 * Token 存储在前端 localStorage（supabase 约定键名）
 * 与现有持久化方式一致
 */

const AUTH_TOKEN_KEY = 'sb-access-token';
const AUTH_USER_KEY = 'sb-user';

/** 获取存储的 access token */
export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** 获取当前用户信息 */
export function getUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** 保存登录信息到 localStorage */
function saveSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/** 清除登录信息 */
export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/** 检查是否已登录 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * 注册
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, error?: string }}
 */
export async function register(email, password) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || '注册失败' };
    }
    saveSession(data.access_token, data.user);
    // 注册成功后自动迁移本地数据到云端
    const migrationResult = await migrateLocalDataAfterRegister();
    if (migrationResult.success && migrationResult.migrated) {
      const count = migrationResult.migrated.mastery + migrationResult.migrated.notes + migrationResult.migrated.clinical;
      if (count > 0) {
        console.log(`[auth] 注册后自动迁移 ${count} 条数据到云端`);
      }
    }
    return { success: true, migration: migrationResult };
  } catch (e) {
    return { success: false, error: '网络错误: ' + e.message };
  }
}

/**
 * 登录
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, error?: string }}
 */
export async function login(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.detail || '登录失败' };
    }
    saveSession(data.access_token, data.user);
    return { success: true };
  } catch (e) {
    return { success: false, error: '网络错误: ' + e.message };
  }
}

/**
 * 登出
 */
export async function logout() {
  try {
    const token = getToken();
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch {
    // 即使后端登出失败，前端也清除本地 session
  }
  clearSession();
}

// ── 数据迁移 ──

/**
 * 注册成功后自动迁移本地数据到云端
 * @returns {{ success: boolean, message?: string }}
 */
export async function migrateLocalDataAfterRegister() {
  try {
    const migrated = { mastery: 0, notes: 0, clinical: 0, answers: 0 };
    const token = getToken();
    if (!token) return { success: false, message: '未登录，无法迁移' };

    // 1. 迁移掌握度
    try {
      const stateRaw = localStorage.getItem('sh_v9_state');
      if (stateRaw) {
        const state = JSON.parse(stateRaw);
        const masteryEntries = [];
        if (state.mastery) {
          Object.entries(state.mastery).forEach(([cardId, vecs]) => {
            Object.entries(vecs).forEach(([vector, m]) => {
              masteryEntries.push({
                card_id: cardId,
                vector,
                level: m.level || 0,
                status: m.status || '未知',
                streak_right: m.streak_right || 0,
                streak_wrong: m.streak_wrong || 0,
                total_rights: m.total_rights || 0,
                total_wrongs: m.total_wrongs || 0,
                last_result: m.last_result || null,
                last_review: m.last_review || null,
                next_review: m.next_review || 0,
              });
            });
          });
        }
        if (masteryEntries.length > 0) {
          await fetch('/api/state', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(masteryEntries),
          });
          migrated.mastery = masteryEntries.length;
        }
      }
    } catch (e) {
      console.warn('[migrate] 掌握度迁移失败:', e.message);
    }

    // 2. 迁移笔记
    try {
      const notesRaw = localStorage.getItem('sh_v9_notes');
      if (notesRaw) {
        const notes = JSON.parse(notesRaw);
        if (notes.notes && notes.notes.length > 0) {
          for (const note of notes.notes) {
            await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                type: note.type || 'study',
                card_id: note.cardId || note.card_id || '',
                source_id: note.source_id || null,
                content: note.content || '',
                tags: note.tags || [],
                vector: note.vector || null,
                vector_label: note.vector_label || null,
                diagnosis: note.diagnosis || null,
                diagnosis_label: note.diagnosis_label || null,
                question: note.question || null,
                selected: note.selected || null,
                correct: note.correct || null,
                prompt: note.prompt || null,
                review_schedule: note.review_schedule || null,
              }),
            });
          }
          migrated.notes = notes.notes.length;
        }
      }
    } catch (e) {
      console.warn('[migrate] 笔记迁移失败:', e.message);
    }

    // 3. 迁移临床档案
    try {
      const clRaw = localStorage.getItem('clinical_records_v1');
      if (clRaw) {
        const records = JSON.parse(clRaw);
        if (records.length > 0) {
          for (const r of records) {
            await fetch('/api/clinical', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                patient_name: r.patientName || r.patient_name || '匿名',
                symptoms: r.symptoms || [],
                input_text: r.inputText || r.input_text || '',
                note: r.note || '',
                related_person_id: r.relatedPersonId || r.related_person_id || null,
              }),
            });
          }
          migrated.clinical = records.length;
        }
      }
    } catch (e) {
      console.warn('[migrate] 临床档案迁移失败:', e.message);
    }

    const total = migrated.mastery + migrated.notes + migrated.clinical;
    return {
      success: true,
      message: `已迁移 ${total} 条数据（掌握度 ${migrated.mastery}、笔记 ${migrated.notes}、档案 ${migrated.clinical}）`,
      migrated,
    };
  } catch (e) {
    return { success: false, message: '迁移失败: ' + e.message };
  }
}
