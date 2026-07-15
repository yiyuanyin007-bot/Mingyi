/**
 * app.js — 应用入口（ROUND 2 完整版）
 * 职责：初始化、路由、数据加载、组件挂载
 */

import { preloadAll } from '@services/DataService.js';
import { loadState, updateMastery, updateStats, updateTodayStats, getTodayStats, saveStudyNote } from '@services/StorageService.js';
import { recordAnswerEvent, getTopErrorCards, getTopPracticeCards, getWeakVectors, generateReviewSuggestions, loadStats } from '@services/StatsService.js';
import { openPracticeSummary, closePracticeSummary } from '@components/PracticeSummary.js';
import { renderWrongBookView } from '@components/WrongBookView.js';
import { renderSixJingRadar, renderLearningCurve, renderMasteryDistribution } from '@components/StatsCharts.js';

import { getState, setState, subscribe, setPage, setActiveCard, initExam, recordAnswer, recordSelection, submitExam, setExamCurrent, nextQuestion, prevQuestion, resetExam } from '@store/AppStore.js';
import { renderCardList } from '@components/CardList.js';
import { renderLearnView } from '@components/LearnView.js';
import { openSourcePanel } from '@components/SourcePanel.js';
import { renderExamView, renderExamResult } from '@components/ExamView.js';
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
        },
        onRetryWrong: (cardId, vector) => {
          if (!cardId || !vector) return;
          const card = CARDS.find(c => c.id === cardId);
          if (!card) return;
          const q = generateQuestionForVector(card, vector);
          if (!q) { alert('暂无可练习题目。'); return; }
          q.options = generateOptions(q.cardId, q.type, CARDS);
          initExam([q], 'practice-card');
          setPage('exam');
          renderExam();
        },
        onStartWrongBookReview: (questions) => {
          console.log('[onStartWrongBookReview] 收到题目数:', questions?.length);
          if (!questions || questions.length === 0) { alert('暂无可复习题目'); return; }
          initExam(questions, 'wrongbook-review');
          console.log('[onStartWrongBookReview] initExam 完成，切换页面');
          setPage('exam');
          renderExam();
          console.log('[onStartWrongBookReview] renderExam 完成');
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
    }

    // 5.5 注册状态变化订阅（视图切换）
    subscribe((newState, oldState) => {
      if (newState.page !== oldState.page) {
        switchView(newState.page);
      }
    });

    // 6. 键盘快捷键（提前绑定 capture 阶段，确保不被任何元素拦截）
    window.addEventListener('keydown', handleKeydown, true);

    // 7. 渲染仪表盘
    renderDashboard();

    // 9. 暴露测试接口（供E2E测试直接导航）
    window.__APP_TEST__ = {
      CARDS,
      setActiveCard,
      setPage,
      renderLearn
    };

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

  // 获取当前卡片关联的临床医案
  const cardExperiences = EXPERIENCES.filter(e => 
    card.experience_ids?.includes(e.id) ||
    e.cardId === cardId ||
    e.formula_name === card.formula_name
  );

  renderLearnView(container, card, {
    onBack: () => {
      if (fromPracticeSummaryFlag) {
        fromPracticeSummaryFlag = false;
        setPage('exam');
        renderExam();
      } else {
        setPage('dashboard');
        renderDashboard();
      }
    },
    onPractice: (id) => startPractice(id),
    onPracticeVector: (id, vector) => startPracticeVector(id, vector),
    onSimilar: (id) => startPracticeSimilar(id),
    onExam: () => startExamMode(),
    onTutor: () => openKimiModal(card),
    onSource: (id) => {
      const c = CARDS.find(x => x.id === id);
      if (!c) return;
      openSourcePanel(c, SOURCES, document.body);
    },
    experiences: cardExperiences
  });
}

// ===== 考试/练习视图 =====

function renderExam() {
  const state = getState();
  const container = document.getElementById('examContainer');
  console.log('[renderExam] mode:', state.exam?.mode, 'current:', state.exam?.current, 'questions.length:', state.exam?.questions?.length, 'container:', !!container);

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
  console.log('[handleSelectOption] idx:', idx, 'mode:', state.exam.mode, 'current:', state.exam.current, 'finished:', state.exam.finished, 'submitted:', state.exam.submitted, 'questions.length:', state.exam.questions.length);
  const isExam = state.exam.mode === 'exam';
  // 练习模式允许换选（覆盖之前的答案），所以不拦截
  // 考试模式已提交后不能选
  if (isExam && state.exam.submitted) {
    console.log('[handleSelectOption] 被拦截: isExam && submitted');
    return;
  }

  const q = state.exam.questions[state.exam.current];
  if (!q || !q.options || idx < 0 || idx >= q.options.length) {
    console.log('[handleSelectOption] 被拦截: q无效或idx越界', { q: !!q, optionsLen: q?.options?.length, idx });
    return;
  }
  
  const selected = q.options[idx];
  const isCorrect = checkAnswer(q, selected);
  console.log('[handleSelectOption] selected:', selected?.label, 'isCorrect:', isCorrect, 'cardId:', q.cardId, 'type:', q.type);

  if (isExam) {
    recordSelection(state.exam.current, selected);
  } else {
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
    console.log('[finishExam] 考试模式，answers.length:', state.exam.answers.length);
    state.exam.answers.forEach(a => {
      recordAnswerEvent(a.question.cardId, a.question.cardName || a.question.cardId, a.question.type, getVectorLabel(a.question.type), a.isCorrect, 'exam', a.selected?.label);
    });
    // 显示考试结果页面
    console.log('[finishExam] 渲染考试结果');
    const container = document.getElementById('examContainer');
    renderExamResult(container, state.exam, {
      onRetrieval: () => {
        startRetrievalRound();
      },
      onReturn: () => {
        setPage('dashboard');
        renderDashboard();
        resetExam();
      },
      onDiagnosis: (answer, diagnosisKey) => {
        const card = CARDS.find(c => c.id === answer.question.cardId);
        const cardName = card ? card.name : answer.question.cardId;
        saveStudyNote({
          cardId: answer.question.cardId,
          cardName: cardName,
          vector: answer.question.type,
          vectorLabel: getVectorLabel(answer.question.type),
          diagnosis: diagnosisKey,
          question: answer.question.text,
          selected: answer.selected?.label || '未作答',
          correct: Array.isArray(answer.question.correct)
            ? answer.question.correct.join('、')
            : answer.question.correct
        });
        showToast('已保存到错题本');
      },
      onAskKimi: (answer) => {
        const card = CARDS.find(c => c.id === answer.question.cardId);
        const cardName = card ? card.name : answer.question.cardId;
        const prompt = `我是中医学习者，我在《伤寒论》方剂模拟考试中遇到了一道错题，请帮我分析：

方剂：${cardName}
向量：${getVectorLabel(answer.question.type)}
题目：${answer.question.text}
我的选择：${answer.selected?.label || '未作答'}
正确答案：${Array.isArray(answer.question.correct) ? answer.question.correct.join('、') : answer.question.correct}

请分析：
1. 我为什么错（认知层面的原因）
2. 这个方剂和正确答案的关键区别是什么
3. 我应该如何强化记忆（具体方法）
4. 推荐我下一步练习哪个方向`;
        openKimiModal({ prompt, title: '错题分析' });
      },
      onBatchTag: () => {
        state.exam.answers.filter(a => !a.isCorrect).forEach(a => {
          const card = CARDS.find(c => c.id === a.question.cardId);
          const cardName = card ? card.name : a.question.cardId;
          saveStudyNote({
            cardId: a.question.cardId,
            cardName: cardName,
            vector: a.question.type,
            vectorLabel: getVectorLabel(a.question.type),
            diagnosis: 'confusion',
            question: a.question.text,
            selected: a.selected?.label || '未作答',
            correct: Array.isArray(a.question.correct)
              ? a.question.correct.join('、')
              : a.question.correct
          });
        });
        showToast('已批量标记到错题本');
      }
    }, CARDS);
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

function startPracticeVector(cardId, vector) {
  const card = CARDS.find(c => c.id === cardId);
  if (!card) return;
  const q = generateQuestionForVector(card, vector);
  if (!q) { alert('暂无可练习题目。'); return; }
  q.options = generateOptions(q.cardId, q.type, CARDS);
  initExam([q], 'practice-card');
  setPage('exam');
  renderExam();
}

function startPracticeSimilar(cardId) {
  // 简化版：从当前卡片及其相近卡片中抽题
  const target = CARDS.find(c => c.id === cardId);
  if (!target) return;
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
    return;
  }

  // 从聚类卡片中生成题目，每张卡片至少2题，最多3题
  let questions = [];
  cards.forEach(card => {
    const qList = genQuestionsForCard(card);
    if (qList && qList.length > 0) {
      // 每张卡片至少抽2题（如果可用），最多3题
      const minPerCard = 2;
      const maxPerCard = 3;
      let count = Math.min(qList.length, maxPerCard);
      if (qList.length >= minPerCard && count < minPerCard) {
        count = minPerCard;
      }
      const shuffled = [...qList].sort(() => Math.random() - 0.5).slice(0, count);
      shuffled.forEach(q => {
        if (q) {
          q.options = generateOptions(q.cardId, q.type, CARDS);
        }
      });
      questions = questions.concat(shuffled.filter(Boolean));
    }
  });

  // 补充策略：如果总题量不足，为每张卡片尝试生成不同向量的题目
  const minTotal = Math.max(5, cards.length * 2);
  if (questions.length < minTotal) {
    const existingKeys = new Set(questions.map(q => `${q.cardId}-${q.type}`));
    const supplementPool = [];
    cards.forEach(card => {
      const vectors = ['0→1', '1→0', '0→2', '2→0', '0→contra', '0→usage'];
      vectors.forEach(v => {
        const key = `${card.id}-${v}`;
        if (existingKeys.has(key)) return;
        const q = generateQuestionForVector(card, v);
        if (q) {
          q.options = generateOptions(q.cardId, q.type, CARDS);
          supplementPool.push(q);
          existingKeys.add(key);
        }
      });
    });
    // 打乱补充池，取需要的数量
    supplementPool.sort(() => Math.random() - 0.5);
    const needed = minTotal - questions.length;
    questions = questions.concat(supplementPool.slice(0, needed));
  }

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
  console.log('[KD] RAW keydown:', e.key, 'code:', e.code, 'target:', e.target?.tagName, 'active:', document.activeElement?.tagName, 'activeId:', document.activeElement?.id);
  const state = getState();
  console.log('[handleKeydown] e.key:', e.key, 'e.code:', e.code, 'page:', state.page, 'mode:', state.exam?.mode, 'current:', state.exam?.current, 'questions.length:', state.exam?.questions?.length, 'submitted:', state.exam?.submitted, 'finished:', state.exam?.finished);

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

  // 防御性检查：确保考试状态有效
  if (!state.exam || !state.exam.questions || state.exam.questions.length === 0) {
    console.error('[handleKeydown] 考试状态异常，questions为空或不存在');
    return;
  }

  const answered = state.exam.answers[state.exam.current];
  const isExam = state.exam.mode === 'exam';
  const hasAnswered = answered && answered.selected != null;
  const isLast = state.exam.current >= state.exam.questions.length - 1;

  console.log('[handleKeydown] isExam:', isExam, 'hasAnswered:', hasAnswered, 'isLast:', isLast, 'answered:', answered ? '存在' : 'null');

  // 数字键 1-4 选择选项（支持主键盘和数字键盘）
  let idx = -1;
  if (e.code === 'Digit1' || e.code === 'Numpad1') idx = 0;
  else if (e.code === 'Digit2' || e.code === 'Numpad2') idx = 1;
  else if (e.code === 'Digit3' || e.code === 'Numpad3') idx = 2;
  else if (e.code === 'Digit4' || e.code === 'Numpad4') idx = 3;
  if (idx >= 0) {
    console.log('[handleKeydown] 数字键 idx:', idx, 'isExam:', isExam, 'hasAnswered:', hasAnswered, 'submitted:', state.exam.submitted);
    e.preventDefault();
    // 练习模式：允许多次按数字键换选（覆盖之前的答案）
    // 考试模式已提交后不能选
    if (isExam && state.exam.submitted) {
      console.log('[handleKeydown] 数字键被拦截: 考试已提交');
      return; // 考试已提交不能选
    }
    console.log('[handleKeydown] 调用 handleSelectOption(', idx, ')');
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
    // 移除焦点，防止按钮 click 事件重复触发
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    console.log('[handleKeydown] ]键 isExam:', isExam, 'submitted:', state.exam.submitted, 'isLast:', isLast, 'hasAnswered:', hasAnswered);
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
      // 练习模式：重新获取最新状态判断
      const freshState = getState();
      const freshAnswered = freshState.exam.answers[freshState.exam.current];
      const freshHasAnswered = freshAnswered && freshAnswered.selected != null;
      const freshIsLast = freshState.exam.current >= freshState.exam.questions.length - 1;
      console.log('[handleKeydown] ]键练习模式 freshHasAnswered:', freshHasAnswered, 'freshIsLast:', freshIsLast, 'current:', freshState.exam.current);
      if (!freshHasAnswered) {
        console.log('[handleKeydown] ]键被拦截: 练习模式未答');
        return;
      }
      if (freshIsLast) {
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
    // 移除焦点，防止按钮 click 事件重复触发
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    console.log('[handleKeydown] Enter/空格 isExam:', isExam, 'submitted:', state.exam.submitted, 'isLast:', isLast, 'hasAnswered:', hasAnswered);
    if (isExam) {
      if (state.exam.submitted) {
        if (isLast) finishExam();
        else { nextQuestion(); renderExam(); }
      } else {
        if (isLast) { submitExam(); renderExam(); }
        else { nextQuestion(); renderExam(); }
      }
    } else {
      // 练习模式：重新获取最新状态判断
      const freshState = getState();
      const freshAnswered = freshState.exam.answers[freshState.exam.current];
      const freshHasAnswered = freshAnswered && freshAnswered.selected != null;
      const freshIsLast = freshState.exam.current >= freshState.exam.questions.length - 1;
      console.log('[handleKeydown] Enter/空格练习模式 freshHasAnswered:', freshHasAnswered, 'freshIsLast:', freshIsLast, 'current:', freshState.exam.current);
      if (!freshHasAnswered) {
        console.log('[handleKeydown] Enter/空格被拦截: 练习模式未答');
        return;
      }
      if (freshIsLast) finishExam();
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
// ═══════════════════════════════════════════
// Rollup tree-shaking 防护标记
// 以下副作用标记确保 Rollup 不会误删文件和核心函数
// ═══════════════════════════════════════════

// 副作用标记 #1: 强导出标记，阻止 Rollup 将本文件视为"纯副作用已完成"
export const __ENTRY_GUARD__ = (typeof document !== 'undefined' ? 1 : 0);

// 启动
init();

// 副作用标记 #2: 确保 init() 调用后的语句也被保留
void document?.documentElement?.dataset?._v ?? '';

/**
 * 显示 Toast 提示
 */
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;z-index:10000;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.15);';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
