# SP方剂模式前端集成需求文档

> **文档编号**: FE-REQ-SP-FM-20260621  
> **生成日期**: 2026-06-21  
> **目标读者**: 交互设计系统对话（前端开发）  
> **关联数据**: data/sp_cases.json（已含106例，其中63例为方剂模式）

---

## 一、现状分析

### 1.1 当前前端SP能力

| 功能 | 状态 | 说明 |
|------|------|------|
| SP问诊页面 | ✅ 已有 | 左右分栏：问诊记录 + 问诊方向选择 |
| 随机SP问诊 | ✅ 已有 | 导航栏「SP问诊」按钮，随机选病例 |
| 方剂卡片→SP | ⚠️ 部分 | `spStartByFormula(formulaId)` 已存在，但直接查找任意模式病例 |
| 方剂模式渲染 | ⚠️ 待增强 | `spRenderExam()` 只显示 label+snippet，未显示 herbs_preview/symptom_hint |
| 鉴别分析反馈 | ❌ 缺失 | 答题后只显示正确/错误，未显示 key_differentials |
| 模式选择弹窗 | ❌ 缺失 | 用户无法选择「条文模式」或「方剂模式」 |
| 难度选择 | ❌ 缺失 | 用户无法选择 difficulty 1/2/3 |

### 1.2 当前数据状态

- sp_cases.json 共 **106** 例
  - 条文模式（mode=article）：**43** 例（原有）
  - 方剂模式（mode=formula）：**63** 例（本次新增）
- 每个方剂卡片现在至少有 **1** 例方剂模式SP（difficulty=2）

---

## 二、需求详述

### 2.1 需求1：学习页底部新增「SP问诊练习」按钮

**位置**: 每张方剂卡片的学习页底部（在方剂内容展示之后，相关条文之前）

**UI设计**:
```html
<div class="sp-practice-section" style="margin:24px 0; padding:16px; background:var(--accent-bg); border-radius:8px;">
  <div style="font-size:14px; font-weight:600; color:var(--accent); margin-bottom:12px;">
    🩺 SP 问诊练习
  </div>
  <div style="display:flex; gap:10px; flex-wrap:wrap;">
    <button class="btn-primary" onclick="spOpenModeSelector('{formulaId}')">
      开始练习
    </button>
    <span style="font-size:12px; color:var(--text-muted); align-self:center;">
      通过模拟患者问诊，练习辨证选方
    </span>
  </div>
  <div id="spModeSelector" style="display:none; margin-top:12px; padding:12px; background:var(--bg-panel); border-radius:6px; border:1px solid var(--border);">
    <!-- 模式选择弹窗内容 -->
  </div>
</div>
```

**交互流程**:
1. 用户在学习页点击「开始练习」按钮
2. 展开模式选择弹窗（或弹出对话框）
3. 用户选择模式（条文/方剂）和难度（1/2/3）
4. 系统调用 `spStartByFormula(formulaId, mode, difficulty)`
5. 如果该方剂+模式+难度的组合存在，直接进入SP问诊
6. 如果不存在，提示用户并推荐随机SP问诊

---

### 2.2 需求2：模式选择弹窗

**弹窗内容**:

```
┌─────────────────────────────────────┐
│  🩺 SP 问诊练习                      │
│                                     │
│  选择练习模式：                      │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  📜 条文模式 │  │  💊 方剂模式 │  │
│  │  43例可用   │  │  63例可用   │  │
│  └─────────────┘  └─────────────┘  │
│                                     │
│  选择难度：                          │
│  ○ 简单（diff1） ○ 中等（diff2）★ ○ 困难（diff3）│
│                                     │
│  [  取消  ]        [  开始问诊  ]   │
└─────────────────────────────────────┘
```

**默认选择**:
- 模式：方剂模式（优先）
- 难度：中等（diff2）

**技术实现**:
```javascript
function spOpenModeSelector(formulaId) {
  // 显示弹窗
  // 根据formulaId查询sp_cases.json，显示可用模式/难度的数量
  // 例如："该方剂有 1 例方剂模式SP（diff2）"
}

function spStartByFormula(formulaId, mode, difficulty) {
  if (spCases.length === 0) {
    fetch('../data/sp_cases.json')
      .then(r => r.json())
      .then(data => {
        spCases = data;
        spTrySelectByFormula(formulaId, mode, difficulty);
      });
  } else {
    spTrySelectByFormula(formulaId, mode, difficulty);
  }
}

function spTrySelectByFormula(formulaId, mode, difficulty) {
  // 查找匹配的病例：formula_id + mode + difficulty
  const candidates = spCases.filter(c => 
    c.answer_key.correct_formula_id === formulaId &&
    c.mode === mode &&
    c.difficulty === difficulty
  );
  
  if (candidates.length > 0) {
    // 随机选择一个（如果同一方+模式+难度有多例）
    const idx = spCases.indexOf(candidates[Math.floor(Math.random() * candidates.length)]);
    spSelectCase(idx);
  } else {
    // 如果指定模式+难度不存在，尝试其他难度
    const fallback = spCases.filter(c => 
      c.answer_key.correct_formula_id === formulaId && c.mode === mode
    );
    if (fallback.length > 0) {
      const idx = spCases.indexOf(fallback[Math.floor(Math.random() * fallback.length)]);
      spSelectCase(idx);
      // 提示用户："该方剂暂无难度X的SP，已为您匹配难度Y的病例"
    } else {
      alert('暂无该方剂的 SP 问诊病例，为您推荐随机SP问诊。');
      spRandomCase();
    }
  }
}
```

---

### 2.3 需求3：方剂模式选项渲染增强

**当前代码**（spRenderExam）:
```javascript
function spRenderExam() {
  const panel = document.getElementById('spExamPanel');
  panel.style.display = 'block';
  const opts = spCurrentCase.question.options;
  const mode = spCurrentCase.question.mode === 'article' ? '条文' : '方剂';
  panel.innerHTML = `
    <div style="font-size:13px;color:var(--text-secondary);font-weight:600;margin-bottom:10px;">请选择对应的${mode}：</div>
    <div style="display:flex;flex-direction:column;gap:10px;">${opts.map((o, i) => `
      <div class="sp-option-card" id="sp-opt-${i}" onclick="spSelectAnswer(${i})">
        <div class="sp-option-label">${o.label}</div>
        <div class="sp-option-text">${o.snippet || o.name}</div>
      </div>
    `).join('')}</div>
    <div class="sp-feedback" id="spFeedback"></div>
  `;
}
```

**增强后代码**（方剂模式时显示 herbs_preview + symptom_hint）:
```javascript
function spRenderExam() {
  const panel = document.getElementById('spExamPanel');
  panel.style.display = 'block';
  const opts = spCurrentCase.question.options;
  const isArticle = spCurrentCase.question.mode === 'article';
  const mode = isArticle ? '条文' : '方剂';
  
  panel.innerHTML = `
    <div style="font-size:13px;color:var(--text-secondary);font-weight:600;margin-bottom:10px;">请选择对应的${mode}：</div>
    <div style="display:flex;flex-direction:column;gap:10px;">${opts.map((o, i) => {
      // 方剂模式：显示方名 + 药物速览 + 症状提示
      const content = isArticle 
        ? `<div class="sp-option-label">${o.label}</div><div class="sp-option-text">${o.snippet || o.name}</div>`
        : `<div class="sp-option-label">${o.name}</div>
           <div class="sp-option-herbs" style="font-size:12px;color:var(--text-muted);">💊 ${o.herbs_preview || ''}</div>
           <div class="sp-option-symptoms" style="font-size:12px;color:var(--text-secondary);">🩺 ${o.symptom_hint || ''}</div>`;
      return `<div class="sp-option-card" id="sp-opt-${i}" onclick="spSelectAnswer(${i})">${content}</div>`;
    }).join('')}</div>
    <div class="sp-feedback" id="spFeedback"></div>
  `;
}
```

---

### 2.4 需求4：鉴别分析反馈页

**当前反馈**（spSelectAnswer）:
```javascript
fb.innerHTML = o.is_correct
  ? `<strong style="color:var(--success)">回答正确！</strong> ${ans.correct_article_text || ans.correct_formula_name}<br><br><button class="btn-primary" onclick="goToLearn('${formulaId}')">📖 去学习该方剂</button>`
  : `<strong style="color:var(--error)">回答错误。</strong> 正确答案是：${ans.correct_article_text || ans.correct_formula_name}<br><br><button class="btn-primary" onclick="goToLearn('${formulaId}')">📖 去学习该方剂</button>`;
```

**增强后反馈**（显示 key_differentials）:
```javascript
// 构建鉴别分析HTML
let differentialsHtml = '';
if (spCurrentCase.reference_analysis && spCurrentCase.reference_analysis.key_differentials) {
  const diffs = spCurrentCase.reference_analysis.key_differentials;
  if (diffs.length > 0) {
    differentialsHtml = `
      <div style="margin-top:16px; padding:12px; background:var(--bg-card); border-radius:6px; border-left:3px solid var(--accent);">
        <div style="font-size:13px; font-weight:600; margin-bottom:8px;">📋 方证鉴别分析</div>
        <ul style="font-size:12px; color:var(--text-secondary); line-height:1.6; padding-left:16px;">
          ${diffs.map(d => `<li>${d.text || d}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}

fb.innerHTML = (o.is_correct
  ? `<strong style="color:var(--success)">回答正确！</strong> ${ans.correct_article_text || ans.correct_formula_name}`
  : `<strong style="color:var(--error)">回答错误。</strong> 正确答案是：${ans.correct_article_text || ans.correct_formula_name}`)
  + differentialsHtml
  + `<br><br><button class="btn-primary" onclick="goToLearn('${formulaId}')">📖 去学习该方剂</button>`;
```

---

### 2.5 需求5：导航栏区分「随机SP」和「定向SP」

**当前**: 导航栏只有一个「SP问诊」按钮，进入随机病例列表

**建议调整**:
- 导航栏「SP问诊」 → 改为「🎲 SP随机问诊」
- 学习页内的按钮 → 「🩺 SP定向问诊」（针对当前方剂）

---

## 三、数据流设计

```
用户在学习页
  → 点击「SP问诊练习」按钮
  → 弹窗显示：该方剂可用的SP病例统计
    → 查询 sp_cases.json（内存中）
    → 统计：该方剂 × 模式 × 难度的病例数
  → 用户选择模式+难度
  → 系统调用 spStartByFormula(formulaId, mode, difficulty)
    → 从 spCases 数组中筛选匹配病例
    → 若找到 → spSelectCase(idx) → 进入问诊
    → 若未找到 → 提示 + spRandomCase()
  → 问诊结束 → spSelectAnswer(idx)
    → 显示 feedback（正确/错误 + 鉴别分析）
    → spSaveResult(isCorrect) → localStorage
  → 用户点击「去学习该方剂」 → goToLearn(formulaId)
```

---

## 四、改动清单汇总

| 序号 | 改动位置 | 改动内容 | 工作量 | 优先级 |
|------|----------|----------|--------|--------|
| 1 | 学习页渲染函数 | 在方剂内容后插入「SP问诊练习」按钮区 | 小 | P0 |
| 2 | 新增函数 | `spOpenModeSelector(formulaId)` | 中 | P0 |
| 3 | 新增函数 | `spStartByFormula(formulaId, mode, difficulty)`（增强版） | 中 | P0 |
| 4 | 修改函数 | `spTrySelectByFormula` → 支持 mode+difficulty 筛选 | 小 | P0 |
| 5 | 修改函数 | `spRenderExam()` → 方剂模式显示 herbs_preview + symptom_hint | 小 | P0 |
| 6 | 修改函数 | `spSelectAnswer()` → 显示 key_differentials 鉴别分析 | 小 | P0 |
| 7 | 新增CSS | 方剂选项卡片样式（herbs_preview/symptom_hint的样式） | 小 | P1 |
| 8 | 导航栏 | 「SP问诊」→「SP随机问诊」 | 极小 | P1 |
| 9 | 测试 | 验证所有63方剂都能正确加载方剂模式SP | 中 | P0 |

---

## 五、注意事项

1. **向后兼容**：已有43例条文模式SP的渲染逻辑不变，只增强方剂模式
2. **选项字段安全**：herbs_preview 和 symptom_hint 是新增字段，旧病例可能没有。渲染时要做 fallback：`o.herbs_preview || ''`
3. **key_differentials 格式**：新病例的 key_differentials 是数组，元素可能是字符串或对象（有 .text 字段）。渲染时统一处理：`d.text || d`
4. **性能**：sp_cases.json 已增长到106例（约600KB+），fetch 后内存中筛选即可，无需额外优化

---

## 六、验证清单（冒烟测试）

1. 打开任意方剂学习页 → 底部显示「SP问诊练习」按钮
2. 点击按钮 → 弹窗显示模式选择（条文/方剂）和难度选择（1/2/3）
3. 选择方剂模式+diff2 → 进入SP问诊 → 患者主诉正常显示
4. 问诊结束 → 选项显示方名+药物速览+症状提示
5. 选择答案 → 反馈页显示正确/错误 + 鉴别分析（如果该病例有key_differentials）
6. 点击「去学习该方剂」 → 返回学习页
7. 选择一个没有方剂模式SP的方剂（理论上不存在，因为已全部生成）→ 提示"暂无"
8. 选择条文模式 → 选项显示条文编号和摘要（原有逻辑不变）

---

*本文档由SP系统生成对话产出，需转交「交互设计系统」对话执行前端修改。*
*文档路径：docs/SP方剂模式前端集成需求文档.md*
*生成时间：2026-06-21*
