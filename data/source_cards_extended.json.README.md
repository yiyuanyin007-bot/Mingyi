# source_cards_extended.json 数据说明

> **文档编号**：DATA-SOURCE-CARDS-EXTENDED-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `source_cards_extended.json` |
| 数据类型 | `source_card_extended` |
| 记录数 | 35 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| id | string | 推断 | wu-ling-san-ext |
| type | string | 推断 | source_card_extended |
| formula_id | string | 推断 | wu-ling-san |
| formula_name | string | 推断 | 五苓散 |
| mentioned_formulas | array<string> | 推断 | ['五苓散'] |
| source_chapter | string | 推断 | 太阳病篇 |
| articles | array<object> | 推断 |  |
| articles.article_number | string | 推断 | 第72条 |
| articles.article_num | integer | 推断 | 72 |
| articles.text | string | 推断 | 太阳病府证（蓄水证）发汗已，脉浮数，烦渴者，五苓散主之。 |
| articles.source | string | 推断 | 小红书针道轩 |
| articles.note_id | string | 推断 | 66a3b7f9000000000600e214 |
| articles.annotations | object | 推断 | (2 fields) |
| articles.annotations.刘渡舟 | string | 推断 | 资料暂缺 |
| articles.annotations.胡希恕 | string | 推断 | 资料暂缺 |
| total_articles | integer | 推断 | 3 |
| source | string | 推断 | extracted/xiaohongshu_teacher/伤寒论条文_小红书针道轩.md |

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
