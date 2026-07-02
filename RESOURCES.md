# 经方学习系统 v8 · 资源清单

> 记录所有数据来源、关键文件与常用脚本位置，方便后续维护和扩展。

---

## 1. 数据来源

### 1.1 老师小红书笔记

- **老师账号**：小红书「针道轩」
- **笔记系列**：「每日学伤寒｜学《伤寒论》第 XXX 条」
- **本地归档**：
  - `extracted/xiaohongshu_teacher/notes_catalog.json/.md`
  - `extracted/xiaohongshu_teacher/covers/`（238 张封面原图）
  - `extracted/xiaohongshu_teacher/notes_ocr.json/.md`
  - `extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（按条文编号排序的干净摘录）
- **用途**：提供第 1–369 条原文与多位老师讲解，是制卡的主要来源。

### 1.2 本地条文汇编

- **文件**：`extracted/太阳病.md`
- **内容**：198 条清洗后的太阳病相关条文，按来源分组。
- **用途**：校验症状、药物、禁忌。
- **已知缺口**：严格匹配「太阳病」会漏掉「太阳中风」「伤寒」开头的条文，需结合老师笔记补充。

### 1.3 注解资料

**原始素材（只读）**

- `raw/annotations/倪海夏-人纪- 伤寒论.txt`
- `raw/annotations/原版影印版-倪海厦-人纪-伤寒论.pdf`
- `raw/annotations-chm/`（《伤寒九十论》《伤寒心法要诀》《伤寒悬解》、黄煌沙龙、倪海厦讲座等 CHM 源文件）

**提取/清洗产物**

- `extracted/annotations/倪海厦伤寒论_extracted.md`
- `extracted/annotations/桂枝类方_extracted.md`
- `extracted/annotations/倪海厦-人纪-伤寒论_cleaned.txt`
- `extracted/黄煌教授经方沙龙/`（已清洗的 115 篇 Markdown + catalog）

- **用途**：补充病机串讲、类方对比、现代应用。

---

## 2. 核心数据文件

| 文件 | 说明 | 当前规模 |
|---|---|---|
| `data/formula_cards.json` | 方剂卡片真相源 | **63 张**，含核心药物组合与参考资料链接 |
| `data/source_cards.json` | 原文条文卡 | **398 条**（article-001 至 article-398，覆盖 8 个篇章） |
| `data/experience_cards.json` | 临床医案卡（待扩展） | 1 张 |
| `data/sp_cases.json` | 标准化病人（SP）病例 | 8 例 |
| `data/source_article_map.json` | 条文映射机器可读表 | 43 条 |
| `data/symptom_expression_index.json` | 症状口语表达索引 | 126 个症状 |
| `data/sun_target_formulas.json` | 36 目标方覆盖清单 | 36 项，已覆盖 36 |
| `data/core_herbs_research.json` | 核心药物组合研究资料 | 35 条，10 条附带来源链接 |

---

## 3. 前端入口

| 文件 | 说明 |
|---|---|
| `app/index.html` | 桌面版主入口（推荐），已接入：核心药物组合、练习/考试模式、交互式学习视图、**搜索聚类复习**、**错题本编辑删除**、**临床录入两阶段工作流**、**条文系统重构 v2（slidePanel + 对比标签 + 提取练习）**。 |
| `app/shanghanlun-v8-mvp.html` | 早期 MVP，保留 10 张卡片，作为备份与数据源。 |
| `app/mobile.html` | 移动端入口（部分功能同步中，搜索聚类复习已接入）。 |
| `经方学习系统.bat` | Windows 启动脚本，默认打开 `app/index.html`。 |

---

## 4. 脚本工具

| 脚本 | 用途 |
|---|---|
| `scripts/phase1_patch_index.py` | 对 `app/index.html` 应用 Phase 1 补丁。 |
| `scripts/phase2_extend_sun_cards.py` | 扩展 `data/formula_cards.json` 到 25 张。 |
| `scripts/phase2b_extend_remaining.py` | 补充剩余 10 张核心目标方，目标清单覆盖 36/36。 |
| `scripts/clean_text_v2.py` | 来源感知文本清洗。 |
| `scripts/check_coverage.py` | 检查 36 目标方在 `extracted/太阳病.md` 中的覆盖情况。 |
| `scripts/sp_generator.py` | SP 批量生成器（支持 `--formula`/`--all`/`--chapter` 参数）。 |
| `scripts/governance.py` | 项目治理自动化检查（备份/验证/JSON检查/SP检查）。 |

---

## 5. 本地服务

```powershell
Set-Location -LiteralPath 'C:\Users\Chen\Desktop\经方学习系统（旧版）'
python -m http.server 8100
```

访问：`http://localhost:8100/app/index.html`

---

## 6. 备份策略

- 修改 `app/index.html` 前备份到 `app/archive/`。
- 修改 `data/*.json` 前备份到 `data/archive/`。
- 使用 `scripts/phase*_*.py` 脚本可复现大部分修改。

---

## 7. 扩展方向

1. 把 `extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md` 与老师讲解接入 `source_cards.json`（已完成 398 条）。
2. 同步 `app/mobile.html` 的最新改动（搜索聚类复习已接入，部分功能同步中）。
3. 把 `clinical/` 医案整理为 `experience_cards.json`。
4. 扩展六经覆盖范围（已覆盖 63/96 方，33 方待补：太阴/厥阴/差后劳复严重不足）。
5. 部署到静态托管平台（GitHub Pages / Netlify / Vercel）。
6. 循证审计扩展到 6 方以上，建立完整的文献验证数据库。
7. SP 系统批量生成管线扩展至 63 方全覆盖。
8. v9 组件化重构完成 MVP。
