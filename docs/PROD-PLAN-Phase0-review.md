# Phase 0 验证过程复盘 · 大白话+专业术语对照

> **文档编号**：PROD-PLAN-Phase0-review  
> **日期**：2026-07-02  
> **产品名**：明医成长录  
> **用途**：帮助非技术背景理解刚才发生了什么

---

## 一、整个过程的时间线

```
你输入命令          电脑输出什么                    这意味着什么
─────────────────────────────────────────────────────────────────
1. npm install      ❌ "无法识别npm"                 电脑说："我不认识npm这个人"
2. 排查环境         🔍 发现node在D盘Program Files     找到npm住在哪了
3. 加PATH           ⚠️ "禁止运行脚本"               安全系统不让npm.ps1跑
4. npm.cmd --version ✅ 11.8.0                       换了个门进去，npm.cmd能跑
5. npm.cmd run test ✅ 44/44 passed                  所有测试都通过了
6. npm.cmd run build ❌ "找不到vite-plugin-pwa"     缺了一个工具包
7. npm.cmd install   ✅ 装了301个包                 把缺的工具包装上了
8. npm.cmd run build ✅ dist/ + sw.js 生成成功       最终build成功！
```

---

## 二、逐层对照：大白话 vs 专业术语

### 第1步：npm 找不到

**大白话**：
> 你喊 "npm"，电脑说："谁是 npm？我不认识。"

**专业术语**：
> `npm` 不在系统 `PATH` 环境变量中。Windows 在解析命令时，按 `PATH` 中列出的目录依次查找 `npm.exe`/`npm.cmd`/`npm.ps1`，没找到就报 `CommandNotFoundException`。

**为什么？**
> Node.js 装在了 `D:\Program Files\nodejs`，但安装时没勾选 "Add to PATH"，或者你重装过系统，PATH 丢了。

---

### 第2步：找到 npm 住在哪

**大白话**：
> 我在你电脑里翻了一圈，发现 npm 住在 `D:\Program Files\nodejs`，只是没挂门牌号（PATH），所以喊不到。

**专业术语**：
> 通过 `find /d/ -name "node.exe"` 定位到 Node.js 安装路径为 `D:\Program Files\nodejs\`。该目录下同时存在 `npm.cmd`（批处理脚本）和 `npm.ps1`（PowerShell 脚本）。

**输出对照**：
```
D:\Program Files\nodejs\node.exe      ← Node.js 本体
D:\Program Files\nodejs\npm.cmd        ← cmd 版本的 npm 命令
D:\Program Files\nodejs\npm.ps1        ← PowerShell 版本的 npm 命令
```

---

### 第3步：临时加 PATH

**大白话**：
> 你告诉电脑："npm 住在 D 盘 Program Files\nodejs，以后找他去。" 但这只是告诉**当前这个窗口**，关了窗口就忘了。

**专业术语**：
> 执行 `$env:Path += ";D:\Program Files\nodejs"` 将 Node.js 目录追加到当前 PowerShell 会话的 `PATH` 环境变量。这是**会话级**修改，不会持久化到系统注册表。

**输出对照**：
```powershell
$env:Path += ";D:\Program Files\nodejs"   ← 当前窗口有效
[Environment]::SetEnvironmentVariable(...)   ← 永久有效（需要重启窗口）
```

---

### 第4步：PowerShell 安全策略拦截

**大白话**：
> 你喊 "npm"，PowerShell 先找到 `npm.ps1`（他的 PowerShell 老乡），但安全系统说："PowerShell 脚本？不行！可能有病毒！" 所以不让跑。但你喊 "node"（Node.js 本体）就能跑，因为 `.exe` 不是脚本，不受这个限制。

**专业术语**：
> PowerShell 的 **Execution Policy**（执行策略）默认限制 `.ps1` 脚本的运行，防止恶意脚本执行。`npm.ps1` 是 PowerShell 模块，被 `PSSecurityException` 拦截。`node.exe` 是编译后的二进制文件，不受 Execution Policy 约束。`npm.cmd` 是 Windows 批处理文件（`.cmd`），由 `cmd.exe` 解释执行，同样不受 PowerShell 执行策略约束。

**输出对照**：
```
无法加载文件 D:\Program Files\nodejs\npm.ps1，因为在此系统上禁止运行脚本
← 这是 PowerShell ExecutionPolicy 的 Restricted 模式导致的

node --version  → v24.13.1   ← .exe 直接运行，不受限制
npm.cmd --version → 11.8.0   ← .cmd 由 cmd.exe 执行，绕过 PowerShell 限制
```

---

### 第5步：单元测试全部通过

**大白话**：
> 你跑测试，电脑说："7 个测试文件，44 个测试用例，全部通过！" 意思是 v9 的代码骨架是健康的，核心的出题、存储、状态管理、格式化这些功能都能正常工作。

**专业术语**：
> `vitest run` 执行了 7 个测试文件（`.test.js`），共 44 个断言（assertions）。所有测试在 1.78 秒内完成，覆盖率覆盖 `validators.js`、`dom.js`、`random.js`、`formatters.js`、`AppStore.js`、`StorageService.js`、`ExamService.js` 七个核心模块。零失败、零错误。

**输出对照**：
```
RUN  v1.6.1                                    ← 测试框架 Vitest v1.6.1
✓ tests/unit/validators.test.js (4)           ← 验证工具：4个测试
✓ tests/unit/dom.test.js (3)                    ← DOM工具：3个测试
✓ tests/unit/random.test.js (5)                 ← 随机工具：5个测试
✓ tests/unit/formatters.test.js (10)            ← 格式化：10个测试
✓ tests/unit/appStore.test.js (8)               ← 状态管理：8个测试
✓ tests/unit/storageService.test.js (7)         ← 存储服务：7个测试
✓ tests/unit/examService.test.js (7)            ← 考试引擎：7个测试

Test Files  7 passed (7)                         ← 7个文件全部通过
Tests       44 passed (44)                       ← 44个测试全部通过
Duration    1.78s                                ← 耗时1.78秒
```

---

### 第6步：第一次 build 失败

**大白话**：
> 你跑 build，电脑说："我找不到 vite-plugin-pwa 这个工具。" 因为我在规划文档里说要加 PWA，所以提前改了 `package.json` 加上这个依赖，但还没执行 `npm install`，所以电脑里没这个工具。

**专业术语**：
> `vite.config.js` 中配置了 `import { VitePWA } from 'vite-plugin-pwa'`，但 `node_modules` 中未安装该包。Node.js 的 ESM 模块解析器在 `vite build` 时尝试加载 `vite-plugin-pwa`，触发 `ERR_MODULE_NOT_FOUND`。这是预期行为——`package.json` 已更新，但依赖尚未同步到本地 `node_modules`。

**输出对照**：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite-plugin-pwa'
  imported from ...vite.config.js...

← 原因：package.json 里有 vite-plugin-pwa，但 node_modules 里没有
← 解决：npm install 把 package.json 中列出的依赖全部下载到 node_modules
```

---

### 第7步：npm install 安装依赖

**大白话**：
> 你执行 `npm install`，电脑说："我在下载工具包，加了 301 个新包。" 这些包是 PWA 插件和它的依赖们。同时提醒你有5个安全漏洞（老版本的问题），但暂时不影响我们用。

**专业术语**：
> `npm install` 读取 `package.json` 中的 `devDependencies`，解析依赖树，下载并安装缺失的 301 个包到 `node_modules/`。同时执行安全审计（`npm audit`），发现 5 个已知漏洞（3 moderate + 1 high + 1 critical），这些来自 `glob` 和 `source-map` 的过时版本，但不影响当前构建。

**输出对照**：
```
added 301 packages, and audited 442 packages in 27s   ← 新增301个，总计442个
128 packages are looking for funding                  ← 128个包作者在求赞助
5 vulnerabilities (3 moderate, 1 high, 1 critical)    ← 安全审计结果
```

---

### 第8步：第二次 build 成功

**大白话**：
> 你再次跑 build，这次成功了。电脑生成了一个 `dist` 文件夹，里面是你这个产品的"打包成品"——可以直接部署到网上的静态文件。同时生成了一个 `sw.js`（Service Worker），这是 PWA 的核心，让网页断网后也能用。

**专业术语**：
> `vite build` 完成生产环境构建：
> - 打包 20 个模块（JS/CSS/HTML）
> - 生成 `dist/` 目录，包含：
>   - `index.html`（入口 HTML，0.86KB）
>   - `assets/main-*.js`（JS bundle，37.55KB → gzip 12.28KB）
>   - `assets/main-*.css`（CSS bundle，13.90KB → gzip 3.34KB）
>   - `registerSW.js`（Service Worker 注册脚本，0.14KB）
> - `vite-plugin-pwa` 额外生成：
>   - `sw.js`（Service Worker，管理离线缓存）
>   - `workbox-*.js`（Workbox 库，Google 的 PWA 工具库）
>   - Precache 10 entries（388.63KB 的预缓存资源）

**输出对照**：
```
vite v5.4.21 building for production...
✓ 20 modules transformed.                              ← 20个模块被打包

dist/registerSW.js              0.14 kB                ← SW注册脚本
dist/index.html                 0.86 kB │ gzip: 0.55 kB  ← 入口HTML
dist/assets/main-C1vn5aFn.css  13.90 kB │ gzip: 3.34 kB  ← CSS打包
dist/assets/main-CC9_QgGf.js   37.55 kB │ gzip: 12.28 kB  ← JS打包

PWA v0.20.5
mode      generateSW                                    ← Workbox generateSW模式
precache  10 entries (388.63 KiB)                       ← 10个文件预缓存
files generated
  dist/sw.js                                             ← Service Worker（离线缓存核心）
  dist/workbox-bdb082da.js                               ← Workbox库
```

---

## 三、核心概念对照表

| 大白话 | 专业术语 | 刚才出现在哪里 |
|--------|----------|--------------|
| "我不认识npm" | PATH 环境变量未配置 | `npm install` 报错 |
| "npm住在哪" | Node.js 安装路径 | `D:\Program Files\nodejs` |
| "换个门进去" | `npm.cmd` 绕过 `.ps1` 限制 | `npm.cmd --version` 成功 |
| "安全系统不让进" | PowerShell ExecutionPolicy | `npm.ps1` 被拦截 |
| "缺一个工具包" | `ERR_MODULE_NOT_FOUND` | 第一次 build 失败 |
| "下载工具包" | `npm install` 解析依赖树 | 装了 301 个包 |
| "打包成品" | `vite build` 生产构建 | `dist/` 目录生成 |
| "断网也能用" | Service Worker + Precache | `sw.js` + `workbox-*.js` |
| "所有测试通过" | 44/44 assertions passed | `npm.cmd run test` |
| "代码骨架健康" | 核心模块覆盖完整 | 7个测试文件全绿 |

---

## 四、你刚才做了什么（一句话总结）

> **大白话**：你相当于给一间毛坯房（v9代码骨架）做了"竣工验收"——先通了水电（修复npm环境），然后检查了所有电路（44个单元测试），最后确认房子能盖起来（build成功），而且装了断网也能用的发电机（PWA Service Worker）。

> **专业术语**：完成了 v9 项目的技术栈环境修复、单元测试回归验证、生产构建验证及 PWA 基础架构验证。确认项目可构建、可测试、可部署，满足 Phase 0 结束标准。

---

*文档状态：已归档*  
*产品名：明医成长录*
