# scripts/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 67（含子目录 analyzers/、text_extractors/、evidence/、archive/）
> **用途**: 经方学习系统的工具脚本集合，覆盖数据提取管线、卡片管理、质检、迁移、治理等全过程

## 快速索引（按功能域分组）

### 🔄 数据提取管线

| 文件 | 功能 | 依赖/输入 | 状态 |
|------|------|-----------|------|
| `extract_pipeline.py` | **主提取管线**（CHM→结构化卡片的全流程编排） | `text_extractors/`、`analyzers/` | ✅ 稳定 |
| `parse_shanghanlun.py` | 伤寒论条文解析（从原始文本→结构化数据结构） | `raw/classical/`→`data/` | ✅ 稳定 |
| `fetch_baidu_text.py` | 百度健康文本抓取 | 百度健康网页 | ✅ 稳定 |
| `fetch_zhihu_text.py` | 知乎文章文本抓取 | 知乎网页 | ✅ 稳定 |
| `sort_materials.py` | 素材分类整理 | `extracted/` 素材 | ✅ 稳定 |

### 📇 卡片管理

| 文件 | 功能 | 依赖/输入 | 状态 |
|------|------|-----------|------|
| `card_manager.py` | **卡片 CRUD 管理器**（方剂/源文章/经验卡片的创建/编辑/查询） | `schemas/prescription_sop.json`、`data/*.json` | ✅ 稳定 |
| `fix_prescriptions.py` | 方剂数据修复 | `herb_alias_map.json` | ✅ 稳定 |
| `add_cards_to_prototype.py` | 向原型添加卡片 | — | ✅ 稳定 |
| `click_card.py` | 卡片点击测试 | `mock_cards/` | ✅ 稳定 |

### 🧪 质量管理

| 文件 | 功能 | 依赖/输入 | 状态 |
|------|------|-----------|------|
| `qc_full_scan.py` | **全量质量扫描**（卡片数据完整性/一致性检查） | `data/*.json` | ✅ 稳定 |
| `check_coverage.py` | 覆盖度检查（方剂→源文章覆盖情况） | `data/source_cards.json` | ✅ 稳定 |
| `check_app.py` | 应用状态检查 | `app/` | ✅ 稳定 |
| `score_cleaning.py` | 清理评分数据 | — | ✅ 稳定 |

### 🧽 数据清洗

| 文件 | 功能 | 状态 |
|------|------|------|
| `clean_text_v1.py` | 文本清洗 v1（基础清洗） | 🗑 旧版 |
| `clean_text_v2.py` | 文本清洗 v2（增强清洗） | ✅ 稳定 |
| `clean_huanghuang_chm.py` | 黄煌 CHM 数据清洗 | ✅ 稳定 |
| `clean_xhs_ocr.py` | 小红书 OCR 清洗 | ✅ 稳定 |
| `fix_text_cleanup.py` | 文本清理修复 | ✅ 稳定 |
| `fix_source_annotations.py` | 源标注修复 | ✅ 稳定 |

### 🔄 数据迁移

| 文件 | 功能 | 状态 |
|------|------|------|
| `p2_migration.py` | Phase 2 迁移（全量卡片迁移） | 🗑 已用 |
| `phase1_patch_index.py` | Phase 1 索引补丁 | 🗑 已用 |
| `phase2_extend_sun_cards.py` | Phase 2 太阳病卡片扩展 | 🗑 已用 |
| `phase2b_extend_remaining.py` | Phase 2b 剩余卡片扩展 | 🗑 已用 |
| `migrate_notes.js` | 笔记迁移（JS） | 🗑 已用 |
| `migrate_p2_source_annotations.py` | P2 源标注迁移 | 🗑 已用 |
| `migrate_remaining.py` | 剩余数据迁移 | 🗑 已用 |

### 📋 会话/启动

| 文件 | 功能 | 状态 |
|------|------|------|
| `session_start.py` | 每日启动检查（加载 config/ 范围、检查 data/ 完整性） | ✅ 稳定 |
| `daily_review.py` | 每日复习（学习范围→加载临床记录→复习建议） | ✅ 稳定 |
| `daily_review.bat` | 每日复习批处理入口 | ✅ 稳定 |
| `governance.py` | 项目治理（规则检查/策略执行） | ✅ 稳定 |

### 🔬 分析器子模块（analyzers/）

| 文件 | 功能 |
|------|------|
| `analyzers/base_analyzer.py` | 分析器基类 |
| `analyzers/rule_formula_card_analyzer.py` | 方剂卡片规则分析器 |
| `analyzers/rule_source_card_analyzer.py` | 源文章卡片规则分析器 |
| `analyzers/rule_experience_card_analyzer.py` | 经验卡片规则分析器 |

### 📄 文本提取器子模块（text_extractors/）

| 文件 | 功能 |
|------|------|
| `text_extractors/base_extractor.py` | 提取器基类 |
| `text_extractors/chm_html_extractor.py` | CHM→HTML 提取器 |
| `text_extractors/html_extractor.py` | HTML 提取器 |
| `text_extractors/md_extractor.py` | Markdown 提取器 |
| `text_extractors/txt_extractor.py` | 纯文本提取器 |
| `text_extractors/pdf_extractor.py` | PDF 提取器 |
| `text_extractors/doc_extractor.py` | Word 文档提取器 |

### 🔍 其他工具

| 文件 | 功能 | 状态 |
|------|------|------|
| `sync_data.py` | 数据同步（.agents/skills/ ↔ data/ 双向同步） | ✅ 稳定 |
| `sp_generator.py` | 标准化病人案例生成器 | ✅ 稳定 |
| `start_exam.py` | 启动考试模式 | ✅ 稳定 |
| `ai_router.py` | AI 路由 | ✅ 稳定 |
| `safe_edit.py` | 安全编辑工具 | ✅ 稳定 |
| `archive_raw.py` | 原始数据归档 | ✅ 稳定 |
| `sample_raw_segments.py` | 原始分段采样 | ✅ 稳定 |
| `generate_huanghuang_report.py` | 黄煌报告生成 | ✅ 稳定 |
| `reformat_jingfang_yanlun.py` | 经方言论格式化 | ✅ 稳定 |
| `reload_and_screenshot.py` | 加载并截图 | ✅ 稳定 |
| `scroll_dashboard.py` / `scroll_detail.py` | 仪表盘/详情滚动测试 | ✅ 稳定 |
| `ocr_xhs_covers.py` | 小红书封面 OCR | ✅ 稳定 |
| `download_xhs_covers.py` | 小红书封面下载 | ✅ 稳定 |
| `xhs_extract_helper.py` | 小红书提取辅助 | ✅ 稳定 |

### 子目录参考

| 目录 | 内容 |
|------|------|
| `analyzers/` | 卡片规则分析器（4 文件） |
| `text_extractors/` | 多格式文本提取器（7 文件） |
| `evidence/` | 脚本的循证模块（可能为空） |
| `archive/` | 已归档的旧脚本（3 文件） |
| `__pycache__/` | Python 缓存（忽略） |

## 管线数据流

```
raw/ → text_extractors/（多格式提取）
                              ↓
                    extract_pipeline.py（主线编排）
                              ↓
                    analyzers/（规则分析→结构化）
                              ↓
                    data/*.json（卡片数据）
                              ↓
                    card_manager.py（CRUD 维护）
                    qc_full_scan.py（质量保障）
```

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
