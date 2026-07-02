# 修正笔记输出格式规范（v1.0）

> **版本**：v1.0  
> **用途**：定义循证文献检索专家生成修正笔记时，输出的机器可解析格式  
> **目标**：用户可一键导入，覆写原有笔记  
> **文件位置**：`docs/evidence/corrections/{task_id}_correction.json`

---

## 1. 核心设计原则

- **结构化**：输出为 JSON，机器可解析
- **可追溯**：每个修正项标注修改理由（来源：审计报告的哪个验证意见）
- **可预览**：JSON 中包含 Markdown 格式的最终笔记全文，用户可预览
- **可导入**：JSON 中包含可直接写入 localStorage 的数据格式
- **可回滚**：修正前自动生成备份

---

## 2. JSON 输出格式

```json
{
  "schema_version": "1.0",
  "task_id": "GZJGG-20260620-001",
  "card_id": "gui-zhi-jia-ge-gen-tang",
  "formula_name": "桂枝加葛根汤",
  "original_audit_report": "docs/evidence/reports/gui-zhi-jia-ge-gen-tang_evidence_audit.md",
  "verification_report": "docs/evidence/reports/gui-zhi-jia-ge-gen-tang_evidence_audit.md",
  "correction_date": "2026-06-20",
  "corrector": "循证文献检索专家",
  "verification_status": "需修正",
  "verification_summary": "审计智能体提出3项修正建议：1) 节点GZJGG-001的检索策略过窄；2) 节点GZJGG-003的炎症介质未明确具体类型；3) 缺少葛根的药理机制解释",
  "backup_info": {
    "backup_path": "data/notes_backup/gui-zhi-jia-ge-gen-tang_note_2026-06-20_backup.json",
    "backup_date": "2026-06-20",
    "backup_reason": "修正前自动备份"
  },
  "corrections": [
    {
      "correction_id": "C01",
      "target_node_id": "GZJGG-001",
      "target_node_text": "外邪侵袭体表",
      "verification_opinion": "节点GZJGG-001的检索策略过窄，应补充机械刺激和化学刺激维度",
      "correction_type": "补充",
      "original_note_text": "外邪侵袭体表",
      "corrected_note_text": "外邪（温度/机械/化学刺激）侵袭体表",
      "reason": "根据审计智能体验证，'外邪'应操作化为三类刺激，而非仅温度刺激",
      "evidence_doi": "10.1016/j.jtherbio.2020.xx.xxx",
      "status": "pending_user_approval"
    },
    {
      "correction_id": "C02",
      "target_node_id": "GZJGG-003",
      "target_node_text": "炎症介质刺激",
      "verification_opinion": "炎症介质应明确具体类型，避免笼统表述",
      "correction_type": "细化",
      "original_note_text": "炎症介质刺激",
      "corrected_note_text": "炎症介质（缓激肽、前列腺素E2、P物质）刺激",
      "reason": "根据文献，肌筋膜疼痛综合征中这三类介质最为关键",
      "evidence_doi": "10.1002/jor.24356",
      "status": "pending_user_approval"
    }
  ],
  "final_note_markdown": "## 3. 生理学与病理生理学解读\n\n### 核心链条\n\n外邪（温度/机械/化学刺激）侵袭体表 → 皮肤交感-汗腺轴功能紊乱（营卫不和） → 颈背部肌群筋膜微循环障碍 + 炎症介质（缓激肽、前列腺素E2、P物质）刺激 → 肌筋膜痉挛僵硬（项背强几几）+ 代偿性汗出散热\n\n> **修正说明**：\n> - 节点1：补充外邪的操作化分解（审计智能体建议）\n> - 节点3：细化炎症介质类型（审计智能体建议）\n\n### 分章节症状群解读\n\n① 项背强几几（最特征性症状）\n病理生理机制：肌筋膜痉挛僵硬...",
  "localstorage_payload": {
    "storage_key": "sh_index_v1_state",
    "card_id": "gui-zhi-jia-ge-gen-tang",
    "note_field": "study_notes",
    "value": "## 3. 生理学与病理生理学解读\n\n### 核心链条\n\n外邪（温度/机械/化学刺激）侵袭体表 → 皮肤交感-汗腺轴功能紊乱（营卫不和） → 颈背部肌群筋膜微循环障碍 + 炎症介质（缓激肽、前列腺素E2、P物质）刺激 → 肌筋膜痉挛僵硬（项背强几几）+ 代偿性汗出散热\n\n### 分章节症状群解读\n\n① 项背强几几（最特征性症状）\n病理生理机制：肌筋膜痉挛僵硬..."
  }
}
```

---

## 3. 字段详解

### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `schema_version` | string | 是 | 格式版本，当前 "1.0" |
| `task_id` | string | 是 | 任务ID，格式：{card_id}-YYYYMMDD-NNN |
| `card_id` | string | 是 | 卡片ID |
| `formula_name` | string | 是 | 方剂显示名 |
| `original_audit_report` | string | 是 | 原审计报告路径 |
| `verification_report` | string | 是 | 验证报告路径（通常与原报告同文件） |
| `correction_date` | string | 是 | 修正日期，ISO-8601 |
| `corrector` | string | 是 | 修正者 |
| `verification_status` | string | 是 | 验证状态：「需修正」或「已通过」 |
| `verification_summary` | string | 是 | 审计智能体的验证意见摘要 |

### backup_info（备份信息）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `backup_path` | string | 是 | 备份文件路径 |
| `backup_date` | string | 是 | 备份日期 |
| `backup_reason` | string | 是 | 备份原因 |

### corrections（修正项列表）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `correction_id` | string | 是 | 修正项ID，格式：C01, C02... |
| `target_node_id` | string | 是 | 目标节点ID（如 GZJGG-003） |
| `target_node_text` | string | 是 | 目标节点原文 |
| `verification_opinion` | string | 是 | 审计智能体的具体意见 |
| `correction_type` | string | 是 | 修正类型：补充/细化/删除/重写/合并 |
| `original_note_text` | string | 是 | 原文 |
| `corrected_note_text` | string | 是 | 修正后文本 |
| `reason` | string | 是 | 修正理由（基于什么证据） |
| `evidence_doi` | string | 否 | 支撑修正的文献DOI |
| `status` | string | 是 | 状态：pending_user_approval（等待用户确认） |

### final_note_markdown（最终笔记全文）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `final_note_markdown` | string | 是 | 完整的修正后笔记Markdown全文，用户可预览 |

### localstorage_payload（localStorage 写入数据）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `storage_key` | string | 是 | localStorage 键名（如 `sh_index_v1_state`） |
| `card_id` | string | 是 | 卡片ID |
| `note_field` | string | 是 | 笔记字段名（如 `study_notes`） |
| `value` | string | 是 | 修正后的笔记内容（Markdown字符串） |

---

## 4. 一键导入脚本

用户拿到 `*_correction.json` 后，在浏览器 Console 中执行以下脚本即可一键覆写：

```javascript
// 一键导入修正笔记（用户从 AI 对话中复制 JSON 内容）
// 使用方法：
// 1. 复制 AI 生成的 JSON 内容
// 2. 在浏览器 Console 中粘贴以下代码，将 JSON 内容替换到 `CORRECTION_JSON` 变量
// 3. 按回车执行

const CORRECTION_JSON = `
// 将 AI 生成的 JSON 粘贴在此处，替换此行
`;

function importCorrection() {
  try {
    const data = JSON.parse(CORRECTION_JSON);
    
    // 验证 schema
    if (!data.schema_version || !data.localstorage_payload) {
      throw new Error('JSON 格式不正确，缺少必要字段');
    }
    
    const payload = data.localstorage_payload;
    const key = payload.storage_key;
    
    // 读取现有数据
    let existing = localStorage.getItem(key);
    if (!existing) {
      throw new Error(`localStorage 中不存在键：${key}`);
    }
    
    // 备份原数据
    const backupKey = `${key}_backup_${new Date().toISOString().slice(0,10)}_${Date.now()}`;
    localStorage.setItem(backupKey, existing);
    console.log(`✅ 原数据已备份到：${backupKey}`);
    
    // 解析并更新
    let state = JSON.parse(existing);
    
    // 根据卡片ID更新笔记
    // 注意：实际字段路径取决于系统存储结构，此处为示例
    if (state.cards && state.cards[payload.card_id]) {
      state.cards[payload.card_id].notes = payload.value;
    } else if (state[payload.card_id]) {
      state[payload.card_id].notes = payload.value;
    } else {
      // 如果找不到特定字段，可能需要用户手动确认存储路径
      console.warn('⚠️ 无法自动定位笔记存储位置，请手动检查 localStorage 结构');
      console.log('建议：在 Application > Local Storage 中查看数据结构');
      return;
    }
    
    // 写回 localStorage
    localStorage.setItem(key, JSON.stringify(state));
    console.log(`✅ 笔记已更新，卡片：${payload.card_id}`);
    console.log(`📄 修正项数：${data.corrections.length}`);
    console.log(`📋 修正摘要：${data.verification_summary}`);
    
    // 建议刷新页面
    console.log('💡 建议刷新页面以查看更新后的笔记');
    
  } catch (error) {
    console.error('❌ 导入失败：', error.message);
    console.log('请检查：1) JSON 是否完整复制；2) 是否在当前页面执行');
  }
}

importCorrection();
```

---

## 5. 修正类型定义

| 修正类型 | 含义 | 示例 |
|---------|------|------|
| **补充** | 在原文基础上添加缺失内容 | 外邪 → 外邪（温度/机械/化学刺激） |
| **细化** | 将笼统表述变为具体表述 | 炎症介质 → 炎症介质（缓激肽、PGE2） |
| **删除** | 删除无证据支持的表述 | 删除"..."（缺乏文献支持） |
| **重写** | 整个节点重新表述 | 重写某节点的机制描述 |
| **合并** | 将两个节点合并为一个 | 合并 GZJGG-002 和 GZJGG-003 |
| **拆分** | 将一个节点拆分为多个 | 拆分"炎症介质刺激"为多个具体介质 |

---

## 6. 用户操作流程

```
用户说："目前我的笔记有哪些需要修正？"
  ↓
AI 读取 task_board.md，筛选「需修正」和「已修正」任务
  ↓
AI 回复列表：
  ├─ 已验证需修正：
  │   - 桂枝加葛根汤（3项修正）：节点1补充/节点3细化/...
  │   - 四逆汤（2项修正）：...
  │   [用户选择：输入数字选择]
  ├─ 已审计待验证：
  │   - 麻黄汤（审计完成，等待审计智能体验证）
  │   [用户可启动审计智能体]
  └─ 待审计：
      - 小柴胡汤（笔记新增，待审计）
      [用户可启动审计]

用户选择「桂枝加葛根汤」
  ↓
AI 生成修正 JSON 文件：docs/evidence/corrections/GZJGG-20260620-001_correction.json
  ↓
AI 在回复中提供：
  1. 修正预览（Markdown 格式，用户可阅读）
  2. 一键导入脚本（用户复制到 Console 执行）
  3. JSON 文件路径（供高级用户手动导入）

用户确认无误，复制一键导入脚本到 Console 执行
  ↓
浏览器自动备份原笔记 → 覆写新笔记 → 刷新页面显示
  ↓
AI 更新 task_board.md：该任务状态变为「已修正」
  ↓
（下次会话）该任务状态变为「待验证(修正版)」，等待审计智能体再次验证
```

---

## 7. 注意事项

### 7.1 自动备份
- 一键导入脚本**自动创建备份**，备份键名为 `{原键名}_backup_YYYYMMDD_{时间戳}`
- 备份保留在 localStorage 中，用户可手动恢复
- 建议定期清理旧备份（保留最近 5 个）

### 7.2 存储路径探测
- 由于 localStorage 的存储结构可能因系统版本变化，一键导入脚本会**尝试自动探测**笔记存储路径
- 如果探测失败，脚本会提示用户手动检查 Application > Local Storage 中的数据结构
- 此时需要用户提供具体的字段路径，AI 可以生成定制化的导入脚本

### 7.3 修正的保守性
- AI 生成修正时，**只修改验证意见明确指出的问题**
- 不擅自修改未涉及的内容
- 每个修正项都标注「为什么改」和「基于什么证据」

### 7.4 用户确认
- 修正笔记生成后，AI 在回复中**展示修正对比**（原文 vs 修正后）
- 用户确认无误后，才执行一键导入
- 用户有权拒绝任何修正项

---

*本规范由循证文献检索专家维护，随系统版本迭代更新。*
