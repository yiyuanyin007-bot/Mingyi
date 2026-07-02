// 明医成长录 V1.0  —  第 1 页

// ========== app.js ==========
/**
 * app.js — 应用入口（ROUND 2 完整版）
 * 职责：初始化、路由、数据加载、组件挂载
 */

import { preloadAll } from '@services/DataService.js';
import { loadState, updateMastery, updateStats, updateTodayStats, getTodayStats } from '@services/StorageService.js';
import { recordAnswerEvent, getTopErrorCards, getTopPracticeCards, getWeakVectors, generateReviewSuggestions, loadStats } from '@services/StatsService.js';
import { openPracticeSummary, closePracticeSummary } from '@components/PracticeSummary.js';
import { renderWrongBookView } from '@components/WrongBookView.js';
import { renderSixJingRadar, renderLearningCurve, renderMasteryDistribution } from '@components/StatsCharts.js';

import { getState, setState, subscribe, setPage, setActiveCard, initExam, recordAnswer, recordSelection, submitExam, setExamCurrent, nextQuestion, prevQuestion, resetExam } from '@store/AppStore.js';
import { renderCardList } from '@components/CardList.js';
import { renderLearnView } from '@components/LearnView.js';
import { openSourcePanel } from '@components/SourcePanel.js';
import { renderExamView } from '@components/ExamView.js';
import { openKimiModal } from '@components/KimiModal.js';
import { generateQuestions as genQuestionsForCard, generateQuestionForVector, generateOptions, generateDailyReview } from '@services/ExamService.js';
import { generateRetrievalRound, generateWrongProfile } from '@services/RetrievalEngine.js';
import { getVectorLabel } from '@utils/formatters.js';
import { getMasteryOverview } from '@services/MasteryService.js';
import { searchCards, saveSearchHistory } from '@utils/search.js';

/** 全局数据引用（过渡方案） */
let CARDS = [];
let EXPERIENCES = [];
let SOURCES = [];

/** 搜索状态 */
let searchState = {
  query: '',
  filteredCards: null,
  activeTag: null,
  isClusterMode: false
};

/**
 * 初始化应用
 */
async function init() {
  const app = document.getElementById('app');

  try {
    // 1. 加载用户进度
    const userState = loadState();
    console.log('[App] 用户状态加载完成', userState);

    // 2. 加载卡片数据

// --- 第 1 页 结束 ---

// 明医成长录 V1.0  —  第 2 页
    const data = await preloadAll();
    CARDS = data.cards;
    EXPERIENCES = data.experiences;
    SOURCES = data.sources;
    console.log('[App] 数据加载完成', { cards: CARDS.length, experiences: EXPERIENCES.length, sources: SOURCES.length });

    // 3. 将掌握度数据合并到卡片（旧版数据在 cards 里，新版在 localStorage）
    CARDS.forEach(card => {
      if (userState.mastery[card.id]) {
        if (!card.mastery) card.mastery = {};
        Object.assign(card.mastery, userState.mastery[card.id]);
      }
    });

    // 4. 初始化页面结构
    app.innerHTML = `
      <div class="topbar">
        <div class="topbar-title">《伤寒论》方剂训练 · v9 <span class="version-badge">重构版</span></div>
        <div class="topbar-actions">
          <button class="topbar-btn" id="btnReview">今日复习</button>
          <button class="topbar-btn" id="btnStats">统计</button>
          <button class="topbar-btn" id="btnOverallReview">总体复习</button>
          <button class="topbar-btn" id="btnWrongBook">错题本</button>
          <button class="theme-btn" id="btnTheme" title="切换主题">☀️</button>
        </div>
      </div>
      <div class="main">
        <div class="view active" id="viewDashboard">
          <div class="dashboard-header">
            <div class="dashboard-title">方剂卡片</div>
            <div class="dashboard-desc" id="dashboardDesc"></div>
          </div>
          <div class="dashboard-search-bar" id="searchBar">
            <div class="search-input-wrapper">
              <input type="text" class="search-input" id="searchInput" placeholder="搜索方名、拼音首字母或标签..." autocomplete="off" />
              <button class="search-clear" id="searchClear" style="display:none;" title="清除">×</button>
            </div>
            <div class="search-filter-hint" id="searchHint" style="display:none;"></div>
          </div>
          <div id="reviewPanel"></div>
          <div id="cardListContainer"></div>
        </div>
        <div class="view" id="viewWrongBook">
          <div id="wrongBookContainer"></div>
        </div>
        <div class="view" id="viewLearn">
          <div id="learnContainer"></div>
        </div>
        <div class="view" id="viewExam">
          <div id="examContainer"></div>

// --- 第 2 页 结束 ---

// 明医成长录 V1.0  —  第 3 页
        </div>
        <div class="view" id="viewStats">
          <div id="statsContainer"></div>
        </div>
      </div>
    `;

    // 5. 绑定顶部栏按钮
    document.getElementById('btnReview').addEventListener('click', startDailyReview);
    document.getElementById('btnTheme').addEventListener('click', toggleTheme);
    document.getElementById('btnStats').addEventListener('click', () => {
      setPage('stats');
      renderStats();
    });
    document.getElementById('btnOverallReview').addEventListener('click', startOverallReview);
    document.getElementById('btnWrongBook').addEventListener('click', () => {
      setPage('wrongBook');
      renderWrongBookView(document.getElementById('wrongBookContainer'), CARDS, {
        onViewCard: (cardId) => {
          setActiveCard(cardId);
          setPage('learn');
          renderLearn(cardId);
        },
        onClose: () => {
          setPage('dashboard');
          renderDashboard();
        }
      });
    });

    // 5.5 绑定搜索栏
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        handleSearch(e.target.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.target.value = '';
          handleSearch('');
        }
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        handleSearch('');
        searchInput.focus();
      });

// --- 第 3 页 结束 ---

// 明医成长录 V1.0  —  第 4 页
    }

    // 6. 渲染仪表盘
    renderDashboard();

    // 7. 键盘快捷键
    document.addEventListener('keydown', handleKeydown);

    // 8. 订阅状态变化（调试用）
    subscribe((newState, oldState) => {
      if (newState.page !== oldState.page) {
        switchView(newState.page);
      }
    });

  } catch (err) {
    console.error('[App] 初始化失败:', err);
    app.innerHTML = `
      <div class="error-boundary">
        <h2>系统初始化失败</h2>
        <p>请检查网络连接，或尝试刷新页面。</p>
        <p>错误信息：${err.message}</p>
      </div>
    `;
  }
}

// ===== 视图切换 =====

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const viewId = 'view' + name.charAt(0).toUpperCase() + name.slice(1);
  const view = document.getElementById(viewId);
  if (view) view.classList.add('active');
}

// ===== 仪表盘 =====

function renderDashboard() {
  const overview = getMasteryOverview(CARDS, {});
  const desc = document.getElementById('dashboardDesc');
  desc.textContent = `数据加载：${CARDS.length} 张卡片，${overview.masteredCount}/${overview.totalVectors} 向量已掌握。`;

  // 复习面板 + 今日统计
  const panel = document.getElementById('reviewPanel');
  const now = Date.now();
  let dueCount = 0;
  CARDS.forEach(card => {
    Object.values(card.mastery || {}).forEach(m => {
      if ((m.next_review || 0) <= now) dueCount++;

// --- 第 4 页 结束 ---

// 明医成长录 V1.0  —  第 5 页
    });
  });

  const todayStats = getTodayStats();
  const totalRate = todayStats.total > 0 ? Math.round(todayStats.right / todayStats.total * 100) : 0;

  panel.innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;background:var(--bg-panel);border:1px solid var(--border);border-radius:10px;">
      <span style="font-size:13px;font-weight:600;color:var(--text-primary);">今日完成</span>
      <span style="font-size:12px;color:var(--text-secondary);">${todayStats.total} 题</span>
      <span style="font-size:12px;color:var(--success);">✓ ${todayStats.right}</span>
      <span style="font-size:12px;color:var(--error);">✗ ${todayStats.wrong}</span>
      ${todayStats.total > 0 ? `<span style="font-size:12px;color:var(--text-muted);">正确率 ${totalRate}%</span>` : ''}
    </div>
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
      <button class="btn-primary" id="btnDailyReview">今日复习 (${dueCount})</button>
      <button class="btn-secondary" id="btnExamMode">模拟考试</button>
    </div>
  `;
  document.getElementById('btnDailyReview').addEventListener('click', startDailyReview);
  document.getElementById('btnExamMode').addEventListener('click', startExamMode);

  // 卡片列表
  const container = document.getElementById('cardListContainer');
  
  // 确定显示哪些卡片（搜索过滤 / 标签聚类 / 全部）
  const displayCards = searchState.filteredCards || searchState.activeTag
    ? (searchState.filteredCards || CARDS.filter(c => c.tags && c.tags.includes(searchState.activeTag)))
    : CARDS;
  
  // 搜索提示和聚类操作栏
  const searchHint = document.getElementById('searchHint');
  if (searchHint) {
    if (searchState.activeTag) {
      // 标签聚类模式
      searchHint.innerHTML = `
        <span>🏷️ 标签「${searchState.activeTag}」：${displayCards.length} 张卡片</span>
        <div class="search-actions">
          <button class="btn-cluster-exam" id="btnTagClusterExam">📋 聚类复习</button>
          <button class="btn-cluster-clear" id="btnClearCluster">清除</button>
        </div>
      `;
      searchHint.style.display = 'flex';
      document.getElementById('btnTagClusterExam')?.addEventListener('click', () => startTagClusterExam());
      document.getElementById('btnClearCluster')?.addEventListener('click', clearSearch);
    } else if (searchState.query) {
      // 搜索过滤模式
      searchHint.innerHTML = `
        <span>🔍 搜索结果：${displayCards.length} 张卡片匹配「${searchState.query}」</span>
        <div class="search-actions">

// --- 第 5 页 结束 ---

// 明医成长录 V1.0  —  第 6 页
          <button class="btn-cluster-exam" id="btnSearchClusterExam">📋 聚类复习</button>
          <button class="btn-cluster-clear" id="btnClearSearch">清除</button>
        </div>
      `;
      searchHint.style.display = 'flex';
      document.getElementById('btnSearchClusterExam')?.addEventListener('click', () => startSearchClusterExam());
      document.getElementById('btnClearSearch')?.addEventListener('click', clearSearch);
    } else {
      searchHint.style.display = 'none';
      searchHint.innerHTML = '';
    }
  }
  
  renderCardList(container, displayCards, {
    onCardClick: (cardId) => {
      setActiveCard(cardId);
      setPage('learn');
      renderLearn(cardId);
    },
    onTagClick: (tagName) => {
      // 点击标签进入聚类模式
      searchState = {
        query: '',
        filteredCards: null,
        activeTag: tagName,
        isClusterMode: true
      };
      // 清空搜索框
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      renderDashboard();
    },
    highlightQuery: searchState.query,
    activeTag: searchState.activeTag
  });
}

// ===== 查看此方后返回错题面板的标志 =====
let fromPracticeSummaryFlag = false;

// ===== 学习视图 =====

function renderLearn(cardId) {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;
  const container = document.getElementById('learnContainer');

  renderLearnView(container, card, {
    onBack: () => {
      if (fromPracticeSummaryFlag) {

// --- 第 6 页 结束 ---

// 明医成长录 V1.0  —  第 7 页
        fromPracticeSummaryFlag = false;
        setPage('exam');
        renderExam();
      } else {
        setPage('dashboard');
        renderDashboard();
      }
    },
    onPractice: (id) => startPractice(id),
    onSimilar: (id) => startPracticeSimilar(id),
    onExam: () => startExamMode(),
    onTutor: () => openKimiModal(card),
    onSource: (id) => {
      const c = CARDS.find(x => x.id === id);
      if (!c) return;
      openSourcePanel(c, SOURCES, document.body);
    }
  });
}

// ===== 考试/练习视图 =====

function renderExam() {
  const state = getState();
  const container = document.getElementById('examContainer');

  renderExamView(container, state.exam, {
    onSelect: (idx) => handleSelectOption(idx),
    onPrev: () => { prevQuestion(); renderExam(); },
    onNext: () => { nextQuestion(); renderExam(); },
    onSubmit: () => { submitExam(); renderExam(); },
    onFinish: () => finishExam()
  }, CARDS);
}

function handleSelectOption(idx) {
  const state = getState();
  const isExam = state.exam.mode === 'exam';
  if (state.exam.finished && !isExam) return;
  if (isExam && state.exam.submitted) return;

  const q = state.exam.questions[state.exam.current];
  if (!q || !q.options || idx < 0 || idx >= q.options.length) return;
  
  const selected = q.options[idx];
  const isCorrect = checkAnswer(q, selected);

  if (isExam) {
    recordSelection(state.exam.current, selected);
  } else {

// --- 第 7 页 结束 ---

// 明医成长录 V1.0  —  第 8 页
    recordAnswer(state.exam.current, selected, isCorrect);
    updateMastery(q.cardId, q.type, isCorrect);
    updateStats(isCorrect);
    updateTodayStats(isCorrect);
    recordAnswerEvent(q.cardId, q.cardName || q.cardId, q.type, getVectorLabel(q.type), isCorrect, state.exam.mode, selected.label);
  }
  renderExam();
}

function checkAnswer(q, selected) {
  if (!q || !selected) return false;
  if (q.type === '1→0' || q.type === '2→0') {
    // 1→0: correct 是 card.id，用 id 比较
    // 2→0: correct 是 card.name，用 label 比较（或 id 兜底）
    return selected.id === q.correct || selected.label === q.correct;
  }
  if (Array.isArray(q.correct)) {
    return q.correct.includes(selected.label);
  }
  return selected.label === q.correct;
}

function finishExam() {
  const state = getState();
  if (state.exam.mode === 'exam') {
    // 考试模式：提交后统一判分，记录统计（包含未作答的）
    state.exam.answers.forEach(a => {
      recordAnswerEvent(a.question.cardId, a.question.cardName || a.question.cardId, a.question.type, getVectorLabel(a.question.type), a.isCorrect, 'exam', a.selected?.label);
    });
    setPage('dashboard');
    renderDashboard();
    resetExam();
  } else {
    // 练习模式：显示错题回顾面板
    openPracticeSummary(state.exam, CARDS, {
      onViewCard: (cardId) => {
        fromPracticeSummaryFlag = true;
        setActiveCard(cardId);
        setPage('learn');
        renderLearn(cardId);
      },
      onAskKimi: (prompt) => {
        openKimiModal({ prompt, title: '错题分析' });
      },
      onRetrieval: () => {
        startRetrievalRound();
      },
      onRetryWrong: (cardId, vector) => {
        if (cardId === 'all') {
          // 重做错题：只包含答错的题目

// --- 第 8 页 结束 ---

// 明医成长录 V1.0  —  第 9 页
          const wrongQuestions = state.exam.answers
            .filter(a => !a.isCorrect)
            .map(a => a.question);
          if (wrongQuestions.length === 0) {
            alert('没有错题可重做！');
            return;
          }
          initExam(wrongQuestions, state.exam.mode);
          setPage('exam');
          renderExam();
        } else if (cardId && vector) {
          // 重做某方某向量
          const card = CARDS.find(c => c.id === cardId);
          if (!card) return;
          const q = generateQuestionForVector(card, vector);
          if (!q) { alert('暂无可练习题目。'); return; }
          q.options = generateOptions(q.cardId, q.type, CARDS);
          initExam([q], 'practice-card');
          setPage('exam');
          renderExam();
        }
      },
      onReturn: () => {
        setPage('dashboard');
        renderDashboard();
        resetExam();
      }
    });
  }
}

// ===== 启动各种模式 =====

function startPractice(cardId) {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;
  const questions = genQuestionsForCard(card).map(q => {
    q.options = generateOptions(q.cardId, q.type, CARDS);
    return q;
  }).filter(Boolean);
  if (questions.length === 0) { alert('暂无可练习题目。'); return; }
  initExam(questions, 'practice-card');
  setPage('exam');
  renderExam();
}

function startPracticeSimilar(cardId) {
  // 简化版：从当前卡片及其相近卡片中抽题
  const target = CARDS.find(c => c.id === cardId);
  if (!target) return;

// --- 第 9 页 结束 ---

// 明医成长录 V1.0  —  第 10 页
  const similarIds = getSimilarCardIds(cardId, 3);
  const ids = [cardId, ...similarIds];
  const questions = ids.flatMap(id => {
    const c = CARDS.find(x => x.id === id);
    if (!c) return [];
    return genQuestionsForCard(c).slice(0, 2).map(q => {
      if (!q) return null;
      q.options = generateOptions(q.cardId, q.type, CARDS);
      return q;
    });
  }).filter(Boolean);
  if (questions.length === 0) { alert('暂无可练习题目。'); return; }
  // 洗牌
  questions.sort(() => Math.random() - 0.5);
  initExam(questions, 'practice-similar');
  setPage('exam');
  renderExam();
}

function startExamMode(count = 10) {
  const allVectors = [];
  CARDS.forEach(card => {
    const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];
    vectors.forEach(v => {
      const q = generateQuestionForVector(card, v);
      if (q) allVectors.push({ card, vector: v });
    });
  });
  if (allVectors.length === 0) { alert('暂无可考试题目。'); return; }
  allVectors.sort(() => Math.random() - 0.5);
  const selected = allVectors.slice(0, Math.min(count, allVectors.length));
  const questions = selected.map(s => {
    const q = generateQuestionForVector(s.card, s.vector);
    if (!q) return null;
    q.options = generateOptions(q.cardId, q.type, CARDS);
    return q;
  }).filter(Boolean);
  initExam(questions, 'exam');
  setPage('exam');
  renderExam();
}

function startDailyReview() {
  const userState = loadState();
  const questions = generateDailyReview(CARDS, userState.mastery, 5);
  if (questions.length === 0) { alert('暂无可复习题目。'); return; }
  initExam(questions, 'daily');
  setPage('exam');
  renderExam();
}

// --- 第 10 页 结束 ---

// 明医成长录 V1.0  —  第 11 页

// ===== 辅助函数 =====

function getSimilarCardIds(cardId, count = 4) {
  const target = CARDS.find(c => c.id === cardId);
  if (!target) return [];
  const targetTags = new Set(target.tags || []);
  const targetChapter = target.source_chapter;
  const targetBase = target.lineage && target.lineage.base_formula;

  const scored = CARDS.filter(c => c.id !== cardId).map(c => {
    let score = 0;
    (c.tags || []).forEach(t => { if (targetTags.has(t)) score += 2; });
    if (c.source_chapter === targetChapter) score += 3;
    if (c.lineage && c.lineage.base_formula === targetBase) score += 5;
    return { id: c.id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.id);
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

function renderStats() {
  const container = document.getElementById('statsContainer');
  const todayStats = getTodayStats();
  const topError = getTopErrorCards(3, 5);
  const topPractice = getTopPracticeCards(5);
  const weakVectors = getWeakVectors();
  const suggestions = generateReviewSuggestions(CARDS).slice(0, 10);

  let html = `
    <div class="stats-layout">
      <div class="stats-header">
        <div class="stats-title">学习统计</div>
        <button class="btn-secondary" id="statsBack">返回仪表盘</button>
      </div>
      
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-title">今日概览</div>
          <div class="stats-card-body">
            <div class="stats-number">${todayStats.total}<span class="stats-unit">题</span></div>
            <div class="stats-detail">

// --- 第 11 页 结束 ---

// 明医成长录 V1.0  —  第 12 页
              <span style="color:var(--success);">✓ ${todayStats.right} 对</span>
              <span style="color:var(--error);">✗ ${todayStats.wrong} 错</span>
            </div>
            <div class="stats-detail">涉及 ${todayStats.cardCount || 0} 张方剂</div>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">错误率最高</div>
          <div class="stats-card-body">
            ${topError.length > 0 ? topError.map((c, i) => `
              <div class="stats-rank-item">
                <span class="stats-rank-num">${i + 1}</span>
                <span class="stats-rank-name">${c.cardName}</span>
                <span class="stats-rank-rate" style="color:var(--error);">${Math.round(c.errorRate * 100)}%</span>
              </div>
            `).join('') : '<div style="color:var(--text-muted);">暂无数据（需累计答3题以上）</div>'}
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">练习次数最多</div>
          <div class="stats-card-body">
            ${topPractice.length > 0 ? topPractice.map((c, i) => `
              <div class="stats-rank-item">
                <span class="stats-rank-num">${i + 1}</span>
                <span class="stats-rank-name">${c.cardName}</span>
                <span class="stats-rank-rate">${c.totalAttempts}次</span>
              </div>
            `).join('') : '<div style="color:var(--text-muted);">暂无数据</div>'}
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">最弱向量</div>
          <div class="stats-card-body">
            ${weakVectors.length > 0 ? weakVectors.map((v, i) => `
              <div class="stats-rank-item">
                <span class="stats-rank-num">${i + 1}</span>
                <span class="stats-rank-name">${v.vector}</span>
                <span class="stats-rank-rate">${v.totalErrors}次</span>
              </div>
            `).join('') : '<div style="color:var(--text-muted);">暂无数据</div>'}
          </div>
        </div>
      </div>
      
      <div class="stats-card" style="max-width:100%;">
        <div class="stats-card-title">复习建议</div>
        <div class="stats-card-body">

// --- 第 12 页 结束 ---

// 明医成长录 V1.0  —  第 13 页
          ${suggestions.length > 0 ? suggestions.map(s => `
            <div class="stats-suggestion" data-card-id="${s.cardId}" data-vector="${s.vector}">
              <span class="stats-suggestion-level ${s.level}">${s.level === 'high' ? '🔴' : s.level === 'medium' ? '🟡' : '🟢'}</span>
              <span class="stats-suggestion-name">${s.cardName} — ${s.vectorLabel}</span>
              <span class="stats-suggestion-meta">错误率 ${Math.round(s.errorRate * 100)}% (${s.errorCount}/${s.attempts})</span>
              ${s.isTodayError ? '<span class="stats-suggestion-today">今天</span>' : ''}
              ${s.consecutiveErrors > 1 ? `<span class="stats-suggestion-streak">连续错${s.consecutiveErrors}次</span>` : ''}
            </div>
          `).join('') : '<div style="color:var(--text-muted);">暂无数据，请先练习</div>'}
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="stats-charts-grid">
        <div class="stats-chart-card">
          <div class="stats-chart-title">六经覆盖雷达图</div>
          <div class="stats-chart-body">
            <canvas id="radarChart"></canvas>
          </div>
        </div>
        <div class="stats-chart-card">
          <div class="stats-chart-title">掌握度分布</div>
          <div class="stats-chart-body">
            <canvas id="masteryChart"></canvas>
          </div>
        </div>
        <div class="stats-chart-card" style="grid-column:1/-1;">
          <div class="stats-chart-title">学习曲线（最近30天）</div>
          <div class="stats-chart-body">
            <canvas id="curveChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // 渲染图表
  try {
    const radarCanvas = document.getElementById('radarChart');
    if (radarCanvas) renderSixJingRadar(radarCanvas, CARDS);

    const masteryCanvas = document.getElementById('masteryChart');
    if (masteryCanvas) renderMasteryDistribution(masteryCanvas, CARDS);

    const curveCanvas = document.getElementById('curveChart');
    if (curveCanvas) renderLearningCurve(curveCanvas, CARDS);
  } catch (e) {
    console.warn('[Stats] 图表渲染失败:', e);

// --- 第 13 页 结束 ---

// 明医成长录 V1.0  —  第 14 页
  }

  // 绑定返回按钮
  document.getElementById('statsBack').addEventListener('click', () => {
    setPage('dashboard');
    renderDashboard();
  });

  // 绑定复习建议点击
  container.querySelectorAll('.stats-suggestion').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const cardId = el.dataset.cardId;
      const vector = el.dataset.vector;
      const card = CARDS.find(c => c.id === cardId);
      if (!card) return;
      const q = generateQuestionForVector(card, vector);
      if (!q) { alert('暂无可练习题目。'); return; }
      q.options = generateOptions(q.cardId, q.type, CARDS);
      initExam([q], 'practice-card');
      setPage('exam');
      renderExam();
    });
  });
}

function startOverallReview() {
  // 总体复习：基于复习建议生成10道题目
  const suggestions = generateReviewSuggestions(CARDS);
  if (suggestions.length === 0) { alert('暂无足够数据生成总体复习。请先练习。'); return; }
  
  const questions = suggestions.slice(0, 10).map(s => {
    const card = CARDS.find(c => c.id === s.cardId);
    if (!card) return null;
    const q = generateQuestionForVector(card, s.vector);
    if (!q) return null;
    q.options = generateOptions(q.cardId, q.type, CARDS);
    return q;
  }).filter(Boolean);
  
  if (questions.length === 0) { alert('暂无可复习题目。'); return; }
  initExam(questions, 'overall');
  setPage('exam');
  renderExam();
}

// ===== 检索练习（再来一组）=====

function startRetrievalRound() {
  const state = getState();

// --- 第 14 页 结束 ---

// 明医成长录 V1.0  —  第 15 页
  const questions = generateRetrievalRound(state.exam.answers, CARDS);
  
  if (questions.length === 0) {
    alert('暂无可生成的检索练习题目。');
    return;
  }

  // 为每道题生成选项
  const questionsWithOptions = questions.map(q => {
    q.options = generateOptions(q.cardId, q.type, CARDS);
    return q;
  }).filter(q => q.options && q.options.length > 0);

  if (questionsWithOptions.length === 0) {
    alert('选项生成失败，请重试。');
    return;
  }

  // 显示错题画像
  const profile = generateWrongProfile(state.exam.answers, CARDS);
  if (profile.hasWeakness && profile.suggestions.length > 0) {
    console.log('[Retrieval] 错题画像:', profile);
  }

  initExam(questionsWithOptions, 'retrieval');
  setPage('exam');
  renderExam();
  
  const fallbackMsg = questionsWithOptions[0]?.roundInfo?.fallback ? '（随机抽题）' : '';
  alert(`再来一组：共 ${questionsWithOptions.length} 题 ${fallbackMsg}`);
}

// ===== 搜索系统 =====

function handleSearch(query) {
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.style.display = query.trim() ? 'flex' : 'none';
  
  if (!query.trim()) {
    // 清空搜索，但保留标签聚类
    if (searchState.activeTag) {
      // 只清除搜索词，保留标签聚类
      searchState.query = '';
      searchState.filteredCards = null;
    } else {
      searchState = { query: '', filteredCards: null, activeTag: null, isClusterMode: false };
    }
    renderDashboard();
    return;
  }

// --- 第 15 页 结束 ---

// 明医成长录 V1.0  —  第 16 页
  
  // 联合搜索
  const filtered = searchCards(CARDS, query);
  
  searchState = {
    query: query,
    filteredCards: filtered,
    activeTag: null,
    isClusterMode: false
  };
  
  renderDashboard();
  saveSearchHistory(query);
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.style.display = 'none';
  
  searchState = { query: '', filteredCards: null, activeTag: null, isClusterMode: false };
  renderDashboard();
}

// ===== 聚类考试 =====

function startSearchClusterExam() {
  const cards = searchState.filteredCards || [];
  const query = searchState.query || '';
  if (cards.length === 0) {
    alert('没有可考试的卡片');
    return;
  }
  startClusterExam(cards, `搜索聚类「${query}」`, 'search-cluster');
}

function startTagClusterExam() {
  const tag = searchState.activeTag;
  if (!tag) {
    alert('没有选中的标签');
    return;
  }
  const cards = CARDS.filter(c => c.tags && c.tags.includes(tag));
  startClusterExam(cards, `标签聚类「${tag}」`, 'tag-cluster');
}

function startClusterExam(cards, clusterName, mode) {
  if (cards.length === 0) {
    alert('没有可考试的卡片');

// --- 第 16 页 结束 ---

// 明医成长录 V1.0  —  第 17 页
    return;
  }

  // 从聚类卡片中生成题目，每张卡片至少一道题
  let questions = [];
  cards.forEach(card => {
    const qList = genQuestionsForCard(card);
    if (qList && qList.length > 0) {
      // 从每张卡片中随机抽1-2题
      const count = Math.min(qList.length, Math.random() > 0.5 ? 2 : 1);
      const shuffled = [...qList].sort(() => Math.random() - 0.5).slice(0, count);
      questions = questions.concat(shuffled);
    }
  });

  if (questions.length === 0) {
    alert('这些卡片暂无题目，请先学习');
    return;
  }

  // 打乱顺序，最多15题
  questions = questions.sort(() => Math.random() - 0.5);
  if (questions.length > 15) questions = questions.slice(0, 15);

  initExam(questions, mode || 'cluster');
  setPage('exam');
  renderExam();
  alert(`${clusterName}复习：共 ${questions.length} 题，来自 ${cards.length} 张卡片`);
}

function handleKeydown(e) {
  const state = getState();

  // 统计页按 Esc 返回仪表盘
  if (state.page === 'stats' && e.key === 'Escape') {
    setPage('dashboard');
    renderDashboard();
    return;
  }

  // 学习页按 Esc 返回仪表盘
  if (state.page === 'learn' && e.key === 'Escape') {
    setPage('dashboard');
    renderDashboard();
    return;
  }

  // 考试页快捷键
  if (state.page !== 'exam') return;


// --- 第 17 页 结束 ---

// 明医成长录 V1.0  —  第 18 页
  const answered = state.exam.answers[state.exam.current];
  const isExam = state.exam.mode === 'exam';
  const hasAnswered = answered && answered.selected != null;
  const isLast = state.exam.current >= state.exam.questions.length - 1;

  // 数字键 1-4 选择选项（支持主键盘和数字键盘）
  let idx = -1;
  if (e.code === 'Digit1' || e.code === 'Numpad1') idx = 0;
  else if (e.code === 'Digit2' || e.code === 'Numpad2') idx = 1;
  else if (e.code === 'Digit3' || e.code === 'Numpad3') idx = 2;
  else if (e.code === 'Digit4' || e.code === 'Numpad4') idx = 3;
  if (idx >= 0) {
    e.preventDefault();
    if (!isExam && hasAnswered) return; // 练习模式已答过不能重选
    if (isExam && state.exam.submitted) return; // 考试已提交不能选
    handleSelectOption(idx);
    return;
  }

  // [ 上一题
  if (e.key === '[') {
    e.preventDefault();
    if (state.exam.current > 0) {
      prevQuestion();
      renderExam();
    }
    return;
  }

  // ] 下一题 / 提交 / 完成
  if (e.key === ']') {
    e.preventDefault();
    if (isExam) {
      if (state.exam.submitted) {
        if (isLast) {
          finishExam();
        } else {
          nextQuestion();
          renderExam();
        }
      } else {
        if (isLast) {
          submitExam();
          renderExam();
        } else {
          nextQuestion();
          renderExam();
        }
      }
    } else {

// --- 第 18 页 结束 ---

// 明医成长录 V1.0  —  第 19 页
      if (!hasAnswered) return;
      if (isLast) {
        finishExam();
      } else {
        nextQuestion();
        renderExam();
      }
    }
    return;
  }

  // Enter / 空格 下一题 / 提交 / 完成
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (isExam) {
      if (state.exam.submitted) {
        if (isLast) finishExam();
        else { nextQuestion(); renderExam(); }
      } else {
        if (isLast) { submitExam(); renderExam(); }
        else { nextQuestion(); renderExam(); }
      }
    } else {
      if (!hasAnswered) return;
      if (isLast) finishExam();
      else { nextQuestion(); renderExam(); }
    }
    return;
  }

  // Esc 返回仪表盘
  if (e.key === 'Escape') {
    setPage('dashboard');
    renderDashboard();
    resetExam();
  }
}

// 测试环境暴露（供E2E测试直接导航）
window.__APP_TEST__ = {

// ========== store/AppStore.js ==========
/**
 * AppStore — 全局状态管理（极简订阅/发布模式）
 * 职责：集中管理 UI 状态、考试状态、路由状态，避免全局变量
 */

/** 状态树（与旧版 state 兼容，但结构化） */
let _state = {
  // 页面路由
  page: 'dashboard',

// --- 第 19 页 结束 ---

// 明医成长录 V1.0  —  第 20 页
  activeCardId: null,

  // 考试/练习状态
  exam: {
    mode: null,       // 'practice-card' | 'practice-similar' | 'exam' | 'daily'
    questions: [],
    current: 0,
    answers: [],      // { question, selected, isCorrect }
    submitted: false,
    finished: false
  },

  // 全局统计（会话级）
  stats: {
    total: 0,
    right: 0,
    wrong: 0
  }
};

/** 订阅者集合 */
const _listeners = new Set();

/**
 * 获取当前状态的深拷贝（只读）
 * @returns {Object}
 */
export function getState() {
  return JSON.parse(JSON.stringify(_state));
}

/**
 * 更新状态（支持部分更新）
 * @param {Function|Object} updater - 新状态对象或更新函数 (prev => next)
 */
export function setState(updater) {
  const prev = JSON.parse(JSON.stringify(_state));
  if (typeof updater === 'function') {
    _state = { ..._state, ...updater(_state) };
  } else {
    _state = { ..._state, ...updater };
  }
  _notify(prev, _state);
}

/**
 * 订阅状态变化
 * @param {Function} listener - (newState, oldState) => void
 * @returns {Function} 取消订阅函数
 */

// --- 第 20 页 结束 ---

// 明医成长录 V1.0  —  第 21 页
export function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/**
 * 通知所有订阅者
 */
function _notify(oldState, newState) {
  _listeners.forEach(fn => {
    try {
      fn(newState, oldState);
    } catch (e) {
      console.error('[AppStore] 订阅者报错:', e);
    }
  });
}

// ===== 快捷操作 =====

/** 切换页面 */
export function setPage(name) {
  setState({ page: name });
}

/** 设置当前活动卡片 */
export function setActiveCard(cardId) {
  setState({ activeCardId: cardId });
}

/** 初始化考试状态 */
export function initExam(questions, mode) {
  setState({
    exam: {
      mode,
      questions,
      current: 0,
      answers: questions.map(q => ({ question: q, selected: null, isCorrect: null })),
      submitted: false,
      finished: false
    }
  });
}

/** 记录答题 */
export function recordAnswer(index, selected, isCorrect) {
  const state = getState();
  const answers = [...state.exam.answers];
  answers[index] = { question: state.exam.questions[index], selected, isCorrect };
  setState({ exam: { ...state.exam, answers, finished: true } });

// --- 第 21 页 结束 ---

// 明医成长录 V1.0  —  第 22 页
}

/** 考试模式下记录选择（不判分） */
export function recordSelection(index, selected) {
  const state = getState();
  const answers = [...state.exam.answers];
  answers[index] = { ...answers[index], selected };
  setState({ exam: { ...state.exam, answers } });
}

/** 提交试卷（统一判分） */
export function submitExam() {
  const state = getState();
  const answers = state.exam.answers.map(a => {
    if (!a.selected) return { ...a, isCorrect: false };
    const q = a.question;
    const isCorrect = q.type === '1→0' || q.type === '2→0'
      ? a.selected.id === q.correct
      : (Array.isArray(q.correct) ? q.correct.includes(a.selected.label) : a.selected.label === q.correct);
    return { ...a, isCorrect };
  });
  setState({ exam: { ...state.exam, answers, submitted: true, finished: true } });
}

/** 切换题目 */
export function setExamCurrent(index) {
  setState(s => ({ exam: { ...s.exam, current: index } }));
}

/** 下一题 */
export function nextQuestion() {
  setState(s => {
    const newCurrent = Math.min(s.exam.current + 1, s.exam.questions.length - 1);
    const answered = s.exam.answers[newCurrent];
    const finished = answered ? !!answered.selected : false;
    return { exam: { ...s.exam, current: newCurrent, finished } };
  });
}

/** 上一题 */
export function prevQuestion() {
  setState(s => {
    const newCurrent = Math.max(s.exam.current - 1, 0);
    const answered = s.exam.answers[newCurrent];
    const finished = answered ? !!answered.selected : false;
    return { exam: { ...s.exam, current: newCurrent, finished } };
  });
}

/** 更新统计 */

// --- 第 22 页 结束 ---

// 明医成长录 V1.0  —  第 23 页
export function updateStats(isCorrect) {
  setState(s => ({
    stats: {
      total: s.stats.total + 1,
      right: s.stats.right + (isCorrect ? 1 : 0),
      wrong: s.stats.wrong + (isCorrect ? 0 : 1)
    }
  }));
}

/** 重置考试状态 */
export function resetExam() {
  setState({
    exam: {
      mode: null,
      questions: [],
      current: 0,
      answers: [],
      submitted: false,
      finished: false
    }
  });
}

// ========== services/DataService.js ==========
/**
 * DataService — 数据加载与缓存
 * 职责：从服务器/本地加载卡片数据，提供缓存和失败回退
 */

/** 数据路径（Vite public 目录，以 / 开头表示绝对路径） */
const DATA_PATHS = {
  cards: '/data/formula_cards.json',
  experiences: '/data/experience_cards.json',
  sources: '/data/source_cards.json'
};

/** 内存缓存 */
const cache = new Map();

/**
 * 加载 JSON 数据
 * @param {string} key - 'cards' | 'experiences' | 'sources'
 * @param {boolean} useCache - 是否使用缓存（默认 true）
 * @returns {Promise<Array>} 数据数组
 */
export async function loadData(key, useCache = true) {
  if (useCache && cache.has(key)) {
    return cache.get(key);
  }


// --- 第 23 页 结束 ---

// 明医成长录 V1.0  —  第 24 页
  const path = DATA_PATHS[key];
  if (!path) {
    throw new Error(`Unknown data key: ${key}`);
  }

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(key, data);
    return data;
  } catch (err) {
    console.warn(`[DataService] 加载 ${key} 失败:`, err);
    // 返回空数组作为安全回退，避免页面崩溃
    return [];
  }
}

/**
 * 预加载全部数据
 * @returns {Promise<{ cards, experiences, sources }>}
 */
export async function preloadAll() {
  const [cards, experiences, sources] = await Promise.all([
    loadData('cards'),
    loadData('experiences'),
    loadData('sources')
  ]);
  return { cards, experiences, sources };
}

/**
 * 清除缓存（用于数据刷新）
 */
export function clearCache() {
  cache.clear();
}

/**
 * 获取缓存中的数据（同步）
 * @param {string} key
 * @returns {Array|undefined}
 */
export function getCached(key) {
  return cache.get(key);
}

// ========== components/CardList.js ==========
/**
 * CardList 组件 — 卡片列表（纯渲染，props 驱动）
 * 职责：渲染仪表盘中的卡片列表，显示名称、描述、标签、掌握度进度点

// --- 第 24 页 结束 ---

// 明医成长录 V1.0  —  第 25 页
 * v1.1: 新增标签点击聚类、搜索高亮支持
 */

import { createElement, delegate } from '@utils/dom.js';

/**
 * 渲染卡片列表
 * @param {HTMLElement} container — 容器元素
 * @param {Array} cards — 卡片数组
 * @param {Object} options — 选项
 * @param {Function} options.onCardClick — 点击卡片回调 (cardId) => void
 * @param {Function} options.onTagClick — 点击标签回调 (tagName) => void
 * @param {string} options.highlightQuery — 高亮关键词（搜索模式）
 * @param {string} options.activeTag — 当前激活的标签（聚类模式）
 */
export function renderCardList(container, cards, options = {}) {
  const { onCardClick, onTagClick, highlightQuery, activeTag } = options;
  container.innerHTML = '';

  const list = createElement('div', { className: 'card-list' });

  cards.forEach(card => {
    const m = card.mastery || {};
    const done = Object.values(m).filter(x => x && x.status === '已掌握').length;
    const total = Object.keys(m).length;

    const item = createElement('div', {
      className: 'card-list-item',
      tabindex: '0',
      dataset: { cardId: card.id }
    });

    // 主内容区
    const main = createElement('div', { className: 'card-list-main' });
    
    // 名称（支持搜索高亮）
    const displayName = highlightQuery 
      ? highlightText(card.name, highlightQuery)
      : card.name;
    const name = createElement('div', { className: 'card-list-name' });
    name.innerHTML = displayName;
    
    const desc = createElement('div', { className: 'card-list-desc' }, card.desc);
    const tags = createElement('div', { className: 'card-list-tags' });

    (card.tags || []).slice(0, 3).forEach(tag => {
      const tagEl = createElement('span', { 
        className: 'tag' + (tag === activeTag ? ' active' : ''),
        dataset: { tag: tag }
      }, tag);

// --- 第 25 页 结束 ---

// 明医成长录 V1.0  —  第 26 页
      tags.appendChild(tagEl);
    });

    main.appendChild(name);
    main.appendChild(desc);
    main.appendChild(tags);
    item.appendChild(main);

    // 进度点
    const dots = createElement('div', { className: 'progress-dots' });
    for (let i = 0; i < total; i++) {
      const dot = createElement('div', {
        className: 'progress-dot' + (i < done ? ' done' : '')
      });
      dots.appendChild(dot);
    }
    item.appendChild(dots);

    list.appendChild(item);
  });

  container.appendChild(list);

  // 事件委托：点击卡片项
  if (onCardClick) {
    delegate(list, 'click', '.card-list-item', (e, target) => {
      // 如果点击的是标签，不触发卡片点击
      if (e.target.closest('.tag')) return;
      const cardId = target.dataset.cardId;
      if (cardId) onCardClick(cardId);
    });

    // 键盘导航：Enter 打开卡片
    delegate(list, 'keydown', '.card-list-item', (e, target) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cardId = target.dataset.cardId;
        if (cardId) onCardClick(cardId);
      }
    });
  }

  // 事件委托：点击标签
  if (onTagClick) {
    delegate(list, 'click', '.tag', (e, target) => {
      e.stopPropagation();
      const tag = target.dataset.tag;
      if (tag) onTagClick(tag);
    });
  }

// --- 第 26 页 结束 ---

// 明医成长录 V1.0  —  第 27 页
}

/**
 * 高亮文本中的关键词
 * @param {string} text — 原文本
 * @param {string} query — 关键词
 * @returns {string} HTML字符串（含高亮标记）
 */
function highlightText(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// ========== components/LearnView.js ==========
/**
 * LearnView 组件 — 学习视图
 * 职责：显示单张卡片的完整内容（原文、症状、药物、病机、禁忌、煎服法、经验）
 */

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

// --- 第 27 页 结束 ---

// 明医成长录 V1.0  —  第 28 页
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

// --- 第 28 页 结束 ---

// 明医成长录 V1.0  —  第 29 页
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

// --- 第 29 页 结束 ---

// 明医成长录 V1.0  —  第 30 页
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

// --- 第 30 页 结束 ---

