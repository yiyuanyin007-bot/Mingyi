# 工作红线：方剂系统 vs 条文系统

> **文档编号**：DOC-022  
> **生成日期**：2026-06-18  
> **生成者**：AI（方剂数据系统）

---

## 一句话红线

**方剂系统只管卡片数量和结构。条文系统只管条文内容。谁也不碰对方的领地。**

---

## 一、方剂系统（当前对话）—— 卡片工厂

### 职责范围
- **数据文件**：`data/formula_cards.json`
- **唯一目标**：让卡片数量覆盖《伤寒论》全部 96 方，最终扩展到四大经典
- **输出物**：新增卡片 JSON（框架，不含条文讲解内容）

### 具体做什么

| 做 | 不做 |
|---|---|
| 创建新卡片 JSON（id, name, formula_name, role, desc, tags, source_chapter, lineage, data.canonical） | 不写条文讲解、不写刘渡舟/胡希恕观点 |
| 检查本地资料是否齐全（标记资料缺口） | 不从资料中提取条文内容 |
| 更新 `data/formula_cards.json` 的卡片结构 | 不修改 `data/source_cards.json` |
| 通知条文系统"卡片已创建，请补充内容" | 不直接修改 `references.source_annotations` |
| 登记 CHANGELOG（SH编号） | 不登记条文系统的变更 |

### 产出标准

每张新卡片必须包含：

```json
{
  "id": "f-{unique-id}",
  "type": "formula_card",
  "name": "显示名",
  "formula_name": "方剂名",
  "role": "主方/变方/加减方",
  "desc": "一句话描述",
  "tags": ["六经病", "治法"],
  "source_chapter": "太阳病篇",
  "source_text_ids": ["{id}-src-001"],
  "lineage": {
    "base_formula": "...",
    "variant_path": [],
    "reference_source": "伤寒论原文"
  },
  "data": {
    "source_text": "条文原文",
    "canonical": {
      "symptom_profile": { "necessary": [], "common": [], "excluding": [] },
      "pathology": "病机",
      "herbs": [{"name": "...", "dosage": "..."}],
      "usage": "煎服法",
      "contraindications": []
    }
  },
  "experience_ids": [],
  "references": {
    "teacher_notes": [],
    "clinical_cases": [],
    "source_annotations": []
  },
  "mastery": { "0→1": {}, "1→0": {}, "0→2": {}, "2→0": {}, "0→usage": {}, "0→contra": {} }
}
```

**references 字段留空**，由条文系统填充。

---

## 二、条文系统（另一个对话）—— 内容工厂

### 职责范围
- **数据文件**：`data/source_cards.json` + `data/formula_cards.json` 的 `references` 字段
- **唯一目标**：为每张卡片补充条文讲解内容
- **输出物**：条文摘要、完整讲解、名家观点

### 具体做什么

| 做 | 不做 |
|---|---|
| 为已有卡片写 `references.source_annotations`（200字摘要 + 完整内容） | 不创建新卡片 |
| 为已有卡片写 `references.teacher_notes`（名家观点） | 不修改卡片结构（id, name, tags 等） |
| 为已有卡片写 `references.clinical_cases`（医案） | 不新增 `data.canonical` 字段 |
| 从本地资料（小红书、倪海厦、黄煌）提取内容 | 不修改 `source_chapter` 等结构字段 |
| 更新 `source_cards.json` 的条文内容 | 不修改 `formula_cards.json` 的卡片列表 |

### 产出标准

```json
{
  "references": {
    "source_annotations": [
      {
        "id": "{anno-id}",
        "title": "伤寒论第X条",
        "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
        "summary": "200字摘要（包含【条文】+【刘渡舟】+【胡希恕】核心观点）",
        "full_text": "完整 Markdown 内容"
      }
    ]
  }
}
```

---

## 三、触发协作机制

### 当方剂系统完成一张新卡片时：

1. 方剂系统登记 CHANGELOG（SH编号）
2. 方剂系统生成提示词，发给用户
3. 用户转发提示词给**条文系统对话**
4. 条文系统补充内容，登记自己的 CHANGELOG
5. 卡片完整，通知操作系统对话更新 UI

### 提示词模板（方剂系统生成）：

```
【任务】为 [方名] 补充条文讲解
【卡片ID】[formula_card_id]
【条文编号】[source_text_ids]
【伤寒论原文】[source_text]
【本地资料路径】
- 小红书针道轩：extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md
- 倪海厦讲义：raw/annotations/倪海夏-人纪- 伤寒论.txt
- 黄煌沙龙：extracted/黄煌教授经方沙龙/

【要求】
1. 生成 200 字摘要（包含【条文】+【刘渡舟】+【胡希恕】核心观点）
2. 生成完整展开内容（支持 Markdown 格式）
3. 更新 data/formula_cards.json 中该卡的 references.source_annotations
4. 不修改卡片结构，只补充 references 字段
5. 登记 CHANGELOG（SH编号）
```

---

## 四、禁止行为（双方）

| 禁止 | 违规后果 |
|---|---|
| 方剂系统写条文讲解 | 内容质量不可控，分工混乱 |
| 条文系统创建新卡片 | 卡片结构不统一，id 冲突 |
| 双方同时修改同一文件 | 变更冲突，数据丢失 |
| 不登记 CHANGELOG | 变更不可追溯 |
| 不备份就修改 | 无法回滚 |

---

## 五、当前状态

- 方剂系统：已覆盖 35/96 方（36.5%）
- 条文系统：已补充 154 条 references（35方）
- 待补充：61方卡片待创建，61方条文待补充

---

*本文档为双方对话共享，确保工作边界清晰。*
