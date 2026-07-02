# ROUND 1 本地验证指南

> **目标**：在本地环境运行 `npm install + npm run dev + npm run test`，确认 v9 骨架可用。  
> **预计时间**：5–10 分钟（下载依赖）+ 2 分钟（验证）  
> **前提**：本地已安装 Node.js（v18+ 推荐）

---

## 一、验证步骤

### 步骤 1：确认 Node.js 已安装

打开终端（Windows：PowerShell / CMD / Git Bash；Mac/Linux：Terminal），运行：

```bash
node --version
npm --version
```

**预期输出**：
```
v20.x.x
10.x.x
```

**如果提示未找到**：
- 前往 https://nodejs.org 下载 LTS 版本（推荐 v20）
- 安装后重新打开终端再试

---

### 步骤 2：进入 v9 目录

```bash
cd "C:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
```

**注意**：路径中有空格，Windows 用户建议用 PowerShell 并加引号，或直接用文件资源管理器的地址栏复制路径。

---

### 步骤 3：安装依赖

```bash
npm install
```

**预期输出**：
- 下载 `vite`、`vitest`、`jsdom`、`@playwright/test` 等依赖
- 结束时显示：`added X packages in Ys`
- 如果卡住，按 `Ctrl+C` 取消后重试（国内网络可能需要换源，见下方「常见问题」）

---

### 步骤 4：启动开发服务器

```bash
npm run dev
```

**预期输出**：
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

**验证**：
1. 打开浏览器（推荐 Chrome），访问 `http://localhost:5173`
2. 应该看到：
   - 顶部标题栏：「《伤寒论》方剂训练 · v9」+ 右侧「重构版」标签
   - 中间标题：「v9 骨架验证成功」
   - 下方显示：「数据加载：35 张卡片，X/210 向量已掌握」
   - 再下方：5 张卡片列表（桂枝汤、麻黄汤等）

**截图保存**：如果显示正常，请截图保存，后续对比用。

---

### 步骤 5：运行单元测试

**保持 `npm run dev` 运行**，另开一个终端窗口（同一目录），运行：

```bash
npm run test
```

**预期输出**：
```
 ✓ tests/unit/formatters.test.js (28)
 ✓ tests/unit/dom.test.js (4)
 ✓ tests/unit/random.test.js (6)
 ✓ tests/unit/validators.test.js (6)
 ✓ tests/unit/examService.test.js (8)
 ✓ tests/unit/storageService.test.js (7)
 ✓ tests/unit/appStore.test.js (9)

Test Files  7 passed (7)
     Tests  68 passed (68)
```

**如果失败**：
- 请复制失败信息发给我，我会分析并修复
- 常见原因：Node.js 版本过低（v16 以下可能不支持某些语法）

---

### 步骤 6：运行 E2E 测试（可选，Playwright 需要下载浏览器）

```bash
npx playwright install chromium
npm run test:e2e
```

**预期输出**：
```
  3 passed (3.2s)
```

**如果提示缺少 Playwright**：`npx playwright install` 会自动下载，如果网络问题下载失败，可以先跳过这步，后续补装。

---

### 步骤 7：验证掌握度迁移（关键）

1. 在旧系统 `app/index.html` 中做几道练习（答对/答错各几次），让掌握度有变化
2. 打开新系统 `http://localhost:5173`，观察「已掌握」数字是否和旧系统一致
3. 打开浏览器 DevTools（F12）→ Application → Local Storage，确认：
   - `sh_index_v1_state`（旧版数据）**仍然存在**（未删除）
   - `sh_v9_state`（新版数据）**已创建**（迁移成功）

---

## 二、验证通过标准

| 检查项 | 通过标准 | 重要性 |
|--------|----------|--------|
| `npm install` 成功 | 无报错，产生 `node_modules/` 目录 | 🔴 必须 |
| `npm run dev` 成功 | 浏览器打开 `localhost:5173` 显示 v9 页面 | 🔴 必须 |
| 显示 35 张卡片 | 页面上有卡片列表（至少前 5 张） | 🔴 必须 |
| 单元测试通过 | 7 个文件、68 个断言全部通过 | 🟡 强烈建议 |
| 掌握度迁移正确 | 旧版和新版 localStorage 数据一致 | 🟡 强烈建议 |
| E2E 测试通过 | 3 个场景通过 | 🟢 可选 |

---

## 三、常见问题与解决

### Q1：`npm install` 很慢或卡住

**原因**：npm 默认源在国外，国内网络下载慢。  
**解决**：换国内镜像源

```bash
# 临时使用淘宝镜像（仅本次）
npm install --registry=https://registry.npmmirror.com

# 或永久设置
npm config set registry https://registry.npmmirror.com
npm install
```

---

### Q2：`npm run dev` 报错 `Cannot find module 'vite'`

**原因**：`npm install` 没成功，或 `node_modules` 不完整。  
**解决**：
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Q3：浏览器打开页面空白，控制台报错 `Failed to load module script`

**原因**：Vite 要求通过 HTTP 访问（`http://localhost:5173`），不能直接用文件协议打开 `index.html`。  
**解决**：必须通过 `http://localhost:5173` 访问，不要双击打开 HTML 文件。

---

### Q4：测试报错 `localStorage is not defined`

**原因**：Vitest 环境配置问题。  
**解决**：已在 `vitest.config.js` 中设置 `environment: 'jsdom'`，如果仍报错，请检查 Vitest 版本：
```bash
npx vitest --version
# 应显示 v1.x.x，如果低于 v1 请升级
npm install vitest@latest
```

---

### Q5：页面显示「数据加载：0 张卡片」

**原因**：`DataService` 从 `../data/*.json` 加载，但 Vite 开发服务器根目录是 `app/v9/`，`../data/` 实际指向 `app/data/`，路径正确。如果仍失败，可能是网络权限或文件缺失。  
**解决**：
1. 确认 `app/data/formula_cards.json` 存在
2. 打开浏览器 DevTools → Network → 刷新页面，看 `formula_cards.json` 请求是否 404
3. 如果 404，在 `app/v9/vite.config.js` 中添加代理配置（联系我修复）

---

### Q6：Playwright 下载浏览器失败

**原因**：Playwright 需要下载 Chromium 浏览器，国内网络可能失败。  
**解决**：
```bash
# 设置环境变量使用国内镜像（Windows PowerShell）
$env:PLAYWRIGHT_DOWNLOAD_HOST="https://npmmirror.com/mirrors/playwright"
npx playwright install chromium

# 或跳过 E2E 测试，先验证单元测试即可
```

---

## 四、验证结果反馈模板

验证完成后，请按以下格式反馈（方便我快速判断）：

```
验证结果：
- [ ] npm install 成功 / 失败（失败请贴错误）
- [ ] npm run dev 成功 / 失败（失败请贴错误）
- [ ] 浏览器显示正常 / 异常（异常请截图或描述）
- [ ] 单元测试通过 X / 失败 Y（失败请贴错误日志）
- [ ] 掌握度迁移正确 / 异常
- [ ] E2E 测试通过 / 跳过

其他问题：
```

---

## 五、验证后下一步

**验证通过** → 回复「验证通过，进入 ROUND 2」→ 我开始提取 CardList / LearnView / ExamView 组件。

**验证失败** → 回复「验证失败：XXX」+ 错误信息 → 我分析原因并修复，然后再次验证。

**部分通过**（如单元测试通过但 E2E 跳过）→ 回复「部分通过：XXX 跳过」→ 可以进入 ROUND 2，后续补装 Playwright 即可。

---

*祝验证顺利！有问题随时发给我。*
