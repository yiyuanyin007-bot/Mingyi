# extracted/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 417（含子目录 + 小红书中间数据）
> **用途**: 经方学习系统从原始素材中提取的结构化知识中间产物，是 raw/ → data/ 管线的处理结果

## 快速索引

### 子目录

| 目录 | 文件数 | 内容 | 状态 |
|------|--------|------|------|
| `annotations/` | — | 从 raw/annotations/ 提取的标注数据 | ✅ 已处理 |
| `source_cards/` | — | 源文章卡片提取中间文件 | ✅ 已处理 |
| `formula_elements/` | — | 方剂要素提取文件 | ✅ 已处理 |
| `experiences/` | — | 经验知识提取文件 | ✅ 已处理 |
| `xiaohongshu_teacher/` | ~300 | 小红书教师主题封面图片（PNG 格式） | 📝 采集 |
| `黄煌教授经方沙龙/` | ~120+ | 黄煌经方沙龙清洗后文档（50+ 药证 + 70+ 医案） | ✅ 已处理 |
| `pilot_si_ni_tang/` | — | 四逆汤试点数据 | 🗑 临时 |

### 小红书数据处理文件（xhs_*）

| 文件 | 功能 | 状态 |
|------|------|------|
| `xhs_cards.json` | 小红书卡片数据（最终结构化卡片） | ✅ 已集成 |
| `xhs_notes.json` | 小红书笔记数据汇总 | ✅ 已使用 |
| `xhs_initial.json` | 小红书初始抓取数据 | 🗑 中间态 |
| `xhs_initial_state.json` | 初始状态快照 | 🗑 中间态 |
| `xhs_feed_keys.json` / `xhs_feed_valid.json` | 信息流键/有效内容 | 🗑 中间态 |
| `xhs_feeds_value.json` | 信息流值 | 🗑 中间态 |
| `xhs_keys.json` / `xhs_map_keys.json` | 键值映射 | 🗑 中间态 |
| `xhs_network_list*.json` | 网络列表（2 份） | 🗑 中间态 |
| `xhs_note_info*.json` | 笔记详情（3 份） | 🗑 中间态 |
| `xhs_note_keys.json` | 笔记键索引 | 🗑 中间态 |
| `xhs_note_map.json` | 笔记映射 | 🗑 中间态 |
| `xhs_note_page_fetch.json` | 笔记分页抓取 | 🗑 中间态 |
| `xhs_note_sample.json` | 笔记采样 | 🗑 中间态 |
| `xhs_note_state_keys.json` | 笔记状态键 | 🗑 中间态 |
| `xhs_noteids.json` | 笔记 ID 索引 | 🗑 中间态 |
| `xhs_user_posted_fetch.json` | 用户发布抓取 | 🗑 中间态 |
| `xhs_userfile_keys.json` | 用户文件键 | 🗑 中间态 |
| `xhs_req_detail.json` | 请求详情 | 🗑 中间态 |
| `xhs_single_extract.json` | 单条提取 | 🗑 中间态 |
| `xhs_snapshot.json` | 小红书快照 | 🗑 中间态 |
| `xhs_eval.json` | 小红书评估 | 📝 评估 |

### 状态报告

| 文件 | 功能 | 状态 |
|------|------|------|
| `index.json` | 提取索引文件 | ✅ 稳定 |
| `phase1_status.json` | Phase 1 状态报告 | 🗑 已用 |
| `phase1_text.json` | Phase 1 文本提取报告 | 🗑 已用 |
| `coverage_check.md` | 覆盖度检查报告 | ✅ 稳定 |
| `sample_segments_raw.md` | 分段采样原始 | ✅ 稳定 |
| `sample_segments_v1.md` / `v2.md` | 分段采样处理版 | ✅ 稳定 |
| `cleaning_scores.md` | 清洗评分 | ✅ 稳定 |
| `cleaning_strategy_report.md` | 清洗策略报告 | ✅ 稳定 |
| `太阳病.md` | 太阳病专题数据 | ✅ 稳定 |
| `太阳病对比报告.md` | 太阳病对比分析 | ✅ 稳定 |

## 数据流

```
raw/
├── annotations/ ──→ extracted/annotations/（标注提取）
├── extracted-chm/ ──→ extracted/黄煌教授经方沙龙/（CHM→清洗后文档）
│                       └→ extracted/source_cards/（源文章提取）
│                       └→ extracted/formula_elements/（方剂要素）
│                       └→ extracted/experiences/（经验知识）
│
raw/（小红书）──→ extracted/xhs_*（40+ 中间态 JSON）
                    └→ extracted/xhs_cards.json（最终结构化卡片）
                    └→ extracted/xiaohongshu_teacher/（封面图片）
```

**处理管线**: `scripts/extract_pipeline.py` 驱动 raw/ → extracted/ → data/ 的全流程。

**中间态清理策略**: 小红书 xhs_* 文件为逐步解析的中间产物，最终有价值的输出是 `xhs_cards.json`（已集成到 data/）。

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
