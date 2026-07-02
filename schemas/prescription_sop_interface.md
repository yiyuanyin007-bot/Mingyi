---
文档编号: SH-DESIGN-20260702-002
版本: v1.0
日期: 2026-07-02
用途: 开方SOP系统数据接口说明——前端如何读取、写入、更新SOP记录
关联文档:
  · schemas/prescription_sop.json — 数据Schema
  · SH-PLAN-20260702-001 — 本周执行计划
  · app/index.html — 主入口（含临床录入系统）
状态: 初稿
变更历史:
  | 日期 | 版本 | 变更人 | 变更内容 | 影响范围 |
  |------|------|--------|----------|----------|
  | 2026-07-02 | v1.0 | AI | 初始接口说明 | 新建 |
---

# 开方SOP系统 · 数据接口说明

> **面向**: 交互层对话（前端开发者）  
> **数据Schema**: `schemas/prescription_sop.json`  
> **数据存储**: `localStorage`  
> **数据key**: `sh_prescription_sop_v1`

---

## 一、数据存储位置

```javascript
// 读取所有SOP记录
const sopRecords = JSON.parse(localStorage.getItem('sh_prescription_sop_v1')) || [];

// 保存SOP记录
sopRecords.push(newRecord);
localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(sopRecords));

// 读取单条记录
const record = sopRecords.find(r => r.record_id === "SOP-2026-0702-001");
```

**注意**：
- 与现有 `clinical_records_v1` 隔离，避免冲突
- 数据格式为JSON数组，每个元素是一条SOP记录
- 首次使用时为空数组 `[]`，需要初始化

---

## 二、数据结构速览

```javascript
const sopRecord = {
  record_id: "SOP-2026-0702-001",
  patient_id: "P01",
  doctor_id: "chen_doctor",
  created_at: "2026-07-02T09:00:00",
  
  step1_collection: {
    chief_complaint: "发热，汗出，恶风",
    symptoms: ["发热", "汗出", "恶风"],
    tongue: "淡红，苔薄白",
    pulse: "浮缓",
    structured_input: {
      sun_symptoms: ["发热", "汗出", "恶风"],
      yangming_symptoms: [],
      // ...
    }
  },
  
  step2_liu_jing: {
    system_suggestion: "太阳病",
    confidence: 0.85,
    supporting_symptoms: [
      { symptom: "发热", liu_jing: "太阳病", confidence: 0.95 },
      { symptom: "汗出", liu_jing: "太阳病", confidence: 0.90 }
    ],
    alternatives: [
      { liu_jing: "阳明病", confidence: 0.10, reason: "无口渴、无大汗" }
    ],
    doctor_agreement: true,
    doctor_note: "确认为太阳中风"
  },
  
  step3_formula_match: {
    system_recommendations: [
      {
        rank: 1,
        formula: "桂枝汤",
        formula_id: "sh-001",
        probability: 0.82,
        supporting_articles: ["太阳病篇-12"],
        key_differentiators: ["有汗 vs 麻黄汤无汗"]
      },
      {
        rank: 2,
        formula: "麻黄汤",
        formula_id: "sh-002",
        probability: 0.15,
        supporting_articles: ["太阳病篇-35"],
        key_differentiators: ["无汗、喘"]
      }
    ],
    doctor_choice: "桂枝汤",
    doctor_adjustments: {
      modified: false,
      reason: null,
      added_herbs: [],
      removed_herbs: []
    }
  },
  
  step4_dosage: {
    base_dosage: "教材标准",
    weight: 70,
    adjustments: [
      { herb: "桂枝", change: "+3g", reason: "患者体质偏寒" }
    ],
    final_prescription: {
      "桂枝": "12g",
      "白芍": "9g",
      "甘草": "6g",
      "生姜": "9g",
      "大枣": "4枚"
    }
  },
  
  step5_preparation: {
    usage: "水煎服，温服覆取微汗",
    contraindications: ["禁生冷、粘滑、肉面、五辛、酒酪、臭恶等物"],
    notes: "服后啜热稀粥",
    doctor_additional_notes: ""
  },
  
  step6_tracking: {
    prescribed_at: "2026-07-02T09:00:00",
    follow_up_scheduled: "2026-07-05",
    follow_up_reminder: true,
    outcome: null,
    patient_feedback: null,
    doctor_outcome_notes: null,
    iterations: []
  }
};
```

---

## 三、初始化数据

首次使用时：

```javascript
// 初始化空数组
const sopRecords = JSON.parse(localStorage.getItem('sh_prescription_sop_v1')) || [];
if (sopRecords.length === 0) {
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify([]));
}
```

---

## 四、7步SOP流程数据更新逻辑

### Step 1: 信息采集 → 创建新记录

```javascript
function createSOPRecord(patientId, collectionData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1')) || [];
  
  const newRecord = {
    record_id: generateRecordId(), // SOP-YYYYMMDD-NNN
    patient_id: patientId,
    doctor_id: "chen_doctor",
    created_at: new Date().toISOString(),
    step1_collection: {
      chief_complaint: collectionData.chief_complaint,
      symptoms: collectionData.symptoms,
      tongue: collectionData.tongue || "",
      pulse: collectionData.pulse || "",
      structured_input: classifySymptoms(collectionData.symptoms) // 自动分类
    },
    step2_liu_jing: {},
    step3_formula_match: {},
    step4_dosage: {},
    step5_preparation: {},
    step6_tracking: {
      prescribed_at: new Date().toISOString()
    }
  };
  
  records.push(newRecord);
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
  return newRecord;
}
```

### Step 2: 六经定位 → 更新记录

```javascript
function updateStep2(recordId, liuJingData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1'));
  const record = records.find(r => r.record_id === recordId);
  
  record.step2_liu_jing = {
    system_suggestion: liuJingData.system_suggestion,
    confidence: liuJingData.confidence,
    supporting_symptoms: liuJingData.supporting_symptoms,
    alternatives: liuJingData.alternatives,
    doctor_agreement: liuJingData.doctor_agreement,
    doctor_liu_jing: liuJingData.doctor_liu_jing,
    doctor_note: liuJingData.doctor_note
  };
  
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
}
```

### Step 3: 方证匹配 → 更新记录

```javascript
function updateStep3(recordId, formulaData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1'));
  const record = records.find(r => r.record_id === recordId);
  
  record.step3_formula_match = {
    system_recommendations: formulaData.recommendations,
    doctor_choice: formulaData.doctor_choice,
    doctor_adjustments: formulaData.adjustments
  };
  
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
}
```

### Step 4: 剂量确定 → 更新记录

```javascript
function updateStep4(recordId, dosageData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1'));
  const record = records.find(r => r.record_id === recordId);
  
  record.step4_dosage = {
    base_dosage: dosageData.base_dosage,
    weight: dosageData.weight,
    adjustments: dosageData.adjustments,
    final_prescription: calculateFinalPrescription(dosageData)
  };
  
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
}
```

### Step 5: 煎服法 → 更新记录

```javascript
function updateStep5(recordId, preparationData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1'));
  const record = records.find(r => r.record_id === recordId);
  
  record.step5_preparation = {
    usage: preparationData.usage,
    contraindications: preparationData.contraindications,
    notes: preparationData.notes,
    doctor_additional_notes: preparationData.doctor_additional_notes
  };
  
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
}
```

### Step 6: 记录与追踪 → 完成记录

```javascript
function completeRecord(recordId, trackingData) {
  const records = JSON.parse(localStorage.getItem('sh_prescription_sop_v1'));
  const record = records.find(r => r.record_id === recordId);
  
  record.step6_tracking = {
    prescribed_at: record.step6_tracking.prescribed_at,
    follow_up_scheduled: trackingData.follow_up_scheduled,
    follow_up_reminder: trackingData.follow_up_reminder,
    outcome: trackingData.outcome || null,
    patient_feedback: trackingData.patient_feedback || null,
    doctor_outcome_notes: trackingData.doctor_outcome_notes || null,
    iterations: []
  };
  
  localStorage.setItem('sh_prescription_sop_v1', JSON.stringify(records));
  
  // 同时更新学习轨迹（记录开方行为）
  updateLearningTrajectory({
    action: "开方",
    formula: record.step3_formula_match.doctor_choice
  });
}
```

---

## 五、与现有临床录入系统的整合

### 5.1 数据映射

现有临床录入系统的数据可以映射到SOP的Step 1：

| 临床录入系统 | SOP Step 1 | 说明 |
|-------------|-----------|------|
| 患者症状采集 | chief_complaint + symptoms | 直接复用 |
| 舌象记录 | tongue | 直接复用 |
| 脉象记录 | pulse | 直接复用 |
| 结构化症状 | structured_input | 自动分类生成 |

### 5.2 整合方式

**方案A（推荐）**: 在现有临床录入系统的基础上，增加"进入SOP流程"按钮
- 用户完成临床录入的"信息采集"后，点击"进入开方SOP"
- 系统自动将临床录入的数据填充到SOP的Step 1
- 用户从Step 2（六经定位）开始继续执行

**方案B（独立）**: SOP系统作为独立页面，与临床录入系统并行
- 用户可选择使用"临床录入"或"开方SOP"
- SOP系统的Step 1信息采集与临床录入类似，但增加SOP特有的流程引导
- 两个系统的数据互不干扰

**建议**: MVP阶段采用方案B（独立页面），后续再整合。

---

## 六、与现有数据文件的关联

| 数据文件 | 用途 | 在SOP中的使用 |
|----------|------|--------------|
| `data/formula_cards.json` | 方剂卡片数据 | Step 3 方证匹配推荐 |
| `data/source_cards.json` | 条文数据库 | Step 3 支撑条文 |
| `data/herb_alias_map.json` | 药名别名 | Step 4 剂量确定 |
| `data/symptom_expression_index.json` | 症状表达 | Step 1 症状选择 |

---

## 七、完整示例数据

```javascript
const exampleRecord = {
  record_id: "SOP-2026-0702-001",
  patient_id: "P01",
  doctor_id: "chen_doctor",
  created_at: "2026-07-02T09:00:00",
  
  step1_collection: {
    chief_complaint: "发热，汗出，恶风，已3日",
    symptoms: ["发热", "汗出", "恶风", "头痛", "鼻鸣", "干呕"],
    tongue: "淡红，苔薄白",
    pulse: "浮缓",
    structured_input: {
      sun_symptoms: ["发热", "汗出", "恶风", "头痛", "鼻鸣", "干呕"],
      yangming_symptoms: [],
      shaoyang_symptoms: [],
      shaoyin_symptoms: [],
      taiyin_symptoms: [],
      jueyin_symptoms: []
    }
  },
  
  step2_liu_jing: {
    system_suggestion: "太阳病",
    confidence: 0.92,
    supporting_symptoms: [
      { symptom: "发热", liu_jing: "太阳病", confidence: 0.95 },
      { symptom: "汗出", liu_jing: "太阳病", confidence: 0.90 },
      { symptom: "恶风", liu_jing: "太阳病", confidence: 0.88 },
      { symptom: "脉浮", liu_jing: "太阳病", confidence: 0.85 }
    ],
    alternatives: [
      { liu_jing: "阳明病", confidence: 0.05, reason: "无口渴、无大汗" },
      { liu_jing: "少阳病", confidence: 0.03, reason: "无往来寒热" }
    ],
    doctor_agreement: true,
    doctor_note: "太阳中风，营卫不和"
  },
  
  step3_formula_match: {
    system_recommendations: [
      {
        rank: 1,
        formula: "桂枝汤",
        formula_id: "sh-001",
        probability: 0.88,
        supporting_articles: ["太阳病篇-12"],
        key_differentiators: ["有汗 → 桂枝汤", "无汗 → 麻黄汤"]
      },
      {
        rank: 2,
        formula: "桂枝加葛根汤",
        formula_id: "sh-003",
        probability: 0.08,
        supporting_articles: ["太阳病篇-14"],
        key_differentiators: ["项背强几几 → 加葛根"]
      },
      {
        rank: 3,
        formula: "麻黄汤",
        formula_id: "sh-002",
        probability: 0.04,
        supporting_articles: ["太阳病篇-35"],
        key_differentiators: ["无汗、喘 → 麻黄汤"]
      }
    ],
    doctor_choice: "桂枝汤",
    doctor_adjustments: {
      modified: false,
      reason: null,
      added_herbs: [],
      removed_herbs: []
    }
  },
  
  step4_dosage: {
    base_dosage: "教材标准",
    weight: 65,
    adjustments: [
      { herb: "桂枝", change: "+3g", reason: "患者体质偏寒，舌淡" }
    ],
    final_prescription: {
      "桂枝": "12g",
      "白芍": "9g",
      "甘草": "6g",
      "生姜": "9g",
      "大枣": "4枚"
    }
  },
  
  step5_preparation: {
    usage: "上五味，以水七升，微火煮取三升，去滓，适寒温，服一升。服已须臾，啜热稀粥一升余，以助药力。温覆令一时许，遍身漐漐微似有汗者益佳，不可令如水流漓，病必不除。",
    contraindications: [
      "禁生冷、粘滑、肉面、五辛、酒酪、臭恶等物"
    ],
    notes: "服后啜热稀粥，温覆取微汗。若一服汗出病差，停后服，不必尽剂。",
    doctor_additional_notes: "嘱患者避风保暖，服药后卧床休息"
  },
  
  step6_tracking: {
    prescribed_at: "2026-07-02T09:00:00",
    follow_up_scheduled: "2026-07-05",
    follow_up_reminder: true,
    outcome: null,
    patient_feedback: null,
    doctor_outcome_notes: null,
    iterations: []
  }
};
```

---

## 八、技术约束

| 约束 | 要求 | 原因 |
|------|------|------|
| 数据存储 | localStorage | 与现有系统一致，无后端 |
| 数据key | `sh_prescription_sop_v1` | 与现有key隔离 |
| 数据格式 | JSON数组 | 每条记录一个对象，便于追加 |
| 数据大小 | 单条记录控制在10KB以内 | 避免localStorage超限 |
| 记录编号 | 格式：SOP-YYYYMMDD-NNN | 全局唯一，便于检索 |
| 兼容性 | 与现有临床录入系统数据兼容 | 可互相导入/导出 |
| 更新频率 | 每步完成后立即保存 | 防止数据丢失 |

---

## 九、与现有系统的整合

### 9.1 与 index.html 的整合

- 在 `app/index.html` 顶部导航栏增加"开方SOP"按钮
- 按钮位置：在"学习轨迹"按钮旁边，或顶部导航栏最右侧
- 点击后打开 `app/prescription-sop.html`

### 9.2 与现有 localStorage 的隔离

| key | 用途 | 隔离状态 |
|-----|------|----------|
| `sh_index_v1_state` | 现有学习进度 | ✅ 独立 |
| `sh_learning_trajectory_v1` | 学习轨迹数据 | ✅ 独立 |
| `sh_prescription_sop_v1` | 开方SOP记录 | ✅ 独立 |
| `clinical_records_v1` | 临床录入记录 | ✅ 独立 |
| `source_notes_v1` | 条文笔记 | ✅ 独立 |

---

*本接口说明按 document_standard.md 标准维护。如有变更，同步更新版本号和变更历史。*
