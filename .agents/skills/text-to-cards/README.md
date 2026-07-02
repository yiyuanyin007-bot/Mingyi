# text-to-cards Skill · MVP 版

从《伤寒论》《金匮要略》等原典/注解文本中自动提取**条文卡（source_card）**，并接入前端训练系统。

**MVP 阶段范围**（根据 DeepSeek battle 结论）：
- ✅ 自动提取 `source_card`（条文卡）
- ❌ 不自动提取完整 `formula_card`
- ❌ 不自动提取 `experience_card`
- ❌ 不处理扫描版 PDF OCR

## 文件结构

```
.
├── data/
│   ├── formula_cards.json      # 方剂卡演示数据
│   ├── source_cards.json       # 条文卡演示数据
│   └── experience_cards.json   # 经验卡演示数据
├── references/
│   ├── card-schema.md          # 卡片 JSON 结构 v0.3
│   └── element-types.md        # 可识别元素规则
├── scripts/
│   ├── segment_text.py         # 文本分段与元素识别
│   ├── build_demo_cards.py     # 生成演示卡片数据
│   ├── embed_db.py             # 将 JSON 嵌入 v7 前端
│   └── build_v8.py             # 生成 MVP v8 前端
├── templates/
│   └── v8-mvp.html             # MVP v8 前端模板
├── shanghanlun-v7-db.html      # 训练系统 v7 · DB 版
├── shanghanlun-v8-mvp.html     # 训练系统 v8 · MVP 版（推荐体验）
├── start_server.py             # 本地 HTTP 服务器
├── battle-prompt-deepseek.md   # DeepSeek 评审提示词
├── README.md                   # 本文件
└── SKILL.md                    # Skill 入口说明
```

## 快速体验

### 推荐：MVP v8 原型

双击打开：

```
shanghanlun-v8-mvp.html
```

v8 特点：
- 学习视图单栏，信息密度降低
- 考试视图双栏（题目在左，选项在右）
- 症状按 `必要症 / 常见症 / 排除症` 三分展示
- 去掉红黄绿焦虑色，去掉"逾期"标签
- 包含简单的测试交互和掌握度更新

### 旧版：v7 三栏原型

双击打开：

```
shanghanlun-v7-db.html
```

## 本地服务器（可选）

```powershell
python start_server.py
# 浏览器访问 http://localhost:8100/app/shanghanlun-v8-mvp.html
```

## 重新生成演示数据

```powershell
python scripts/build_demo_cards.py
python scripts/build_v8.py
```

> 生成后请把 `data/*.json` 同步到项目根目录的 `data/` 文件夹。

## 当前数据范围

演示版包含 5 张方剂卡：

- 桂枝汤
- 麻黄汤
- 葛根汤
- 大承气汤
- 小柴胡汤

每张卡片包含：

- 原文条文
- 症状三分法：`necessary` / `common` / `excluding`
- 药物组成
- 病机 / 禁忌 / 煎服法
- `lineage` 谱系字段
- 变体方

## 每日临床回顾（daily-review Skill）

把每天的录音转写和现场笔记放入文件夹，运行：

```powershell
python scripts/daily_review.py --date 2026-06-14
```

默认读取项目根目录 `clinical/2026-06-14/` 下的资料。

会生成 `2026-06-14_学习建议.md`，告诉你今天应该从哪些卡片开始学。

文件夹模板见 `field-notes/daily-folder-template.md`，示例见 `field-notes/YYYY-MM-DD-template/`。

## 设计决策记录

见 `docs/思路与经验.md`（如已复制）或 `C:\Users\Chen\WorkBuddy\Claw\思路与经验.md`。

个人实战经验见 `field-notes/个人经验-李法师.md`。
