# 经方学习系统 · 文件夹归类规范

> 版本：v1.2  
> 日期：2026-06-22  
> 目的：让「原始素材 → 提取产物 → 卡片数据 → 前端应用 → 临床记录 → 循证审计」链路清晰可追踪。

---

## 核心原则

1. **原始素材只读**：`raw/` 下的文件只归档，不直接修改。清洗、提取产物放到 `extracted/`。
2. **真相源唯一**：卡片数据库真相源是 `.agents/skills/text-to-cards/data/*.json`，根目录 `data/` 是其镜像副本，方便直接打开。
3. **工具与数据分离**：`.agents/skills/text-to-cards/` 放 Skill 代码、脚本、规范；项目数据放根目录。
4. **版本留档**：过时的前端版本统一进 `app/archive/`，不在根目录堆积。
5. **临床按日归档**：每次义诊/跟诊建立一个 `clinical/YYYY-MM-DD/` 文件夹。

---

## 目录结构

```
经方学习系统（旧版）/
│
├── 经方学习系统.bat                   # 双击打开学习系统
├── 素材分拣/                          # 人类丢素材的地方
│   └── 处理新素材.bat                 # 一键把素材分类到该去的地方
├── README.md                          # 项目总说明
├── INDEX.md                           # 项目活地图：进度、经验、坑、待办
├── PROJECT-STRUCTURE.md               # 本规范
├── scripts/                           # 便捷脚本
│   ├── sync_data.py                   # 同步卡片数据到根目录 data/
│   ├── sort_materials.py              # 素材分拣核心脚本
│   └── daily_review.bat               # 生成每日学习建议
│
├── .agents/                           # AI Skill 与自动化脚本
│   └── skills/
│       └── text-to-cards/             # 卡片提取 Skill
│           ├── SKILL.md
│           ├── README.md
│           ├── data/                  # 卡片数据库（真相源）
│           │   ├── formula_cards.json
│           │   ├── source_cards.json
│           │   └── experience_cards.json
│           ├── references/            # 规范、词库、说明
│           │   ├── card-schema.md
│           │   ├── element-types.md
│           │   └── daily-review-skill-spec.md
│           ├── scripts/               # 自动化脚本
│           │   ├── build_demo_cards.py
│           │   ├── segment_text.py
│           │   ├── clean_nihaixia_txt.py
│           │   ├── daily_review.py
│           │   └── build_v8.py
│           ├── templates/             # 前端 HTML 模板
│           │   └── v8-mvp.html
│           ├── field-notes/           # 临床/学习笔记模板
│           │   ├── daily-folder-template.md
│           │   ├── 个人经验-李法师.md
│           │   └── YYYY-MM-DD-template/
│           └── tools/                 # 外部工具与虚拟环境
│               └── venv/
│
├── app/                               # 前端应用
│   ├── index.html                     # 当前主入口（v8，复制自 v8-mvp）
│   ├── mobile.html                    # 移动端入口（单栏触摸）
│   ├── shanghanlun-v8-mvp.html        # v8 MVP 双栏考试版
│   ├── shanghanlun-v7-db.html         # v7 数据库版
│   ├── v9/                            # v9 组件化重构（Vite + Vitest + Playwright）
│   │   ├── src/                       # 组件、服务、状态、工具
│   │   ├── tests/                     # 测试套件
│   │   └── package.json               # 依赖配置
│   ├── archive/                       # 历史原型留档
│   │   └── ...（历史版本）
│   └── assets/                        # 静态资源（预留）
│
├── data/                              # 卡片数据镜像（从 .agents/.../data 同步）
│   ├── formula_cards.json             # 63 张方剂卡
│   ├── source_cards.json              # 398 条条文卡
│   ├── experience_cards.json          # 临床医案卡
│   ├── sp_cases.json                  # 8 例 SP 病例
│   ├── source_article_map.json        # 条文映射（机器可读）
│   ├── symptom_expression_index.json  # 症状口语表达索引
│   ├── sun_target_formulas.json       # 36 目标方覆盖清单
│   ├── core_herbs_research.json       # 核心药物组合研究
│   └── archive/                       # 数据备份历史
│
├── standardized-patient/              # 标准化病人（SP）Skill 体系
│   ├── SKILL.md                       # 核心 Skill 定义
│   ├── references/                      # 规范与数据
│   │   ├── json_schema.md
│   │   ├── persona_system.md
│   │   ├── oral_expression_guide.md
│   │   ├── ten_inquiries_framework.md
│   │   └── source_article_map.md
│   └── data/                          # SP 病例数据（可选）
│
├── raw/                               # 原始素材（只读档案）
│   ├── classical/                     # 经典原文
│   │   ├── 伤寒论.doc
│   │   └── 桂林古本伤寒杂病论.doc
│   ├── annotations/                   # 注家/现代讲解原始素材（可文本处理）
│   │   ├── 倪海夏-人纪- 伤寒论.txt
│   │   └── 原版影印版-倪海厦-人纪-伤寒论.pdf
│   ├── annotations-chm/               # CHM 格式典籍（源文件，不解压）
│   │   ├── 3伤寒金匮经方.chm
│   │   ├── 57冯世纶教授经方师承.chm
│   │   ├── 58黄煌教授经方沙龙.chm
│   │   ├── 60倪海厦大师经方讲座.chm
│   │   ├── 64伤寒系列.chm
│   │   ├── 《伤寒九十论》.chm
│   │   ├── 《伤寒心法要诀》.chm
│   │   ├── 《伤寒悬解》(1).chm
│   │   ├── 《伤寒法祖》.chm
│   │   ├── 《伤寒直格》.chm
│   │   ├── 《伤寒补例》.chm
│   │   └── 《敖氏伤寒金镜录》.chm
│   ├── extracted-chm/                 # CHM 解压后的 HTML 目录
│   │   ├── 3伤寒金匮经方/
│   │   ├── 57冯世纶教授经方师承/
│   │   ├── 58黄煌教授经方沙龙/
│   │   ├── 60倪海厦大师经方讲座/
│   │   ├── 64伤寒系列/
│   │   ├── 《伤寒九十论》/
│   │   ├── 《伤寒心法要诀》/
│   │   ├── 《伤寒悬解》(1)/
│   │   ├── 《伤寒法祖》/
│   │   ├── 《伤寒直格》/
│   │   ├── 《伤寒补例》/
│   │   └── 《敖氏伤寒金镜录》/
│   └── archive/                       # 原始素材归档/待确认/临时文件
│       └── temp_yizongjinjian.pdf
│
├── extracted/                         # 提取/清洗产物
│   ├── annotations/                   # 注解类资料清洗产物
│   │   ├── 倪海厦伤寒论_extracted.md
│   │   ├── 桂枝类方_extracted.md
│   │   └── 倪海厦-人纪-伤寒论_cleaned.txt
│   ├── 黄煌教授经方沙龙/              # 黄煌 CHM 清洗产物
│   │   ├── catalog.json
│   │   ├── catalog.md
│   │   └── cleaned/
│   ├── source_cards/                  # 条文卡候选（Markdown 审阅文件）
│   ├── formula_elements/              # 方剂元素候选
│   └── experiences/                   # 经验卡候选
│
├── clinical/                          # 临床实战资料
│   └── YYYY-MM-DD/                    # 每日一个文件夹
│       ├── YYYY-MM-DD_P01_化名_转写.txt
│       ├── YYYY-MM-DD_现场笔记.md
│       └── YYYY-MM-DD_学习建议.md
│
├── config/                            # 范围清单与配置
│   ├── scope_伤寒论常用方.txt
│   └── scope_桂枝类方.txt
│
├── docs/                              # 项目文档、设计、个人笔记、循证审计、出版规划
│   ├── CHANGELOG.md                   # 变更登记簿（编号规则：SH-YYYYMMDD-NNN）
│   ├── 思路与经验.md                  # 加工方法、踩坑记录
│   ├── 00-顶层设计-最终对齐版.md
│   ├── 01-原型开发阶段性总结.md
│   ├── 02-前端状态机与交互设计-v7.md
│   ├── evidence/                      # 循证审计系统
│   │   ├── task_board.md              # 审计任务看板
│   │   ├── evidence_audit_verification_workflow.md
│   │   ├── reports/                   # 审计报告存档
│   │   └── archive/                   # 审计报告旧版本
│   ├── 出版规划/                       # 出版规划文档
│   │   ├── 01-系列规划总览.md
│   │   ├── 02-项目洞察记录.md
│   │   └── 03-协作协议.md
│   └── archive/                       # 文档旧版本备份
│
├── mock_cards/                        # 早期 mock 卡片数据（历史留档）
│
└── _sample_utf8.txt                   # 编码测试样本
```

---

## 文件命名约定

### 临床文件
- 转写：`YYYY-MM-DD_PXX_化名_转写.txt`
- 笔记：`YYYY-MM-DD_现场笔记.md`
- 学习建议：`YYYY-MM-DD_学习建议.md`

### 提取产物
- 条文候选：`{来源}_{范围}_{日期}_source_candidates.md`
- 经验候选：`{来源}_{范围}_{日期}_experience_candidates.md`

### 卡片 JSON
- `formula_cards.json`：方剂卡
- `source_cards.json`：条文卡
- `experience_cards.json`：经验卡

---

## 更新与同步规则

1. 运行 `build_demo_cards.py` 后，应手动或脚本把 `.agents/skills/text-to-cards/data/*.json` 复制到根目录 `data/`。
2. `app/index.html` 是 `shanghanlun-v8-mvp.html` 的副本，作为默认入口。
3. 新增 CHM 典籍：先解压到 `raw/extracted-chm/`，源文件放入 `raw/annotations-chm/`。
4. 新增临床资料：按 `clinical/YYYY-MM-DD/` 建文件夹，患者按 `P01/P02/...` 编号。
5. 运行 `scripts/sync_data.py` 把 `.agents/skills/text-to-cards/data/*.json` 同步到根目录 `data/`。

---

## 当前已知缺口

- `.agents/skills/text-to-cards/` 下的脚本、规范、模板需从 `C:\Users\Chen\WorkBuddy\Claw\.agents\skills\text-to-cards` 复制。
- 部分脚本里的硬编码路径需要改为接收参数。
- `data/` 镜像需要首次同步。
