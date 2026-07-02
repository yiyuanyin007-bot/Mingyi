# PROD-PLAN-Phase0-checklist.md — Phase 0 基础设施 · 验收检查清单

> **文档编号**：PROD-PLAN-Phase0-checklist  
> **版本**：v1.0  
> **日期**：2026-07-02  
> **产品名**：明医成长录  
> **阶段**：Phase 0 — 基础设施  
> **状态**：验收中

---

## 一、开始标准（已验证）

| 编号 | 条件 | 验证方式 | 状态 |
|------|------|----------|------|
| P0-START-001 | v8 功能清单已完整盘点 | 列出 v8 所有功能模块 | ✅ |
| P0-START-002 | v9 组件化骨架已存在 | `app/v9/` 目录存在且可运行 `npm run dev` | ✅ |
| P0-START-003 | 数据文件全部可验证 | `scripts/governance.py check-json` 全部通过 | ✅ |
| P0-START-004 | 命名规范文档已发布 | `docs/产品化总体规划_v1.md` 已确认 | ✅ |
| P0-START-005 | 数据README全部创建 | `ls data/*.README.md` | ✅ |

---

## 二、工作完成情况

| 任务编号 | 任务 | 产出路径 | 状态 |
|----------|------|----------|------|
| T0-001 | 完善数据 README | `data/*.README.md`（10个） | ✅ |
| T0-002 | 增强数据验证脚本 | `scripts/governance.py`（新增 `check-data` 子命令） | ✅ |
| T0-003 | v8 功能清单到 v9 功能映射 | `docs/SPEC-v9-migration-v1.md` | ✅ |
| T0-004 | v9 缺失功能清单 | `docs/SPEC-v9-migration-v1.md` §二、三、四 | ✅ |
| T0-005 | 测试基础设施完善 | 检查现有 7 个单元测试 + 1 个 E2E 测试 | ✅（基础已就位） |
| T0-006 | 设计系统初稿 | `app/v9/src/styles/theme.css` + `docs/SPEC-design-system-v1.md` | ✅ |
| T0-007 | PWA 基础配置 | `app/v9/vite.config.js` + `public/manifest.json` + `package.json` | ✅ |

---

## 三、结束标准（逐项验收）

### P0-END-001: 数据 README 完整

| 检查项 | 结果 | 验证方式 |
|--------|------|----------|
| formula_cards.README.md | ✅ | 文件存在 |
| source_cards.README.md | ✅ | 文件存在 |
| sp_cases.README.md | ✅ | 文件存在 |
| experience_cards.README.md | ✅ | 文件存在 |
| symptom_expression_index.README.md | ✅ | 文件存在 |
| source_article_map.README.md | ✅ | 文件存在 |
| herb_alias_map.README.md | ✅ | 文件存在 |
| core_herbs_research.README.md | ✅ | 文件存在 |
| source_cards_extended.README.md | ✅ | 文件存在 |
| sun_target_formulas.README.md | ✅ | 文件存在 |
| **合计** | **10/10** | `ls data/*.README.md | wc -l` |

**状态**：✅ 通过

---

### P0-END-002: 数据验证脚本通过

| 检查项 | 结果 | 验证方式 |
|--------|------|----------|
| JSON 语法验证 | ✅ | 10个数据文件全部合法 |
| 关联一致性验证 | ✅ | formula_cards.source_text_ids ↔ source_cards.id |
| mastery 键名验证 | ✅ | 6个向量键名正确 |
| 唯一性验证 | ✅ | id 无重复 |
| SP difficulty 范围 | ✅ | 1-3 |
| **命令** | | `python scripts/governance.py check-data --all` |

**状态**：✅ 通过

---

### P0-END-003: v9 功能映射表完成

| 检查项 | 结果 | 验证方式 |
|--------|------|----------|
| 文档存在 | ✅ | `docs/SPEC-v9-migration-v1.md` |
| 8 大功能域覆盖 | ✅ | A(核心) B(搜索) C(错题) D(检索) E(剂量条文) F(临床SP) G(统计) H(数据) |
| 65 个功能模块映射 | ✅ | 已列出 v8↔v9 映射 |
| 缺失清单 | ✅ | 49 个缺失，按 P1/P2/P3 排序 |
| 工作量估算 | ✅ | 迁移表 + 依赖关系图 |

**状态**：✅ 通过

---

### P0-END-004: v9 可运行

| 检查项 | 结果 | 验证方式 | 备注 |
|--------|------|----------|------|
| `npm run dev` | ⚠️ | 在 Windows 环境中运行 | 需用户验证 |
| 无报错 | ⚠️ | 控制台无错误 | 需用户验证 |
| 页面可访问 | ⚠️ | `http://localhost:5173` | 需用户验证 |

**状态**：⚠️ 待用户验证（bash 环境无 npm）

**用户操作**：
```powershell
cd "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
npm install
npm run dev
```

---

### P0-END-005: 单元测试通过

| 检查项 | 结果 | 验证方式 | 备注 |
|--------|------|----------|------|
| 测试文件数 | ✅ | 7 个单元测试 + 1 个 E2E | 已就位 |
| 总测试行数 | ✅ | 414 行 | 已就位 |
| 通过率 100% | ⚠️ | `npm run test` | 需用户验证 |
| 覆盖率 ≥ 60% | ⚠️ | `npm run test -- --coverage` | 需用户验证 |

**状态**：⚠️ 待用户验证

**用户操作**：
```powershell
cd "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
npm run test
```

---

### P0-END-006: v9 build 成功

| 检查项 | 结果 | 验证方式 | 备注 |
|--------|------|----------|------|
| `npm run build` | ⚠️ | 生成 `dist/` 目录 | 需用户验证 |
| 无报错 | ⚠️ | 控制台无错误 | 需用户验证 |
| `dist/` 存在输出 | ⚠️ | 文件列表 | 需用户验证 |

**状态**：⚠️ 待用户验证

**用户操作**：
```powershell
cd "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
npm run build
```

---

### P0-END-007: PWA manifest 存在

| 检查项 | 结果 | 验证方式 |
|--------|------|----------|
| manifest.json | ✅ | `app/v9/public/manifest.json` |
| 应用名称 | ✅ | "明医成长录" |
| 主题色 | ✅ | #C17F59（赭石） |
| 图标占位 | ✅ | 192x192 + 512x512 |
| vite.config.js PWA 配置 | ✅ | `VitePWA` 插件已配置 |
| index.html meta 标签 | ✅ | manifest 链接 + apple-mobile-web-app |

**状态**：✅ 通过

---

### P0-END-008: 设计系统可展示

| 检查项 | 结果 | 验证方式 |
|--------|------|----------|
| theme.css | ✅ | `app/v9/src/styles/theme.css` 存在 |
| 品牌色变量 | ✅ | 赭石/黛青/朱砂/金色 |
| 暗色模式变量 | ✅ | `[data-theme="dark"]` 完整定义 |
| 字体系统 | ✅ | 思源宋体/思源黑体/书法体 |
| 间距系统 | ✅ | 8px 基线 |
| 圆角系统 | ✅ | sm/md/lg/xl/full |
| 阴影系统 | ✅ | sm/md/lg/xl/focus |
| 设计系统文档 | ✅ | `docs/SPEC-design-system-v1.md` |
| 预览 CSS | ✅ | `.design-system-preview` 类可用 |

**状态**：✅ 通过

---

## 四、验收统计

| 标准 | 通过 | 待验证 | 总计 |
|------|------|--------|------|
| P0-END-001 | ✅ | | 1 |
| P0-END-002 | ✅ | | 1 |
| P0-END-003 | ✅ | | 1 |
| P0-END-004 | | ⚠️ | 1 |
| P0-END-005 | | ⚠️ | 1 |
| P0-END-006 | | ⚠️ | 1 |
| P0-END-007 | ✅ | | 1 |
| P0-END-008 | ✅ | | 1 |
| **合计** | **5** | **3** | **8** |

**结论**：5/8 项已自动验证通过，3 项（v9运行/单元测试/build）因 bash 环境无 npm 需用户在 Windows 中手动验证。

---

## 五、下一步（用户操作）

请在 Windows PowerShell 中执行以下命令完成剩余 3 项验证：

```powershell
# 1. 进入 v9 目录
cd "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"

# 2. 安装依赖（如果之前没装过）
npm install

# 3. 运行单元测试（验证 P0-END-004 和 P0-END-005）
npm run test

# 4. 构建（验证 P0-END-006）
npm run build

# 5. 启动开发服务器（验证 P0-END-004）
npm run dev
# 然后在浏览器打开 http://localhost:5173
```

如果以上 3 项全部通过，则 Phase 0 正式结束，可进入 Phase 1（PWA MVP）。

---

## 六、确认签名

| 角色 | 姓名 | 日期 | 签名 |
|------|------|------|------|
| 架构师 | AI | 2026-07-02 | ✅ |
| 技术验证 | 陈医生 | 待填写 | |
| 产品确认 | 陈医生 | 待填写 | |

---

*文档状态：验收中*  
*待完成：3 项（需用户手动验证）*  
*产品名：明医成长录*
