/**
 * StorageService — 错题本/笔记功能测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveStudyNote,
  loadStudyNotes,
  updateStudyNote,
  deleteStudyNote,
  getDueStudyNotes,
  getDiagnosisStats,
  getStudyNotesByCard,
  getStudyNotesByDiagnosis,
  DIAGNOSIS_TAGS,
  getDiagnosisLabel
} from '../../src/services/StorageService.js';

describe('错题本功能', () => {
  beforeEach(() => {
    // 清除笔记数据
    localStorage.removeItem('sh_v9_notes');
  });

  describe('DIAGNOSIS_TAGS', () => {
    it('应包含4个诊断标签', () => {
      expect(Object.keys(DIAGNOSIS_TAGS).length).toBe(4);
      expect(DIAGNOSIS_TAGS.confusion).toBeDefined();
      expect(DIAGNOSIS_TAGS.reverse).toBeDefined();
      expect(DIAGNOSIS_TAGS.gap).toBeDefined();
      expect(DIAGNOSIS_TAGS.mistake).toBeDefined();
    });

    it('getDiagnosisLabel应返回正确标签', () => {
      expect(getDiagnosisLabel('confusion')).toContain('类方混淆');
      expect(getDiagnosisLabel('reverse')).toContain('反向盲区');
      expect(getDiagnosisLabel('gap')).toContain('知识缺口');
      expect(getDiagnosisLabel('mistake')).toContain('决策失误');
    });
  });

  describe('saveStudyNote', () => {
    it('应保存笔记到localStorage', () => {
      const note = saveStudyNote({
        cardId: 'gui-zhi-tang',
        cardName: '桂枝汤',
        vector: '0→1',
        vectorLabel: '方名→症状',
        diagnosis: 'confusion',
        question: '桂枝汤的必见症是？',
        selected: '麻黄汤',
        correct: '汗出、恶风、脉浮缓'
      });
      expect(note).not.toBeNull();
      expect(note.cardId).toBe('gui-zhi-tang');
      expect(note.diagnosis).toBe('confusion');
      expect(note.diagnosisLabel).toContain('类方混淆');
    });

    it('应自动创建复习计划', () => {
      const note = saveStudyNote({
        cardId: 'test',
        cardName: '测试',
        vector: '0→1',
        vectorLabel: '方名→症状',
        diagnosis: 'gap'
      });
      expect(note.reviewSchedule).toBeInstanceOf(Array);
      expect(note.reviewSchedule.length).toBe(5);
    });
  });

  describe('loadStudyNotes', () => {
    it('无数据时应返回空数组', () => {
      expect(loadStudyNotes()).toEqual([]);
    });

    it('应加载已保存的笔记', () => {
      saveStudyNote({ cardId: 'a', cardName: 'A', vector: '0→1', vectorLabel: 'V', diagnosis: 'confusion' });
      saveStudyNote({ cardId: 'b', cardName: 'B', vector: '1→0', vectorLabel: 'V', diagnosis: 'reverse' });
      const notes = loadStudyNotes();
      expect(notes.length).toBe(2);
    });
  });

  describe('updateStudyNote', () => {
    it('应更新笔记内容', () => {
      const note = saveStudyNote({
        cardId: 'test', cardName: 'Test', vector: '0→1', vectorLabel: 'V', diagnosis: 'confusion'
      });
      const success = updateStudyNote(note.id, { notes: '补充笔记' });
      expect(success).toBe(true);
      const updated = loadStudyNotes().find(n => n.id === note.id);
      expect(updated.notes).toBe('补充笔记');
    });

    it('不存在的笔记应返回false', () => {
      const success = updateStudyNote('not-exist', { notes: 'test' });
      expect(success).toBe(false);
    });
  });

  describe('deleteStudyNote', () => {
    it('应删除笔记', () => {
      const note = saveStudyNote({
        cardId: 'test', cardName: 'Test', vector: '0→1', vectorLabel: 'V', diagnosis: 'confusion'
      });
      expect(loadStudyNotes().length).toBe(1);
      deleteStudyNote(note.id);
      expect(loadStudyNotes().length).toBe(0);
    });
  });

  describe('查询功能', () => {
    beforeEach(() => {
      localStorage.removeItem('sh_v9_notes');
      saveStudyNote({ cardId: 'a', cardName: 'A', vector: '0→1', vectorLabel: 'V', diagnosis: 'confusion' });
      saveStudyNote({ cardId: 'a', cardName: 'A', vector: '1→0', vectorLabel: 'V', diagnosis: 'confusion' });
      saveStudyNote({ cardId: 'b', cardName: 'B', vector: '0→1', vectorLabel: 'V', diagnosis: 'reverse' });
    });

    it('getStudyNotesByCard应按卡片过滤', () => {
      expect(getStudyNotesByCard('a').length).toBe(2);
      expect(getStudyNotesByCard('b').length).toBe(1);
      expect(getStudyNotesByCard('c').length).toBe(0);
    });

    it('getStudyNotesByDiagnosis应按标签过滤', () => {
      expect(getStudyNotesByDiagnosis('confusion').length).toBe(2);
      expect(getStudyNotesByDiagnosis('reverse').length).toBe(1);
      expect(getStudyNotesByDiagnosis('gap').length).toBe(0);
    });

    it('getDiagnosisStats应统计标签分布', () => {
      const stats = getDiagnosisStats();
      expect(stats.confusion).toBe(2);
      expect(stats.reverse).toBe(1);
      expect(stats.gap).toBe(0);
      expect(stats.mistake).toBe(0);
    });
  });
});
