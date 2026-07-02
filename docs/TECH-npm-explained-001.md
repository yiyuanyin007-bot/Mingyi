# npm 到底在做什么 · 大白话完全解读

> **文档编号**：TECH-npm-explained-001  
> **日期**：2026-07-02  
> **产品名**：明医成长录  
> **用途**：帮助非程序员理解 npm 的本质

---

## 一、一句话

> **npm 是 "装修队的管家"，它负责三件事：**
> 1. **看清单**（看 `package.json` 里需要哪些工具）
> 2. **买工具**（去网上仓库下载，放到 `node_modules`）
> 3. **叫工人干活**（按清单上的名字，喊对应的工具来执行）

---

## 二、先理解一个类比：装修房子

### 类比：你开了一家面馆（明医成长录）

```
你的面馆 = 明医成长录（网页应用）

厨房里需要这些工具：
- 切菜机（Vite）—— 把食材切好、打包
- 质检仪（Vitest）—— 检查每道菜是否合格
- 外卖系统（vite-plugin-pwa）—— 让客人断网也能看菜单
- 量杯（jsdom）—— 精确量取配料

但这些工具不是你亲手做的，是市场上买的。
npm 就是那个帮你采购、管理、调用这些工具的管家。
```

---

## 三、npm 的三个核心文件/目录

| 东西 | 大白话 | 刚才在哪里出现 |
|------|--------|---------------|
| `package.json` | **购物清单** —— 写了你需要哪些工具、每个工具什么版本 | `app/v9/package.json` |
| `node_modules` | **工具仓库** —— 所有工具买回来放在这里 | `app/v9/node_modules/`（127个文件夹） |
| `package-lock.json` | **精确版本锁** —— 记录每个工具的确切版本，确保下次买的一模一样 | `app/v9/package-lock.json` |

### 你的购物清单长什么样？

```json
{
  "name": "shanghanlun-v9",
  "version": "9.0.0",
  "description": "明医成长录 v9 — 模块化重构版",
  
  // ===== 这是"叫工人干活"的指令本 =====
  "scripts": {
    "dev": "vite --host",           ← 喊："Vite，启动开发服务器！"
    "build": "vite build",          ← 喊："Vite，打包生产版本！"
    "test": "vitest run",           ← 喊："Vitest，跑所有测试！"
    "test:e2e": "playwright test",  ← 喊："Playwright，跑端到端测试！"
    "build:pwa": "vite build && npx workbox generateSW workbox-config.js"
                                    ← 喊："先打包，再生成PWA缓存！"
  },
  
  // ===== 这是"需要买的工具"列表 =====
  "devDependencies": {
    "vite": "^5.0.0",                    ← 切菜机（打包工具）
    "vitest": "^1.0.0",                  ← 质检仪（测试框架）
    "jsdom": "^24.0.0",                  ← 量杯（浏览器模拟环境）
    "@playwright/test": "^1.40.0",      ← 全店质检（浏览器自动化测试）
    "vite-plugin-pwa": "^0.20.0"        ← 外卖系统（PWA离线缓存）
  }
}
```

> **注意**：`^5.0.0` 的意思是 "5.0.0 或兼容的更高版本"（如 5.4.21）。`^` 是 npm 的版本号语法，表示"兼容升级"。

---

## 四、刚才每一步 npm 命令到底做了什么？

### 第1步：`npm.cmd install`

**大白话**：
> 你告诉管家："按购物清单，把缺的东西全部买回来！"

**发生了什么**：
> 1. npm 读取 `package.json` 里的 `devDependencies`
> 2. 发现清单里有5个工具（Vite、Vitest、jsdom、Playwright、vite-plugin-pwa）
> 3. 检查 `node_modules`：发现前4个已存在，但 `vite-plugin-pwa` 缺了（因为之前清单里没有）
> 4. npm 去 npm registry（npmjs.com，网上的公共仓库）下载 `vite-plugin-pwa` 
> 5. 同时发现 `vite-plugin-pwa` 自己还依赖其他工具（比如 `workbox`），于是一并下载
> 6. 最终下载了 **301 个新包**（主工具 + 它的依赖们）
> 7. 全部放到 `node_modules/` 里
> 8. 更新 `package-lock.json`，记录每个包的精确版本

**输出对照**：
```
added 301 packages, and audited 442 packages in 27s

↑ 大白话：买了301个新工具，现在仓库里总共有442个工具
↑ 专业术语：npm 解析了依赖树，发现需要新增 301 个 transitive dependencies
   （transitive = 不只是直接依赖，还包括依赖的依赖、依赖的依赖的依赖...）

5 vulnerabilities (3 moderate, 1 high, 1 critical)

↑ 大白话：npm 做了安全扫描，发现这些工具里有5个已知的安全漏洞
   但暂时不影响我们用（可以后续升级修复）
```

---

### 第2步：`npm.cmd run test`

**大白话**：
> 你告诉管家："按清单上的指令，叫质检仪来检查所有菜品！"

**发生了什么**：
> 1. npm 看 `package.json` 的 `scripts` 里 `"test": "vitest run"`
> 2. npm 去 `node_modules/` 找 `vitest` 这个工具
> 3. 喊 `vitest run`："Vitest，去跑测试！"
> 4. Vitest 扫描 `tests/` 目录，找到 7 个 `.test.js` 文件
> 5. 逐个执行每个文件里的测试函数（用 `describe`/`it`/`expect` 定义）
> 6. 44 个测试全部通过

**输出对照**：
```
RUN  v1.6.1  D:/.../app/v9

✓ tests/unit/validators.test.js (4)        ← 检查"选项去重"逻辑，4个测试
✓ tests/unit/dom.test.js (3)               ← 检查"DOM生成"逻辑，3个测试
✓ tests/unit/random.test.js (5)            ← 检查"随机打乱"逻辑，5个测试
✓ tests/unit/formatters.test.js (10)       ← 检查"格式化"逻辑，10个测试
✓ tests/unit/appStore.test.js (8)          ← 检查"状态管理"逻辑，8个测试
✓ tests/unit/storageService.test.js (7)    ← 检查"存储"逻辑，7个测试
✓ tests/unit/examService.test.js (7)       ← 检查"出题引擎"逻辑，7个测试

Test Files  7 passed (7)                     ← 7个文件全部通过
Tests       44 passed (44)                   ← 44个测试全部通过
Duration    1.78s                            ← 总共花了1.78秒
```

---

### 第3步：`npm.cmd run build`

**大白话**：
> 你告诉管家："按清单上的指令，叫切菜机把食材打包成外卖盒！"

**发生了什么**：
> 1. npm 看 `package.json` 的 `scripts` 里 `"build": "vite build"`
> 2. 喊 `vite build`："Vite，把源代码打包成可以上线的网页！"
> 3. Vite 开始工作：
>    - 读取 `src/` 目录下的所有 JS/CSS/HTML
>    - 把代码合并、压缩、优化（去掉注释、空格、未使用的代码）
>    - 把 `import` 的模块关系解析成可以直接在浏览器跑的代码
>    - 生成 `dist/` 目录（这就是最终产品）
> 4. `vite-plugin-pwa` 额外工作：
>    - 生成 `sw.js`（Service Worker，断网缓存控制器）
>    - 生成 `workbox-*.js`（Google的PWA工具库）
>    - 把关键文件标记为 "precache"（首次加载就缓存，保证离线可用）

**输出对照**：
```
vite v5.4.21 building for production...
✓ 20 modules transformed.

↑ 大白话：Vite 读取了 20 个代码模块，把它们转换成生产版本
↑ 专业术语：Vite 的 Rollup 打包引擎处理了 20 个 ESM 模块，
   执行了 tree-shaking（摇树优化，去掉未使用的代码）、
   code-splitting（代码分割）、minification（压缩）

dist/index.html                 0.86 kB   ← 入口HTML（压缩后0.86KB）
dist/assets/main-C1vn5aFn.css  13.90 kB   ← CSS样式（压缩后13.9KB）
dist/assets/main-CC9_QgGf.js   37.55 kB   ← JS代码（压缩后37.5KB）

↑ 大白话：最终的"外卖盒"做好了，总共约52KB（gzip后更小）
↑ 专业术语：打包产物包括 HTML entry、CSS bundle、JS bundle，
   均通过 content-hash 命名（如 main-C1vn5aFn.css），
   用于长期缓存（浏览器只要文件名不变就永远缓存）

PWA v0.20.5
mode      generateSW
precache  10 entries (388.63 KiB)
files generated
  dist/sw.js
  dist/workbox-bdb082da.js

↑ 大白话：PWA管家也干活了，生成了"断网也能用"的缓存控制器
↑ 专业术语：Workbox 在 generateSW 模式下生成 Service Worker，
   预缓存了 10 个资源（388KB），包括 JS/CSS/HTML/data 文件。
   sw.js 会在浏览器后台运行，拦截网络请求，优先从缓存读取。
```

---

## 五、为什么第一次 build 失败？

### 场景回顾

```
第一轮：
  你：npm run build
  电脑：❌ "找不到 vite-plugin-pwa"
  
第二轮：
  你：npm install
  电脑：✅ 装了301个包
  
第三轮：
  你：npm run build
  电脑：✅ 成功！
```

### 为什么会失败？

**大白话**：
> 我在做总体规划时，决定给面馆加一个"外卖系统"（PWA）。于是我在购物清单（`package.json`）上写下了 "vite-plugin-pwa"。但**清单归清单，仓库里还没有这个工具**。你直接喊管家 "打包！"，管家去工具仓库一看，"外卖系统"没在货架上，就报错说找不到。

> 然后你喊 "install!"，管家说："好，我去市场把这个外卖系统买回来！" 买回来之后，你再喊 "打包！"，这次工具齐全，就成功了。

**专业术语**：
> `package.json` 被修改后（新增 `vite-plugin-pwa` 到 `devDependencies`），`node_modules` 尚未同步。`vite.config.js` 通过 `import { VitePWA } from 'vite-plugin-pwa'` 尝试加载该模块，Node.js 的 ESM 解析器在 `node_modules` 中找不到对应模块，抛出 `ERR_MODULE_NOT_FOUND`。执行 `npm install` 后，npm 从 registry 下载并安装缺失的依赖及其传递依赖，完成 `node_modules` 同步。再次执行 `npm run build` 时，所有依赖已就位，构建成功。

---

## 六、核心概念速查表

| 名词 | 大白话 | 专业术语 | 位置 |
|------|--------|----------|------|
| npm | 管家 | Node Package Manager | 系统命令 |
| package.json | 购物清单 | Project manifest / dependency manifest | 项目根目录 |
| node_modules | 工具仓库 | Installed dependency directory | 项目根目录 |
| package-lock.json | 精确版本锁 | Lockfile for deterministic installs | 项目根目录 |
| npm install | 按清单采购 | Install dependencies from registry | 执行命令 |
| npm run test | 叫质检仪检查 | Execute test script via Vitest | 执行命令 |
| npm run build | 叫切菜机打包 | Execute build script via Vite | 执行命令 |
| npm registry | 网上购物商城 | Public package repository (npmjs.com) | 远程服务器 |
| devDependencies | 开发工具 | Development-only dependencies | package.json 字段 |
| scripts | 指令本 | Named command shortcuts | package.json 字段 |
| Vite | 切菜机+打包机 | Modern frontend build tool | devDependencies |
| Vitest | 质检仪 | Unit testing framework | devDependencies |
| vite-plugin-pwa | 外卖系统 | PWA plugin for Vite | devDependencies |
| Service Worker | 断网缓存控制器 | Browser background script for caching | 生成产物 `sw.js` |

---

## 七、你现在不需要记住什么

你只需要记住：

1. **`npm install`** = 按清单买工具（第一次用项目/加了新工具时执行）
2. **`npm run test`** = 检查代码是否健康（改了代码后执行）
3. **`npm run build`** = 打包成可上线的网页（准备发布时执行）
4. 如果加了新工具但 build 失败，先 `npm install` 再 build

---

*文档状态：已归档*  
*产品名：明医成长录*
