# 条文查找计划与品质标准（Article Lookup Plan & Quality Standards）

> 方法论文件。定义如何为新增方剂/经典查找对应条文、如何验证品质、如何建立多对多映射。
> 当新增经典（如《金匮要略》）或发现 `source_article_map.md` 有缺失时，按此计划执行。

---

## 查找计划（Lookup Protocol）

### 步骤 1：确定查找范围

输入：方剂名（如"小柴胡汤"）或经典名（如"金匮要略·痰饮咳嗽病脉证"）
输出：该方剂/篇章可能涉及的全部条文编号清单

查找顺序：
1. 先查 `source_cards.json` — 已有条目
2. 再查 `sun_target_formulas.json` — 目标覆盖清单
3. 最后查权威电子版（如《伤寒论》宋本/成本/桂林古本）— 补全遗漏

### 步骤 2：多源交叉验证

每个条文编号必须至少 2 个来源一致：

| 来源类型 | 权重 | 示例 |
|---------|------|------|
| 权威教材 | 高 | 刘渡舟《伤寒论讲稿》、郝万山《伤寒论》 |
| 数字古籍库 | 高 | 中医古籍网、伤寒论数据库 |
| 工具书 | 中 | 《伤寒论类方》《伤寒论方剂学》 |
| 网络百科 | 低 | 百度百科（仅作参考，不单独采信） |

### 步骤 3：品质检验清单

每个条文通过以下 5 项检验方可入库：

- [ ] **方证对应**：条文末尾明确出现"XX汤主之"或"宜XX汤"或"可与XX汤"
- [ ] **症状可述**：条文包含至少 2 个可由患者主动叙述或查体呈现的症状
- [ ] **无传变歧义**：条文描述的是当前证候，而非"若...则..."的传变假设（传变条文可记录但标注）
- [ ] **版本一致**：条文编号在宋本/成本/康平本中一致，或差异在备注中说明
- [ ] **不重复**：同一编号+同一方剂组合在映射表中唯一

### 步骤 4：多对多关系解析

每个方剂完成查找后，必须填写：

```yaml
方剂: 小柴胡汤
对应条文: [96, 99, 101, 103, 104, 144, 229, 230, 231, 232, 266, 379]
关系类型:
  主方条文: [96]        # 明确"小柴胡汤主之"
  加减条文: [96-ors]    # 条文96中的"或"字分支（或渴、或腹中痛...）
  先与条文: [103, 104]  # "先与小柴胡汤"，后续转大柴胡/柴胡加芒硝
  合方条文: [229, 230]  # 与其他方合用的场景
  转方条文: [266, 379]  # 从其他方转来小柴胡的场景
```

**核心原则**：
- 主方条文（"主之"）必须全部纳入
- 加减条文（"或"字分支）可合并到主方条文内，不单独拆分为新条目
- 先与/转方条文纳入，但在 `note` 中标注"先与"或"转方"
- 合方条文视情况而定，若合方后形成新方剂（如柴胡桂枝汤），不纳入原方条目

### 步骤 5：口语化线索映射

对 `symptom_pool` 中每个症状，必须提供至少 1 条口语化表达。

映射标准：
- 不直接使用中医术语（如"营卫不和""阳浮阴弱"）
- 符合患者身份（年龄、职业、教育背景决定措辞）
- 可携带情绪、误解、生活细节
- 多个症状可组合在一个叙事句中（如"脖子后面僵僵的，像被什么扯住，吹了空调更难受"）

---

## 缺失记录模板

发现以下情况时，在 `docs/sp_missing_records.md` 追加记录：

### 记录格式

```markdown
## YYYY-MM-DD 核对批次

### 有方无条
- [ ] 方剂名：XXX
- 所在章节：太阳病篇/金匮·XX篇
- 问题描述：sun_target_formulas.json 中有此方，但 source_cards.json 和 source_article_map.md 中无对应条文
- 查找结果：尚未找到 / 找到但编号待确认（第X条？）
- 预计处理：补入 source_article_map.md / 需用户确认

### 有条无方
- [ ] 条文编号：伤寒论第X条
- 问题描述：条文提及方剂，但 formula_cards.json 中无此方卡
- 查找结果：确认方剂名
- 预计处理：需新增 formula_card / 合并到已有方

### 编号待补
- [ ] 方剂名：XXX
- 问题描述：source_cards.json 中 article_number 为"待补充"
- 建议编号：第X条（依据：XXX版本）
- 预计处理：直接补全 / 需版本核对

### 症状冲突
- [ ] 条文编号：SHL-ty-X
- 问题描述：source_cards.json 的 symptom_pool 与 formula_cards.json 的 symptom_profile 不一致
- 冲突项：如"脉浮紧" vs "脉浮缓"
- 预计处理：以条文原文为准 / 需用户确认
```

---

## 扩展经典时的查找流程

当新增《金匮要略》《温病条辨》等经典时：

### 步骤 1：编码注册

在 `source_article_map.md` 头部编码规范中新增：

```yaml
经典名称: 金匮要略
classic_code: JKYL
篇章列表:
  - 脏腑经络先后病脉证: xgx
  - 痉湿暍病脉证: jsw
  - ...
```

### 步骤 2：方剂优先清单

从《金匮要略》中筛选高频方剂，按优先级排序：
- P0：与现有伤寒论方剂重叠者（如桂枝汤、麻黄汤、小柴胡汤在金匮中的新条文）
- P1：金匮独有方剂且临床常用者（如苓桂术甘汤、甘麦大枣汤、大黄蛰虫丸）
- P2：金匮独有方剂但使用频率较低者

### 步骤 3：条文品质检验

对金匮条文，额外检验：
- [ ] 条文是否包含"主之"或"宜"或"可与"
- [ ] 症状描述是否足够具体（金匮部分条文较简略，需评估是否适合SP模拟）
- [ ] 是否与伤寒论条文有重叠（如金匮也用桂枝汤，需区分不同应用场景）

### 步骤 4：建立跨经典关联

若同一方剂在多个经典中出现，建立关联注释：

```yaml
方剂: 桂枝汤
跨经典映射:
  伤寒论: [SHL-ty-12, SHL-ty-13, ...]
  金匮要略: [JKYL-xgx-XX, JKYL-XX-XX]
  区别要点:
    - 伤寒论：外感表虚证
    - 金匮：杂病中营卫不和（如自汗、妊娠反应等）
```

---

## 品质检验工具

### 快速核对脚本（Python 伪代码）

```python
def validate_article_map(source_cards, formula_cards, article_map):
    """
    验证三源数据一致性
    """
    errors = []
    
    # 1. 检查所有 article_map 条目在 source_cards 中有对应
    for article in article_map:
        if article.id not in [sc.id for sc in source_cards]:
            errors.append(f"有方无条: {article.id}")
    
    # 2. 检查所有 article_map 的 formulas 在 formula_cards 中存在
    for article in article_map:
        for formula_id in article.formulas:
            if formula_id not in [fc.id for fc in formula_cards]:
                errors.append(f"有条无方: {article.id} -> {formula_id}")
    
    # 3. 检查 symptom_pool 与 clue_map 一一对应
    for article in article_map:
        for symptom in article.symptom_pool:
            if symptom not in article.clue_map and symptom not in ["脉浮", "脉沉", "苔白", "苔黄"]:
                errors.append(f"缺口语线索: {article.id} -> {symptom}")
    
    # 4. 检查必要症状在 clue_map 或 symptom_pool 中
    for article in article_map:
        for formula_id in article.formulas:
            formula = get_formula(formula_id, formula_cards)
            for necessary in formula.canonical.symptom_profile.necessary:
                if necessary not in article.symptom_pool:
                    errors.append(f"遗漏必要症状: {article.id} -> {necessary}")
    
    return errors
```

---

## 迭代检查清单

每次更新 `source_article_map.md` 后执行：

- [ ] 新增条目的 `article_number` 已验证（非"待补充"）
- [ ] `clue_map` 中每个症状都有口语化表达
- [ ] 多对多关系（一方多条文）已在 `note` 中说明
- [ ] 缺失记录已同步更新到 `docs/sp_missing_records.md`
- [ ] 版本号已更新（在文件末尾记录 YYYY-MM-DD 版本）
