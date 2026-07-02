# source_cards.json 数据说明

> **文档编号**：DATA-SOURCE-CARDS-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `source_cards.json` |
| 数据类型 | `source_card` |
| 记录数 | 398 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| id | string | 推断 | article-001 |
| type | string | 推断 | source_card |
| source | string | 推断 | 伤寒论 |
| chapter | string | 推断 | 太阳病篇 |
| article_number | string | 推断 | 1 |
| text | string | 推断 | 太阳之为病，脉浮，头项强痛而恶寒。 |
| mentioned_formulas | array | 推断 |  |
| symptoms | array<string> | 推断 | ['头项强痛', '恶寒', '脉浮'] |
| key_conclusion | string | 推断 |  |

> **注**：以上为自动推断的Schema，可能不完整。请根据实际数据补充。

---

## 验证规则

1. `id` 格式必须为 `article-XXX`，其中XXX为三位数字
2. `article_number` 必须与 `id` 中的编号一致
3. `text` 不能为空
4. `chapter` 必须是8个篇章之一：太阳病篇/阳明病篇/少阳病篇/太阴病篇/少阴病篇/厥阴病篇/霍乱病篇/劳复病篇

---

## 变更历史

| 日期 | 变更 | 变更人 | 验证 |
|------|------|--------|------|
| 2026-07-02 | 初始版本（README创建） | AI | 待验证 |

---

## 关联文件

- `formula_cards.json`：引用本条文的方剂
- `source_cards_extended.json`：扩展条文
