# mock_cards/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 5
> **用途**: 经方学习系统的 Mock 方剂卡片，用于开发和测试阶段的卡片渲染验证。每个 JSON 文件对应一首标准《伤寒论》方剂

## 快速索引

| 文件 | 方剂 | 状态 |
|------|------|------|
| `da-cheng-qi-tang.json` | 大承气汤（阳明腑实证峻下热结） | ✅ 稳定 |
| `ge-gen-tang.json` | 葛根汤（太阳病项背强几几） | ✅ 稳定 |
| `gui-zhi-tang.json` | 桂枝汤（太阳中风证） | ✅ 稳定 |
| `ma-huang-tang.json` | 麻黄汤（太阳伤寒证） | ✅ 稳定 |
| `xiao-chai-hu-tang.json` | 小柴胡汤（少阳病证） | ✅ 稳定 |

## 连接关系图

```
mock_cards/
├── *.json ──────────→ app/shanghanlun-v8-mvp.html（前端渲染调试）
│                       └→ app/v9/（Vue 组件开发调试）
│                       └→ scripts/test_phase1*.py（测试数据源）
│                       └→ scripts/click_card.py（卡片点击测试）
```

**卡片 Schema**: 遵循 `schemas/prescription_sop.json` 定义的方剂标准操作规程格式。

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
