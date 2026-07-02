# 经方学习系统 · 项目索引

> 这是本文件夹的「活地图」。每次回到这个项目时，先读此文件。  
> 最后更新：2026-06-22

---

## 一、人类用法（一句话）

> 把新素材丢进 `素材分拣/`，双击 `素材分拣/处理新素材.bat`，然后双击 `经方学习系统.bat` 学习。

## 二、当前阶段

**阶段**：Phase 4 · 数据架构重构 + 循证审计闭环  
**目标**：构建完整的 398 条条文数据库 + 63 方方剂卡覆盖体系，建立循证审计工作流，推进 v9 组件化重构。  
**核心用户**：陈医生（中医临床学习者）  
**当前可用**：

| 组件 | 状态 | 入口 |
|------|------|------|
| 桌面版前端 | ✅ 可用 | `经方学习系统.bat`（宽屏 + 键盘快捷键） |
| 手机版前端 | ✅ 可用 | `经方学习系统-手机版.bat`（单栏触摸） |
| 动态数据加载 | ✅ 已接入 | `app/index.html` / `app/mobile.html` 从 `data/*.json` 加载，失败回退到演示数据 |
| 本地服务器 | ✅ 已接入 | `start_server.py` / bat 自动启动 |
| 演示卡片数据 | ✅ 63 方 + 398 条条文 + 8 SP 病例 | `data/*.json` + `data/sp_cases.json` |
| 解耦提取管道 | ✅ 已跑通 | `scripts/extract_pipeline.py` → `extracted/index.json` + `extracted/source_cards/` + `extracted/formula_elements/` |
| 候选审阅 | ✅ 可用 | `scripts/card_manager.py`（approve / reject / delete-card / re-extract） |
| 每日复盘 | ✅ 骨架可用 | `scripts/daily_review.py` / `daily_review.bat` |
| 临床资料模板 | ✅ 已就位 | `clinical/2026-06-14/`（示例） |
| AI 眼镜提示策略 | ✅ 已实战验证 | 临床录入系统两阶段工作流已接入 |
| 循证审计系统 | ✅ 3 方试点完成 | `docs/evidence/`（小建中汤/桂枝汤/麻黄汤） |
| 临床录入系统 | ✅ 两阶段工作流 | 输入→评估→补采→匹配→条文联动 |
| 搜索聚类复习 | ✅ 已接入 | 顶部过滤 + 实时筛选 + 聚类考试 |
| 条文系统重构 | ✅ v2 完成 | 统一 slidePanel + 数据融合 + 对比标签 + 提取练习 |
| 真实卡片生产 | ✅ 63 方已覆盖 | 六经覆盖度：太阳28/阳明10/少阳4/少阴3 |
| v9 组件化重构 | 🔄 进行中 | `app/v9/`（Vite + Vitest + Playwright） |
| 出版规划 | 📝 文档就绪 | `docs/出版规划/`（系列规划/洞察记录/协作协议） |

---

## 三、文件夹地图

### 人类看到的入口

| 文件/文件夹 | 作用 |
|------------|------|
| `经方学习系统.bat` | 双击打开桌面版学习系统 |
| `经方学习系统-手机版.bat` | 双击打开手机版学习系统 |
| `素材分拣/` | 你只管往这里丢素材 |
| `素材分拣/处理新素材.bat` | 一键把素材分类到该去的地方 |
| `README.md` | 给外人/未来的自己看的快速说明 |
| `INDEX.md` | 本文件：当前进度、经验、坑、待办 |
| `PROJECT-STRUCTURE.md` | 文件夹归类规范（AI 工作参考） |

### AI 工作区（人类原则上不进来）

| 目录 | 作用 |
|------|------|
| `.agents/skills/text-to-cards/` | Skill 代码、脚本、规范 |
| `raw/` | 原始素材归档 |
| `extracted/` | 提取中间产物 |
| `clinical/` | 临床资料按日归档 |
| `data/` | 卡片数据镜像 |
| `app/` | 前端应用 |
| `docs/` | 项目文档 |
| `scripts/` | 便捷脚本 |

### 核心目录

```
app/              前端应用。当前主入口是 app/index.html
├── archive/      历史原型版本，不活跃
├── assets/       静态资源（预留空）

data/             卡片数据镜像。真相源在 .agents/skills/text-to-cards/data/

raw/              原始素材，只读
├── classical/    经典原文：伤寒论.doc、桂林古本.doc
├── annotations/  注家/现代讲解：倪海厦 txt/pdf/md
├── annotations-chm/   CHM 源文件
└── extracted-chm/     CHM 解压后的 HTML

extracted/        提取中间产物
├── source_cards/      条文卡候选（Markdown 审阅文件）
├── formula_elements/  方剂元素候选
└── experiences/       经验卡候选

clinical/         临床实战资料
├── YYYY-MM-DD/   每日一个文件夹
│   ├── YYYY-MM-DD_P01_化名_转写.txt
│   ├── YYYY-MM-DD_现场笔记.md
│   └── YYYY-MM-DD_学习建议.md   ← daily_review 生成

config/           范围清单与配置
├── scope_伤寒论常用方.txt
└── scope_桂枝类方.txt

standardized-patient/  标准化病人（SP）Skill 体系
├── SKILL.md            核心 Skill 定义
├── references/         条文映射、人格系统、问诊框架、口语表达
│   ├── persona_system.md
│   ├── oral_expression_guide.md
│   └── ten_inquiries_framework.md
└── data/               SP 病例数据

docs/             项目文档、设计、个人笔记
├── 思路与经验.md              ← 加工方法、踩坑记录
├── 个人经验-李法师.md         ← 战场实战经验
├── 00-顶层设计-最终对齐版.md
├── 01-原型开发阶段性总结.md
├── 02-前端状态机与交互设计-v7.md
├── evidence/           循证审计系统
│   ├── task_board.md           任务看板
│   ├── reports/                审计报告（小建中汤/桂枝汤/麻黄汤）
│   └── evidence_audit_verification_workflow.md
└── 出版规划/            出版规划文档
    ├── 01-系列规划总览.md
    ├── 02-项目洞察记录.md
    └── 03-协作协议.md

app/              前端应用
├── index.html            桌面版主入口（v8）
├── mobile.html           移动端入口
├── v9/                   v9 组件化重构（Vite + Vitest + Playwright）
│   └── src/              组件、服务、状态、工具
├── archive/              历史原型版本
└── assets/               静态资源（预留）
```

---

## 四、新东西怎么放

### 对人类：全部丢进 `素材分拣/`

不管拿到什么：

- 义诊录音 / 患者转写 / 现场笔记
- 新买的电子书 PDF / CHM / DOC / TXT
- 网上下载的伤寒论资料
- 自己写的学习笔记

**全部丢进 `素材分拣/`。**

然后双击 `素材分拣/处理新素材.bat`。AI 会自动：

- 音频/视频 → `clinical/YYYY-MM-DD/`
- 患者转写 → `clinical/YYYY-MM-DD/`
- 现场笔记 → `clinical/YYYY-MM-DD/`
- CHM → `raw/annotations-chm/`
- PDF/DOC/TXT/MD → `raw/annotations/`
- 图片 → `clinical/YYYY-MM-DD/`

### 对 AI：精细归类

如果通过 CLI 对话调整，可以按类型放到精确位置：

| 类型 | AI 目标位置 |
|------|------------|
| 经典原文（伤寒论、金匮、桂林古本） | `raw/classical/` |
| 注家讲解/现代资料 | `raw/annotations/` |
| CHM 源文件 | `raw/annotations-chm/` |
| CHM 解压 HTML | `raw/extracted-chm/同名文件夹/` |
| 临床资料 | `clinical/YYYY-MM-DD/` |
| 项目文档/设计笔记 | `docs/` |
| 循证审计报告 | `docs/evidence/reports/` |
| 出版规划文档 | `docs/出版规划/` |
| SP 系统资料 | `standardized-patient/` |

---

## 五、已验证的经验（别忘记的）

### 5.1 数据流程

1. **原始素材不动**。所有清洗、提取产物都要另存。
2. **真相源唯一**。卡片 JSON 的真相源是 `.agents/skills/text-to-cards/data/`，根目录 `data/` 只是镜像。
3. **先清洗，再提取**。不要把 Markdown/PDF 直接丢给 `segment_text.py`。
4. **小样本先跑**。全书跑之前先用 10-20 段验证格式和规则。

### 5.2 文本清洗

- 倪海厦 `.txt` 实际是 **GB2312 编码的 HTML**，要先去标签、转 UTF-8。
- 影印版 PDF（如 20MB 倪海厦 PDF）**没有嵌入文字**，必须 OCR。
- 电子书常有版式断行，清洗时要先「合并人工换行」再「按语义分段」。
- 条文编号（如「二：」「四一：」「三七一：」）是极好的分段锚点。

### 5.3 提取规则

- 范围清单越大，误触发越多。68 个方名会产生大量「正文顺带提到方名」的噪音。
- 「无汗」同时是症状词和禁忌关键词，会导致误判，需要加上下文判断。
- Markdown 标记（`|`、`#`、`**`、`*`）会污染提取结果，预处理必须剥离。
- AI 生成的现代解读文本含有大量元话语（「我将按……分组」），不是卡片事实。
- 目录/清单段落会触发大量 `formula_name`，需要识别并跳过。

### 5.4 前端与交互

- 小白阶段只练四个基础向量：方名↔症状、方名↔药物、禁忌识别、煎服法（低频）。
- 去掉「逾期」标签和红黄绿焦虑色。
- 学习视图单栏，考试视图双栏。
- 经验卡分三级显示：Level 0 只看禁忌，Level 1 看加减，Level 2 开放全量。

### 5.5 临床记录

- 第一次实战以「活下来 + 记下来 + 验工具」为目标，不追求完美诊断。
- 用节气方打底，其他方「混过去」。
- 不要中断临床节奏去迁就系统。
- 三类反馈值得记：
  - 「幸好眼镜提醒了」
  - 「我知道，不用你说」
  - 「我想看但眼镜没有」

---

## 六、DeepSeek 评审共识（显式沉淀）

> 详细 battle 记录见 `docs/思路与经验.md > 外部评审记录`。  
> 这里只放已经决定、必须贯彻到数据和代码里的共识。

### 6.1 卡片结构双轨制

- **canonical**：以《伤寒论》原文为基准，药物组成 + 比例为准，不强制固定克数。
- **empirical_distribution**：倪海厦/现代/个人实战经验单独存放，必须标注来源。
- **lineage**：加减方必须记录「基准方 → 加减路径」，用于追溯谱系。

### 6.2 经验提示三级分层

- **Level 0（小白）**：只提示绝对禁忌和否定症。
- **Level 1（已掌握基础）**：提示高频加减法，附带条件。
- **Level 2（熟练者）**：开放全量数据。

### 6.3 疗效记录客观化

每条经验必须区分：

- `subjective_effective`：患者主观好转。
- `objective_change`：客观查体/化验变化。

仅主观有效 → 低置信度经验（权重建议 0.3）。

### 6.4 训练向量精简

- **基础必备**：方名↔症状、方名↔药物。
- **辅助保留**：方名→煎服法（权重降低）。
- **安全防护**：禁忌识别（独立向量）。
- **进阶预留**：症状→加减法、多症状→多方排序。

### 6.5 MVP 阶段明确不做

- ❌ 静态 `confusable_formulas`：改为个人混淆矩阵。
- ❌ 经验卡自动提取：临床资料需人工提炼。
- ❌ OCR 扫描 PDF：投入产出比低。
- ❌ 三栏布局 / 红黄绿逾期标签 / 方名↔用法独立向量。

---

## 七、当前待办与下一步

### 高优先级（义诊前）

- [ ] 确认明天要用的节气方药物剂量和加减要点
- [ ] 确认 AI 眼镜实际能显示什么内容
- [ ] 确认平板/手机录音流程

### 高优先级（义诊后）

- [ ] 把真实临床资料放入 `clinical/YYYY-MM-DD/`
- [ ] 跑 `daily_review.bat` 生成学习建议
- [ ] 从真实医案中提炼第一批经验卡
- [ ] 根据三类反馈更新 AI 眼镜提示策略

### 中优先级（数据 Pipeline）

- [x] 实现 `scripts/card_manager.py`：approve / reject / delete-card / re-extract
- [ ] 用 `card_manager.py` 抽样审阅 20 条 source_card，验证主方归属正确率
- [ ] 处理 `extracted/` 里重复的旧 batch 文件（只保留最新一轮或按 run_id 归档）
- [ ] 修正 `RuleFormulaCardAnalyzer` 过宽问题：≥3 味药+剂量+方名就命中，需加结构判断
- [ ] 扩展 `config/scope_伤寒论常用方.txt`，覆盖更多常用方（如五苓散、小建中汤）
- [ ] 测试 .doc 文件提取：`伤寒论.doc`、`桂林古本伤寒杂病论.doc`
- [ ] 评估 CHM 提取质量：《伤寒悬解》《伤寒九十论》等

### 低优先级（进阶）

- [ ] 把 approved 候选写入 `.agents/skills/text-to-cards/data/*.json`
- [ ] 建立个人混淆矩阵
- [ ] 实现症状→加减法、多症状→多方排序的训练向量
- [ ] OCR 倪海厦影印版 PDF（仅当其他来源不足时再考虑）

---

## 八、已知的坑（必读）

### 8.1 路径与编码

- **PowerShell 中文显示可能乱码**，但文件内容是 UTF-8 正常的。以文件内容为准。
- **PowerShell 不支持 `&&`**，多步命令用 `;` 分隔或分行。
- **文件名含引号或特殊字符** 时，PowerShell 字符串可能解析失败，用 `-LiteralPath` 或 `Get-ChildItem | Where-Object` 处理。
- **GB2312 文本在 Shell 输出会乱码**，但写入 UTF-8 文件后读取正常。

### 8.2 脚本执行

- `daily_review.py` 默认读取项目根目录 `clinical/YYYY-MM-DD/`，但也可以手动传 `--folder`。
- `segment_text.py` 必须传 `--input`、`--scope`、`--output`。
- `clean_nihaixia_txt.py` 读 GB2312，输出 UTF-8。
- 重新生成演示卡片后，**必须运行 `scripts/sync_data.py`** 才能更新根目录 `data/`。

### 8.3 数据质量

- 不要指望 `segment_text.py` 一次产出完美结果。它只负责「候选」，人工审阅是必需步骤。
- MVP 阶段**不自动提取经验卡**。临床录音/笔记需要人工提炼。
- 经验卡必须区分 `subjective_effective` 和 `objective_change`。
- 加减方必须记录 `lineage`（基准方 + 加减路径）。

### 8.4 前端

- `app/index.html` 是 `shanghanlun-v8-mvp.html` 的副本。更新 v8 后记得重新复制。
- v8 目前是 MVP，数据硬编码在 HTML 中，没有自动读取 `data/*.json`。

---

## 九、人类命令备忘

```powershell
# 打开学习系统
经方学习系统.bat

# 处理新素材（已经丢进素材分拣/后）
素材分拣\处理新素材.bat

# 生成每日学习建议（义诊回来后）
python .agents\skills\text-to-cards\scripts\daily_review.py --date 2026-06-15
```

## 十、AI 命令备忘（CLI 对话时使用）

```powershell
# 同步卡片数据到根目录
python scripts\sync_data.py

# 跑完整提取管道（扫描 raw/ 下所有文件）
python scripts\extract_pipeline.py

# 候选卡片管理（审阅/采纳/拒绝/重提）
python scripts\card_manager.py list --type source_card --limit 20
python scripts\card_manager.py show src-xxx
python scripts\card_manager.py approve src-xxx --note "主方正确"
python scripts\card_manager.py reject src-xxx --note "主方归属错误"
python scripts\card_manager.py delete src-xxx
python scripts\card_manager.py reextract "extracted\annotations\倪海厦-人纪-伤寒论_cleaned.txt"

# 重新生成演示卡片
python .agents\skills\text-to-cards\scripts\build_demo_cards.py
```

---

## 十一、变更日志

| 日期 | 变更 |
|------|------|
| 2026-06-13 | 整理文件夹结构，制定 PROJECT-STRUCTURE.md，复制完整 Skill 工具链，创建 INDEX.md |
| 2026-06-13 | 创建 clinical/2026-06-14 示例，验证 daily_review.py 可用 |
| 2026-06-13 | 验证 segment_text.py 可从清洗后的倪海厦文本中提取候选 |
| 2026-06-13 | 按「人用一个，AI 用一堆」原则简化入口：`start.bat` → `经方学习系统.bat`，新增 `素材分拣/` 和 `素材分拣/处理新素材.bat` |
| 2026-06-14 | Phase 1 完成：前端动态加载 data/*.json、本地服务器、双版 bat、宽屏双栏快捷键 |
| 2026-06-14 | Phase 2 完成：搭建解耦提取管道（extract_pipeline / ai_router / analyzers / text_extractors），945 来源 → 206 候选 |
| 2026-06-14 | 修复 `rule_source_card_analyzer` 主方归属 bug：结论词前最近方名优先，避免句首误方名被当作主方 |
| 2026-06-14 | INDEX.md 显式沉淀 DeepSeek 评审共识：双轨制 / lineage / 经验三级分层 / 疗效客观化 / 训练向量精简 / MVP 不做清单 |
| 2026-06-14 | Phase 3 启动：实现 `scripts/card_manager.py`（list / show / approve / reject / delete / reextract），候选生命周期可管理 |

---

## 十二、如果迷失了，回到这里

1. 想**学习/考试** → 双击 `经方学习系统.bat`
2. 想**加新资料** → 丢进 `素材分拣/`，然后双击 `素材分拣/处理新素材.bat`
3. 想**跑脚本** → 看「九、人类命令备忘」和「十、AI 命令备忘」
4. 想**知道为什么这样设计** → 看 `docs/思路与经验.md` 和 `docs/00-顶层设计-最终对齐版.md`
5. 想**记新发现/新坑** → 追加到 `docs/思路与经验.md`
6. 想**更新本索引** → 直接编辑 `INDEX.md`
