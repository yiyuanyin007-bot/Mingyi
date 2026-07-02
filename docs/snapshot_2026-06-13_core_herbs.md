# 项目快照：核心药物组合升级 + 学习/考试模式（已完成）

**时间**：2026-06-13 11:30 (CST)  
**项目根目录**：`C:\Users\Chen\Desktop\经方学习系统（旧版）`  
**本地服务**：`python -m http.server 8000`（任务 `bash-blblwpna`）

---

## 当前焦点

1. ✅ 将「方名→药物」题型从“单味首药”升级为“核心药物组合”。
2. ✅ 学习视图增加交互：药物剂量点击显示 / 一键显示全部；病机、禁忌、煎服法默认隐藏，点击显示。
3. ✅ 区分“练习”与“考试”模式：
   - 练习：单卡练习、类方练习，选完即时出答案。
   - 考试：随机卡片/向量，提交后统一判分并给出错题回顾。
4. ✅ 考试模式支持上一题 / 下一题导航。
5. ✅ 检索经方派（jingfangpai.cn）黄煌文章，丰富核心组合来源。

---

## 已完成工作

- **Phase 1 基础修复**：`app/index.html` localStorage 持久化、SRS、每日复习、Kimi 弹窗、判分 bug 修复。
- **Phase 2 扩卡到 25 张**：`data/formula_cards.json` / `source_cards.json`。
- **Phase 3 冒烟测试**：`docs/v8_smoke_test.md`。
- **Phase 4 文档**：`MISSION.md`、`RESOURCES.md`、`AGENTS.md`，Kimi 入口。
- **Phase 2b 补齐目标方**：新增 10 张，当前 **35 张 formula_card / 35 张 source_card**，`data/sun_target_formulas.json` 36/36 覆盖。
- **选项去重**：修复 `generateOptions()`，用 `Set` 保证同一题型下 4 个选项标签唯一。
- **核心药物组合升级**：
  - 新增 `data/core_herbs_research.json`，汇总 35 张卡片的核心药物组合、rationale 与来源。
  - 将核心组合注入 `data/formula_cards.json` 的 `data.canonical`。
  - 重构 `app/index.html`：
    - 新增 `getCoreCombo()` / `getOptionLabel()` 辅助函数；
    - `0→2` 题题干改为“核心药物组合是？”，正确答案与选项均为组合；
    - 新增 `2→0` 题“药物组合‘…’对应哪个方？”；
    - 学习视图增加“核心药物组合”展示；
    - Kimi prompt 增加核心组合字段。
- **浏览器冒烟测试**：通过 WebBridge 打开 `http://localhost:8000/app/index.html`，验证桂枝汤、小青龙汤的 `0→2` / `2→0` 题型均显示核心组合且选项不重复。
- **学习视图交互升级**：
  - 药物组成默认只显示药名，剂量需点击单个药格显示，或点击“显示全部剂量”一键切换。
  - 病机、禁忌、煎服法默认隐藏，点击“显示”按钮后展开。
- **练习 / 考试模式升级**：
  - 学习视图按钮改为：单卡练习、类方练习、模拟考试。
  - 仪表盘新增“模拟考试”入口。
  - `startPractice(cardId)`：单卡即时反馈练习。
  - `startPracticeSimilar(cardId)`：按标签/章节/来源相似度抽取类方，混合出题。
  - `startExamMode(count)`：随机抽取卡片与向量，生成考试卷；`state.exam.answers` 预填充，选择时不判分。
  - `submitExam()`：提交后统一判分，更新统计与掌握度，显示结果面板与错题回顾。
  - `updateMasteryAfterAnswer` 改为按 `question.cardId` 更新，修复跨卡抽题时的掌握度归属 bug。
- **考试导航与反馈升级**：
  - 新增 `previousQuestion()` / `applyAnswerUI()` / `renderExamNav()`。
  - 练习模式：答题后才可进入下一题；返回已答题时自动恢复选项状态与反馈，避免重复计分。
  - 考试模式：未提交时可在题目间自由切换，最后一题显示“提交试卷”。
  - 提交后进入结果面板，可点击“回顾题目”逐题查看，或“返回首页”。
  - 选项反馈颜色改为：正确绿色边框/背景，错误红色边框/背景，视觉区分更明显。
- **来源补充与卡片链接**：
  - 检索经方派 https://www.jingfangpai.cn/ 中黄煌相关文章，为 10 个核心方（桂枝汤、大青龙汤、麻杏石甘汤、白虎汤、大柴胡汤、小建中汤、五苓散、真武汤、小柴胡汤、葛根汤）添加 `source_urls` 与“经方派（黄煌）”来源。
  - 将 `source_urls` 注入 `data/formula_cards.json` 的 `data.canonical.core_source_urls`。
  - 学习视图新增“参考资料”板块，以可点击链接形式展示；无链接的卡片自动隐藏该板块。

---

## 待办事项

- [x] 整理全部 35 张卡片的核心药物组合表（来源、说法、组合）。
- [x] 在 `data/formula_cards.json` 的 `data.canonical` 中新增 `core_herbs`（列表）与 `core_combinations`（组合描述）。
- [x] 新增 `data/core_herbs_research.json`，集中保存检索来源与说法。
- [x] 修改 `app/index.html` 的 `generateOptions()`，使 `0→2`（方名→药物）题从 `core_combinations` 出题，并保证组合标签不重复。
- [x] 同步 `2→0`（药物→方名）题也使用核心组合作为题干。
- [x] 备份后冒烟测试。
- [x] 学习视图：药物剂量点击显示 / 一键显示全部。
- [x] 学习视图：病机、禁忌、煎服法默认隐藏，点击显示。
- [x] 检索经方派（jingfangpai.cn）并补充核心组合来源。
- [x] 考试模式：上一题 / 下一题导航。
- [x] 练习 / 考试模式区分：单卡练习、类方练习、模拟考试、提交后统一判分。
- [ ] `mobile.html` 与 `clinical/` 医案接入保持低优先级。

---

## 关键设计决策

- **核心药物 ≠ 单味君药**：经方记忆常以“药对 / 药组”为主，例如：
  - 桂枝汤：桂枝 + 芍药（调和营卫）
  - 麻黄汤：麻黄 + 桂枝 + 杏仁（辛温发汗、宣肺平喘）
  - 小柴胡汤：柴胡 + 黄芩（和解少阳）
  - 小青龙汤：麻黄 + 桂枝 + 干姜 + 细辛 + 五味子（外散风寒、内温化饮）
  - 大承气汤：大黄 + 芒硝 + 厚朴 + 枳实（峻下热结）
  - 四逆汤：附子 + 干姜 + 甘草（回阳救逆）
- 题面将显示组合，选项也为组合，降低“首药”猜测概率。
- `getCoreCombo()` 提供向后兼容：若卡片没有 `core_combinations`，自动退回到 `herbs[0].name`。

---

## 相关文件

| 文件 | 状态 |
|------|------|
| `app/index.html` | 已升级为核心组合出题；新增 `getCoreCombo`/`getOptionLabel`；学习视图展示核心组合并支持点击显示剂量/病机/禁忌/煎服法；区分单卡练习、类方练习、模拟考试三种模式；考试模式支持上一题/下一题导航与提交后统一判分。 |
| `data/formula_cards.json` | 35 张卡片均已注入 `core_herbs` / `core_combinations` / `core_rationale` / `core_sources`；10 张卡片额外注入 `core_source_urls`。 |
| `data/core_herbs_research.json` | 新增，35 条核心组合研究记录。 |
| `data/source_cards.json` | 35 张，正常。 |
| `data/sun_target_formulas.json` | 36 目标方已覆盖。 |
| `docs/v8_smoke_test.md` | 基础冒烟测试文档。 |

---

## 冒烟测试结果

- WebBridge 会话：`jingfang-core-test` / `jingfang-ui-test`，均已关闭。
- 核心组合题型：
  - 桂枝汤 `0→2`：题干“桂枝汤的核心药物组合是？”，正确选项“桂枝、芍药”，干扰项为其他方核心组合且无重复。
  - 桂枝汤 `2→0`：题干“药物组合‘桂枝、芍药’对应哪个方？”，选项为四个方名。
  - 小青龙汤 `0→2`：题干“小青龙汤的核心药物组合是？”，正确选项“麻黄、桂枝、干姜、细辛、五味子”，干扰项不重复。
- 学习视图交互：
  - 药物组成初始仅显示药名；点击“显示全部剂量”后所有剂量出现，按钮变为“隐藏全部剂量”。
  - 点击单个药格可切换该药剂量显示。
  - 病机、禁忌、煎服法初始隐藏，点击“显示”后展开内容。
- 练习 / 考试模式：
  - 单卡练习：mode=practice-card，共 5 题，答完第一题后显示“下一题”。
  - 类方练习：mode=practice-similar，共 8 题（桂枝汤 + 3 个相似方各 2 题）。
  - 模拟考试：mode=exam，随机 5 题；选择后只记录不判分；最后一题显示“提交试卷”。
  - 提交后显示结果面板（如“2 / 5 正确”）与错题回顾。
  - 考试自由导航：未提交时可在题目间切换。
- 考试导航：
  - 第 1 题未答题时：仅“下一题”（禁用）。
  - 第 2 题未答题时：“上一题”可用，“下一题”禁用。
  - 答题后：两个按钮均可用；返回上一题时保留已答状态，不会重复计分。
  - 最后一题：显示“上一题 / 完成”（练习）或“上一题 / 提交试卷”（考试）。
- 选项颜色反馈：
  - 正确选项：绿色边框 + 浅绿背景。
  - 错误选项：红色边框 + 浅红背景。
  - 已截图验证练习模式答错场景。
- 参考资料链接：
  - 桂枝汤学习视图出现“参考资料”板块，链接指向 https://www.jingfangpai.cn/p/10056069/。
  - 无链接的卡片不显示该板块。
- 结论：核心药物组合题型、学习视图交互、练习/考试模式、导航、颜色反馈与参考资料链接均已正常运作。

---

## 备注

- 权威来源倾向：《伤寒论》原方、《医宗金鉴·删补名医方论》、百度健康/百度百科、知乎/黄煌观点、经方派 https://www.jingfangpai.cn/。
- 别名处理：麻杏甘石汤 = 麻黄杏仁甘草石膏汤，已合并不重复建卡。
- 备份文件：`data/formula_cards.json.bak_20260613_core`、`data/formula_cards.json.bak_20260613_links`、`app/index.html.bak_20260613_core`、`app/index.html.bak_20260613_nav`、`app/index.html.bak_20260613_exam_mode`。
