# 项目进度快照 · 2026-06-14

**记录人**：Kimi Code CLI  
**项目**：经方学习系统 v8（旧版）  
**入口**：`http://localhost:8000/app/index.html`  
**本地服务**：`python -m http.server 8000`

---

## 一、当前已完成

### 1. 数据层
- 35 张 `formula_card`，覆盖 36 个太阳病目标方（麻杏甘石汤为别名合并）。
- 35 张 `source_card` 与 formula_card 一一对应。
- 1 张 `experience_card`（桂枝汤示例）。
- `data/core_herbs_research.json`：35 条核心药物组合研究记录，10 条附带来源链接。
- `formula_cards.json` 的 `canonical` 中新增 `core_herbs` / `core_combinations` / `core_rationale` / `core_sources` / `core_source_urls`。

### 2. 前端层（`app/index.html`）
- 学习视图：原文、症状谱、核心药物组合、药物组成（剂量可点击显示/一键切换）、病机、禁忌、煎服法（后三者默认隐藏）、参考资料链接。
- 练习模式：单卡练习、类方练习（按标签/章节/来源相似度抽取类方），选完即时出答案。
- 考试模式：随机卡片/向量，提交后统一判分，显示结果面板与错题回顾。
- 考试导航：上一题/下一题/提交，返回已答题不重复计分。
- 选项反馈：正确绿色、错误红色。
- 每日复习：弱项优先 5 题。
- Kimi 导师入口：一键复制带上下文的 prompt。
- localStorage 持久化：`sh_index_v1_state`。

### 3. 文档
- `MISSION.md`、`RESOURCES.md`、`AGENTS.md` 已建立。
- `docs/v8_smoke_test.md` 记录基础冒烟测试。
- `docs/snapshot_2026-06-13_core_herbs.md` 记录本轮升级全过程。
- `docs/工程经验记录.md` 已存在，本轮经验将追加。

---

## 二、本轮新增的关键文件

| 文件 | 说明 |
|---|---|
| `data/core_herbs_research.json` | 35 条核心药物组合研究记录 |
| `docs/snapshot_2026-06-13_core_herbs.md` | 本轮升级快照 |
| `docs/progress_snapshot_2026-06-14.md` | 本文件 |
| `data/formula_cards.json.bak_20260613_core` | 核心组合升级前备份 |
| `data/formula_cards.json.bak_20260613_links` | 参考资料链接注入前备份 |
| `app/index.html.bak_20260613_core` | 核心组合升级前备份 |
| `app/index.html.bak_20260613_nav` | 导航升级前备份 |
| `app/index.html.bak_20260613_exam_mode` | 练习/考试模式升级前备份 |

---

## 三、仍未完成的关键步骤（部署与产品化）

1. **部署**：静态文件尚未发布到 GitHub Pages / Netlify / Vercel。
2. **移动端**：`app/mobile.html` 未同步最新逻辑。
3. **条文与笔记集成**：`source_cards.json` 和老师小红书笔记未在学习页完整展示。
4. **医案解锁**：`experience_cards.json` 仅 1 张，解锁逻辑未实现。
5. **范围扩展**：仅覆盖太阳病类方，未进入阳明、少阳、太阴、少阴、厥阴。
6. **工程化**：`app/index.html` 仍是单文件大脚本，缺少模块拆分、测试、CI/CD。
7. **数据同步**：localStorage 仅限单浏览器，无导出/导入/云端同步。
8. **AI 导师**：仍停留在复制 Prompt，未实现一键唤起 Kimi。

---

## 四、下一步建议优先级

1. **立刻**：部署到静态托管平台，让网页可访问。
2. **本周**：把 `source_cards.json` 和老师小红书笔记接入学习页。
3. **下周**：工程化拆分 + 写测试 + 同步移动端。
4. **长期**：扩展六经卡片 + 医案解锁 + 云端同步。
