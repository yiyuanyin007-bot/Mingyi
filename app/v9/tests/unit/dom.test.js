import { describe, it, expect } from 'vitest';
import { createElement, clearChildren, escapeHtml } from '@utils/dom.js';

// jsdom 环境下 document 可用
describe('dom utils', () => {
  it('createElement 创建带文本的元素', () => {
    const el = createElement('div', { className: 'test' }, 'Hello');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('test');
    expect(el.textContent).toBe('Hello');
  });

  it('clearChildren 清空子节点', () => {
    const parent = document.createElement('div');
    parent.appendChild(document.createElement('span'));
    parent.appendChild(document.createElement('span'));
    clearChildren(parent);
    expect(parent.childNodes.length).toBe(0);
  });

  it('escapeHtml 转义特殊字符', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});
