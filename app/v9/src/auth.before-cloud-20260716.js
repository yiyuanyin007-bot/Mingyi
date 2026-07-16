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
    return { success: true };
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
