/**
 * LearnView 组件 — 学习视图
 * 职责：显示单张卡片的完整内容（原文、症状、药物、病机、禁忌、煎服法、经验）
 */

import { createElement } from '@utils/dom.js';
import { convertDosage, getDoseStandards } from '@utils/doseConverter.js';

/**
 * 渲染学习视图
 * @param {HTMLElement} container — 容器元素
 * @param {Object} card — 卡片对象
 * @param {Object} options — 回调函数 { onBack, onPractice, onSimilar, onExam, onTutor }
 */
export function renderLearnView(container, card, options = {}) {
  container.innerHTML = '';

  if (!card || !card.data) {
    container.appendChild(createElement('div', { className: 'error-boundary' }, '卡片数据缺失'));
    return;
  }

  const c = card.data.canonical || {};
  const profile = c.symptom_profile || {};

  // 主容器
  const wrap = createElement('div', { className: 'learn-container' });

  // 返回链接
  const back = createElement('div', { className: 'back-link' }, '← 返回卡片列表');
  back.addEventListener('click', () => options.onBack?.());
  wrap.appendChild(back);

  // 标题
  const header = createElement('div', { className: 'learn-header' });
  const name = createElement('div', { className: 'learn-name' }, card.name);
  const tags = createElement('div', { className: 'learn-tags' });
  (card.tags || []).forEach(t => {
    tags.appendChild(createElement('span', { className: 'tag' }, t));
  });
  header.appendChild(name);
  header.appendChild(tags);
  wrap.appendChild(header);

  // 双栏布局
  const cols = createElement('div', { className: 'learn-columns' });

  // 左栏
  const leftCol = createElement('div', { className: 'learn-col' });

  // 原文条文
  leftCol.appendChild(buildSection('原文条文', buildSourceText(card.data.source_text)));

  // 症状谱
  leftCol.appendChild(buildSymptomSection(profile));

  // 核心药物组合
  const coreCombo = c.core_combinations || (c.herbs && c.herbs[0] && c.herbs[0].name) || '无';
  leftCol.appendChild(buildSection('核心药物组合', createElement('div', { className: 'section-body', style: 'font-size:15px;font-weight:600;' }, coreCombo)));

  // 药物组成（带剂量切换）
  leftCol.appendChild(buildHerbsSection(c.herbs || []));

  cols.appendChild(leftCol);

  // 右栏
  const rightCol = createElement('div', { className: 'learn-col' });

  // 病机（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('病机', c.pathology || '暂无'));

  // 禁忌（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('禁忌', (c.contraindications || []).join('、') || '无明确禁忌'));

  // 煎服法（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('煎服法', c.usage || '暂无'));

  // 参考资料链接（始终显示框，无论有无内容）
  const refBody = createElement('div', { className: 'section-body' });
  if (c.core_source_urls && c.core_source_urls.length > 0) {
    c.core_source_urls.forEach(url => {
      const link = createElement('a', { href: url, target: '_blank', rel: 'noopener', className: 'ref-link' }, url);
      refBody.appendChild(link);
      refBody.appendChild(document.createElement('br'));
    });
  } else {
    refBody.appendChild(createElement('span', { style: 'color:var(--text-muted);' }, '暂无'));
  }
  rightCol.appendChild(buildSection('参考资料', refBody));

  cols.appendChild(rightCol);
  wrap.appendChild(cols);

  // 操作按钮
  const actionBar = createElement('div', { className: 'action-bar' });
  const btnSource = createElement('button', { className: 'btn-secondary' }, '📜 条文');
  btnSource.addEventListener('click', () => options.onSource?.(card.id));
  actionBar.appendChild(btnSource);

  const btnPrimary = createElement('button', { className: 'btn-primary' }, '单卡练习');
  btnPrimary.addEventListener('click', () => options.onPractice?.(card.id));
  actionBar.appendChild(btnPrimary);

  const btnSimilar = createElement('button', { className: 'btn-secondary' }, '类方练习');
  btnSimilar.addEventListener('click', () => options.onSimilar?.(card.id));
  actionBar.appendChild(btnSimilar);

  const btnExam = createElement('button', { className: 'btn-secondary' }, '模拟考试');
  btnExam.addEventListener('click', () => options.onExam?.());
  actionBar.appendChild(btnExam);

  const btnTutor = createElement('button', { className: 'btn-secondary' }, '问 Kimi');
  btnTutor.addEventListener('click', () => options.onTutor?.());
  actionBar.appendChild(btnTutor);

  const btnBack = createElement('button', { className: 'btn-secondary' }, '返回 (Esc)');
  btnBack.addEventListener('click', () => options.onBack?.());
  actionBar.appendChild(btnBack);

  wrap.appendChild(actionBar);
  container.appendChild(wrap);
}

// ===== 辅助函数 =====

function buildSection(title, body) {
  const section = createElement('div', { className: 'section' });
  const titleEl = createElement('div', { className: 'section-title' }, title);
  section.appendChild(titleEl);
  section.appendChild(body);
  return section;
}

function buildSourceText(text) {
  const el = createElement('div', { className: 'source-text' }, text || '暂无');
  return el;
}

function buildSymptomSection(profile) {
  const section = createElement('div', { className: 'section' });
  section.appendChild(createElement('div', { className: 'section-title' }, '症状谱'));

  const groups = [
    { label: '必要症（出现此方才成立）', items: profile.necessary || [], className: 'necessary' },
    { label: '常见症（可出现也可不出现）', items: profile.common || [], className: '' },
    { label: '排除症（出现则排除此方）', items: profile.excluding || [], className: 'excluding' }
  ];

  groups.forEach(g => {
    const group = createElement('div', { className: 'symptom-group' });
    group.appendChild(createElement('div', { className: 'symptom-label' }, g.label));
    const items = createElement('div', { className: 'symptom-items' });
    if (g.items.length > 0) {
      g.items.forEach(s => {
        items.appendChild(createElement('span', { className: 'symptom-item ' + g.className }, s));
      });
    } else {
      items.appendChild(createElement('span', { className: 'symptom-item' }, '暂无'));
    }
    group.appendChild(items);
    section.appendChild(group);
  });

  return section;
}

function buildHerbsSection(herbs) {
  const section = createElement('div', { className: 'section' });
  const titleRow = createElement('div', { className: 'section-title-row' });
  titleRow.appendChild(createElement('div', { className: 'section-title' }, '药物组成'));
  const toggleBtn = createElement('button', { className: 'reveal-btn' }, '显示全部剂量');
  titleRow.appendChild(toggleBtn);
  section.appendChild(titleRow);

  const grid = createElement('div', { className: 'herbs-grid' });
  herbs.forEach(h => {
    const item = createElement('div', { className: 'herb-item' });
    item.appendChild(createElement('div', { className: 'herb-name' }, h.name));
    
    // 剂量显示，点击可查看换算
    const doseEl = createElement('div', { className: 'herb-dose' }, h.dosage || '-');
    if (h.dosage) {
      doseEl.style.cursor = 'pointer';
      doseEl.title = '点击查看剂量换算';
      doseEl.addEventListener('click', (e) => {
        e.stopPropagation();
        showDoseModal(h.name, h.dosage);
      });
    }
    item.appendChild(doseEl);
    
    item.addEventListener('click', () => item.classList.toggle('revealed'));
    grid.appendChild(item);
  });
  section.appendChild(grid);

  toggleBtn.addEventListener('click', () => {
    const items = grid.querySelectorAll('.herb-item');
    const anyHidden = Array.from(items).some(i => !i.classList.contains('revealed'));
    items.forEach(i => i.classList.toggle('revealed', anyHidden));
    toggleBtn.textContent = anyHidden ? '隐藏全部剂量' : '显示全部剂量';
  });

  return section;
}

function buildRevealSection(title, content) {
  const section = createElement('div', { className: 'section' });
  const titleRow = createElement('div', { className: 'section-title-row' });
  titleRow.appendChild(createElement('div', { className: 'section-title' }, title));
  const statusBtn = createElement('button', { className: 'reveal-btn' }, '显示');
  statusBtn.style.pointerEvents = 'none'; // 按钮不可点击，仅作为状态提示
  titleRow.appendChild(statusBtn);
  section.appendChild(titleRow);

  const body = createElement('div', { className: 'section-body reveal-content' }, content);
  section.appendChild(body);

  // 点击整个 section 切换显示/隐藏
  section.addEventListener('click', (e) => {
    // 如果点击的是链接，不阻止默认行为
    if (e.target.tagName === 'A') return;
    const willReveal = !body.classList.contains('revealed');
    body.classList.toggle('revealed', willReveal);
    statusBtn.textContent = willReveal ? '隐藏' : '显示';
  });

  return section;
}


/**
 * 显示剂量换算弹窗
 * @private
 */
function showDoseModal(herbName, dosage) {
  const converted = convertDosage(herbName, dosage);
  if (!converted) {
    alert(`无法换算「${dosage}」，该单位暂不支持`);
    return;
  }

  const standards = getDoseStandards();
  let html = `
    <div style="margin-bottom:12px;font-size:14px;color:var(--text-secondary);">
      ${herbName}：${converted.original}
    </div>
    <table class="dose-table">
      <thead>
        <tr><th>标准</th><th>剂量</th><th>换算依据</th></tr>
      </thead>
      <tbody>
        ${standards.map(s => {
          const val = converted[s.key];
          return `<tr><td>${s.name}</td><td>${val || '—'}</td><td>${converted.note || ''}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
  `;

  // 创建弹窗
  const overlay = createElement('div', { className: 'dose-modal-overlay' });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  
  const panel = createElement('div', { className: 'dose-modal-panel' });
  panel.innerHTML = html;
  
  const closeBtn = createElement('button', { className: 'btn-secondary', style: 'margin-top:16px;' }, '关闭');
  closeBtn.addEventListener('click', () => overlay.remove());
  panel.appendChild(closeBtn);
  
  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}
