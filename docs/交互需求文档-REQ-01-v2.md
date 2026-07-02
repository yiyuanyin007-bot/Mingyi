# 交互需求文档 v2 —— 由方剂卡片对话提交给操作系统对话执行

> 文档编号：REQ-2024-INTERACTION-v2  
> 编写者：方剂卡片对话（数据层 + 参考资料渲染）  
> 执行者：操作系统对话（交互层 + 前端架构）  
> 用户转交方式：请将此文件转发给"操作系统"对话，要求它读取后执行  
> 更新说明：本次版本新增 REQ-05（按钮顶部化）、附录A（参考资料完整规范）、附录B（v9架构对齐指南）

---

## 1. 当前状态总览

### 1.1 两个版本并存说明

| 版本 | 入口 | 技术栈 | 当前状态 | 决策 |
|---|---|---|---|---|
| **v1（当前主入口）** | `app/index.html` | 单文件原生 HTML/CSS/JS | 用户双击打开，正在使用 | **继续维护，下周二前必须可用** |
| **v9（重构中）** | `app/v9/index.html` | 模块化组件 + Vite + 构建 | 操作系统对话正在开发 | 长期方向，暂不阻塞 v1 |

**重要红线**：用户下周二开始临床开方。v1 是真相源，v9 是未来方向。任何改动必须确保 v1 可用，v9 可以渐进迁移。

### 1.2 已完成的交互（已在 v1 index.html 中）

| 功能 | 状态 | 验证位置 | 负责方 |
|---|---|---|---|
| 药名点击 → 类方弹窗（`onHerbClick`） | ✅ | `index.html:3670` | 数据层 |
| 弹窗内"去学习"跳转（`handleModalGoToLearn`） | ✅ | `index.html:3764` | 数据层 |
| 方剂名点击 → 方剂弹窗（`onFormulaClick`） | ✅ | `index.html:3769` | 数据层 |
| 痕迹记录（`recordTrace`） | ✅ | `index.html:3513` | 数据层 |
| 今日学习报告弹窗（`showDailyReport`） | ✅ | `index.html:3794` | 数据层 |
| 导出学习数据（`exportTraces`） | ✅ | `index.html:3642` | 数据层 |
| 导出按钮在报告弹窗中 | ✅ | `index.html:3801` | 数据层 |
| 参考资料渲染（`renderReferences`） | ✅ | `index.html:2590` | 数据层 |
| 药名别名加载（`herb-aliases.js`） | ✅ | `app/herb-aliases.js` | 数据层 |
| 药名/剂量/合方标签视觉规范 V1 | ✅ | CSS 类 `rx-*` | 数据层 |

### 1.3 待完成的交互（需操作系统对话执行）

| 需求 ID | 描述 | 优先级 | 涉及文件 |
|---|---|---|---|
| REQ-01 | 在今日学习报告弹窗添加"导入学习数据"按钮 | P0 | `index.html` |
| REQ-02 | 在今日学习报告弹窗添加"重置学习进度"按钮（确认弹窗） | P0 | `index.html` |
| REQ-03 | 弹窗内点击"去学习"时记录 `user_action` 痕迹 | P1 | `index.html` |
| REQ-04 | 今日学习按钮在 topbar 的显隐逻辑（学习页隐藏） | P2 | `index.html` |
| REQ-05 | 学习页考试/练习按钮从底部移到顶部 | **P0** | `index.html` |

---

## 2. 需求详细说明

### REQ-01：添加"导入学习数据"按钮

**当前状态**：
`showDailyReport()` 弹窗只有"导出学习数据"和"关闭"两个按钮。

**期望行为**：
在弹窗中添加"导入学习数据"按钮。点击后弹出文件选择（`.json`），调用已存在的 `importTraces(jsonText)`，导入成功后提示并刷新。

**参考代码**：

```javascript
// 在 showDailyReport() 的 html 字符串中，导出按钮旁边添加：
html += `<button class="modal-btn" onclick="importTraceFile()">导入学习数据</button>`;

// 在全局作用域添加函数（exportTraces/importTraces 附近）：
function importTraceFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      importTraces(text);  // 已存在，index.html:3653
      showModal(`<div class="modal-title">✅ 导入成功</div><div class="modal-body">学习数据已恢复。页面即将刷新。</div><div class="modal-actions"><button class="modal-btn" onclick="closeModal();location.reload();">刷新页面</button></div>`);
    } catch (err) {
      showModal(`<div class="modal-title">❌ 导入失败</div><div class="modal-body">${err.message}</div><div class="modal-actions"><button class="modal-btn" onclick="closeModal()">关闭</button></div>`);
    }
  };
  input.click();
}
```

**验收标准**：
- [ ] 弹窗中有"导入学习数据"按钮
- [ ] 点击弹出文件选择框（只接受 `.json`）
- [ ] 选择之前导出的 `sh_traces_YYYY-MM-DD.json` 后数据恢复
- [ ] 导入后刷新页面，学习进度不丢失

---

### REQ-02：添加"重置学习进度"按钮

**当前状态**：
没有重置按钮。用户需通过浏览器控制台操作，不符合"零门槛"要求。

**期望行为**：
弹窗中添加"重置学习进度"按钮（红色）。点击后二次确认，确认后清空 `localStorage` 并刷新页面。

**参考代码**：

```javascript
// 在 showDailyReport() 的 html 中，关闭按钮旁边添加：
html += `<button class="modal-btn" style="color:var(--error);" onclick="resetLearningProgress()">重置学习进度</button>`;

// 全局函数：
function resetLearningProgress() {
  showModal(`<div class="modal-title">⚠️ 确认重置</div><div class="modal-body">确定要清空所有学习痕迹和掌握度数据吗？<br><strong>此操作不可恢复。</strong></div><div class="modal-actions"><button class="modal-btn" style="color:var(--error);" onclick="confirmReset()">确认清空</button><button class="modal-btn" onclick="closeModal()">取消</button></div>`);
}

function confirmReset() {
  localStorage.removeItem(TRACE_KEY);        // 'sh_traces'
  localStorage.removeItem('sh_index_v1_state');
  closeModal();
  showModal(`<div class="modal-title">✅ 已重置</div><div class="modal-body">学习进度已清空。页面即将刷新。</div>`);
  setTimeout(() => location.reload(), 1500);
}
```

**验收标准**：
- [ ] 弹窗中有红色"重置学习进度"按钮
- [ ] 点击后弹出确认对话框
- [ ] 确认后 `localStorage` 被清空
- [ ] 页面自动刷新，仪表盘显示为初始状态

---

### REQ-03：弹窗内点击"去学习"时记录痕迹

**当前状态**：
`handleModalGoToLearn(cardId)` 跳转后没有记录该行为。

**期望行为**：
在函数中添加 `recordTrace` 调用。

**参考代码**（只需修改现有函数）：

```javascript
function handleModalGoToLearn(cardId) {
  // 新增：记录从弹窗跳转去学习的行为
  recordTrace('user_action', 'navigate', 'modal_to_learn', cardId, getCard(cardId)?.formulaName || '');
  
  closeModal();
  setTimeout(() => goToLearn(cardId), 50);
}
```

**验收标准**：
- [ ] 点击"去学习"后，在 `localStorage.getItem('sh_traces')` 中能找到 `type='user_action', target='navigate'` 的记录

---

### REQ-04：今日学习按钮显隐逻辑

**当前状态**：
`btnDaily` 在 topbar 中始终显示。学习页点击它会覆盖学习页。

**期望行为**：
学习页隐藏该按钮，仪表盘和复习页显示。

**参考代码**：

```javascript
// 在 switchView 函数中（或 render 时）：
const btnDaily = document.getElementById('btnDaily');
if (btnDaily) {
  btnDaily.style.display = (view === 'dashboard' || view === 'review') ? 'inline-block' : 'none';
}
```

**验收标准**：
- [ ] 仪表盘和复习页可见"📊 今日学习"按钮
- [ ] 学习页该按钮隐藏

---

### REQ-05：学习页考试/练习按钮从底部移到顶部 **[新增，P0]**

**当前状态**：
学习页的按钮放在底部（`action-bar` 在 `renderLearn` 末尾，第 2861 行）。用户需要滚动到页面底部才能点击"单卡练习"、"模拟考试"等按钮。这不符合"想考试直接考"的要求。

**期望行为**：
将考试/练习/问 Kimi 的操作按钮从底部移到**顶部**，放在方剂标题下方。具体位置：在 `learn-header`（方剂名称和标签）下方，添加一个**操作栏**。这样用户打开学习页就能看到操作按钮，向下滚动内容时不受干扰。

**参考代码**：

```javascript
// 当前 renderLearn 结构（index.html:2748-2868）：
// 原结构：
//   <div class="back-link">...</div>
//   <div class="learn-header">...</div>
//   <div class="learn-columns">...内容...</div>
//   <div class="action-bar">...按钮（底部）...</div>

// 新结构：
//   <div class="back-link">...</div>
//   <div class="learn-header">...</div>
//   <div class="learn-action-bar-top">...按钮（顶部）...</div>
//   <div class="learn-columns">...内容...</div>
//   （可选：底部可以保留一个轻量的"返回"按钮）

// 修改方式：将 index.html 中第 2861-2867 行的 action-bar 移到 learn-header 后面
```

**具体 CSS 建议**：

```css
/* 顶部操作栏 - 添加或修改 */
.learn-action-bar-top {
  display: flex;
  gap: 10px;
  padding: 14px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

/* 如果按钮在移动端需要换行 */
.learn-action-bar-top .btn-primary,
.learn-action-bar-top .btn-secondary {
  white-space: nowrap;
}
```

**修改范围**：
- `index.html` 第 2748-2868 行（`renderLearn` 函数）
- 将底部的 `<div class="action-bar">...</div>`（约第 2861-2867 行）移到 `learn-header` 后面（第 2755 行之后）
- 将 class 从 `action-bar` 改为 `learn-action-bar-top`（或保留 `action-bar` 但调整 CSS）
- 底部可以保留一个简化的"返回"按钮（可选）

**验收标准**：
- [ ] 打开学习页，按钮在顶部可见（不需要滚动）
- [ ] 向下滚动内容时，按钮在上方不干扰阅读
- [ ] 按钮功能正常（单卡练习、类方练习、模拟考试、问 Kimi）
- [ ] 响应式：窗口变窄时按钮自动换行

---

## 3. 接口契约（数据层 ↔ 交互层）

### 3.1 全局变量（数据层已提供）

| 变量名 | 类型 | 说明 | 来源 | v9 兼容性 |
|---|---|---|---|---|
| `window.HERB_ALIAS_MAP` | `Object<string, string>` | 药名别名 → 标准名映射 | `herb-aliases.js` | 数据不变，改为 `import` |
| `window.HERB_CLASS_MAP` | `Object` | 药名 → 类别映射（预留） | `herb_alias_map.json` | 同上 |
| `CARDS` | `Array<FormulaCard>` | 35 张方剂卡片 | `formula_cards.json` | 数据不变 |
| `EXPERIENCES` | `Array<ExperienceCard>` | 医案卡片 | `experience_cards.json` | 数据不变 |
| `SOURCE_CARDS` | `Array<SourceCard>` | 条文卡片 | `source_cards.json` | 数据不变 |
| `TRACE_KEY` | `string` | `'sh_traces'` | 全局常量 | 键名不变 |
| `recordTrace(type, target, targetName, cardId, formulaName)` | `Function` | 记录痕迹 | `index.html:3513` | 逻辑迁移到 `StorageService` |
| `getCard(id)` | `Function` | 通过 ID 获取卡片 | `index.html` | 迁移到 `DataService` |

### 3.2 函数契约（交互层已提供）

| 函数 | 签名 | 说明 | v9 迁移建议 |
|---|---|---|---|
| `showModal(html)` | 接受 HTML 字符串 | 显示弹窗 | `KimiModal.js` 或新组件 |
| `closeModal()` | 无参数 | 关闭弹窗 | 同上 |
| `goToLearn(cardId)` | 接受 cardId | 切换到学习页 | `AppStore.navigate()` |
| `switchView(view)` | 接受视图名 | 切换主视图 | `AppStore.setView()` |
| `escapeHtml(text)` | 接受字符串 | HTML 转义 | `utils/formatters.js` |
| `exportTraces()` | 无参数 | 导出 JSON | `StorageService.export()` |
| `importTraces(jsonText)` | 接受 JSON 字符串 | 导入 JSON | `StorageService.import()` |
| `generateDailyReport(dateStr?)` | 可选日期 | 生成日报 | `StatsService.dailyReport()` |
| `renderReferences(card)` | 接受 Card 对象 | 渲染参考资料 | 见附录 A |

### 3.3 与 v9 架构对齐要点

**v9 正在开发的文件**：`app/v9/src/components/LearnView.js`

当 v9 的 `LearnView.js` 开发到需要渲染参考资料时，请确保它：
1. 读取 `card.references`（不是 `card.data.canonical.references`，那是旧格式）
2. 复用视觉规范 V1 的 CSS 类（`.rx-herb-name`, `.rx-herb-dose`, `.rx-formula-tag`, `.rx-separator`）
3. 药名点击时调用 `onHerbClick` 或等效函数（v9 中可改为事件派发）
4. 方剂名点击时调用 `onFormulaClick` 或等效函数
5. 记录痕迹时调用 `recordTrace`（v9 中可通过 `StorageService` 调用）

**v9 不需要现在做的**：
- 不需要现在就把 `renderReferences` 从 v1 迁移到 v9
- 不需要现在就把 `herb-aliases.js` 从 script 标签改为 ES module
- 但需要确保 **v9 的 JSON 数据结构** 与 v1 的 `data/*.json` 一致（这是数据层保证的）

---

## 4. 附录 A：参考资料渲染规范（数据层负责定义）

> **本附录是数据层对参考资料的完整规范，交互层（v1 和 v9）必须遵循此规范进行渲染。**

### A.1 数据 Schema（formula_card.references）

```javascript
card.references = {
  teacher_notes: [      // 名家言论（黄煌等）
    {
      id: "string",     // 唯一标识
      title: "string",  // 标题（如"大柴胡汤：经典方证"）
      author: "string", // 作者（如"黄煌"）
      source: "string", // 来源（如"《黄煌经方使用手册》"）
      summary: "string",// 摘要文本（可包含多个要点，用句号分隔）
      url: "string?"    // 可选：原文链接
    }
  ],
  clinical_cases: [     // 临床医案
    {
      id: "string",
      title: "string",
      author: "string",
      source: "string",
      summary: "string", // 患者主诉 + 病史摘要
      tags: ["string"],  // 症状标签（如["发热", "呕吐"]）
      prescription_structured: [  // 结构化处方（优先）
        { name: "柴胡", dose: "15g" },
        { name: "黄芩", dose: "10g" }
      ],
      prescription: "string?",  // 原始处方字符串（fallback）
      url: "string?",
      local_path: "string?"     // 本地文件路径（如 "extracted/太阳病.md"）
    }
  ],
  source_annotations: [   // 条文讲解
    {
      id: "string",
      title: "string",
      source: "string",
      summary: "string"  // 讲解内容
    }
  ]
}
```

### A.2 渲染逻辑（v1 中 `renderReferences` 函数）

**位置**：`index.html:2590-2738`

**核心规则**：

1. **名家言论**：从 `summary` 提取 bullet points（按句号/分号拆分），显示为要点列表。每条要点前有 `•` 符号。链接可跳转到原文。

2. **临床医案**：显示为卡片式布局，包含：
   - 患者画像（从 summary 中提取年龄、性别、体型标签）
   - 症状摘要（summary 前 280 字）
   - **结构化处方**（优先使用 `prescription_structured`）
   - 疗效（从 summary 中匹配关键词提取）
   - 原文链接 / 本地文件链接

3. **条文讲解**：显示为简洁卡片，标题 + 来源 + 摘要。

4. **旧格式兼容**：如果 `card.references` 不存在但 `card.data.canonical.references` 存在，按旧格式渲染（index.html:2720-2736）。

### A.3 视觉规范 V1（CSS 类定义）

**所有参考资料中的药名、剂量、方剂名必须使用以下 CSS 类**：

| CSS 类 | 作用 | 示例 |
|---|---|---|
| `.rx-herb-name` | 药名：可点击、下划线、hover 高亮 | `柴胡` |
| `.rx-herb-dose` | 剂量：灰色小字 | `15g` |
| `.rx-separator` | 顿号分隔：灰色、4px 间距 | `、` |
| `.rx-formula-tag` | 合方标签：可点击、背景色块 | `合大柴胡汤` |
| `.rx-formula-label` | 标签前缀：小字"合" | `合` |

**参考 CSS（已存在于 index.html:960-1005）**：

```css
.rx-herb-name {
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  border-bottom: 1px dashed var(--accent);
  transition: all 0.15s;
  padding: 0 1px;
}
.rx-herb-name:hover {
  background: var(--accent-bg);
  border-bottom-style: solid;
}
.rx-herb-dose {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 1px;
}
.rx-separator {
  color: var(--text-muted);
  margin: 0 4px;
}
.rx-formula-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
}
.rx-formula-tag:hover {
  background: var(--accent);
  color: var(--bg-panel);
}
.rx-formula-tag .rx-formula-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-right: 4px;
}
```

**参考资料整体容器 CSS（已存在）**：

```css
.ref-section { margin-bottom: 14px; }
.ref-section-title { /* 分区标题：小字、大写、灰色 */ }
.ref-exp-card { /* 卡片：白底、圆角、左边框 */ }
.ref-exp-card-header { /* 卡片标题：粗体 */ }
.ref-exp-card-meta { /* 元信息：小字、灰色 */ }
.ref-exp-points { /* 要点列表容器 */ }
.ref-exp-point { /* 要点项：flex 布局、带圆点 */ }
.ref-exp-point::before { content: "•"; color: var(--accent); }
.ref-case-card { /* 医案卡片：虚线边框 */ }
.ref-case-header { /* 医案头部：flex */ }
.ref-case-label { /* 标签：白字、绿底 */ }
.ref-case-patient { /* 患者标签容器 */ }
.ref-case-patient-tag { /* 患者标签：小圆角 */ }
.ref-case-symptoms { /* 症状文本：13px、行高1.7 */ }
.ref-case-rx { /* 处方区域：淡绿左边框 */ }
.ref-case-outcome { /* 疗效：绿色文字 */ }
.ref-case-footer { /* 底部：flex、分隔线 */ }
.ref-case-source { /* 来源信息：灰色 */ }
.ref-case-link { /* 链接按钮：边框、hover 效果 */ }
.ref-case-link.broken { /* 不可用链接：灰色、删除线 */ }
.ref-source-anno { /* 条文讲解卡片：灰左边框 */ }
```

### A.4 交互行为（数据层已注入）

1. **药名点击**：调用 `onHerbClick(herbName, cardId)` → 弹窗显示含该药的所有类方，按 lineage 分组。
2. **方剂名点击**：调用 `onFormulaClick(formulaName, targetCardId, fromCardId)` → 弹窗显示目标方简介，可跳转学习。
3. **链接点击**：调用 `recordTrace('link_click', 'reference_url'|'reference_local', url, cardId, formulaName)` → 记录访问痕迹。

### A.5 v9 迁移时的复用建议

当 v9 需要实现参考资料渲染时，可以从 v1 的 `renderReferences` 函数复制以下逻辑：
1. `extractBulletPoints(text)` —— 从文本提取要点
2. `renderPrescription(rxItems, cardId)` —— 渲染结构化处方
3. `renderFormulaLink(name, fromCardId)` —— 渲染合方链接
4. 患者画像自动提取（年龄/性别/体型正则匹配）
5. 疗效自动提取（关键词匹配）

**不需要迁移的**：CSS 样式（v9 应复用类名或定义自己的样式系统）。

---

## 5. 附录 B：v9 架构与 v1 的接口对齐

### B.1 v9 目录结构（操作系统对话正在开发）

```
app/v9/
  index.html              ← 入口（加载构建产物）
  src/
    app.js                ← 主应用
    components/
      CardList.js           ← 卡片列表
      LearnView.js          ← 学习视图（需要复用 renderReferences 逻辑）
      ExamView.js           ← 考试视图
      KimiModal.js          ← 弹窗（可替代 v1 的 showModal）
      PracticeSummary.js    ← 练习总结
    services/
      DataService.js        ← 数据加载（替代 fetch）
      ExamService.js        ← 考试逻辑
      MasteryService.js     ← 掌握度管理（替代本地 mastery 对象）
      StatsService.js       ← 统计（替代 generateDailyReport）
      StorageService.js     ← 存储（替代 localStorage 直接操作）
    store/
      AppStore.js           ← 状态管理（替代 state 对象）
    utils/
      dom.js                ← DOM 工具
      formatters.js         ← 格式化（替代 escapeHtml）
      random.js             ← 随机工具
      validators.js         ← 验证
  public/
    data/
      formula_cards.json    ← 与 v1 共享的数据文件
      experience_cards.json
      source_cards.json
      ...
```

### B.2 对齐要点

| v1 数据层输出 | v9 交互层输入 | 对齐方式 |
|---|---|---|
| `data/formula_cards.json` | `public/data/formula_cards.json` | 文件内容完全一致（符号链接或复制） |
| `herb-aliases.js` | 需要加载 | v9 中改为 `import { HERB_ALIASES } from './herb-aliases.js'`（或构建时内联） |
| `recordTrace` 函数 | `StorageService` 中调用 | 键名 `sh_traces` 不变，函数签名不变 |
| `renderReferences` 逻辑 | `LearnView.js` 中复用 | 复制核心逻辑，样式按 v9 设计系统重写 |
| `switchView` | `AppStore.setView()` | 状态管理方式不同，但视图名（`dashboard`, `learn`, `review`, `exam`）保持一致 |

### B.3 数据层不碰的（v9 专属）

以下内容由操作系统对话在 v9 中自由定义，数据层不做任何要求：
- v9 的 CSS 框架（Tailwind/Styled/原生）
- v9 的路由方式（hash / history / 状态管理）
- v9 的组件组织方式（React/Vue/原生）
- v9 的弹窗实现方式（`KimiModal.js` 或第三方库）

**数据层唯一要求**：v9 读取的 JSON 数据文件与 v1 完全一致。

---

## 6. 已知陷阱与注意事项

### 6.1 file:// 协议限制

- 用户通常**双击 HTML 文件打开**（`file://` 协议）。
- `fetch('../data/*.json')` 在 `file://` 下会**失败**（CORS）。
- 已通过 `<script src="herb-aliases.js">` 解决药名别名加载。
- **不要**依赖 `fetch` 作为唯一加载路径，必须提供 fallback。

### 6.2 localStorage 键名

| 键名 | 用途 | 重置时 |
|---|---|---|
| `sh_traces`（`TRACE_KEY`） | 学习痕迹 | `removeItem(TRACE_KEY)` |
| `sh_index_v1_state` | 应用状态（主题、当前卡片等） | `removeItem('sh_index_v1_state')` |

### 6.3 弹窗 z-index

- `traceModal` 是动态创建的 overlay，默认在 body 末尾。
- 建议给 CSS 添加 `z-index: 1000`（如果还没有）。

### 6.4 按钮样式

- 所有按钮使用 CSS 变量：`var(--accent)` 主色、`var(--error)` 红色、`var(--bg-panel)` 背景。
- 已定义类：`.modal-btn`、`.modal-btn.primary`、`.btn-primary`、`.btn-secondary`。
- 新增按钮请沿用这些类。

---

## 7. 修改范围限制

**允许修改的文件和区域**：
- `app/index.html`：
  - 第 2748-2868 行（`renderLearn` 函数，移动按钮到顶部）
  - 第 3794-3805 行（`showDailyReport` 函数，添加导入/重置按钮）
  - 第 3764-3767 行（`handleModalGoToLearn` 函数，添加记录）
  - 第 3642-3660 行（`exportTraces`/`importTraces` 附近，添加新函数）
  - `switchView` 函数（添加按钮显隐逻辑）
  - CSS 区域（添加 `.learn-action-bar-top` 样式）
- **不要修改**：`data/*.json`、`herb-aliases.js`、`renderReferences` 函数。

---

## 8. 验收测试步骤（用户可执行）

1. **打开** `app/index.html`（双击即可）。
2. **点击任意卡片** → 进入学习页。
3. **确认** 顶部有操作按钮：单卡练习、类方练习、模拟考试、问 Kimi、返回（不需要滚动到页面底部）。
4. **点击 topbar 的"📊 今日学习"** → 弹窗出现。
5. **确认** 弹窗中有四个按钮：
   - [ ] 导出学习数据（蓝色）
   - [ ] 导入学习数据（灰色）
   - [ ] 重置学习进度（红色）
   - [ ] 关闭（灰色）
6. **点击"导入学习数据"** → 弹出文件选择框 → 选择 `sh_traces_*.json` → 导入成功 → 刷新 → 进度恢复。
7. **点击"重置学习进度"** → 确认弹窗 → 确认 → 页面刷新 → 仪表盘显示为 0。
8. **点击任意药名** → 类方弹窗 → 点击"去学习" → 进入学习页后，在控制台执行 `JSON.parse(localStorage.getItem('sh_traces')).traces.filter(t => t.type === 'user_action' && t.target === 'navigate')` → 能看到记录。
9. **在学习页** → 确认 topbar 上"📊 今日学习"按钮已隐藏。
10. **向下滚动学习页** → 确认内容不被顶部按钮遮挡。

---

**执行完成后，请操作系统对话在文档末尾添加签名字段：**

```
---
执行者：操作系统对话
执行日期：YYYY-MM-DD
完成状态：□ REQ-01 □ REQ-02 □ REQ-03 □ REQ-04 □ REQ-05
测试验证：□ 全部通过 □ 部分通过 □ 未测试
备注：
```
