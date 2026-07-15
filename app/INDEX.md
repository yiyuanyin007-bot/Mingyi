# app/ 索引

> **最后更新**: 2026-07-11
> **文件数**: 212（含 v9/ 前端工程 + archive/ 备份）
> **用途**: 经方学习系统前端应用，包含 3 个主要版本（v7/v8/v9）+ 原型设计 + 截图素材

## 快速索引

### 主版本文件

| 文件 | 版本 | 说明 | 状态 |
|------|------|------|------|
| `shanghanlun-v8-mvp.html` | v8 MVP | **当前主版本**，单 HTML 应用，含方剂卡片/学习/SP 考试功能 | ✅ 当前 |
| `shanghanlun-v7-db.html` | v7 数据库版 | 旧版数据库驱动版本，含 localStorage 存储 | 🗑 旧版 |
| `index.html` | — | 入口页面（可能与 v8 同步） | ✅ 当前 |
| `mobile.html` | — | 移动端优化的 HTML 版本 | ✅ 当前 |

### v9 Vite+Vue 重构版

| 文件/目录 | 说明 | 状态 |
|-----------|------|------|
| `v9/index.html` | Vite 入口 | 🔄 重构中 |
| `v9/src/` | Vue 组件源码 | 🔄 重构中 |
| `v9/package.json` | Node 依赖（Vite+Vue+Playwright） | 🔄 重构中 |
| `v9/vite.config.js` | Vite 配置 | 🔄 重构中 |
| `v9/vercel.json` | Vercel 部署配置 | 🔄 重构中 |
| `v9/dist/` | 构建输出 | 🔄 重构中 |
| `v9/src/services/NoteService.js` | 统一笔记存储服务（合并 exam/card/source 三种笔记类型） | ✅ 新增 |
| `v9/src/components/NoteEditor.js` | 笔记浮窗编辑器（Markdown 编辑/预览、标签管理） | ✅ 新增 |
| `v9/src/components/NoteListView.js` | 全部笔记列表页（搜索、类型筛选、空状态） | ✅ 新增 |
| `v9/DEPLOY-VERIFY-REPORT.md` | 部署验证报告 | 📝 新增 |
| `v9/VERCEL-DEPLOY.md` | Vercel 部署指南 | 📝 新增 |

### 原型文件

| 文件 | 功能 | 状态 |
|------|------|------|
| `prototype-data-management.html` | 数据管理原型 | ✅ 原型 |
| `preview-references-A.html` | 参考文献预览 A | ✅ 原型 |
| `preview-references-B.html` | 参考文献预览 B | ✅ 原型 |
| `preview-references-C.html` | 参考文献预览 C | ✅ 原型 |
| `sp-preview.html` | 标准化病人功能预览 | ✅ 原型 |
| `restore_notes.html` | 笔记恢复工具 | ✅ 原型 |

### 工具/资源文件

| 文件 | 功能 | 状态 |
|------|------|------|
| `tag-system.js` | 标签系统 JS（卡片标签分类/筛选） | ✅ 稳定 |
| `herb-aliases.js` | 草药别名 JS（前端用别名映射） | ✅ 稳定 |
| `assets/` | 资源文件目录 | ✅ 稳定 |
| `design/` | 设计稿目录 | ✅ 稳定 |

### 外部内容快照

| 文件 | 来源 | 状态 |
|------|------|------|
| `baidu_baijia_zhongfeng.txt` | 百度百家号·中风 | 🗑 参考 |
| `baidu_health_shuiniao.txt` | 百度健康·水鸟 | 🗑 参考 |
| `baidu_health_taiyang.txt` | 百度健康·太阳 | 🗑 参考 |
| `zhihu_article_taiyang_c.txt` | 知乎文章·太阳病 C | 🗑 参考 |

### 截图

| 文件 | 内容 |
|------|------|
| `screenshot_card_bottom.png` | 卡片底部截图 |
| `screenshot_card_detail.png` | 卡片详情截图 |
| `screenshot_dashboard.png` | 仪表盘截图 |
| `screenshot_dashboard_bottom.png` | 仪表盘底部截图 |
| `screenshot_exam.png` | 考试模式截图 |
| `screenshot_zhihu_article.png` | 知乎文章引用截图 |

### 备份（archive/）

| 内容 | 说明 |
|------|------|
| `index-before-*.html`（38 个备份） | 功能迭代前的主 HTML 备份，命名含时间戳和变更说明 |

## 版本演进关系

```
v7（数据库版）────────→ v8（单 HTML MVP）────────→ v9（Vite+Vue 重构）
   shanghanlun-v7-db.html    shanghanlun-v8-mvp.html    v9/src/（组件化）
                              ├→ index.html
                              ├→ mobile.html
                              └→ tag-system.js + herb-aliases.js
```

## 数据流向

```
data/*.json ──────→ shanghanlun-v8-mvp.html（卡片+SP 案例渲染，localStorage 缓存）
scripts/*.py ──────→ shanghanlun-v8-mvp.html（测试注入/自动化操作）
.agents/skills/ ───→ v9/（Vue 组件引用的 Skill 数据）
```

## 变更历史

| 日期 | 变更人 | 变更内容 |
|------|--------|----------|
| 2026-07-11 | AI 助手 | 初始索引创建 |
| 2026-07-14 | AI 助手 | 新增 v9 笔记系统文件索引（NoteService.js、NoteEditor.js、NoteListView.js） |
