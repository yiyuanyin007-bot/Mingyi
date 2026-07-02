# experience_cards.json 数据说明

> **文档编号**：DATA-EXPERIENCE-CARDS-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `experience_cards.json` |
| 数据类型 | `experience_card` |
| 记录数 | 3 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| id | string | 推断 | gui-zhi-tang_exp-001 |
| type | string | 推断 | experience_card |
| parent_formula_id | string | 推断 | gui-zhi-tang |
| source_text_id | string | 推断 | gui-zhi-tang-src-001 |
| title | string | 推断 | 桂枝汤治汗出恶风一例 |
| source | string | 推断 | 个人医案 |
| source_type | string | 推断 | 个人医案 |
| topic | string | 推断 | 临床应用 |
| content | string | 推断 | 患者表现为汗出、恶风、脉浮缓，予桂枝汤原方。服后汗出减少，恶风减轻。 |
| lineage | object | 推断 | (3 fields) |
| lineage.base_formula | string | 推断 | 桂枝汤 |
| lineage.variant_path | array | 推断 |  |
| lineage.reference_source | string | 推断 | 个人临床 |
| efficacy | object | 推断 | (3 fields) |
| efficacy.subjective_effective | boolean | 推断 | True |
| efficacy.objective_change | array<string> | 推断 | ['汗出减少', '恶风减轻'] |
| efficacy.confidence_level | string | 推断 | 中 |
| unlock_level | integer | 推断 | 1 |
| tags | array<string> | 推断 | ['桂枝汤', '汗出', '恶风'] |
| created_at | string | 推断 | 2026-06-13T11:35:24.520535 |
| updated_at | string | 推断 | 2026-06-13T11:35:24.520535 |

> **注**：以上为自动推断的Schema，可能不完整。请根据实际数据补充。

---

## 验证规则

1. `experience_id` 必须唯一
2. `formula_id` 必须在 `formula_cards.json` 中存在
3. `subjective_effective` 和 `objective_change` 不能同时为空

---

## 变更历史

| 日期 | 变更 | 变更人 | 验证 |
|------|------|--------|------|
| 2026-07-02 | 初始版本（README创建） | AI | 待验证 |

---

## 关联文件

- `formula_cards.json`：关联的方剂
