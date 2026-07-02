---
文档编号: SH-DESIGN-20260702-001
版本: v1.0
日期: 2026-07-02
用途: 学习轨迹系统数据接口说明——前端如何读取、写入、更新学习轨迹数据
关联文档:
  · schemas/learning_trajectory.json — 数据Schema
  · SH-PLAN-20260702-001 — 本周执行计划
  · app/index.html — 主入口（含学习轨迹仪表盘入口）
状态: 初稿
变更历史:
  | 日期 | 版本 | 变更人 | 变更内容 | 影响范围 |
  |------|------|--------|----------|----------|
  | 2026-07-02 | v1.0 | AI | 初始接口说明 | 新建 |
---

# 学习轨迹系统 · 数据接口说明

> **面向**: 交互层对话（前端开发者）  
> **数据Schema**: `schemas/learning_trajectory.json`  
> **数据存储**: `localStorage`  
> **数据key**: `sh_learning_trajectory_v1`

---

## 一、数据存储位置

```javascript
// 读取学习轨迹数据
const trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));

// 更新学习轨迹数据
localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(trajectory));
```

**注意**：
- 与现有 `sh_index_v1_state` 隔离，避免冲突
- 数据格式为JSON对象，不是数组
- 首次使用时需要初始化（见"初始化数据"）

---

## 二、数据结构速览

```javascript
const trajectoryData = {
  user_id: "default_user",
  classic: "伤寒论",
  liu_jing_mastery: {
    "太阳病": {
      total: 52,
      mastered: 28,
      rate: 0.54,
      weak_vectors: ["0->2", "2->0"]
    },
    "阳明病": { total: 16, mastered: 10, rate: 0.625, weak_vectors: [] },
    "少阳病": { total: 6, mastered: 4, rate: 0.67, weak_vectors: [] },
    "太阴病": { total: 2, mastered: 0, rate: 0, weak_vectors: ["0->1", "0->2", "0->usage"] },
    "少阴病": { total: 17, mastered: 4, rate: 0.24, weak_vectors: ["0->1", "1->0"] },
    "厥阴病": { total: 7, mastered: 0, rate: 0, weak_vectors: ["0->1", "0->2", "0->usage"] },
    "差后劳复": { total: 4, mastered: 0, rate: 0, weak_vectors: ["0->1"] }
  },
  timeline: [
    { date: "2026-07-01", action: "学习", formula: "桂枝汤", score: null, total: null, note: "首次学习" },
    { date: "2026-07-01", action: "考试", formula: "桂枝汤", score: 5, total: 6, note: "方证对应正确" },
    { date: "2026-07-02", action: "复习", formula: "麻黄汤", score: null, total: null, note: "" }
  ],
  radar_data: {
    "方证对应": 0.72,
    "药物剂量": 0.45,
    "煎服法": 0.38,
    "条文记忆": 0.65,
    "鉴别诊断": 0.51,
    "临床应用": 0.28
  },
  ai_suggestions: [
    {
      priority: "P0",
      type: "补弱",
      message: "太阴病掌握度为0%，建议优先学习理中丸和桂枝加芍药汤",
      target_formula: "理中丸",
      target_vector: "0->1"
    },
    {
      priority: "P1",
      type: "复习",
      message: "太阳病0->2向量掌握度低于50%，建议复习桂枝汤与方证对应",
      target_formula: "桂枝汤",
      target_vector: "0->2"
    }
  ]
};
```

---

## 三、初始化数据

首次使用时，需要初始化数据结构：

```javascript
function initLearningTrajectory() {
  const defaultData = {
    user_id: "default_user",
    classic: "伤寒论",
    liu_jing_mastery: {
      "太阳病": { total: 52, mastered: 0, rate: 0, weak_vectors: [] },
      "阳明病": { total: 16, mastered: 0, rate: 0, weak_vectors: [] },
      "少阳病": { total: 6, mastered: 0, rate: 0, weak_vectors: [] },
      "太阴病": { total: 2, mastered: 0, rate: 0, weak_vectors: [] },
      "少阴病": { total: 17, mastered: 0, rate: 0, weak_vectors: [] },
      "厥阴病": { total: 7, mastered: 0, rate: 0, weak_vectors: [] },
      "差后劳复": { total: 4, mastered: 0, rate: 0, weak_vectors: [] }
    },
    timeline: [],
    radar_data: {
      "方证对应": 0,
      "药物剂量": 0,
      "煎服法": 0,
      "条文记忆": 0,
      "鉴别诊断": 0,
      "临床应用": 0
    },
    ai_suggestions: []
  };
  
  localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(defaultData));
  return defaultData;
}

// 读取或初始化
let trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));
if (!trajectory) {
  trajectory = initLearningTrajectory();
}
```

---

## 四、数据更新时机

| 场景 | 更新内容 | 方法 |
|------|----------|------|
| 用户完成考试/测试 | timeline追加新记录 + 更新liu_jing_mastery | `addTimelineEvent()` + `updateLiuJingMastery()` |
| 用户学习新方剂 | timeline追加"学习"事件 | `addTimelineEvent()` |
| 用户开方 | timeline追加"开方"事件 | `addTimelineEvent()` |
| 用户复习 | timeline追加"复习"事件 | `addTimelineEvent()` |
| 每日自动计算 | 重新计算radar_data + ai_suggestions | `calculateRadar()` + `generateSuggestions()` |

---

## 五、核心函数示例

### 5.1 添加时间轴事件

```javascript
function addTimelineEvent(action, formula, score, total, note) {
  const trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));
  
  trajectory.timeline.push({
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    action: action, // "学习" | "考试" | "复习" | "开方" | "总结"
    formula: formula,
    score: score || null,
    total: total || null,
    note: note || ""
  });
  
  localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(trajectory));
}

// 使用示例
addTimelineEvent("考试", "桂枝汤", 5, 6, "方证对应正确");
addTimelineEvent("学习", "理中丸", null, null, "首次学习太阴病方");
```

### 5.2 更新六经掌握度

```javascript
function updateLiuJingMastery(liuJing, masteredDelta, totalDelta) {
  const trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));
  
  const lj = trajectory.liu_jing_mastery[liuJing];
  if (!lj) return;
  
  lj.mastered += masteredDelta;
  lj.total += totalDelta;
  lj.rate = lj.total > 0 ? lj.mastered / lj.total : 0;
  
  localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(trajectory));
}

// 使用示例：太阳病新增掌握1方
updateLiuJingMastery("太阳病", 1, 0); // mastered+1, total不变
```

### 5.3 计算雷达图数据

```javascript
function calculateRadar() {
  const trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));
  
  // 从 timeline 统计各维度得分
  const timeline = trajectory.timeline;
  
  // 方证对应：考试中方证对应题的得分率
  const fangzhengExams = timeline.filter(t => t.action === "考试" && t.formula);
  trajectory.radar_data["方证对应"] = fangzhengExams.length > 0 
    ? fangzhengExams.reduce((sum, t) => sum + (t.score / t.total), 0) / fangzhengExams.length 
    : 0;
  
  // 药物剂量：考试中剂量题的得分率
  // 煎服法：考试中煎服法题的得分率
  // ... 其他维度类似
  
  localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(trajectory));
  return trajectory.radar_data;
}
```

### 5.4 生成AI建议

```javascript
function generateSuggestions() {
  const trajectory = JSON.parse(localStorage.getItem('sh_learning_trajectory_v1'));
  const suggestions = [];
  
  // 1. 找出掌握度最低的六经
  const weakLiuJings = Object.entries(trajectory.liu_jing_mastery)
    .filter(([name, data]) => data.rate < 0.5 && data.total > 0)
    .sort((a, b) => a[1].rate - b[1].rate);
  
  if (weakLiuJings.length > 0) {
    const [name, data] = weakLiuJings[0];
    suggestions.push({
      priority: "P0",
      type: "补弱",
      message: `${name}掌握度为${(data.rate * 100).toFixed(0)}%，建议优先学习该经方剂`,
      target_formula: null, // 需要前端根据六经推荐具体方剂
      target_vector: data.weak_vectors[0] || "0->1"
    });
  }
  
  // 2. 找出薄弱向量
  // 3. 推荐复习
  // 4. 推荐强化
  
  trajectory.ai_suggestions = suggestions;
  localStorage.setItem('sh_learning_trajectory_v1', JSON.stringify(trajectory));
  return suggestions;
}
```

---

## 六、与现有系统的整合

### 6.1 与 index.html 的整合

在 `app/index.html` 顶部导航栏增加"学习轨迹"按钮：

```html
<!-- 在顶部导航栏增加 -->
<a href="learning-dashboard.html" class="nav-btn">📊 学习轨迹</a>
<a href="prescription-sop.html" class="nav-btn">📝 开方SOP</a>
```

### 6.2 与现有 localStorage 的隔离

| key | 用途 | 隔离状态 |
|-----|------|----------|
| `sh_index_v1_state` | 现有学习进度 | ✅ 独立 |
| `sh_learning_trajectory_v1` | 学习轨迹数据 | ✅ 独立 |
| `sh_prescription_sop_v1` | 开方SOP记录 | ✅ 独立 |
| `clinical_records_v1` | 临床录入记录 | ✅ 独立 |
| `source_notes_v1` | 条文笔记 | ✅ 独立 |

**注意**：`sh_learning_trajectory_v1` 与 `sh_index_v1_state` 数据不互通，各自独立管理。

---

## 七、完整示例数据

```javascript
const fullExample = {
  user_id: "chen_doctor",
  classic: "伤寒论",
  liu_jing_mastery: {
    "太阳病": {
      total: 52,
      mastered: 28,
      rate: 0.54,
      weak_vectors: ["0->2", "2->0"]
    },
    "阳明病": {
      total: 16,
      mastered: 10,
      rate: 0.625,
      weak_vectors: []
    },
    "少阳病": {
      total: 6,
      mastered: 4,
      rate: 0.67,
      weak_vectors: []
    },
    "太阴病": {
      total: 2,
      mastered: 0,
      rate: 0,
      weak_vectors: ["0->1", "0->2", "0->usage"]
    },
    "少阴病": {
      total: 17,
      mastered: 4,
      rate: 0.24,
      weak_vectors: ["0->1", "1->0"]
    },
    "厥阴病": {
      total: 7,
      mastered: 0,
      rate: 0,
      weak_vectors: ["0->1", "0->2", "0->usage"]
    },
    "差后劳复": {
      total: 4,
      mastered: 0,
      rate: 0,
      weak_vectors: ["0->1"]
    }
  },
  timeline: [
    { date: "2026-06-15", action: "学习", formula: "桂枝汤", score: null, total: null, note: "首次学习" },
    { date: "2026-06-16", action: "考试", formula: "桂枝汤", score: 5, total: 6, note: "方证对应正确，煎服法错误" },
    { date: "2026-06-17", action: "学习", formula: "麻黄汤", score: null, total: null, note: "" },
    { date: "2026-06-18", action: "考试", formula: "麻黄汤", score: 4, total: 6, note: "剂量计算错误" },
    { date: "2026-06-20", action: "复习", formula: "桂枝汤", score: null, total: null, note: "再次复习" },
    { date: "2026-06-21", action: "考试", formula: "桂枝汤", score: 6, total: 6, note: "满分" },
    { date: "2026-06-22", action: "开方", formula: "桂枝汤", score: null, total: null, note: "临床首次开方" },
    { date: "2026-06-25", action: "学习", formula: "小柴胡汤", score: null, total: null, note: "" },
    { date: "2026-06-26", action: "考试", formula: "小柴胡汤", score: 3, total: 6, note: "少阳病定位错误" },
    { date: "2026-07-01", action: "总结", formula: "太阳病", score: null, total: null, note: "太阳病篇总结" }
  ],
  radar_data: {
    "方证对应": 0.72,
    "药物剂量": 0.45,
    "煎服法": 0.38,
    "条文记忆": 0.65,
    "鉴别诊断": 0.51,
    "临床应用": 0.28
  },
  ai_suggestions: [
    {
      priority: "P0",
      type: "补弱",
      message: "太阴病掌握度为0%，建议优先学习理中丸和桂枝加芍药汤",
      target_formula: "理中丸",
      target_vector: "0->1"
    },
    {
      priority: "P0",
      type: "补弱",
      message: "厥阴病掌握度为0%，建议后续学习四逆汤等方剂",
      target_formula: "四逆汤",
      target_vector: "0->1"
    },
    {
      priority: "P1",
      type: "复习",
      message: "太阳病0->2向量掌握度低于50%，建议复习桂枝汤与方证对应",
      target_formula: "桂枝汤",
      target_vector: "0->2"
    },
    {
      priority: "P1",
      type: "强化",
      message: "临床应用能力仅28%，建议多参与开方实践",
      target_formula: null,
      target_vector: null
    },
    {
      priority: "P2",
      type: "推荐",
      message: "你已掌握太阳病54%，可尝试学习阳明病方剂",
      target_formula: "白虎汤",
      target_vector: "0->1"
    }
  ]
};
```

---

## 八、技术约束

| 约束 | 要求 | 原因 |
|------|------|------|
| 数据存储 | localStorage | 与现有系统一致，无后端 |
| 数据key | `sh_learning_trajectory_v1` | 与现有key隔离 |
| 数据格式 | JSON对象 | 便于读取和更新 |
| 数据大小 | 控制在5KB以内 | 避免localStorage超限（5MB） |
| timeline长度 | 最多保留100条 | 超出时自动清理最旧记录 |
| 更新频率 | 每次事件后即时更新 | 防止数据丢失 |
| 兼容性 | 与现有 `sh_index_v1_state` 不互通 | 避免数据冲突 |

---

*本接口说明按 document_standard.md 标准维护。如有变更，同步更新版本号和变更历史。*
