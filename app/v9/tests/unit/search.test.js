/**
 * SearchUtils 单元测试
 * 覆盖：拼音首字母、方名匹配、标签匹配、联合搜索
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPinyinInitials,
  matchByName,
  matchByPinyin,
  matchByTag,
  searchCards,
  saveSearchHistory,
  getSearchHistory,
  clearSearchHistory
} from '../../src/utils/search.js';

const TEST_CARDS = [
  { id: 'gui-zhi-tang', name: '桂枝汤', formula_name: '桂枝汤', tags: ['太阳病', '解表'] },
  { id: 'ma-huang-tang', name: '麻黄汤', formula_name: '麻黄汤', tags: ['太阳病', '发汗'] },
  { id: 'xiao-chai-hu-tang', name: '小柴胡汤', formula_name: '小柴胡汤', tags: ['少阳病', '和解'] },
  { id: 'si-ni-tang', name: '四逆汤', formula_name: '四逆汤', tags: ['少阴病', '回阳'] },
  { id: 'bai-hu-tang', name: '白虎汤', formula_name: '白虎汤', tags: ['阳明病', '清热'] }
];

describe('getPinyinInitials', () => {
  it('应返回已知卡片的拼音首字母', () => {
    expect(getPinyinInitials('gui-zhi-tang')).toBe('GZT');
    expect(getPinyinInitials('ma-huang-tang')).toBe('MHT');
    expect(getPinyinInitials('xiao-chai-hu-tang')).toBe('XCHT');
  });

  it('对未知卡片应返回id首字母大写拼接', () => {
    expect(getPinyinInitials('unknown-card')).toBe('UC');
  });
});

describe('matchByName', () => {
  it('应匹配方名包含关键词的卡片', () => {
    const results = matchByName(TEST_CARDS, '桂枝');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('gui-zhi-tang');
  });

  it('应匹配 formula_name 包含关键词的卡片', () => {
    const results = matchByName(TEST_CARDS, '白虎');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('bai-hu-tang');
  });

  it('无匹配时应返回空数组', () => {
    const results = matchByName(TEST_CARDS, '不存在');
    expect(results.length).toBe(0);
  });
});

describe('matchByPinyin', () => {
  it('应匹配完整拼音首字母', () => {
    const results = matchByPinyin(TEST_CARDS, 'GZT');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('gui-zhi-tang');
  });

  it('应匹配部分拼音首字母', () => {
    const results = matchByPinyin(TEST_CARDS, 'ZT');
    expect(results.length).toBeGreaterThan(0);
  });

  it('应支持小写输入', () => {
    const results = matchByPinyin(TEST_CARDS, 'mht');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('ma-huang-tang');
  });
});

describe('matchByTag', () => {
  it('应匹配包含标签的卡片', () => {
    const results = matchByTag(TEST_CARDS, '太阳病');
    expect(results.length).toBe(2);
    expect(results.map(r => r.id)).toContain('gui-zhi-tang');
    expect(results.map(r => r.id)).toContain('ma-huang-tang');
  });

  it('无匹配时应返回空数组', () => {
    const results = matchByTag(TEST_CARDS, '厥阴病');
    expect(results.length).toBe(0);
  });
});

describe('searchCards', () => {
  it('空查询应返回全部卡片', () => {
    const results = searchCards(TEST_CARDS, '');
    expect(results.length).toBe(5);
  });

  it('应联合三种匹配方式并去重', () => {
    // "桂枝" 匹配方名，"GZT" 匹配拼音 — 但只返回一次
    const results = searchCards(TEST_CARDS, '桂枝');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('gui-zhi-tang');
  });

  it('应匹配标签搜索', () => {
    const results = searchCards(TEST_CARDS, '太阳病');
    expect(results.length).toBe(2);
  });

  it('应匹配拼音搜索', () => {
    const results = searchCards(TEST_CARDS, 'MHT');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('ma-huang-tang');
  });
});

describe('searchHistory', () => {
  beforeEach(() => {
    clearSearchHistory();
  });

  it('应保存搜索历史', () => {
    saveSearchHistory('桂枝');
    saveSearchHistory('麻黄');
    const history = getSearchHistory();
    expect(history.length).toBe(2);
    expect(history[0]).toBe('麻黄');
    expect(history[1]).toBe('桂枝');
  });

  it('应去重并限制10条', () => {
    for (let i = 0; i < 12; i++) {
      saveSearchHistory(`搜索${i}`);
    }
    const history = getSearchHistory();
    expect(history.length).toBe(10);
  });

  it('应清除搜索历史', () => {
    saveSearchHistory('test');
    clearSearchHistory();
    expect(getSearchHistory().length).toBe(0);
  });
});
