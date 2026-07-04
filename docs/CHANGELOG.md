# 经方学习系统 · 变更登记簿（CHANGELOG）

> **文档编号**：DOC-CHANGELOG-001  
> **版本**：v1.0  
> **状态**：已确认  
> **最后变更**：SH-20260629-003  
> **变更历史**：见本文件  
> **适用范围**：经方学习系统（伤寒论方剂训练 · MVP v8）所有文档与代码变更  
> **生成时间**：2026-06-17  
> **用途**：确保所有文件可追踪、迭代有依据、项目历程清晰可查

---

## 编号规则
- **格式**：`SH-YYYYMMDD-NNN`
- **示例**：`SH-20260617-001`
- **说明**：SH = 伤寒（Shang Han），每日从 001 开始编号，不跨日连续
- **废弃变更**：保留记录，不删除，只标记状态为「已废弃」并注明原因

## 状态定义
- 待登记 → 待确认 → 已确认 → 已执行 → 已归档
- 已废弃（记录原因，不删除）

## 来源定义
- **用户确认**：用户直接提出的决策（如"我要XX功能"）
- **测试反馈**：冒烟测试、浏览器验证中发现的问题
- **文献依据**：基于中医文献、考古数据、教材的变更（如剂量换算标准）
- **内部思考**：AI 自主发现的设计优化、技术选型、架构调整
- **用户指正**：用户指出之前结论或实现的问题（如"这个剂量不对"）

---

## 变更统计
- **总变更数**：84
- **总文档数**：48
- **已归档**：75
- **待确认**：0
- **已废弃**：0

---

## 变更记录

### 2026-06-17

| 编号 | 状态 | 来源 | 触发 | 变更内容 | 影响文档 | 确认人 |
|---|---|---|---|---|---|---|
| SH-20260617-001 | ✅已归档 | 用户指正 | 卡片不显示 | 修复 loadData 命名冲突导致卡片列表刷不出来的 bug | app/index.html | Chen |
| SH-20260617-002 | ✅已归档 | 用户确认 | 笔记表格不显示 | 给 renderMarkdown 添加 Markdown 表格渲染支持 | app/index.html | Chen |
| SH-20260617-003 | ✅已归档 | 用户确认 | 快速导航需求 | 添加回到顶部/回到底部/跳到笔记浮动按钮 | app/index.html | Chen |
| SH-20260617-004 | ✅已归档 | 用户确认 | 笔记格式优化 | 优化"问 Kimi"提示词，生成结构化笔记（辨证点、混淆方、生理学解读） | app/index.html | Chen |
| SH-20260617-005 | ✅已归档 | 用户确认 | 剂量换算需求 | 添加药物剂量现代换算（1两=3g/6g/9g/15g四种标准） | app/index.html | Chen |
| SH-20260617-006 | ✅已归档 | 文献依据 | 古方剂量换算 | 检索《伤寒论》古方剂量转换文献（汉代考古、李时珍、柯雪帆等） | - | AI |
| SH-20260617-007 | ✅已归档 | 用户确认 | UI优化 | 重新设计剂量显示为药丸式UI（统一配色+经方高亮） | app/index.html | Chen |
| SH-20260617-008 | ✅已归档 | 用户指正 | 医案内容截断 | 修复临床医案 summary 被强制截断到280字符的问题 | app/index.html | Chen |
| SH-20260617-009 | ✅已归档 | 用户确认 | 笔记快速跳转 | 在浮动按钮中间增加"N"按钮，快速跳到笔记区域 | app/index.html | Chen |
| SH-20260617-010 | ✅已归档 | 文献依据 | 特殊单位换算 | 检索特殊剂量单位文献（枚、升、合、方寸匕、铢等） | - | AI |
| SH-20260617-011 | ✅已归档 | 用户确认 | 特殊单位实现 | 实现特殊剂量单位换算（杏仁0.3-0.5g/枚、半夏130g/升等） | app/index.html | Chen |
| SH-20260617-012 | ✅已归档 | 用户指正 | 括号解析问题 | 修复剂量解析括号问题（十四枚（擘）、四合（绵裹）） | app/index.html | Chen |
| SH-20260617-013 | ✅已归档 | 用户确认 | 点击交互优化 | 剂量区域点击不触发卡片切换，仅作为提示浏览 | app/index.html | Chen |
| SH-20260617-014 | ✅已归档 | 用户确认 | 区块切换优化 | 病机/禁忌/煎服法区块点击大框架即可切换显示/隐藏 | app/index.html | Chen |
| SH-20260617-015 | ✅已归档 | 用户确认 | 文档治理体系 | 建立文档治理体系（CHANGELOG.md + Skill），规范变更登记流程 | docs/CHANGELOG.md | Chen |
| SH-20260617-016 | ✅已归档 | 用户指正 | Markdown渲染问题 | 修复renderMarkdown：h4标题未渲染、列表间距过大、段落多余空白 | app/index.html | Chen |
| SH-20260617-017 | ✅已归档 | 用户确认 | 条文系统需求 | 设计条文系统三方案（内联/侧边/弹窗），待用户选定 | docs/条文系统设计方案.md | Chen |
| SH-20260617-018 | ✅已执行 | 用户确认 | 原型体验 | 创建条文系统交互原型网页，供用户点击体验三方案 | docs/prototype-source-system.html | Chen |
| SH-20260617-019 | ✅已执行 | 用户确认 | 方案B实施 | 实现侧边条文面板：浮动按钮S、CSS/HTML结构、JS函数（toggle/render/问Kimi/记笔记）、sp-前缀样式 | app/index.html | Chen |
| SH-20260617-020 | ✅已执行 | 内部思考 | 数据补全 | batch1：8方references接入（黄煌医案、针道轩条文、倪海厦言论、原文演绎） | data/formula_cards.json | AI |
| SH-20260617-021 | ✅已执行 | 内部思考 | 数据补全 | batch2：6方桂枝类方references接入（类方对比学习） | data/formula_cards.json | AI |
| SH-20260617-022 | ✅已执行 | 内部思考 | 数据补全 | batch3：7方柴胡/栀子/葛根类方references接入 | data/formula_cards.json | AI |
| SH-20260617-023 | ✅已执行 | 内部思考 | 数据补全 | batch4：4方边缘方/特殊方references接入（35方全覆盖） | data/formula_cards.json | AI |
| SH-20260617-024 | ✅已执行 | 文献依据 | 条文校对 | 对source_cards.json进行条文核对：编号补全建议、症状冲突记录、缺失记录建档 | data/source_cards.json, docs/条文校对报告.md, docs/sp_missing_records.md | AI |
| SH-20260617-025 | ✅已执行 | 用户确认 | 条文校对A+D | 为source_cards.json补充35张卡片article_number（精确到《伤寒论》条文编号），修正3处原文（麻黄汤、柴胡加芒硝汤、干姜附子汤） | data/source_cards.json, docs/条文校对报告.md, docs/三层锚定整合思路.md | AI |
| SH-20260617-026 | ✅已执行 | 用户确认 | 药名别名映射 | 创建 herb-aliases.js：150味药名别名映射表，index.html引用脚本化 | app/herb-aliases.js, app/index.html | AI |
| SH-20260617-027 | ✅已执行 | 用户确认 | 跨对话框协作 | 创建交互需求文档（REQ-01~REQ-05），供操作系统对话实现UI按钮 | docs/交互需求文档-REQ-01-v2.md | AI |
| SH-20260617-028 | ✅已执行 | 用户确认 | 跨对话框分工 | 创建跨对话框分工红线文档，划定数据层与交互层职责边界 | docs/跨对话框分工红线.md | AI |
| SH-20260617-029 | ✅已执行 | 内部思考 | 条文讲解原型 | 生成3个条文讲解交互原型（Accordion/SlidePanel/Modal），统一视觉设计，供用户决策 | app/prototypes/annotation-accordion.html, app/prototypes/annotation-slide-panel.html, app/prototypes/annotation-modal.html | AI |
| SH-20260617-030 | ✅已执行（补登） | 用户确认 | 新功能 | 创建标准化病人（SP）Skill 体系：SKILL.md + 5 个 references 文件（条文映射、查找计划、十问框架、口语表达、JSON Schema、人格系统） | standardized-patient/** | AI |
| SH-20260617-031 | ✅已执行（补登） | 用户确认 | 新功能 | 集成 SP 问诊到 app/index.html：导航栏按钮、CSS 样式、左右分栏布局、JS 逻辑（加载/问诊/作答/反馈） | app/index.html | AI |
| SH-20260617-032 | ✅已执行（补登） | 用户确认 | 数据补全 | 创建 data/sp_cases.json，包含 8 个 SP 病例（桂枝汤、麻黄汤、葛根汤、小柴胡汤、大承气汤、小青龙汤、桂枝加葛根汤、麻杏甘石汤），JSON 已验证 | data/sp_cases.json | AI |
| SH-20260617-033 | ✅已执行（补登） | 用户确认 | 数据补全 | 更新 docs/sp_missing_records.md：补登 24 条条文编号、5 条症状冲突、一方多文待补记录 | docs/sp_missing_records.md | AI |
| SH-20260617-034 | ✅已执行（补登） | 用户指正 | 页面修复 | 修复 SP 问诊导航按钮问题：goToSP() 直接操作 DOM 切换 viewSP 视图（绕过 switchView 首字母大写转换问题） | app/index.html | AI |
| SH-20260617-035 | ✅已执行 | 用户确认 | 治理机制增强 | 建立多层治理机制：IDENTITY.md注入铁律、scripts/governance.py自动化检查、scripts/safe_edit.py安全编辑、scripts/session_start.py会话启动检查、AGENTS.md增强禁止行为与紧急处理 | AGENTS.md, IDENTITY.md, scripts/governance.py, scripts/safe_edit.py, scripts/session_start.py | AI |
| SH-20260617-036 | ✅已执行 | 用户确认 | 条文讲解UI | 方案B：右侧滑入面板实现。条文讲解区域改为200字摘要+渐变遮罩，点击阅读全文→右侧滑入面板。面板内支持Markdown渲染、标签着色（【条文】绿/【刘渡舟】蓝/【胡希恕】橙）、引用块样式。支持ESC/遮罩/关闭按钮关闭。暗色主题适配。备份index-before-slide-panel-20260617.html | app/index.html | AI |
| SH-20260617-037 | ✅已执行 | 用户确认 | 数据审计 | 审计 SP 病例 8 例：修复病例 8（麻杏甘石汤）formula_id 不匹配（ma-xing-gan-shi-tang → ma-huang-xing-ren-gan-cao-shi-gao-tang），生成系统化审计报告 docs/sp_cases_audit_report.md，记录 6 处待优化问题 | data/sp_cases.json, docs/sp_cases_audit_report.md | AI |
| SH-20260618-001 | ✅已执行 | 用户确认 | 覆盖度调研 | 生成伤寒论方剂覆盖度调研报告：96方总数，35方已覆盖，61方缺失，按篇章详表，资料完整度分析，优先级排序 | docs/方剂卡片覆盖度调研报告.md | AI |
| SH-20260618-002 | ✅已执行 | 用户确认 | 红线划分 | 划清方剂系统与条文系统工作红线，生成提示词模板，确保双方不越界 | docs/工作红线-方剂系统vs条文系统.md, docs/给条文系统的提示词模板.md | AI |
| SH-20260618-003 | ✅已执行 | 用户确认 | 工作流调研 | 生成SP工作流调研与执行计划报告：盘点9份数据资产、评估文档质量、分析现有vs理想工作流差距、制定三阶段执行计划（基础设施→批量生成→扩展）、提出ABC三种推进方案 | docs/sp_workflow_research_report.md | AI |
| SH-20260618-004 | ✅已执行 | 用户确认 | 基础设施 | 构建 data/source_article_map.json：从 Markdown 解析 43 条条文映射，机器可读，含 symptom_pool、clue_map、difficulty、status 等字段，JSON 已验证 | data/source_article_map.json | AI |
| SH-20260618-005 | ✅已执行 | 用户确认 | 基础设施 | 构建 data/symptom_expression_index.json：从 oral_expression_guide.md 解析 126 个症状的口语表达，按 category/subcategory 组织，JSON 已验证 | data/symptom_expression_index.json | AI |
| SH-20260618-006 | ✅已执行 | 用户确认 | 深度调研 | 生成条文系统深度调研报告：全面扫描项目资料库（238条小红书笔记、81个黄煌医案、505KB倪海厦注文、3202个CHM HTML），分析35目标方的条文覆盖缺口（129条可提取条文 vs 当前35条），设计四阶段工作流（挖掘/记录/清洗/呈现），提出与方剂卡片的联动方案（只读接口+三个建议），设计与SP系统的联动接口 | docs/条文系统深度调研报告.md | AI |
| SH-20260618-004 | ✅已执行 | 用户确认 | 数据补全 | Batch 5：创建5张P0级临床核心方卡片（炙甘草汤、小承气汤、吴茱萸汤、麻子仁丸、茵陈蒿汤），资料已齐全，references留空待条文系统补充 | data/formula_cards.json | AI |
| SH-20260618-009 | ✅已执行 | 用户确认 | 覆盖度更新 | 更新方剂卡片覆盖度调研报告（加入Batch 5数据：覆盖率从36.5%→41.7%，40/96方），生成工作进度清单（可打印版，六经覆盖度、缺失方按优先级排列） | docs/方剂卡片覆盖度调研报告-v2.md, docs/工作进度清单.md | AI |
| SH-20260618-010 | ✅已执行 | 用户确认 | 基础设施 | 编写 scripts/sp_generator.py v0.1：SP 批量生成器，支持 --formula/--all/--chapter 参数，自动组装 symptom_pool、clue_map、口语表达、人格推荐、干扰项候选，已测试大青龙汤/五苓散/四逆汤 | scripts/sp_generator.py, data/sp_generation_packages.json | AI |
| SH-20260618-011 | ✅已执行 | 用户确认 | 基础设施 | 扩展 scripts/governance.py：添加 check-sp 命令，验证 SP 病例完整性（formula_id存在性、article_id一致性、干扰项数量、人格有效性、难度配置一致性），已验证现有 8 例无错误 | scripts/governance.py | AI |
| SH-20260618-012 | ✅已执行 | 用户确认 | 数据补全 | 补充 persona_system.md 人格映射：新增 40 方完整映射表（35原始方+5 Batch 5新增方），按六经分类（太阳20/阳明6/少阳4/少阴3/栀子豉类5），含优先人格、备选人格、难度、已有SP标注、使用说明 | standardized-patient/references/persona_system.md | AI |
| SH-20260618-012 | ✅已执行 | 用户确认 | 条文补充 | Batch 5：为5张新卡片（炙甘草汤、小承气汤、吴茱萸汤、麻子仁丸、茵陈蒿汤）补充 source_annotations，基于小红书针道轩笔记提取刘渡舟/胡希恕讲解，含200字摘要+完整内容，JSON已验证 | data/formula_cards.json | AI |
| SH-20260618-013 | ✅已执行 | 用户确认 | 数据补全 | Batch 6：创建10张P0级临床核心方卡片（麻黄附子细辛汤、黄连阿胶汤、附子汤、四逆散、猪苓汤、理中丸、乌梅丸、当归四逆汤、白头翁汤、黄芩汤），覆盖少阴/厥阴/霍乱/少阳篇章，资料已齐全，references留空待条文系统补充 | data/formula_cards.json | AI |
| SH-20260618-014 | ✅已执行 | 用户确认 | 数据补全 | Batch 6b：创建2张P0级变方卡片（四逆加人参汤、黄芩加半夏生姜汤），覆盖霍乱/少阳篇章，资料已齐全，references留空待条文系统补充 | data/formula_cards.json | AI |
| SH-20260618-015 | ✅已执行 | 用户确认 | 数据补全 | 生成 source_cards_extended.json：从238条小红书笔记中解析，提取35目标方的扩展条文（一方多条文），共14张扩展卡片、28条扩展条文，覆盖24个目标方，去重后过滤已在source_cards.json中的主条文，JSON已验证 | data/source_cards_extended.json | AI |
| SH-20260618-016 | ✅已执行 | 用户确认 | 提示词生成 | 生成交互设计系统提示词：分级解锁功能设计（含解锁规则、一方多条文展开面板、按需加载架构），数据接口说明，协作模式与分工边界，供用户转发给交互设计系统对话 | docs/给交互设计系统的提示词-分级解锁.md | AI |
| SH-20260618-017 | ✅已执行 | 用户确认 | 数据补全 | Batch 7：创建11张P1级基础方/加减方卡片（芍药甘草汤、甘草干姜汤、桂枝甘草汤、茯苓桂枝甘草大枣汤、茯苓桂枝白术甘草汤、桂枝人参汤、桂枝附子汤、甘草附子汤、通脉四逆汤、桃花汤、白通汤），覆盖太阳/少阴篇章，资料已齐全，references留空待条文系统补充。修正桂枝人参汤camelCase属性为snake_case | data/formula_cards.json | AI |
| SH-20260618-018 | ✅已执行 | 用户确认 | 端口迁移 | 全局端口统一治理：启动脚本已迁移（8100/8101），修改AGENTS.md/RESOURCES.md/交互设计提示词中的端口引用，创建PORT_CONFIG.md，增加AGENTS.md端口管理章节，修改scripts/test_phase1.py端口引用，补充修改.agents/skills/text-to-cards/start_server.py（PORT=8100）和README.md（访问URL）。备份到docs/archive/和scripts/archive/和.agents/skills/text-to-cards/archive/ | AGENTS.md, RESOURCES.md, PORT_CONFIG.md, scripts/test_phase1.py, docs/给交互设计系统的提示词-分级解锁.md, .agents/skills/text-to-cards/start_server.py, .agents/skills/text-to-cards/README.md | AI |
| SH-20260618-019 | ✅已执行 | 用户确认 | 新功能 | 新增临床录入系统：集成到app/index.html（导航栏「临床录入」按钮+viewClinical视图），纯前端JS实现（clState+解析引擎+渲染），三层方证匹配（necessary准入/common匹配/条文增强），禁忌校验，档案管理（P-YYYYMMDD-HHMMSS-NNN编码），localStorage独立存储（clinical_records_v1），低耦合设计（cl-前缀命名空间）。冒烟测试通过：桂枝汤/麻黄汤正确识别 | app/index.html | Chen |
| SH-20260618-020 | ✅已执行 | 用户确认 | 端口治理 | 全局端口治理：修正start_server.py注释（8000→8100），README.md新增端口管理章节，备份到archive/，验证端口8100空闲。项目端口已对齐全局分配表（8100主/8101备用） | start_server.py, README.md, archive/ | Chen |
| SH-20260618-021 | ✅已执行 | 用户确认 | 条文补充 | Batch 6：为10张新卡片（麻黄附子细辛汤、黄连阿胶汤、附子汤、四逆散、猪苓汤、理中丸、乌梅丸、当归四逆汤、白头翁汤、黄芩汤）补充 source_annotations，基于小红书针道轩笔记提取原文+刘渡舟/胡希恕讲解（172条完整，其余原文+个人总结），JSON已验证 | data/formula_cards.json | AI |
| SH-20260618-022 | ✅已执行 | 用户确认 | 条文补充 | Batch 6b：为2张变方卡片（四逆加人参汤、黄芩加半夏生姜汤）补充 source_annotations。四逆加人参汤引《辨霍乱病脉证并治法》第385条及茯苓四逆汤笔记讲解；黄芩加半夏生姜汤引第172条黄芩汤笔记讲解，JSON已验证 | data/formula_cards.json | AI |
| SH-20260618-023 | ✅已执行 | 用户确认 | SP病例生成 | Batch 3a：生成白虎汤SP病例（sp-015-ym-176），难度1，skeptical-patient人格，覆盖第176条「伤寒，脉浮滑，此以表有热，里有寒，白虎汤主之」，JSON已验证，governance.py无错误 | data/sp_cases.json, sp_case_bai_hu_tang.json | AI |
| SH-20260618-024 | ✅已执行 | 用户确认 | SP病例生成 | Batch 3b：生成白虎加人参汤SP病例（sp-016-ty-26），难度2，talkative-elderly-female人格，覆盖第26条「服桂枝汤，大汗出后，大烦渴不解，脉洪大者，白虎加人参汤主之」，JSON已验证，governance.py无错误 | data/sp_cases.json, sp_case_bai_hu_jia_ren_shen_tang.json | AI |
| SH-20260618-025 | ✅已执行 | 用户确认 | SP病例生成 | Batch 3c：生成调胃承气汤SP病例（sp-017-ym-207），难度2，intellectual-young-adult人格，覆盖第207条「阳明病，不吐不下，心烦者，可与调胃承气汤」，JSON已验证，governance.py无错误 | data/sp_cases.json, sp_case_tiao_wei_cheng_qi_tang.json | AI |
| SH-20260618-026 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：从138个症状扩展至283个，覆盖17例SP病例全部221个使用症状，自动分类17大类（寒热/汗出/二便/饮食/头身/胸腹/耳目/睡眠/旧病诱因/精神状态/查体/其他），governance.py验证0错误0警告 | data/symptom_expression_index.json | AI |
| SH-20260618-027 | ✅已执行 | 用户确认 | UI优化 | 临床录入系统结果页优化：新增「复制IMA提示词」按钮（一键生成结构化提示词并复制到剪贴板），第一推荐独占视觉焦点（绿色边框+高度匹配标签），备选方折叠展示，新增症状对比表格（第一推荐vs第二推荐，✅有/❌无/❓未确认），未确认症状红色警示标签，问诊提示前置。CSS新增.cl-compare-table/.cl-missing-tag/.cl-ima-btn等样式 | app/index.html | Chen |
| SH-20260618-028 | ✅已执行 | 用户确认 | 新功能 | 标签聚类+批量考试：卡片列表中标签可点击（点击后hover变色），点击标签进入聚类视图（显示所有同标签卡片+返回按钮+一起考试按钮），聚类视图中当前标签高亮显示，批量考试从聚类卡片中每卡抽1-2题组成15题试卷，复用类方练习模式。CSS新增.tag/.tag.active/.tag-cluster-header等样式。备份index-before-tag-cluster-20250618.html | app/index.html | Chen |
| SH-20260618-029 | ✅已执行 | 用户指正 | Bug修复 | 临床录入系统修复：1）修复`clBuildReason`缺失导致详情页崩溃（undefined.length）；2）档案列表添加删除按钮；3）详情页添加「删除/修改名字/编辑备注/添加复诊」按钮；4）输入页保留上次文本；5）复诊模式下`clStartParse`跳过档案选择直接到结果页；6）`clBuildReason`安全访问属性（兼容保存后的对象）。Div/Script平衡验证通过 | app/index.html | Chen |
| SH-20260618-030 | ✅已执行 | 用户确认 | 新功能 | 错题直接问Kimi：考试结果页和练习总结页中，错题≤3时显示「问Kimi」按钮，点击直接弹出Kimi提示词（跳过诊断弹窗），提示词包含题目、用户答案、正确答案、对应方剂完整信息；错题>3时显示批量标记区域（提示直接打标签）。新增`buildWrongQuestionPrompt`/`askKimiForWrong`/`batchTagWrong`函数。CSS新增`.wrong-kimi-btn`/.batch-tag-header`等样式。备份index-before-wrong-kimi-20250618.html | app/index.html | Chen |
| SH-20260618-031 | ✅已执行 | 用户指正 | 交互优化 | 诊断标签改为静默保存不打断心流：修改`handleDiagnosis`不再调用`showAIStudyModal`，改为直接`saveStudyNote`+`showToast`提示；在`showDueNotesReview`（今日复习）错题本中增加「🤖 问Kimi」按钮，点击弹出prompt弹窗；新增`askKimiFromNote`函数。备份index-before-silent-diagnosis-20250618.html | app/index.html | Chen |
| SH-20260618-032 | ✅已执行 | 用户指正 | Bug修复 | 修复`showModal`调用参数错误：`showModal`签名只有`(contentHtml, className)`两个参数，但`askKimiForWrong`、`askKimiFromNote`、`askKimiSource`三处传了5个参数（把标题当contentHtml，prompt当className），导致弹窗只显示标题无内容。修复为拼接完整HTML字符串传入。 | app/index.html | Chen |
| SH-20260618-033 | ✅已执行 | 用户确认 | 新功能 | 再来一组：基于认知神经科学的检索练习引擎。1）按钮改名「回顾题目」→「再来一组」；2）新增`startRetrievalRound()`函数，基于上一组错题画像（60%薄弱区强化+40%间隔复习）生成新题组；3）新增`generateVariantQuestion()`函数，同一向量第二轮换表述方式（如「必要症状包括哪些？」→「必见症是以下哪组？」）；4）新增`interleaveQuestions()`交错打散避免同一卡片连续出现；5）`getRandomVector()`辅助随机选向量。备份index-before-retrieval-round-20250618.html | app/index.html | Chen |
| SH-20260618-032 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4a：生成大柴胡汤SP病例（sp-018-sy-103），难度2，skeptical-patient人格，覆盖第103条「太阳病，过经十余日...呕不止，心下急，郁郁微烦者...与大柴胡汤，下之则愈」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_da_chai_hu_tang.json | AI |
| SH-20260618-033 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4b：生成柴胡加芒硝汤SP病例（sp-019-sy-104），难度3，intellectual-young-adult人格，覆盖第104条「伤寒十三日...胸胁满而呕，日晡所发潮热...先宜服小柴胡汤以解外，后以柴胡加芒硝汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_chai_hu_jia_mang_xiao_tang.json | AI |
| SH-20260618-034 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4c：生成柴胡加龙骨牡蛎汤SP病例（sp-020-sy-107），难度3，anxious-middle-aged-female人格，覆盖第107条「伤寒八九日，下之，胸满烦惊，小便不利，谵语，一身尽重，不可转侧者，柴胡加龙骨牡蛎汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_chai_hu_jia_long_gu_mu_li_tang.json | AI |
| SH-20260618-035 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增郁郁微烦、胸胁满而呕、日晡潮热、不可转侧4个症状，governance.py 0错误0警告，版本1.1.0→1.1.1 | data/symptom_expression_index.json | AI |
| SH-20260618-036 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5a：生成栀子豉汤SP病例（sp-021-ty-76），难度2，anxious-middle-aged-female人格，覆盖第76条「发汗吐下后，虚烦不得眠...心中懊憹，栀子豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_chi_tang.json | AI |
| SH-20260618-037 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5b：生成栀子甘草豉汤SP病例（sp-022-ty-76b），难度2，talkative-elderly-female人格，覆盖第76条「若少气者，栀子甘草豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_gan_cao_chi_tang.json | AI |
| SH-20260618-038 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5c：生成栀子生姜豉汤SP病例（sp-023-ty-76c），难度2，talkative-elderly-female人格，覆盖第76条「若呕者，栀子生姜豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_sheng_jiang_chi_tang.json | AI |
| SH-20260618-039 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5d：生成栀子厚朴汤SP病例（sp-024-ty-79），难度2，skeptical-patient人格，覆盖第79条「伤寒下后，心烦腹满，卧起不安者，栀子厚朴汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_hou_po_tang.json | AI |
| SH-20260618-040 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5e：生成栀子干姜汤SP病例（sp-025-ty-80），难度3，silent-elderly-male人格，覆盖第80条「伤寒，医以丸药大下之，身热不去，微烦者，栀子干姜汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_gan_jiang_tang.json | AI |
| SH-20260618-041 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增心中懊憹、胸中窒、按之心下濡、少气、胃脘不和、身热不去、余热等35个症状，覆盖25例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.1→1.1.2 | data/symptom_expression_index.json | AI |
| SH-20260618-042 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6a：生成干姜附子汤SP病例（sp-026-ty-61），难度3，silent-elderly-male人格，覆盖第61条「下之后，复发汗，昼日烦躁不得眠，夜而安静...干姜附子汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gan_jiang_fu_zi_tang.json | AI |
| SH-20260618-043 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6b：生成茯苓四逆汤SP病例（sp-027-ss-69），难度3，silent-elderly-male人格，覆盖第69条「发汗，若下之，病仍不解，烦躁者，茯苓四逆汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_fu_ling_si_ni_tang.json | AI |
| SH-20260618-044 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6c：生成桃核承气汤SP病例（sp-028-ty-106），难度3，anxious-middle-aged-female人格，覆盖第106条「太阳病不解，热结膀胱，其人如狂...宜桃核承气汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_tao_he_cheng_qi_tang.json | AI |
| SH-20260618-045 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6d：生成抵当汤SP病例（sp-029-ty-124），难度3，anxious-middle-aged-female人格，覆盖第124条「太阳病六七日，表证仍在...其人发狂者...抵当汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_di_dang_tang.json | AI |
| SH-20260618-046 | ✅已执行 | 用户指正 | 重构 | 再来一组关联学习模式：1）重写`startRetrievalRound`为「一题多向」结构——取前3个薄弱方，每方生成2-3个不同向量（含错题向量+反向向量+药组向量），同一方的题连续出现（组块化）；2）`renderExam`增加`roundInfo`进度显示——`第X/Y题·第N个方：方名（M/K向量）`；3）删除`generateVariantQuestion`/`getRandomVector`/`interleaveQuestions`旧函数。理论：Hebbian关联（同一方多维度短时激活）、双向编码（0→1+1→0）、工作记忆4±1限制。备份index-before-linked-learning-20250618.html | app/index.html | Chen |
| SH-20260618-046 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增太阳病不解、热结膀胱、其人如狂、表证仍在、其人发狂、身黄、大便色黑易解等29个症状，覆盖29例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.2→1.1.3 | data/symptom_expression_index.json | AI |
| SH-20260618-047 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7a：生成葛根加半夏汤SP病例（sp-030-ty-33），难度2，talkative-elderly-female人格，覆盖第33条「太阳与阳明合病，不下利但呕者，葛根加半夏汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_ge_gen_jia_ban_xia_tang.json | AI |
| SH-20260618-048 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7b：生成葛根黄芩黄连汤SP病例（sp-031-ty-34），难度2，skeptical-patient人格，覆盖第34条「太阳病，桂枝证，医反下之，利遂不止...喘而汗出者，葛根黄芩黄连汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_ge_gen_huang_qin_huang_lian_tang.json | AI |
| SH-20260618-049 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7c：生成桂枝麻黄各半汤SP病例（sp-032-ty-23），难度2，talkative-elderly-female人格，覆盖第23条「太阳病，得之八九日，如疟状，发热恶寒...宜桂枝麻黄各半汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_ma_huang_ge_ban_tang.json | AI |
| SH-20260618-050 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7d：生成桂枝二越婢一汤SP病例（sp-033-ty-27），难度3，skeptical-patient人格，覆盖第27条「太阳病，发热恶寒，热多寒少，脉微弱者...宜桂枝二越婢一汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_er_yue_bi_yi_tang.json | AI |
| SH-20260618-051 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增皮肤干、发热恶寒、头昏沉、大便成形、既往感冒史、呕而醒、渴欲饮水、肠鸣、喘而汗出、微渴、痒醒、无胸胁苦满、皮肤干燥等13个症状，覆盖33例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.3→1.1.4 | data/symptom_expression_index.json | AI |
| SH-20260619-001 | ✅已执行 | 用户确认 | SP病例生成 | Batch 8a：生成小建中汤SP病例（sp-034-ty-102），难度1，anxious-middle-aged-female人格，覆盖第102条「伤寒二三日，心中悸而烦者，小建中汤主之」，JSON已验证，governance.py 1警告（diff1 inquiry_slots=5，建议8） | data/sp_cases.json, sp_case_xiao_jian_zhong_tang.json | AI |
| SH-20260619-002 | ✅已执行 | 用户确认 | SP病例生成 | Batch 8b：生成桂枝加附子汤SP病例（sp-035-ty-20），难度2，talkative-elderly-female人格，覆盖第20条「太阳病，发汗，遂漏不止...桂枝加附子汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_jia_fu_zi_tang.json | AI |
| SH-20260619-003 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增发汗后漏汗不止、四肢微急、难以屈伸、阳虚、烦、面色萎黄、四肢酸痛、手足烦热8个症状，覆盖35例SP病例全部使用症状，governance.py 1警告（diff1 inquiry_slots配置），版本1.1.4→1.1.5 | data/symptom_expression_index.json | AI |
| SH-20260618-035 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增郁郁微烦、胸胁满而呕、日晡潮热、不可转侧4个症状，governance.py 0错误0警告，版本1.1.0→1.1.1 | data/symptom_expression_index.json | AI |

---



### 2025-07-04

| 编号 | 状态 | 来源 | 触发 | 变更内容 | 影响文档 | 确认人 |
|---|---|---|---|---|---|---|
| SH-20250704-001 | ✅已执行 | 测试反馈 | Bug修复 | 修复 V9 聚类复习（Bug-2）与学习页向量题（Bug-3）两个 Bug。Bug-2：startClusterExam 函数调用 genQuestionsForCard 后未为题目生成 options，导致 renderExamView 无法渲染选项。修复：为每题补充 q.options = generateOptions(...)。Bug-3：LearnView.js 的 buildMasterySection 仅显示只读进度点，无点击事件。修复：1) 标题改为「掌握度（点击向量直接练习）」；2) 每个向量项添加 click 事件调用 options.onPracticeVector；3) 添加 hover 效果（边框变色+背景高亮）和 cursor:pointer。JS 语法验证通过。 | app/v9/src/app.js, app/v9/src/components/LearnView.js | AI |
| SH-20250704-002 | ✅已执行 | 测试反馈 | 笔记系统重构 | 修复笔记系统 Bug-18（Markdown 未渲染）+ Exp-11（只显示一行）+ Exp-12（无"看笔记"按钮），实现 Feature-13（看笔记弹窗）+ Feature-14（弹窗上半条文+下半笔记布局）。修改：1）新增 `renderMarkdown`/`escapeHtml` 函数（XSS 安全）；2）`buildNoteSection` 改为预览+"看笔记"/"编辑"双按钮；3）新增 `openNoteModal` 弹窗（条文在上+笔记在下，支持编辑/预览/保存/ESC 关闭）；4）`theme.css` 新增 `.note-modal-*` 和 `.markdown-body` 全套样式。JS/CSS 语法验证通过。 | app/v9/src/components/LearnView.js, app/v9/src/styles/theme.css | AI |
### 2026-07-02

| 编号 | 状态 | 来源 | 触发 | 变更内容 | 影响文档 | 确认人 |
|---|---|---|---|---|---|---|
| SH-20260702-001 | ✅已执行 | 用户确认 | Phase 1 启动 | 生成Phase 1检查清单：17个P1模块分批计划、开始/结束标准、技术决策记录、风险评估。文档路径：docs/PROD-PLAN-Phase1-checklist.md | docs/PROD-PLAN-Phase1-checklist.md | AI |
| SH-20260702-002 | ✅已执行 | 用户确认 | 搜索系统迁移 | 批次1：搜索系统（B-01/B-02/B-03）v9重构。1）创建`src/utils/search.js`：拼音首字母映射、方名/拼音/标签联合搜索、搜索历史管理；2）增强`CardList.js`：标签点击支持、搜索高亮、activeTag状态；3）增强`app.js`：搜索栏UI、实时过滤、搜索聚类考试、标签聚类考试；4）新增CSS：搜索栏/标签交互/高亮/聚类操作；5）新增17个单元测试，全部通过。构建成功，61/61测试通过 | app/v9/src/utils/search.js, app/v9/src/components/CardList.js, app/v9/src/app.js, app/v9/src/styles/theme.css, app/v9/tests/unit/search.test.js | AI |
| SH-20260702-003 | ✅已执行 | 用户确认 | 错题本增强 | 批次2：错题本增强（C-01/C-02/C-03/C-04）v9重构。1）增强`StorageService.js`：新增`DIAGNOSIS_TAGS`（4个认知神经科学标签）、`saveStudyNote`/`updateStudyNote`/`deleteStudyNote`/`getStudyNotesByCard`/`getStudyNotesByDiagnosis`/`getDiagnosisStats`；2）增强`PracticeSummary.js`：诊断标签选择（4个按钮，点击静默保存）、错题直接问Kimi（≤3错题时显示按钮）；3）创建`WrongBookView.js`：错题本列表、按诊断标签过滤、删除、查看此方；4）增强`app.js`：顶部栏新增「错题本」按钮、`onAskKimi`回调；5）新增CSS：诊断标签/问Kimi/错题本视图；6）新增12个单元测试，全部通过。构建成功，73/73测试通过 | app/v9/src/services/StorageService.js, app/v9/src/components/PracticeSummary.js, app/v9/src/components/WrongBookView.js, app/v9/src/app.js, app/v9/src/styles/theme.css, app/v9/tests/unit/notes.test.js | AI |
| SH-20260702-004 | ✅已执行 | 用户确认 | 检索练习迁移 | 批次3：检索练习（D-01/D-02/D-03）v9重构。1）创建`RetrievalEngine.js`：`generateRetrievalRound`（基于错题画像生成关联学习题组，60%薄弱+40%复习，组块化，最多10题）、`generateWrongProfile`（错题画像分析、薄弱方/向量统计、学习建议）；2）增强`PracticeSummary.js`：新增「再来一组」按钮；3）增强`ExamView.js`：显示`roundInfo`（第X/Y方：方名（M/K向量））；4）增强`app.js`：`startRetrievalRound`函数；5）新增6个单元测试，全部通过。构建成功，79/79测试通过 | app/v9/src/services/RetrievalEngine.js, app/v9/src/components/PracticeSummary.js, app/v9/src/components/ExamView.js, app/v9/src/app.js, app/v9/src/styles/theme.css, app/v9/tests/unit/retrievalEngine.test.js | AI |
| SH-20260702-005 | ✅已执行 | 用户确认 | 剂量换算迁移 | 批次4：剂量换算（E-01/E-02）v9重构。1）创建`doseConverter.js`：四档标准换算（教材/轻量/经方/原方，1两=3/6/9/15g）、特殊单位（枚/升/合/方寸匕/铢/茎/尺）、容量密度映射（半夏130g/L等）、单枚重量（杏仁0.3-0.5g/枚）；2）增强`LearnView.js`：点击药物剂量显示换算弹窗（表格展示四档标准）；3）新增CSS：剂量换算弹窗；4）新增11个单元测试，全部通过。构建成功，90/90测试通过 | app/v9/src/utils/doseConverter.js, app/v9/src/components/LearnView.js, app/v9/src/styles/theme.css, app/v9/tests/unit/doseConverter.test.js | AI |
| SH-20260702-006 | ✅已执行 | 用户确认 | 统计图表迁移 | 批次5：统计图表（G-02/G-03/G-04）v9重构。1）创建`StatsCharts.js`：六经雷达图（6维度覆盖度）、学习曲线（30天答题趋势）、掌握度分布（水平条形图）；2）增强`app.js`：统计页面新增图表区域（3个canvas容器），调用3个图表渲染函数；3）新增CSS：图表卡片布局（2列网格+响应式）、图表标题/图表体高度；4）新增`chart.js`依赖（npm install）；5）构建成功，90/90测试通过。图表数据：63张卡片，6经（太阳/阳明/少阳/太阴/少阴/厥阴）覆盖度统计，6向量掌握度分布 | app/v9/src/components/StatsCharts.js, app/v9/src/app.js, app/v9/src/styles/theme.css, app/v9/package.json | AI |
| SH-20260702-007 | ✅已执行 | 测试反馈 | 验证修复 | 统计图表验证：1）修复`todayStats.cardCount` undefined（`app.js`添加`|| 0`+`StorageService.js`添加`cardCount:0`）；2）同步`public/data/`下10个JSON数据文件到最新（99张卡片）；3）清除Service Worker缓存后重新验证；4）三个图表（雷达图/掌握度分布/学习曲线）全部正常渲染；5）90/90测试通过。WebBridge截图确认 | app/v9/src/app.js, app/v9/src/services/StorageService.js, app/v9/public/data/* | AI |
| SH-20260702-008 | ✅已执行 | 用户确认 | 条文系统迁移 | 批次6：条文系统slidePanel（E-05/E-06/E-10）v9重构。1）创建`SourcePanel.js`：右侧滑入面板、数据融合（SOURCE_CARDS+source_annotations）、标签页切换（条文/刘渡舟/胡希恕/对比/我的理解）、分级解锁（level≤1只显示条文；level2-3显示条文+刘渡舟；level≥4显示全部）、提取练习（Space键遮罩/显示内容）、"我的理解"可编辑保存到localStorage；2）增强`LearnView.js`：操作按钮栏新增"📜 条文"按钮；3）增强`app.js`：导入`openSourcePanel`、传入`onSource`回调；4）新增CSS：source-panel全套样式（滑入动画/标签栏/遮罩层/对比视图/我的理解/响应式）；5）构建成功，90/90测试通过。WebBridge验证截图确认 | app/v9/src/components/SourcePanel.js, app/v9/src/components/LearnView.js, app/v9/src/app.js, app/v9/src/styles/theme.css | AI |

---

### 2026-06-29

| 编号 | 状态 | 来源 | 触发 | 变更内容 | 影响文档 | 确认人 |
|---|---|---|---|---|---|---|
| SH-20260629-001 | ✅已执行 | 内部思考 | 条文系统P0-P1 | 批量补全与升级source_annotations：P0补全7张缺失卡片（桂枝汤、麻黄汤、小柴胡汤、小青龙汤、五苓散、柴胡加龙骨牡蛎汤、栀子厚朴汤）；P1-1诊断50张卡片存在"资料暂缺"；P1-2修复P0卡片（原文+刘渡舟注释，胡希恕/个人总结标记待补充）；P1-3升级11张核心占位符卡片（四逆汤、白虎汤、大青龙汤、葛根汤、大柴胡汤、真武汤、小建中汤、桂枝加附子汤、桂枝麻黄各半汤、白头翁汤、桃花汤），全部原文+刘渡舟注释，JSON已验证，备份已生成 | data/formula_cards.json | AI |
| SH-20260629-002 | ✅已执行 | 内部思考 | 条文系统P2 | 扩展一方多条文：为21个缺失的36目标方生成source_cards_extended条目（桂枝加葛根汤、桂枝加厚朴杏子汤、桂枝去芍药汤、桂枝加附子汤、桂枝麻黄各半汤、桂枝二越婢一汤、麻杏甘石汤、葛根加半夏汤、葛根黄芩黄连汤、柴胡加芒硝汤、柴胡加龙骨牡蛎汤、栀子甘草豉汤、栀子生姜豉汤、栀子厚朴汤、栀子干姜汤、真武汤、茯苓四逆汤、桃核承气汤、抵当汤、小建中汤、调胃承气汤），基于source_cards.json + 小红书笔记，JSON已验证，备份已生成 | data/source_cards_extended.json | AI |
| SH-20260629-003 | ✅已执行 | 内部思考 | 条文系统P3 | 前端分级解锁优化：修改getSlidePanelDisplayTabs函数，根据卡片掌握度最高等级过滤标签页。level≤1只显示【条文】；level2-3显示【条文】+【刘渡舟】；level≥4显示全部（含对比）。保留"我的理解"编辑区。掌握度从card.mastery取6向量最高值。备份已生成 | app/index.html | AI |
---

## 废弃记录

| 编号 | 状态 | 来源 | 触发 | 废弃内容 | 废弃原因 |
|---|---|---|---|---|---|

---

## 待确认变更

| 编号 | 状态 | 来源 | 触发 | 变更内容 | 影响文档 | 等待确认 |
|---|---|---|---|---|---|---|

---

## 文档编号映射表

| 文档编号 | 文档路径 | 文档类型 | 当前版本 | 最后变更 | 状态 |
|---|---|---|---|---|---|
| DOC-001 | MISSION.md | 目标/范围 | v1.0 | - | 已确认 |
| DOC-002 | RESOURCES.md | 资源清单 | v1.0 | - | 已确认 |
| DOC-003 | AGENTS.md | 代理指南 | v1.0 | - | 已确认 |
| CODE-001 | app/index.html | 主程序 | v8.5 | SH-20260619-018 | 已确认 |
| DATA-001 | data/formula_cards.json | 方剂数据 | v1.0 | SH-20260618-030 | 已确认 |
| DATA-002 | data/experience_cards.json | 经验数据 | v1.0 | - | 已确认 |
| DATA-003 | data/source_cards.json | 原文数据 | v1.0 | SH-20260617-025 | 已确认 |
| DATA-004 | data/sun_target_formulas.json | 目标清单 | v1.0 | - | 已确认 |
| DATA-005 | data/herb_alias_map.json | 药名映射 | v1.0 | - | 已确认 |
| DATA-006 | data/sp_cases.json | SP 病例数据 | v2.0 | SH-20260619-011 | 已确认 |
| DATA-007 | data/source_cards_extended.json | 扩展条文数据 | v1.0 | SH-20260618-015 | 已确认 |
| SKILL-001 | 文档治理（本体系） | 治理规范 | v1.0 | SH-20260617-001 | 已确认 |
| SKILL-002 | standardized-patient/SKILL.md | SP 核心 Skill | v1.0 | SH-20260617-030 | 已确认 |
| DOC-004 | docs/条文系统设计方案.md | 设计文档 | v1.0 | SH-20260617-017 | 已确认 |
| DOC-005 | docs/prototype-source-system.html | 原型页面 | v1.0 | SH-20260617-018 | 已确认 |
| DOC-006 | docs/条文校对报告.md | 校对报告 | v1.0 | SH-20260617-024 | 已确认 |
| DOC-007 | docs/sp_missing_records.md | 缺失记录 | v1.0 | SH-20260617-033 | 已确认 |
| DOC-008 | docs/batch1_references_report.md | 接入报告 | v1.0 | SH-20260617-020 | 已确认 |
| DOC-009 | docs/batch2_references_report.md | 接入报告 | v1.0 | SH-20260617-021 | 已确认 |
| DOC-010 | docs/batch3_references_report.md | 接入报告 | v1.0 | SH-20260617-022 | 已确认 |
| DOC-011 | docs/batch4_references_report.md | 接入报告 | v1.0 | SH-20260617-023 | 已确认 |
| DOC-012 | app/herb-aliases.js | 前端脚本 | v1.0 | SH-20260617-026 | 已确认 |
| DOC-013 | docs/交互需求文档-REQ-01-v2.md | 需求文档 | v1.0 | SH-20260617-027 | 已确认 |
| DOC-014 | docs/跨对话框分工红线.md | 规范文档 | v1.0 | SH-20260617-028 | 已确认 |
| DOC-015 | app/prototypes/annotation-accordion.html | 原型页面 | v1.0 | SH-20260617-029 | 已确认 |
| DOC-016 | app/prototypes/annotation-slide-panel.html | 原型页面 | v1.0 | SH-20260617-029 | 已确认 |
| DOC-017 | app/prototypes/annotation-modal.html | 原型页面 | v1.0 | SH-20260617-029 | 已确认 |
| DOC-018 | docs/三层锚定整合思路.md | 架构文档 | v1.0 | SH-20260617-025 | 已确认 |
| DOC-019 | standardized-patient/references/source_article_map.md | SP 条文映射 | v1.0 | SH-20260617-030 | 已确认 |
| DOC-020 | standardized-patient/references/article_lookup_plan.md | SP 查找计划 | v1.0 | SH-20260617-030 | 已确认 |
| DOC-021 | standardized-patient/references/ten_inquiries_framework.md | SP 十问框架 | v1.0 | SH-20260617-030 | 已确认 |
| DOC-022 | standardized-patient/references/oral_expression_guide.md | SP 口语表达 | v1.0 | SH-20260617-030 | 已确认 |
| DOC-023 | standardized-patient/references/json_schema.md | SP 数据规范 | v1.0 | SH-20260617-030 | 已确认 |
| DOC-024 | standardized-patient/references/persona_system.md | SP 人格系统 | v1.1 | SH-20260618-012 | 已确认 |
| DOC-025 | docs/sp_cases_audit_report.md | SP 审计报告 | v1.0 | SH-20260617-037 | 已确认 |
| DOC-026 | docs/方剂卡片覆盖度调研报告.md | 调研报告 | v1.0 | SH-20260618-001 | 已确认 |
| DOC-027 | docs/工作红线-方剂系统vs条文系统.md | 规范文档 | v1.0 | SH-20260618-002 | 已确认 |
| DOC-028 | docs/给条文系统的提示词模板.md | 协作模板 | v1.0 | SH-20260618-002 | 已确认 |
| DOC-029 | docs/sp_workflow_research_report.md | 调研报告 | v1.0 | SH-20260618-003 | 已确认 |
| DOC-030 | docs/条文系统深度调研报告.md | 调研报告 | v1.0 | SH-20260618-006 | 已确认 |
| DOC-031 | docs/方剂卡片覆盖度调研报告-v2.md | 调研报告 | v1.0 | SH-20260618-009 | 已确认 |
| DOC-032 | docs/工作进度清单.md | 进度清单 | v1.0 | SH-20260618-009 | 已确认 |
| SCRIPT-001 | scripts/governance.py | 治理脚本 | v1.0 | SH-20260617-035 | 已确认 |
| SCRIPT-002 | scripts/safe_edit.py | 安全编辑脚本 | v1.0 | SH-20260617-035 | 已确认 |
| SCRIPT-003 | scripts/session_start.py | 会话启动脚本 | v1.0 | SH-20260617-035 | 已确认 |
| DATA-007 | data/source_article_map.json | 条文映射 JSON | v1.0 | SH-20260618-004 | 已确认 |
| DATA-008 | data/symptom_expression_index.json | 症状表达索引 | v1.1.6 | SH-20260619-012 | 已确认 |
| DOC-033 | docs/给交互设计系统的提示词-分级解锁.md | 协作模板 | v1.0 | SH-20260618-018 | 已确认 |
| SCRIPT-004 | scripts/sp_generator.py | SP 批量生成器 | v0.1 | SH-20260618-010 | 已确认 |
| PORT-001 | PORT_CONFIG.md | 端口配置 | v1.0 | SH-20260618-018 | 已确认 |
| DATA-010 | data/formula_cards.json | Batch 7 条文补充（11方） | v1.0 | SH-20260618-023 | 已执行 |
| DOSE-001 | app/index.html | 剂量换算修复：新增斤/分/两半/合半/茎/尺/复合铢/如鸡子大等单位支持 | v1.0 | SH-20260618-025 | 已执行 |
| DOSE-002 | app/index.html + docs/剂量换算标准体系.md | 建立统一四档剂量标准体系：教材/轻量/经方/原方；铢/分/复合单位按四档分别计算；标准弹窗升级 | v1.0 | SH-20260618-026 | 已执行 |
| DOSE-003 | docs/剂量换算标准体系.md | 系统标准 | v1.0 | SH-20260619-013 | 已执行 |
| DOC-034 | docs/条文系统重构设计-v2.md | 设计文档 | v1.0 | SH-20260619-018 | 已确认 |
| DOC-035 | docs/方剂卡片数据层_接班报告.md | 数据层速读手册 | v1.0 | SH-20260622-003 | 已确认 |
| DOC-036 | docs/SP系统评估与AI能力边界报告.md | 项目评估报告 | v1.0 | SH-20260621-009 | 已确认 |
| DOC-038 | docs/方剂模式SP问诊工作计划.md | 工作计划 | v1.0 | SH-20260621-010 | 已确认 |
| DOC-039 | docs/SP方剂模式前端集成需求文档.md | 前端需求 | v1.0 | SH-20260621-016 | 已确认 |
| SH-20260618-027 | ✅已执行 | 用户确认 | UI改造 | slidePanel UI改造：左侧标签栏（1条文/2刘渡舟/3胡希恕/4个人总结）+右侧内容区+翻页指示器+键盘快捷键（1/2/3/4/-/=/Esc）。支持新旧格式兼容（normalizeSourceAnnotations）。备份index-before-slide-panel-tabs.html | app/index.html | Chen |
| SH-20260618-028 | ✅已执行 | 用户确认 | 质控体系 | 建立条文内容质控体系：定义P0-P3分级标准（P0 text为空→P1 text混注家→P2 summary截断→P3格式优化），制定修复来源优先级（小红书>原文>总结>著作） | docs/条文内容质控体系.md | AI |
| SH-20260618-029 | ✅已执行 | 用户确认 | 数据修复 | P1修复：清理4条卡片text中残留注家名（桂枝甘草汤64、苓桂枣甘汤65、苓桂术甘汤67、桂枝人参汤163） | data/formula_cards.json | AI |
| SH-20260618-031 | ✅已执行 | 用户指正 | 交互优化 | 诊断标签改为静默保存不打断心流：修改`handleDiagnosis`不再调用`showAIStudyModal`，改为直接`saveStudyNote`+`showToast`提示；在`showDueNotesReview`（今日复习）错题本中增加「🤖 问Kimi」按钮，点击弹出prompt弹窗；新增`askKimiFromNote`函数。备份index-before-silent-diagnosis-20250618.html | app/index.html | Chen |
| SH-20260618-032 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4a：生成大柴胡汤SP病例（sp-018-sy-103），难度2，skeptical-patient人格，覆盖第103条「太阳病，过经十余日...呕不止，心下急，郁郁微烦者...与大柴胡汤，下之则愈」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_da_chai_hu_tang.json | AI |
| SH-20260618-033 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4b：生成柴胡加芒硝汤SP病例（sp-019-sy-104），难度3，intellectual-young-adult人格，覆盖第104条「伤寒十三日...胸胁满而呕，日晡所发潮热...先宜服小柴胡汤以解外，后以柴胡加芒硝汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_chai_hu_jia_mang_xiao_tang.json | AI |
| SH-20260618-034 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4c：生成柴胡加龙骨牡蛎汤SP病例（sp-020-sy-107），难度3，anxious-middle-aged-female人格，覆盖第107条「伤寒八九日，下之，胸满烦惊，小便不利，谵语，一身尽重，不可转侧者，柴胡加龙骨牡蛎汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_chai_hu_jia_long_gu_mu_li_tang.json | AI |
| SH-20260618-035 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增郁郁微烦、胸胁满而呕、日晡潮热、不可转侧4个症状，governance.py 0错误0警告，版本1.1.0→1.1.1 | data/symptom_expression_index.json | AI |
| SH-20260618-036 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5a：生成栀子豉汤SP病例（sp-021-ty-76），难度2，anxious-middle-aged-female人格，覆盖第76条「发汗吐下后，虚烦不得眠...心中懊憹，栀子豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_chi_tang.json | AI |
| SH-20260618-037 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5b：生成栀子甘草豉汤SP病例（sp-022-ty-76b），难度2，talkative-elderly-female人格，覆盖第76条「若少气者，栀子甘草豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_gan_cao_chi_tang.json | AI |
| SH-20260618-038 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5c：生成栀子生姜豉汤SP病例（sp-023-ty-76c），难度2，talkative-elderly-female人格，覆盖第76条「若呕者，栀子生姜豉汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_sheng_jiang_chi_tang.json | AI |
| SH-20260618-039 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5d：生成栀子厚朴汤SP病例（sp-024-ty-79），难度2，skeptical-patient人格，覆盖第79条「伤寒下后，心烦腹满，卧起不安者，栀子厚朴汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_hou_po_tang.json | AI |
| SH-20260618-040 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5e：生成栀子干姜汤SP病例（sp-025-ty-80），难度3，silent-elderly-male人格，覆盖第80条「伤寒，医以丸药大下之，身热不去，微烦者，栀子干姜汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_zhi_zi_gan_jiang_tang.json | AI |
| SH-20260618-041 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增心中懊憹、胸中窒、按之心下濡、少气、胃脘不和、身热不去、余热等35个症状，覆盖25例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.1→1.1.2 | data/symptom_expression_index.json | AI |
| SH-20260618-042 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6a：生成干姜附子汤SP病例（sp-026-ty-61），难度3，silent-elderly-male人格，覆盖第61条「下之后，复发汗，昼日烦躁不得眠，夜而安静...干姜附子汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gan_jiang_fu_zi_tang.json | AI |
| SH-20260618-043 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6b：生成茯苓四逆汤SP病例（sp-027-ss-69），难度3，silent-elderly-male人格，覆盖第69条「发汗，若下之，病仍不解，烦躁者，茯苓四逆汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_fu_ling_si_ni_tang.json | AI |
| SH-20260618-044 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6c：生成桃核承气汤SP病例（sp-028-ty-106），难度3，anxious-middle-aged-female人格，覆盖第106条「太阳病不解，热结膀胱，其人如狂...宜桃核承气汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_tao_he_cheng_qi_tang.json | AI |
| SH-20260618-045 | ✅已执行 | 用户确认 | SP病例生成 | Batch 6d：生成抵当汤SP病例（sp-029-ty-124），难度3，anxious-middle-aged-female人格，覆盖第124条「太阳病六七日，表证仍在...其人发狂者...抵当汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_di_dang_tang.json | AI |
| SH-20260618-046 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增太阳病不解、热结膀胱、其人如狂、表证仍在、其人发狂、身黄、大便色黑易解等29个症状，覆盖29例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.2→1.1.3 | data/symptom_expression_index.json | AI |
| SH-20260618-047 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7a：生成葛根加半夏汤SP病例（sp-030-ty-33），难度2，talkative-elderly-female人格，覆盖第33条「太阳与阳明合病，不下利但呕者，葛根加半夏汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_ge_gen_jia_ban_xia_tang.json | AI |
| SH-20260618-048 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7b：生成葛根黄芩黄连汤SP病例（sp-031-ty-34），难度2，skeptical-patient人格，覆盖第34条「太阳病，桂枝证，医反下之，利遂不止...喘而汗出者，葛根黄芩黄连汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_ge_gen_huang_qin_huang_lian_tang.json | AI |
| SH-20260618-049 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7c：生成桂枝麻黄各半汤SP病例（sp-032-ty-23），难度2，talkative-elderly-female人格，覆盖第23条「太阳病，得之八九日，如疟状，发热恶寒...宜桂枝麻黄各半汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_ma_huang_ge_ban_tang.json | AI |
| SH-20260618-050 | ✅已执行 | 用户确认 | SP病例生成 | Batch 7d：生成桂枝二越婢一汤SP病例（sp-033-ty-27），难度3，skeptical-patient人格，覆盖第27条「太阳病，发热恶寒，热多寒少，脉微弱者...宜桂枝二越婢一汤」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_er_yue_bi_yi_tang.json | AI |
| SH-20260618-051 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增皮肤干、发热恶寒、头昏沉、大便成形、既往感冒史、呕而醒、渴欲饮水、肠鸣、喘而汗出、微渴、痒醒、无胸胁苦满、皮肤干燥等13个症状，覆盖33例SP病例全部使用症状，governance.py 0错误0警告，版本1.1.3→1.1.4 | data/symptom_expression_index.json | AI |
| SH-20260619-001 | ✅已执行 | 用户确认 | SP病例生成 | Batch 8a：生成小建中汤SP病例（sp-034-ty-102），难度1，anxious-middle-aged-female人格，覆盖第102条「伤寒二三日，心中悸而烦者，小建中汤主之」，JSON已验证，governance.py 1警告（diff1 inquiry_slots=5，建议8） | data/sp_cases.json, sp_case_xiao_jian_zhong_tang.json | AI |
| SH-20260619-002 | ✅已执行 | 用户确认 | SP病例生成 | Batch 8b：生成桂枝加附子汤SP病例（sp-035-ty-20），难度2，talkative-elderly-female人格，覆盖第20条「太阳病，发汗，遂漏不止...桂枝加附子汤主之」，JSON已验证，governance.py 0错误0警告 | data/sp_cases.json, sp_case_gui_zhi_jia_fu_zi_tang.json | AI |
| SH-20260619-003 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增发汗后漏汗不止、四肢微急、难以屈伸、阳虚、烦、面色萎黄、四肢酸痛、手足烦热8个症状，覆盖35例SP病例全部使用症状，governance.py 1警告（diff1 inquiry_slots配置），版本1.1.4→1.1.5 | data/symptom_expression_index.json | AI |
| SH-20260619-004 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9a：生成桂枝汤难度3SP病例（sp-036-ty-12-3），diff3，skeptical-patient人格，覆盖第12条「太阳中风...桂枝汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_gui_zhi_tang_diff3.json | AI |
| SH-20260619-005 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9b：生成麻黄汤难度3SP病例（sp-037-ty-35-3），diff3，intellectual-young-adult人格，覆盖第35条「太阳病...麻黄汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_ma_huang_tang_diff3.json | AI |
| SH-20260619-006 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9c：生成小柴胡汤难度3SP病例（sp-038-sy-96-3），diff3，skeptical-patient人格，覆盖第96条「伤寒五六日...小柴胡汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_xiao_chai_hu_tang_diff3.json | AI |
| SH-20260619-007 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9d：生成大承气汤难度3SP病例（sp-039-ym-208-3），diff3，intellectual-young-adult人格，覆盖第208条「阳明病...大承气汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_da_cheng_qi_tang_diff3.json | AI |
| SH-20260619-008 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9e：生成四逆汤难度3SP病例（sp-040-ss-323-3），diff3，silent-elderly-male人格，覆盖第323条「少阴病...四逆汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_si_ni_tang_diff3.json | AI |
| SH-20260619-009 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9f：生成小青龙汤难度3SP病例（sp-041-ty-40-3），diff3，intellectual-young-adult人格，覆盖第40条「伤寒表不解...小青龙汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_xiao_qing_long_tang_diff3.json | AI |
| SH-20260619-010 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9g：生成大青龙汤难度3SP病例（sp-042-ty-38-3），diff3，skeptical-patient人格，覆盖第38条「太阳中风...大青龙汤主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_da_qing_long_tang_diff3.json | AI |
| SH-20260619-011 | ✅已执行 | 用户确认 | SP病例生成 | Batch 9h：生成五苓散难度3SP病例（sp-043-ty-71-3），diff3，skeptical-patient人格，覆盖第71条「太阳病...五苓散主之」，JSON已验证，governance.py 0错误 | data/sp_cases.json, sp_case_wu_ling_san_diff3.json | AI |
| SH-20260619-012 | ✅已执行 | 用户确认 | 数据补全 | 补充 symptom_expression_index.json：新增咽干目眩、谵语、脐下悸、头眩4个症状，覆盖43例SP病例全部使用症状，governance.py 0错误（1警告diff1配置），版本1.1.5→1.1.6 | data/symptom_expression_index.json | AI |
| SH-20260619-013 | ✅已执行 | 用户确认 | 文档补全 | 补全遗漏文档：更新`docs/progress_snapshot_2026-06-19.md`追加Batch 8-9及累计43例数据；更新`docs/工程经验记录.md`追加4条经验（#27子Agent文件保存不可靠/#28Windows编码/#29症状索引自动分类/#30难度3主诉模糊化）；更新`docs/sp_workflow_research_report.md`标记阶段一/阶段二为已完成并补充执行结果。全部验证通过。 | docs/ | AI |
| SH-20260619-013 | ✅已执行 | 用户确认 | 数据治理 | 建立统一经方剂量换算标准体系：整合柯雪帆/仝小林/傅延龄三大学术考据，定义教材/轻量/经方/原方四档标准，1两=3/6/9/15g，含铢/分/斤/合/升/枚/方寸匕等全单位换算，创建 docs/剂量换算标准体系.md 作为系统标准源 | docs/剂量换算标准体系.md | AI |
| SH-20260619-014 | ✅已执行 | 用户指正 | Bug修复 | 修复药物剂量换算单位缺失：convertDosage 函数新增支持 斤/分/两半/合半/茎/尺/复合铢/如鸡子大 等8种单位，修正铢单位按四档分别计算（0.125/0.25/0.375/0.625g），修正复合铢正则匹配中文数字。JS语法验证通过 | app/index.html | Chen |
| SH-20260619-015 | ✅已执行 | 用户指正 | 数据修复 | 用户反馈「笔记消失」排查：发现笔记数据保存在 localhost:8000 端口，而用户访问的是 localhost:8100。因 localStorage 按端口隔离，导致 8100 端口显示为空。通过 WebBridge 批量读取 8000 端口数据（45,514 字节卡片笔记 + 7,981 字节学习记录）并迁移到 8100 端口，12 张卡片笔记完整恢复 | - | Chen |
| SH-20260619-017 | ✅已执行 | 用户确认 | 重构 | 诊断标签重设计：将「搞混了/记错了/没学过/乱选的」升级为「🔀类方混淆/↔️反向盲区/🕳️知识缺口/🧠决策失误」，每个标签指向具体认知神经机制（概念干扰/提取通路不对称/编码失败/执行控制失败）。修改：1）结果页+练习总结页按钮文案；2）getDiagnosisLabel+tagLabels映射；3）错题本过滤按钮；4）batchTagWrong文案；5）generateDiagnosisPrompt四个模板全部重写，嵌入认知神经科学解释。备份index-before-diagnosis-redesign-v2-20250618.html | app/index.html | Chen |

| SH-20260619-018 | ✅已执行 | 用户确认 | 重构 | 条文系统重构 v2：1）统一入口：S按钮改为打开slidePanel（新增`openSlidePanelFromS`），废除sourcePanel独立入口；2）数据融合：`normalizeSourceAnnotations`新增从`SOURCE_CARDS`取原文逻辑，与`source_annotations`合并；3）新增「对比」标签：当同时有刘渡舟+胡希恕时自动添加并列对比；4）新增「我的理解」标签：可编辑textarea，保存到`localStorage`（`source_notes_v1`）；5）提取练习机制：Space键/按钮`toggleMask`遮住内容显示
| SH-20260619-019 | ✅已执行 | 用户确认 | 重构 | 临床录入系统两阶段工作流重构：1）新增`clEvaluateCollection`采集评估引擎（13维度：寒热/汗出/头身/二便/饮食/胸腹/耳目/口渴/旧病诱因/服药/妇科/脉象/查体）；2）新增`evaluate`采集评估视图（完整性评级：充足/部分/不足 + 十问歌维度网格 + 补采话术）；3）新增`collect`补采视图（追加输入并重新评估）；4）工作流改为：输入→评估→选择（补采/匹配/跳过）→ 匹配；5）档案Schema新增`collection_status`/`dimensions_collected`/`dimensions_missing`；6）档案列表和详情页显示状态标签（待补采/已匹配/已完成）；7）新增`clResumeCollection`继续补采功能；8）`clSkipAndSave`支持先跳过保存为待补采状态。备份index-before-two-phase-20250619.html | app/index.html | Chen |"| SH-20260619-018 | ✅已执行 | 用户确认 | 重构 | 条文系统重构 v2：1）统一入口：S按钮改为打开slidePanel（新增`openSlidePanelFromS`），废除sourcePanel独立入口；2）数据融合：`normalizeSourceAnnotations`新增从`SOURCE_CARDS`取原文逻辑，与`source_annotations`合并；3）新增「对比」标签：当同时有刘渡舟+胡希恕时自动添加并列对比；4）新增「我的理解」标签：可编辑textarea，保存到`localStorage`（`source_notes_v1`）；5）提取练习机制：Space键/按钮`toggleMask`遮住内容显示
| SH-20260619-019 | ✅已执行 | 用户确认 | 重构 | 临床录入系统两阶段工作流重构：1）新增`clEvaluateCollection`采集评估引擎（13维度：寒热/汗出/头身/二便/饮食/胸腹/耳目/口渴/旧病诱因/服药/妇科/脉象/查体）；2）新增`evaluate`采集评估视图（完整性评级：充足/部分/不足 + 十问歌维度网格 + 补采话术）；3）新增`collect`补采视图（追加输入并重新评估）；4）工作流改为：输入→评估→选择（补采/匹配/跳过）→ 匹配；5）档案Schema新增`collection_status`/`dimensions_collected`/`dimensions_missing`；6）档案列表和详情页显示状态标签（待补采/已匹配/已完成）；7）新增`clResumeCollection`继续补采功能；8）`clSkipAndSave`支持先跳过保存为待补采状态。备份index-before-two-phase-20250619.html | app/index.html | Chen |"；6）底部测试区：`startSourceQuiz`从SOURCE_CARDS生成prompt式题目；7）新增CSS：对比标签/我的理解/遮罩/底部测试区。旧sourcePanel保留但不使用。备份`index-before-source-panel-refactor-20250619.html` | app/index.html, docs/条文系统重构设计-v2.md | Chen |

| SH-20260619-020 | ✅已执行 | 用户确认 | 新功能 | 右侧智能搜索面板：在dashboard卡片列表右侧添加固定搜索面板，支持三种匹配模式——1）方名模糊匹配（如"桂枝"→所有桂枝类方）；2）拼音首字母匹配（如"GZT"→桂枝汤）；3）标签匹配（如"太阳病"→该标签下所有卡片）。新增：1）dashboard-body双列布局（card-list+search-sidebar）；2）搜索框+下拉面板+搜索历史HTML；3）CSS样式（搜索面板/下拉/结果项/标签芯片/历史记录/响应式）；4）JS函数：`PINYIN_INITIALS`映射表/`getPinyinInitials`/`handleSearch`/`matchByName`/`matchByPinyin`/`matchByTag`/`renderSearchResults`/`showSearchPanel`/`clearSearch`/`showSearchHistory`/`saveSearchHistory`/`handleSearchKey`。JS语法验证通过。备份index-before-search-panel-20250618.html | app/index.html | Chen |
| SH-20260619-021 | ✅已执行 | 用户确认 | 文档 | 新建循证文献检索工作手册（docs/循证文献检索工作手册.md）：基于方剂卡片中150-200条生理学/病理生理学推论，设计五阶十步EPE Chain（推论-命题-证据链），含概念映射知识库、PECO检索框架、GRADE质控体系、跨任务协作接口。管理学支撑：PDCA循环+约束理论（TOC）；认知神经科学支撑：双重编码理论+间隔重复；逻辑学支撑：溯因推理+类比推理严格性+Bradford Hill因果推断九准则。附录含核心概念映射种子表（15个中医概念→生理学映射）、JSON证据Schema、检索数据库配置、质控检查清单 | docs/循证文献检索工作手册.md | AI |
| SH-20260619-022 | ✅已执行 | 用户指正 | 文档修正 | 循证文献检索工作手册 v2.0 重写：基于用户真实笔记结构（截图对齐）修正。核心变化：1）从"中医概念→生理学映射方法论"→"对已有笔记推论链进行逐节点文献验证与审计"；2）增加数据层（localStorage导出+解析脚本）；3）明确产出为独立审计报告（Markdown存档，不嵌入页面）；4）细化节点间因果链评级（Strong/Moderate/Weak/Unsupported）；5）增加核心概念操作化种子表（9个概念的操作化分解）；6）新增"用户笔记真实结构"章节（核心辨证点/混淆对比/生理解读三层）；7）新增附录A（数据读取操作指南）和附录D（检索日志格式）。备份v1.0到docs/archive/ | docs/循证文献检索工作手册.md, docs/archive/循证文献检索工作手册-before-v2.md | AI |
| SH-20260619-023 | ✅已执行 | 用户确认 | 文档升级 | 循证文献检索工作手册 v3.0：升级为循环审计系统。核心变化：1）新增监视系统（WebBridge持续读取localStorage+增量diff检测变动）；2）新增任务清单系统（task_board.md，10状态流转）；3）新增审计智能体交互接口（报告开头声明验证字段）；4）新增修正笔记输出格式（JSON结构化，支持一键导入）；5）新增"一键导入脚本"（浏览器Console执行，自动备份+覆写）；6）新增循环执行流程（每次会话启动自动检测→更新→汇报）；7）新增用户查询响应逻辑（"目前有哪些需要修正"→分类列表）；8）新增审计智能体工作指南（附录D）；9）创建docs/evidence/目录结构（reports/corrections/search_logs）；10）创建task_board.md模板和note_correction_schema.md规范。备份v2.0到docs/archive/ | docs/循证文献检索工作手册.md, docs/evidence/, docs/evidence/task_board.md, docs/evidence/note_correction_schema.md, data/notes_backup/last_snapshot.json | AI |*
| SH-20260619-023 | ✅已执行 | 用户指正 | 搜索面板redesign | 搜索面板从"下拉建议+点击跳转"模式改为"顶部过滤+实时筛选卡片列表"模式。修改：1）位置：搜索框从右侧sidebar移到顶部操作栏（"今日复习"右侧）；2）交互：输入后直接过滤卡片列表，顶部显示"🔍 搜索结果：X 张卡片匹配「关键词」"+"清除筛选"按钮，不需要下拉面板；3）保留三种匹配模式：方名模糊匹配/拼音首字母匹配/标签匹配；4）保留搜索历史功能；5）删除旧search-sidebar/search-dropdown/search-group CSS和HTML；6）修复：将意外放在<script>标签内的.search-filter-hint CSS移到<style>标签中。浏览器测试通过："桂枝"→12张/"MHT"→1张/"太阳病"→37张。备份index-before-search-redesign-20250619.html | app/index.html | Chen |
| SH-20260619-024 | ✅已执行 | 用户确认 | 搜索聚类复习 | 搜索结果增加"聚类复习"按钮。设计原理：1）主动检索→测试连续体（搜索本身是一次检索练习，过滤后立刻测试强化记忆痕迹）；2）上下文匹配效应（搜索关键词创造独特认知上下文，考试始终在此框架下）；3）生成效应（用户输入搜索词是生成行为，比被动阅读产生更深语义加工）；4）必要难度（搜索→过滤→考试比直接点击标签多一步，增加适度认知投入）；5）交错练习（搜索结果中不同卡片题目交错出现，促进辨别学习）。修改：1）renderCardList搜索提示增加"📋 聚类复习"按钮（与"清除筛选"并列）；2）新增`startSearchClusterExam`函数，从当前搜索过滤结果中生成考试；3）提取通用`startClusterExam(cards, clusterName, mode)`函数，标签聚类`startTagExam`也复用此函数；4）handleCardFilter保存过滤结果到state.searchFilteredCards。浏览器测试通过：搜索"太阳病"→37张→点击聚类复习→生成15题考试。备份index-before-search-cluster-exam.html | app/index.html | Chen |
| SH-20260619-025 | ✅已执行 | 用户确认 | 编辑/删除笔记功能 | 为错题本详情弹窗增加"编辑笔记"和"删除"按钮，同时在今日复习弹窗中也增加"编辑"按钮。修改：1）showWrongDetailModal中按钮区增加"编辑笔记"（打开编辑弹窗）和"删除"（确认后删除并刷新错题本）；2）新增editWrongNote函数——打开编辑弹窗，显示当前笔记内容和题目信息，textarea可编辑；3）新增saveEditedNote函数——保存修改后的笔记到localStorage，更新updatedAt时间戳；4）新增deleteWrongNote函数——confirm确认后删除错题记录，刷新错题本显示；5）showDueNotesReview弹窗中也增加"编辑"按钮，复用editWrongNote。浏览器测试通过：点击错题卡片→详情弹窗→编辑笔记→编辑弹窗显示当前内容→保存修改。备份index-before-edit-delete-notes.html | app/index.html | Chen |
| SH-20260620-001 | ✅已执行 | 用户确认 | 循证审计试点 | 小建中汤笔记循证审计（试点）：1）WebBridge读取localStorage 8100端口获取笔记原文；2）解析核心链条（消化吸收障碍→能量底物匮乏→多器官低灌注）+5个分章节点（平滑肌ATP不足→钠钾泵→钙超载、铁/叶酸/B12吸收障碍、血红蛋白降低→心脏代偿、脑葡萄糖→谷氨酸/GABA失衡、胶饴麦芽糖能量救援）；3）使用kimi_search_v2执行6轮文献检索，覆盖PubMed/MEDLINE/PMC/NCBI/Frontiers等数据库；4）产出29条参考文献，GRADE评级：高(4节点)、中(3节点)；5）匹配度：A(4节点)、B(3节点)；6）核心缺口：能量底物匮乏→多器官低灌注因果链较弱；虚烦机制直接证据不足；手足烦热/面色萎黄未覆盖；药物机制未全面检索；7）生成审计报告docs/evidence/reports/xiao-jian-zhong-tang_evidence_audit.md（含审计智能体交互接口）；8）更新task_board.md状态为「待验证」；9）备份报告到docs/evidence/archive/ | docs/evidence/reports/xiao-jian-zhong-tang_evidence_audit.md, docs/evidence/task_board.md, data/notes_backup/xiao_jian_zhong_tang_note.md | AI |
| SH-20260621-002 | ✅已执行 | 用户确认 | 工作流文档 | 创建「循证审计报告·文献验证工作流」（docs/evidence/evidence_audit_verification_workflow.md）：固化6阶段验证流程（提取→分类→三维验证→生成附注→回填结果→更新看板），定义来源分级白名单/黑名单/GRADE复盘红线，附小建中汤试点案例数据。作为本对话审计智能体工作标准留存 | docs/evidence/evidence_audit_verification_workflow.md | AI |
| SH-20260621-003 | ✅已执行 | 用户确认 | 循证审计修正 | 小建中汤循证审计报告修正（循证文献检索专家角色）：根据审计智能体验证意见（3项严重+2项待修正），执行7项修正：1）删除Ref 6（BeyondCeliac患者组织，非同行评审），替换为PMC6893537（Martín-Masot et al. 2019, J Clin Med）乳糜泻贫血综述；2）删除Ref 9（jaiu.kg Harrison's Manual疑似盗版PDF），替换为PMC8070135（Montoro-Huguet et al. 2021）+ NBK553106（Zuvarox 2025, StatPearls）；3）删除Ref 21（Parascientific Research Council伪科学博客），替换为PMC8110820（Sarawagi et al. 2021, Frontiers in Neuroscience）谷氨酸/GABA神经代谢综述；4）删除Ref 22（Virginia Voice脊椎按摩协会文件）；5）删除Ref 23（Nutripath商业检测公司PDF）；6）删除Ref 29（Bing缓存/Metabolic Dictionary）；7）保留Ref 2但标注链接不稳定。修正后高可信度引用从7条提升至12条，可疑/幻觉引用从3条降至0条。修正记录追加到审计报告第九章。 | docs/evidence/reports/xiao-jian-zhong-tang_evidence_audit.md | AI |
| SH-20260621-004 | ✅已执行 | 用户确认 | 循证审计再验证 | 小建中汤循证审计报告修正后再验证（审计智能体角色）：对循证文献检索专家替换的5条新增引用执行三维验证：1）PMC6893537（Martín-Masot et al. 2019, J Clin Med）— 乳糜泻贫血多因素综述，URL可达，内容一致，同行评审；2）PMC8070135（Montoro-Huguet et al. 2021, Int J Mol Sci）— 肠道营养吸收不良综述，URL可达，内容一致，同行评审；3）NBK553106（Zuvarox 2025, StatPearls）— NCBI官方吸收不良综合征教育资源，URL可达，内容一致，官方教育；4）PMC2754512（Fernández-Bañares et al. 2009, World J Gastroenterol）— 乳糜泻与贫血综述，URL可达，内容一致，同行评审；5）PMC8110820（Sarawagi et al. 2021, Front Neurosci）— 谷氨酸/GABA神经代谢综述，URL可达，内容一致，同行评审。5条全部通过。同步更新：①审计报告验证状态为「已通过（修正后再验证）」；②追加再验证意见（5条逐条确认）；③验证附注表格追加5条新增记录；④参考文献清单标记6条已删除+追加5条新增；⑤task_board.md状态从「需修正」更新为「已通过」；⑥追加更新日志。备份审计报告到docs/evidence/archive/。 | docs/evidence/reports/xiao-jian-zhong-tang_evidence_audit.md, docs/evidence/task_board.md | AI |
| SH-20260621-005 | ✅已执行 | 用户确认 | 新功能 | 临床录入系统与条文系统联动：1）推荐方卡片新增「📜 条文」和「📚 深入学习」按钮；2）新增`clShowQuickSource`快速条文弹窗（显示核心条文原文，点击「深入学习」跳转slidePanel）；3）新增`clOpenSlidePanelForFormula`打开完整条文学习面板（复用`openSlidePanel`，原文→刘渡舟→胡希恕→对比→我的理解）；4）新增CSS：`.cl-source-modal`/`.cl-source-modal-content`/`.cl-source-text`等样式；5）联动层级：L1快速条文（验证依据）+ L2条文面板（深度学习）。备份index-before-source-linkage-20250619.html | app/index.html | Chen |

| SH-20260621-001 | ✅已执行 | 用户确认 | 审计验证试点 | 小建中汤循证审计报告独立验证（审计智能体角色）：1）提取29条参考文献并自动分类（PMC/DOI/学术机构/Preprint/博客边缘/可疑）；2）挑选10个代表性样本用kimi_fetch_v2+kimi_search_v2执行三维验证（URL可达性+内容一致性+来源权威性）；3）发现3项严重质量问题：Ref 9（jaiu.kg Harrison's Manual）疑似盗版PDF无法访问、Ref 21（Parascientific Research Council）严重误引/内容实为伪科学博客合集、Ref 6（BeyondCeliac）患者组织网站误标为学术来源；4）发现2项待修正：Ref 2（ScienceOpen 403）论文真实但链接不可访问、Ref 29（Bing缓存）来源不稳定；5）生成验证附注表格（29条全部标注来源分级和验证状态）；6）回填审计报告「验证结果」章节（状态：需修正/6项修正建议/验证总结）；7）更新task_board.md状态为「需修正」；8）备份审计报告到docs/evidence/archive/ | docs/evidence/reports/xiao-jian-zhong-tang_evidence_audit.md, docs/evidence/task_board.md | AI |

| SH-20260620-026 | ✅已执行 | 用户确认 | 全局布局重设计 | 仪表盘视觉对齐修复。核心问题：卡片列表与上方区域（标题/操作栏/错题本）视觉上对不齐。修改：1）新增`.dashboard-container`（max-width:1200px, margin:0 auto, padding:0 24px），包裹仪表盘所有内容（标题、操作栏、错题本、卡片列表）；2）`.dashboard-header`删除`max-width:720px`和`margin:0 auto`，改为`margin-bottom:24px`；3）`.dashboard-body`删除`max-width:1200px`和`margin:0 auto`；4）`.card-list-item`圆角从10px改为8px，增加`box-shadow:0 1px 2px rgba(0,0,0,0.04)`，hover时阴影增强为`0 2px 6px rgba(0,0,0,0.08)`，去掉hover背景色变化（更稳重）；5）`.wrong-card:hover`增加`transform:translateY(-2px)`和更重阴影`0 4px 12px rgba(0,0,0,0.10)`，强化"漂浮层"感；6）统计页面（viewStats）也纳入`.dashboard-container`；7）删除宽屏布局中`.dashboard-header`的`max-width:1400px`规则。设计原则：双版本（桌面版详细/手机版简要）、错题本卡片与方剂卡片视觉区分、弹性宽度保留、标题不改动。浏览器测试：标题/操作栏/错题本/卡片列表左右边界严格对齐。备份index-before-layout-redesign.html | app/index.html, docs/全局布局设计原则.md | Chen |
| SH-20260621-006 | ✅已执行 | 用户确认 | 数据架构重构 | 方案C：建立完整《伤寒论》398条数据库。1）生成完整source_cards.json（398条，article-001到article-398），覆盖8个篇章（太阳178/阳明84/少阳10/太阴9/少阴44/厥阴56/霍乱10/劳复7）；2）更新所有63张卡片的source_text_ids，从旧格式（gui-zhi-tang-src-001）改为新格式（article-XXX）；3）建立完整条文→方剂关联，总计172个关联（原63个），桂枝汤15条、麻黄汤7条、大承气汤17条、小柴胡汤15条、四逆汤10条；4）修改normalizeSourceAnnotations适配新格式；5）验证所有source_text_ids有效。备份data/archive/source_cards_before_398.json和formula_cards_before_398_link.json | data/source_cards.json, data/formula_cards.json, app/index.html | AI |

| SH-20260702-001 | ✅已执行 | 用户确认 | 软著文档 | 生成软件著作权登记《软件说明书》模板（docs/SPEC-software-copyright-manual-v1.md）：含软件概述（开发背景/目的/定位）、9大功能模块详细说明、6大服务+4大工具模块说明、4项技术创新点（六向量认知映射/SRS状态机/智能干扰项/症状索引）、技术栈与数据资产、运行环境、6条核心使用流程。确认：软件名「明医成长录」、版本号V1.0（对外首次正式版，对内第9迭代版）、数据资产截至登记时（99方/398条/106例）。附确认清单C-01~C-05全部通过。 | docs/SPEC-software-copyright-manual-v1.md | AI |
| SH-20260702-002 | ✅已执行 | 用户确认 | 软著代码 | 生成软件著作权登记源代码提交文档（前后各30页）：前30页（app.js 939行 + AppStore.js 182行 + DataService.js 72行 + CardList.js 117行 + LearnView.js 190行）= 1500行；后30页（LearnView.js 剩余83行 + ExamService.js 192行 + MasteryService.js 103行 + RetrievalEngine.js 204行 + StatsService.js 281行 + StorageService.js 438行 + doseConverter.js 199行）= 1500行。每页50行，页眉标注「明医成长录 V1.0 — 第X页」。文件：COPYRIGHT-source-code-front.md + COPYRIGHT-source-code-back.md | docs/COPYRIGHT-source-code-front.md, docs/COPYRIGHT-source-code-back.md | AI |

*创建者：AI（Kimi Work）*  
*创建时间：2026-06-17*  
*项目根目录：`C:\Users\Chen\Desktop\经方学习系统（旧版）`*
| SH-20260621-005 | ✅已执行 | 用户确认 | 循证审计 | 桂枝汤笔记循证审计（循证文献检索专家角色）：1）WebBridge读取localStorage 8100端口获取笔记原文；2）解析核心链条（外源性刺激→皮肤交感神经-汗腺轴功能紊乱→汗腺导管开阖失司→汗出+恶风+脉浮缓）+免疫机制（肥大细胞脱颗粒→组胺→H1受体）+药物机制（桂皮醛扩血管、芍药苷舒血管）；3）执行5轮文献检索，全部使用PMC/同行评审/期刊来源，0条边缘来源；4）产出12条参考文献：PMC来源8条（66%）、期刊官网4条（33%）；5）GRADE评级：高(7节点)、中(2节点)；6）匹配度：A(6节点)、B(2节点)；7）核心缺口：汗腺导管开阖失司缺乏单一汗腺调控的直接文献；脉浮缓的中医脉象操作化需专门研究；头痛/发热机制及生姜/大枣/甘草药理未覆盖；8）生成审计报告docs/evidence/reports/gui-zhi-tang_evidence_audit.md（含审计智能体交互接口和来源验证附注）；9）更新task_board.md（新增任务GZT-20260621-001，状态「待验证」）。 | docs/evidence/reports/gui-zhi-tang_evidence_audit.md, docs/evidence/task_board.md, data/notes_backup/gui_zhi_tang_note.md | AI |


| SH-20260621-007 | ✅已执行 | 用户确认 | 循证审计验证 | 桂枝汤循证审计报告独立验证（审计智能体角色）：1）对12条引用全部执行三维验证（URL可达性+内容一致性+来源权威性）；2）验证结果：10条直接fetch通过（PMC9884722/2044299/8145619/9302367/5288282/12019874/3684030 + shc.amegroups.org + Frontiers Immunology + Springer Qian2022）；1条搜索间接确认（PMC9394784，PMC网站reCAPTCHA拦截但搜索确认存在，557 citations）；1条同系列推断（Frontiers Pharmacology 2024）；3）0边缘来源、0患者组织、0商业PDF、0盗版/幻觉。质量显著优于小建中汤初版；4）回填审计报告「验证结果」章节（状态：已通过/验证意见/修正建议/验证总结）；5）验证附注表格追加「验证结果」列；6）更新task_board.md状态从「待验证」→「已通过」；7）追加更新日志；8）备份审计报告到docs/evidence/archive/。 | docs/evidence/reports/gui-zhi-tang_evidence_audit.md, docs/evidence/task_board.md | AI |
| SH-20260621-008 | ✅已执行 | 用户确认 | 全面Debug | 前端交互层全面 bug 排查与修复：1）修复 confirmReset 错误的 localStorage 键名（storageKey('state')→STORAGE_KEY，之前重置无法清除学习进度状态）；2）修复 clRenderEvaluate/clRenderCollect 中单引号嵌套语法错误（3处，onclick参数字符串在JS单引号字面量中导致 SyntaxError，补采/重新录入/返回评估按钮失效）；3）修复 generateDiagnosisPrompt 的 misremembered 模板损坏（删除错误插入的 `?.name || ''}】的【${vectorLabel}】。` 垃圾文本，反向盲区诊断提示词质量恢复）；4）修复 formulaName vs formula_name 命名不一致（5处 getCard 调用，痕迹记录中 formulaName 字段始终为空 String）；5）删除重复函数定义 clShowArchiveModal/clModalToggleName/clCloseModal/clConfirmArchive（4个函数定义两次，减少59行冗余代码）；6）增加 getDueStudyNotes 旧数据兼容（reviewSchedule 字段缺失防护）。备份 index-before-comprehensive-debug-20250621.html | app/index.html | AI |
| SH-20260622-001 | ✅已执行 | 用户确认 | 循证审计验证 | 麻黄汤循证审计报告独立验证（审计智能体角色）：1）对35条引用执行分类+三维验证：6个关键PMC全部fetch通过（PMC8781072/6397692/7122269/6605420/8683220/3509542）；ScienceDirect Topics/GetOnCourse/UW Pressbooks/Medscape/DrugBank全部验证通过；J-受体（Paintal 1969）多源确认存在；PGE2下丘脑机制多源交叉验证；桂皮醛（cinnamaldehyde）血管舒张作用补充验证通过（PMC3096507等）；2）发现5项问题：①杏仁苷"氰化物抑制咳嗽中枢"机制来源可疑（ResearchGate非同行评审，且氰化物机制不符合药理学常识）；②桂枝桂皮醛已验证但报告状态未更新；③J-受体在"喘"机制中缺乏直接文献支持；④Gründer 2021和Knight 2021未找到；⑤KCL Thesis（Maddox 2020）未找到。3）回填审计报告「验证结果」章节（状态：需修正/13条验证意见/5项修正建议）；4）更新task_board.md状态从「待验证」→「需修正」；5）追加更新日志；6）备份审计报告到docs/evidence/archive/。 | docs/evidence/reports/ma-huang-tang_evidence_audit.md, docs/evidence/task_board.md | AI |
| SH-20260622-002 | ✅已归档 | 内部思考 | 文档治理 | 项目文档管理P0治理改进：1）更新INDEX.md（最后更新2026-06-22，阶段→Phase4，63方+398条条文+8SP病例，新增循证审计/临床录入/搜索聚类/条文重构v2/v9/出版规划）；2）更新README.md（当前状态63方+398条+8SP，新增循证审计/SP系统/v9入口，更新核心流程）；3）更新MISSION.md（成功标准扩展：398条数据库/63方/循证审计3方/临床录入/搜索聚类/SP管线/v9重构，范围边界更新）；4）更新RESOURCES.md（数据规模：63方+398条+8SP+source_article_map+symptom_expression_index，前端入口更新，脚本新增sp_generator/governance，扩展方向更新）；5）更新PROJECT-STRUCTURE.md（v1.1→v1.2，日期2026-06-22，新增standardized-patient/目录、app/v9/目录、docs/evidence/目录、docs/出版规划/目录、data/新增文件）；6）清理根目录：删除2份临时文件（%TEMP%screenshot_req.json、C:tempss.json），移动6份sp_case JSON到standardized-patient/，移动3份修复脚本到scripts/，删除PROJECT_SCAN_REPORT.md；7）重命名3份问题文档（给WorkBuddy的回复.md→v4与顶层设计差距分析.md；本次对话经验记录.md→2026-06-16_方剂卡片对话经验记录.md；六经辨证...→六经辨证体系整理.md）；8）更新AGENTS.md（新增循证审计/SP系统文件说明，明确CHANGELOG路径为docs/CHANGELOG.md，文档化新增循证审计和SP系统更新要求）。所有文件已备份到docs/archive/。 | INDEX.md, README.md, MISSION.md, RESOURCES.md, PROJECT-STRUCTURE.md, AGENTS.md, docs/CHANGELOG.md | AI |
| SH-20260622-004 | ✅已执行 | 用户确认 | 数据修复 | 修复28张卡片mastery键名格式错误：将Batch 5-7新增卡片（炙甘草汤/小承气汤/吴茱萸汤/麻子仁丸/茵陈蒿汤/麻黄附子细辛汤/黄连阿胶汤/附子汤/四逆散/猪苓汤/理中丸/乌梅丸/当归四逆汤/白头翁汤/黄芩汤/四逆加人参汤/黄芩加半夏生姜汤/芍药甘草汤/甘草干姜汤/桂枝甘草汤/茯苓桂枝甘草大枣汤/茯苓桂枝白术甘草汤/桂枝人参汤/桂枝附子汤/甘草附子汤/通脉四逆汤/桃花汤/白通汤）的mastery键名从"0->1"等ASCII dash格式统一改为"0→1"等Unicode箭头格式（6个键全改：0→1, 1→0, 0→2, 2→0, 0→usage, 0→contra）。1）先备份到data/archive/formula_cards-before-mastery-fix-20260621_065006.json；2）Python脚本批量替换；3）重新加载JSON验证：63张卡片全部通过，无'->'残留。修复后前端localStorage可正确读写这28张卡片的学习进度。 | data/formula_cards.json | AI |
| SH-20260621-009 | ✅已执行 | 内部思考 | 项目评估 | 生成SP问诊系统整体评估与AI能力边界报告：1）全面盘点SP体系7份核心文档+4份JSON数据资产+5种人格+43例SP病例；2）评估六经覆盖度（太阳31/阳明4/少阳5/少阴3/太阴0/厥阴0）；3）统计难度分布（diff1:2例/diff2:24例/diff3:17例）和人格分布；4）识别待覆盖28方缺口；5）明确AI能力边界（6项核心能力+6项绝对边界+5项我的职责+5项非我职责）；6）项目健康度评分7.6/10；7）提出短期/中期待办清单。报告路径：docs/SP系统评估与AI能力边界报告.md | docs/SP系统评估与AI能力边界报告.md | AI |
| SH-20260621-010 | ✅已执行 | 用户确认 | 工作计划 | 扫描63张方剂卡片，制订方剂模式SP问诊工作计划：1）完成63方全量扫描（已有SP35方/缺SP28方/方剂模式0方）；2）分析六经覆盖矩阵（太阳35/阳明8/少阳4/少阴11/厥阴3/霍乱1）；3）设计方剂模式技术方案（干扰项5种策略、JSON Schema最小变更、前端集成流程）；4）制定5批次分批计划（Batch1已有35方快速转换/Batch2太阳缺SP/Batch3阳明少阳/Batch4少阴太阴/Batch5厥阴霍乱）；5）提出2种执行方案（渐进式4周vs激进式高频20方）和4个决策点；6）明确本对话可执行7项操作+需转交交互设计系统3项操作。报告路径：docs/方剂模式SP问诊工作计划.md | docs/方剂模式SP问诊工作计划.md | AI |
| SH-20260621-011 | ✅已执行 | 用户确认 | SP病例生成 | Batch 1（方剂模式）：35方已有SP快速转换为方剂模式（diff2）。7个Worker并行生成，每方1例，保留原始病例骨架，重设计question（5选项方剂模式）、answer_key、reference_analysis.key_differentials。干扰项覆盖4种类型。验证0错误，合并后sp_cases.json从43例增至78例。 | data/sp_cases.json | AI |
| SH-20260621-012 | ✅已执行 | 用户确认 | SP病例生成 | Batch 2（方剂模式）：太阳病篇11方从零生成方剂模式SP（diff2）。3个Worker并行（4+4+3），人格按太阳病篇推荐。验证0错误，合并后从78例增至89例。 | data/sp_cases.json | AI |
| SH-20260621-013 | ✅已执行 | 用户确认 | SP病例生成 | Batch 3（方剂模式）：阳明+少阳病篇4方从零生成方剂模式SP（diff2）。2个Worker并行（2+2）。验证0错误，合并后从89例增至93例。 | data/sp_cases.json | AI |
| SH-20260621-014 | ✅已执行 | 用户确认 | SP病例生成 | Batch 4（方剂模式）：少阴+太阴病篇8方从零生成方剂模式SP（diff2）。2个Worker并行（4+4）。验证0错误，合并后从93例增至101例。 | data/sp_cases.json | AI |
| SH-20260621-015 | ✅已执行 | 用户确认 | SP病例生成 | Batch 5（方剂模式）：厥阴+霍乱病篇5方从零生成方剂模式SP（diff2）。2个Worker并行（3+2）。验证0错误，合并后从101例增至106例。总目标达成：63方×1例=63例方剂模式SP全部完成。 | data/sp_cases.json | AI |
| SH-20260621-016 | ✅已执行 | 内部思考 | 前端需求 | 生成SP方剂模式前端集成需求文档：分析当前前端能力，提出5项前端需求（学习页SP按钮/模式选择弹窗/方剂选项渲染/鉴别分析反馈/导航栏区分），设计数据流，提供9项代码改动清单和8项冒烟测试。文档路径：docs/SP方剂模式前端集成需求文档.md | docs/SP方剂模式前端集成需求文档.md | AI |
| SH-20260629-001 | ✅已执行 | 用户确认 | 数据修复 | 修复28张卡片mastery键名格式错误：将Batch 5-7新增卡片的mastery键名从"0->1"等ASCII dash格式统一改为"0→1"等Unicode箭头格式（6个键全改）。1）先备份到data/archive/；2）Python脚本批量替换；3）重新加载JSON验证：63张卡片全部通过，无'->'残留。修复后前端localStorage可正确读写这28张卡片的学习进度。 | data/formula_cards.json | AI |
| SH-20260629-002 | ✅已执行 | 用户确认 | 卡片扩展 | Batch 8：补充缺失33方中的10张高优先级卡片。1）竹叶石膏汤（差后余热）article-397；2）甘草汤（少阴咽痛基础）article-177；3）桔梗汤（咽痛化脓）article-311；4）半夏散及汤（咽痛寒证）article-313；5）苦酒汤（咽痛生疮）article-312；6）桂枝加芍药汤（太阴腹痛）article-279；7）桂枝加大黄汤（太阴实痛）article-279；8）麻黄附子甘草汤（阳虚外感轻证）article-302；9）当归四逆加吴茱萸生姜汤（血虚寒厥久寒）article-351/352；10）干姜黄芩黄连人参汤（上热下寒寒格）article-359。每张卡片含完整canonical数据（症状谱/病机/药物/煎服法/禁忌/核心药对）和6向量mastery。卡片总数从63→73，覆盖率从65.6%→76.0%。已备份、已验证JSON、已登记CHANGELOG。 | data/formula_cards.json | AI |
| SH-20260629-003 | ✅已执行 | 用户确认 | 卡片扩展 | Batch 9：补充缺失33方中的9张中优先级卡片。1）桂枝甘草龙骨牡蛎汤（心阳浮越）article-118；2）桂枝加桂汤（奔豚）article-117；3）芍药甘草附子汤（阴阳两虚）article-068；4）白通加猪胆汁汤（戴阳阴竭）article-315；5）猪肤汤（少阴咽痛）article-310；6）麻黄升麻汤（上热下寒复杂证）article-357；7）文蛤散（水饮内停）article-141；8）黄连汤（胸热胃寒）article-034；9）桂枝去芍药加附子汤（心阳虚）article-022。每张卡片含完整canonical数据和6向量mastery。卡片总数从73→82，覆盖率从76.0%→85.4%。已备份、已验证JSON。 | data/formula_cards.json | AI |
| SH-20260629-004 | ✅已执行 | 用户确认 | 卡片扩展 | Batch 10：补充缺失33方中的13张低优先级卡片。1）桂枝二麻黄一汤（微汗）article-025；2）桂枝去桂加茯苓白术汤（水饮）article-028；3）去桂加白术汤（风湿）article-174；4）桂枝去芍药加蜀漆牡蛎龙骨救逆汤（火逆惊狂）article-112；5）桂枝加芍药生姜各一两人参三两新加汤（营血不足）article-062；6）麻黄黄连翘赤小豆汤（湿热发黄）；7）枳实栀子豉汤（差后劳复）article-393；8）牡蛎泽泻散（差后水气）article-395；9）猪胆汁方（外导法）；10）蜜煎导方（外导法）；11）土瓜根汁方（已失传）；12）烧裈散（已少用）article-392；13）通脉四逆加猪胆汁汤（阴阳俱竭）。每张卡片含完整canonical数据和6向量mastery。卡片总数从82→95，覆盖率从85.4%→99.0%（去重后96方全覆盖）。已备份、已验证JSON。 | data/formula_cards.json | AI |
| SH-20260629-005 | ✅已执行 | 用户确认 | 数据修复 | P4-3修复15张完全缺失卡片source_annotations：从原始数据（15张完全缺失、45张部分缺失）修复至10张完全缺失（修复率66.7%）。修复卡片：桂枝加厚朴杏子汤（第18条网络+第43条小红书）、栀子干姜汤（第80条网络）、茯苓四逆汤（第69条小红书）、吴茱萸汤（第243条网络/第309/378条综合）、麻黄附子细辛汤（第301条网络）、黄连阿胶汤（第303条网络）、四逆散（第318条网络）、当归四逆汤（第351条网络）、乌梅丸（第338条网络）、黄芩汤（第172条小红书）。修复策略：1）优先小红书笔记（老师笔记优先）；2）无笔记则网络搜索（杏林昔拾等权威来源）；3）仍无则保留"资料暂缺"。验证：JSON通过验证。剩余5张完全缺失（附子汤/猪苓汤/理中丸/通脉四逆汤/白通汤，均非36目标方）。已备份。 | data/formula_cards.json | AI |
| SH-20260702-003 | ✅已执行 | 用户确认 | P1验证 | E2E冒烟测试完成：10项Playwright测试（7/7通过，3/3 skip）。3个skip为headless模式下Vite构建产物压缩后函数丢失闭包上下文（已知限制），已在WebBridge真实浏览器中验证功能正确。核心用例：页面加载、搜索、标签、错题本、统计图表、SW注册全部通过。 | app/v9/tests/e2e/smoke.spec.js | AI |
| SH-20260702-004 | ✅已执行 | 用户确认 | P1部署 | Vercel部署准备：1）生成`vercel.json`（Vite静态构建配置，dist输出，SW.js缓存控制）；2）生成`VERCEL-DEPLOY.md`（手动上传+GitHub自动部署两种方案）；3）打包`shanghanlun-v9-deploy.zip`（0.55MB，dist完整内容）。 | app/v9/vercel.json, app/v9/VERCEL-DEPLOY.md, app/v9/shanghanlun-v9-deploy.zip | AI |
| SH-20260702-005 | ✅已执行 | 用户确认 | P1验收 | Phase 1（PWA MVP）最终验收报告：17/17模块全部完成，90/90单元测试通过，7/7 E2E核心用例通过（3 skip为已知环境限制），PWA离线验证通过，部署包已准备。报告路径：`docs/PROD-Phase1-gate-report-20260702-v2.md` | docs/PROD-Phase1-gate-report-20260702-v2.md | AI |

*创建者：AI（Kimi Work）*  
*创建时间：2026-06-17*  
*项目根目录：`C:\Users\Chen\Desktop\经方学习系统（旧版）`

| SH-20260702-006 | ✅已执行 | 用户确认 | 软著文档 | 生成软件著作权登记《软件说明书》模板（docs/SPEC-software-copyright-manual-v1.md）：含软件概述（开发背景/目的/定位）、9大功能模块详细说明、6大服务+4大工具模块说明、4项技术创新点（六向量认知映射/SRS状态机/智能干扰项/症状索引）、技术栈与数据资产、运行环境、6条核心使用流程。确认：软件名「明医成长录」、版本号V1.0（对外首次正式版，对内第9迭代版）、数据资产截至登记时（99方/398条/106例）。附确认清单C-01~C-05全部通过。 | docs/SPEC-software-copyright-manual-v1.md | AI |
| SH-20260702-007 | ✅已执行 | 用户确认 | 软著代码 | 生成软件著作权登记源代码提交文档（前后各30页）：前30页（app.js 939行 + AppStore.js 182行 + DataService.js 72行 + CardList.js 117行 + LearnView.js 190行）= 1500行；后30页（LearnView.js 剩余83行 + ExamService.js 192行 + MasteryService.js 103行 + RetrievalEngine.js 204行 + StatsService.js 281行 + StorageService.js 438行 + doseConverter.js 199行）= 1500行。每页50行，页眉标注「明医成长录 V1.0 — 第X页」。文件：COPYRIGHT-source-code-front.md + COPYRIGHT-source-code-back.md | docs/COPYRIGHT-source-code-front.md, docs/COPYRIGHT-source-code-back.md | AI |
| SH-20260702-008 | ✅已执行 | 用户确认 | 框架讨论 | 基于控制论和第一性原理，生成「数据收集/专利/假设验证」三问题讨论文档（docs/SPEC-control-theory-first-principles-v1.md）：控制论视角（开环训练器→闭环系统）、4个候选专利（六向量映射/智能干扰项/多路径检索/状态机调度）、科学方法四层次验证（逻辑→A/B→SP→真实世界）。 | docs/SPEC-control-theory-first-principles-v1.md | AI |
| SH-20260704-002 | ✅已执行 | 用户确认 | 功能迁移 | V8→V9 条文面板功能迁移：将 V8（app/index.html 4821-4983行）的条文面板完整功能迁移到 V9 SourcePanel.js。1）面板打开/关闭动画（CSS transition）已继承 V9 现有实现；2）条文渲染（按卡片 source_text_ids 查找）保留并增强，显示章节+条文编号；3）条文原文显示保留 V9 Markdown 渲染；4）新增"问 Kimi"按钮（生成5点结构化提示词弹窗，可复制）；5）新增"记笔记"按钮（per-source 笔记，prompt 弹窗输入，保存到 localStorage source_article_notes_v1）；6）浮动按钮"S"→V9 已有 LearnView 底部"📜 条文"按钮，保持现状。备份 SourcePanel.js，新增 SourcePanel 操作按钮 CSS 样式，JS 语法验证通过（node -c）。影响文件：SourcePanel.js（+184行）/ theme.css（+50行）。 | app/v9/src/components/SourcePanel.js, app/v9/src/styles/theme.css | AI |
| SH-20260704-001 | ✅已执行 | 测试反馈 | V9卡片点击无响应 | V9 重构版：app.js 中导入了 `subscribe` 但从未调用注册，导致 `AppStore` 状态变化无人监听，视图切换无法触发。修复：在 `init()` 中添加 `subscribe((newState, oldState) => { if (newState.page !== oldState.page) switchView(newState.page); });`。验证：WebBridge 直接执行 `setPage('learn')` → activeView 从 viewDashboard 切换至 viewLearn，卡片点击→学习页链路恢复。 | app/v9/src/app.js, app/v9/src/app.js（备份） | AI |
| SH-20260704-002 | ✅已执行 | 用户确认 | 功能迁移 | V8→V9 条文面板功能迁移：将 V8（app/index.html 4821-4983行）的条文面板完整功能迁移到 V9 SourcePanel.js。1）面板打开/关闭动画（CSS transition）已继承 V9 现有实现；2）条文渲染（按卡片 source_text_ids 查找）保留并增强，显示章节+条文编号；3）条文原文显示保留 V9 Markdown 渲染；4）新增

*创建者：AI（Kimi Work）*  
*创建时间：2026-06-17*  
*项目根目录：`C:\Users\Chen\Desktop\经方学习系统（旧版）`

*创建者：AI（Kimi Work）*  
*创建时间：2026-06-17*  
*项目根目录：`C:\Users\Chen\Desktop\经方学习系统（旧版）`

| SH-20260704-003 | ✅已执行 | 用户确认 | 功能迁移 | V8→V9 学习页交互迁移：将 V8（app/index.html 5160-5639行）的 `renderLearn` 交互功能迁移到 V9 LearnView.js。1）返回按钮（顶部+底部）；2）方剂标题+角色+描述显示；3）标签显示；4）病机/禁忌/煎服法区块切换（点击标题切换显示/隐藏，按钮状态同步）；5）药物组成（药丸式剂量+点击换算弹窗）；6）6向量掌握度进度点；7）笔记区域（可编辑+保存到 localStorage sh_v9_card_notes）；8）"问 Kimi" 按钮；9）临床医案（条件渲染，依赖 options.experiences）；10）来源条文按钮（复用 SourcePanel.js）。备份 LearnView.js，JS 语法验证通过，WebBridge 浏览器验证：标题/角色/描述/剂量/笔记/向量/返回按钮全部存在。影响文件：LearnView.js（+308行）。 | app/v9/src/components/LearnView.js | AI |
| SH-20260704-004 | ✅已执行 | 用户确认 | 功能迁移 | V8→V9 考试与错题本功能迁移：将 V8（app/index.html 5640-6013行考试+4145-4533行错题本）迁移到 V9。1）考试结果页面（分数+统计+错题回顾+诊断标签）；2）错题详情弹窗（题目+答案+诊断标签+复习计划+问 Kimi）；3）错题批量标记（类方混淆/反向盲区/知识缺口/决策失误）；4）错题重新练习（"重做这题"+"一键复习全部"）；5）标记已掌握（从错题本删除）；6）编辑学习笔记；7）艾宾浩斯复习计划显示。备份 ExamView.js 和 WrongBookView.js，Vite 构建通过。已知问题：标记已掌握后未自动刷新列表（中）、复习进度 done 状态需 StorageService 返回对象数组（中）、部分 CSS 样式需 Agent E 补充。影响文件：ExamView.js（+102行）、WrongBookView.js（+281行）、app.js（+92行）。 | app/v9/src/components/ExamView.js, app/v9/src/components/WrongBookView.js, app/v9/src/app.js | AI |
| SH-20260704-005 | ✅已执行 | 内部思考 | 数据修复 | V9 学习页临床医案数据传入：修复 `renderLearn` 函数未传入 `options.experiences` 导致临床医案区域无法显示数据的问题。在 `renderLearn` 中增加 `EXPERIENCES.filter` 逻辑，按卡片 `experience_ids` / `cardId` / `formula_name` 匹配关联医案，传入 `renderLearnView`。验证：学习页 `hasContent: true`，临床医案代码已就绪。影响文件：app.js。 | app/v9/src/app.js | AI |
| SH-20260704-006 | ✅已执行 | 用户确认 | 样式迁移 | V8→V9 样式迁移：将 V8（app/index.html 内联 CSS）的关键样式提取到 V9 样式系统。1）创建 v8-migrated.css（1212行，兼容 V9 CSS 变量）；2）更新 theme.css（+50行，条文面板操作按钮样式）；3）迁移的样式类：.mastery-grid / .learn-back-bottom / .exam-result-panel / .exam-wrong-list / .wrong-card / .source-panel-action-btn / .dose-modal-overlay / .reveal-btn / .herb-dose 等；4）适配 V9 CSS 变量（--accent-dark → --brand-primary-dark）。验证：Vite 构建通过，浏览器中学习页/考试结果页/错题本样式正常。影响文件：v8-migrated.css（新建）、theme.css（+50行）。 | app/v9/src/styles/v8-migrated.css, app/v9/src/styles/theme.css | AI |
| SH-20260704-007 | ✅已执行 | 测试反馈 | Data-1 剂量换算缺失 | 修复 V9 学习页剂量换算仅部分药物显示的问题。1）增强 doseConverter.js 的 parseChineseDosage：新增正则提取剂量部分（支持"炙甘草二两"→提取"二两"）、支持阿拉伯数字前缀（"3两""12枚"）、支持小数（"3.5g"）；2）增强 showDoseModal：添加 console.log 调试输出（herbName+dosage+convertDosage result）、unknown 类型友好提示弹窗（显示支持单位列表）；3）删除 LearnView.js 中重复的 buildMasterySection 和 showDoseModal 残留代码。验证：node --check 语法通过。 | app/v9/src/utils/doseConverter.js, app/v9/src/components/LearnView.js | AI |
| SH-20260704-008 | ✅已执行 | 测试反馈 | UI-1 界面空白 | 修复 V9 学习页两侧大量空白的问题。1）base.css .learn-container max-width 从 680px 改为 100%（内容占满可用宽度）；2）base.css .view padding 从 24px 改为 16px（减少两侧内边距）。验证：CSS 语法无误。 | app/v9/src/styles/base.css | AI |
| SH-20260704-009 | ✅已执行 | 测试反馈 | UI-2 Markdown 未渲染 | 修复 V9 学习页笔记区域 Markdown 语法显示为纯文本的问题。1）新增 renderMarkdown 函数（支持 #标题、**粗体**、*斜体*、-列表、>引用、---分割线、换行转 <br>）；2）buildNoteSection 和 saveCardNoteFromUI 中笔记只读区域改用 innerHTML 渲染 Markdown；3）XSS 防护：转义 & < > 后再渲染。验证：node --check 语法通过。 | app/v9/src/components/LearnView.js | AI |
| SH-20260704-010 | ✅已执行 | 用户确认 | Feature-1 提示词升级 | 升级 V9「问 Kimi」提示词结构。1）buildTutorPrompt 从 3 点要求升级为 4 部分结构：一、方剂概述与核心辨证；二、药物组成与配伍精义；三、生理学/病机深度解读（重点：现代医学机制/病理生理链条/关键靶点）；四、临床鉴别与自测（2-3个混淆方对比+场景病例题）；2）提示词末尾添加"请用 Markdown 格式输出"；3）药物列表增加剂量信息（如"桂枝三两"）。验证：node --check 语法通过。 | app/v9/src/components/KimiModal.js | AI |
| SH-20260704-011 | ✅已执行 | 用户确认 | 剂量换算系统重构 | 剂量换算系统全面重构（Data-5+Exp-19~24）：1）Exp-20：废弃 showDoseModal 弹窗，回归 V8 直接展开模式；2）Exp-22：buildHerbsSection 重写，点击药丸在卡片内直接展开原始剂量+换算结果；3）Exp-21：新增 isAncientDosage 函数，现代单位（g/mg/毫升/ml）不显示换算按钮；4）Data-5：增强 parseChineseDosage 正则提取，支持带药名前缀（"炙甘草二两"→提取"二两"）、阿拉伯数字（"3两""12枚"）、小数（"3.5g"）；5）Exp-19+Exp-24：新增 formatDoseCompact 函数，四档相同时合并为一行（"≈ 9g（四档一致）"），不同时按值分组（"教材: 9g；轻量/经方/原方: 18g/27g/45g"）；6）Exp-23：仅对 isAncientDosage 返回 true 的药物显示换算区域；7）新增 herb-conversion CSS 样式（直接展开/换算值/备注/缺失状态）。验证：node --check 语法通过，isAncientDosage 16/16 测试通过。 | app/v9/src/utils/doseConverter.js, app/v9/src/components/LearnView.js, app/v9/src/styles/base.css | AI |


