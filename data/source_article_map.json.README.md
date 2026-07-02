# source_article_map.json 数据说明

> **文档编号**：DATA-SOURCE-ARTICLE-MAP-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `source_article_map.json` |
| 数据类型 | `source_card` |
| 记录数 | 43 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| id | string | 推断 | SHL-ty-12 |
| name | string | 推断 | 桂枝汤主证 |
| source_classic | string | 推断 | 伤寒论 |
| chapter | string | 推断 | 太阳病篇 |
| article_number | integer | 推断 | 12 |
| text | string | 推断 | 太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主... |
| formulas | array<string> | 推断 | ['gui-zhi-tang'] |
| symptom_pool | array<string> | 推断 | ['汗出', '恶风', '啬啬恶寒']... |
| clue_map | object | 推断 | (6 fields) |
| clue_map.汗出 | string | 推断 | 稍微动一下就一身汗，擦了又有，晚上也盗汗 |
| clue_map.恶风 | string | 推断 | 怕风得很，风吹过来就觉得往骨头里钻，起鸡皮疙瘩 |
| clue_map.发热 | string | 推断 | 身上热乎乎的，但不是高烧那种，像蒸桑拿 |
| clue_map.鼻鸣 | string | 推断 | 鼻子不通气，呼吸声音重，像感冒 |
| clue_map.干呕 | string | 推断 | 胃里有点恶心，但又吐不出来 |
| clue_map.脉浮缓 | string | 推断 | （查体呈现） |
| difficulty | integer | 推断 | 1 |
| status | string | 推断 | confirmed |
| note | string | 推断 | 桂枝汤最典型条文，太阳中风代表证 |

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
