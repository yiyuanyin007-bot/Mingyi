import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState, exportState, importState, getMastery, updateMastery, getStats, updateStats } from '@services/StorageService.js';

// 模拟 localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('StorageService', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('loadState 无数据时返回初始状态', () => {
    const state = loadState();
    expect(state.version).toBe(9);
    expect(state.stats.total).toBe(0);
  });

  it('saveState + loadState 往返', () => {
    const state = { version: 9, savedAt: Date.now(), stats: { total: 10, right: 7, wrong: 3 }, mastery: {} };
    saveState(state);
    const loaded = loadState();
    expect(loaded.stats.total).toBe(10);
    expect(loaded.stats.right).toBe(7);
  });

  it('exportState 返回 JSON 字符串', () => {
    const state = loadState();
    const json = exportState();
    expect(JSON.parse(json).version).toBe(9);
  });

  it('importState 成功', () => {
    const state = { version: 9, savedAt: Date.now(), stats: { total: 5, right: 3, wrong: 2 }, mastery: {} };
    const success = importState(JSON.stringify(state));
    expect(success).toBe(true);
    expect(loadState().stats.total).toBe(5);
  });

  it('updateMastery 正确升级', () => {
    updateMastery('gui-zhi-tang', '0→1', true);
    updateMastery('gui-zhi-tang', '0→1', true);
    updateMastery('gui-zhi-tang', '0→1', true);
    const m = getMastery('gui-zhi-tang', '0→1');
    expect(m.status).toBe('已掌握');
    expect(m.level).toBe(1);
  });

  it('updateMastery 错误降级', () => {
    // 先升两级
    updateMastery('test-card', '0→1', true);
    updateMastery('test-card', '0→1', true);
    updateMastery('test-card', '0→1', true);
    updateMastery('test-card', '0→1', true);
    updateMastery('test-card', '0→1', true);
    updateMastery('test-card', '0→1', true);
    // 再错两次
    updateMastery('test-card', '0→1', false);
    updateMastery('test-card', '0→1', false);
    const m = getMastery('test-card', '0→1');
    expect(m.level).toBeLessThan(2);
  });

  it('updateStats 更新统计', () => {
    updateStats(true);
    updateStats(false);
    const stats = getStats();
    expect(stats.total).toBe(2);
    expect(stats.right).toBe(1);
    expect(stats.wrong).toBe(1);
  });
});
