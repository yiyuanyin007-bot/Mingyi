# core_herbs_research.json 数据说明

> **文档编号**：DATA-CORE-HERBS-RESEARCH-001  
> **版本**：v1.0  
> **生成时间**：2026-07-02  
> **生成方式**：自动化脚本从JSON内容推断  
> **需人工审阅**：是（Schema推断可能不完整）

---

## 基本信息

| 字段 | 值 |
|------|-----|
| 文件名 | `core_herbs_research.json` |
| 数据类型 | `target_formulas` |
| 记录数 | 4 |
| 最后更新 | 2026-07-02 |
| 维护者 | 项目团队 |
| 验证状态 | 待验证（需人工确认Schema） |
| 来源 | 项目数据资产 |

---

## Schema 说明（顶层字段）

| 字段名 | 类型 | 必填 | 示例 |
|--------|------|------|------|
| version | integer | 推断 | 1 |
| description | string | 推断 | 35 张经方核心药物组合（君臣佐使 / 核心药对）检索汇总，用于方名↔药物题出题。 |
| notes | array<string> | 推断 | ['核心药物组合不等于全部药物，而是临床记忆与辨证时最关键的药对或药组。', '来源以《伤寒论》原方、《医宗金鉴·删补名医方论》、百度健康/百度百科及《方剂学》教材为主。', '麻黄杏仁甘草石膏汤与麻杏甘石汤为同一方剂，已在目标清单中合并，不重复建卡。']... |
| formulas | array<object> | 推断 |  |
| formulas.id | string | 推断 | gui-zhi-tang |
| formulas.name | string | 推断 | 桂枝汤 |
| formulas.core_herbs | array<string> | 推断 | ['桂枝', '芍药'] |
| formulas.core_combinations | string | 推断 | 桂枝、芍药 |
| formulas.rationale | string | 推断 | 桂枝解肌发表、芍药敛阴和营，二者一散一收，调和营卫，为全方核心药对。 |
| formulas.sources | array<string> | 推断 | ['《伤寒论》', '《医宗金鉴·删补名医方论》', '经方派（黄煌）'] |
| formulas.source_urls | array<string> | 推断 | ['https://www.jingfangpai.cn/p/10056069/'] |

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

- `formula_cards.json`：覆盖清单中的方剂
