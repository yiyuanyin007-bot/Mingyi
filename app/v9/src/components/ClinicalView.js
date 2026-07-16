/**
 * ClinicalView — 临床录入视图
 * 职责：文本解析 → 症状展示 → 方剂匹配 → 十问歌评估 → 诊疗决策
 * 参考 V8 index.html 行 7690-8289
 */

import { initClinical, parseText, matchFormulas, evaluateCollection, createRecord, getRecord, updateRecord, loadRecords } from '@services/ClinicalService.js';
import * as Storage from '@services/ClinicalStorage.js';

// ──────────────────────────────────────────────
// 症状标签分类数据（双维度：六经辨证 + 从头到脚）
// ──────────────────────────────────────────────

/**
 * 维度一：六经辨证
 * 取自《伤寒论》六经病提纲证与常用鉴别症状
 * 保留舌脉/二便等在六经框架内的关键定位症状
 */
const SIX_MERIDIAN_TAGS = [
  {
    category: '太阳病',
    icon: '☀️',
    tags: ['恶寒', '恶风', '发热', '头痛', '身痛', '项背强几几', '无汗', '汗出', '喘', '脉浮']
  },
  {
    category: '阳明病',
    icon: '🔥',
    tags: ['口渴', '大汗', '大热', '便秘', '腹满', '潮热', '谵语', '脉洪大']
  },
  {
    category: '少阳病',
    icon: '🌙',
    tags: ['口苦', '咽干', '目眩', '往来寒热', '胸胁苦满', '默默不欲饮食', '心烦', '喜呕', '脉弦']
  },
  {
    category: '太阴病',
    icon: '🌧',
    tags: ['腹满而吐', '食不下', '自利', '时腹自痛', '口不渴', '四肢无力']
  },
  {
    category: '少阴病',
    icon: '❄️',
    tags: ['但欲寐', '脉微细', '四肢厥逆', '恶寒倦卧', '下利清谷', '心烦不得卧']
  },
  {
    category: '厥阴病',
    icon: '⚡',
    tags: ['消渴', '气上撞心', '心中疼热', '饥而不欲食', '下利', '呕吐', '厥热胜复']
  },
  {
    category: '舌脉·二便',
    icon: '👅',
    tags: ['舌淡红', '舌红', '舌暗', '苔白', '苔黄', '苔腻', '苔薄', '脉浮', '脉沉', '脉数', '脉迟', '脉滑', '脉弦', '脉细', '脉弱', '微脉', '小便清长', '小便短赤', '小便不利', '大便溏', '大便干', '大便难']
  }
];

/**
 * 维度二：从头到脚（部位辨证）
 * 按人体部位自上而下组织，用于快速问诊采集
 */
const BODY_SYSTEM_TAGS = [
  {
    category: '头面',
    icon: '👤',
    tags: ['头痛', '头晕', '头重', '头皮发麻', '面色萎黄', '面色赤', '面色苍白', '面肿', '目眩', '目干涩', '目赤', '耳鸣', '耳聋', '鼻塞', '流涕', '鼻衄', '口苦', '口干', '口臭', '口淡', '口腔溃疡']
  },
  {
    category: '颈项胸胁',
    icon: '🫁',
    tags: ['项背强几几', '颈项僵硬', '胸胁苦满', '胸闷', '胸痛', '心悸', '胁痛', '乳房胀痛', '咳嗽', '喘', '气短']
  },
  {
    category: '脘腹',
    icon: '🫃',
    tags: ['心下痞', '胃胀', '胃痛', '腹满', '腹痛', '腹胀', '少腹痛', '小腹痛', '腹满而吐', '饥而不欲食', '默默不欲饮食']
  },
  {
    category: '腰背四肢',
    icon: '💪',
    tags: ['腰痛', '背痛', '身痛', '身重', '四肢无力', '四肢厥逆', '手足心热', '手足麻木', '关节痛', '浮肿', '肌肉跳动']
  },
  {
    category: '全身·寒热·汗',
    icon: '🌡️',
    tags: ['恶寒', '恶风', '发热', '寒热往来', '潮热', '身热不扬', '五心烦热', '汗出', '无汗', '自汗', '盗汗', '但欲寐', '乏力', '消瘦', '肥胖']
  },
  {
    category: '饮食·睡眠·二便',
    icon: '🍽️',
    tags: ['纳呆', '纳差', '多食', '口渴', '消渴', '失眠', '多梦', '嗜睡', '大便溏', '大便干', '大便难', '下利', '下利清谷', '便秘', '小便清长', '小便短赤', '小便不利']
  },
  {
    category: '神志·情绪',
    icon: '🧠',
    tags: ['心烦', '心烦不得卧', '谵语', '默默不语', '烦躁', '易怒', '善太息', '悲伤欲哭', '健忘', '气上撞心', '心中疼热']
  }
];

// ──────────────────────────────────────────────
// 症状标签样式注入（Phase 1）
// ──────────────────────────────────────────────
(function injectSymptomTagStyles() {
  const styleId = 'clinical-symptom-tag-styles';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* 症状标签区域 */
    .symptom-tags-section { margin-top: 8px; }
    .symptom-tags-container {
      display: flex; flex-direction: column; gap: 4px;
      max-height: 320px; overflow-y: auto;
      padding: 8px; background: var(--bg-card, #f8f9fa); border-radius: 8px;
      border: 1px solid var(--border-color, #e0e0e0);
    }
    /* 每个分类组 */
    .symptom-tag-group { border: none; margin: 0; }
    .symptom-tag-group[open] { padding-bottom: 4px; }
    .symptom-tag-summary {
      cursor: pointer; font-size: 13px; font-weight: 600;
      padding: 4px 0; color: var(--text-primary, #333);
      user-select: none;
    }
    .symptom-tag-summary:hover { color: var(--brand-primary, #4a90d9); }
    .tag-count { font-weight: 400; font-size: 11px; color: var(--text-muted, #999); }
    /* 标签列表 */
    .symptom-tag-list { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0 8px 0; }
    .symptom-tag {
      display: inline-block; padding: 4px 10px; font-size: 12px;
      background: var(--bg-tag, #e8f0fe); color: var(--text-primary, #333);
      border: 1px solid var(--border-color, #d0d8e8); border-radius: 14px;
      cursor: pointer; user-select: none; transition: all 0.15s;
      line-height: 1.4; white-space: nowrap;
    }
    .symptom-tag:hover {
      background: var(--brand-primary, #4a90d9); color: #fff;
      border-color: var(--brand-primary, #4a90d9); transform: translateY(-1px);
    }
    /* 双维度分隔 */
    .symptom-tag-dimension-header {
      font-size: 13px; font-weight: 700; color: var(--text-primary, #333);
      padding: 6px 0 2px 0; margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    /* 标签点击反馈 */
    .symptom-tag.tag-added {
      background: #34c759 !important; color: #fff !important;
      border-color: #34c759 !important; transform: scale(1.05);
    }
    .symptom-tag.tag-exists {
      background: #ff9500 !important; color: #fff !important;
      border-color: #ff9500 !important; animation: tag-shake 0.3s;
    }
    @keyframes tag-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
    /* 评估上下文标题 */
    .assess-context { margin-bottom: 8px; }
    /* 查看评估详情按钮 */
    .btn-link-view-assess {
      display: block; width: 100%; margin-top: 8px; padding: 6px 12px;
      background: transparent; color: var(--brand-primary, #4a90d9);
      border: 1px dashed var(--brand-primary, #4a90d9); border-radius: 6px;
      cursor: pointer; font-size: 12px; text-align: center; transition: all 0.15s;
    }
    .btn-link-view-assess:hover {
      background: var(--brand-primary, #4a90d9); color: #fff;
    }
  `;
  document.head.appendChild(style);
})();

/**
 * 渲染临床录入视图
 * @param {HTMLElement} container - 挂载容器
 * @param {Object} [options]
 * @param {Function} [options.onBack] - 返回回调
 */
export async function renderClinicalView(container, options = {}) {
  const { onBack } = options;

  // 1. 加载临床数据
  const clinical = await initClinical();

  // 2. 渲染外壳
  container.innerHTML = `
    <div class="clinical-layout">
      <div class="clinical-header">
        <button class="btn-back" id="btnClinicalBack">← 返回</button>
        <h2 class="clinical-title">临床录入</h2>
        <span class="clinical-badge" id="clinicalBadge">档案: ${clinical.records.length}</span>
      </div>
      <div class="clinical-tabs" id="clinicalTabs">
        <button class="clinical-tab active" data-tab="input">📝 输入</button>
        <button class="clinical-tab" data-tab="matching">🔍 方剂</button>
        <button class="clinical-tab" data-tab="assess">📊 评估</button>
        <button class="clinical-tab" data-tab="collect">📋 采集</button>
        <button class="clinical-tab" data-tab="records">🗂 档案</button>
      </div>
      <div class="clinical-content" id="clinicalContent">
        ${renderInputTab()}
      </div>
    </div>
  `;

  // 3. 绑定事件
  const state = {
    records: clinical.records,
    currentRecord: null,
    parsedSymptoms: [],
    symptomQuotes: [],
    matchResults: [],
    collectionEval: null
  };

  bindTabSwitcher(container, state);
  bindInputEvents(container, state);
  if (onBack) {
    container.querySelector('#btnClinicalBack').addEventListener('click', onBack);
  }
}

// ──────────────────────────────────────────────
// Tab 渲染
// ──────────────────────────────────────────────

function renderInputTab() {
  // 生成一组 symptom-tag-group 的 HTML
  function renderTagGroups(groups) {
    return groups.map(group => `
      <details class="symptom-tag-group" open>
        <summary class="symptom-tag-summary">${group.icon} ${group.category} <span class="tag-count">(${group.tags.length})</span></summary>
        <div class="symptom-tag-list">
          ${group.tags.map(tag => `<span class="symptom-tag" data-tag="${tag}">${tag}</span>`).join('')}
        </div>
      </details>
    `).join('');
  }

  return `
    <div class="clinical-panel">
      <div class="clinical-section">
        <label class="clinical-label">患者主诉 / IMA 粘贴文本</label>
        <textarea class="clinical-textarea" id="clinicalInput" rows="8" placeholder="粘贴患者症状描述、舌脉、问诊记录…"></textarea>
      </div>
      <div class="clinical-section symptom-tags-section">
        <label class="clinical-label">快速症状标签 <span class="text-muted" style="font-size:12px;">（点击追加到文本框）</span></label>
        <div class="symptom-tags-container" id="symptomTagsContainer">
          <div class="symptom-tag-dimension">
            <div class="symptom-tag-dimension-header">辨证路径 · 六经辨证</div>
            ${renderTagGroups(SIX_MERIDIAN_TAGS)}
          </div>
          <div class="symptom-tag-dimension" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border-color, #e0e0e0);">
            <div class="symptom-tag-dimension-header">问诊采集 · 从头到脚</div>
            ${renderTagGroups(BODY_SYSTEM_TAGS)}
          </div>
        </div>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">患者姓名（可选）</label>
        <input class="clinical-input" id="clinicalPatientName" placeholder="匿名" />
      </div>
      <div class="clinical-section">
        <label class="clinical-label">笔记备注（可选）</label>
        <textarea class="clinical-textarea" id="clinicalNote" rows="2" placeholder="记录诊断思路…"></textarea>
      </div>
      <div class="clinical-actions">
        <button class="btn-primary" id="btnClinicalParse">解析症状</button>
        <button class="btn-secondary" id="btnClinicalClear">清空</button>
      </div>
      <div id="clinicalParseResult"></div>
    </div>
  `;
}

function renderMatchingTab(parsedSymptoms, selectedFormulaId) {
  if (!parsedSymptoms || parsedSymptoms.length === 0) {
    return `<div class="clinical-panel"><p class="clinical-empty">请先在「输入」tab 解析症状。</p></div>`;
  }
  const results = matchFormulas(parsedSymptoms, { topN: 5 });

  let html = `<div class="clinical-panel">`;
  html += `<div class="clinical-section"><label class="clinical-label">匹配结果（基于 ${parsedSymptoms.length} 个症状）</label></div>`;

  if (results.length === 0) {
    html += `<p class="clinical-empty">未匹配到合适方剂。必要症状匹配率不足。</p>`;
  } else {
    results.forEach((r, i) => {
      const disq = r.disqualified ? `<span class="badge-error">有禁忌症状</span>` : '';
      const boost = r.article_boost > 0 ? `<span class="badge-info">文章关联+${r.article_boost}</span>` : '';
      const isSelected = selectedFormulaId === r.formula_id;
      html += `
        <div class="clinical-match-card ${r.disqualified ? 'clinical-match-disqualified' : ''} ${isSelected ? 'clinical-match-selected' : ''}" data-formula-id="${r.formula_id}" data-action="select-match">
          <div class="match-header">
            <span class="match-rank">#${i + 1}</span>
            <span class="match-name">${r.formula_name_cn || r.formula_name}</span>
            <span class="match-score">${r.score} 分</span>
            ${disq} ${boost}
            ${isSelected ? '<span class="badge-success">已选</span>' : ''}
          </div>
          <div class="match-detail">
            <div class="match-detail-row">
              <span class="match-detail-label">必要症状匹配:</span>
              <span class="match-detail-value">${r.necessary_match.join('、') || '无'} 
                ${r.necessary_miss.length > 0 ? `<span class="text-muted">(未命中: ${r.necessary_miss.join('、')})</span>` : ''}
              </span>
            </div>
            <div class="match-detail-row">
              <span class="match-detail-label">常见症状匹配:</span>
              <span class="match-detail-value">${r.common_match.join('、') || '无'}</span>
            </div>
            ${r.excluding_hit.length > 0 ? `
            <div class="match-detail-row">
              <span class="match-detail-label text-error">禁忌症状:</span>
              <span class="match-detail-value text-error">${r.excluding_hit.join('、')}</span>
            </div>` : ''}
            ${r.message ? `<div class="match-message">${r.message}</div>` : ''}
          </div>
          <details class="match-details-expand">
            <summary>查看详情</summary>
            <div class="match-full-detail">
              ${r.pathology ? `<p><strong>病机：</strong>${r.pathology}</p>` : ''}
              ${r.herbs && r.herbs.length > 0 ? `
                <p><strong>药物组成：</strong>${r.herbs.map(h => h.name + (h.dosage ? ` ${h.dosage}` : '')).join('、')}</p>
              ` : ''}
              ${r.usage ? `<p><strong>煎服法：</strong>${r.usage}</p>` : ''}
              ${r.contraindications && r.contraindications.length > 0 ? `
                <p><strong>注意事项：</strong>${r.contraindications.join('；')}</p>
              ` : ''}
              <p class="text-muted" style="font-size:12px;margin-top:8px;">方剂 ID: ${r.formula_id}</p>
            </div>
          </details>
          <!-- Phase 2：匹配→评估联动按钮 -->
          <button class="btn-sm btn-link-view-assess" data-action="view-assess" data-formula-id="${r.formula_id}" data-formula-name="${r.formula_name_cn || r.formula_name}">
            📊 查看评估详情
          </button>
        </div>
      `;
    });
  }

  // 操作按钮
  html += `<div class="clinical-section clinical-actions">`;
  html += `<button class="btn-secondary" id="btnAssessFromMatch">📊 去评估完整性</button>`;
  html += `<button class="btn-secondary" id="btnCollectFromMatch">📋 去补采信息</button>`;
  html += `</div>`;

  html += `</div>`;
  return html;
}

/**
 * 获取当前评估上下文（显示在评估 tab 的匹配方名称）
 */
function _getAssessContext(state) {
  return state._assessContextFormula || '';
}

function renderAssessTab(symptomVector, state) {
  if (!symptomVector || symptomVector.length === 0) {
    return `<div class="clinical-panel"><p class="clinical-empty">请先在「输入」tab 解析症状。</p></div>`;
  }
  const evalResult = evaluateCollection(symptomVector);
  let html = `<div class="clinical-panel">`;

  // Phase 2：评估上下文标题（来自"查看评估详情"按钮）
  const ctxFormula = state ? _getAssessContext(state) : '';
  if (ctxFormula) {
    html += `<div class="clinical-section assess-context">
      <span class="badge-info">📊 ${ctxFormula} 的十问歌评估</span>
      <button class="btn-sm btn-link" id="btnClearAssessContext" style="margin-left:8px;">× 清除</button>
    </div>`;
  }

  // ⭐ 评级卡片
  const stars = '⭐'.repeat(evalResult.stars) || '暂无评级';
  const ratePct = Math.round(evalResult.rate * 100);
  html += `
    <div class="clinical-section">
      <label class="clinical-label">十问歌采集完整性评估</label>
      <div class="assess-summary">
        <span class="assess-stars">${stars}</span>
        <span class="assess-rate">${evalResult.covered}/${evalResult.total} 维度已采集 (${ratePct}%)</span>
      </div>
    </div>
  `;

  // 维度列表
  html += `<div class="assess-dimensions">`;
  evalResult.dimensions.forEach(dim => {
    const icon = dim.covered ? '✅' : '⬜';
    const matchedStr = dim.matched.length > 0 ? ` (${dim.matched.slice(0, 3).join('、')}${dim.matched.length > 3 ? '…' : ''})` : '';
    html += `
      <div class="assess-dim ${dim.covered ? 'covered' : 'missing'}">
        <span class="dim-icon">${icon}</span>
        <span class="dim-name">${dim.label}</span>
        <span class="dim-matched text-muted">${matchedStr}</span>
        ${!dim.covered ? '<span class="dim-warn">⚠ 未采集</span>' : ''}
      </div>
    `;
  });
  html += `</div>`;

  // 完整度建议
  if (evalResult.rate < 0.6) {
    const missing = evalResult.dimensions.filter(d => !d.covered).map(d => d.label).join('、');
    html += `
      <div class="clinical-section">
        <div class="assess-advice">
          <strong>💡 建议补充：</strong> ${missing}
        </div>
      </div>
    `;
  }

  // 操作按钮：补采 / 回到匹配 / 采集保存
  html += `<div class="clinical-section clinical-actions" style="margin-top:16px;">`;
  html += `<button class="btn-primary" id="btnCollectFromAssess">📝 补采信息</button>`;
  html += `<button class="btn-secondary" id="btnMatchFromAssess">🔍 去匹配方剂</button>`;
  html += `<button class="btn-secondary" id="btnSaveFromAssess">💾 直接保存</button>`;
  html += `</div>`;

  html += `</div>`;
  return html;
}

function bindAssessEvents(container, state) {
  // Phase 2：清除评估上下文按钮
  const btnClearCtx = container.querySelector('#btnClearAssessContext');
  if (btnClearCtx) {
    btnClearCtx.addEventListener('click', () => {
      state._assessContextFormula = '';
      const content = container.querySelector('#clinicalContent');
      content.innerHTML = renderAssessTab(state.parsedSymptoms, state);
      bindAssessEvents(container, state);
    });
  }

  // 补采信息按钮 → 切换到采集 tab（补采模式）
  container.querySelector('#btnCollectFromAssess')?.addEventListener('click', () => {
    switchTab(container, 'collect', state);
  });

  // 去匹配方剂按钮 → 切换到匹配 tab
  container.querySelector('#btnMatchFromAssess')?.addEventListener('click', () => {
    switchTab(container, 'matching', state);
  });

  // 直接保存按钮 → 自动切换到采集 tab 的保存模式
  container.querySelector('#btnSaveFromAssess')?.addEventListener('click', () => {
    // 直接触发保存（使用已有的 input 数据）
    const tabs = container.querySelectorAll('.clinical-tab');
    tabs.forEach(t => t.classList.remove('active'));
    tabs.forEach(t => { if (t.dataset.tab === 'collect') t.classList.add('active'); });
    const content = container.querySelector('#clinicalContent');
    content.innerHTML = renderCollectTab(false); // 保存模式
    bindCollectEvents(container, state);
  });
}

function renderCollectTab(isCollectMode) {
  if (isCollectMode) {
    // 补采模式：追加症状信息 → 重新评估
    return `
      <div class="clinical-panel">
        <div class="clinical-section">
          <label class="clinical-label">📝 补采信息</label>
          <p class="text-muted" style="font-size:13px;margin-bottom:8px;">补充之前未采集的维度信息，追加到现有症状中重新评估。</p>
          <textarea class="clinical-textarea" id="clinicalAddText" rows="6" placeholder="例：患者还有胸闷，无胁痛，既往高血压病史..."></textarea>
        </div>
        <div class="clinical-actions">
          <button class="btn-primary" id="btnClinicalAppend">追加并重新评估</button>
          <button class="btn-secondary" id="btnClinicalBackToAssess">返回评估</button>
        </div>
        <div id="clinicalAppendResult"></div>
      </div>
    `;
  }
  // 保存模式：记录诊疗决策
  return `
    <div class="clinical-panel">
      <div class="clinical-section">
        <label class="clinical-label">诊疗决策记录</label>
        <textarea class="clinical-textarea" id="clinicalDecision" rows="6" placeholder="记录诊断结论、选方思路、加减变化…"></textarea>
      </div>
      <div class="clinical-section">
        <p class="text-muted" style="font-size:13px;margin-bottom:8px;">保存后可以继续评估其他方剂或补采更多信息。</p>
        <div class="clinical-actions">
          <button class="btn-primary" id="btnClinicalSave">💾 保存并继续评估</button>
        </div>
      </div>
      <div id="clinicalSaveResult"></div>
    </div>
  `;
}

function renderRecordsTab(records) {
  if (!records || records.length === 0) {
    return `<div class="clinical-panel"><p class="clinical-empty">暂无就诊记录。</p></div>`;
  }
  const sorted = [...records].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  let html = `<div class="clinical-panel"><div class="clinical-section"><label class="clinical-label">就诊档案 (${records.length})</label></div>`;
  sorted.slice(0, 50).forEach(r => {
    const symptomStr = (r.symptoms || []).slice(0, 8).join('、') + ((r.symptoms || []).length > 8 ? '…' : '');
    const matchStr = (r.matchResults || []).slice(0, 3).map(m => m.formula_name_cn || m.formula_name).join('、');
    const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleString('zh-CN') : '';
    html += `
      <div class="clinical-record-card" data-id="${r.id}">
        <div class="record-header">
          <span class="record-name">${r.patientName || '匿名'}</span>
          <span class="record-meta">${dateStr}</span>
        </div>
        <div class="record-body">
          <div class="record-row"><span class="record-label">症状:</span> ${symptomStr || '无'}</div>
          ${matchStr ? `<div class="record-row"><span class="record-label">匹配方:</span> ${matchStr}</div>` : ''}
        </div>
        <div class="record-actions">
          <button class="btn-sm" data-action="view">查看</button>
          <button class="btn-sm btn-danger" data-action="delete">删除</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  return html;
}

// ──────────────────────────────────────────────
// Tab 切换
// ──────────────────────────────────────────────

function bindTabSwitcher(container, state) {
  const tabs = container.querySelectorAll('.clinical-tab');
  const content = container.querySelector('#clinicalContent');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // 更新 tabs active
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 渲染对应内容
      switch (tabName) {
        case 'input':
          content.innerHTML = renderInputTab();
          bindInputEvents(container, state);
          break;
        case 'matching':
          content.innerHTML = renderMatchingTab(state.parsedSymptoms);
          bindMatchingEvents(container, state);
          break;
        case 'assess':
          content.innerHTML = renderAssessTab(state.parsedSymptoms, state);
          bindAssessEvents(container, state);
          break;
        case 'collect':
          content.innerHTML = renderCollectTab(false);
          bindCollectEvents(container, state);
          break;
        case 'records':
          content.innerHTML = renderRecordsTab(Storage.getAll());
          bindRecordsEvents(container, state);
          break;
      }
    });
  });
}

// ──────────────────────────────────────────────
// 事件绑定
// ──────────────────────────────────────────────

function bindInputEvents(container, state) {
  const parseBtn = container.querySelector('#btnClinicalParse');
  const clearBtn = container.querySelector('#btnClinicalClear');
  const input = container.querySelector('#clinicalInput');
  const nameInput = container.querySelector('#clinicalPatientName');
  const noteInput = container.querySelector('#clinicalNote');
  const resultDiv = container.querySelector('#clinicalParseResult');

  // ── 症状标签点击：追加到 textarea（去重） ──
  container.querySelectorAll('.symptom-tag').forEach(el => {
    el.addEventListener('click', () => {
      if (!input) return;
      const tagText = el.dataset.tag;
      if (!tagText) return;
      // 获取当前文本
      const current = input.value;
      // 检查是否已存在（去重）
      const existingTags = current.split(/[,，、\s\n]+/).filter(t => t.trim());
      if (existingTags.some(t => t.trim() === tagText)) {
        // 已存在：闪烁提示
        el.classList.add('tag-exists');
        setTimeout(() => el.classList.remove('tag-exists'), 600);
        return;
      }
      // 追加到 textarea
      const separator = current.trim() ? '、' : '';
      input.value = current + separator + tagText;
      // 闪烁高亮表示已添加
      el.classList.add('tag-added');
      setTimeout(() => el.classList.remove('tag-added'), 400);
    });
  });

  if (!parseBtn) return;

  parseBtn.addEventListener('click', () => {
    const text = input?.value?.trim();
    if (!text) {
      resultDiv.innerHTML = `<p class="clinical-empty">请输入患者症状文本。</p>`;
      return;
    }

    const parsed = parseText(text);
    state.parsedSymptoms = parsed.std;
    state.symptomQuotes = parsed.quotes;

    // 显示解析结果
    let html = `<div class="clinical-section parse-result">`;
    html += `<label class="clinical-label">解析结果 (${parsed.std.length} 个症状)</label>`;

    if (parsed.std.length === 0) {
      html += `<p class="clinical-empty">未识别出标准症状。请检查文本是否包含症状表述。</p>`;
    } else {
      // 症状列表
      html += `<div class="parse-symptoms">`;
      parsed.std.forEach((s, i) => {
        const quote = parsed.quotes[i] || '';
        const confidence = parsed.conf[s] || 0.7;
        html += `<span class="parse-tag">${s} ${quote ? `(${quote})` : ''} <span class="parse-conf">${Math.round(confidence * 100)}%</span></span>`;
      });
      html += `</div>`;
    }
    html += `</div>`;

    // 自动匹配提示
    if (parsed.std.length > 0) {
      html += `<div class="clinical-section"><p class="text-muted">✅ 已识别 ${parsed.std.length} 个症状，切换到「方剂」tab 查看匹配结果，或「评估」tab 查看十问歌完整性。</p></div>`;
    }

    resultDiv.innerHTML = html;
  });

  clearBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    if (nameInput) nameInput.value = '';
    if (noteInput) noteInput.value = '';
    state.parsedSymptoms = [];
    state.symptomQuotes = [];
    resultDiv.innerHTML = '';
  });
}

function bindMatchingEvents(container, state) {
  // 匹配结果可点击选择
  container.querySelectorAll('[data-action="select-match"]').forEach(card => {
    card.addEventListener('click', (e) => {
      // 如果点击的是 details summary 内部，不要触发选择
      if (e.target.closest('details')) return;
      const formulaId = card.dataset.formulaId;
      state.selectedFormulaId = state.selectedFormulaId === formulaId ? null : formulaId;
      // 重新渲染 matching tab 以更新选择状态
      const content = container.querySelector('#clinicalContent');
      content.innerHTML = renderMatchingTab(state.parsedSymptoms, state.selectedFormulaId);
      bindMatchingEvents(container, state);
    });
  });

  // 去评估完整性按钮
  const btnAssess = container.querySelector('#btnAssessFromMatch');
  if (btnAssess) {
    btnAssess.addEventListener('click', () => {
      // 切换到评估 tab
      const tabs = container.querySelectorAll('.clinical-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabs.forEach(t => { if (t.dataset.tab === 'assess') t.classList.add('active'); });
      const content = container.querySelector('#clinicalContent');
      content.innerHTML = renderAssessTab(state.parsedSymptoms);
      // 补采流程：评估 tab 也添加"去补采"和"回到匹配"按钮
      bindAssessEvents(container, state);
    });
  }

  // 去补采信息按钮
  const btnCollect = container.querySelector('#btnCollectFromMatch');
  if (btnCollect) {
    btnCollect.addEventListener('click', () => {
      // 切换到采集 tab（补采模式）
      const tabs = container.querySelectorAll('.clinical-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabs.forEach(t => { if (t.dataset.tab === 'collect') t.classList.add('active'); });
      const content = container.querySelector('#clinicalContent');
      content.innerHTML = renderCollectTab(true);
      bindCollectEvents(container, state);
    });
  }

  // Phase 2：匹配→评估联动 — 查看评估详情按钮
  container.querySelectorAll('[data-action="view-assess"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const formulaName = btn.dataset.formulaName || '';
      state._assessContextFormula = formulaName; // 存入状态，评估 tab 读取显示
      // 切换到评估 tab
      switchTab(container, 'assess', state);
    });
  });
}

function bindCollectEvents(container, state) {
  // 模式1：补采模式 — 追加症状文本后重新评估
  const appendBtn = container.querySelector('#btnClinicalAppend');
  if (appendBtn) {
    appendBtn.addEventListener('click', () => {
      const addText = container.querySelector('#clinicalAddText')?.value?.trim();
      if (!addText) {
        container.querySelector('#clinicalAppendResult').innerHTML = `<p class="text-error">⚠ 请输入补充信息。</p>`;
        return;
      }
      // 追加到现有 input 文本
      const inputEl = container.querySelector('#clinicalInput');
      if (inputEl) {
        inputEl.value = (inputEl.value || '') + '\n' + addText;
      }
      // 重新解析症状（合并后的文本），parseText 已经在模块顶部 import
      const fullText = (inputEl?.value || '') || addText;
      const parsed = parseText(fullText);
      state.parsedSymptoms = parsed.std;
      state.symptomQuotes = parsed.quotes;
      state.selectedFormulaId = null;

      // 切换到评估 tab（重新评估），同时清空补采输入
      container.querySelector('#clinicalAddText') && (container.querySelector('#clinicalAddText').value = '');
      switchTab(container, 'assess', state);
      container.querySelector('#clinicalAppendResult').innerHTML = `<p class="text-success">✅ 已追加并重新评估。切换到「评估」tab 查看结果。</p>`;
    });
    return; // 补采模式不执行下面的保存逻辑
  }

  // 模式2：保存模式
  const saveBtn = container.querySelector('#btnClinicalSave');
  if (!saveBtn) return;
  const decisionInput = container.querySelector('#clinicalDecision');
  const resultDiv = container.querySelector('#clinicalSaveResult');

  saveBtn.addEventListener('click', () => {
    const name = container.querySelector('#clinicalPatientName')?.value?.trim() || '';
    const note = container.querySelector('#clinicalNote')?.value?.trim() || '';
    const decision = decisionInput?.value?.trim() || '';

    if (state.parsedSymptoms.length === 0) {
      resultDiv.innerHTML = `<p class="text-error">⚠ 请先在「输入」tab 解析症状。</p>`;
      return;
    }

    // 重新做匹配（确保 state 最新）
    const matchResults = matchFormulas(state.parsedSymptoms, { topN: 5 });
    const collectionEval = evaluateCollection(state.parsedSymptoms);

    const record = createRecord({
      inputText: container.querySelector('#clinicalInput')?.value?.trim() || '',
      symptoms: state.parsedSymptoms,
      symptomQuotes: state.symptomQuotes,
      matchResults,
      collectionEval,
      patientName: name || '匿名',
      note: note + (decision ? '\n[决策] ' + decision : '')
    });

    state.records = Storage.getAll();
    state.currentRecord = record;

    // 刷新档案 tab 的 badge
    const badge = container.querySelector('#clinicalBadge');
    if (badge) badge.textContent = `档案: ${Storage.getAll().length}`;

    // 保存成功后提供继续操作选项：回到匹配 tab 重新匹配
    resultDiv.innerHTML = `
      <div class="save-success">
        <p>✅ 就诊记录已保存</p>
        <p class="text-muted">档案编号: ${record.id}</p>
        <p class="text-muted">患者: ${record.patientName}</p>
        <p class="text-muted">症状: ${record.symptoms.length} 个</p>
        <p class="text-muted">匹配方: ${matchResults.length > 0 ? matchResults[0].formula_name_cn : '无'}</p>
      </div>
      <div class="clinical-section" style="margin-top:16px;">
        <div class="clinical-actions">
          <button class="btn-primary" id="btnContinueMatching">🔍 继续匹配其它方剂</button>
          <button class="btn-secondary" id="btnContinueCollect">📋 补采更多信息</button>
          <button class="btn-secondary" id="btnViewRecords">🗂 查看档案</button>
        </div>
      </div>
    `;

    // 绑定继续操作
    container.querySelector('#btnContinueMatching')?.addEventListener('click', () => {
      switchTab(container, 'matching', state);
    });
    container.querySelector('#btnContinueCollect')?.addEventListener('click', () => {
      switchTab(container, 'collect', state);
    });
    container.querySelector('#btnViewRecords')?.addEventListener('click', () => {
      switchTab(container, 'records', state);
    });
  });
}

/**
 * 辅助：切换到指定 tab
 */
function switchTab(container, tabName, state) {
  const tabs = container.querySelectorAll('.clinical-tab');
  tabs.forEach(t => t.classList.remove('active'));
  tabs.forEach(t => { if (t.dataset.tab === tabName) t.classList.add('active'); });
  const content = container.querySelector('#clinicalContent');
  switch (tabName) {
    case 'input':
      content.innerHTML = renderInputTab();
      bindInputEvents(container, state);
      break;
    case 'matching':
      content.innerHTML = renderMatchingTab(state.parsedSymptoms, state.selectedFormulaId);
      bindMatchingEvents(container, state);
      break;
    case 'assess':
      content.innerHTML = renderAssessTab(state.parsedSymptoms, state);
      bindAssessEvents(container, state);
      break;
    case 'collect':
      content.innerHTML = renderCollectTab(true); // 补采模式
      bindCollectEvents(container, state);
      break;
    case 'records':
      content.innerHTML = renderRecordsTab(Storage.getAll());
      bindRecordsEvents(container, state);
      break;
  }
}

function bindRecordsEvents(container, state) {
  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.clinical-record-card');
      const id = card?.dataset.id;
      if (!id) return;
      if (!confirm('确定删除这条就诊记录？')) return;
      Storage.remove(id);
      state.records = Storage.getAll();
      // 重新渲染 records tab
      const content = container.querySelector('#clinicalContent');
      content.innerHTML = renderRecordsTab(state.records);
      bindRecordsEvents(container, state);
      // 更新 badge
      const badge = container.querySelector('#clinicalBadge');
      if (badge) badge.textContent = `档案: ${state.records.length}`;
    });
  });

  container.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.clinical-record-card');
      const id = card?.dataset.id;
      if (!id) return;
      const record = Storage.getById(id);
      if (!record) return;
      showRecordDetail(container, record, state);
    });
  });
}

/**
 * 显示档案详情
 */
function showRecordDetail(container, record, state) {
  const content = container.querySelector('#clinicalContent');
  const matchHtml = (record.matchResults || []).map((r, i) => `
    <div class="clinical-match-card-small">
      <strong>#${i + 1} ${r.formula_name_cn || r.formula_name}</strong> — ${r.score} 分
      ${r.disqualified ? ' ⚠ 禁忌' : ''}
    </div>
  `).join('') || '<p class="text-muted">无匹配结果</p>';

  const evalHtml = record.collectionEval
    ? `<p>十问歌采集: ${record.collectionEval.covered}/${record.collectionEval.total} 维度 (${Math.round(record.collectionEval.rate * 100)}%) ⭐${record.collectionEval.stars}</p>`
    : '<p class="text-muted">未评估</p>';

  content.innerHTML = `
    <div class="clinical-panel">
      <button class="btn-back" id="btnDetailBack">← 返回档案列表</button>
      <div class="clinical-section">
        <h3>就诊档案详情</h3>
        <p class="text-muted">编号: ${record.id}</p>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">患者</label>
        <p>${record.patientName || '匿名'}</p>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">就诊时间</label>
        <p>${record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '未知'}</p>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">原始文本</label>
        <pre class="clinical-pre">${record.inputText || '无'}</pre>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">解析症状 (${(record.symptoms || []).length})</label>
        <p>${(record.symptoms || []).join('、') || '无'}</p>
      </div>
      <div class="clinical-section">
        <label class="clinical-label">方剂匹配结果</label>
        ${matchHtml}
      </div>
      <div class="clinical-section">
        <label class="clinical-label">十问歌评估</label>
        ${evalHtml}
      </div>
      <div class="clinical-section">
        <label class="clinical-label">笔记/决策</label>
        <pre class="clinical-pre">${record.note || '无'}</pre>
      </div>
    </div>
  `;

  container.querySelector('#btnDetailBack').addEventListener('click', () => {
    content.innerHTML = renderRecordsTab(Storage.getAll());
    bindRecordsEvents(container, state);
  });
}
