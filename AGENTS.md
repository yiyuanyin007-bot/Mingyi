# 经方学习系统 v8 · Agent 工作指南

> 本文件面向 Kimi Code CLI 等 AI 助手，说明项目结构、关键约定与常用操作。

---

## 1. 项目根目录

```
C:\Users\Chen\Desktop\经方学习系统（旧版）
```

所有文件操作应以此目录为基准，**不要**随意写入外部路径。

---

## 2. 关键文件说明

| 文件/目录 | 作用 |
|---|---|
| `MISSION.md` | 项目目标、范围、成功标准。 |
| `RESOURCES.md` | 数据来源、核心文件、脚本、备份策略。 |
| `docs/CHANGELOG.md` | 变更登记簿（编号规则：SH-YYYYMMDD-NNN）。 |
| `app/index.html` | 桌面版主入口，优先修改此文件。 |
| `data/formula_cards.json` | 方剂卡片真相源（63 张）。 |
| `data/source_cards.json` | 原文条文卡（398 条）。 |
| `data/experience_cards.json` | 临床医案卡。 |
| `data/sp_cases.json` | 标准化病人（SP）病例（8 例）。 |
| `data/sun_target_formulas.json` | 36 目标方覆盖清单。 |
| `docs/evidence/` | 循证审计系统（报告/工作流/任务看板）。 |
| `standardized-patient/` | SP Skill 体系（SKILL.md + references/）。 |
| `docs/` | 文档与过程记录。 |
| `scripts/` | 自动化脚本。 |
| `archive/` / `app/archive/` / `data/archive/` / `docs/archive/` | 备份目录。 |

---

## 3. 修改前必须做的事（违反任何一条 = 违规）

1. **备份**：
   - 改 `app/index.html` → 复制到 `app/archive/index-before-xxx.html`。
   - 改 `data/*.json` → 复制到 `data/archive/xxx-before-xxx.json`。
   - 改 `docs/*.md` → 复制到 `docs/archive/xxx-before-xxx.md`。
   - **推荐使用**：`python scripts/governance.py backup <file> <reason>` 自动备份到正确目录。
2. **验证 JSON**：修改后用 `python scripts/governance.py check-json <file>` 检查合法性。
3. **验证浏览器**：修改后用 WebBridge 或本地浏览器打开 `http://localhost:8100/app/index.html` 确认无报错。

### 3.1 会话启动强制步骤

每个会话**开始时**必须执行：

1. 读取 AGENTS.md（本文件）→ 了解项目规范
2. 读取 `docs/CHANGELOG.md` → 了解当前变更状态（路径：`docs/CHANGELOG.md`，非根目录）
3. 运行 `python scripts/session_start.py` → 检查项目健康状态

### 3.2 会话结束强制步骤

每个会话**结束时**必须执行：

1. 运行 `python scripts/governance.py end` → 自检清单
2. 确认所有变更已登记、所有备份已存在、所有临时文件已清理
3. 更新 CHANGELOG 统计数字（总变更数、总文档数、已归档数）
4. 较大改动后更新 `docs/progress_snapshot_YYYYMMDD.md`

### 3.3 自动化工具推荐

| 场景 | 推荐命令 | 作用 |
|---|---|---|
| 备份文件 | `python scripts/governance.py backup <file> <reason>` | 自动备份到正确 archive 目录 |
| 验证 JSON | `python scripts/governance.py check-json <file>` | 验证 JSON 合法性 |
| 生成 CHANGELOG 条目 | `python scripts/governance.py entry <reason> <file>` | 生成条目模板 |
| 安全编辑流程 | `python scripts/safe_edit.py <file> <reason>` | 备份+验证+登记建议 |
| 会话启动检查 | `python scripts/session_start.py` | 检查项目健康状态 |
| 会话结束自检 | `python scripts/governance.py end` | 检查清单 |
| 清理临时文件 | `python scripts/governance.py clean-temp` | 删除临时文件 |

---

## 4. 编码与数据约定

### 4.1 前端

- 仅使用原生 HTML/CSS/JS，无构建工具。
- `app/index.html` 通过 `fetch('../data/*.json')` 动态加载数据。
- localStorage 键：`sh_index_v1_state`。
- 6 向量键名固定：`0→1`、`1→0`、`0→2`、`2→0`、`0→usage`、`0→contra`。

### 4.2 卡片 Schema

`formula_card` 必须包含：

```json
{
  "id": "unique-id",
  "type": "formula_card",
  "name": "显示名",
  "formula_name": "方剂名",
  "role": "主方",
  "desc": "简短描述",
  "tags": ["太阳病", "..."],
  "source_chapter": "太阳病篇",
  "source_text_ids": ["{id}-src-001"],
  "lineage": { "base_formula": "...", "variant_path": [], "reference_source": "伤寒论原文" },
  "data": {
    "source_text": "条文原文",
    "canonical": {
      "symptom_profile": { "necessary": [], "common": [], "excluding": [] },
      "pathology": "病机",
      "herbs": [{"name": "...", "dosage": "..."}],
      "usage": "煎服法",
      "contraindications": []
    },
    "empirical_distribution": { "symptom_frequency": {}, "note": "..." },
    "variants": [],
    "allow_multiple": false,
    "mapping_note": ""
  },
  "experience_ids": [],
  "mastery": { "0→1": {...}, ... }
}
```

### 4.3 中文处理

- 所有 JSON/Markdown 文件使用 UTF-8。
- Windows PowerShell 终端中文可能乱码，**以文件内容为准**。

---

## 5. 测试流程

### 5.1 启动本地服务

```powershell
Set-Location -LiteralPath 'C:\Users\Chen\Desktop\经方学习系统（旧版）'
python -m http.server 8100
```

### 5.2 基础冒烟测试

1. 打开 `http://localhost:8100/app/index.html`。
2. 确认卡片列表、今日复习数、已掌握向量数正常。
3. 点击一张卡片 → 学习页 → 开始测试 → 答题 → 反馈正确/错误。
4. 刷新页面 → 进度不丢。
5. 点击「今日复习」→ 生成 5 题 → 答题正常。
6. 点击「问 Kimi」→ 弹窗显示 prompt → 可复制或打开 Kimi。

### 5.3 文档化

每次较大改动后，更新：

- `docs/progress_snapshot_YYYYMMDD.md` 或 `docs/工程经验记录.md`
- `docs/v8_smoke_test.md`（如做了冒烟测试）
- `MISSION.md` / `RESOURCES.md`（如目标或资源发生变化）
- `docs/evidence/task_board.md`（如做了循证审计或文献验证）
- `standardized-patient/references/`（如更新了人格系统、问诊框架或口语表达库）

---

## 6. 常见坑

1. **PowerShell 引号问题**：curl 的 JSON 体建议写入临时文件，用 `@file` 传入。
2. **WebBridge 路径编码**：截图路径避免中文，或截图后立刻搜索磁盘确认位置。
3. **JSON 数组嵌套**：注入 JSON 时注意外层括号，不要 `const CARDS = [` + `json.dumps([...])` 导致双重括号。
4. **浏览器缓存**：修改 `index.html` 后用 `?v=2` 刷新。
5. **localStorage 残留**：测试新 schema 前建议清除浏览器 localStorage。

---

## 8. 禁止行为（违反 = 违规）

- ❌ **修改文件后不备份**
- ❌ **修改 JSON 后不验证语法**
- ❌ **修改后不登记 CHANGELOG**
- ❌ **在项目中留下临时文件**（temp_*.json、tmp_*.txt 等）
- ❌ **修改 CHANGELOG 的编号规则或格式**
- ❌ **删除 archive 目录中的备份文件**
- ❌ **使用外部路径写入文件**
- ❌ **跳过会话启动/结束检查**

---

## 9. 紧急问题处理

如果发现之前的变更**未登记**或**未备份**：

1. 立即追溯补登（推断原日期和编号）
2. 在 CHANGELOG 中注明"补登"
3. 如果无法追溯，创建新的变更记录并注明"追溯登记"
4. 如果 JSON 损坏，从 archive 目录恢复最近的备份

---

## 10. 端口管理铁律

本项目遵循**全局端口治理方案**，所有端口配置必须遵守以下规则：

### 10.1 已分配端口

| 端口 | 用途 | 状态 |
|---|---|---|
| **8100** | 主端口（桌面版） | 活跃 |
| **8101** | 备用端口（手机版/冲突时自动切换） | 活跃 |
| **8102** | 开发端口（v9 Vite） | 预留 |

### 10.2 禁止使用的端口（全局冲突区）

- 3000、5000、8000、8080、8081、9000

这些端口为「默认冲突区」，已被多个项目默认使用，极易引发冲突。**新项目不得使用**。

### 10.3 端口管理规则

1. **启动前必查端口**：运行全局端口检测工具确认目标端口空闲
2. **不使用硬编码默认端口**：如 `python -m http.server` 不带参数会默认使用8000，必须显式指定端口
3. **端口变更必登记**：修改端口后必须更新本项目的 `PORT_CONFIG.md` 和全局 `port-registry.md`
4. **多实例必用备用端口**：如需同时运行两个实例，使用备用端口（8101）
5. **临时测试走8600+**：一次性脚本、POC验证使用8600-8999段，用完释放

### 10.4 启动脚本

```powershell
# 方式1：直接启动（自动检测冲突，冲突时切换8101）
python start_server.py

# 方式2：一键启动（桌面版）
经方学习系统.bat

# 方式3：一键启动（手机版）
经方学习系统-手机版.bat
```

### 10.5 全局协调

- **全局登记簿**：`C:\Users\Chen\Documents\Kimi\Workspaces\项目大管家\port-registry.md`
- **端口检测工具**：`C:\Users\Chen\Documents\Kimi\Workspaces\项目大管家\port_check.py`
- **执行原则**：任何端口变更先登记后执行，先协调后使用

---

## 7. 联系上下文

- 用户（陈医生）是中医临床学习者，下周二开始临床开方。
- 优先考虑「周二前能用的最小闭环」。
- 数据来源优先级：老师小红书笔记 > 本地 `extracted/太阳病.md` > 网络权威中医站点。
