import { describe, it, expect } from 'vitest';
import { getState, setState, subscribe, setPage, initExam, recordAnswer, resetExam } from '@store/AppStore.js';

describe('AppStore', () => {
  it('getState 返回深拷贝', () => {
    const s1 = getState();
    const s2 = getState();
    expect(s1).toEqual(s2);
    expect(s1).not.toBe(s2); // 不是同一引用
  });

  it('setState 更新状态', () => {
    setState({ page: 'learn' });
    expect(getState().page).toBe('learn');
  });

  it('setState 函数式更新', () => {
    setState(prev => ({ stats: { ...prev.stats, total: prev.stats.total + 1 } }));
    expect(getState().stats.total).toBe(1);
  });

  it('subscribe 接收通知', () => {
    let called = false;
    const unsub = subscribe(() => { called = true; });
    setState({ page: 'stats' });
    expect(called).toBe(true);
    unsub();
  });

  it('setPage 切换页面', () => {
    setPage('exam');
    expect(getState().page).toBe('exam');
  });

  it('initExam 初始化考试', () => {
    const questions = [{ type: '0→1', text: 'test' }];
    initExam(questions, 'exam');
    const s = getState();
    expect(s.exam.mode).toBe('exam');
    expect(s.exam.questions).toHaveLength(1);
    expect(s.exam.answers).toHaveLength(1);
  });

  it('recordAnswer 记录答案', () => {
    const questions = [{ type: '0→1', text: 'test' }];
    initExam(questions, 'practice');
    recordAnswer(0, { label: 'A' }, true);
    const s = getState();
    expect(s.exam.answers[0].isCorrect).toBe(true);
    expect(s.exam.finished).toBe(true);
  });

  it('resetExam 清空考试', () => {
    initExam([{ type: '0→1' }], 'exam');
    resetExam();
    const s = getState();
    expect(s.exam.mode).toBeNull();
    expect(s.exam.questions).toHaveLength(0);
  });
});
