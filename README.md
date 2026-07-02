# 经方学习系统

面向中医小白的《伤寒论》学习系统，核心是从现场义诊实战中沉淀个人经验数据，自动生成可复习的卡片和学习建议。

---

## 人类用法（只需三步）

1. **学习**：双击 `经方学习系统.bat`
2. **丢素材**：把新拿到的电子书、录音、笔记、PDF 全部丢进 `素材分拣/` 文件夹
3. **处理**：双击 `素材分拣/处理新素材.bat`

搞定。AI 会自动把素材分类到该去的地方。

---

## 进阶入口

- **项目总览/进度/坑**：`INDEX.md` ← 每次回来先看这个
- **项目规范**：`PROJECT-STRUCTURE.md`
- **卡片数据**：`data/`
- **原始素材**：`raw/`
- **临床记录**：`clinical/`
- **循证审计系统**：`docs/evidence/`（小建中汤/桂枝汤/麻黄汤审计报告）
- **标准化病人（SP）系统**：`standardized-patient/`
- **v9 组件化重构**：`app/v9/`

---

## 核心流程

```
原始素材（raw/）
    │
    ├── 经典原文 → segment_text.py → extracted/source_cards/
    ├── 注家讲解 → 人工审阅 → extracted/experiences/
    ├── 临床资料 → daily_review.py → clinical/YYYY-MM-DD/学习建议.md
    └── 循证审计 → docs/evidence/reports/（文献验证工作流）
    │
    ▼
卡片数据库（data/*.json：63 方 + 398 条条文 + 8 SP 病例）
    │
    ├── 方剂训练 → app/index.html（学习/考试/搜索聚类复习）
    ├── 临床录入 → app/index.html（两阶段工作流）
    ├── 条文学习 → app/index.html（slidePanel + 对比标签）
    └── SP 问诊 → app/index.html（选择式问诊考试）
```

---

## 常用命令

### 重新生成演示卡片

```powershell
python .agents/skills/text-to-cards/scripts/build_demo_cards.py
python scripts/sync_data.py
```

### 从原文提取条文卡候选

```powershell
cd .agents/skills/text-to-cards
python scripts/segment_text.py `
  --input "../../../extracted/annotations/倪海厦-人纪-伤寒论_cleaned.txt" `
  --scope "../../../config/scope_伤寒论常用方.txt" `
  --output "../../../extracted/source_cards/倪海厦_伤寒论常用方.md"
```

### 生成每日学习建议

```powershell
python .agents/skills/text-to-cards/scripts/daily_review.py --date 2026-06-14
```

会自动读取 `clinical/2026-06-14/`，生成 `clinical/2026-06-14/2026-06-14_学习建议.md`。

---

## 目录结构

详见 `PROJECT-STRUCTURE.md`。

---

## 端口管理

本项目遵循全局端口治理方案，端口块为 **8100-8109**。

| 端口 | 用途 | 状态 |
|---|---|---|
| **8100** | 主端口（桌面版 `app/index.html`） | 活跃 |
| **8101** | 备用端口（手机版/冲突自动切换） | 活跃 |

**禁止端口**：3000、5000、8000、8080、8081、9000（全局冲突区，禁止使用）

**启动方式**：
- 桌面版：`python start_server.py`（端口 8100）或双击 `经方学习系统.bat`
- 手机版：`python start_server.py 8101` 或双击 `经方学习系统-手机版.bat`

详见 `PORT_CONFIG.md`。

---

## 当前状态

- **63 张方剂卡** + **398 条条文卡** + **8 例 SP 病例**
- v8 前端：单栏学习 / 双栏考试 / 搜索聚类复习 / 错题本编辑删除
- 临床录入系统：两阶段工作流（采集评估→补采→匹配→条文联动）
- 循证审计系统：3 方试点完成（小建中汤/桂枝汤/麻黄汤），工作流已固化
- 条文系统重构 v2：统一 slidePanel + 对比标签 + 我的理解 + 提取练习
- v9 组件化重构进行中：`app/v9/`（Vite + Vitest + Playwright）
