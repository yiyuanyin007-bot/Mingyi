/**
 * api.js — API 客户端
 *
 * 封装 fetch，自动附加 JWT Token
 * 所有 Service 层组件通过此模块向后端发请求
 */

import { getToken, logout } from './auth.js';

/**
 * 基础 fetch 包装
 * @param {string} path - API 路径（如 '/api/state'）
 * @param {Object} options - fetch 选项
 * @returns {Promise<Object>} 解析后的 JSON 响应
 */
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  // 401 → Token 过期，强制登出
  if (res.status === 401) {
    console.warn('[API] Token 已过期，清除登录态');
    logout();
    window.location.reload();
    throw new Error('登录已过期，请重新登录');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `HTTP ${res.status}`);
  }
  return data;
}

// ── 掌握度 API ──

export async function loadMasteryState() {
  const res = await request('/api/state');
  return res.data || [];
}

export async function saveMasteryState(items) {
  return request('/api/state', {
    method: 'PUT',
    body: JSON.stringify(items),
  });
}

export async function updateMasteryVector(cardId, vector, data) {
  return request(`/api/state/${encodeURIComponent(cardId)}/${encodeURIComponent(vector)}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── 笔记 API ──

export async function loadNotes(type, cardId) {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (cardId) params.set('card_id', cardId);
  const qs = params.toString();
  const res = await request(`/api/notes${qs ? '?' + qs : ''}`);
  return res.data || [];
}

export async function createNote(data) {
  const res = await request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateNote(noteId, updates) {
  return request(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteNote(noteId) {
  return request(`/api/notes/${noteId}`, { method: 'DELETE' });
}

// ── 临床档案 API ──

export async function loadClinicalRecords() {
  const res = await request('/api/clinical');
  return res.data || [];
}

export async function searchClinicalRecords(q) {
  const res = await request(`/api/clinical/search?q=${encodeURIComponent(q)}`);
  return res.data || [];
}

export async function createClinicalRecord(data) {
  const res = await request('/api/clinical', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateClinicalRecord(recordId, updates) {
  return request(`/api/clinical/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteClinicalRecord(recordId) {
  return request(`/api/clinical/${recordId}`, { method: 'DELETE' });
}

// ── 统计 API ──

export async function recordAnswer(data) {
  return request('/api/stats/answer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTodayStats() {
  const res = await request('/api/stats/today');
  return res;
}

export async function getCardStats() {
  const res = await request('/api/stats/cards');
  return res.data || {};
}
