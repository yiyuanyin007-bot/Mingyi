# symptom_expression_index.json 数据说明

> **文档编号**：DATA-SYMPTOM-EXPRESSION-INDEX-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `symptom_expression_index.json` |
| 数据类型 | `unknown` |
| 记录数 | 3 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| version | string | 推断 | 1.1.0 |
| total_symptoms | integer | 推断 | 385 |
| symptoms | object | 推断 | (385 fields) |
| symptoms.不可转侧 | object | 推断 | (3 fields) |
| symptoms.不可转侧.category | string | 推断 | 头身类 |
| symptoms.不可转侧.subcategory | string | 推断 | 头身 |
| symptoms.不可转侧.expressions | array<string> | 推断 | ['翻个身都难，浑身僵硬'] |
| symptoms.无汗 | object | 推断 | (3 fields) |
| symptoms.无汗.category | string | 推断 | 汗出类 |
| symptoms.无汗.subcategory | string | 推断 | 无汗 |
| symptoms.无汗.expressions | array<string> | 推断 | ['不出汗，身上干干的'] |
| symptoms.不汗出 | object | 推断 | (3 fields) |
| symptoms.不汗出.category | string | 推断 | 汗出类 |
| symptoms.不汗出.subcategory | string | 推断 | 有汗 |
| symptoms.不汗出.expressions | array<string> | 推断 | ['不汗出（患者表达待补充）'] |
| symptoms.高热 | object | 推断 | (3 fields) |
| symptoms.高热.category | string | 推断 | 寒热类 |
| symptoms.高热.subcategory | string | 推断 | 发热 |
| symptoms.高热.expressions | array<string> | 推断 | ['烧得厉害，39度多，浑身烫'] |
| symptoms.中热 | object | 推断 | (3 fields) |
| symptoms.中热.category | string | 推断 | 寒热类 |
| symptoms.中热.subcategory | string | 推断 | 发热 |
| symptoms.中热.expressions | array<string> | 推断 | ['发烧，38度左右'] |
| symptoms.微热 | object | 推断 | (3 fields) |
| symptoms.微热.category | string | 推断 | 寒热类 |
| symptoms.微热.subcategory | string | 推断 | 发热 |
| symptoms.微热.expressions | array<string> | 推断 | ['有点低烧，37度5到38度'] |
| symptoms.翕翕发热 | object | 推断 | (3 fields) |
| symptoms.翕翕发热.category | string | 推断 | 寒热类 |
| symptoms.翕翕发热.subcategory | string | 推断 | 发热 |

> **注**：以上为自动推断的Schema，可能不完整。请根据实际数据补充。

---

## 验证规则

1. JSON 语法合法
2. 关键字段不为空

---

## 变更历史

| 日期 | 变更 | 变更人 | 验证 |
|------|------|--------|------|
| 2026-07-02 | 初始版本（README创建） | AI | 待验证 |

---

## 关联文件

- 无直接关联文件
