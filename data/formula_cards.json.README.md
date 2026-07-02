# formula_cards.json 数据说明

> **文档编号**：DATA-FORMULA-CARDS-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `formula_cards.json` |
| 数据类型 | `formula_card` |
| 记录数 | 99 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| id | string | 推断 | gui-zhi-tang |
| type | string | 推断 | formula_card |
| name | string | 推断 | 桂枝汤 |
| formula_name | string | 推断 | 桂枝汤 |
| role | string | 推断 | 主方 |
| desc | string | 推断 | 太阳中风主方 |
| tags | array<string> | 推断 | ['太阳病', '解表剂', '风伤卫']... |
| source_chapter | string | 推断 | 太阳病篇 |
| source_text_ids | array<string> | 推断 | ['article-012', 'article-013', 'article-015']... |
| lineage | object | 推断 | (3 fields) |
| lineage.base_formula | string | 推断 | 桂枝汤 |
| lineage.variant_path | array | 推断 |  |
| lineage.reference_source | string | 推断 | 伤寒论原文 |
| created_at | string | 推断 | 2026-06-13T11:35:24.520535 |
| updated_at | string | 推断 | 2026-06-16T00:00:00 |
| data | object | 推断 | (6 fields) |
| data.source_text | string | 推断 | 太阳病，头痛，发热，汗出，恶风，桂枝汤主之。 |
| data.canonical | object | 推断 | (10 fields) |
| data.canonical.symptom_profile | object | 推断 | (3 fields) |
| data.canonical.symptom_profile.necessary | array<string> | 推断 | ['汗出', '恶风'] |
| data.canonical.symptom_profile.common | array<string> | 推断 | ['头痛', '发热', '脉浮缓'] |
| data.canonical.symptom_profile.excluding | array<string> | 推断 | ['无汗', '脉浮紧'] |
| data.canonical.pathology | string | 推断 | 风邪袭表，营卫不和 |
| data.canonical.herbs | array<object> | 推断 |  |
| data.canonical.herbs.name | string | 推断 | 桂枝 |
| data.canonical.herbs.dosage | string | 推断 | 三两 |
| data.canonical.usage | string | 推断 | 以水七升，微火煮取三升，去滓，适寒温，服一升 |
| data.canonical.contraindications | array<string> | 推断 | ['无汗', '脉浮紧（麻黄汤证）'] |
| data.canonical.core_herbs | array<string> | 推断 | ['桂枝', '芍药'] |
| data.canonical.core_combinations | string | 推断 | 桂枝、芍药 |

> **注**：以上为自动推断的Schema，可能不完整。请根据实际数据补充。

---

## 验证规则

1. `id` 必须唯一，且为URL-safe字符串
2. `mastery` 必须包含6个固定向量键：`0→1`, `1→0`, `0→2`, `2→0`, `0→usage`, `0→contra`
3. `source_text_ids` 中的每个ID必须在 `source_cards.json` 中存在
4. `canonical.herbs` 中的 `name` 不能为空
5. `tags` 不能为空数组

---

## 变更历史

| 日期 | 变更 | 变更人 | 验证 |
|------|------|--------|------|
| 2026-07-02 | 初始版本（README创建） | AI | 待验证 |

---

## 关联文件

- `source_cards.json`：关联的原文条文
- `sp_cases.json`：关联的标准化病人病例
- `experience_cards.json`：关联的临床医案
