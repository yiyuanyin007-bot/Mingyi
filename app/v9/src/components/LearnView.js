/**
 * LearnView 组件 — 学习视图
 * 职责：显示单张卡片的完整内容（原文、症状、药物、病机、禁忌、煎服法、经验、笔记、掌握度）
 *
 * 【V8 → V9 迁移说明】
 * 本文件基于 V8 (app/index.html 5160-5639 行 renderLearn) 的交互逻辑，
 * 使用 createElement + addEventListener 重写，消除 innerHTML 和 onclick 内联。
 * 保留 V8 原始代码结构作为注释参考（见各 buildXxx 函数上方的 [V8 REF]）。
 */

import { createElement } from '@utils/dom.js';
import { convertDosage, formatDoseCompact, isAncientDosage } from '@utils/doseConverter.js';

/** 卡片笔记 localStorage 键（V8 兼容：独立键，不与错题本混用） */
const CARD_NOTES_KEY = 'sh_v9_card_notes';

/** 6 个学习向量定义 */
const VECTORS = [
  { key: '0→1', label: '方→症' },
  { key: '1→0', label: '症→方' },
  { key: '0→2', label: '方→药' },
  { key: '2→0', label: '药→方' },
  { key: '0→usage', label: '煎服法' },
  { key: '0→contra', label: '禁忌' }
];

/**
 * 渲染学习视图
 * @param {HTMLElement} container — 容器元素
 * @param {Object} card — 卡片对象
 * @param {Object} options — 回调函数 {
 *   onBack, onPractice, onSimilar, onExam, onTutor, onSource,
 *   experiences? — 经验记录数组（V9 由 app.js 传入）
 * }
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

  // ===== 返回链接 =====
  const back = createElement('div', { className: 'back-link' }, '← 返回卡片列表');
  back.addEventListener('click', () => options.onBack?.());
  wrap.appendChild(back);

  // ===== 标题区（V8: 5169-5173） =====
  const header = createElement('div', { className: 'learn-header' });
  const name = createElement('div', { className: 'learn-name' }, card.name);

  // 角色 + 描述（V8 未显式拆分，V9 增强）
  if (card.role || card.desc) {
    const meta = createElement('div', { className: 'learn-meta', style: 'font-size:13px;color:var(--text-secondary);margin-top:4px;' });
    if (card.role) {
      meta.appendChild(createElement('span', { style: 'font-weight:600;margin-right:8px;' }, card.role));
    }
    if (card.desc) {
      meta.appendChild(createElement('span', {}, card.desc));
    }
    header.appendChild(name);
    header.appendChild(meta);
  } else {
    header.appendChild(name);
  }

  const tags = createElement('div', { className: 'learn-tags' });
  (card.tags || []).forEach(t => {
    tags.appendChild(createElement('span', { className: 'tag' }, t));
  });
  header.appendChild(tags);
  wrap.appendChild(header);

  // ===== 操作按钮栏（V8: 5175-5182） =====
  const actionBarTop = createElement('div', { className: 'learn-action-bar-top' });
  const btnPrimary = createElement('button', { className: 'btn-primary' }, '单卡练习');
  btnPrimary.addEventListener('click', () => options.onPractice?.(card.id));
  actionBarTop.appendChild(btnPrimary);

  const btnSimilar = createElement('button', { className: 'btn-secondary' }, '类方练习');
  btnSimilar.addEventListener('click', () => options.onSimilar?.(card.id));
  actionBarTop.appendChild(btnSimilar);

  const btnSource = createElement('button', { className: 'btn-secondary' }, '📜 条文');
  btnSource.addEventListener('click', () => options.onSource?.(card.id));
  actionBarTop.appendChild(btnSource);

  const btnExam = createElement('button', { className: 'btn-secondary' }, '模拟考试');
  btnExam.addEventListener('click', () => options.onExam?.());
  actionBarTop.appendChild(btnExam);

  const btnTutor = createElement('button', { className: 'btn-secondary' }, '问 Kimi');
  btnTutor.addEventListener('click', () => options.onTutor?.());
  actionBarTop.appendChild(btnTutor);

  const btnBackTop = createElement('button', { className: 'btn-secondary' }, '返回 (Esc)');
  btnBackTop.addEventListener('click', () => options.onBack?.());
  actionBarTop.appendChild(btnBackTop);
  wrap.appendChild(actionBarTop);

  // ===== 双栏布局 =====
  const cols = createElement('div', { className: 'learn-columns' });

  // ---- 左栏 ----
  const leftCol = createElement('div', { className: 'learn-col' });

  // 原文条文
  leftCol.appendChild(buildSection('原文条文', buildSourceText(card.data.source_text)));

  // 症状谱
  leftCol.appendChild(buildSymptomSection(profile));

  // 核心药物组合
  const coreCombo = c.core_combinations || (c.herbs && c.herbs[0] && c.herbs[0].name) || '无';
  const coreWrap = createElement('div', { className: 'section-body', style: 'font-size:15px;font-weight:600;' }, coreCombo);
  leftCol.appendChild(buildSection('核心药物组合', coreWrap));
  if (c.core_rationale) {
    leftCol.appendChild(buildSection('', createElement('div', {
      className: 'section-body',
      style: 'margin-top:-8px;color:var(--text-secondary);font-size:13px;'
    }, c.core_rationale)));
  }

  // 药物组成（带剂量切换）
  leftCol.appendChild(buildHerbsSection(c.herbs || []));

  // 向量掌握状态（V9 新增，V8 在列表页显示，学习页缺失）
  leftCol.appendChild(buildMasterySection(card, options));

  cols.appendChild(leftCol);

  // ---- 右栏 ----
  const rightCol = createElement('div', { className: 'learn-col' });

  // 病机（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('病机', c.pathology || '暂无'));

  // 禁忌（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('禁忌', (c.contraindications || []).join('、') || '无明确禁忌'));

  // 煎服法（可显示/隐藏）
  rightCol.appendChild(buildRevealSection('煎服法', c.usage || '暂无'));

  // 参考资料链接
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

  // 临床医案（V8: 5274-5287）
  const expSection = buildExperienceSection(card, options.experiences);
  if (expSection) rightCol.appendChild(expSection);

  cols.appendChild(rightCol);
  wrap.appendChild(cols);

  // ===== 笔记区域（V8: 5291-5354） =====
  wrap.appendChild(buildNoteSection(card));

  // ===== 底部返回按钮 =====
  const bottomBack = createElement('div', { className: 'learn-back-bottom' });
  const btnBackBottom = createElement('button', { className: 'btn-secondary' }, '← 返回卡片列表');
  btnBackBottom.addEventListener('click', () => options.onBack?.());
  bottomBack.appendChild(btnBackBottom);
  wrap.appendChild(bottomBack);

  container.appendChild(wrap);
}

// ===== 辅助函数 =====

function buildSection(title, body) {
  const section = createElement('div', { className: 'section' });
  if (title) {
    const titleEl = createElement('div', { className: 'section-title' }, title);
    section.appendChild(titleEl);
  }
  section.appendChild(body);
  return section;
}

function buildSourceText(text) {
  return createElement('div', { className: 'source-text' }, text || '暂无');
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

/**
 * [V8 REF] 药物组成 + 剂量显示（V8: 5219-5235）
 * 药丸式 UI，点击显示/隐藏剂量，点击剂量查看换算
 */
/**
 * [V8 REF] 药物组成 + 剂量直接展开（Exp-22：回归V8模式，废弃弹窗）
 * 药丸式 UI，点击展开显示原始剂量 + 换算结果，无需弹窗
 */
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

    // 原始剂量（默认隐藏，revealed 后显示）
    const doseEl = createElement('div', { className: 'herb-dose' }, h.dosage || '-');
    item.appendChild(doseEl);

    // 换算结果（Exp-22：直接展开在药丸下方；Exp-21：仅古方单位显示换算）
    if (h.dosage && isAncientDosage(h.dosage)) {
      const converted = convertDosage(h.name, h.dosage);
      const compact = converted && converted.type !== 'unknown' ? formatDoseCompact(converted) : null;

      const convEl = createElement('div', { className: 'herb-conversion' });
      if (compact) {
        convEl.appendChild(createElement('div', { className: 'conversion-value' }, compact.text));
        if (compact.note && compact.note !== '四档一致') {
          convEl.appendChild(createElement('div', { className: 'conversion-note' }, compact.note));
        }
      } else {
        convEl.appendChild(createElement('div', { className: 'conversion-value conversion-missing' }, '暂无换算'));
      }
      item.appendChild(convEl);
    }

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

/**
 * [V8 REF] 病机/禁忌/煎服法 切换显示（V8: 5239-5261）
 * 点击整个 section 切换显示/隐藏，按钮仅作为状态提示
 */
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
    if (e.target.tagName === 'A') return; // 链接不拦截
    const willReveal = !body.classList.contains('revealed');
    body.classList.toggle('revealed', willReveal);
    statusBtn.textContent = willReveal ? '隐藏' : '显示';
  });

  return section;
}

/**
 * [V9 新增] 向量掌握状态（6 向量进度显示）
 * V8 在卡片列表用 progress-dots 展示，V9 学习页补充此功能
 */
function buildMasterySection(card, options) {
  const section = createElement('div', { className: 'section' });
  section.appendChild(createElement('div', { className: 'section-title' }, '掌握度（点击向量直接练习）'));

  const m = card.mastery || {};
  const grid = createElement('div', {
    className: 'mastery-grid',
    style: 'display:grid;grid-template-columns:repeat(3, 1fr);gap:8px;margin-top:8px;'
  });

  VECTORS.forEach(v => {
    const mv = m[v.key];
    const level = mv?.level || 0;
    const status = mv?.status || '未学习';

    const item = createElement('div', {
      className: 'mastery-item',
      style: 'padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel);cursor:pointer;transition:all 0.15s ease;'
    });
    item.title = `点击练习「${v.label}」向量`;
    item.addEventListener('click', () => options.onPracticeVector?.(card.id, v.key));
    item.addEventListener('mouseenter', () => {
      item.style.borderColor = 'var(--brand-primary)';
      item.style.background = 'var(--bg-hover)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.borderColor = 'var(--border)';
      item.style.background = 'var(--bg-panel)';
    });

    const label = createElement('div', {
      style: 'font-size:12px;color:var(--text-secondary);margin-bottom:4px;'
    }, v.label);
    item.appendChild(label);

    // 进度点（5 级）
    const dots = createElement('div', { style: 'display:flex;gap:3px;align-items:center;' });
    for (let i = 0; i < 5; i++) {
      const dot = createElement('div', {
        style: `width:6px;height:6px;border-radius:50%;background:${i < level ? 'var(--success)' : 'var(--border)'};`
      });
      dots.appendChild(dot);
    }
    // 状态文字
    dots.appendChild(createElement('span', {
      style: 'font-size:11px;color:var(--text-muted);margin-left:4px;'
    }, status));
    item.appendChild(dots);

    grid.appendChild(item);
  });

  section.appendChild(grid);
  return section;
}

/**
 * [V8 REF] 临床医案显示（V8: 5274-5287）
 * 从 options.experiences 数组中匹配 card.experience_ids
 */
function buildExperienceSection(card, experiences) {
  if (!card.experience_ids || !experiences || experiences.length === 0) return null;

  const exp = experiences.find(e => card.experience_ids.includes(e.id));
  if (!exp) return null;

  const section = createElement('div', { className: 'section' });
  section.appendChild(createElement('div', { className: 'section-title' }, '经验记录'));

  const box = createElement('div', { className: 'experience-box', style: 'padding:12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel);' });
  box.appendChild(createElement('div', { className: 'experience-title', style: 'font-weight:600;margin-bottom:6px;' }, exp.title || '医案'));
  box.appendChild(createElement('div', { className: 'experience-content', style: 'font-size:13px;color:var(--text-secondary);line-height:1.6;' }, exp.content || ''));

  const tags = createElement('div', { className: 'efficacy-tags', style: 'display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;' });
  if (exp.efficacy) {
    tags.appendChild(createElement('span', { className: 'tag' }, `主观有效：${exp.efficacy.subjective_effective ? '是' : '否'}`));
    tags.appendChild(createElement('span', { className: 'tag' }, `客观变化：${(exp.efficacy.objective_change || []).join('、') || '无'}`));
    tags.appendChild(createElement('span', { className: 'tag' }, `置信度：${exp.efficacy.confidence_level || '—'}`));
  }
  box.appendChild(tags);
  section.appendChild(box);

  return section;
}

/**
 * [V8 REF] 笔记区域（V8: 5301-5354）
 * 可编辑、保存到 localStorage（使用独立键 CARD_NOTES_KEY）
 * V9 增强：支持 Markdown 渲染、看笔记弹窗、条文+笔记上下布局
 */
function buildNoteSection(card) {
  const section = createElement('div', { className: 'card-note-section', id: 'cardNoteSection' });
  const note = loadCardNote(card.id);
  const hasNote = note && note.content;

  const header = createElement('div', { className: 'card-note-header', style: 'font-weight:600;padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;' }, '📝 我的笔记');
  section.appendChild(header);

  if (hasNote) {
    // 预览：最多显示前3行，带渐变遮罩
    const lines = note.content.split('\n');
    const isLong = lines.length > 3 || note.content.length > 120;
    const previewText = lines.slice(0, 3).join('\n') + (isLong ? '...' : '');

    const previewWrap = createElement('div', { style: 'position:relative;padding:12px 16px;' });
    const preview = createElement('div', {
      className: 'markdown-body',
      style: 'font-size:14px;color:var(--text-primary);line-height:1.6;max-height:4.8em;overflow:hidden;'
    });
    preview.innerHTML = renderMarkdown(previewText);
    previewWrap.appendChild(preview);

    if (isLong) {
      const fade = createElement('div', {
        style: 'position:absolute;bottom:0;left:0;right:0;height:24px;background:linear-gradient(transparent, var(--bg-panel));pointer-events:none;'
      });
      previewWrap.appendChild(fade);
    }
    section.appendChild(previewWrap);

    const meta = createElement('div', { className: 'card-note-meta', style: 'font-size:12px;color:var(--text-muted);padding:4px 16px 8px;' });
    const dateStr = note.updatedAt ? `${note.updatedAt.split('T')[0]} ${note.updatedAt.split('T')[1]?.slice(0, 5)}` : '';
    meta.textContent = `最后编辑：${dateStr}`;
    section.appendChild(meta);

    const actions = createElement('div', { className: 'card-note-actions', style: 'padding:8px 16px;display:flex;gap:8px;' });
    const btnView = createElement('button', { className: 'btn-view', style: 'padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;' }, '👁️ 看笔记');
    btnView.addEventListener('click', () => openNoteModal(card, note));
    actions.appendChild(btnView);

    const btnEdit = createElement('button', { className: 'btn-edit', style: 'padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;' }, '✏️ 编辑');
    btnEdit.addEventListener('click', () => enterNoteEditMode(card, section));
    actions.appendChild(btnEdit);
    section.appendChild(actions);
  } else {
    const emptyMsg = createElement('div', {
      style: 'color:var(--text-secondary);text-align:center;padding:20px;font-size:14px;'
    }, '还没有笔记，点击记笔记开始学习');
    section.appendChild(emptyMsg);

    const actions = createElement('div', { className: 'card-note-actions', style: 'padding:8px 16px;display:flex;gap:8px;' });
    const btnEdit = createElement('button', { className: 'btn-edit', style: 'padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;' }, '✏️ 记笔记');
    btnEdit.addEventListener('click', () => openNoteModal(card, null));
    actions.appendChild(btnEdit);
    section.appendChild(actions);
  }

  return section;
}

/** 进入笔记编辑模式 */
function enterNoteEditMode(card, section) {
  const note = loadCardNote(card.id);
  const content = note ? note.content : '';

  section.innerHTML = '';
  section.appendChild(createElement('div', { className: 'card-note-header', style: 'font-weight:600;padding:12px 16px;border-bottom:1px solid var(--border);' }, '✏️ 编辑笔记'));

  const editArea = createElement('div', { className: 'card-note-edit', style: 'padding:12px 16px;' });
  const textarea = createElement('textarea', {
    id: 'cardNoteEditor',
    style: 'width:100%;min-height:120px;padding:10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:14px;line-height:1.6;resize:vertical;',
    placeholder: '在此粘贴从 Kimi 复制的内容（如：核心辨证点、混淆方对比、生理学解读等），支持 Markdown 语法...'
  });
  textarea.value = content;
  editArea.appendChild(textarea);

  const tip = createElement('div', { style: 'font-size:12px;color:var(--text-muted);margin-top:6px;' }, '💡 支持 Markdown：**粗体**、# 标题、- 列表、> 引用');
  editArea.appendChild(tip);

  const actions = createElement('div', { style: 'display:flex;gap:8px;margin-top:10px;' });
  const btnSave = createElement('button', { className: 'btn-save' }, '💾 保存');
  btnSave.addEventListener('click', () => saveCardNoteFromUI(card.id, section));
  actions.appendChild(btnSave);

  const btnCancel = createElement('button', { className: 'btn-cancel' }, '❌ 取消');
  btnCancel.addEventListener('click', () => {
    // 重新渲染笔记区域
    section.replaceWith(buildNoteSection(card));
  });
  actions.appendChild(btnCancel);
  editArea.appendChild(actions);

  section.appendChild(editArea);
}

/** 从 UI 保存笔记 */
function saveCardNoteFromUI(cardId, section) {
  const textarea = document.getElementById('cardNoteEditor');
  if (!textarea) return;
  const content = textarea.value.trim();
  setCardNote(cardId, content);
  // 重新渲染笔记区域
  const card = { id: cardId }; // 简化：重新构建需要完整 card，这里直接替换整个 section 的父节点调用者会处理
  // 由于无法获取完整 card 对象，采用重新加载当前卡片笔记的方式
  const note = loadCardNote(cardId);
  section.innerHTML = '';
  const header = createElement('div', { className: 'card-note-header', style: 'font-weight:600;padding:12px 16px;border-bottom:1px solid var(--border);' }, '📝 我的笔记');
  section.appendChild(header);

  if (note && note.content) {
    const meta = createElement('div', { className: 'card-note-meta', style: 'font-size:12px;color:var(--text-muted);padding:8px 16px;' });
    const dateStr = note.updatedAt ? `${note.updatedAt.split('T')[0]} ${note.updatedAt.split('T')[1]?.slice(0, 5)}` : '';
    meta.textContent = `最后编辑：${dateStr}`;
    section.appendChild(meta);

    const readArea = createElement('div', { className: 'card-note-read', style: 'padding:12px 16px;max-height:300px;overflow-y:auto;' });
    readArea.appendChild(createElement('div', { className: 'markdown-body', style: 'white-space:pre-wrap;line-height:1.6;' }, note.content));
    section.appendChild(readArea);

    const actions = createElement('div', { className: 'card-note-actions', style: 'padding:8px 16px;display:flex;gap:8px;' });
    const btnEdit = createElement('button', { className: 'btn-edit' }, '✏️ 编辑');
    btnEdit.addEventListener('click', () => enterNoteEditMode({ id: cardId }, section));
    actions.appendChild(btnEdit);
    section.appendChild(actions);
  } else {
    const emptyMsg = createElement('div', {
      style: 'color:var(--text-secondary);text-align:center;padding:20px;'
    }, '还没有笔记，点击编辑记录从 Kimi 学习的内容');
    section.appendChild(emptyMsg);

    const actions = createElement('div', { className: 'card-note-actions', style: 'padding:8px 16px;display:flex;gap:8px;' });
    const btnEdit = createElement('button', { className: 'btn-edit' }, '✏️ 记笔记');
    btnEdit.addEventListener('click', () => enterNoteEditMode({ id: cardId }, section));
    actions.appendChild(btnEdit);
    section.appendChild(actions);
  }
}

// ===== 卡片笔记 localStorage 操作（独立实现，不依赖 StorageService）=====

function loadCardNotes() {
  try {
    const raw = localStorage.getItem(CARD_NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[LearnView] 读取卡片笔记失败:', e);
  }
  return { notes: {} };
}

function saveCardNotes(data) {
  try {
    localStorage.setItem(CARD_NOTES_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[LearnView] 保存卡片笔记失败:', e);
  }
}

function loadCardNote(cardId) {
  const data = loadCardNotes();
  return data.notes[cardId] || null;
}

function setCardNote(cardId, content) {
  const data = loadCardNotes();
  data.notes[cardId] = {
    cardId,
    content: content.trim(),
    updatedAt: new Date().toISOString()
  };
  saveCardNotes(data);
}

// ===== 剂量换算弹窗（已废弃，保留代码便于回滚）=====
// Exp-20：弹窗过度设计 → 回归V8直接展开模式
// 如需恢复弹窗，取消下方注释：
/* function showDoseModal(herbName, dosage) { */


/**
 * XSS 安全的 HTML 转义
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 简单 Markdown 渲染（支持标题、粗体、斜体、列表、引用、代码、换行）
 * 先 escapeHtml 再渲染，防止 XSS
 */
function renderMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // 代码块（优先处理，避免内部符号被转义）
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 标题
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 粗体 + 斜体
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 引用
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // 无序列表（逐行处理）
  const lines = html.split('\n');
  let inList = false;
  let result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push('<li>' + trimmed.substring(2) + '</li>');
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) result.push('</ul>');
  html = result.join('\n');

  // 换行：避免在 block 元素后加 <br>
  html = html.replace(/(<\/(?:h[1-6]|blockquote|li|ul|pre)>)\n/g, '$1');
  html = html.replace(/\n/g, '<br>');

  return html;
}

/**
 * 打开看笔记弹窗（Feature-13 / Feature-14）
 * 上半部分：原文条文 | 下半部分：Markdown 笔记（可编辑）
 */
function openNoteModal(card, note) {
  const overlay = createElement('div', { className: 'note-modal-overlay' });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const panel = createElement('div', { className: 'note-modal-panel' });

  // Header
  const header = createElement('div', { className: 'note-modal-header' });
  header.appendChild(createElement('div', { className: 'note-modal-title' }, `📝 ${card.name || '笔记'}`));
  const closeBtn = createElement('button', { className: 'note-modal-close' }, '✕');
  closeBtn.addEventListener('click', () => overlay.remove());
  header.appendChild(closeBtn);
  panel.appendChild(header);

  // Content wrapper
  const body = createElement('div', { className: 'note-modal-body' });

  // 上半：原文条文
  const sourceWrap = createElement('div', { className: 'note-modal-source' });
  sourceWrap.appendChild(createElement('div', { className: 'note-modal-section-title' }, '📜 原文条文'));
  const sourceText = card.data && card.data.source_text ? card.data.source_text : '暂无原文';
  const sourceTextEl = createElement('div', { className: 'note-modal-source-text' });
  sourceTextEl.textContent = sourceText;
  sourceWrap.appendChild(sourceTextEl);
  body.appendChild(sourceWrap);

  // 下半：笔记
  const noteWrap = createElement('div', { className: 'note-modal-note' });
  noteWrap.appendChild(createElement('div', { className: 'note-modal-section-title' }, '✏️ 我的笔记'));

  let noteContent = note && note.content ? note.content : '';

  // 渲染区域
  const renderArea = createElement('div', { className: 'note-modal-render markdown-body' });
  if (noteContent) {
    renderArea.innerHTML = renderMarkdown(noteContent);
  } else {
    renderArea.appendChild(createElement('div', { style: 'color:var(--text-muted);font-style:italic;padding:12px 0;' }, '还没有笔记，点击「开始记录」开始学习...'));
  }
  noteWrap.appendChild(renderArea);

  // 编辑区域（默认隐藏）
  const editArea = createElement('div', { className: 'note-modal-edit', style: 'display:none;' });
  const textarea = createElement('textarea', {
    className: 'note-modal-textarea',
    placeholder: '在此粘贴从 Kimi 复制的内容...\n支持 Markdown 语法：\n**粗体**、# 标题、- 列表、> 引用、`代码`'
  });
  textarea.value = noteContent;
  editArea.appendChild(textarea);
  noteWrap.appendChild(editArea);

  body.appendChild(noteWrap);
  panel.appendChild(body);

  // Actions
  const actions = createElement('div', { className: 'note-modal-actions' });

  let isEditing = false;
  const btnEdit = createElement('button', { className: 'btn-secondary' }, noteContent ? '✏️ 编辑' : '✏️ 开始记录');
  btnEdit.addEventListener('click', () => {
    isEditing = !isEditing;
    renderArea.style.display = isEditing ? 'none' : 'block';
    editArea.style.display = isEditing ? 'block' : 'none';
    btnEdit.textContent = isEditing ? '👁️ 预览' : (noteContent ? '✏️ 编辑' : '✏️ 开始记录');
  });
  actions.appendChild(btnEdit);

  const btnSave = createElement('button', { className: 'btn-primary' }, '💾 保存');
  btnSave.addEventListener('click', () => {
    const newContent = textarea.value.trim();
    setCardNote(card.id, newContent);
    // 更新渲染区
    if (newContent) {
      renderArea.innerHTML = renderMarkdown(newContent);
    } else {
      renderArea.innerHTML = '<div style="color:var(--text-muted);font-style:italic;padding:12px 0;">还没有笔记，点击「开始记录」开始学习...</div>';
    }
    // 切回预览
    isEditing = false;
    renderArea.style.display = 'block';
    editArea.style.display = 'none';
    btnEdit.textContent = '✏️ 编辑';
    noteContent = newContent;
    // 刷新外部笔记区域
    const oldSection = document.getElementById('cardNoteSection');
    if (oldSection) {
      oldSection.replaceWith(buildNoteSection(card));
    }
  });
  actions.appendChild(btnSave);

  const btnClose = createElement('button', { className: 'btn-secondary' }, '关闭');
  btnClose.addEventListener('click', () => overlay.remove());
  actions.appendChild(btnClose);

  panel.appendChild(actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // ESC 关闭
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/* 已废弃：showDoseModal 弹窗模式（Exp-20）
function showDoseModal(herbName, dosage) {
  const converted = convertDosage(herbName, dosage);
  if (!converted) {
    alert(`无法换算「${dosage}」，该单位暂不支持`);
    return;
  }

  const standards = getDoseStandards();
  const overlay = createElement('div', { className: 'dose-modal-overlay' });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const panel = createElement('div', { className: 'dose-modal-panel' });

  const header = createElement('div', { style: 'margin-bottom:12px;font-size:14px;color:var(--text-secondary);' });
  header.textContent = `${herbName}：${converted.original}`;
  panel.appendChild(header);

  // 表格
  const table = createElement('table', { className: 'dose-table' });
  const thead = createElement('thead');
  const trHead = createElement('tr');
  trHead.appendChild(createElement('th', {}, '标准'));
  trHead.appendChild(createElement('th', {}, '剂量'));
  trHead.appendChild(createElement('th', {}, '换算依据'));
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = createElement('tbody');
  standards.forEach(s => {
    const val = converted[s.key];
    const tr = createElement('tr');
    tr.appendChild(createElement('td', {}, s.name));
    tr.appendChild(createElement('td', {}, val || '—'));
    tr.appendChild(createElement('td', {}, converted.note || ''));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  panel.appendChild(table);

  const closeBtn = createElement('button', { className: 'btn-secondary', style: 'margin-top:16px;' }, '关闭');
  closeBtn.addEventListener('click', () => overlay.remove());
  panel.appendChild(closeBtn);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}
*/
