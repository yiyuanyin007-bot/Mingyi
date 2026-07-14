# data/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 119（含子目录 archive/、notes_backup/）
> **用途**: 经方学习系统的核心结构化数据资产，所有卡片数据、源文章映射、症状索引等集中存储

## 快速索引

### 核心卡片数据

| 文件 | 内容 | 规模 | 状态 |
|------|------|------|------|
| `formula_cards.json` | 经方卡片（63 首方剂，含组成/主治/煎服法/条文/加减等） | 主数据 | ✅ 稳定 |
| `source_cards.json` | 源文章卡片（398 篇，含原文/注解/条辩等知识条目） | 主数据 | ✅ 稳定 |
| `source_cards_extended.json` | 扩展源文章卡片 | 扩展集 | ✅ 稳定 |
| `experience_cards.json` | 经验卡片（临床经验/医案心得） | 主数据 | ✅ 稳定 |
| `sp_cases.json` | 标准化病人案例（问诊考试场景） | 7 案例 | ✅ 稳定 |
| `sp_cases_new.json` | 标准化病人新格式案例 | 新格式 | 📝 新增 |
| `sp_generation_packages.json` | SP 生成包配置 | — | ✅ 稳定 |

### 映射/索引数据

| 文件 | 功能 | 状态 |
|------|------|------|
| `herb_alias_map.json` | 草药别名映射（异名→标准名） | ✅ 稳定 |
| `symptom_expression_index.json` | 症状表达索引（症状→相关条文） | ✅ 稳定 |
| `source_article_map.json` | 源文章映射表（管理源→经方→卡片关系） | ✅ 稳定 |
| `sun_target_formulas.json` | 太阳病目标方剂清单（学习路线中的太阳篇规划） | ✅ 稳定 |
| `core_herbs_research.json` | 核心草药研究报告 | 📝 新增 |

### 备份与存档

| 文件/目录 | 内容 | 状态 |
|-----------|------|------|
| `formula_cards.json.bak_20260613_core` | 核心数据备份（2026-06-13 核心版） | 🗑 备份 |
| `formula_cards.json.bak_20260613_links` | 链接数据备份（2026-06-13 链接版） | 🗑 备份 |
| `archive/` | 批量迁移前的历史快照（formula_cards-before-batch*.json 等） | 🗑 备份 |
| `notes_backup/` | 笔记备份 | 🗑 备份 |
| `sp_cases_backup_4new.json` | SP 案例过渡备份 | 🗑 备份 |
| `sp_cases_raw.js` | SP 案例原始 JS 格式 | 🗑 备份 |
| `sp_generation_packages/` | SP 生成包子目录 | 🗑 备份 |

### JSON 格式说明文件

| 文件 | 功能 |
|------|------|
| `*.json.README.md`（6 个） | 各 JSON 文件的字段说明 / 数据规格 |

## 数据关系图

```
data/
│
├── formula_cards.json ←── scripts/card_manager.py（CRUD 操作）
│                            └→ app/shanghanlun-v8-mvp.html（前端渲染）
│                            └→ schemas/prescription_sop.json（Schema 校验）
│
├── source_cards.json ←── scripts/extract_pipeline.py（从 raw/ 提取）
│                           └→ data/source_article_map.json（映射关系）
│                           └→ app/（前端引用）
│
├── experience_cards.json ←── scripts/extract_pipeline.py（提取）
│
├── sp_cases.json ←── standardized-patient/sp_case_*.json（同步）
│                       └→ app/shanghanlun-v8-mvp.html（SP 考试界面）
│
├── herb_alias_map.json ←── scripts/fix_prescriptions.py（方剂纠错）
│                            └→ scripts/qc_full_scan.py（质量检查）
│
├── symptom_expression_index.json ←── scripts/parse_shanghanlun.py（症状解析）
│
└── sun_target_formulas.json ←── config/scope_*.txt（学习范围）
```

## 同步机制

```
.agents/skills/text-to-cards/data/*.json ← data/（通过 scripts/sync_data.py 双向同步）
```

`scripts/sync_data.py` 负责保持 `.agents/skills/text-to-cards/data/` 和 `data/` 之间的一致性。

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
