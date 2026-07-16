/**
 * SPView.js — 标准化病人问诊视图
 *
 * 从 V8 (app/index.html) 移植，包含完整的 SP 问诊流程：
 * 病例列表 → 选择病例 → 患者卡片 + 主诉 → 问诊方向按钮（三层）
 * → 结束问诊 → 体格检查 → 病例总结 → 单选题考试 → 保存结果
 *
 * 依赖：全局 CARDS 数组（用于查找方剂名称）
 */

// ===== 全局状态 =====
let spCases = [];
let spCurrentCase = null;

let spState = {
  usedDirs: new Set(),
  askedFollowUp: new Set(),
  triggeredL3: new Set(),
  examRevealed: false,
  answered: null
};

function spReset() {
  spState = {
    usedDirs: new Set(),
    askedFollowUp: new Set(),
    triggeredL3: new Set(),
    examRevealed: false,
    answered: null
  };
}

// ===== 主入口 =====

/**
 * 渲染 SP 视图
 * @param {HTMLElement} container
 * @param {Array} cases - sp_cases.json 数据
 * @param {Array} formulaCards - CARDS 全局数据（用于查找方剂名）
 * @param {Function} onGoToLearn - (cardId) => void 点击「去学习」回调
 */
export function renderSPView(container, cases, formulaCards, onGoToLearn) {
  spCases = cases || [];
  container.innerHTML = `
    <div id="spCaseListPanel" style="max-width:900px;margin:0 auto;">
      <div class="dashboard-header" style="margin-bottom:20px;">
        <div class="dashboard-title">标准化病人 · 选择病例</div>
        <div class="dashboard-desc">选择一个病例开始模拟问诊。系统会从《伤寒论》条文中生成患者叙事。</div>
        <div style="margin-top:12px;">
          <button class="btn-primary" id="spBtnRandom">🎲 随机抽取</button>
        </div>
      </div>
      <div class="card-list" id="spCaseList"></div>
    </div>
    <div class="sp-container" id="spContainer" style="display:none;">
      <div class="sp-left" id="spLeft">
        <div class="sp-patient-card" id="spPatientCard"></div>
        <div class="sp-chat-history" id="spChatHistory"></div>
        <div id="spPhysicalExam" style="display:none;"></div>
      </div>
      <div class="sp-right" id="spRight">
        <div id="spDirectionsPanel">
          <div class="sp-directions-title">选择问诊方向（最多 <span id="spSlots">5</span> 个）</div>
          <div class="sp-dir-list" id="spDirList"></div>
          <div class="sp-actions">
            <button class="btn-secondary" id="spBtnEndInquiry">结束问诊</button>
          </div>
        </div>
        <div id="spExamPanel" style="display:none;"></div>
      </div>
    </div>
    <div id="spBackBar" style="display:none;max-width:1200px;margin:0 auto 16px;">
      <button class="btn-secondary" id="spBtnBack">← 返回病例列表</button>
    </div>
  `;

  // 绑定事件
  document.getElementById('spBtnRandom').addEventListener('click', spRandomCase);
  document.getElementById('spBtnEndInquiry').addEventListener('click', spEndInquiry);
  document.getElementById('spBtnBack').addEventListener('click', spBackToList);

  // 保存 onGoToLearn 回调供内部使用
  window.__spGoToLearn = onGoToLearn || null;

  spShowCaseList();
}

// ===== 病例列表 =====

function spShowCaseList() {
  document.getElementById('spCaseListPanel').style.display = 'block';
  document.getElementById('spContainer').style.display = 'none';
  document.getElementById('spBackBar').style.display = 'none';

  if (spCases.length > 0) {
    spRenderCaseList();
  } else {
    document.getElementById('spCaseList').innerHTML = '<div style="color:var(--text-secondary);padding:20px;">暂无病例数据</div>';
  }
}

function spRenderCaseList() {
  const container = document.getElementById('spCaseList');
  if (!container) return;

  // 获取全局 CARDS（从 window 上取，app.js 会挂载）
  const CARDS = window.__CARDS || [];

  container.innerHTML = spCases.map((c, idx) => {
    const p = c.patient;
    const difficultyLabel = c.difficulty === 1 ? '简单' : c.difficulty === 2 ? '中等' : '困难';
    const card = CARDS.find(x => x.id === c.answer_key?.correct_formula_id);
    const cardName = card ? card.name : (c.answer_key?.correct_formula_name || '');
    const cardDesc = card ? card.desc : '';
    return `
      <div class="card-list-item" tabindex="0" data-sp-idx="${idx}">
        <div class="card-list-main">
          <div class="card-list-name">${p.name} <span style="font-size:13px;font-weight:400;color:var(--text-secondary)">（${cardName}）</span></div>
          <div class="card-list-desc">${p.age}岁 · ${p.occupation} · ${cardDesc || p.background}</div>
          <div class="card-list-tags">
            <span class="tag">${difficultyLabel}</span>
            ${c.source_classic ? `<span class="tag">${c.source_classic} · ${c.chapter || ''}</span>` : ''}
            ${c.answer_key?.correct_article_number ? `<span class="tag">第${c.answer_key.correct_article_number}条</span>` : ''}
          </div>
        </div>
        <div style="font-size:28px;">${p.gender === '女' ? '👩' : '👨'}</div>
      </div>
    `;
  }).join('');

  // 绑定点击事件
  container.querySelectorAll('.card-list-item').forEach(el => {
    el.addEventListener('click', () => spSelectCase(parseInt(el.dataset.spIdx)));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); spSelectCase(parseInt(el.dataset.spIdx)); }
    });
  });
}

function spSelectCase(idx) {
  spCurrentCase = spCases[idx];
  spReset();
  document.getElementById('spCaseListPanel').style.display = 'none';
  document.getElementById('spContainer').style.display = 'grid';
  document.getElementById('spBackBar').style.display = 'block';
  spInitDemo();
}

function spRandomCase() {
  if (spCases.length === 0) return;
  const idx = Math.floor(Math.random() * spCases.length);
  spSelectCase(idx);
}

function spBackToList() {
  spReset();
  spShowCaseList();
}

// ===== 问诊引擎 =====

function spInitDemo() {
  spReset();
  const data = spCurrentCase;
  const p = data.patient;
  const dc = data.difficulty_config;

  document.getElementById('spSlots').textContent = dc.inquiry_slots || 5;
  document.getElementById('spPatientCard').innerHTML = `
    <div class="sp-avatar">${p.gender === '女' ? '👩' : '👨'}</div>
    <div>
      <div style="font-size:15px;font-weight:600;">${p.name} <span style="font-size:12px;color:var(--text-secondary);font-weight:400">（${p.age}岁 · ${p.occupation}）</span></div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">${p.background || ''}</div>
      <div style="margin-top:6px;"><span class="tag">难度${data.difficulty}</span></div>
    </div>`;

  document.getElementById('spChatHistory').innerHTML = `
    <div class="sp-chat-item patient">
      <div class="sp-bubble">${data.chief_complaint.text}</div>
    </div>`;

  document.getElementById('spPhysicalExam').style.display = 'none';
  document.getElementById('spPhysicalExam').innerHTML = '';
  document.getElementById('spDirectionsPanel').style.display = 'block';
  document.getElementById('spExamPanel').style.display = 'none';
  spRenderDirections();
}

function spRenderDirections() {
  const list = document.getElementById('spDirList');
  const dc = spCurrentCase.difficulty_config;
  const used = spState.usedDirs;
  const entries = Object.entries(spCurrentCase.inquiries || {}).filter(([k, v]) => v && v.available !== false);

  list.innerHTML = entries.map(([k, v]) => {
    const isUsed = used.has(k);
    const disabled = !isUsed && used.size >= (dc.inquiry_slots || 5);
    return `<button class="sp-dir-btn ${isUsed ? 'used' : ''}" ${disabled ? 'disabled' : ''} data-dir-id="${k}">${v.direction_name} ${isUsed ? '✓' : ''}</button>`;
  }).join('');

  // 绑定点击
  list.querySelectorAll('.sp-dir-btn').forEach(btn => {
    btn.addEventListener('click', () => spSelectDir(btn.dataset.dirId));
  });
}

function spSelectDir(dirId) {
  if (spState.usedDirs.has(dirId) || spState.usedDirs.size >= spCurrentCase.difficulty_config.inquiry_slots || spState.examRevealed) return;

  const hist = document.getElementById('spChatHistory');
  const dir = spCurrentCase.inquiries[dirId];
  if (!dir || !dir.l1) return;

  hist.innerHTML += `
    <div class="sp-chat-item doctor"><div class="sp-bubble">问：${dir.l1.sample_question || ''}</div></div>
    <div class="sp-chat-item patient"><div class="sp-bubble">${dir.l1.text || ''}</div></div>`;

  if (dir.l2 && dir.l2.text && dir.l2.trigger_question) {
    const fid = 'sp-f-' + dirId + '-' + Date.now();
    hist.innerHTML += `<div class="sp-chat-item doctor"><div class="sp-bubble" style="background:var(--bg-panel);border-color:var(--border);"><span style="font-size:12px;color:var(--accent);cursor:pointer;" class="sp-followup-btn" data-dir-id="${dirId}">追问：${dir.l2.trigger_question}</span></div></div>`;
  }

  if (dir.l3_noise && dir.l3_noise.probability > 0 && Math.random() < dir.l3_noise.probability) {
    spState.triggeredL3.add(dirId);
    hist.innerHTML += `<div class="sp-chat-item patient"><div class="sp-bubble sp-noise-bubble">💬 ${dir.l3_noise.text || ''}</div></div>`;
  }

  spState.usedDirs.add(dirId);
  spRenderDirections();
  scrollChatBottom();
}

function spFollowUp(dirId) {
  const hist = document.getElementById('spChatHistory');
  const dir = spCurrentCase.inquiries[dirId];
  if (!dir || !dir.l2) return;

  // 移除追问按钮气泡
  const btns = hist.querySelectorAll('.sp-followup-btn');
  btns.forEach(b => {
    if (b.dataset.dirId === dirId) {
      const bubble = b.closest('.sp-chat-item');
      if (bubble) bubble.remove();
    }
  });

  hist.innerHTML += `
    <div class="sp-chat-item doctor"><div class="sp-bubble">追问：${dir.l2.trigger_question}</div></div>
    <div class="sp-chat-item patient"><div class="sp-bubble">${dir.l2.text}</div></div>`;

  spState.askedFollowUp.add(dirId);
  scrollChatBottom();
}

function spEndInquiry() {
  spState.examRevealed = true;
  document.getElementById('spDirectionsPanel').style.display = 'none';

  const left = document.getElementById('spPhysicalExam');
  left.style.display = 'block';

  const pe = spCurrentCase.physical_exam || {};
  const insp = pe.inspection || {};
  const ausc = pe.auscultation || {};
  const palp = pe.palpation || {};
  const press = pe.pressing || {};

  left.innerHTML = `
    <div class="sp-physical-exam">
      <div class="sp-pe-grid">
        <div class="sp-pe-item">
          <div class="sp-pe-title">👅 望诊 · 舌象</div>
          <div class="sp-pe-content">舌体：${insp.tongue_body || '—'}<br>舌质：${insp.tongue_color || '—'}<br>舌苔：${insp.coating || '—'}</div>
        </div>
        <div class="sp-pe-item">
          <div class="sp-pe-title">👂 闻诊</div>
          <div class="sp-pe-content">语声：${ausc.voice || '—'}<br>呼吸：${ausc.breath || '—'}</div>
        </div>
        <div class="sp-pe-item">
          <div class="sp-pe-title">🫀 切诊 · 脉象</div>
          <div class="sp-pe-content">${palp.composite || '—'}<br>（${palp.pulse_position || ''}${palp.pulse_rate || ''}${palp.pulse_shape || ''}，${palp.pulse_force || ''}）</div>
        </div>
        <div class="sp-pe-item">
          <div class="sp-pe-title">🖐 按诊</div>
          <div class="sp-pe-content">腹部：${press.abdomen || '—'}<br>四肢：${press.limbs || '—'}</div>
        </div>
      </div>
    </div>
    <div class="sp-summary" style="margin-top:10px;">${spCurrentCase.case_summary || ''}</div>
  `;

  spRenderExam();
}

// ===== 考试 =====

function spRenderExam() {
  const panel = document.getElementById('spExamPanel');
  panel.style.display = 'block';

  const opts = spCurrentCase.question?.options || [];
  const mode = spCurrentCase.question?.mode === 'article' ? '条文' : '方剂';

  panel.innerHTML = `
    <div style="font-size:13px;color:var(--text-secondary);font-weight:600;margin-bottom:10px;">请选择对应的${mode}：</div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="spExamOptions">
      ${opts.map((o, i) => `
        <div class="sp-option-card" data-sp-opt-idx="${i}">
          <div class="sp-option-label">${o.label || ''}</div>
          <div class="sp-option-text">${o.snippet || o.name || ''}</div>
        </div>
      `).join('')}
    </div>
    <div class="sp-feedback" id="spFeedback"></div>
  `;

  // 绑定选项点击
  panel.querySelectorAll('.sp-option-card').forEach(el => {
    el.addEventListener('click', () => spSelectAnswer(parseInt(el.dataset.spOptIdx)));
  });
}

function spSelectAnswer(idx) {
  if (spState.answered !== null) return;

  const opts = spCurrentCase.question.options;
  if (!opts || idx < 0 || idx >= opts.length) return;

  const o = opts[idx];
  spState.answered = idx;

  // 标记选中的
  const selectedEl = document.querySelector(`.sp-option-card[data-sp-opt-idx="${idx}"]`);
  if (selectedEl) selectedEl.classList.add(o.is_correct ? 'correct' : 'wrong');

  // 标记正确的
  opts.forEach((opt, i) => {
    if (opt.is_correct) {
      const el = document.querySelector(`.sp-option-card[data-sp-opt-idx="${i}"]`);
      if (el) el.classList.add('correct');
    }
  });

  const fb = document.getElementById('spFeedback');
  fb.classList.add('show');

  const ans = spCurrentCase.answer_key || {};
  const formulaId = ans.correct_formula_id || '';

  fb.innerHTML = o.is_correct
    ? `<strong style="color:var(--success)">回答正确！</strong> ${ans.correct_article_text || ans.correct_formula_name || ''}<br><br><button class="btn-primary" id="spBtnGoLearn">📖 去学习该方剂</button>`
    : `<strong style="color:var(--error)">回答错误。</strong> 正确答案是：${ans.correct_article_text || ans.correct_formula_name || ''}<br><br><button class="btn-primary" id="spBtnGoLearn">📖 去学习该方剂</button>`;

  document.getElementById('spBtnGoLearn')?.addEventListener('click', () => {
    if (window.__spGoToLearn && formulaId) {
      window.__spGoToLearn(formulaId);
    }
  });

  spSaveResult(o.is_correct);
}

function spSaveResult(isCorrect) {
  const ans = spCurrentCase.answer_key || {};
  const results = JSON.parse(localStorage.getItem('sp_results') || '[]');
  results.push({
    session_id: spCurrentCase.session_id,
    formula_id: ans.correct_formula_id,
    formula_name: ans.correct_formula_name,
    article_id: ans.correct_article_id,
    is_correct: isCorrect,
    timestamp: Date.now()
  });
  localStorage.setItem('sp_results', JSON.stringify(results.slice(-50)));
}

// ===== 辅助 =====

function scrollChatBottom() {
  setTimeout(() => {
    const el = document.getElementById('spChatHistory');
    if (el && el.lastElementChild) {
      el.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}
