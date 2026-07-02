# 给条文系统的提示词（Batch 6 · 10方）

> 生成时间：2026-06-18  
> 来源：方剂系统创建新卡片后自动生成  
> 使用方式：复制以下10个提示词，逐个发送给**条文系统对话**

---

## 提示词 1：麻黄附子细辛汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**（id, name, tags, source_chapter 等）
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】麻黄附子细辛汤
【卡片ID】ma-huang-fu-zi-xi-xin-tang
【条文编号】["ma-huang-fu-zi-xi-xin-tang-src-001"]
【伤寒论原文】"少阴病，始得之，反发热，脉沉者，麻黄附子细辛汤主之。"
【所属篇章】少阴病篇
【条文编号】第301条

## 本地资料路径（按优先级使用）

1. **小红书针道轩笔记**（最优先）
   - `extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`
   - 搜索："第301条" 或 "麻黄附子细辛汤"

2. **倪海厦人纪伤寒论**（第二优先）
   - `raw/annotations/倪海夏-人纪- 伤寒论.txt`
   - `extracted/annotations/倪海厦伤寒论_extracted.md`

3. **黄煌教授经方沙龙**（第三优先）
   - `extracted/黄煌教授经方沙龙/`
   - 搜索："麻黄附子细辛汤"

4. **伤寒论原文**（保底）
   - `extracted/太阳病.md`
   - 网上搜索："伤寒论 麻黄附子细辛汤 条文"

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
- 原文中的药物剂量保留原始写法（如"麻黄二两"），不要换算
- 病机分析、症状描述、鉴别要点要清晰

### 3. JSON 结构

更新 `data/formula_cards.json` 中该卡的 `references.source_annotations`：

```json
"references": {
  "teacher_notes": [],
  "clinical_cases": [],
  "source_annotations": [
    {
      "id": "ma-huang-fu-zi-xi-xin-tang-anno-001",
      "title": "伤寒论第301条",
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

## 提示词 2：黄连阿胶汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】黄连阿胶汤
【卡片ID】huang-lian-e-jiao-tang
【条文编号】["huang-lian-e-jiao-tang-src-001"]
【伤寒论原文】"少阴病，得之二三日以上，心中烦，不得卧，黄连阿胶汤主之。"
【所属篇章】少阴病篇
【条文编号】第303条

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第303条"、"黄连阿胶汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"黄连阿胶汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"黄连阿胶汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "huang-lian-e-jiao-tang-anno-001",
  "title": "伤寒论第303条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 3：附子汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】附子汤
【卡片ID】fu-zi-tang
【条文编号】["fu-zi-tang-src-001"]
【伤寒论原文】"少阴病，得之一二日，口中和，其背恶寒者，当灸之，附子汤主之。"
【所属篇章】少阴病篇
【条文编号】第304条（另有第305条：少阴病，身体痛，手足寒，骨节痛，脉沉者，附子汤主之）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第304条"、"第305条"、"附子汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"附子汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"附子汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

注意：附子汤在伤寒论中涉及2条条文（第304、305条），如果资料充足，可以生成2个 source_annotations，每个对应一个条文。如果资料不足，合并为1个。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "fu-zi-tang-anno-001",
  "title": "伤寒论第304条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 4：四逆散

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】四逆散
【卡片ID】si-ni-san
【条文编号】["si-ni-san-src-001"]
【伤寒论原文】"少阴病，四逆，其人或咳，或悸，或小便不利，或腹中痛，或泄利下重者，四逆散主之。"
【所属篇章】少阴病篇
【条文编号】第318条

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第318条"、"四逆散"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"四逆散"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"四逆散"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "si-ni-san-anno-001",
  "title": "伤寒论第318条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 5：猪苓汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】猪苓汤
【卡片ID】zhu-ling-tang
【条文编号】["zhu-ling-tang-src-001"]
【伤寒论原文】"少阴病，下利六七日，咳而呕渴，心烦不得眠者，猪苓汤主之。"
【所属篇章】少阴病篇
【条文编号】第319条（另有第223条阳明病篇涉及）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第319条"、"第223条"、"猪苓汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"猪苓汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"猪苓汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "zhu-ling-tang-anno-001",
  "title": "伤寒论第319条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 6：理中丸

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】理中丸（又名人参汤）
【卡片ID】li-zhong-wan
【条文编号】["li-zhong-wan-src-001"]
【伤寒论原文】"霍乱，头痛发热，身疼痛，热多欲饮水者，五苓散主之；寒多不用水者，理中丸主之。"
【所属篇章】霍乱病篇
【条文编号】第386条（另有第396条：大病差后，喜唾，久不了了，胸上有寒，当以丸药温之，宜理中丸）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第386条"、"第396条"、"理中丸"、"人参汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"理中丸"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"理中丸"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "li-zhong-wan-anno-001",
  "title": "伤寒论第386条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 7：乌梅丸

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】乌梅丸
【卡片ID】wu-mei-wan
【条文编号】["wu-mei-wan-src-001"]
【伤寒论原文】"伤寒，脉微而厥，至七八日肤冷，其人躁无暂安时者，此为脏厥，非蛔厥也。蛔厥者，其人当吐蛔。今病者静，而复时烦者，此为脏寒，蛔上入其膈，故烦，须臾复止，得食而呕，又烦者，蛔闻食臭出，其人常自吐蛔。蛔厥者，乌梅丸主之。又主久利。"
【所属篇章】厥阴病篇
【条文编号】第338条

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第338条"、"乌梅丸"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"乌梅丸"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"乌梅丸"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "wu-mei-wan-anno-001",
  "title": "伤寒论第338条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 8：当归四逆汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】当归四逆汤
【卡片ID】dang-gui-si-ni-tang
【条文编号】["dang-gui-si-ni-tang-src-001"]
【伤寒论原文】"手足厥寒，脉细欲绝者，当归四逆汤主之。"
【所属篇章】厥阴病篇
【条文编号】第351条（另有第352条：若其人内有久寒者，宜当归四逆加吴茱萸生姜汤）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第351条"、"第352条"、"当归四逆汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"当归四逆汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"当归四逆汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "dang-gui-si-ni-tang-anno-001",
  "title": "伤寒论第351条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 9：白头翁汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】白头翁汤
【卡片ID】bai-tou-weng-tang
【条文编号】["bai-tou-weng-tang-src-001"]
【伤寒论原文】"热利下重者，白头翁汤主之。"
【所属篇章】厥阴病篇
【条文编号】第371条（另有第373条：下利，欲饮水者，以有热故也，白头翁汤主之）

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第371条"、"第373条"、"白头翁汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"白头翁汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"白头翁汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "bai-tou-weng-tang-anno-001",
  "title": "伤寒论第371条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

## 提示词 10：黄芩汤

你是经方学习系统的**条文系统**。你的任务是为刚创建的方剂卡片补充条文讲解内容。

## 铁律（必须遵守）
1. **只补充 references 字段，不修改卡片结构**
2. **改前备份** data/formula_cards.json → data/archive/
3. **改后验证** JSON 语法
4. **改后登记** CHANGELOG（SH编号）
5. **不改** 其他卡片的 references

## 任务详情

【方名】黄芩汤
【卡片ID】huang-qin-tang
【条文编号】["huang-qin-tang-src-001"]
【伤寒论原文】"太阳与少阳合病，自下利者，与黄芩汤；若呕者，黄芩加半夏生姜汤主之。"
【所属篇章】太阳病篇（少阳病篇）
【条文编号】第172条

## 本地资料路径

1. 小红书针道轩：`extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md`（搜索"第172条"、"黄芩汤"）
2. 倪海厦：`raw/annotations/倪海夏-人纪- 伤寒论.txt`（搜索"黄芩汤"）
3. 黄煌沙龙：`extracted/黄煌教授经方沙龙/`（搜索"黄芩汤"）
4. 伤寒论原文：`extracted/太阳病.md`

## 产出要求

同提示词1（200字摘要 + 完整内容 + JSON结构）。

更新 JSON 中的 references.source_annotations：
```json
{
  "id": "huang-qin-tang-anno-001",
  "title": "伤寒论第172条",
  "source": "小红书针道轩 / 刘渡舟 / 胡希恕",
  "summary": "{{200字摘要}}",
  "full_text": "{{完整内容}}"
}
```

---

*本文档由方剂系统生成，供用户转发给条文系统对话。*
