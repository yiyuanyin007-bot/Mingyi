---
文档编号: SH-SKILL-002-20260702-001
版本: v1.0
日期: 2026-07-02
用途: 会话结束时自动执行——归档状态、备份、验证、清理
关联文档:
  · SH-SKILL-REG-20260702-001 — Skill注册表
  · SH-STATUS-20260702-001 — 状态看板
  · SH-STD-20260702-001 — 文档管理标准
状态: 活跃
变更历史:
  | 日期 | 版本 | 变更人 | 变更内容 | 影响范围 |
  |------|------|--------|----------|----------|
  | 2026-07-02 | v1.0 | AI | 初始Skill定义 | 新建 |
---

# Skill-002: 下班了（Evening Wrap）

> **触发条件**: 用户说"下班了"或"结束会话"或"保存进度"  
> **执行者**: 当前会话的AI  
> **输出**: 会话总结报告 + 归档状态 + 备份 + 验证 + 清理

---

## 一、执行流程

每次会话结束时，按以下顺序执行：

### Step 1: 写会话速记卡

```markdown
文件: logs/session_notes/S-{日期}-{NNN}.md
```

**内容格式**:

```markdown
---
文档编号: S-20260702-001
日期: 2026-07-02
会话类型: 数据层
执行人: AI
---

# 会话速记卡（S-20260702-001）

## 做了什么
- T-001: 制定文档元信息头标准 → 完成
- T-002: 创建STATUS.md → 完成
- T-003: 创建Skill注册表 → 完成

## 产出文件
| 文件 | 路径 | 大小 | 说明 |
|------|------|------|------|
| 文档标准 | docs/standards/document_standard.md | 10KB | 元信息头规范 |
| 状态看板 | docs/STATUS.md | 6KB | 全局状态 |
| Skill注册表 | docs/skills/SKILL_REGISTRY.md | 7KB | 3个Skill已注册 |

## 未解决问题
- 交互层等待Schema交付（T-004/T-005/T-006）
- 第4方审计选方未确认

## 下一步
- 数据层: 继续T-004/T-005/T-006
- 交互层: 等待交付后开发仪表盘+SOP页面
- 用户: 确认第4方审计选方

## 备注
- 无
```

**注意**:
- 文件名格式: `S-{YYYYMMDD}-{NNN}.md`
- 编号递增: 同一天从001开始递增
- 内容简洁: 用列表和表格，不写长段落
- 文件位置: `logs/session_notes/`（需创建目录）

---

### Step 2: 更新 STATUS.md

```markdown
文件: docs/STATUS.md
```

**更新内容**:
- 在"最近完成"表格中新增一行（本次会话完成的任务）
- 在"活跃会话"中更新本对话状态（进行中 → 已完成/待续）
- 如有新增阻塞，写入"当前阻塞"
- 如有状态变化，更新"六经覆盖速览"或"数据资产速览"

**注意**: 不要删除已有内容，只追加/修改。

---

### Step 3: 更新 对话总控看板

```markdown
文件: docs/对话总控看板.md
```

**更新内容**:
- 更新本对话的"当前状态"
- 更新本对话的"已交付文件"
- 如有新增阻塞，写入"跨对话阻塞"
- 如有新增建议，写入"下一步建议"

---

### Step 4: 验证 JSON 合法性

```bash
python scripts/governance.py check-json data/formula_cards.json
python scripts/governance.py check-json data/source_cards.json
python scripts/governance.py check-json data/experience_cards.json
```

**如果 governance.py 不存在**:

```bash
# 手动验证（Python）
python -c "import json; json.load(open('data/formula_cards.json')); print('formula_cards.json: PASS')"
python -c "import json; json.load(open('data/source_cards.json')); print('source_cards.json: PASS')"
python -c "import json; json.load(open('data/experience_cards.json')); print('experience_cards.json: PASS')"
```

**记录结果**: 将验证结果写入会话速记卡。

---

### Step 5: 清理临时文件

```bash
python scripts/governance.py clean-temp
```

**如果 governance.py 不存在**:

```bash
# 手动清理（Bash/PowerShell）
rm -f temp_*.json tmp_*.txt temp_*.md
```

**记录结果**: 删除的文件列表写入会话速记卡。

---

### Step 6: 备份关键文件

```bash
# 备份修改过的文件到对应 archive 目录
# 推荐用 governance.py 自动备份
python scripts/governance.py backup data/formula_cards.json "补全太阴2方"
python scripts/governance.py backup docs/STATUS.md "更新状态"
```

**如果 governance.py 不存在**:

```bash
# 手动备份
cp data/formula_cards.json data/archive/formula_cards_after_YYYYMMDD.json
cp docs/STATUS.md docs/archive/STATUS_after_YYYYMMDD.md
```

**记录结果**: 备份路径写入会话速记卡。

---

### Step 7: 输出会话总结

**输出格式**:

```markdown
## 会话总结（S-20260702-001）

### 完成项
✅ T-001: 制定文档元信息头标准
✅ T-002: 创建STATUS.md
✅ T-003: 创建Skill注册表

### 产出文件
- docs/standards/document_standard.md (10KB)
- docs/STATUS.md (6KB)
- docs/skills/SKILL_REGISTRY.md (7KB)
- docs/skills/SKILL_morning_brief.md (4KB)
- docs/skills/SKILL_evening_wrap.md (4KB)

### 验证结果
- formula_cards.json: PASS
- source_cards.json: PASS
- experience_cards.json: PASS

### 清理结果
- 无临时文件需要清理

### 备份结果
- data/archive/formula_cards_after_20260702.json
- docs/archive/STATUS_after_20260702.md

### 未解决问题
- 交互层等待Schema交付（T-004/T-005/T-006）
- 第4方审计选方未确认

### 下一步（明日）
- 数据层: 继续T-004（学习轨迹Schema）
- 交互层: 等待交付后开发
- 用户: 确认第4方审计选方

### 速记卡位置
logs/session_notes/S-20260702-001.md
```

---

## 二、踩坑与经验（持续更新）

| 日期 | 问题 | 原因 | 解决方案 | 状态 |
|------|------|------|----------|------|
| 2026-07-02 | logs/session_notes/ 目录不存在 | 首次创建 | 先创建目录再写文件 | 已解决 |

---

## 三、变更历史

| 日期 | 版本 | 变更人 | 变更内容 | 影响范围 |
|------|------|--------|----------|----------|
| 2026-07-02 | v1.0 | AI | 初始Skill定义 | 新建 |

---

*本文件按 document_standard.md 标准维护。如有变更，同步更新版本号和变更历史。*
