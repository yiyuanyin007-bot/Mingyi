# 交互需求文档 —— 由方剂卡片对话提交给操作系统对话执行

> 文档编号：REQ-2024-INTERACTION-01  
> 编写者：方剂卡片对话（数据层）  
> 执行者：操作系统对话（交互层）  
> 用户转交方式：请将此文件转发给"操作系统"对话，要求它读取后执行  
> 生成时间：本次会话

---

## 1. 当前状态总览

### 1.1 已完成的交互（已在 index.html 中，无需改动）

| 功能 | 状态 | 验证位置 |
|---|---|---|
| 药名点击 → 类方弹窗（`onHerbClick`） | ✅ 已实现 | `index.html:3670` |
| 弹窗内"去学习"跳转（`handleModalGoToLearn`） | ✅ 已实现 | `index.html:3764` |
| 方剂名点击 → 方剂弹窗（`onFormulaClick`） | ✅ 已实现 | `index.html:3769` |
| 痕迹记录（`recordTrace`） | ✅ 已实现 | `index.html:3513` |
| 今日学习报告弹窗（`showDailyReport`） | ✅ 已实现 | `index.html:3794` |
| 导出学习数据（`exportTraces`） | ✅ 已实现 | `index.html:3642` |
| 导出按钮在报告弹窗中 | ✅ 已放置 | `index.html:3801` |

### 1.2 待完成的交互（需要操作系统对话执行）

| 需求 ID | 描述 | 优先级 |
|---|---|---|
| REQ-01 | 在今日学习报告弹窗中添加"导入学习数据"按钮 | P0 |
| REQ-02 | 在今日学习报告弹窗中添加"重置学习进度"按钮（需确认弹窗） | P0 |
| REQ-03 | 弹窗内点击"去学习"时记录 `user_action` 痕迹 | P1 |
| REQ-04 | 确认今日学习按钮在 topbar 的显隐逻辑（学习页隐藏） | P2 |

---

## 2. 需求详细说明

### REQ-01：添加"导入学习数据"按钮

**当前状态**：
`showDailyReport()` 弹窗只有"导出学习数据"和"关闭"两个按钮。

**期望行为**：
在"导出学习数据"按钮旁边添加一个"导入学习数据"按钮。点击后：
1. 创建一个隐藏的 `<input type="file" accept=".json">`
2. 触发文件选择
3. 读取文件内容，调用 `importTraces(jsonText)`（此函数已存在于 `index.html:3653`）
4. 导入成功后显示提示（可用 `showModal` 或 `alert` 简单提示）
5. 刷新页面或重新渲染报告

**参考代码**（`importTraces` 已存在，只需添加触发按钮）：

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
      importTraces(text);  // 已存在的函数
      showModal(`<div class="modal-title">✅ 导入成功</div><div class="modal-body">学习数据已恢复。</div><div class="modal-actions"><button class="modal-btn" onclick="closeModal()">关闭</button></div>`);
    } catch (err) {
      showModal(`<div class="modal-title">❌ 导入失败</div><div class="modal-body">${err.message}</div><div class="modal-actions"><button class="modal-btn" onclick="closeModal()">关闭</button></div>`);
    }
  };
  input.click();
}
```

**验收标准**：
- [ ] 在今日学习报告弹窗中能看到"导入学习数据"按钮
- [ ] 点击后弹出文件选择框（只接受 .json）
- [ ] 选择之前导出的 `sh_traces_YYYY-MM-DD.json` 文件后，数据被正确导入
- [ ] 导入后刷新页面，学习痕迹不丢失

---

### REQ-02：添加"重置学习进度"按钮

**当前状态**：
没有重置按钮。用户如果想清空学习数据，只能通过浏览器控制台操作 `localStorage.removeItem('sh_traces')`，这不符合"零门槛"要求。

**期望行为**：
在今日学习报告弹窗中添加"重置学习进度"按钮。点击后：
1. 弹出确认弹窗："确定要清空所有学习痕迹吗？此操作不可恢复。"
2. 用户确认后，执行 `localStorage.removeItem(TRACE_KEY)` 和 `localStorage.removeItem('sh_index_v1_state')`
3. 刷新页面

**参考代码**：

```javascript
// 在 showDailyReport() 的 html 字符串中，关闭按钮旁边添加：
html += `<button class="modal-btn" style="color:var(--error);" onclick="resetLearningProgress()">重置学习进度</button>`;

// 在全局作用域添加函数：
function resetLearningProgress() {
  showModal(`<div class="modal-title">⚠️ 确认重置</div><div class="modal-body">确定要清空所有学习痕迹和掌握度数据吗？<br><strong>此操作不可恢复。</strong></div><div class="modal-actions"><button class="modal-btn" style="color:var(--error);" onclick="confirmReset()">确认清空</button><button class="modal-btn" onclick="closeModal()">取消</button></div>`);
}

function confirmReset() {
  localStorage.removeItem(TRACE_KEY);
  localStorage.removeItem('sh_index_v1_state');
  closeModal();
  showModal(`<div class="modal-title">✅ 已重置</div><div class="modal-body">学习进度已清空。页面即将刷新。</div>`);
  setTimeout(() => location.reload(), 1500);
}
```

**验收标准**：
- [ ] 弹窗中有"重置学习进度"按钮（红色文字）
- [ ] 点击后弹出确认对话框
- [ ] 确认后 localStorage 被清空
- [ ] 页面自动刷新，仪表盘显示为初始状态（0 掌握度）

---

### REQ-03：弹窗内点击"去学习"时记录痕迹

**当前状态**：
`handleModalGoToLearn(cardId)` 调用 `goToLearn(cardId)` 后进入学习页，但**没有记录用户从弹窗跳转的行为**。痕迹中只记录了用户点击了药名/方名，但没有记录"从弹窗进入学习页"这个关键动作。

**期望行为**：
在 `handleModalGoToLearn` 函数中添加一行 `recordTrace` 调用。

**参考代码**（只需修改现有函数）：

```javascript
// 当前代码（index.html:3764）
function handleModalGoToLearn(cardId) {
  // 新增：记录从弹窗跳转去学习的行为
  recordTrace('user_action', 'navigate', 'modal_to_learn', cardId, getCard(cardId)?.formulaName || '');
  
  closeModal();
  setTimeout(() => goToLearn(cardId), 50);
}
```

**验收标准**：
- [ ] 用户在类方弹窗或方剂弹窗中点击"去学习"后，在 `localStorage.getItem('sh_traces')` 中能找到一条 `type='user_action', target='navigate'` 的记录

---

### REQ-04：确认今日学习按钮显隐逻辑

**当前状态**：
今日学习按钮（`btnDaily`）在 topbar 中始终显示。用户在学习页时点击它，弹窗会覆盖学习页，但底层逻辑没有处理。

**期望行为**：
在 `switchView` 函数中，当切换到 `learn` 视图时，隐藏 `btnDaily`；当切换到 `dashboard` 或 `review` 时，显示它。

**参考代码**：

```javascript
// 在 switchView 函数中（或 render 时）：
const btnDaily = document.getElementById('btnDaily');
if (btnDaily) {
  btnDaily.style.display = (view === 'dashboard' || view === 'review') ? 'inline-block' : 'none';
}
```

**验收标准**：
- [ ] 在仪表盘和复习页能看到"📊 今日学习"按钮
- [ ] 在学习页该按钮隐藏

---

## 3. 接口契约（数据层 ↔ 交互层）

### 3.1 全局变量（数据层已提供，交互层可直接使用）

| 变量名 | 类型 | 说明 | 来源 |
|---|---|---|---|
| `window.HERB_ALIAS_MAP` | `Object<string, string>` | 药名别名 → 标准名映射 | `herb-aliases.js`（已引入） |
| `window.HERB_CLASS_MAP` | `Object` | 药名 → 类别映射（当前为 `{}`，预留） | `data/herb_alias_map.json`（fetch 失败时为空） |
| `CARDS` | `Array<FormulaCard>` | 35 张方剂卡片 | `data/formula_cards.json` |
| `EXPERIENCES` | `Array<ExperienceCard>` | 医案卡片 | `data/experience_cards.json` |
| `SOURCE_CARDS` | `Array<SourceCard>` | 条文卡片 | `data/source_cards.json` |
| `TRACE_KEY` | `string` | `'sh_traces'` | 全局常量 |
| `recordTrace(type, target, targetName, cardId, formulaName)` | `Function` | 记录痕迹 | `index.html:3513` |
| `getCard(id)` | `Function` | 通过 ID 获取卡片 | `index.html` 中已存在 |

### 3.2 函数契约（交互层已实现，数据层依赖）

| 函数 | 签名 | 说明 |
|---|---|---|
| `showModal(html)` | 接受 HTML 字符串 | 显示弹窗（`index.html:3807`） |
| `closeModal()` | 无参数 | 关闭弹窗（`index.html:3823`） |
| `goToLearn(cardId)` | 接受 cardId | 切换到学习页（`index.html:2533`） |
| `switchView(view)` | 接受视图名 | 切换主视图（`index.html` 中已存在） |
| `escapeHtml(text)` | 接受字符串 | HTML 转义（`index.html` 中已存在） |
| `exportTraces()` | 无参数 | 导出 JSON（`index.html:3642`） |
| `importTraces(jsonText)` | 接受 JSON 字符串 | 导入 JSON（`index.html:3653`） |
| `generateDailyReport(dateStr?)` | 可选日期参数 | 生成日报字符串（`index.html:3614`） |

---

## 4. 已知陷阱与注意事项

### 4.1 file:// 协议限制

- 用户通常**双击 HTML 文件打开**（`file://` 协议），不是通过服务器访问。
- `fetch('../data/herb_alias_map.json')` 在 `file://` 下会**失败**（CORS 限制）。
- 已通过 `<script src="herb-aliases.js">` 解决药名别名加载问题。
- **不要**依赖 `fetch` 加载任何本地 JSON 文件作为唯一路径，必须提供 fallback。

### 4.2 localStorage 键名

- 学习痕迹：`sh_traces`（`TRACE_KEY` 常量）
- 应用状态：`sh_index_v1_state`（包含 `activeCardId`、`theme` 等）
- 重置时必须同时清除这两个键。

### 4.3 弹窗 z-index

- `traceModal` 是动态创建的 overlay，默认在 body 末尾。
- 如果其他组件（如 sidebar、dropdown）有更高的 `z-index`，弹窗可能被覆盖。
- 建议给 `traceModal` 的 CSS 添加 `z-index: 1000`（如果还没有）。

### 4.4 按钮样式

- 所有按钮使用 CSS 变量：`var(--accent)` 主色、`var(--error)` 红色、`var(--bg-panel)` 背景。
- 已定义的按钮类：`.modal-btn`、`.modal-btn.primary`。
- 新增按钮请沿用这些类，保持视觉一致。

---

## 5. 验收测试步骤（用户可执行）

1. **打开** `app/index.html`（双击即可）。
2. **点击 topbar 的"📊 今日学习"** → 弹窗出现。
3. **确认** 弹窗中有三个按钮：
   - [ ] 导出学习数据（蓝色）
   - [ ] 导入学习数据（灰色）
   - [ ] 重置学习进度（红色）
   - [ ] 关闭（灰色）
4. **点击"导入学习数据"** → 弹出文件选择框。
5. **选择之前导出的 `sh_traces_*.json`** → 导入成功提示。
6. **刷新页面** → 学习进度恢复。
7. **点击"重置学习进度"** → 确认弹窗 → 确认 → 页面刷新 → 仪表盘显示为 0。
8. **点击任意药名** → 类方弹窗 → 点击"去学习" → 进入学习页后，打开浏览器控制台（F12）→ `JSON.parse(localStorage.getItem('sh_traces')).traces.filter(t => t.type === 'user_action' && t.target === 'navigate')` → 能看到最近一条记录。
9. **在学习页** → 确认 topbar 上"📊 今日学习"按钮已隐藏。

---

## 6. 修改范围限制

**只允许修改的文件和区域**：
- `app/index.html`：
  - 第 3794-3805 行（`showDailyReport` 函数）
  - 第 3764-3767 行（`handleModalGoToLearn` 函数）
  - 第 3642-3660 行（`exportTraces`/`importTraces` 附近，添加新函数）
  - `switchView` 函数（添加按钮显隐逻辑）
- 不要修改 `data/*.json`。
- 不要修改 `herb-aliases.js`（这是数据层的文件）。

---

**执行完成后，请操作系统对话在文档末尾添加签名字段：**

```
---
执行者：操作系统对话
执行日期：YYYY-MM-DD
完成状态：□ REQ-01 □ REQ-02 □ REQ-03 □ REQ-04
测试验证：□ 通过 □ 部分通过 □ 未测试
备注：
```
