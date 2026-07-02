# CHM 资料清洗与数据收集 · 第一性原理

> **版本**：v1.0  
> **日期**：2026-06-14  
> **状态**：预先规划文档，尚未执行清洗  
> **范围**：`raw/annotations-chm/` 下待清洗的四个 CHM 目录：
> - `3伤寒金匮经方`
> - `57冯世纶教授经方师承`
> - `60倪海厦大师经方讲座`
> - `64伤寒系列`
>
> **本档定位**：后续讨论这四个 CHM 怎么清洗、怎么入库时，先回到这里。

---

## 一、为什么要从第一性原理出发

我们已经做过一轮黄煌 CHM 的清洗，也积累了工程经验。如果直接复制黄煌脚本去洗另外四个 CHM，会踩很多同样的坑：编码假设、作者写死、内容 DIV 不一致、分类规则不适用、医案与讨论混淆等。

所以先退一步，问三个问题：

1. **我们最终要什么？**
   - 学习系统的核心资产是三类卡片：`formula_card`（方剂）、`source_card`（条文）、`experience_card`（经验/医案）。
   - 外部资料的价值是**补强**这三类卡片，而不是替代《伤寒论》原文层。

2. **这些 CHM 本质上是什么？**
   - 它们是**前人博客/讲座/医案讨论**的 HTML 合集，编码多为 GB 系列，结构松散，含导航、广告、网友评论等噪音。
   - 不同 CHM 的博客平台不同（新浪博客 vs QQ 空间），正文容器不同，元数据标签不同。

3. **什么样的流程能让机器批量处理 + 人工可控审阅？**
   - 必须分阶段：归档 → 清洗 → 抽样验证 → 结构化提取 → 候选生成 → 人工审阅 → 分类型入库。
   - 每个阶段都要有**可量化验收标准**和**回退机制**。

---

## 二、第一性原理：四条铁律

### 2.1 原始素材只读，提取产物另存

- `raw/` 下的任何东西都是档案，移动后不再修改内容。
- 清洗后的 Markdown、提取出的候选、生成的卡片，全部放到 `extracted/` 或 `data/`。
- 这条规则保证“如果清洗错了，可以重新来”。

### 2.2 来源层永远高于内容层

- 每条进入系统的经验/条文/方解，都必须能回答：**这是谁说的？出自哪篇文章？原始链接是什么？**
- 必须区分：
  - **经典原文**（《伤寒论》《金匮要略》）
  - **注家讲解**（倪海厦、冯世纶、胡希恕、JT 等）
  - **医案记录**（患者、处方、疗效）
  - **网友评论/整理者解析**
- 后世注家的观点不能覆盖经典层，只能作为 `references` 或 `experience_cards`。

### 2.3 先分类，再清洗，再提取

- 不要拿到 HTML 就全文清洗。先按文件级主题粗分（医案 / 条文讲解 / 讲座 / 转载），再决定清洗策略。
- 不同类别的产出目标不同：
  - 医案 → `experience_card`
  - 条文讲解 → `source_card` / `formula_card.references`
  - 讲座 → `references` + 可能的 `experience_card`
  - 专题整理 → 可能生成新的 `source_card` 或对比素材

### 2.4 小样本验证，再批量放大

- 每个 CHM 先抽 5–10 个代表性文件，跑通“清洗 → 提取 → 候选 → 审阅”全链路。
- 人工抽检错误率 <10% 后，再批量跑全部。
- 这条规则避免“一跑 1563 个文件，审阅成本爆炸”。

---

## 三、标准流程

```text
raw/annotations-chm/<CHM名>.chm
        │
        ▼ 解包（已存在于 raw/extracted-chm/<CHM名>/）
raw/extracted-chm/<CHM名>/<内层目录>/*.html
        │
        ├─► 文件级主题粗分（医案 / 条文 / 讲座 / 专题 / 其他）
        │
        ▼ 来源感知清洗
extracted/<CHM名>/cleaned/<主题>/<标题>.md
        │
        ▼ 生成 catalog.json / catalog.md
        │
        ├─► 规则分析器 / LLM 结构化提取
        │
        ▼ 候选卡片（source_card / formula_element / experience）
extracted/source_cards/batch_*.md
extracted/formula_elements/batch_*.md
extracted/experiences/batch_*.md
        │
        ▼ 人工审阅（scripts/card_manager.py）
        │
        ▼ 采纳后写入
.agents/skills/text-to-cards/data/*.json
        │
        ▼ 同步镜像
数据/data/*.json
```

---

## 四、各环节规范

### 4.1 归档规范

| 类型 | 位置 | 规则 |
|---|---|---|
| CHM 源文件 | `raw/annotations-chm/` | 不解压、不修改 |
| 解压后的 HTML | `raw/extracted-chm/<CHM名>/` | 保留原始目录结构 |
| 临时/待确认文件 | `raw/archive/` | 命名清晰，附说明 |
| 清洗产物 | `extracted/<CHM名>/cleaned/` | 按主题分子目录 |
| 提取产物 | `extracted/source_cards/` 等 | 按批次生成 Markdown |

### 4.2 清洗规范

1. **编码自动回退**：`gb18030` → `gbk` → `gb2312` → `utf-8`。
2. **来源感知提取**：先识别博客平台（Sina / QZone / 其他），再选择正文容器 DIV。
3. **去噪**：删除 `<script>`、`<style>`、导航、广告、网友评论（除非目标就是收集讨论）。
4. **保留元数据**：每篇 Markdown 顶部必须包含：
   - `title`
   - `category`（主题分类）
   - `author`
   - `date`
   - `source_url`
   - `original_file`
   - `cleaned_path`
   - `word_count`
5. **生成目录**：`catalog.json` + `catalog.md`，方便人工快速浏览。
6. **抽样验证**：每个 CHM 清洗后，人工抽检 5% 的篇目，确认正文完整、元数据正确。

### 4.3 提取规范

1. **范围清单先行**：从 `config/scope_*.txt` 加载方名、症状、药物清单。
2. **路由规则**：
   - 条文讲解 → `source_card`
   - 完整方剂介绍 → `formula_element`
   - 医案/病例 → `experience_card`
   - 讲座/专题 → 先拆成上述三类再路由
3. **结构化字段**：
   - `source_card`：`source` / `chapter` / `text` / `mentioned_formulas` / `symptoms`
   - `formula_element`：`name` / `herbs` / `symptom_profile` / `pathology` / `contraindications`
   - `experience_card`：`patient_profile` / `chief_complaint` / `signs` / `physician_formula` / `herbs_dosage` / `outcome` / `physician_rationale` / `author_type`
4. **稳定 ID**：基于 `来源 + 位置 + 文本前 200 字` 的 SHA256，避免重复入库。
5. **置信度标注**：每条候选标注 `high` / `medium` / `low`，优先审阅 low。

### 4.4 审阅规范

1. **抽样 20%**：尤其关注 `confidence: low` 和跨 CHM 重复。
2. **身份校验**：医案必须确认处方来源是“医师本人”还是“网友评论”。
3. **版本控制**：同一方剂若有不同组成，必须分版本记录。
4. **拒绝理由必填**：`reject` 时必须写 `reviewer_note`，便于后续改进提取器。

### 4.5 入库规范

1. **先备份**：修改 `data/*.json` 前备份到 `data/archive/`。
2. **不污染经典层**：只修改 `canonical.references`、`experience_ids`、`empirical_distribution` 等经验层字段。
3. **同步真相源**：根目录 `data/` 是 `.agents/skills/text-to-cards/data/` 的镜像，改完必须同步。
4. **前端冒烟**：入库后刷新 `app/index.html`，确认参考资料、经验卡渲染正常。

---

## 五、四个 CHM 的处理策略

### 5.1 推荐顺序

| 顺序 | CHM | 特点 | 主攻产出 | 先做理由 |
|---|---|---|---|---|
| **1** | **60倪海厦大师经方讲座** | 61 个文件，Sina 博客，讲座/金匮讲解 | `source_card` + `experience_card` | 规模最小，与黄煌同平台，是验证流程的最佳试点 |
| **2** | **57冯世纶教授经方师承** | 264 个文件，Sina 博客，医案 + 胡希恕经验 | `experience_card` | 临床密度高，可验证医案结构化 schema |
| **3** | **64伤寒系列** | 162 个文件，Sina 博客，JT 笔记 + 桂林古本 + 杂录 | `source_card` + 对比素材 | 可补充条文和易混淆方对比 |
| **4** | **3伤寒金匮经方** | 1563 个文件，**QZone 博客**，医案/文章为主 | `experience_card` + `source_card` | 规模最大、最杂，放在最后攻坚 |

### 5.2 每类 CHM 的关键预处理

#### Sina 博客类（60、57、64）

- 正文容器：`sina_keyword_ad_area2` 或 `articalContent`
- 元数据：`分类:` / `日期:` / `原文地址:`
- 作者默认值：根据 CHM 主题设置（倪海厦 / 冯世纶 / JT 等）

#### QZone 博客类（3）

- 正文容器：`blogDetailDiv`
- 元数据：需要单独探索（可能用 `分类:` / `时间:`）
- 内容混杂：原创医案、转载、讨论混在一起，需要先按文件名/标题做主题聚类

### 5.3 风险等级

| CHM | 编码风险 | 结构风险 | 审阅风险 | 综合建议 |
|---|---|---|---|---|
| 60 | 低 | 低 | 低 | **立即可以开始试点** |
| 57 | 低 | 中 | 中 | 医案结构化是关键难点 |
| 64 | 低 | 中 | 中 | 内容杂，需要文件级分类 |
| 3 | 中 | 高 | 高 | 必须等流程成熟后再批量处理 |

---

## 六、可复用工具与缺口

### 6.1 可复用工具

| 工具 | 复用方式 |
|---|---|
| `scripts/text_extractors/chm_html_extractor.py` | GB 编码回退、去标签逻辑直接复用 |
| `scripts/extract_pipeline.py` | 扫描、Document 构建、写 Markdown、更新 index.json |
| `scripts/card_manager.py` | 候选生命周期管理 |
| `scripts/check_coverage.py` | 覆盖度检查 |
| `scripts/clean_huanghuang_chm.py` | 编码处理、BeautifulSoup、front matter、catalog 生成逻辑可抽象 |

### 6.2 必须补齐的缺口

1. **通用 CHM 清洗器**：把黄煌脚本中的平台相关逻辑（内容 DIV、作者默认值、分类规则）做成配置。
2. **可配置 scope/词库**：方名、症状、药物、剂量词需要从 `config/` 动态加载。
3. **医案结构化能力**：现有规则分析器太弱，需要“规则粗分 + LLM 抽取 + 人工审阅”。
4. **跨来源去重**：同一方剂/条文/医案可能在多个 CHM 中出现，需要原文哈希去重。
5. **版本控制**：同一方剂的不同组成（如八味除烦汤）需要分版本记录。

---

## 七、落地前必须回答的 5 个问题

1. **是否先做一个通用 CHM 清洗脚本，还是为每个 CHM 单独写脚本？**
   - 建议：先做通用脚本，把黄煌脚本抽象成配置驱动。

2. **`experience_card` 的 schema 是否要扩展？**
   - 必须扩展，否则 57 和 3 的医案无法结构化。

3. **医案结构化是否引入 LLM？**
   - 建议引入。规则分析器无法处理沙龙讨论式医案。

4. **如何处理跨 CHM 重复？**
   - 在候选阶段加入原文去重键（去汉字后哈希或 MinHash）。

5. **目标优先级：先补 source_card 还是 experience_card？**
   - 60/64 主攻 `source_card`；57/3 主攻 `experience_card`。

---

## 八、下一步建议

如果你同意这套思路，建议从以下两步开始：

1. **写一个通用 CHM 清洗脚本配置草案**（不跑数据，只定义配置格式）。
2. **用 60倪海厦大师经方讲座 做试点**：清洗 61 个文件 → 抽样验证 → 提取候选 → 审阅 5–10 条 → 确认 schema。

---

## 九、相关文档索引

- 项目结构规范：`PROJECT-STRUCTURE.md`
- 工程经验记录：`docs/工程经验记录.md`
- 黄煌清洗报告：`docs/黄煌教授经方沙龙_清洗报告.md`
- 黄煌使用方法论：`docs/黄煌教授经方沙龙_使用方法论与实施计划.md`
- 资源清单：`RESOURCES.md`
- 项目活地图：`INDEX.md`
