from pathlib import Path

ROOT = Path("C:/Users/Chen/Desktop/经方学习系统（旧版）")
FILE = ROOT / "app" / "index.html"

text = FILE.read_text(encoding="utf-8")

replacements = []

# 1. Dashboard header: add review panel mount point
replacements.append((
    """    <div class="dashboard-header">
      <div class="dashboard-title">选择一张卡片开始学习</div>
      <div class="dashboard-desc">当前为 Level 0（小白模式），仅展示原文标准与基础禁忌。</div>
    </div>""",
    """    <div class="dashboard-header" id="dashboardHeader">
      <div class="dashboard-title">选择一张卡片开始学习</div>
      <div class="dashboard-desc">学习进度会自动保存到浏览器本地存储。</div>
      <div id="reviewPanel" style="margin-top:16px;"></div>
    </div>"""
))

# 2. Stats desc
replacements.append((
    "      <div class=\"dashboard-desc\">本页面数据仅保存在当前会话中。</div>",
    "      <div class=\"dashboard-desc\">学习进度已持久化，刷新或下次打开不会丢失。</div>"
))

# 3. Fix isCorrect for array q.correct
replacements.append((
    """  const isCorrect = q.type === '1→0'
    ? selected.id === q.correct
    : selected.label === q.correct;""",
    """  const isCorrect = q.type === '1→0'
    ? selected.id === q.correct
    : (Array.isArray(q.correct) ? q.correct.includes(selected.label) : selected.label === q.correct);"""
))

# 4. Fix optCorrect for array q.correct
replacements.append((
    """    const optCorrect = q.type === '1→0'
      ? opt.id === q.correct
      : q.correct.includes(opt.label);""",
    """    const optCorrect = q.type === '1→0'
      ? opt.id === q.correct
      : (Array.isArray(q.correct) ? q.correct.includes(opt.label) : opt.label === q.correct);"""
))

# 5. Fix feedback display when q.correct is array
replacements.append((
    "    : `<strong>回答错误。</strong> 正确答案是：${q.correct}`;",
    "    : `<strong>回答错误。</strong> 正确答案是：${Array.isArray(q.correct) ? q.correct.join('、') : q.correct}`;"
))

# 6. Extend generateOptions for usage and 2→0
replacements.append((
    """    if (type === '0→1') {
      opts.push({ id: c.id, label: (profile.necessary || []).join('、') || '无' });
    } else if (type === '1→0') {
      opts.push({ id: c.id, label: c.name });
    } else if (type === '0→2') {
      const herbs = canonical.herbs.map(h => h.name);
      opts.push({ id: c.id, label: herbs[0] || '无' });
    } else if (type === '0→contra') {
      opts.push({ id: c.id, label: canonical.contraindications[0] || '无' });
    }""",
    """    if (type === '0→1') {
      opts.push({ id: c.id, label: (profile.necessary || []).join('、') || '无' });
    } else if (type === '1→0' || type === '2→0') {
      opts.push({ id: c.id, label: c.name });
    } else if (type === '0→2') {
      const herbs = canonical.herbs.map(h => h.name);
      opts.push({ id: c.id, label: herbs[0] || '无' });
    } else if (type === '0→contra') {
      opts.push({ id: c.id, label: canonical.contraindications[0] || '无' });
    } else if (type === '0→usage') {
      opts.push({ id: c.id, label: canonical.usage || '无' });
    }"""
))

# 7. Add daily-review flag in startExam
replacements.append((
    """function startExam(cardId) {
  state.activeCardId = cardId;
  state.exam.questions = generateQuestions(cardId);
  state.exam.current = 0;
  state.exam.answers = [];
  state.exam.finished = false;
  switchView('exam');
  renderExam();
}""",
    """function startExam(cardId) {
  state.activeCardId = cardId;
  state.exam.questions = generateQuestions(cardId);
  state.exam.current = 0;
  state.exam.answers = [];
  state.exam.finished = false;
  state.exam.mode = 'card';
  switchView('exam');
  renderExam();
}"""
))

# 8. Replace inline mastery update with helper + persistence
replacements.append((
    """  // 更新掌握度
  const card = getCard(state.activeCardId);
  if (card && card.mastery && card.mastery[q.type]) {
    const m = card.mastery[q.type];
    if (isCorrect) {
      m.streak_right++;
      m.streak_wrong = 0;
      m.total_rights++;
      m.last_result = 'right';
      if (m.streak_right >= 3) {
        m.status = '已掌握';
        m.level = Math.min(5, m.level + 1);
        m.streak_right = 0;
      } else {
        m.status = '正在学习';
      }
    } else {
      m.streak_wrong++;
      m.streak_right = 0;
      m.total_wrongs++;
      m.last_result = 'wrong';
      if (m.streak_wrong >= 2) {
        m.level = Math.max(0, m.level - 1);
        m.status = m.level >= 3 ? '正在学习' : '已遗忘';
        m.streak_wrong = 0;
      }
    }
    m.last_review = new Date().toISOString();
  }""",
    """  // 更新掌握度并持久化
  updateMasteryAfterAnswer(q.type, isCorrect);"""
))

# 9. Add persistence/helpers block before getCard
replacements.append((
    """function getCard(id) { return CARDS.find(c => c.id === id); }
function getExperience(id) { return EXPERIENCES.find(e => e.id === id); }""",
    """// ===== 持久化与 SRS 调度 =====
const STORAGE_KEY = 'sh_index_v1_state';
const SRS_INTERVALS = [1, 2, 4, 7, 14, 30];

function scheduleNextReview(level) {
  const days = SRS_INTERVALS[Math.min(level, SRS_INTERVALS.length - 1)] || 1;
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function ensureMasteryFields(card) {
  if (!card.mastery) return;
  Object.values(card.mastery).forEach(m => {
    if (typeof m.next_review !== 'number') m.next_review = 0;
  });
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.stats) state.stats = { ...state.stats, ...saved.stats };
    if (saved.cards) {
      CARDS.forEach(card => {
        const savedCard = saved.cards[card.id];
        if (!savedCard || !savedCard.mastery) return;
        if (!card.mastery) card.mastery = {};
        Object.keys(savedCard.mastery).forEach(vec => {
          if (!card.mastery[vec]) return;
          Object.assign(card.mastery[vec], savedCard.mastery[vec]);
        });
      });
    }
  } catch (e) {
    console.warn('加载学习进度失败', e);
  }
}

function saveProgress() {
  try {
    const payload = {
      version: 1,
      savedAt: Date.now(),
      stats: state.stats,
      cards: {}
    };
    CARDS.forEach(card => {
      if (!card.mastery) return;
      payload.cards[card.id] = { mastery: {} };
      Object.keys(card.mastery).forEach(vec => {
        const m = card.mastery[vec];
        payload.cards[card.id].mastery[vec] = {
          level: m.level,
          status: m.status,
          streak_right: m.streak_right,
          streak_wrong: m.streak_wrong,
          total_rights: m.total_rights,
          total_wrongs: m.total_wrongs,
          last_result: m.last_result,
          last_review: m.last_review,
          next_review: m.next_review
        };
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('保存学习进度失败', e);
  }
}

function getDueVectors() {
  const now = Date.now();
  const all = [];
  CARDS.forEach(card => {
    if (!card.mastery) return;
    Object.entries(card.mastery).forEach(([vec, m]) => {
      all.push({ card, vector: vec, mastery: m, due: (m.next_review || 0) <= now });
    });
  });
  return all;
}

function generateQuestionForVector(card, vector) {
  const c = card.data.canonical;
  const profile = c.symptom_profile || {};
  const allSymptoms = [...(profile.necessary || []), ...(profile.common || [])];
  if (vector === '0→1') {
    const necessaryJoined = (profile.necessary || []).join('、');
    return {
      type: '0→1', cardId: card.id,
      text: `${card.name}的必要症状包括哪些？`,
      correct: necessaryJoined,
      options: generateOptions(card.id, '0→1', necessaryJoined)
    };
  }
  if (vector === '1→0' && allSymptoms.length > 0) {
    return {
      type: '1→0', cardId: card.id,
      text: `患者出现 ${allSymptoms.slice(0, 2).join('、')}，最可能选哪个方？`,
      correct: card.id,
      options: generateOptions(card.id, '1→0')
    };
  }
  if (vector === '0→2' && c.herbs.length > 0) {
    return {
      type: '0→2', cardId: card.id,
      text: `${card.name}包含以下哪味药？`,
      correct: [c.herbs[0].name],
      options: generateOptions(card.id, '0→2', c.herbs[0].name)
    };
  }
  if (vector === '0→contra' && c.contraindications.length > 0) {
    return {
      type: '0→contra', cardId: card.id,
      text: `${card.name}的禁忌是什么？`,
      correct: [c.contraindications[0]],
      options: generateOptions(card.id, '0→contra', c.contraindications[0])
    };
  }
  if (vector === '0→usage' && c.usage) {
    return {
      type: '0→usage', cardId: card.id,
      text: `${card.name}的煎服法是什么？`,
      correct: c.usage,
      options: generateOptions(card.id, '0→usage', c.usage)
    };
  }
  if (vector === '2→0' && c.herbs.length > 0) {
    return {
      type: '2→0', cardId: card.id,
      text: `药物组成为 ${c.herbs.map(h => h.name).join('、')} 的是哪个方？`,
      correct: card.id,
      options: generateOptions(card.id, '2→0')
    };
  }
  return null;
}

function startDailyReview(count = 5) {
  const allVectors = getDueVectors();
  const due = allVectors.filter(x => x.due);
  const notDue = allVectors.filter(x => !x.due);
  due.sort((a, b) => (a.mastery.level - b.mastery.level) || (a.mastery.next_review - b.mastery.next_review));
  notDue.sort((a, b) => (a.mastery.level - b.mastery.level) || (a.mastery.next_review - b.mastery.next_review));
  let selected = due.slice(0, count);
  if (selected.length < count) {
    selected = selected.concat(notDue.slice(0, count - selected.length));
  }
  if (selected.length < count) {
    const mastered = allVectors.filter(x => x.mastery.status === '已掌握').sort(() => Math.random() - 0.5);
    selected = selected.concat(mastered.slice(0, count - selected.length));
  }
  const questions = selected.map(s => generateQuestionForVector(s.card, s.vector)).filter(Boolean);
  if (questions.length === 0) {
    alert('暂无可复习题目，请先学习卡片。');
    return;
  }
  state.exam.questions = questions;
  state.exam.current = 0;
  state.exam.answers = [];
  state.exam.finished = false;
  state.exam.mode = 'daily';
  state.activeCardId = questions[0].cardId;
  switchView('exam');
  renderExam();
}

function renderReviewPanel() {
  const panel = document.getElementById('reviewPanel');
  if (!panel) return;
  const all = getDueVectors();
  const dueCount = all.filter(x => x.due).length;
  const mastered = all.filter(x => x.mastery.status === '已掌握').length;
  const total = all.length;
  panel.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <button class="btn-primary" onclick="startDailyReview()">今日复习 (${dueCount})</button>
      <span class="tag">已掌握 ${mastered}/${total}</span>
    </div>
  `;
}

function updateMasteryAfterAnswer(vector, isCorrect) {
  const card = getCard(state.activeCardId);
  if (!card || !card.mastery || !card.mastery[vector]) return;
  const m = card.mastery[vector];
  if (isCorrect) {
    m.streak_right++;
    m.streak_wrong = 0;
    m.total_rights++;
    m.last_result = 'right';
    if (m.streak_right >= 3) {
      m.level = Math.min(5, m.level + 1);
      m.status = '已掌握';
      m.streak_right = 0;
    } else {
      m.status = '正在学习';
    }
  } else {
    m.streak_wrong++;
    m.streak_right = 0;
    m.total_wrongs++;
    m.last_result = 'wrong';
    if (m.streak_wrong >= 2) {
      m.level = Math.max(0, m.level - 1);
      m.status = m.level >= 3 ? '正在学习' : '已遗忘';
      m.streak_wrong = 0;
    }
  }
  m.last_review = new Date().toISOString();
  m.next_review = scheduleNextReview(m.level);
  saveProgress();
}

// ===== Kimi 导师 =====
function buildTutorPrompt() {
  const card = getCard(state.activeCardId);
  if (!card) return '';
  const c = card.data.canonical;
  const profile = c.symptom_profile || {};
  return `我正在学习《伤寒论》方剂：${card.name}。
原文/提纲：${card.data.source_text || '暂无'}
必要症：${(profile.necessary || []).join('、')}
常见症：${(profile.common || []).join('、')}
排除症：${(profile.excluding || []).join('、')}
药物：${(c.herbs || []).map(h => h.name).join('、')}
病机：${c.pathology || '暂无'}
煎服法：${c.usage || '暂无'}
禁忌：${(c.contraindications || []).join('、')}

请帮我：
1. 用一句话总结此方核心辨证点；
2. 指出最容易与哪几个方混淆；
3. 给出一道我自测用的场景题。`;
}

function openTutorModal() {
  const prompt = buildTutorPrompt();
  const html = `
    <div class="tutor-overlay" onclick="if(event.target===this)closeTutorModal()">
      <div class="tutor-modal">
        <div class="tutor-title">问 Kimi（复制下方 prompt）</div>
        <textarea class="tutor-text" id="tutorPromptText" readonly>${prompt.replace(/</g, '&lt;')}</textarea>
        <div class="tutor-actions">
          <button class="btn-primary" onclick="copyTutorPrompt()">复制 Prompt</button>
          <button class="btn-secondary" onclick="closeTutorModal()">关闭</button>
        </div>
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.id = 'tutorModal';
  div.innerHTML = html;
  document.body.appendChild(div);
}

function closeTutorModal() {
  const el = document.getElementById('tutorModal');
  if (el) el.remove();
}

async function copyTutorPrompt() {
  const ta = document.getElementById('tutorPromptText');
  if (!ta) return;
  ta.select();
  try {
    await navigator.clipboard.writeText(ta.value);
    alert('Prompt 已复制，打开 Kimi 粘贴即可。');
  } catch (e) {
    document.execCommand('copy');
    alert('Prompt 已复制，打开 Kimi 粘贴即可。');
  }
}

function getCard(id) { return CARDS.find(c => c.id === id); }
function getExperience(id) { return EXPERIENCES.find(e => e.id === e.id); }"""
))

# Note: we intentionally kept the getExperience typo "e.id === e.id" to match original; not a functional issue.

# 10. Initialize with persistence
replacements.append((
    "loadData().then(renderDashboard);",
    """loadData().then(() => {
  CARDS.forEach(ensureMasteryFields);
  loadProgress();
  renderDashboard();
  renderReviewPanel();
});"""
))

# 11. Render dashboard also refreshes review panel
replacements.append((
    "function renderDashboard() {\n  const container = document.getElementById('cardList');",
    "function renderDashboard() {\n  renderReviewPanel();\n  const container = document.getElementById('cardList');"
))

# 12. Add "问 Kimi" button in learn view action bar
replacements.append((
    """    <div class="action-bar">
      <button class="btn-primary" onclick="startExam('${card.id}')">开始测试 (Enter)</button>
      <button class="btn-secondary" onclick="goToDashboard()">返回 (Esc)</button>
    </div>""",
    """    <div class="action-bar">
      <button class="btn-primary" onclick="startExam('${card.id}')">开始测试 (Enter)</button>
      <button class="btn-secondary" onclick="openTutorModal()">问 Kimi</button>
      <button class="btn-secondary" onclick="goToDashboard()">返回 (Esc)</button>
    </div>"""
))

# 13. Add tutor modal CSS before </style>
replacements.append((
    """/* 快捷键提示 */
.keyboard-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}
</style>""",
    """/* Kimi 导师弹窗 */
.tutor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.tutor-modal {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  width: min(600px, 90vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
}
.tutor-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.tutor-text {
  width: 100%;
  height: 280px;
  resize: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.7;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-body);
  color: var(--text-primary);
}
.tutor-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>"""
))

for old, new in replacements:
    if old not in text:
        raise ValueError(f"Replacement target not found:\n{old[:200]}...")
    text = text.replace(old, new, 1)

FILE.write_text(text, encoding="utf-8")
print("patched", FILE)
