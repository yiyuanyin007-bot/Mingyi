# 卡片结构简版（v0.3 · 按 DeepSeek battle 结论修正）

本文档定义 `text-to-cards` Skill 第一步会产出的核心卡片结构。

完整设计见项目顶层设计：
`C:\Users\Chen\WorkBuddy\Claw\_design\00-顶层设计-最终对齐版.md`

前端原型参考：
`C:\Users\Chen\Desktop\shanghanlun-v7.html`

**v0.3 核心修正**（来自 2026-06-13 DeepSeek battle）：
- 症状从 `core/secondary` 二分改为 `necessary/common/excluding` 三分
- 删除静态 `confusable_formulas`，改为用户级个人混淆矩阵
- 增加 `lineage` 字段追踪方剂加减谱系
- 经验卡增加 `subjective_effective` / `objective_change` 客观化记录
- 明确 MVP 阶段只自动提取 `source_card`（条文卡）

---

## 1. 设计原则

1. **JSON 是真相源**：Skill 最终输出 JSON，Markdown 只是人工审阅的中间视图。
2. **MVP 阶段只做条文卡自动提取**：方剂卡和经验卡在临床使用/学习对话中逐步填充。
3. **小白优先**：初始用户是不知道方名、药物、症状的初学者，基础映射训练是合理起点。
4. **数据飞轮**：交互过程即数据采集，字段预留比数据完整更重要。
5. **双轨制**：每张方剂卡同时维护 `canonical`（原文标准）和 `empirical_distribution`（经验分布）。

---

## 2. 条文卡（source_card）—— MVP 自动提取重点

原文条文作为独立节点，是后续一切卡片的基础。

```json
{
  "id": "shl-012",
  "type": "source_card",
  "source": "伤寒论",
  "chapter": "太阳病篇",
  "article_number": "一二",
  "text": "太阳病，头痛，发热，汗出，恶风，桂枝汤主之。",
  "mentioned_formulas": ["桂枝汤"],
  "symptoms": ["头痛", "发热", "汗出", "恶风"],
  "key_conclusion": "桂枝汤主之"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识，建议格式 `shl-012` |
| `type` | string | 固定 `source_card` |
| `source` | string | 来源典籍，如 `伤寒论`、`金匮要略` |
| `chapter` | string | 所属篇目 |
| `article_number` | string | 原文编号，如 `一二`、`四一` |
| `text` | string | 原文完整内容 |
| `mentioned_formulas` | string[] | 本条文提到的方剂名 |
| `symptoms` | string[] | 条文中出现的症状词 |
| `key_conclusion` | string | 结论性语句，如 `桂枝汤主之` |

---

## 3. 方剂卡（formula_card）—— 学习过程中逐步填充

```json
{
  "id": "gui-zhi-tang",
  "type": "formula_card",
  "name": "桂枝汤",
  "formula_name": "桂枝汤",
  "role": "主方",
  "desc": "太阳中风主方",
  "tags": ["太阳病", "解表剂", "风伤卫", "太阳病篇"],
  "source_chapter": "太阳病篇",
  "source_text_ids": ["shl-012", "shl-013"],
  "lineage": {
    "base_formula": "桂枝汤",
    "variant_path": [],
    "reference_source": "伤寒论原文"
  },
  "created_at": "2026-06-13T00:00:00",
  "updated_at": "2026-06-13T00:00:00",
  "data": {
    "canonical": {
      "symptom_profile": {
        "necessary": ["汗出", "恶风"],
        "common": ["头痛", "发热", "脉浮缓"],
        "excluding": ["无汗", "脉浮紧"]
      },
      "pathology": "风邪袭表，营卫不和",
      "herbs": [
        {"name": "桂枝", "dosage": "三两"},
        {"name": "芍药", "dosage": "三两"},
        {"name": "甘草", "dosage": "二两"},
        {"name": "生姜", "dosage": "三两"},
        {"name": "大枣", "dosage": "十二枚"}
      ],
      "usage": "以水七升，微火煮取三升，去滓，适寒温，服一升",
      "contraindications": ["无汗", "脉浮紧（麻黄汤证）"]
    },
    "empirical_distribution": {
      "symptom_frequency": {
        "汗出": 0.92,
        "恶风": 0.88,
        "头痛": 0.75,
        "发热": 0.70,
        "脉浮缓": 0.65
      }
    },
    "variants": ["gui-zhi-jia-ge-gen-tang"],
    "allow_multiple": false,
    "mapping_note": ""
  },
  "experience_ids": [],
  "mastery": {
    "0→1": {"label": "方名→症状", "level": 0, "status": "未知", ...},
    "1→0": {"label": "症状→方名", "level": 0, "status": "未知", ...},
    "0→2": {"label": "方名→药物", "level": 0, "status": "未知", ...},
    "2→0": {"label": "药物→方名", "level": 0, "status": "未知", ...},
    "0→usage": {"label": "方名→煎服法", "level": 0, "status": "未知", ...},
    "0→contra": {"label": "方名→禁忌", "level": 0, "status": "未知", ...}
  }
}
```

### 字段说明

#### `lineage`

记录方剂的谱系，解决"加减到什么程度仍算原方"的问题。

```json
{
  "base_formula": "桂枝汤",
  "variant_path": ["加葛根"],
  "reference_source": "伤寒论原文"
}
```

#### `data.canonical.symptom_profile`

**三分法**（DeepSeek battle 结论）：

| 字段 | 含义 | 示例 |
|------|------|------|
| `necessary` | 必须出现的症状，是此方成立的必要条件 | 桂枝汤：`汗出`、`恶风` |
| `common` | 常见但非必须的症状 | 桂枝汤：`头痛`、`发热`、`脉浮缓` |
| `excluding` | 出现则排除此方的否定症 | 桂枝汤：`无汗`、`脉浮紧` |

#### `data.empirical_distribution`

临床数据累积后的真实症状概率分布。MVP 阶段可空，但字段必须预留。

#### `data.variants`

基础方的加减变体 ID 列表。变体卡片通过 `parent_formula_id` 指回基础方。

#### `confusable_formulas` 的处理

**不再作为静态字段存储**。改为每个用户维护个人混淆矩阵，训练时优先使用个人高频混淆方作为干扰项。系统只提供初始候选集，不硬编码在卡片里。

#### `mastery`

**运行时状态**，由前端/WorkBuddy API 维护。text-to-cards 技能在生成卡片时只需初始化空结构。

---

## 4. 训练向量（按 battle 结论精简）

| 类别 | 向量 | 方向 | 说明 |
|------|------|------|------|
| 基础必备 | `0→1` | 方名→症状 | 看到方名能说出适应症状 |
| 基础必备 | `1→0` | 症状→方名 | 看到症状能想到候选方 |
| 基础必备 | `0→2` | 方名→药物 | 知道组成 |
| 基础必备 | `2→0` | 药物→方名 | 看到组成知道方名 |
| 辅助保留 | `0→usage` | 方名→煎服法 | 低频，权重降低 |
| 安全防护 | `0→contra` | 方名→禁忌 | 独立向量，防止误用 |
| 进阶预留 | — | 症状→加减法 | 系统演化后接入 |
| 进阶预留 | — | 多症状→多方排序 | 系统演化后接入 |

**说明**：
- 小白阶段只开启基础必备 + 安全防护向量。
- 煎服法作为低频辅助，不与前四个向量同等权重。
- 加减法和多方排序是进阶能力，MVP 不做。

---

## 5. 经验卡（experience_card）—— 手工创建

```json
{
  "id": "gui-zhi-tang_exp-001",
  "type": "experience_card",
  "parent_formula_id": "gui-zhi-tang",
  "source_text_id": "shl-012",
  "title": "桂枝汤治汗出恶风一例",
  "source": "个人医案",
  "source_type": "个人医案",
  "topic": "临床应用",
  "content": "患者 XX，汗出恶风...",
  "lineage": {
    "base_formula": "桂枝汤",
    "variant_path": [],
    "reference_source": "个人临床"
  },
  "efficacy": {
    "subjective_effective": true,
    "objective_change": ["体温下降", "汗出减少"],
    "confidence_level": "高"
  },
  "unlock_level": 1,
  "tags": ["桂枝汤", "汗出", "恶风"],
  "created_at": "2026-06-13T00:00:00",
  "updated_at": "2026-06-13T00:00:00"
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `parent_formula_id` | string | 关联的方剂卡 ID |
| `source_text_id` | string | 关联的条文卡 ID（可选） |
| `source` / `source_type` | string | 经验来源 |
| `topic` | string | 主题 |
| `content` | string | 经验描述 |
| `lineage` | object | 用药谱系 |
| `efficacy.subjective_effective` | bool | 患者自觉好转 |
| `efficacy.objective_change` | string[] | 客观查体/指标变化 |
| `efficacy.confidence_level` | string | `高` / `中` / `低` |
| `unlock_level` | int | 经验提示解锁层级：0=小白不可见，1=Level 1，2=Level 2 |

---

## 6. 辨析卡（comparison_card）【进阶可选】

用于把常见易混方的对比固化为卡片。

```json
{
  "id": "compare-gui-zhi-vs-ma-huang",
  "type": "comparison_card",
  "formulas": ["gui-zhi-tang", "ma-huang-tang"],
  "dimensions": [
    {"axis": "汗出", "gui-zhi-tang": "有汗", "ma-huang-tang": "无汗"},
    {"axis": "脉象", "gui-zhi-tang": "浮缓", "ma-huang-tang": "浮紧"}
  ],
  "key_takeaway": "有汗用桂枝，无汗用麻黄"
}
```

MVP 阶段不做，可作为 AI 导师对话的产物。

---

## 7. 卡片关系总览

```
source_card（条文卡）
    │
    ├── referenced_by ── formula_card（方剂卡）
    │       │
    │       ├── has_variant ── formula_card（变体方）
    │       │
    │       └── has_experience ── experience_card（经验卡）
    │
    └── discussed_in ── ai_tutor/notes/（三级笔记）
```

---

## 8. MVP 阶段的输出边界

`text-to-cards` Skill 在 MVP 阶段的目标：

- **必须自动产出**：`source_card`（条文卡）
- **不自动产出**：完整的 `formula_card`、经验卡
- **预留字段**：`lineage`、`symptom_profile`、`efficacy` 等，供后续填充
- **不处理**：扫描版 PDF OCR、经验卡自动提取、静态混淆关系
