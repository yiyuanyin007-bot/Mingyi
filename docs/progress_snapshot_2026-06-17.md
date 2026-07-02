# 项目进度快照 · 2026-06-17

**记录人**：Kimi Work  
**项目**：经方学习系统 v8（旧版）  
**入口**：`http://localhost:8000/app/index.html`  
**本地服务**：`python -m http.server 8000`  
**检查日期**：2026-06-17

---

## 一、当日完成（24项变更，全部登记于 CHANGELOG）

### 1. 前端层（app/index.html）

| 变更 | 说明 |
|---|---|
| 用户档案解耦 | 所有 localStorage 数据以 `A01_` 前缀存储，支持后续切换账户 |
| 笔记 Markdown 表格 | 新增 `.md-table` CSS + `renderMarkdownTables()` 渲染 |
| 浮动导航按钮 | 右下角 ⬆/N/⬇（回到顶部/跳到笔记/回到底部） |
| 问Kimi 提示词优化 | 生成4结构化笔记（辨证点、混淆方对比表、生理学解读、自测场景题） |
| 临床医案截断修复 | 移除 280 字符强制截断，完整显示医案内容 |
| 药物剂量换算 | 4种标准（教材3g/轻量6g/经方9g/原方15g），药丸式UI |
| 特殊单位换算 | 枚/升/合/铢/个（杏仁0.3-0.5g/枚、半夏130g/升、香豉110g/升等） |
| 剂量解析括号修复 | `parseChineseDosage` 提取括号前纯单位 |
| 点击交互优化 | 剂量区 `stopPropagation`、病机/禁忌/煎服法点击大框架切换 |
| Markdown 渲染修复 | h4标题、列表间距压缩、段落空白 |
| 侧边条文面板 | 方案B：浮动按钮S → 右侧滑出面板，条文卡片+问Kimi+记笔记 |

### 2. 数据层

| 变更 | 说明 |
|---|---|
| batch1 | 8方 references 接入（葛根汤、小建中汤、白虎汤、茯苓四逆汤、大承气汤、麻杏甘石汤、大青龙汤、调胃承气汤） |
| batch2 | 6方桂枝类方 references 接入（桂枝加葛根汤、桂枝加厚朴杏子汤、桂枝去芍药汤、桂枝加附子汤、桂枝麻黄各半汤、桂枝二越婢一汤） |
| batch3 | 7方柴胡/栀子/葛根类方 references 接入 |
| batch4 | 4方边缘方/特殊方 references 接入（干姜附子汤、桃核承气汤、抵当汤、白虎加人参汤）→ **35方全覆盖** |
| 条文校对 | 对 source_cards.json 进行编号补全建议、症状冲突记录、缺失记录建档 |

### 3. 文档治理层

| 文档 | 说明 |
|---|---|
| CHANGELOG.md | 建立 `SH-YYYYMMDD-NNN` 编号体系，当日登记24条变更 |
| 条文系统设计方案.md | 三方案（内联/侧边/弹窗）设计文档 |
| prototype-source-system.html | 条文系统交互原型，供用户点击体验 |
| 条文校对报告.md | 234条条文对照，35张卡片，编号建议与冲突记录 |
| sp_missing_records.md | 24条编号待补、症状冲突、一方多条文待补充 |
| batch1-4_references_report.md | 四批次接入报告，记录数据来源与核心策略 |

---

## 二、合规性整改（当日执行）

| 问题 | 整改动作 |
|---|---|
| batch1-4 未登记 CHANGELOG | 补登 SH-020~SH-023 |
| source_cards 条文校对未登记 | 补登 SH-024 |
| 新增文件无文档编号 | 补登 DOC-004~DOC-011 |
| 临时文件未清理 | 删除根目录及 app 目录共 9 个临时文件 |
| 数据文件版本未更新 | 更新 DATA-001/003 最后变更字段 |
| 进度快照缺失 | 本文件补写（2026-06-17） |

---

## 三、仍待完成（关键遗留）

1. **JSON 验证**：Python 环境不可用，数据文件修改未经 `json.load()` 验证（已通过 `PythonRun` 替代验证）。
2. **浏览器冒烟测试**：本地服务器未启动，侧边条文面板未在浏览器中实际点击测试。
3. **source_cards.json 编号确认**：24条建议编号待陈医生确认（见 `sp_missing_records.md`）。
4. **症状冲突**：大承气汤、白虎汤、调胃承气汤、麻黄杏仁甘草石膏汤等版本差异待确认。
5. **一方多条文扩展**：从太阳病核心方（桂枝汤、麻黄汤）开始，逐条补充遗漏条文。

---

## 四、下一步建议

1. **立刻**：陈医生确认 24条建议编号 + 症状冲突版本 → 完成 source_cards.json 终版。
2. **周二前**：浏览器测试侧边条文面板（点击S → 查看条文 → 问Kimi → 记笔记）。
3. **本周**：补充一方多条文（桂枝汤已映射12条，待补充第16、24、44、45等条）。
4. **长期**：部署到静态托管 + 工程化拆分 + 移动端同步。

---

## 五、方案B条文讲解滑入面板（2026-06-17 后续）

### 实现内容（SH-20260617-036）

| 模块 | 变更 |
|---|---|
| CSS 样式 | 新增 `.anno-card`、`.anno-summary`、`.anno-btn`、`.slide-overlay`、`.slide-panel`、`.slide-panel-header/body/title/meta/close`、`.md-content`、`.md-tag` / `.md-tag-teacher1` / `.md-tag-teacher2`、`.md-quote` 等 30+ 条样式规则。支持暗色主题。 |
| JS 函数 | 新增 `openSlidePanel(idx, title, source, fullText)`、`closeSlidePanel()`、`renderSlideMD(text)`（内置轻量 Markdown 渲染器，无需外部依赖）。 |
| HTML 结构 | 页面底部新增 `slideOverlay` + `slidePanel` DOM 结构。 |
| 渲染逻辑 | `renderReferences` 中 `source_annotations` 改为：200字摘要 + 渐变遮罩 + 「阅读全文 →」按钮。点击按钮打开滑入面板，面板内渲染完整 Markdown。 |
| 交互细节 | ESC 关闭、点击遮罩关闭、× 按钮关闭。打开面板时 `body.panel-open` 禁止滚动。 |
| 标签着色 | 【条文】绿色 pill、【刘渡舟】蓝色 pill、【胡希恕】橙色 pill。 |
| 引用块 | `> ` 开头的行渲染为绿色左侧竖线引用块。 |

### 验证结果

| 检查项 | 结果 |
|---|---|
| 备份 | ✅ `app/archive/index-before-slide-panel-20260617.html` |
| div 标签平衡 | ✅ 408/408（修复前 409/408，修复 `renderSlideMD` 中未闭合 div 字符串） |
| JS 语法 | ✅ Node.js vm.Script 验证通过 |
| HTML 结构 | ✅ `<div>` 61/61 平衡（静态 HTML 部分） |
| 浏览器验证 | ⏳ 本地服务器已启动，待陈医生实际打开 `http://localhost:8000/app/index.html` 点击测试 |

---

*创建者：AI（Kimi Work）*  
*创建时间：2026-06-17*  
*项目根目录：`C:\Users\Chen\Desktop\经方学习系统（旧版）`*
