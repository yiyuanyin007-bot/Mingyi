# 标准化病人 JSON 数据 Schema（v1.0）

> 定义标准化病人（SP）会话的完整 JSON 数据结构。
> 所有 AI 生成的 SP 数据必须严格遵循此 Schema，确保前端可直接消费。

---

## 根对象（Session）

```json
{
  "schema_version": "1.0.0",
  "session_id": "string",
  "mode": "article | formula",
  "difficulty": 1,
  "difficulty_config": { ... },
  "patient": { ... },
  "chief_complaint": { ... },
  "inquiries": { ... },
  "physical_exam": { ... },
  "case_summary": "string",
  "question": { ... },
  "answer_key": { ... },
  "reference_analysis": { ... }
}
```

---

## 1. 元数据（Metadata）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `schema_version` | string | 是 | 固定 `"1.0.0"`，便于后续版本兼容检测 |
| `session_id` | string | 是 | 唯一会话 ID，格式 `sp-{经典代号}-{编号}-{时间戳}`，如 `sp-SHL-ty-12-20260617-143000` |
| `mode` | enum | 是 | `"article"`（条文模式）或 `"formula"`（方剂模式） |
| `difficulty` | integer | 是 | 难度等级：1=简单，2=中等，3=困难 |
| `difficulty_config` | object | 是 | 本轮具体参数配置（见下文） |
| `source_article` | string | 是 | 正确答案的条文 ID，如 `"SHL-ty-12"` |
| `source_classic` | string | 是 | 经典名称，如 `"伤寒论"` |
| `chapter` | string | 是 | 篇章名，如 `"太阳病篇"` |

---

## 2. 难度配置（difficulty_config）

```json
{
  "difficulty_config": {
    "inquiry_slots": 5,
    "l2_allowance_per_direction": 1,
    "l3_noise_probability": 0.3,
    "distractor_count": 4,
    "distractor_level": "medium",
    "physical_exam_completeness": "full",
    "chief_complaint_directness": "moderate",
    "random_seed": "optional-for-reproducibility"
  }
}
```

| 字段 | 类型 | 必填 | 说明 | 难度值对照 |
|------|------|------|------|-----------|
| `inquiry_slots` | integer | 是 | 学生可选择的问诊方向数（从 10 个中选） | 简单=8，中等=5，困难=3 |
| `l2_allowance_per_direction` | integer | 是 | 每个方向可追问 L2 的次数 | 简单=2，中等=1，困难=0 |
| `l3_noise_probability` | float | 是 | L3 噪声触发概率（0.0-1.0） | 简单=0.1，中等=0.3，困难=0.5 |
| `distractor_count` | integer | 是 | 错误选项数量（总选项数 = 1 + distractor_count） | 固定 4（总 5 选项） |
| `distractor_level` | enum | 是 | 干扰项强度：`"easy"`, `"medium"`, `"hard"` | 简单=easy，中等=medium，困难=hard |
| `physical_exam_completeness` | enum | 是 | 查体完整度：`"full"`, `"pulse_only"`, `"minimal"` | 简单=full，中等=full，困难=pulse_only |
| `chief_complaint_directness` | enum | 是 | 主诉直接度：`"explicit"`, `"moderate"`, `"implicit"` | 简单=explicit，中等=moderate，困难=implicit |
| `random_seed` | string | 否 | 可复现性种子，用于调试和考试公平 |

### 难度配置与难度等级的映射关系

```yaml
难度 1（简单）:
  inquiry_slots: 8
  l2_allowance_per_direction: 2
  l3_noise_probability: 0.1
  distractor_count: 4
  distractor_level: easy
  physical_exam_completeness: full
  chief_complaint_directness: explicit

难度 2（中等）:
  inquiry_slots: 5
  l2_allowance_per_direction: 1
  l3_noise_probability: 0.3
  distractor_count: 4
  distractor_level: medium
  physical_exam_completeness: full
  chief_complaint_directness: moderate

难度 3（困难）:
  inquiry_slots: 3
  l2_allowance_per_direction: 0
  l3_noise_probability: 0.5
  distractor_count: 4
  distractor_level: hard
  physical_exam_completeness: pulse_only
  chief_complaint_directness: implicit
```

### 无感升级机制

系统可根据用户熟悉度自动调整 `difficulty_config` 中的单项参数，而不改变 `difficulty` 整数值：

```yaml
示例：用户熟悉度 0.7（已通过70%的桂枝汤类方）
  保持 difficulty: 1（UI 仍显示简单）
  但调整：
    inquiry_slots: 6（从8降到6）
    l3_noise_probability: 0.2（从0.1升到0.2）
    chief_complaint_directness: moderate（从 explicit 变 moderate）
```

> 关键：前端不判断难度逻辑，只读取 `difficulty_config` 中的参数值。所有升级策略由后端生成器控制。

---

## 3. 患者信息（patient）

```json
{
  "patient": {
    "name": "王女士",
    "age": 32,
    "gender": "女",
    "occupation": "公司文员",
    "background": "有3岁孩子，最近商场吹空调受凉",
    "persona_id": "anxious-middle-aged-female"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 患者姓名（可随机生成） |
| `age` | integer | 是 | 年龄（应与条文适配，如"太阳病"多为成人） |
| `gender` | string | 是 | `"男"` / `"女"` / `"未说明"` |
| `occupation` | string | 是 | 职业（用于生活场景化描述） |
| `background` | string | 是 | 背景简述（家庭、近期活动、触发事件） |
| `persona_id` | string | 是 | 人格类型 ID（见 `persona_system.md`） |

---

## 4. 主诉（chief_complaint）

```json
{
  "chief_complaint": {
    "text": "大夫，我来看病两天了...",
    "revealed_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "l0_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "directness": "moderate",
    "word_count": 186
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 完整口语化主诉文本 |
| `revealed_symptoms` | string[] | 是 | 主诉中已暴露的症状关键词（与 `symptom_pool` 对齐） |
| `l0_symptoms` | string[] | 是 | L0 级症状（主动暴露），等同于 `revealed_symptoms` |
| `directness` | enum | 是 | 主诉直接度：`"explicit"`, `"moderate"`, `"implicit"`。必须与 `difficulty_config.chief_complaint_directness` 一致 |
| `word_count` | integer | 否 | 字数统计，用于控制主诉长度 |

### 主诉直接度示例（同一桂枝汤证）

```yaml
explicit:
  text: "我发烧出汗怕风三天了，出汗擦了又有，风吹就起鸡皮疙瘩。"
  revealed_symptoms: ["发热", "汗出", "恶风"]

moderate:
  text: "大夫，我来看病两天了。就是前几天带娃去商场，里面空调开得特别冷，回来第二天就开始不舒服。身上热乎乎的，但量体温也就37度5到38度。最让我烦的是出汗——稍微动一下就一身汗，擦了又有。还有，风吹过来就觉得冷，起鸡皮疙瘩，家里风扇都不敢开。鼻子也有点塞，呼吸声重。"
  revealed_symptoms: ["发热", "汗出", "恶风", "鼻鸣"]

implicit:
  text: "大夫，我这两天觉得身体不对劲。带娃去商场回来就这样了，我老觉得冷，但又不是发烧那种烫。汗挺多的，衣服湿了好几件。我老婆说我最近总缩在被子里，风扇都不敢开。 nose有点不通，我也不知道是不是感冒。您说这是不是要变肺炎了？"
  revealed_symptoms: ["汗出", "恶风", "发热", "鼻鸣"]
  # 注意："发热"被包裹在"不是发烧那种烫"的否定句式中，更隐晦
```

---

## 5. 问诊方向（inquiries）

```json
{
  "inquiries": {
    "01_寒热": {
      "direction_id": "01_寒热",
      "direction_name": "寒热",
      "keywords": ["怕冷", "发热", "寒热往来"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": { ... },
      "l2": { ... },
      "l3_noise": { ... }
    },
    "02_汗出": { ... },
    "03_头身": { ... },
    "04_二便": { ... },
    "05_饮食": { ... },
    "06_胸腹": { ... },
    "07_耳目": { ... },
    "08_睡眠": { ... },
    "09_旧病": { ... },
    "10_诱因": { ... }
  }
}
```

### 每个方向的对象结构

```json
{
  "direction_id": "01_寒热",
  "direction_name": "寒热",
  "keywords": ["怕冷", "发热", "寒热往来"],
  "available": true,
  "required_for_difficulty": [1, 2, 3],
  "l1": {
    "text": "就是怕风，风吹过来就起鸡皮疙瘩...",
    "revealed_symptoms": ["恶风", "啬啬恶寒", "翕翕发热"],
    "sample_question": "怕冷吗？发烧吗？"
  },
  "l2": {
    "trigger_question": "什么时候最热？什么时候最冷？",
    "text": "汗出了之后更觉得冷，缩在被子里也不敢伸胳膊出去...",
    "revealed_symptoms": ["汗后恶寒"]
  },
  "l3_noise": {
    "probability": 0.3,
    "triggered": false,
    "text": "我觉得是空调吹的，应该吃点感冒清热颗粒吧？",
    "type": "自我用药",
    "misleading_symptom": "错误归因"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `direction_id` | string | 是 | 固定格式：`"01_寒热"` 到 `"10_诱因"` |
| `direction_name` | string | 是 | 中文方向名 |
| `keywords` | string[] | 是 | 该方向下的关键词列表 |
| `available` | boolean | 是 | 本轮是否可用（某些难度可能禁用部分方向） |
| `required_for_difficulty` | integer[] | 是 | 哪些难度级别此方向可用 |
| `l1` | object | 是 | 浅层信息（学生选此方向即得） |
| `l2` | object | 是 | 深层信息（需追问触发） |
| `l3_noise` | object | 是 | 噪声/误导信息 |

### L1 结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | SP 口语化回答 |
| `revealed_symptoms` | string[] | 是 | 此回答中暴露的症状 |
| `sample_question` | string | 是 | 触发此回答的典型问法（给前端参考） |

### L2 结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `trigger_question` | string | 是 | 学生需要追问的具体问法 |
| `text` | string | 是 | SP 追问后的回答 |
| `revealed_symptoms` | string[] | 是 | 追问后暴露的额外症状 |

### L3 噪声结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `probability` | float | 是 | 触发概率（0.0-1.0） |
| `triggered` | boolean | 是 | 本轮是否已触发（前端随机后更新） |
| `text` | string | 是 | 噪声内容 |
| `type` | enum | 是 | 噪声类型：`"自我用药"`, `"错误归因"`, `"网络诊断"`, `"情绪归因"`, `"质疑医生"` |
| `misleading_symptom` | string | 否 | 误导的症状方向 |

> **L3 触发规则**：JSON 中保留所有可能的噪声，前端根据 `l3_noise.probability` 随机决定是否触发。触发后更新 `triggered` 为 `true`，未触发的噪声不展示给学生。

---

## 6. 查体结果（physical_exam）

```json
{
  "physical_exam": {
    "completeness": "full",
    "inspection": {
      "tongue_body": "正常",
      "tongue_color": "淡红",
      "coating": "薄白",
      "special": ""
    },
    "auscultation": {
      "voice": "正常，略带鼻音",
      "breath": "正常",
      "cough": "无",
      "odor": "无"
    },
    "palpation": {
      "pulse_position": "浮",
      "pulse_rate": "缓",
      "pulse_shape": "弱",
      "pulse_force": "无力",
      "composite": "浮缓"
    },
    "pressing": {
      "abdomen": "柔软，喜按",
      "limbs": "温",
      "skin": "湿润，有汗"
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `completeness` | enum | 是 | 完整度：`"full"`, `"pulse_only"`, `"minimal"`。必须与 `difficulty_config.physical_exam_completeness` 一致 |
| `inspection` | object | 条件 | 望诊。`completeness` 非 `"full"` 时可省略或仅部分字段 |
| `auscultation` | object | 条件 | 闻诊。同上 |
| `palpation` | object | 条件 | 切诊（脉象）。通常不可省略，即使是 `pulse_only` 模式 |
| `pressing` | object | 条件 | 按诊。同上 |

### 查体完整度对照

```yaml
full:
  inspection: 完整
  auscultation: 完整
  palpation: 完整
  pressing: 完整

pulse_only:
  inspection: 省略（null）
  auscultation: 省略（null）
  palpation: 完整
  pressing: 省略（null）

minimal:
  inspection: 省略（null）
  auscultation: 省略（null）
  palpation: 仅 composite（如"浮缓"）
  pressing: 省略（null）
```

---

## 7. 病历摘要（case_summary）

```json
{
  "case_summary": "【主诉】\n王女士，32岁，公司文员。2天前商场吹空调受凉后起病。\n\n【现病史】\n- 发热：体温37.5-38℃，持续不退，热感如蒸桑拿\n- 汗出：动则汗出，擦之复有，汗后畏寒\n- 恶风：风吹即起鸡皮疙瘩，不敢开风扇\n- 鼻鸣：鼻塞，呼吸声重\n- 恶心：胃中恶心，闻油烟加重，但吐不出\n\n【查体】\n舌淡红苔薄白。脉浮缓。腹软喜按。四肢温，肌肤湿润有汗。\n\n【问诊选择】\n寒热 / 饮食 / 诱因"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `case_summary` | string | 是 | 预生成的病历摘要，前端在问诊结束后直接展示。格式为 Markdown 纯文本，段落分明 |

---

## 8. 答题选项（question）

### 模式 A：条文模式

```json
{
  "question": {
    "mode": "article",
    "options": [
      {
        "id": "SHL-ty-12",
        "label": "第12条",
        "snippet": "太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。",
        "is_correct": true,
        "distractor_type": "correct"
      },
      {
        "id": "SHL-ty-13",
        "label": "第13条",
        "snippet": "太阳病，头痛，发热，汗出，恶风，桂枝汤主之。",
        "is_correct": false,
        "distractor_type": "same_formula_simplified"
      },
      {
        "id": "SHL-ty-14",
        "label": "第14条",
        "snippet": "太阳病，项背强几几，反汗出恶风者，桂枝加葛根汤主之。",
        "is_correct": false,
        "distractor_type": "same_formula_variant"
      },
      {
        "id": "SHL-ty-31",
        "label": "第31条",
        "snippet": "太阳病，项背强几几，无汗恶风，葛根汤主之。",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      },
      {
        "id": "SHL-ty-35",
        "label": "第35条",
        "snippet": "太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风，无汗而喘者，麻黄汤主之。",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      }
    ]
  }
}
```

### 模式 B：方剂模式

```json
{
  "question": {
    "mode": "formula",
    "options": [
      {
        "id": "gui-zhi-tang",
        "name": "桂枝汤",
        "is_correct": true,
        "distractor_type": "correct"
      },
      {
        "id": "ge-gen-tang",
        "name": "葛根汤",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      },
      {
        "id": "ma-huang-tang",
        "name": "麻黄汤",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      },
      {
        "id": "gui-zhi-jia-ge-gen-tang",
        "name": "桂枝加葛根汤",
        "is_correct": false,
        "distractor_type": "same_formula_variant"
      },
      {
        "id": "da-qing-long-tang",
        "name": "大青龙汤",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      }
    ]
  }
}
```

### 选项对象结构

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 选项唯一标识（条文 ID 或方剂 ID） |
| `label` / `name` | string | 是 | 展示文字（条文模式用 `label` + `snippet`，方剂模式用 `name`） |
| `snippet` | string | 条件 | 条文模式必填：条文原文片段 |
| `is_correct` | boolean | 是 | 是否为正确答案 |
| `distractor_type` | enum | 是 | 干扰项类型（见下表） |

### 干扰项类型（distractor_type）枚举

| 类型 | 说明 | 难度 |
|------|------|------|
| `"correct"` | 正确答案 | — |
| `"same_formula_simplified"` | 同一方剂的简化条文 | 中等 |
| `"same_formula_variant"` | 同一方剂族（加减方） | 中等 |
| `"same_disease_different_formula"` | 同病（太阳病）不同方 | 简单/中等 |
| `"different_disease_similar_symptoms"` | 不同病但症状相似 | 困难 |
| `"same_symptom_opposite_pathology"` | 同一症状，病机相反（如汗出 vs 无汗） | 简单 |
| `"nearby_article_number"` | 相邻编号条文（迷惑记忆） | 简单 |
| `"incorrect_herb_composition"` | 药物组成相近但不同方 | 困难（方剂模式） |

### 干扰项生成策略（按难度）

```yaml
简单模式（distractor_level: easy）:
  - 至少1个 same_symptom_opposite_pathology（如放无汗方来对比汗出）
  - 至少1个 nearby_article_number（如放第13条来对比第12条）
  - 其他随意

中等模式（distractor_level: medium）:
  - 至少1个 same_formula_simplified（同方简化）
  - 至少1个 same_formula_variant（同方加减）
  - 至少1个 same_disease_different_formula（同病异方）

困难模式（distractor_level: hard）:
  - 至少1个 same_formula_variant（同方加减，症状极接近）
  - 至少1个 different_disease_similar_symptoms（不同病相似症状）
  - 至少1个 incorrect_herb_composition（方剂模式：药物相近）
```

---

## 9. 答案密钥（answer_key）

```json
{
  "answer_key": {
    "correct_article_id": "SHL-ty-12",
    "correct_formula_id": "gui-zhi-tang",
    "correct_article_number": 12,
    "correct_article_text": "太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。",
    "correct_formula_name": "桂枝汤",
    "correct_herbs": ["桂枝", "芍药", "甘草", "生姜", "大枣"]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `correct_article_id` | string | 是 | 正确答案条文 ID |
| `correct_formula_id` | string | 是 | 正确答案方剂 ID |
| `correct_article_number` | integer | 是 | 条文编号 |
| `correct_article_text` | string | 是 | 完整条文原文 |
| `correct_formula_name` | string | 是 | 方剂名称 |
| `correct_herbs` | string[] | 条件 | 药物组成（用于方剂模式或扩展） |

---

## 10. 参考分析（reference_analysis）

```json
{
  "reference_analysis": {
    "captured_vs_source": [
      {
        "symptom": "汗出",
        "in_patient": true,
        "in_source": true,
        "source": "chief_complaint",
        "level": "l0"
      },
      {
        "symptom": "恶风",
        "in_patient": true,
        "in_source": true,
        "source": "chief_complaint",
        "level": "l0"
      },
      {
        "symptom": "鼻鸣",
        "in_patient": true,
        "in_source": true,
        "source": "chief_complaint",
        "level": "l0"
      },
      {
        "symptom": "干呕",
        "in_patient": true,
        "in_source": true,
        "source": "inquiry-05_饮食",
        "level": "l1"
      },
      {
        "symptom": "脉浮缓",
        "in_patient": true,
        "in_source": true,
        "source": "physical_exam",
        "level": "physical"
      },
      {
        "symptom": "啬啬恶寒",
        "in_patient": true,
        "in_source": true,
        "source": "inquiry-01_寒热",
        "level": "l2"
      },
      {
        "symptom": "项背强几几",
        "in_patient": false,
        "in_source": false,
        "note": "本条文无此症状"
      }
    ],
    "key_differentials": [
      {
        "symptom": "汗出",
        "excludes": ["SHL-ty-31", "SHL-ty-35"],
        "reason": "葛根汤/麻黄汤均为无汗，而患者有汗，直接排除"
      },
      {
        "symptom": "鼻鸣干呕",
        "includes": ["SHL-ty-12"],
        "reason": "第12条独有鼻鸣干呕，第13条（同方简化）无此症状"
      },
      {
        "symptom": "项背强几几",
        "excludes": ["SHL-ty-14"],
        "reason": "第14条（桂枝加葛根汤）核心鉴别点是项背强几几，患者未提及"
      }
    ],
    "missed_opportunities": [
      {
        "direction": "03_头身",
        "reason": "未追问头身症状，错失确认项背是否强痛",
        "impact": "低"
      }
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `captured_vs_source` | array | 是 | 症状采集对照表 |
| `captured_vs_source[].symptom` | string | 是 | 症状名 |
| `captured_vs_source[].in_patient` | boolean | 是 | 学生是否采集到此症状 |
| `captured_vs_source[].in_source` | boolean | 是 | 条文原文是否包含此症状 |
| `captured_vs_source[].source` | string | 条件 | 症状来源（如 `chief_complaint`, `inquiry-01_寒热`, `physical_exam`） |
| `captured_vs_source[].level` | enum | 条件 | 信息层级：`l0`, `l1`, `l2`, `physical` |
| `captured_vs_source[].note` | string | 条件 | 当 `in_source=false` 时说明原因 |
| `key_differentials` | array | 是 | 关键鉴别点（用于答题后反馈） |
| `key_differentials[].symptom` | string | 是 | 鉴别症状 |
| `key_differentials[].excludes` | string[] | 条件 | 此症状排除的选项 |
| `key_differentials[].includes` | string[] | 条件 | 此症状指向的选项 |
| `key_differentials[].reason` | string | 是 | 鉴别逻辑说明 |
| `missed_opportunities` | array | 否 | 学生错失的问诊机会（用于训练反馈） |
| `missed_opportunities[].direction` | string | 是 | 错失的方向 |
| `missed_opportunities[].reason` | string | 是 | 错失原因 |
| `missed_opportunities[].impact` | enum | 是 | 影响程度：`"高"`, `"中"`, `"低"` |

---

## 完整示例（最小有效 JSON）

```json
{
  "schema_version": "1.0.0",
  "session_id": "sp-SHL-ty-12-20260617-143000",
  "mode": "article",
  "difficulty": 1,
  "difficulty_config": {
    "inquiry_slots": 5,
    "l2_allowance_per_direction": 1,
    "l3_noise_probability": 0.3,
    "distractor_count": 4,
    "distractor_level": "medium",
    "physical_exam_completeness": "full",
    "chief_complaint_directness": "moderate"
  },
  "source_article": "SHL-ty-12",
  "source_classic": "伤寒论",
  "chapter": "太阳病篇",
  "patient": {
    "name": "王女士",
    "age": 32,
    "gender": "女",
    "occupation": "公司文员",
    "background": "有3岁孩子，最近商场吹空调受凉",
    "persona_id": "anxious-middle-aged-female"
  },
  "chief_complaint": {
    "text": "大夫，我来看病两天了...",
    "revealed_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "l0_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "directness": "moderate",
    "word_count": 186
  },
  "inquiries": {
    "01_寒热": {
      "direction_id": "01_寒热",
      "direction_name": "寒热",
      "keywords": ["怕冷", "发热", "寒热往来"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "就是怕风，风吹过来就起鸡皮疙瘩...",
        "revealed_symptoms": ["恶风", "啬啬恶寒", "翕翕发热"],
        "sample_question": "怕冷吗？发烧吗？"
      },
      "l2": {
        "trigger_question": "什么时候最热？什么时候最冷？",
        "text": "汗出了之后更觉得冷...",
        "revealed_symptoms": ["汗后恶寒"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "我觉得是空调吹的，应该吃点感冒清热颗粒吧？",
        "type": "自我用药"
      }
    }
  },
  "physical_exam": {
    "completeness": "full",
    "palpation": {
      "composite": "浮缓"
    }
  },
  "case_summary": "【主诉】\n王女士...",
  "question": {
    "mode": "article",
    "options": [
      {
        "id": "SHL-ty-12",
        "label": "第12条",
        "snippet": "太阳中风...",
        "is_correct": true,
        "distractor_type": "correct"
      }
    ]
  },
  "answer_key": {
    "correct_article_id": "SHL-ty-12",
    "correct_formula_id": "gui-zhi-tang",
    "correct_article_text": "太阳中风..."
  },
  "reference_analysis": {
    "captured_vs_source": [],
    "key_differentials": []
  }
}
```

---

## 版本记录

- 2026-06-17: v1.0.0 初始版，支持条文模式 + 方剂模式，3 级难度，10 问诊方向，L1/L2/L3 信息梯度
