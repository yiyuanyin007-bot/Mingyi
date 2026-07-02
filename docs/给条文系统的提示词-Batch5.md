# 给条文系统的提示词（Batch 5 · 5方）

> 生成时间：2026-06-18  
> 来源：方剂系统创建新卡片后自动生成  
> 使用方式：复制以下5个提示词，逐个发送给**条文系统对话**

---

## 提示词 1：炙甘草汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**（id, name, tags, source_chapter 等）
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法（python scripts/governance.py check-json data/formula_cards.json）
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】炙甘草汤
【卡片ID】zhi-gan-cao-tang
【条文编号】["zhi-gan-cao-tang-src-001"]
【伤寒论原文】"伤寒，脉结代，心动悸，炙甘草汤主之。"
【所属篇章】太阳病篇
【条文编号】第177条

## 本地资料路径（按优先级使用）

1. **小红书针道轩笔记**（最优先）
   - `extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`
   - 搜索："第177条" 或 "炙甘草汤"

2. **倪海厦人纪伤寒论**（第二优先）
   - `raw/annotations/倪海夏-人纪- 伤寒论.txt`
   - `extracted/annotations/倪海厦伤寒论_extracted.md`

3. **黄煌教授经方沙龙**（第三优先）
   - `extracted/黄煌教授经方沙龙/`
   - 搜索："炙甘草汤"

4. **伤寒论原文**（保底）
   - `extracted/太阳病.md`
   - 网上搜索："伤寒论 炙甘草汤 条文"

## 产出要求

### 1. 200字摘要（summary）

格式：
```
【条文】{{原文摘要}}
【刘渡舟】{{刘渡舟对该条的核心观点（50字）}}
【胡希恕】{{胡希恕对该条的核心观点（50字）}}
```

要求：
- 总字数控制在 180-220 字
- 必须包含三个标签：【条文】、【刘渡舟】、【胡希恕】
- 如果资料中没有某位老师的观点，用"【胡希恕】资料暂缺，待补充。"占位

### 2. 完整内容（full_text）

格式：
```markdown
【条文】{{完整原文}}

【刘渡舟】{{详细讲解}}

【胡希恕】{{详细讲解}}

个人总结
{{你自己的理解，100字以内}}
```

要求：
- 支持 Markdown 格式（**粗体**、> 引用块、- 列表）
- 原文中的药物剂量保留原始写法（如"桂枝三两"），不要换算
- 病机分析、症状描述、鉴别要点要清晰

### 3. JSON 结构

更新 `data/formula_cards.json` 中该卡的 `references.source_annotations`：

```json
"references": {
  "teacher_notes": [],
  "clinical_cases": [],
  "source_annotations": [
    {
      "id": "zhi-gan-cao-tang-anno-001",
      "title": "伤寒论第177条",
      "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
      "summary": "{{200字摘要}}",
      "full_text": "{{完整内容}}"
    }
  ]
}
```

## 执行步骤

1. 备份 data/formula_cards.json
2. 读取本地资料，提取条文讲解
3. 生成 summary 和 full_text
4. 更新 JSON（只修改该卡的 references.source_annotations）
5. 验证 JSON 语法
6. 登记 CHANGELOG
7. 向用户汇报完成

## 禁止

- 不要修改卡片结构（id, name, formula_name, tags, source_chapter 等）
- 不要删除其他卡片的 references
- 不要修改 data/source_cards.json（这是另一个文件）
- 不要省略【条文】标签（前端靠这个标签着色）
- 不要写超过 250 字的 summary（200字是上限，180-220字最佳）

---

## 提示词 2：小承气汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】小承气汤
【卡片ID】xiao-cheng-qi-tang
【条文编号】["xiao-cheng-qi-tang-src-001"]
【伤寒论原文】"阳明病，其人多汗，以津液外出，胃中燥，大便必硬，硬则谵语，小承气汤主之。"
【所属篇章】阳明病篇
【条文编号】第213条（另有第214、250条涉及）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第213条"、"第214条"、"小承气汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"小承气汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"小承气汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "xiao-cheng-qi-tang-anno-001",
  "title": "伤寒论第213条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 3：吴茱萸汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】吴茱萸汤
【卡片ID】wu-zhu-yu-tang
【条文编号】["wu-zhu-yu-tang-src-001"]
【伤寒论原文】"食谷欲呕，属阳明也，吴茱萸汤主之。"
【所属篇章】阳明病篇（另有少阴病篇、厥阴病篇涉及）
【条文编号】第243条（阳明）、第309条（少阴）、第378条（厥阴）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第243条"、"第309条"、"第378条"、"吴茱萸汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"吴茱萸汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"吴茱萸汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

注意：吴茱萸汤在伤寒论中涉及3个篇章（阳明243条、少阴309条、厥阴378条），如果资料充足，可以生成3个 source_annotations，每个对应一个条文。如果资料不足，合并为1个。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "wu-zhu-yu-tang-anno-001",
  "title": "伤寒论第243条（阳明）",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 4：麻子仁丸

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】麻子仁丸
【卡片ID】ma-zi-ren-wan
【条文编号】["ma-zi-ren-wan-src-001"]
【伤寒论原文】"趺阳脉浮而涩，浮则胃气强，涩则小便数，浮涩相搏，大便则硬，其脾为约，麻子仁丸主之。"
【所属篇章】阳明病篇
【条文编号】第247条

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第247条"、"麻子仁丸"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"麻子仁丸"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"麻子仁丸"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "ma-zi-ren-wan-anno-001",
  "title": "伤寒论第247条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 5：茵陈蒿汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】茵陈蒿汤
【卡片ID】yin-chen-hao-tang
【条文编号】["yin-chen-hao-tang-src-001"]
【伤寒论原文】"阳明病，发热汗出者，此为热越，不能发黄也。但头汗出，身无汗，剂颈而还，小便不利，渴引水浆者，此为瘀热在里，身必发黄，茵陈蒿汤主之。"
【所属篇章】阳明病篇
【条文编号】第236条（另有第260条涉及）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第236条"、"第260条"、"茵陈蒿汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"茵陈蒿汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"茵陈蒿汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "yin-chen-hao-tang-anno-001",
  "title": "伤寒论第236条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

*本文档由方剂系统生成，供用户转发给条文系统对话。*
