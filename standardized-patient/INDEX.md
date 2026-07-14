# standardized-patient/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 29
> **用途**: 结构化中医经方标准化病人（SP）问诊考试系统，将《伤寒论》《金匮要略》条文转化为选择式问诊考试

## 快速索引

### 核心文件

| 文件 | 功能 | 状态 |
|------|------|------|
| `SKILL.md` | SP Skill 定义（277 行）：系统核心指令，定义十问歌框架、角色扮演、评分规则 | ✅ 稳定 |

### 标准案例（sp_case_*.json）

| 文件 | 对应方证 | 状态 |
|------|----------|------|
| `sp_case_da_qing_long_tang.json` | 大青龙汤（太阳病表寒里热） | ✅ 稳定 |
| `sp_case_gui_zhi_qu_shaoyao_tang.json` | 桂枝去芍药汤（太阳病胸满） | ✅ 稳定 |
| `sp_case_guizhi_jia_houpo_xingzi_tang.json` | 桂枝加厚朴杏子汤（太阳病喘证） | ✅ 稳定 |
| `sp_case_si_ni_tang.json` | 四逆汤（少阴病阳虚） | ✅ 稳定 |
| `sp_case_wu_ling_san.json` | 五苓散（太阳病蓄水证） | ✅ 稳定 |
| `sp_case_zhen_wu_tang.json` | 真武汤（少阴病阳虚水泛） | ✅ 稳定 |
| `sp_case_...`（另外 1 个在 `scripts/` 或 `data/` 中） | | |

### 批量输出（batch*_worker*_output.json）

| 文件 | 说明 | 状态 |
|------|------|------|
| `batch1_worker1~7_output.json` | 第 1 批 7 个 worker 输出 | 🗑 临时/已用 |
| `batch2_worker8~10_output.json` | 第 2 批 3 个 worker 输出 | 🗑 临时/已用 |
| `batch3_worker11~12_output.json` | 第 3 批 2 个 worker 输出 | 🗑 临时/已用 |
| `batch4_worker13~14_output.json` | 第 4 批 2 个 worker 输出 | 🗑 临时/已用 |
| `batch5_worker15~16_output.json` | 第 5 批 2 个 worker 输出 | 🗑 临时/已用 |

### 参考文献

| 文件 | 功能 | 状态 |
|------|------|------|
| `references/article_lookup_plan.md` | 文章查找计划 | ✅ 稳定 |
| `references/json_schema.md` | JSON Schema 定义 | ✅ 稳定 |
| `references/oral_expression_guide.md` | 口语化表达指南 | ✅ 稳定 |
| `references/persona_system.md` | 患者角色系统 | ✅ 稳定 |
| `references/source_article_map.md` | 源文章映射 | ✅ 稳定 |
| `references/ten_inquiries_framework.md` | 十问歌框架 | ✅ 稳定 |

### 子目录

| 目录 | 内容 |
|------|------|
| `data/` | SP 相关数据 |
| `scripts/` | SP 相关脚本 |

## 连接关系图

```
standardized-patient/
├── SKILL.md ─────────────→ .agents/skills/text-to-cards/（Skill 注册）
├── sp_case_*.json ───────→ data/sp_cases.json（数据同步目标）
│                            └→ app/shanghanlun-v8-mvp.html（SP 考试界面）
├── batch*_output.json ───→ （批量 AI 生成输出，已集成到标准案例）
├── references/*.md ──────→ SKILL.md（被引用的参考文档）
└── scripts/ ────────────→ SP 生成/验证工具
```

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
