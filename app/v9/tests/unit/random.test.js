import { describe, it, expect } from 'vitest';
import { shuffle, pickRandom, randomInt, sortByWeakness } from '@utils/random.js';

describe('random utils', () => {
  it('shuffle 不改变原数组', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).not.toBe(arr); // 不是同一个引用
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual(arr); // 元素相同
  });

  it('pickRandom 返回指定数量', () => {
    const arr = [1, 2, 3, 4, 5];
    const picked = pickRandom(arr, 3);
    expect(picked).toHaveLength(3);
  });

  it('pickRandom 不超过数组长度', () => {
    const arr = [1, 2];
    const picked = pickRandom(arr, 5);
    expect(picked).toHaveLength(2);
  });

  it('randomInt 返回整数', () => {
    const n = randomInt(10);
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThan(10);
  });

  it('sortByWeakness 按 level 排序', () => {
    const items = [
      { card: {}, vector: 'a', mastery: { level: 2 }, due: true },
      { card: {}, vector: 'b', mastery: { level: 0 }, due: true },
      { card: {}, vector: 'c', mastery: { level: 1 }, due: true }
    ];
    const sorted = sortByWeakness(items);
    expect(sorted[0].mastery.level).toBe(0);
    expect(sorted[1].mastery.level).toBe(1);
    expect(sorted[2].mastery.level).toBe(2);
  });
});
