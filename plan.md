# SP方剂模式生成计划 · plan.md

> **计划编号**: PLAN-SP-FM-20260621-EXEC  
> **创建日期**: 2026-06-21  
> **执行策略**: 渐进式，每方1例（diff2），生成一批集成一批  
> **总目标**: 63方 × 方剂模式SP = 63例

---

## 阶段总览

| 阶段 | 批次 | 方剂数 | 内容 | 预计耗时 | 产出 |
|------|------|--------|------|----------|------|
| Stage 1 | Batch 1 | 35 | 已有SP方 → 方剂模式转换（复用病例骨架，重设计干扰项） | 2-3小时 | 35例方剂模式SP JSON |
| Stage 2 | Batch 2 | 11 | 太阳病篇缺SP方 | 1-2小时 | 11例方剂模式SP JSON |
| Stage 3 | Batch 3 | 4 | 阳明+少阳病篇缺SP方 | 1小时 | 4例方剂模式SP JSON |
| Stage 4 | Batch 4 | 8 | 少阴+太阴病篇缺SP方 | 1-2小时 | 8例方剂模式SP JSON |
| Stage 5 | Batch 5 | 5 | 厥阴+霍乱病篇缺SP方 | 1小时 | 5例方剂模式SP JSON |
| Stage 6 | 集成 | 63 | 前端集成需求文档（转交互设计系统） | 30分钟 | 需求文档 |

---

## 执行原则

1. **每例标准**：
   - mode: "formula"
   - difficulty: 2（标准）
   - 干扰项4个：1同病异方 + 1类方混淆 + 1药物相近方 + 1同症异病机
   - 鉴别分析（key_differentials）必须引用symptom_profile.necessary/common/excluding
   - 人格按persona_system.md映射
   - JSON验证：governance.py 0错误0警告

2. **数据安全**：
   - 每批次生成前备份sp_cases.json
   - 每批次追加后验证JSON
   - 每批次登记CHANGELOG

3. **并行策略**：
   - 每个子Agent处理5-7个方剂
   - 子Agent读取：persona_system.md / json_schema.md / source_article_map.json / formula_cards.json
   - 子Agent输出：完整的SP JSON数组

---

## Stage 1 详细设计：Batch 1（35方转换）

### 输入
- 已有43例SP病例（mode=article）
- 对应35方的方剂卡片（symptom_profile）
- 63方全量列表（用于选择干扰项）

### 转换规则
1. 保留：patient / chief_complaint / inquiries / physical_exam / case_summary
2. 修改：mode → "formula"
3. 重设计：question.options（5个选项，方剂ID+方名+药物速览+症状提示）
4. 重设计：answer_key（correct_formula_id为主键）
5. 重设计：reference_analysis.key_differentials（方证鉴别逻辑）

### 子任务分配

| 子任务 | 处理方剂 | 数量 |
|--------|----------|------|
| Worker 1 | 桂枝汤、麻黄汤、葛根汤、大承气汤、小柴胡汤 | 5 |
| Worker 2 | 桂枝加葛根汤、桂枝加厚朴杏子汤、桂枝去芍药汤、麻杏甘石汤、小建中汤 | 5 |
| Worker 3 | 大青龙汤、小青龙汤、桂枝加附子汤、桂枝麻黄各半汤、桂枝二越婢一汤 | 5 |
| Worker 4 | 葛根加半夏汤、葛根芩连汤、五苓散、真武汤、四逆汤 | 5 |
| Worker 5 | 白虎汤、调胃承气汤、大柴胡汤、柴胡加龙骨牡蛎汤、栀子豉汤 | 5 |
| Worker 6 | 柴胡加芒硝汤、栀子甘草豉汤、栀子生姜豉汤、栀子厚朴汤、栀子干姜汤 | 5 |
| Worker 7 | 干姜附子汤、茯苓四逆汤、桃核承气汤、抵当汤、白虎加人参汤 | 5 |

---

## Stage 2-5 详细设计

（详见docs/方剂模式SP问诊工作计划.md）

---

## 验证关卡

每个Stage结束后必须：
1. ✅ JSON语法验证（Python json.load）
2. ✅ governance.py check-sp 0错误
3. ✅ 新病例mode全部为"formula"
4. ✅ 新病例formula_id不重复（同一方只有1例diff2）
5. ✅ 备份文件存在
6. ✅ CHANGELOG已登记

---

## 产出物

- data/sp_cases.json（追加63例，总计106例）
- docs/CHANGELOG.md（更新）
- data/archive/sp_cases-before-batch-*.json（备份）
- docs/方剂模式前端集成需求文档.md（Stage 6）
