import { describe, it, expect } from 'vitest';
import { validateCardSchema, isValidQuestion, areOptionsUnique } from '@utils/validators.js';

describe('validators', () => {
  it('validateCardSchema 检测缺失字段', () => {
    const card = { id: 'test', type: 'formula_card' };
    const result = validateCardSchema(card);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('name');
    expect(result.missing).toContain('data');
  });

  it('validateCardSchema 通过完整卡片', () => {
    const card = { id: 'test', type: 'formula_card', name: 'Test', formula_name: 'Test', data: {} };
    const result = validateCardSchema(card);
    expect(result.valid).toBe(true);
  });

  it('areOptionsUnique 检测重复', () => {
    expect(areOptionsUnique([{ label: 'A' }, { label: 'B' }, { label: 'A' }])).toBe(false);
    expect(areOptionsUnique([{ label: 'A' }, { label: 'B' }, { label: 'C' }])).toBe(true);
  });

  it('isValidQuestion 校验题目结构', () => {
    const good = { type: '0→1', cardId: 'c1', text: 'test?', options: [{ label: 'A' }] };
    expect(isValidQuestion(good)).toBe(true);
    expect(isValidQuestion(null)).toBe(false);
    expect(isValidQuestion({ type: '0→1' })).toBe(false);
  });
});
