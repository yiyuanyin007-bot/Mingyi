# 经方学习系统 · 工程化重构顶层设计（LOOP 工程）

> **版本**：v1.0  
> **目标**：将单文件原型（`app/index.html` 2,986 行）重构为可长期维护、可测试、可部署的模块化产品。  
> **原则**：不中断现有功能，渐进式重构，每步可回滚。  
> **风险控制**：重构期间 `app/index.html` 保持可用，新架构在 `app/v9/` 或独立目录并行开发，完成后整体切换。

---

## 一、LOOP 工程总览

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LEVERAGE  │ → │   ORGANIZE  │ → │   OPERATE   │ → │   POLISH    │
│   盘点与基线  │    │   组织与架构  │    │   执行与重构  │    │   打磨与监控  │
│  (1 周)      │    │  (1 周)      │    │  (2–4 周)    │    │  (持续)      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↑                                                              │
       └────────────────── 反馈闭环 ← 数据/监控/用户反馈 ───────────────┘
```

---

## 二、L — Leverage（盘点与基线）

### 2.1 目标
在动任何代码之前，建立**可量化的现状基线**，明确哪些能复用、哪些必须重写、哪些可以冻结。

### 2.2 动作清单

| 编号 | 动作 | 负责人 | 产出物 |
|------|------|--------|--------|
| L-1 | **代码审计**：统计 `app/index.html` 中 HTML/CSS/JS 的边界、全局变量、函数依赖图 | AI | `docs/LOOP-L/code-audit.md` |
| L-2 | **数据审计**：验证 `data/*.json` 的 schema 一致性、字段覆盖率、缺失值 | AI | `docs/LOOP-L/data-audit.md` |
| L-3 | **技术债务清单**：标记所有 `innerHTML`、硬编码、全局状态、魔法数字 | AI | `docs/LOOP-L/tech-debt.md` |
| L-4 | **功能清单冻结**：逐条列出当前 `index.html` 的所有功能（学习视图、考试视图、练习视图、每日复习、掌握度、Kimi 弹窗等） | AI + 用户 | `docs/LOOP-L/feature-matrix.md` |
| L-5 | **可复用资产识别**：哪些 UI 模式（卡片列表、选项按钮、进度条、弹窗）是高频复用的 | AI | `docs/LOOP-L/reusable-assets.md` |
| L-6 | **用户数据保护方案**：设计 `localStorage` 迁移脚本，确保重构后用户进度不丢 | AI | `docs/LOOP-L/migration-plan.md` |

### 2.3 质量门禁

- [ ] 代码审计报告必须包含：**全局变量清单**、**函数调用图**、**DOM 操作清单**
- [ ] 数据审计必须通过 Python `jsonschema` 验证，输出通过率
- [ ] 技术债务清单必须分级：🔴 阻塞（必须修）/ 🟡 高风险（重构时修）/ 🟢 低风险（后续修）
- [ ] 功能清单必须通过冒烟测试逐项打勾确认
- [ ] 迁移方案必须通过「旧数据 → 新 schema → 旧页面读取」双向验证

### 2.4 验收标准

> 进入 Organize 阶段前，必须能回答：「如果我们现在冻结 `index.html` 的所有功能，新架构需要精确复刻哪些行为？」

---

## 三、O — Organize（组织与架构）

### 3.1 目标
设计**模块化架构**与**接口契约**，让后续重构有章可循，避免「边拆边乱」。

### 3.2 架构设计

#### 3.2.1 目录结构（目标态）

```
app/
├── index.html              # 入口，仅做挂载点与全局配置
├── v9/                     # 新架构目录（重构期间并行开发）
│   ├── src/
│   │   ├── components/     # UI 组件（每个组件独立文件夹：.js + .css + .test.js）
│   │   │   ├── CardList/           # 左侧卡片列表
│   │   │   ├── LearnView/          # 学习视图（单栏）
│   │   │   ├── ExamView/           # 考试视图（双栏/选项）
│   │   │   ├── PracticeView/       # 练习视图（即时反馈）
│   │   │   ├── DailyReview/        # 每日复习面板
│   │   │   ├── MasteryPanel/       # 掌握度/统计面板
│   │   │   ├── KimiModal/          # Kimi 导师弹窗
│   │   │   └── PracticeSummary/    # 练习后总结
│   │   ├── services/       # 数据与业务逻辑层
│   │   │   ├── DataService.js      # fetch + 缓存 + 失败回退
│   │   │   ├── StorageService.js   # localStorage 抽象 + 迁移 + 导出/导入
│   │   │   ├── ExamService.js      # 出题逻辑 + 选项生成 + 去重
│   │   │   ├── MasteryService.js   # 掌握度计算 + SRS 调度 + 晋级/降级
│   │   │   └── KimiService.js      # prompt 生成 + 剪贴板/外链
│   │   ├── utils/          # 纯函数工具
│   │   │   ├── formatters.js       # slug → name、日期格式化、数组去重
│   │   │   ├── validators.js       # JSON schema 校验、输入转义
│   │   │   ├── random.js           # Fisher-Yates、随机抽题
│   │   │   └── dom.js              # 安全的 DOM 操作（替代 innerHTML）
│   │   ├── store/          # 状态管理（极简 Store 模式，非 Redux）
│   │   │   └── AppStore.js         # 全局状态 + 订阅/发布
│   │   ├── styles/         # 样式系统
│   │   │   ├── theme.css           # CSS 变量（浅色/深色）
│   │   │   ├── base.css            # 重置与工具类
│   │   │   └── components/         # 各组件样式（与组件同名）
│   │   └── app.js          # 入口：初始化 Store、加载数据、路由分发
│   ├── tests/
│   │   ├── unit/           # 纯函数测试（Vitest）
│   │   ├── integration/    # 组件级测试（Vitest + jsdom）
│   │   └── e2e/            # 端到端测试（Playwright）
│   │       ├── smoke.spec.js       # 冒烟测试（复刻 v8_smoke_test.md）
│   │       ├── exam-flow.spec.js   # 考试完整流程
│   │       └── data-persistence.spec.js  # localStorage 迁移与持久化
│   ├── public/             # 静态资源
│   │   └── data/           # JSON 数据（构建时复制或符号链接）
│   └── vite.config.js      # 构建配置
├── mobile.html             # 响应式方案：最终合并为 index.html 的断点适配
└── archive/                # 历史版本（保持现状）
```

#### 3.2.2 数据流设计

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   public/   │     │   DataService   │     │   AppStore   │
│  data/*.json│ → │  fetch + cache │ → │  global state│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
              ┌────────────────────────────────┼────────────────────────────────┐
              ↓                                ↓                                ↓
       ┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
       │  ExamService │                 │MasteryService│                 │  UI Components│
       │ 出题/选项/判分│                 │ 掌握度/SRS   │                 │ 订阅状态更新  │
       └─────────────┘                 └─────────────┘                 └─────────────┘
```

**原则**：
- 数据单向流动：DataService → Store → Components
- 用户操作 → Components → Store → Services → Store → Components（闭环）
- 禁止组件直接操作 `localStorage` 或 `fetch`

#### 3.2.3 接口契约（关键）

| 接口 | 输入 | 输出 | 错误处理 |
|------|------|------|----------|
| `DataService.loadCards()` | 无 | `Promise<Card[]>` | 失败时回退到 `public/data/` 本地副本 |
| `StorageService.getState()` | 无 | `AppState` | 无数据时返回初始状态，不抛错 |
| `StorageService.saveState(state)` | `AppState` | `boolean` | 写入失败时静默 log，不影响用户操作 |
| `ExamService.generateQuestions(cards, mode, count)` | `Card[], string, number` | `Question[]` | 题库不足时返回 `[]`，由 UI 降级提示 |
| `ExamService.generateOptions(question, cards)` | `Question, Card[]` | `Option[]` | 保证 4 个选项，标签唯一 |
| `MasteryService.update(cardId, vector, isCorrect)` | `string, string, boolean` | `MasteryUpdate` | 自动计算 next_review 与 level |
| `MasteryService.getDailyReview(cards, limit)` | `Card[], number` | `Question[]` | 优先弱项 + 随机抽检 |

### 3.3 动作清单

| 编号 | 动作 | 产出物 |
|------|------|--------|
| O-1 | 设计目录结构并创建空骨架 | `app/v9/` 目录树 |
| O-2 | 编写 `DataService` 接口并实现 mock | `app/v9/src/services/DataService.js` |
| O-3 | 编写 `StorageService` 接口（含迁移逻辑） | `app/v9/src/services/StorageService.js` |
| O-4 | 设计 `AppStore` 状态树（与现有 `localStorage` 兼容） | `app/v9/src/store/AppStore.js` |
| O-5 | 编写 JSON schema 定义（`formula_card`、`source_card`、`experience_card`） | `app/v9/public/schemas/` |
| O-6 | 设计测试策略：单元/集成/E2E 分工与覆盖率目标 | `docs/LOOP-O/testing-strategy.md` |
| O-7 | 选择并配置构建工具（Vite）与测试框架（Vitest + Playwright） | `app/v9/vite.config.js`、`app/v9/package.json` |
| O-8 | 编写「组件提取顺序」路线图（先无状态组件，再状态组件） | `docs/LOOP-O/refactoring-roadmap.md` |

### 3.4 质量门禁

- [ ] 所有 Services 必须有接口定义（JSDoc 或 TypeScript `.d.ts`），未实现前可先用 mock
- [ ] `AppStore` 状态树必须与现有 `localStorage` 结构 100% 兼容，或提供无损迁移脚本
- [ ] JSON schema 必须通过 `ajv` 或 Python `jsonschema` 验证现有 `data/*.json`
- [ ] 测试策略必须明确覆盖率目标：**单元测试 ≥ 70%**，**核心流程集成测试 100%**
- [ ] 构建配置必须输出与当前 `index.html` 等价的 `dist/index.html`（可本地打开或部署）

### 3.5 验收标准

> 进入 Operate 阶段前，必须能回答：「新架构的 `app/v9/src/app.js` 能加载现有 `data/formula_cards.json` 并渲染一个空白页面，不报错。」

---

## 四、O — Operate（执行与重构）

### 4.1 目标
**渐进式提取与重构**，每完成一个组件就测试、就验证，不积压。

### 4.2 重构顺序（关键）

采用「**由外到内，先纯后杂**」的顺序：

```
Phase 1: 工具函数提取（纯函数，无风险）
    → formatters.js, validators.js, random.js, dom.js

Phase 2: 数据服务层（不碰 UI）
    → DataService, StorageService, JSON schema 校验

Phase 3: 状态管理（不碰 UI）
    → AppStore（用现有数据验证状态流转正确）

Phase 4: 无状态 UI 组件（外观保持 100%）
    → CardList（仅渲染，不处理点击）
    → MasteryPanel（仅显示，不更新）
    → PracticeSummary（仅显示数据）

Phase 5: 有状态业务组件（接入 Services + Store）
    → LearnView（卡片切换、内容展示）
    → KimiModal（prompt 生成、剪贴板）
    → ExamView（出题、选项、判分、导航）
    → PracticeView（即时反馈、计分）
    → DailyReview（弱项优先、SRS）

Phase 6: 集成与入口
    → app.js（路由、初始化、错误边界）
    → index.html（挂载点）

Phase 7: 冒烟测试与功能对照
    → 对照 `docs/LOOP-L/feature-matrix.md` 逐项验证
    → 对照 `docs/v8_smoke_test.md` 跑 E2E 测试

Phase 8: 数据迁移验证
    → 旧 localStorage 数据 → 新 StorageService → 读取验证
    → 导出/导入 JSON 功能验证
```

### 4.3 每个 Phase 的固定流程

```
1. 写测试（先写测试，再写/改代码）
2. 提取/重构代码
3. 单元测试通过
4. 集成到 v9 临时入口验证
5. 截图对比（Playwright 或手动）确认 UI 无变化
6. 更新功能清单（打勾）
7. 更新迁移文档（如有数据变更）
8. 进入下一 Phase
```

### 4.4 动作清单（示例 Phase 1–3）

| 编号 | 动作 | 测试要求 | 截图对比 |
|------|------|----------|----------|
| OP-1 | 提取 `formatters.js`（slugToName、formatCorrectAnswer、日期等） | 单元测试覆盖所有分支 | 不涉及 UI |
| OP-2 | 提取 `validators.js`（JSON schema、输入转义、选项去重验证） | 单元测试覆盖异常输入 | 不涉及 UI |
| OP-3 | 提取 `random.js`（Fisher-Yates、随机抽题、弱项排序） | 单元测试覆盖随机性分布 | 不涉及 UI |
| OP-4 | 提取 `dom.js`（安全创建元素、批量渲染、事件委托） | 单元测试覆盖 XSS 场景 | 不涉及 UI |
| OP-5 | 实现 `DataService`（fetch + fallback + cache） | mock 测试 + 真实 fetch 测试 | 不涉及 UI |
| OP-6 | 实现 `StorageService`（localStorage 抽象 + 旧数据迁移） | 迁移脚本测试 + 边界测试 | 不涉及 UI |
| OP-7 | 实现 `AppStore`（状态树 + 订阅发布） | 状态流转测试 + 订阅回调测试 | 不涉及 UI |
| OP-8 | 提取 `CardList` 组件（纯渲染，props 驱动） | 集成测试：传入 cards 渲染正确 | 与 v8 左侧栏截图对比 |
| ... | ... | ... | ... |

### 4.5 质量门禁（核心）

#### 4.5.1 测试门禁

| 层级 | 工具 | 覆盖率目标 | 门禁规则 |
|------|------|------------|----------|
| 单元 | Vitest | 行覆盖率 ≥ 70% | 未达标禁止合入 |
| 集成 | Vitest + jsdom | 核心 Services 100% | 每个 Service 至少 3 个场景测试 |
| E2E | Playwright | 冒烟测试 100% | 必须复刻 `v8_smoke_test.md` 的 6 步流程 |
| 截图 | Playwright | 关键页面对比 | 与 v8 截图差异度 < 2%（像素级） |

#### 4.5.2 代码门禁

- [ ] **禁止 `innerHTML`**：所有 DOM 操作通过 `dom.js` 的安全接口，或直接使用 DOM API
- [ ] **禁止全局变量**：所有状态走 `AppStore`，所有配置走 `app.js` 初始化参数
- [ ] **禁止硬编码**：所有文本、颜色、阈值提取到 `constants.js` 或 CSS 变量
- [ ] **禁止 Services 直接操作 UI**：Services 只返回数据，渲染由 Components 负责

#### 4.5.3 数据门禁

- [ ] 每次修改 `data/*.json` 必须通过 JSON schema 验证
- [ ] 每次修改卡片结构必须更新 `StorageService` 迁移逻辑（兼容旧数据）
- [ ] 用户 localStorage 数据必须能通过「旧 → 新 → 旧」双向无损转换

#### 4.5.4 功能门禁

- [ ] 冒烟测试清单（来自 `v8_smoke_test.md`）必须全部通过：
  1. 卡片列表正常加载
  2. 今日复习数、已掌握向量数正常
  3. 点击卡片 → 学习页 → 开始测试 → 答题 → 反馈正确/错误
  4. 刷新页面 → 进度不丢
  5. 点击「今日复习」→ 生成 5 题 → 答题正常
  6. 点击「问 Kimi」→ 弹窗显示 prompt → 可复制或打开 Kimi

### 4.6 回滚策略

每个 Phase 都有**快照回滚点**：

```
app/v9/
├── snapshots/
│   ├── phase-01-utils/          # Phase 1 完成时的完整代码
│   ├── phase-02-services/      # Phase 2 完成时的完整代码
│   ├── phase-03-store/         # Phase 3 完成时的完整代码
│   ├── phase-04-components-ui/  # Phase 4 完成时的完整代码
│   ├── phase-05-components-biz/ # Phase 5 完成时的完整代码
│   ├── phase-06-integration/    # Phase 6 完成时的完整代码
│   └── phase-07-smoke-pass/   # Phase 7 冒烟测试通过
```

**规则**：如果 Phase N 出现无法修复的回归，直接回退到 `phase-(N-1)-*` 快照，不手工修。

---

## 五、P — Polish（打磨与监控）

### 5.1 目标
重构完成后，建立**质量护城河**，确保后续迭代不引入回归，数据质量不下降。

### 5.2 动作清单

| 编号 | 动作 | 产出物 | 频率 |
|------|------|--------|------|
| P-1 | **性能预算**：首屏 < 2s、交互响应 < 100ms、JSON 加载 < 500ms | `docs/LOOP-P/performance-budget.md` | 每次发版 |
| P-2 | **错误监控**：全局 `try-catch` + 错误日志（不上报隐私，仅本地 log） | `app/v9/src/utils/errorLogger.js` | 持续 |
| P-3 | **数据质量监控**：卡片 JSON 的 schema 校验、覆盖率检查、字段完整率 | `scripts/data_quality_check.py` | 每次数据更新 |
| P-4 | **使用埋点**：卡片点击率、考试通过率、各向量掌握度分布、功能使用频率 | `app/v9/src/utils/analytics.js`（匿名，仅本地） | 持续 |
| P-5 | **自动化部署**：GitHub Actions → 构建 → 部署到 GitHub Pages / Vercel | `.github/workflows/deploy.yml` | 每次 push main |
| P-6 | **文档同步**：代码变更自动同步到 AGENTS.md / RESOURCES.md | `scripts/sync_docs.py` | 每次大改 |
| P-7 | **依赖更新**：定期审计 npm 依赖安全性（`npm audit`） | `docs/LOOP-P/dependency-audit.md` | 每月 |
| P-8 | **可访问性检查**：键盘导航、屏幕阅读器友好、颜色对比度 | `docs/LOOP-P/a11y-checklist.md` | 每次 UI 大改 |

### 5.3 质量门禁（长期）

| 指标 | 目标 | 低于目标时动作 |
|------|------|----------------|
| 单元测试覆盖率 | ≥ 70% | 禁止合入新功能，先补测试 |
| E2E 冒烟测试 | 100% 通过 | 禁止发版，立即回滚 |
| 首屏加载时间 | < 2s | 优化构建（代码分割、懒加载） |
| 数据 schema 通过率 | 100% | 禁止更新数据，先修复 JSON |
| 代码审查 | 每 PR 至少 1 人 review | 未经 review 禁止合入 |
| 文档同步 | 每功能变更必须更新文档 | 文档未更新标记技术债务 |

### 5.4 持续反馈闭环

```
用户临床使用 → 记录卡点/错误 → 更新 data/experience_cards.json
       ↑                                              ↓
   优化卡片/功能 ← 开发迭代 ← 数据质量监控 ← 使用埋点分析
```

**关键**：Polish 阶段不是「做完就收」，而是让系统具备自我诊断能力，能告诉开发者「哪里坏了、哪里慢、哪里用户不用」。

---

## 六、质量控制体系总览

### 6.1 四层防护网

```
┌─────────────────────────────────────────┐
│  L4: E2E 冒烟测试（Playwright）          │  ← 用户视角，功能完整度
│  复刻 v8_smoke_test.md 的 6 步流程       │
├─────────────────────────────────────────┤
│  L3: 集成测试（Vitest + jsdom）          │  ← 组件视角，数据流正确
│  Services + Store + Components 联动测试  │
├─────────────────────────────────────────┤
│  L2: 单元测试（Vitest）                  │  ← 函数视角，边界覆盖
│  utils + services 纯函数覆盖 ≥ 70%       │
├─────────────────────────────────────────┤
│  L1: 静态检查（ESLint + TypeScript）     │  ← 代码视角，语法与类型
│  禁止 innerHTML、禁止全局变量、类型检查   │
└─────────────────────────────────────────┘
```

### 6.2 数据质量检查清单（Data Quality Gates）

每次数据变更（JSON 修改）必须过：

- [ ] **Schema 校验**：`ajv` 验证所有卡片符合 schema
- [ ] **字段完整率**：`canonical` 字段（symptom_profile、herbs、usage、contraindications）无空值
- [ ] **来源追溯**：`source_text` 和 `reference_source` 非空
- [ ] **别名检查**：目标清单中无重复/冲突别名
- [ ] **去重检查**：`formula_name` 无重复，`id` 全局唯一
- [ ] **剂量检查**：`herbs` 中剂量字段非空，单位统一（汉制）
- [ ] **禁忌检查**：`contraindications` 至少一条明确禁忌或"慎用"
- [ ] **链接检查**：`source_urls` 中的外链可访问（抽样检查）

### 6.3 重构质量三原则

1. **外观冻结原则**：Phase 4–5 的 UI 组件提取后，截图与 v8 对比，肉眼不可见差异才算通过。
2. **功能等价原则**：新架构的每个功能必须能在旧 `index.html` 中找到对应行为，且行为一致。
3. **数据无损原则**：用户的 localStorage 数据、JSON 数据、OCR 产物在重构过程中不丢失、不损坏、不改变语义。

---

## 七、时间线与里程碑

| 阶段 | 周数 | 里程碑 | 产出物 |
|------|------|--------|--------|
| **L**everage | 第 1 周 | 基线建立完成 | 代码审计、数据审计、技术债务、功能清单、迁移方案 |
| **O**rganize | 第 2 周 | 架构设计完成 | 目录骨架、接口契约、JSON schema、测试策略、构建配置 |
| **O**perate | 第 3–4 周 | 核心重构完成 | 工具函数、Services、Store、无状态组件 |
| **O**perate | 第 5–6 周 | 功能完整重构 | 有状态组件、集成入口、冒烟测试通过、截图对比通过 |
| **P**olish | 第 7 周 | 质量监控就绪 | 性能预算、错误监控、数据质量检查、自动化部署 |
| **P**olish | 持续 | 持续优化 | 根据用户反馈和埋点数据迭代 |

**关键决策点**：
- **第 2 周末**：评审架构设计，确认组件拆分粒度和接口契约。
- **第 4 周末**：评审核心重构，确认 Services + Store 无回归。
- **第 6 周末**：评审功能完整重构，对照功能清单逐项验收，通过后才能进入 Polish。

---

## 八、风险与应对

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| 大爆炸重写导致功能丢失 | 中 | 高 | 严格按 Phase 渐进，每 Phase 有快照，不跳过冒烟测试 |
| 单文件 HTML 依赖关系复杂，难以拆分 | 高 | 中 | 先提取纯函数（无依赖），再提取局部函数（局部依赖），最后提取组件 |
| 用户 localStorage 数据迁移失败 | 低 | 高 | 迁移脚本独立测试，支持「旧 → 新 → 旧」双向验证，失败时保留旧数据 |
| 测试编写成本过高 | 中 | 中 | 优先测试 Services（纯逻辑），UI 测试用 Playwright 截图 + 关键交互，不追求 100% 行覆盖 |
| 构建工具引入增加复杂度 | 中 | 低 | 选择 Vite（零配置优先），保持「npm install → npm run dev → 即能用」 |
| 重构期间用户需要紧急使用新功能 | 低 | 中 | 重构期间冻结 `app/index.html` 的新功能开发，紧急需求在旧版实现，重构后同步 |

---

## 九、待你对齐的问题

1. **重构目录**：新架构放在 `app/v9/` 还是独立项目（如 `shanghanlun-v9/`）？建议 `app/v9/` 保持统一入口。
2. **TypeScript**：是否引入 TypeScript？建议**不引入**（保持零编译依赖，用 JSDoc + `.d.ts` 做类型提示），降低门槛。
3. **构建工具**：Vite 是否可接受？是否有偏好（如 Parcel、Rollup）？Vite 是最轻量的选择。
4. **部署目标**：GitHub Pages（免费、简单）还是 Vercel/Netlify（更现代）？建议 GitHub Pages。
5. **测试优先级**：是否接受「先 Services 后 Components」的测试顺序？还是要求所有组件都要有单元测试？
6. **移动端策略**：是单独 `mobile.html` 还是合并为响应式 `index.html`？建议合并为响应式。
7. **开始时间**：是否立即启动 **L**everage（盘点），还是等当前临床数据积累后再启动？

---

**如果以上 LOOP 工程顶层设计没有问题，我们可以立即进入 Stage 1 — Leverage（盘点与基线），开始执行 L-1 代码审计。**
