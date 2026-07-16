/**
 * ClinicalView — 临床录入视图
 * 职责：文本解析 → 症状展示 → 方剂匹配 → 十问歌评估 → 诊疗决策
 * 参考 V8 index.html 行 7690-8289
 */

import { initClinical, parseText, matchFormulas, evaluateCollection, createRecord, getRecord, updateRecord, loadRecords } from '@services/ClinicalService.js';
import * as Storage from '@services/ClinicalStorage.js';

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
  return `
    <div class="clinical-panel">
      <div class="clinical-section">
        <label class="clinical-label">患者主诉 / IMA 粘贴文本</label>
        <textarea class="clinical-textarea" id="clinicalInput" rows="8" placeholder="粘贴患者症状描述、舌脉、问诊记录…"></textarea>
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

function renderMatchingTab(parsedSymptoms) {
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
      html += `
        <div class="clinical-match-card ${r.disqualified ? 'clinical-match-disqualified' : ''}">
          <div class="match-header">
            <span class="match-rank">#${i + 1}</span>
            <span class="match-name">${r.formula_name_cn || r.formula_name}</span>
            <span class="match-score">${r.score} 分</span>
            ${disq} ${boost}
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
        </div>
      `;
    });
  }

  html += `</div>`;
  return html;
}

function renderAssessTab(symptomVector) {
  if (!symptomVector || symptomVector.length === 0) {
    return `<div class="clinical-panel"><p class="clinical-empty">请先在「输入」tab 解析症状。</p></div>`;
  }
  const evalResult = evaluateCollection(symptomVector);
  let html = `<div class="clinical-panel">`;

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

  html += `</div>`;
  return html;
}

function renderCollectTab() {
  return `
    <div class="clinical-panel">
      <div class="clinical-section">
        <label class="clinical-label">诊疗决策记录</label>
        <textarea class="clinical-textarea" id="clinicalDecision" rows="6" placeholder="记录诊断结论、选方思路、加减变化…"></textarea>
      </div>
      <div class="clinical-section">
        <button class="btn-primary" id="btnClinicalSave">保存就诊记录</button>
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
          content.innerHTML = renderAssessTab(state.parsedSymptoms);
          break;
        case 'collect':
          content.innerHTML = renderCollectTab();
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
  // 目前匹配结果只读展示，后续可加「选择此方」等交互
}

function bindCollectEvents(container, state) {
  const saveBtn = container.querySelector('#btnClinicalSave');
  const decisionInput = container.querySelector('#clinicalDecision');
  const resultDiv = container.querySelector('#clinicalSaveResult');

  if (!saveBtn) return;

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

    resultDiv.innerHTML = `
      <div class="save-success">
        <p>✅ 就诊记录已保存</p>
        <p class="text-muted">档案编号: ${record.id}</p>
        <p class="text-muted">患者: ${record.patientName}</p>
        <p class="text-muted">症状: ${record.symptoms.length} 个</p>
        <p class="text-muted">匹配方: ${matchResults.length > 0 ? matchResults[0].formula_name_cn : '无'}</p>
      </div>
    `;
  });
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
