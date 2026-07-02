/**
 * 安全的 DOM 操作工具集
 * 替代 innerHTML，消除 XSS 风险
 */

/**
 * 创建带文本内容的元素（安全替代 innerHTML）
 * @param {string} tag - 元素标签名
 * @param {Object} props - 属性对象（如 { className: 'btn', id: 'submit' }）
 * @param {string|Node} content - 文本内容或子节点
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tag, props = {}, content = '') {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([key, val]) => {
    if (key === 'className') {
      el.className = val;
    } else if (key === 'dataset') {
      Object.entries(val).forEach(([dKey, dVal]) => {
        el.dataset[dKey] = dVal;
      });
    } else if (key.startsWith('on') && typeof val === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      el.setAttribute(key, val);
    }
  });

  if (content) {
    if (typeof content === 'string') {
      el.textContent = content;
    } else if (content instanceof Node) {
      el.appendChild(content);
    } else if (Array.isArray(content)) {
      content.forEach(c => {
        if (typeof c === 'string') {
          el.appendChild(document.createTextNode(c));
        } else if (c instanceof Node) {
          el.appendChild(c);
        }
      });
    }
  }
  return el;
}

/**
 * 清空元素所有子节点（安全替代 innerHTML = ''）
 * @param {HTMLElement} el
 */
export function clearChildren(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * 批量渲染列表到容器
 * @param {HTMLElement} container - 容器元素
 * @param {Array} items - 数据数组
 * @param {Function} renderFn - 渲染函数：item => HTMLElement
 */
export function renderList(container, items, renderFn) {
  clearChildren(container);
  items.forEach(item => {
    const node = renderFn(item);
    if (node) container.appendChild(node);
  });
}

/**
 * 事件委托：在父元素上监听子元素事件
 * @param {HTMLElement} parent - 父元素
 * @param {string} event - 事件类型（如 'click'）
 * @param {string} selector - 子元素选择器
 * @param {Function} handler - 事件处理器
 */
export function delegate(parent, event, selector, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}

/**
 * 转义 HTML 特殊字符，防止 XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
