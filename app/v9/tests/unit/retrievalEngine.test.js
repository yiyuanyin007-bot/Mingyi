/**
 * RetrievalEngine 单元测试
 * 覆盖：再来一组生成、错题画像、Fallback
 */

import { describe, it, expect } from 'vitest';
import { generateRetrievalRound, generateWrongProfile } from '../../src/services/RetrievalEngine.js';

const TEST_CARDS = [
  { id: 'gui-zhi-tang', name: '桂枝汤', data: { canonical: { herbs: [{ name: '桂枝' }, { name: '芍药' }], symptom_profile: { necessary: ['汗出', '恶风'] } } } },
  { id: 'ma-huang-tang', name: '麻黄汤', data: { canonical: { herbs: [{ name: '麻黄' }, { name: '桂枝' }], symptom_profile: { necessary: ['无汗', '恶寒'] } } } },
  { id: 'xiao-chai-hu-tang', name: '小柴胡汤', data: { canonical: { herbs: [{ name: '柴胡' }, { name: '黄芩' }], symptom_profile: { necessary: ['往来寒热', '胸胁苦满'] } } } }
];

describe('generateRetrievalRound', () => {
  it('无错题时应返回fallback题目', () => {
    const answers = [
      { isCorrect: true, question: { cardId: 'gui-zhi-tang', type: '0→1' } }
    ];
    const questions = generateRetrievalRound(answers, TEST_CARDS);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].roundInfo?.fallback).toBe(true);
  });

  it('有错题时应生成薄弱方关联题目', () => {
    const answers = [
      { isCorrect: false, question: { cardId: 'gui-zhi-tang', type: '0→1' } },
      { isCorrect: false, question: { cardId: 'gui-zhi-tang', type: '0→1' } },
      { isCorrect: false, question: { cardId: 'ma-huang-tang', type: '1→0' } }
    ];
    const questions = generateRetrievalRound(answers, TEST_CARDS);
    expect(questions.length).toBeGreaterThan(0);
    // 第一方是桂枝汤（错2次）
    expect(questions[0].roundInfo?.cardName).toBe('桂枝汤');
    expect(questions[0].roundInfo?.totalCards).toBeLessThanOrEqual(3);
  });

  it('应限制最多10题', () => {
    const answers = [];
    for (let i = 0; i < 20; i++) {
      answers.push({ isCorrect: false, question: { cardId: 'gui-zhi-tang', type: '0→1' } });
    }
    const questions = generateRetrievalRound(answers, TEST_CARDS);
    expect(questions.length).toBeLessThanOrEqual(10);
  });

  it('空答案应返回fallback', () => {
    const questions = generateRetrievalRound([], TEST_CARDS);
    expect(questions.length).toBeGreaterThan(0);
  });
});

describe('generateWrongProfile', () => {
  it('无错题时应返回无薄弱点', () => {
    const answers = [{ isCorrect: true, question: { cardId: 'gui-zhi-tang', type: '0→1' } }];
    const profile = generateWrongProfile(answers, TEST_CARDS);
    expect(profile.hasWeakness).toBe(false);
  });

  it('应分析薄弱方和薄弱向量', () => {
    const answers = [
      { isCorrect: false, question: { cardId: 'gui-zhi-tang', type: '0→1' } },
      { isCorrect: false, question: { cardId: 'gui-zhi-tang', type: '1→0' } },
      { isCorrect: false, question: { cardId: 'ma-huang-tang', type: '0→1' } }
    ];
    const profile = generateWrongProfile(answers, TEST_CARDS);
    expect(profile.hasWeakness).toBe(true);
    expect(profile.totalWrong).toBe(3);
    expect(profile.weakCard).not.toBeNull();
    expect(profile.weakCard?.name).toBe('桂枝汤');
    expect(profile.suggestions.length).toBeGreaterThan(0);
  });
});
