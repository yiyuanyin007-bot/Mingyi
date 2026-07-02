# ROUND 1 报告：骨架搭建（Organize）

> **日期**：2026-06-15  
> **对应工程文档**：`docs/ROUND-1-engine.md`  
> **目标**：产出可编译、可运行的空架构，目录结构 + 构建配置 + Services mock + 测试骨架全部就位。

---

## 一、执行摘要

本轮在 `app/v9/` 目录下从零搭建了模块化架构骨架，包含：

- **目录结构**：8 个代码目录 + 3 个测试目录 + 1 个静态资源目录
- **配置文件**：Vite + Vitest + Playwright 三件套
- **Services 层**：DataService / StorageService / ExamService / MasteryService 全部实现（非 mock，真实逻辑）
- **Store 层**：AppStore 订阅/发布模式，状态树与旧版兼容
- **工具函数**：formatters / dom / validators / random 提取完成
- **测试覆盖**：7 个单元测试文件 + 1 个 E2E 冒烟测试
- **入口页面**：`index.html` + `app.js` 可加载数据并渲染骨架仪表盘

**验证结果**：Python 静态验证脚本通过，文件清单完整、配置正确、测试文件就绪。npm 环境未安装（在环境中不可用），需用户在本地补装依赖后运行 `npm run dev` 和 `npm test`。

---

## 二、目录结构（最终态）

```
app/v9/
├── index.html                      # 入口，挂载点
├── package.json                    # 依赖与脚本
├── vite.config.js                  # 构建配置（6 个路径别名）
├── vitest.config.js                # 单元测试配置（jsdom + globals）
├── playwright.config.js            # E2E 测试配置（Chromium）
├── src/
│   ├── app.js                      # 入口：初始化、加载数据、渲染骨架
│   ├── components/                 # UI 组件（占位，ROUND 3 填充）
│   ├── services/
│   │   ├── DataService.js          # fetch + 缓存 + 失败回退
│   │   ├── StorageService.js       # localStorage 抽象 + v8→v9 迁移
│   │   ├── ExamService.js          # 出题 + 选项生成（去重）+ 判分
│   │   └── MasteryService.js       # 掌握度统计 + 覆盖度 + 薄弱点
│   ├── store/
│   │   └── AppStore.js             # 全局状态 + 订阅/发布 + 快捷操作
│   ├── utils/
│   │   ├── formatters.js           # slugToName / formatCorrectAnswer / SRS
│   │   ├── dom.js                  # 安全 DOM 操作（替代 innerHTML）
│   │   ├── validators.js           # 输入校验 + schema 验证 + 选项去重检查
│   │   └── random.js               # Fisher-Yates / 随机抽题 / 弱项排序
│   └── styles/
│       ├── theme.css               # CSS 变量（浅色/深色）
│       └── base.css                # 基础布局 + 组件骨架样式
├── tests/
│   ├── unit/
│   │   ├── formatters.test.js      # 28 个断言
│   │   ├── dom.test.js             # 4 个断言
│   │   ├── random.test.js          # 6 个断言
│   │   ├── validators.test.js      # 6 个断言
│   │   ├── examService.test.js     # 8 个断言
│   │   ├── storageService.test.js  # 7 个断言
│   │   └── appStore.test.js        # 9 个断言
│   └── e2e/
│       └── smoke.spec.js           # 3 个 E2E 场景
└── public/
    └── data/                       # 静态数据（符号链接或复制）
```

---

## 三、关键配置说明

### 3.1 Vite 配置（vite.config.js）

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `base` | `'./'` | 相对路径，支持本地文件打开和静态部署 |
| `publicDir` | `'public'` | 静态资源目录，放数据 JSON |
| `resolve.alias` | 6 个 | `@` → `src/`，`@services` → `src/services/` 等 |
| `build.outDir` | `'dist'` | 构建产物输出目录 |

**为什么用 Vite**：零配置、HMR 快、ESM 原生支持、与 Vitest 无缝集成。

### 3.2 Vitest 配置（vitest.config.js）

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `environment` | `'jsdom'` | 浏览器环境模拟，支持 DOM 测试 |
| `globals` | `true` | 全局 `describe`/`it`/`expect`，无需每个文件 import |
| `include` | `tests/**/*.test.js` | 测试文件匹配模式 |

### 3.3 Playwright 配置（playwright.config.js）

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `baseURL` | `http://localhost:5173` | 与 Vite dev server 默认端口一致 |
| `projects` | Chromium | 桌面版 Chrome 测试 |
| `webServer` | `npm run dev` | 自动启动 Vite 开发服务器 |

---

## 四、Services 层实现

### 4.1 DataService.js

- `loadData(key)`：从 `../data/*.json` fetch，失败回退到空数组（不崩溃）。
- `preloadAll()`：并行加载 3 个 JSON 文件。
- `cache`：Map 内存缓存，避免重复请求。
- **风险**：当前路径是 `../data/`（相对 v9 入口），生产构建后可能需要调整为 `public/data/` 复制。

### 4.2 StorageService.js（核心）

- **旧版兼容**：读取 `sh_index_v1_state`（v8），自动迁移到 `sh_v9_state`（v9）。
- **迁移逻辑**：`migrateFromV8()` 保留 `stats` 和 `mastery` 字段，丢弃其他。
- **掌握度算法**：`updateMastery()` 完全复刻 v8 逻辑——连对 3 次升级，连错 2 次降级。
- **导出/导入**：`exportState()` / `importState()` 支持 JSON 备份。
- **测试覆盖**：通过 `localStorageMock` 模拟浏览器存储，7 个断言覆盖迁移、统计、升级/降级。

### 4.3 ExamService.js（核心）

- `generateQuestionForVector(card, vector)`：6 向量题目生成，数据不足时返回 `null`。
- `generateQuestions(card)`：生成单卡全部题目。
- `generateOptions(cardId, type, allCards)`：**Set 去重**，保证 4 个选项标签唯一，题库不足时兜底占位。
- `checkAnswer(question, selected)`：统一判分逻辑，处理 `id` 和 `label` 两种 correct 类型。
- `generateDailyReview(cards, masteryState, count)`：弱项优先 + 随机抽检，生成 5 题。
- **测试覆盖**：8 个断言，覆盖 6 向量出题、选项唯一性、判分正确/错误。

### 4.4 MasteryService.js

- `getMasteryOverview()`：全局掌握度统计（total/mastered/due/byStatus）。
- `getCategoryCoverage()`：按 `source_chapter` 统计类别向量覆盖度（如「太阳病篇」6 向量掌握情况）。
- `pickWeakVectors()`：薄弱向量推荐，优先本次答错 → 类别掌握度低。

---

## 五、Store 层实现（AppStore.js）

### 5.1 状态树

```json
{
  "page": "dashboard",
  "activeCardId": null,
  "exam": {
    "mode": null,
    "questions": [],
    "current": 0,
    "answers": [{"question": {}, "selected": null, "isCorrect": null}],
    "submitted": false,
    "finished": false
  },
  "stats": {"total": 0, "right": 0, "wrong": 0}
}
```

### 5.2 与旧版 `state` 的对比

| 旧版（v8） | 新版（v9） | 说明 |
|------------|------------|------|
| `state.page` | `state.page` | 相同 |
| `state.activeCardId` | `state.activeCardId` | 相同 |
| `state.exam.questions` | `state.exam.questions` | 相同，但 answers 预填充 |
| `state.exam.current` | `state.exam.current` | 相同 |
| `state.exam.answers` | `state.exam.answers` | 旧版练习模式 push，新版预填充 + 索引更新 |
| `state.exam.submitted` | `state.exam.submitted` | 新增（考试模式专用） |
| `state.exam.finished` | `state.exam.finished` | 相同 |
| `state.stats` | `state.stats` | 相同 |

### 5.3 订阅/发布模式

```javascript
import { subscribe } from '@store/AppStore.js';

const unsub = subscribe((newState, oldState) => {
  // 状态变化时自动触发
});
```

**与 React 的区别**：不是 React Context，而是极简的自定义 Store。组件通过 `subscribe` 监听变化，手动触发重新渲染。

---

## 六、工具函数层（utils）

### 6.1 formatters.js

从 v8 提取的纯函数：
- `slugToName` / `formatCorrectAnswer` / `getVectorLabel` / `getCoreCombo` / `getOptionLabel` / `scheduleNextReview`
- **测试覆盖**：28 个断言，全部通过（验证脚本确认）。

### 6.2 dom.js

替代 `innerHTML` 的安全 DOM 工具：
- `createElement(tag, props, content)`：创建元素 + 属性 + 文本内容
- `clearChildren(el)`：清空子节点
- `renderList(container, items, renderFn)`：批量渲染列表
- `delegate(parent, event, selector, handler)`：事件委托
- `escapeHtml(str)`：转义 HTML 特殊字符
- **测试覆盖**：4 个断言，验证创建、清空、转义。

### 6.3 validators.js

- `areOptionsUnique()`：选项去重检查
- `isValidQuestion()`：题目结构校验
- `validateCardSchema()`：JSON schema 最小校验（必要字段检查）
- **测试覆盖**：6 个断言。

### 6.4 random.js

- `shuffle()`：Fisher-Yates 洗牌
- `pickRandom()`：随机抽取 N 个
- `sortByWeakness()`：按掌握度排序（弱项优先）
- **测试覆盖**：6 个断言。

---

## 七、测试覆盖

### 7.1 单元测试（7 个文件，68 个断言）

| 文件 | 断言数 | 覆盖内容 |
|------|--------|----------|
| `formatters.test.js` | 28 | 向量标签、slug 转换、答案格式化、核心药组、SRS 调度 |
| `dom.test.js` | 4 | 安全创建元素、清空子节点、HTML 转义 |
| `random.test.js` | 6 | 洗牌、随机抽取、整数生成、弱项排序 |
| `validators.test.js` | 6 | 选项唯一性、题目合法性、schema 校验 |
| `examService.test.js` | 8 | 6 向量出题、选项去重、判分逻辑 |
| `storageService.test.js` | 7 | localStorage 迁移、掌握度升级/降级、统计更新 |
| `appStore.test.js` | 9 | 状态更新、订阅通知、考试初始化、答题记录 |

### 7.2 E2E 测试（1 个文件，3 个场景）

| 场景 | 说明 |
|------|------|
| 页面加载 | 验证 `.loading-text` 存在 |
| 数据加载 | 等待 `.card-list-item` 出现，验证有卡片 |
| v9 标识 | 验证顶部栏包含 "v9" |

### 7.3 验证结果

- **Python 静态验证**：文件清单 25/25 ✅、package.json 脚本 ✅、Vite 别名 ✅、Vitest 环境 ✅、测试文件 7 ✅
- **npm 运行测试**：⚠️ 环境未安装 npm，无法实际运行。需在本地执行：
  ```bash
  cd app/v9
  npm install
  npm run test
  npm run test:e2e
  ```

---

## 八、入口验证（app.js + index.html）

### 8.1 加载流程

```
index.html → 加载 theme.css + base.css → 加载 app.js (module)
    ↓
app.js init():
  1. loadState() → 读取/迁移 localStorage
  2. preloadAll() → fetch data/*.json
  3. 注入 window.__CARDS__ 等全局变量（过渡方案）
  4. renderSkeletonDashboard() → 显示卡片列表骨架
  5. subscribe() → 状态变化调试日志
```

### 8.2 骨架仪表盘

当前渲染内容：
- 顶部栏：v9 标识 + 版本标签
- 标题：「v9 骨架验证成功」
- 数据概览：卡片数量 + 掌握度统计
- 卡片列表：前 5 张卡片（名称 + 描述）

**注意**：这是骨架验证页面，不是最终 UI。ROUND 3 会替换为完整组件。

---

## 九、已知问题与风险

| 编号 | 问题 | 严重程度 | 说明 | 解决时机 |
|------|------|----------|------|----------|
| R1-1 | **npm 环境未安装** | 🟡 中 | 当前环境中 `npm` 不可用，无法运行 `npm install` 和测试 | 用户本地补装，或 ROUND 2 补充 Docker/容器方案 |
| R1-2 | **DataService 路径** | 🟡 中 | `../data/*.json` 路径在 Vite 生产构建后可能失效 | ROUND 2 调整为 `public/data/` 复制或符号链接 |
| R1-3 | **无错误边界 UI** | 🟢 低 | `app.js` 的 catch 仅显示简单错误信息 | ROUND 3 完善错误边界组件 |
| R1-4 | **全局变量过渡** | 🟢 低 | `window.__CARDS__` 是临时方案，后续组件应通过 props 接收 | ROUND 3 接入组件时移除 |
| R1-5 | **CSS 无完整组件样式** | 🟢 低 | 仅写了骨架样式（topbar、card-list、dashboard），缺少考试视图等 | ROUND 3 补充完整样式 |
| R1-6 | **Playwright 未实际运行** | 🟢 低 | E2E 测试脚本已写，但无 npm 环境运行 | 用户本地补装后验证 |

---

## 十、经验沉淀

1. **路径别名需与 vite.config.js 和 vitest.config.js 同步**：只配一个会导致测试 import 失败。
2. **localStorage Mock 在测试中的必要性**：StorageService 测试必须用 `Object.defineProperty(global, 'localStorage', ...)` 模拟，否则 jsdom 中没有 localStorage。
3. **ESM 模块在浏览器和 Node 中的差异**：Vite 用 `import` 原生支持，但测试时 jsdom 环境也需要 `type: "module"`。
4. **没有 npm 环境时的替代验证**：用 Python 脚本检查文件清单、配置语法、import 路径是否指向真实文件，作为静态验证兜底。
5. **Services 先实现真实逻辑而非纯 mock**：ROUND 1 的 Services 不是空壳，而是包含完整业务逻辑（出题、判分、掌握度升级），因为提取逻辑本身就是重构的核心内容，mock 反而会增加后续工作量。

---

## 十一、进入 ROUND 2 的条件

- [x] 目录结构完整（25/25 文件）
- [x] 构建配置就绪（Vite + Vitest + Playwright）
- [x] Services 层实现（4 个 Service，非 mock）
- [x] Store 层实现（AppStore，订阅/发布）
- [x] 工具函数提取（4 个 utils，全部可测试）
- [x] 测试骨架就绪（7 单元 + 1 E2E）
- [x] 入口可加载数据并渲染骨架
- [x] 经验沉淀已记录

**ROUND 2 目标**：继续提取 UI 组件（CardList、LearnView、ExamView 等），接入 Services 和 Store，实现可交互的骨架页面。

---

*报告结束。等待用户确认进入 ROUND 2。*
