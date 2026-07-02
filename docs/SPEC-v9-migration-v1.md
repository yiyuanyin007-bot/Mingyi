# SPEC-v9-migration-v1.md — v8 功能清单到 v9 功能映射

> **文档编号**：SPEC-v9-migration-v1  
> **版本**：v1.0  
> **日期**：2026-07-02  
> **状态**：已确认（产品名：明医成长录）  
> **用途**：指导 v9 组件化重构，确保功能不遗漏

---

## 一、v8 功能全景（共 8 大功能域 / 约 35 个功能模块）

### 功能域 A：核心学习（浏览 + 考试）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| A-01 | 卡片列表浏览 | ✅ | ✅ | `CardList.js` | P0 |
| A-02 | 卡片详情展示 | ✅ | ✅ | `LearnView.js` | P0 |
| A-03 | 6向量练习（单卡） | ✅ | ✅ | `ExamView.js` + `ExamService.js` | P0 |
| A-04 | 类方考试（多卡） | ✅ | ✅ | `ExamView.js` + `ExamService.js` | P0 |
| A-05 | 每日复习 SRS（5题） | ✅ | ✅ | `startDailyReview` + `ExamService.js` | P0 |
| A-06 | 练习总结 / 错题回顾 | ✅ | ✅ | `PracticeSummary.js` | P0 |
| A-07 | 掌握度追踪（6向量） | ✅ | ✅ | `MasteryService.js` + `StorageService.js` | P0 |
| A-08 | 暗色模式切换 | ✅ | ✅ | `toggleTheme` in `app.js` | P0 |

### 功能域 B：搜索与导航（v9 缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| B-01 | 顶部搜索过滤（方名/拼音/标签） | ✅ | ❌ | 待创建 `SearchBar.js` | P1 |
| B-02 | 搜索聚类考试（搜索结果→批量考试） | ✅ | ❌ | 待创建 `SearchClusterView.js` | P1 |
| B-03 | 标签点击聚类 | ✅ | ❌ | 待创建 `TagClusterView.js` | P1 |
| B-04 | 回到顶部/底部浮动按钮 | ✅ | ❌ | 待创建 `FloatingActions.js` | P2 |
| B-05 | 智能搜索面板（右侧/顶部） | ✅ | ❌ | 待创建 `SearchPanel.js` | P2 |

### 功能域 C：错题与学习记录（v9 部分缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| C-01 | 错题本展示 | ✅ | ⚠️ 简化 | 需增强 `PracticeSummary.js` | P1 |
| C-02 | 错题编辑/删除 | ✅ | ❌ | 待创建 `WrongBookView.js` | P1 |
| C-03 | 诊断标签（认知神经科学） | ✅ | ❌ | 待创建 `DiagnosisTags.js` | P1 |
| C-04 | 错题直接问Kimi | ✅ | ❌ | 待增强 `KimiModal.js` | P1 |
| C-05 | 批量标记错题 | ✅ | ❌ | 待创建 `BatchTagView.js` | P2 |
| C-06 | 诊断标签静默保存 | ✅ | ❌ | 待增强 `StorageService.js` | P2 |
| C-07 | 笔记编辑/删除 | ✅ | ❌ | 待创建 `NoteEditor.js` | P2 |

### 功能域 D：检索与关联训练（v9 缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| D-01 | "再来一组"检索练习 | ✅ | ❌ | 待创建 `RetrievalEngine.js` | P1 |
| D-02 | 关联学习（一题多向） | ✅ | ❌ | 待增强 `ExamService.js` | P1 |
| D-03 | 错题画像生成 | ✅ | ❌ | 待增强 `StatsService.js` | P1 |
| D-04 | 变体题目生成 | ✅ | ❌ | 待增强 `ExamService.js` | P2 |
| D-05 | 交错打散 | ✅ | ❌ | 待增强 `ExamService.js` | P2 |

### 功能域 E：剂量与条文（v9 部分缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| E-01 | 剂量四标准换算（3/6/9/15g） | ✅ | ⚠️ 基础 | 需增强 `LearnView.js` | P1 |
| E-02 | 特殊单位换算（枚/升/合/方寸匕） | ✅ | ❌ | 待创建 `DoseConverter.js` | P1 |
| E-03 | 药丸式剂量UI | ✅ | ❌ | 待增强 `LearnView.js` | P2 |
| E-04 | 剂量区域点击不触发卡片切换 | ✅ | ❌ | 待增强 `LearnView.js` | P2 |
| E-05 | 条文系统（slidePanel） | ✅ | ❌ | 待创建 `SlidePanel.js` | P1 |
| E-06 | 分级解锁（条文→刘渡舟→胡希恕→对比） | ✅ | ❌ | 待创建 `SlidePanel.js` | P1 |
| E-07 | 提取练习（Space遮罩） | ✅ | ❌ | 待创建 `SourceQuiz.js` | P2 |
| E-08 | "我的理解"编辑区 | ✅ | ❌ | 待创建 `MyNoteEditor.js` | P2 |
| E-09 | 条文讲解标签（S按钮） | ✅ | ❌ | 待增强 `LearnView.js` | P2 |
| E-10 | 数据融合（formula_cards + source_cards） | ✅ | ❌ | 待创建 `SourceAnnotationService.js` | P1 |

### 功能域 F：临床与SP（v9 缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| F-01 | 标准化病人问诊（SP） | ✅ | ❌ | 待创建 `SPQuestionView.js` | P2 |
| F-02 | 选择式问诊（十问歌） | ✅ | ❌ | 待创建 `InquirySelector.js` | P2 |
| F-03 | L0→L3 信息分层 | ✅ | ❌ | 待创建 `SPResponseEngine.js` | P2 |
| F-04 | SP 作答/反馈 | ✅ | ❌ | 待创建 `SPAnswerView.js` | P2 |
| F-05 | 临床录入系统（两阶段工作流） | ✅ | ❌ | 待创建 `ClinicalEntryView.js` | P2 |
| F-06 | 采集评估（13维度） | ✅ | ❌ | 待创建 `CollectionEvaluator.js` | P2 |
| F-07 | 补采集视图 | ✅ | ❌ | 待创建 `CollectionCollectView.js` | P2 |
| F-08 | 方证匹配（3层） | ✅ | ❌ | 待创建 `FormulaMatcher.js` | P2 |
| F-09 | 临床档案管理 | ✅ | ❌ | 待创建 `ClinicalArchive.js` | P2 |
| F-10 | 档案编码（P-YYYYMMDD-HHMMSS-NNN） | ✅ | ❌ | 待增强 `StorageService.js` | P2 |
| F-11 | 复诊模式 | ✅ | ❌ | 待增强 `ClinicalArchive.js` | P2 |
| F-12 | 复制IMA提示词 | ✅ | ❌ | 待创建 `IMAPromptGenerator.js` | P3 |
| F-13 | 症状对比表格 | ✅ | ❌ | 待创建 `SymptomCompareTable.js` | P3 |
| F-14 | 未确认症状警示 | ✅ | ❌ | 待创建 `MissingSymptomTag.js` | P3 |
| F-15 | 条文联动（临床录入→学习页） | ✅ | ❌ | 待创建 `ClinicalSourceLinkage.js` | P3 |

### 功能域 G：统计与报告（v9 部分缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| G-01 | 基础统计（今日/总答题） | ✅ | ✅ | `StatsService.js` | P0 |
| G-02 | 六经覆盖雷达图 | ✅ | ❌ | 待创建 `RadarChart.js` | P1 |
| G-03 | 学习曲线 | ✅ | ❌ | 待创建 `LearningCurve.js` | P1 |
| G-04 | 掌握度分布 | ✅ | ❌ | 待创建 `MasteryDistribution.js` | P1 |
| G-05 | 混淆矩阵 | ✅ | ❌ | 待创建 `ConfusionMatrix.js` | P2 |
| G-06 | 每日学习报告 | ✅ | ❌ | 待创建 `DailyReport.js` | P2 |
| G-07 | 全局布局对齐（dashboard-container） | ✅ | ❌ | 待增强 CSS | P2 |

### 功能域 H：数据与工具（v9 部分缺失）
| 编号 | 功能模块 | v8 状态 | v9 状态 | 对应 v9 组件/服务 | 优先级 |
|------|----------|---------|---------|-------------------|--------|
| H-01 | 数据加载（fetch JSON） | ✅ | ✅ | `DataService.js` | P0 |
| H-02 | v8→v9 数据迁移 | ✅ | ✅ | `StorageService.js` | P0 |
| H-03 | localStorage 持久化 | ✅ | ✅ | `StorageService.js` | P0 |
| H-04 | 导出数据 | ✅ | ❌ | 待增强 `StorageService.js` | P2 |
| H-05 | 导入数据 | ✅ | ❌ | 待增强 `StorageService.js` | P2 |
| H-06 | 数据验证（governance.py） | ✅ | ✅ | `scripts/governance.py` | P0 |
| H-07 | 备份/恢复 | ✅ | ✅ | `scripts/safe_edit.py` | P0 |
| H-08 | 端口管理（8100/8101） | ✅ | ✅ | `PORT_CONFIG.md` | P0 |

---

## 二、v9 缺失功能清单（按优先级排序）

### P1（PWA MVP 必须完成）
| 编号 | 功能 | 工作量 | 依赖 |
|------|------|--------|------|
| B-01 | 顶部搜索过滤（方名/拼音/标签） | 中 | 无 |
| B-02 | 搜索聚类考试 | 中 | B-01 |
| B-03 | 标签点击聚类 | 小 | 无 |
| C-01 | 错题本增强 | 中 | 无 |
| C-02 | 错题编辑/删除 | 小 | C-01 |
| C-03 | 诊断标签 | 中 | C-01 |
| C-04 | 错题直接问Kimi | 小 | C-03, KimiModal.js |
| D-01 | "再来一组"检索练习 | 大 | C-01, StatsService.js |
| D-02 | 关联学习（一题多向） | 大 | ExamService.js |
| D-03 | 错题画像生成 | 中 | C-01, StatsService.js |
| E-01 | 剂量四标准换算 | 中 | LearnView.js |
| E-02 | 特殊单位换算 | 中 | E-01 |
| E-05 | 条文系统 slidePanel | 大 | 无 |
| E-06 | 分级解锁 | 中 | E-05 |
| E-10 | 数据融合 | 中 | E-05 |
| G-02 | 六经覆盖雷达图 | 中 | StatsService.js |
| G-03 | 学习曲线 | 中 | StatsService.js |
| G-04 | 掌握度分布 | 小 | StatsService.js |

### P2（云端同步前完成）
| 编号 | 功能 | 工作量 | 依赖 |
|------|------|--------|------|
| F-01 | 标准化病人问诊 | 大 | 无 |
| F-02 | 选择式问诊 | 中 | F-01 |
| F-03 | L0→L3 信息分层 | 大 | F-01 |
| F-04 | SP 作答/反馈 | 中 | F-01 |
| F-05 | 临床录入系统 | 大 | 无 |
| F-06 | 采集评估 | 中 | F-05 |
| F-07 | 补采集视图 | 中 | F-05 |
| F-08 | 方证匹配 | 大 | F-05 |
| F-09 | 临床档案管理 | 中 | F-05 |
| B-04 | 浮动按钮 | 小 | 无 |
| B-05 | 智能搜索面板 | 中 | B-01 |
| C-05 | 批量标记错题 | 小 | C-01 |
| C-06 | 诊断标签静默保存 | 小 | C-03 |
| C-07 | 笔记编辑/删除 | 小 | C-01 |
| D-04 | 变体题目生成 | 中 | ExamService.js |
| D-05 | 交错打散 | 小 | ExamService.js |
| E-03 | 药丸式剂量UI | 小 | LearnView.js |
| E-04 | 剂量区域点击不触发切换 | 小 | LearnView.js |
| E-07 | 提取练习 | 中 | E-05 |
| E-08 | "我的理解"编辑区 | 中 | E-05 |
| E-09 | S按钮 | 小 | LearnView.js |
| G-05 | 混淆矩阵 | 中 | StatsService.js |
| G-06 | 每日学习报告 | 小 | StatsService.js |
| G-07 | 全局布局对齐 | 小 | CSS |
| H-04 | 导出数据 | 小 | StorageService.js |
| H-05 | 导入数据 | 小 | StorageService.js |

### P3（Pro 订阅前完成）
| 编号 | 功能 | 工作量 | 依赖 |
|------|------|--------|------|
| F-10 | 档案编码 | 小 | F-09 |
| F-11 | 复诊模式 | 中 | F-09 |
| F-12 | 复制IMA提示词 | 小 | F-05 |
| F-13 | 症状对比表格 | 中 | F-05 |
| F-14 | 未确认症状警示 | 小 | F-05 |
| F-15 | 条文联动 | 中 | F-05, E-05 |

---

## 三、v9 已存在组件/服务详述

### 组件（Components）
| 文件 | 职责 | 状态 |
|------|------|------|
| `CardList.js` | 卡片列表渲染（名称、描述、标签、进度点） | ✅ 完整 |
| `LearnView.js` | 学习视图（原文、症状、药物、剂量、核心药对） | ✅ 基础完整，需增强剂量换算 |
| `ExamView.js` | 考试视图（题目、选项、导航、反馈） | ✅ 完整 |
| `PracticeSummary.js` | 练习总结（统计、错题列表、查看/重做） | ✅ 基础完整，需增强错题本管理 |
| `KimiModal.js` | Kimi导师弹窗（显示prompt） | ✅ 基础完整，需增强错题直接问 |

### 服务（Services）
| 文件 | 职责 | 状态 |
|------|------|------|
| `DataService.js` | 数据加载（fetch JSON、预加载） | ✅ 完整 |
| `ExamService.js` | 出题逻辑（6向量题目生成、选项生成、判分） | ✅ 完整，需增强变体/关联学习 |
| `StorageService.js` | localStorage读写、v8迁移、导出导入 | ✅ 基础完整，需增强错题本/诊断标签 |
| `StatsService.js` | 统计（答题记录、薄弱向量、学习建议） | ✅ 基础完整，需增强画像/曲线 |
| `MasteryService.js` | 掌握度概览（总向量数、已掌握数） | ✅ 完整 |

### 状态（Store）
| 文件 | 职责 | 状态 |
|------|------|------|
| `AppStore.js` | 全局状态管理（订阅/发布模式） | ✅ 完整 |

### 工具（Utils）
| 文件 | 职责 | 状态 |
|------|------|------|
| `dom.js` | DOM 工具（createElement、delegate） | ✅ 完整 |
| `formatters.js` | 格式化（向量标签、选项标签、日期格式化） | ✅ 完整 |
| `random.js` | 随机工具（shuffle） | ✅ 完整 |
| `validators.js` | 验证工具（选项去重检查） | ✅ 完整 |

### 测试（Tests）
| 文件 | 职责 | 状态 |
|------|------|------|
| `appStore.test.js` | AppStore 状态管理测试 | ✅ |
| `dom.test.js` | DOM 工具测试 | ✅ |
| `examService.test.js` | 出题逻辑测试 | ✅ |
| `formatters.test.js` | 格式化工具测试 | ✅ |
| `random.test.js` | 随机工具测试 | ✅ |
| `storageService.test.js` | 存储服务测试 | ✅ |
| `validators.test.js` | 验证工具测试 | ✅ |
| `smoke.spec.js` | E2E 冒烟测试 | ✅ 基础 |

---

## 四、迁移工作量估算

| 功能域 | v9 已有 | v9 缺失 | P1 工作量 | P2 工作量 | 总计 |
|--------|---------|---------|-----------|-----------|------|
| A 核心学习 | 8/8 | 0 | 0 | 0 | 已完成 |
| B 搜索导航 | 0/5 | 5 | 3 | 2 | 中 |
| C 错题记录 | 1/7 | 6 | 4 | 3 | 大 |
| D 检索关联 | 0/5 | 5 | 3 | 2 | 大 |
| E 剂量条文 | 1/10 | 9 | 4 | 5 | 大 |
| F 临床SP | 0/15 | 15 | 0 | 10 | 极大 |
| G 统计报告 | 1/7 | 6 | 3 | 3 | 中 |
| H 数据工具 | 5/8 | 3 | 0 | 3 | 小 |
| **合计** | **16/65** | **49** | **17** | **28** | **中-大** |

> **注**：P1（PWA MVP）需完成 17 个功能模块，P2 需完成 28 个。F域（临床SP）工作量最大，建议拆分到后续阶段。

---

## 五、依赖关系图

```
核心引擎（已完成）
├── ExamService.js ───→ D-01, D-02, D-03, D-04, D-05
├── StorageService.js ──→ C-01~C-07, F-09~F-11
├── StatsService.js ───→ G-02~G-06, D-03
├── DataService.js ───→ E-10, F-01~F-04
└── AppStore.js ─────→ 所有组件

优先链：
ExamService.js → D-01/D-02/D-03 → C-01（错题本）→ C-03（诊断标签）→ C-04（问Kimi）
                              → B-01（搜索）→ B-02/B-03（聚类）
DataService.js → E-10（数据融合）→ E-05（slidePanel）→ E-06（分级解锁）
StorageService.js → C-01（错题本）→ C-02（编辑删除）→ C-03（诊断标签）
```

---

*文档状态：已确认*  
*下次更新：P0 结束后复核*  
*产品名：明医成长录*
