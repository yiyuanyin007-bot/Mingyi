# config/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 2
> **用途**: 经方学习系统的学习范围配置，定义当前聚焦的《伤寒论》方剂子集

## 快速索引

| 文件 | 功能 | 连接（被谁使用） | 状态 |
|------|------|------------------|------|
| `scope_伤寒论常用方.txt` | 伤寒论常用方范围定义（基础学习范围） | `scripts/daily_review.py`、`scripts/session_start.py`、`scripts/qc_full_scan.py` | ✅ 稳定 |
| `scope_桂枝类方.txt` | 桂枝类方扩展学习范围 | `scripts/daily_review.py`、`scripts/session_start.py` | ✅ 稳定 |

## 连接关系图

```
config/
├── scope_伤寒论常用方.txt ──→ scripts/daily_review.py（加载学习范围）
│                               └→ scripts/session_start.py（启动检查）
│                               └→ scripts/qc_full_scan.py（质检范围）
└── scope_桂枝类方.txt ────→ scripts/daily_review.py
                                └→ scripts/session_start.py
```

**加载机制**: 脚本通过读取 `config/scope_*.txt` 确定当前学习范围，控制卡片展示和复习内容。

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
