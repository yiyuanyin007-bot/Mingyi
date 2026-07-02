---
name: text-to-cards
description: 从中医文本（如《伤寒论》《金匮要略》）中自动提取条文卡（source_card），输出供人工审阅的原始提取文件。MVP 阶段只自动提取条文卡，方剂卡和经验卡在学习过程中逐步填充。
---

# text-to-cards

## 作用

把一段中医原典/注解文本拆成条文、段落、句子，识别其中与方剂学习相关的元素（方名、症状、药物、用法、病机、禁忌等），输出一个**原始提取文件**。用户审阅后，生成正式的**条文卡 JSON**。

**当前阶段（MVP）：**
- ✅ 自动提取 `source_card`（条文卡）
- ❌ 不自动提取完整 `formula_card`（方剂卡）
- ❌ 不自动提取 `experience_card`（经验卡）
- ❌ 不处理扫描版 PDF OCR

## 设计依据

根据 2026-06-13 DeepSeek battle 结论：
- 初始用户是「小白」，需要以原文为锚的基础映射训练。
- 数据飞轮优先于初始数据量：先保证条文卡准确，方剂卡和经验卡在临床/学习中逐步填充。
- 症状结构采用 `necessary` / `common` / `excluding` 三分法。
- 经验卡必须区分 `subjective_effective` 和 `objective_change`。

完整设计见 `references/card-schema.md`。

## 使用流程

1. 用户提供：
   - 源文本文件路径（`.txt`、`.md`、CHM 解压后的 `.html`）
   - 范围清单：本次要提取的方剂名列表，如 `["桂枝汤", "麻黄汤"]`

2. 运行脚本：
   ```bash
   python scripts/segment_text.py --input <源文本路径> --scope <范围清单文件路径> --output <原始文件路径>
   ```

3. 得到原始提取文件（Markdown + YAML block 格式）。

4. 用户逐条审阅，修改 `status` 和 `reviewer_note`。

5. 审阅完成后，运行生成脚本产出 `source_card` JSON（待实现）。

## 输出文件格式

文件为 Markdown，每个提取条目一个 YAML block，结构如下：

```markdown
### 条目 #001

```yaml
status: pending
source_location: "原文第1段第1句"
paragraph_context: "太阳病，发热汗出者……"
atomic_sentence: "太阳病，发热，汗出，恶风，桂枝汤主之。"
detected_elements:
  - type: source_text
    value: "太阳病，发热，汗出，恶风，桂枝汤主之。"
    target_card: shl-012
    target_field: text
    confidence: high
```

**状态说明：**
- `pending`：待审阅
- `adopted`：已采纳，后续生成 JSON
- `skipped`：跳过，不进入卡片

## 元素类型说明

| 类型 | 含义 | 判定关键词 |
|------|------|-----------|
| `formula_name` | 方剂名 | 范围清单中的名称 |
| `source_text` | 完整条文 | 句末有"主之"、"属……" |
| `symptom` | 症状 | 常见症状词，三分法标记 |
| `herb` | 药物及剂量 | 药物名 + 数量词（两、升、枚等） |
| `usage` | 煎服方法 | 以水、煮取、去滓、温服、日三服 |
| `contraindication` | 禁忌 | 不可、忌、禁、勿、反 |
| `pathology` | 病机 | 为、因、故、机、属 |
| `experience` | 经验/注释/医案 | 云、曰、师、案、愚见 |

详细规则见 `references/element-types.md`。

## 卡片结构参考

卡片 JSON 结构以项目顶层设计 `C:\Users\Chen\WorkBuddy\Claw\_design\00-顶层设计-最终对齐版.md` 为准。MVP 修正版字段映射见 `references/card-schema.md`。

前端演示：`shanghanlun-v8-mvp.html`（可直接双击打开）。

## 当前限制

- 只支持基于规则的关键字匹配，暂不支持语义理解。
- 症状、药物识别依赖内置词库，可能遗漏。
- 不处理同义词、别名、古今字差异。
- MVP 阶段只产出条文卡原始提取文件，不自动产出方剂卡/经验卡。

## 迭代方向

1. 完善清洗脚本，支持 Markdown/HTML/CHM/GB2312 文本；
2. 优化条文编号识别和分段质量；
3. 实现从原始提取文件到 `source_card` JSON 的生成；
4. 后续再考虑方剂卡/经验卡的辅助提取（非自动）。
