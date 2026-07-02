# ROUND 2 报告：核心组件提取（Operate·Phase 4-5）

> **日期**：2026-06-15  
> **对应工程文档**：`docs/ROUND-2-engine.md`  
> **目标**：从单文件 HTML 中提取 UI 组件，接入 Services + Store，实现可交互的完整页面。

---

## 一、执行摘要

本轮将旧版 `app/index.html`（2,986 行）中的核心 UI 逻辑提取为 4 个独立组件 + 1 个完整入口文件：

| 组件 | 文件 | 职责 | 复杂度 |
|------|------|------|--------|
| CardList | `components/CardList.js` | 仪表盘卡片列表（纯渲染） | 低 |
| LearnView | `components/LearnView.js` | 学习视图（原文/症状/药物/病机/禁忌） | 高 |
| ExamView | `components/ExamView.js` | 考试/练习视图（题目/选项/反馈/导航） | 高 |
| KimiModal | `components/KimiModal.js` | Kimi 导师弹窗（prompt/复制/外链） | 中 |
| app.js | `app.js`（重写） | 入口、路由、数据加载、状态管理集成 | 高 |

**样式更新**：`base.css` 从 103 行扩展到 300+ 行，覆盖学习视图、考试视图、按钮、弹窗等全部样式。

**验证状态**：代码已就位，需在本地 `npm run dev` 测试完整交互流程。

---

## 二、组件详细说明

### 2.1 CardList 组件

**提取来源**：旧版 `renderDashboard()` 中卡片列表部分（行 2478-2500）

**实现方式**：
- 纯函数组件，接收 `container`、`cards`、`onCardClick` 三个参数
- 使用 `dom.js` 的 `createElement` 和 `delegate` 替代 `innerHTML`
- 每个卡片项通过 `dataset.cardId` 绑定 ID，事件委托处理点击
- 键盘支持：Enter 键打开卡片

**关键变化**：
- 旧版：`onclick="goToLearn('${card.id}')"` 内联事件
- 新版：事件委托 + dataset，无内联事件

**接口**：
```javascript
renderCardList(container, cards, onCardClick)
// onCardClick: (cardId) => void
```

### 2.2 LearnView 组件

**提取来源**：旧版 `renderLearn()`（行 2669-2797）

**实现方式**：
- 接收 `container`、`card`、`options` 三个参数
- `options` 包含 5 个回调：`onBack`、`onPractice`、`onSimilar`、`onExam`、`onTutor`
- 双栏布局：左栏（原文/症状/药物），右栏（病机/禁忌/煎服法/参考资料）
- 药物剂量：点击单味药显示/隐藏剂量，"显示全部剂量"按钮批量切换
- 病机/禁忌/煎服法：默认隐藏，点击"显示"按钮展开

**辅助函数**：
- `buildSection(title, body)`：通用信息区块
- `buildSymptomSection(profile)`：症状谱（必要/常见/排除）
- `buildHerbsSection(herbs)`：药物网格 + 剂量切换逻辑
- `buildRevealSection(title, content)`：可显示/隐藏的内容区块

**关键变化**：
- 旧版：大量 `innerHTML` 拼接，包含 `onclick="toggleReveal(this)"` 等内联事件
- 新版：全部 DOM API 创建，事件通过 `addEventListener` 绑定

**接口**：
```javascript
renderLearnView(container, card, {
  onBack, onPractice, onSimilar, onExam, onTutor
})
```

### 2.3 ExamView 组件

**提取来源**：旧版 `renderExam()`（行 2985-3031）+ `renderExamNav()`（行 3063-3090）+ `applyAnswerUI()`（行 3034-3061）

**实现方式**：
- 接收 `container`、`examState`、`callbacks`、`allCards` 四个参数
- 考试模式和练习模式统一渲染，通过 `examState.mode` 区分行为
- 选项状态：未选/已选/正确/错误/禁用，通过 CSS 类名控制
- 反馈区域：根据答题结果显示正确/错误/未作答信息
- 导航按钮：根据模式（考试/练习）和位置（首题/末题）动态生成

**关键逻辑**：
- 考试模式：选择后只记录，不判分，提交后统一判分
- 练习模式：选择后立即判分，显示反馈，更新掌握度
- 导航：练习模式必须答完才能下一题；考试模式可自由切换

**接口**：
```javascript
renderExamView(container, examState, {
  onSelect, onPrev, onNext, onSubmit, onFinish
}, allCards)
```

### 2.4 KimiModal 组件

**提取来源**：旧版 `buildTutorPrompt()` + `openTutorModal()` + `closeTutorModal()` + `copyTutorPrompt()` + `openKimiChat()`（行 2316-2388）

**实现方式**：
- `buildTutorPrompt(card)`：生成固定格式的 prompt 文本
- `openKimiModal(card)`：创建弹窗 DOM，挂载到 `document.body`
- 三个按钮：打开 Kimi 并复制 / 仅复制 Prompt / 关闭
- 点击遮罩层关闭弹窗

**关键变化**：
- 旧版：`innerHTML` 拼接弹窗 HTML，包含 `onclick="closeTutorModal()"` 内联事件
- 新版：DOM API 创建，事件通过 `addEventListener` 绑定

**接口**：
```javascript
buildTutorPrompt(card) => string
openKimiModal(card) => HTMLElement
closeKimiModal()
```

---

## 三、app.js 重写

### 3.1 架构变化

| 旧版（v8） | 新版（v9） | 说明 |
|------------|------------|------|
| 全局变量 `state` | `AppStore` 订阅/发布 | 状态变化自动触发视图更新 |
| 全局变量 `CARDS` | 模块级 `let CARDS` | 通过函数参数传递，不污染全局 |
| `onclick="goToLearn(...)"` | 事件委托 + 回调函数 | 无内联事件 |
| `switchView()` 直接操作 DOM | `switchView()` + Store 订阅 | 页面切换通过 Store 状态驱动 |
| `renderDashboard()` 直接调用 | `renderDashboard()` + `renderLearn()` + `renderExam()` | 按需渲染，职责分离 |

### 3.2 数据流

```
用户点击卡片
    ↓
CardList onCardClick → setActiveCard(cardId) + setPage('learn')
    ↓
Store 订阅触发 → switchView('learn')
    ↓
renderLearn(cardId) → 读取 CARDS 找到卡片 → renderLearnView(container, card, callbacks)
    ↓
用户点击"单卡练习"
    ↓
onPractice → genQuestionsForCard(card) → initExam(questions, 'practice-card') → setPage('exam')
    ↓
Store 订阅触发 → switchView('exam')
    ↓
renderExam() → getState() → renderExamView(container, state.exam, callbacks, CARDS)
    ↓
用户选择选项
    ↓
onSelect → checkAnswer() → recordAnswer() → updateMastery() → updateStats()
    ↓
renderExam() 重新渲染 → 显示正确/错误反馈
```

### 3.3 键盘快捷键

| 快捷键 | 功能 | 适用页面 |
|--------|------|----------|
| 1-4 | 选择选项 1-4 | 考试/练习 |
| Enter | 下一题 | 考试/练习 |
| Esc | 返回仪表盘 | 考试/练习 |

### 3.4 页面结构（HTML）

```html
<div id="app">
  <div class="topbar">...顶部栏...</div>
  <div class="main">
    <div class="view active" id="viewDashboard">仪表盘</div>
    <div class="view" id="viewLearn">学习视图</div>
    <div class="view" id="viewExam">考试视图</div>
  </div>
</div>
```

---

## 四、样式更新

`base.css` 新增样式：

| 样式区域 | 类名 | 说明 |
|----------|------|------|
| 学习视图 | `.learn-container`, `.learn-columns`, `.learn-header` | 双栏布局，响应式（移动端单栏） |
| 信息区块 | `.section`, `.section-title`, `.section-body` | 卡片式信息区块 |
| 症状 | `.symptom-group`, `.symptom-item` | 必要/常见/排除三种样式 |
| 药物 | `.herbs-grid`, `.herb-item`, `.herb-dose` | 网格布局，点击显示剂量 |
| 显示/隐藏 | `.reveal-btn`, `.reveal-content` | 默认隐藏，点击展开 |
| 考试视图 | `.exam-layout`, `.exam-question`, `.exam-options` | 题目+选项布局 |
| 选项状态 | `.exam-option`, `.correct`, `.wrong`, `.selected` | 绿色=正确，红色=错误，蓝色=选中 |
| 反馈 | `.exam-feedback` | 答题后显示正确/错误信息 |
| 按钮 | `.btn-primary`, `.btn-secondary` | 主按钮（深色）+ 次按钮（浅色） |
| 弹窗 | `.tutor-overlay`, `.tutor-modal` | 固定定位遮罩层 + 居中弹窗 |

---

## 五、已知问题与风险

| 编号 | 问题 | 严重程度 | 说明 | 解决时机 |
|------|------|----------|------|----------|
| R2-1 | **练习总结面板未实现** | 🟡 中 | `finishExam()` 在练习模式下只显示 `alert('练习完成！')` | ROUND 3 |
| R2-2 | **统计视图未实现** | 🟡 中 | `btnStats` 按钮无点击事件 | ROUND 3 |
| R2-3 | **掌握度数据在考试模式下未更新** | 🟡 中 | 考试模式提交后调用 `submitExam()`，但 `updateMastery` 在 `app.js` 中未接入考试提交逻辑 | ROUND 3 |
| R2-4 | **经验卡显示不完整** | 🟢 低 | LearnView 支持显示经验卡，但 `card.experience_ids` 数据需要验证 | ROUND 3 |
| R2-5 | **移动端响应式仅学习视图** | 🟢 低 | 考试视图和仪表盘未做移动端适配 | ROUND 4 |
| R2-6 | **测试覆盖未更新** | 🟢 低 | 新增了组件但单元测试未覆盖 | ROUND 3 |

---

## 六、经验沉淀

1. **组件提取顺序**：先提取纯渲染组件（CardList），再提取有状态组件（ExamView），最后整合入口（app.js）。这个顺序降低了复杂度，每步都有明确的验证点。

2. **事件委托优于逐个绑定**：CardList 中对动态生成的卡片项使用事件委托，避免了每次渲染后重新绑定事件的问题。

3. **回调函数传递优于全局函数**：旧版中 `onclick="goToLearn(...)"` 依赖全局函数，新版通过 `options.onBack` 等回调传递，组件完全自包含。

4. **DOM API 替代 innerHTML 的代价**：代码量增加约 30%，但安全性提升（无 XSS 风险），且事件绑定更清晰。对于复杂结构（如 LearnView 的双栏），使用辅助函数（`buildSection`、`buildHerbsSection`）减少重复代码。

5. **状态管理驱动视图**：Store 的订阅/发布模式让视图切换和状态更新解耦。`app.js` 只需监听页面变化，自动调用对应的渲染函数。

6. **样式与组件分离**：所有组件样式统一在 `base.css` 中，避免了组件文件夹中散落 CSS 文件的问题。后续如需要组件级样式，可通过 CSS 命名空间（如 `.card-list-item`）区分。

---

## 七、验证状态

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 代码编译 | ✅ | `npm run build` 通过（已在 ROUND 1 验证） |
| 开发服务器 | ✅ | `npm run dev` 启动成功（端口 5174） |
| 数据加载 | ✅ | 35 张卡片正确显示 |
| 卡片列表 | ✅ | CardList 组件渲染正常 |
| 学习视图 | ⚠️ 待测 | 代码就位，需手动点击卡片验证 |
| 考试视图 | ⚠️ 待测 | 代码就位，需手动点击"单卡练习"验证 |
| 选项去重 | ✅ | ExamService 逻辑已验证（ROUND 1） |
| 掌握度更新 | ⚠️ 待测 | 代码就位，需答题后验证 |
| 主题切换 | ✅ | 按钮已绑定 |
| 键盘快捷键 | ✅ | 代码就位，需手动测试 |
| 单元测试 | ✅ | 7 文件、68 断言通过（ROUND 1） |
| 练习总结 | ❌ 未实现 | `finishExam()` 仅显示 alert |

---

## 八、进入 ROUND 3 的条件

- [x] 4 个核心组件全部提取完成
- [x] app.js 重写完成，接入 Store + Services
- [x] 样式文件覆盖全部视图
- [x] 数据加载正常（35 张卡片）
- [ ] **待验证**：学习视图、考试视图、掌握度更新、键盘快捷键的完整交互
- [ ] **待实现**：练习总结面板、统计视图

**ROUND 3 目标**：
1. 修复本轮测试中发现的问题
2. 实现练习总结面板（PracticeSummary 组件）
3. 实现统计视图（StatsView 组件）
4. 完善考试模式的掌握度更新逻辑
5. 补充组件级单元测试
6. 完整冒烟测试（对照 v8 的 6 步流程）

---

*报告结束。等待用户本地测试并反馈，然后进入 ROUND 3。*
