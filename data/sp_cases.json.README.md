# sp_cases.json 数据说明

> **文档编号**：DATA-SP-CASES-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `sp_cases.json` |
| 数据类型 | `sp_case` |
| 记录数 | 106 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| schema_version | string | 推断 | 1.0.0 |
| session_id | string | 推断 | sp-SHL-ty-12-20260617-153000 |
| mode | string | 推断 | article |
| difficulty | integer | 推断 | 2 |
| difficulty_config | object | 推断 | (7 fields) |
| difficulty_config.inquiry_slots | integer | 推断 | 5 |
| difficulty_config.l2_allowance_per_direction | integer | 推断 | 1 |
| difficulty_config.l3_noise_probability | number | 推断 | 0.3 |
| difficulty_config.distractor_count | integer | 推断 | 4 |
| difficulty_config.distractor_level | string | 推断 | medium |
| difficulty_config.physical_exam_completeness | string | 推断 | full |
| difficulty_config.chief_complaint_directness | string | 推断 | moderate |
| source_article | string | 推断 | SHL-ty-12 |
| source_classic | string | 推断 | 伤寒论 |
| chapter | string | 推断 | 太阳病篇 |
| patient | object | 推断 | (6 fields) |
| patient.name | string | 推断 | 王女士 |
| patient.age | integer | 推断 | 32 |
| patient.gender | string | 推断 | 女 |
| patient.occupation | string | 推断 | 公司文员 |
| patient.background | string | 推断 | 有3岁孩子，最近商场吹空调受凉 |
| patient.persona_id | string | 推断 | anxious-middle-aged-female |
| chief_complaint | object | 推断 | (5 fields) |
| chief_complaint.text | string | 推断 | 大夫，我来看病两天了。就是前几天带娃去商场，里面空调开得特别冷，我穿得少，回来第二天就开始不舒服。身... |
| chief_complaint.revealed_symptoms | array<string> | 推断 | ['汗出', '恶风', '发热']... |
| chief_complaint.l0_symptoms | array<string> | 推断 | ['汗出', '恶风', '发热']... |
| chief_complaint.directness | string | 推断 | moderate |
| chief_complaint.word_count | integer | 推断 | 186 |
| inquiries | object | 推断 | (10 fields) |
| inquiries.01_寒热 | object | 推断 | (8 fields) |

> **注**：以上为自动推断的Schema，可能不完整。请根据实际数据补充。

---

## 验证规则

1. `schema_version` 必须为 `1.0.0`
2. `difficulty` 必须为 1、2 或 3
3. `formula_id` 必须在 `formula_cards.json` 中存在
4. `patient.persona_id` 必须是预定义人格之一
5. `inquiries` 必须包含至少10个问诊方向中的有效方向

---

## 变更历史

| 日期 | 变更 | 变更人 | 验证 |
|------|------|--------|------|
| 2026-07-02 | 初始版本（README创建） | AI | 待验证 |

---

## 关联文件

- `formula_cards.json`：关联的方剂
- `source_cards.json`：关联的原文
- `symptom_expression_index.json`：症状表达库
