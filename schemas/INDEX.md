# schemas/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 4（2 JSON Schema + 2 接口文档）
> **用途**: 经方学习系统的核心数据 Schema 定义，规定方剂卡片和用户学习轨迹的结构标准

## 快速索引

| 文件 | 功能 | 连接（被谁使用） | 状态 |
|------|------|------------------|------|
| `prescription_sop.json` | 方剂标准操作规程 JSON Schema（定义卡片结构和字段规范） | `data/formula_cards.json`、`mock_cards/*.json`、`scripts/card_manager.py` | ✅ 稳定 |
| `prescription_sop_interface.md` | 方剂 SOP 接口文档（人类可读的 Schema 说明） | `scripts/card_manager.py`、开发文档 | ✅ 稳定 |
| `learning_trajectory.json` | 学习轨迹 JSON Schema（定义用户学习路径记录格式） | `data/*.json` 学习记录 | ✅ 稳定 |
| `learning_trajectory_interface.md` | 学习轨迹接口文档（人类可读的 Schema 说明） | 开发文档 | ✅ 稳定 |

## 连接关系图

```
schemas/
├── prescription_sop.json ─────────→ data/formula_cards.json（数据 Schema 验证）
│                                     └→ mock_cards/*.json（Mock 数据 Schema）
│                                     └→ scripts/card_manager.py（卡片创建/校验）
└── learning_trajectory.json ──────→ data/*.json（学习轨迹记录）
                                      └→ scripts/daily_review.py（复习追踪）
```

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
