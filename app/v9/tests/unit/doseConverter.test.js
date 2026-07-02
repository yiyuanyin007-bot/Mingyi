/**
 * DoseConverter 单元测试
 * 覆盖：四档换算、特殊单位、容量单位、计数单位
 */

import { describe, it, expect } from 'vitest';
import { convertDosage, getDoseStandards, isConvertibleDosage } from '../../src/utils/doseConverter.js';

describe('convertDosage', () => {
  it('应转换两为四档标准', () => {
    const result = convertDosage('桂枝', '三两');
    expect(result).not.toBeNull();
    expect(result.original).toBe('三两');
    expect(result.modern).toBe('9g');
    expect(result.light).toBe('18g');
    expect(result.medium).toBe('27g');
    expect(result.full).toBe('45g');
    expect(result.unit).toBe('两');
  });

  it('应转换钱为四档标准', () => {
    const result = convertDosage('甘草', '三钱');
    expect(result.modern).toBe('0.9g');
    expect(result.light).toBe('1.8g');
    expect(result.medium).toBe('2.7g');
    expect(result.full).toBe('4.5g');
  });

  it('应转换铢为四档标准', () => {
    const result = convertDosage('桂枝', '二十四铢');
    expect(result.modern).toBe('3g');
    expect(result.light).toBe('6g');
    expect(result.medium).toBe('9g');
    expect(result.full).toBe('15g');
  });

  it('应处理特殊单位', () => {
    const result = convertDosage('', '方寸匕');
    expect(result).not.toBeNull();
    expect(result.type).toBe('special');
  });

  it('应处理枚单位', () => {
    const result = convertDosage('杏仁', '十四枚');
    expect(result).not.toBeNull();
    expect(result.type).toBe('special');
  });

  it('应处理容量单位', () => {
    const result = convertDosage('半夏', '一升');
    expect(result).not.toBeNull();
  });

  it('应处理两半', () => {
    const result = convertDosage('桂枝', '一两半');
    expect(result.modern).toBe('4.5g');
  });

  it('空剂量应返回null', () => {
    expect(convertDosage('桂枝', '')).toBeNull();
    expect(convertDosage('桂枝', null)).toBeNull();
  });
});

describe('getDoseStandards', () => {
  it('应返回4个标准', () => {
    const standards = getDoseStandards();
    expect(standards.length).toBe(4);
    expect(standards.map(s => s.name)).toContain('教材');
    expect(standards.map(s => s.name)).toContain('经方');
  });
});

describe('isConvertibleDosage', () => {
  it('应识别可换算剂量', () => {
    expect(isConvertibleDosage('三两')).toBe(true);
    expect(isConvertibleDosage('方寸匕')).toBe(true);
  });

  it('应拒绝无效剂量', () => {
    expect(isConvertibleDosage('')).toBe(false);
    expect(isConvertibleDosage('unknown')).toBe(false);
  });
});
