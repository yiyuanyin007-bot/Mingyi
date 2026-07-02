import { describe, it, expect } from 'vitest';
import { generateQuestionForVector, generateOptions, checkAnswer, generateQuestions } from '@services/ExamService.js';

describe('ExamService', () => {
  const mockCard = {
    id: 'gui-zhi-tang',
    name: '桂枝汤',
    data: {
      canonical: {
        symptom_profile: {
          necessary: ['汗出', '恶风'],
          common: ['头痛', '发热', '脉浮缓']
        },
        pathology: '风邪袭表',
        herbs: [
          { name: '桂枝', dosage: '三两' },
          { name: '芍药', dosage: '三两' }
        ],
        usage: '水煎服',
        contraindications: ['无汗'],
        core_combinations: '桂枝、芍药'
      }
    }
  };

  const mockCards = [
    mockCard,
    {
      id: 'ma-huang-tang',
      name: '麻黄汤',
      data: {
        canonical: {
          symptom_profile: { necessary: ['无汗', '喘'] },
          herbs: [{ name: '麻黄' }, { name: '桂枝' }],
          core_combinations: '麻黄、桂枝、杏仁'
        }
      }
    }
  ];

  it('generateQuestionForVector 0→1', () => {
    const q = generateQuestionForVector(mockCard, '0→1');
    expect(q.type).toBe('0→1');
    expect(q.correct).toBe('汗出、恶风');
  });

  it('generateQuestionForVector 1→0', () => {
    const q = generateQuestionForVector(mockCard, '1→0');
    expect(q.type).toBe('1→0');
    expect(q.correct).toBe('gui-zhi-tang');
  });

  it('generateQuestionForVector 0→2', () => {
    const q = generateQuestionForVector(mockCard, '0→2');
    expect(q.correct).toEqual(['桂枝、芍药']);
  });

  it('generateQuestionForVector 数据不足返回 null', () => {
    const emptyCard = { id: 'test', name: 'Test', data: { canonical: {} } };
    expect(generateQuestionForVector(emptyCard, '0→1')).toBeNull();
  });

  it('generateOptions 产生 4 个唯一选项', () => {
    const opts = generateOptions('gui-zhi-tang', '0→1', mockCards);
    expect(opts).toHaveLength(4);
    const labels = opts.map(o => o.label);
    expect(new Set(labels).size).toBe(4);
  });

  it('checkAnswer 正确判断', () => {
    const q = { type: '1→0', correct: 'gui-zhi-tang' };
    expect(checkAnswer(q, { id: 'gui-zhi-tang', label: '桂枝汤' })).toBe(true);
    expect(checkAnswer(q, { id: 'ma-huang-tang', label: '麻黄汤' })).toBe(false);
  });

  it('generateQuestions 生成全部可用题目', () => {
    const qs = generateQuestions(mockCard);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.some(q => q.type === '0→1')).toBe(true);
  });
});
