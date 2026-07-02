# Plan：用户档案解耦 + 卡片笔记 + 记笔记功能

## 一、目标

1. **用户档案解耦**：所有个人数据使用 `A01` 命名空间前缀，避免硬编码，便于后续切换账户
2. **卡片笔记功能**：每个卡片有独立笔记区域，支持编辑/保存/阅读，支持 Markdown 渲染
3. **学习视图集成**：在卡片详情页底部添加笔记区块，用户可复制 Kimi 内容粘贴保存
4. **数据迁移**：现有个人数据（`sh_traces`、`sh_index_v1_state`、`sh_study_notes`）迁移到 A01 前缀下

## 二、数据存储设计

### 2.1 命名空间规则

```javascript
const USER_PROFILE = 'A01'; // 用户档案标识，后续可动态切换
const key = (name) => `${USER_PROFILE}_${name}`;
```

### 2.2 数据键名映射

| 旧键名 | 新键名 | 数据类型 |
|---|---|---|
| `sh_traces` | `A01_traces` | 学习痕迹 |
| `sh_index_v1_state` | `A01_state` | 应用状态（主题、当前卡片等）|
| `sh_study_notes` | `A01_study_notes` | 错题本学习笔记 |
| `sh_mastery` | `A01_mastery` | 掌握度数据（卡片+向量）|
| 新增 | `A01_card_notes` | 卡片笔记（每个卡片一条）|

### 2.3 数据 Schema

```javascript
// A01_card_notes — 卡片笔记
{
  "notes": {
    "gui-zhi-tang": {
      "cardId": "gui-zhi-tang",
      "cardName": "桂枝汤",
      "content": "用户粘贴的笔记内容...",
      "updatedAt": "2026-06-18T15:30:00Z"
    },
    "ma-huang-tang": { ... }
  }
}
```

```javascript
// A01_study_notes — 错题本（保持现有结构，键名迁移）
{
  "notes": [
    {
      "id": "note-...",
      "cardId": "...",
      "cardName": "...",
      "diagnosis": "confused",
      "question": "...",
      "selected": "...",
      "correct": "...",
      "prompt": "...",
      "notes": "从Kimi复制的要点...",
      "reviewSchedule": [ ... ],
      "timestamp": "..."
    }
  ]
}
```

## 三、实现步骤

### 步骤 1：统一存储层封装
- 在 `index.html` 顶部添加 `USER_PROFILE = 'A01'` 常量
- 添加 `storageKey(name)` 辅助函数
- 封装 `loadData(key)` / `saveData(key, value)` / `removeData(key)` 函数
- 封装 `loadCardNotes()` / `saveCardNotes(notes)` / `loadCardNote(cardId)` / `saveCardNote(cardId, content)`

### 步骤 2：数据迁移
- 页面加载时检测旧键名是否存在
- 如果存在，迁移到 A01 前缀下，删除旧键名
- 迁移完成后写入 `A01_migration_done` 标记

### 步骤 3：卡片笔记功能
- 在 `renderLearn()` 底部添加笔记区块（放在参考资料下方）
- 笔记区块包含：编辑区（textarea）、保存按钮、阅读区（Markdown渲染）
- 默认显示阅读区，点击"编辑"切换为编辑区
- 保存后写入 `A01_card_notes`
- 支持 Markdown 渲染（复用 `renderMarkdown`）

### 步骤 4：错题本迁移
- 将 `STUDY_NOTES_KEY` 从 `'sh_study_notes'` 改为 `storageKey('study_notes')`
- 所有错题本函数（`loadStudyNotes`、`saveStudyNote` 等）统一走新键名
- 弹窗中的"去 Kimi 学"和"记笔记"流程整合

### 步骤 5：验证
- 刷新页面，检查数据是否正确迁移
- 测试卡片笔记：编辑 → 保存 → 重新打开卡片 → 显示笔记
- 测试错题本：保存笔记 → 回到仪表盘 → 查看错题本 → 点击详情 → 显示笔记

## 四、界面设计

### 卡片笔记区块（学习视图底部）

```
┌─────────────────────────────────────────┐
│ 📝 我的笔记                              │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │ 用户粘贴的 Kimi 内容，支持 Markdown  │ │
│ │ 渲染显示                             │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [✏️ 编辑笔记]  [💾 保存]                 │
│ 最后编辑：2026-06-18 15:30              │
└─────────────────────────────────────────┘
```

### 编辑模式

```
┌─────────────────────────────────────────┐
│ ✏️ 编辑笔记                              │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │
│ │ textarea 粘贴 Kimi 内容              │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [💾 保存]  [❌ 取消]                     │
│ 提示：支持 Markdown 语法（**粗体**、    │
│ # 标题、- 列表等）                       │
└─────────────────────────────────────────┘
```

## 五、解耦设计

- 所有 localStorage 读写走统一的 `storageKey()` 函数
- `USER_PROFILE` 是页面顶部唯一的硬编码变量，后续可改为从 URL 参数或配置文件读取
- 导出/导入功能以 JSON 格式导出整个 A01 命名空间的数据

---

*执行者：AI 助手*
*目标文件：app/index.html*
*备份：app/archive/index-before-user-profile-20250618.html*
