import { describe, it, expect } from 'vitest';
import {
  getVectorLabel,
  slugToName,
  formatCorrectAnswer,
  getCoreCombo,
  getOptionLabel,
  scheduleNextReview,
  SRS_INTERVALS
} from '@utils/formatters.js';

describe('formatters', () => {
  const mockCards = [
    { id: 'gui-zhi-tang', name: '桂枝汤' },
    { id: 'ma-huang-tang', name: '麻黄汤' }
  ];

  it('getVectorLabel 返回中文标签', () => {
    expect(getVectorLabel('0→1')).toBe('方名→症状');
    expect(getVectorLabel('1→0')).toBe('症状→方名');
    expect(getVectorLabel('unknown')).toBe('unknown');
  });

  it('slugToName 找到卡片返回名称', () => {
    expect(slugToName('gui-zhi-tang', mockCards)).toBe('桂枝汤');
  });

  it('slugToName 找不到返回 slug', () => {
    expect(slugToName('not-found', mockCards)).toBe('not-found');
  });

  it('formatCorrectAnswer 处理 1→0 题型', () => {
    const q = { type: '1→0', correct: 'gui-zhi-tang' };
    expect(formatCorrectAnswer(q, mockCards)).toBe('桂枝汤');
  });

  it('formatCorrectAnswer 处理数组', () => {
    const q = { type: '0→2', correct: ['桂枝', '芍药'] };
    expect(formatCorrectAnswer(q)).toBe('桂枝、芍药');
  });

  it('formatCorrectAnswer 处理字符串', () => {
    const q = { type: '0→usage', correct: '水煎服' };
    expect(formatCorrectAnswer(q)).toBe('水煎服');
  });

  it('getCoreCombo 优先返回 core_combinations', () => {
    const card = { data: { canonical: { core_combinations: '桂枝、芍药' } } };
    expect(getCoreCombo(card)).toBe('桂枝、芍药');
  });

  it('getCoreCombo 无组合时返回首药', () => {
    const card = { data: { canonical: { herbs: [{ name: '麻黄' }] } } };
    expect(getCoreCombo(card)).toBe('麻黄');
  });

  it('getCoreCombo 无数据返回无', () => {
    expect(getCoreCombo(null)).toBe('无');
  });

  it('scheduleNextReview 按等级返回正确间隔', () => {
    const now = Date.now();
    const t0 = scheduleNextReview(0);
    const t5 = scheduleNextReview(5);
    expect(Math.abs(t0 - now - 1 * 24 * 60 * 60 * 1000)).toBeLessThanOrEqual(2);
    expect(Math.abs(t5 - now - 30 * 24 * 60 * 60 * 1000)).toBeLessThanOrEqual(2);
  });
});
