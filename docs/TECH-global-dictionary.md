# 全局术语字典 · 明医成长录

> **文档编号**：TECH-global-dictionary  
> **版本**：v1.0  
> **创建日期**：2026-07-02  
> **最后更新**：2026-07-02  
> **术语总数**：50  
> **排序**：按英文首字母 A-Z  
> **产品名**：明医成长录

---

> **使用说明**：本字典为跨阶段、跨操作的累积术语知识库。每次技术操作后，新术语自动追加，已存在术语更新出现次数。按英文首字母排序，同一首字母下按术语全称字母顺序排列。

---

## A

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Assertion | 测试中的验证断言 | 质检仪的检查标准——"这个结果必须等于3" | TECH-npm-explained-20260702 | Vitest, test | 1 |

## B

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Build | 生产环境构建 | 切菜机把食材切好、打包成外卖盒 | TECH-npm-explained-20260702 | Vite, dist, bundle | 2 |
| Bundle | 打包后的代码集合 | 外卖盒——所有东西装在一起 | TECH-npm-explained-20260702 | build, Vite | 1 |

## C

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| CMD | Windows 批处理脚本 | Windows 的"命令脚本"，和 PowerShell 是两套系统 | TECH-npm-explained-20260702 | PowerShell, npm | 1 |
| Content-Hash | 内容哈希命名 | 文件名里加一串指纹数字，内容变了名字就变了，浏览器就知道重新下载 | TECH-npm-explained-20260702 | build, cache | 1 |
| CRUD | Create Read Update Delete | 数据库的四大操作：增删改查 | TECH-npm-explained-20260702 | database, API | 1 |
| Chart.js | JavaScript 图表库 | 专门在网页上画图表的工具——雷达图、折线图、饼图都能画 | 统计图表v9重构 | radar, line, bar | 1 |

## D

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| DevDependencies | 开发依赖 | 开发时需要的工具（如切菜机），但客人吃不到（运行时不需要） | TECH-npm-explained-20260702 | package.json, npm install | 1 |
| Dist | 分发目录（Distribution） | 最终打包好的"外卖盒"，可以直接送到网上 | TECH-npm-explained-20260702 | build, Vite | 1 |
| Diagnosis Tag | 诊断标签 | 给错题贴标签——"类方混淆""知识缺口"等，帮助分类薄弱点 | 错题本v9重构 | confusion, gap, reverse, mistake | 1 |
| Dose Converter | 剂量换算器 | 把古代剂量（两/钱/铢）换算成现代克数的工具 | 剂量换算v9重构 | liang, jin, zhu, gram | 1 |

## E

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| ESM | ECMAScript Modules | JavaScript 的"模块化标准"——把代码分成小文件，需要时再导入 | TECH-npm-explained-20260702 | import, module, Node.js | 1 |
| ERR_MODULE_NOT_FOUND | 模块找不到错误 | 管家去仓库找工具，发现货架上空的——工具没买 | TECH-npm-explained-20260702 | npm install, node_modules | 1 |
| ExecutionPolicy | PowerShell 执行策略 | PowerShell 的"安全门禁"——不让随便跑脚本，怕有病毒 | TECH-npm-explained-20260702 | PowerShell, npm.ps1 | 1 |
| Event Delegation | 事件委托 | 把事件监听器放在父元素上，让子元素触发时统一处理——省内存、省绑定 | 搜索系统v9重构 | DOM, click, listener | 1 |

## F

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Focus Ring | 焦点环 | 键盘操作时看到的蓝色/金色边框，告诉你"现在焦点在这里" | SPEC-design-system-v1 | CSS, shadow-focus | 1 |
| Fuzzy Matching | 模糊匹配 | 不用输全名，"桂枝"就能找到"桂枝汤"——像模糊搜索联系人 | 搜索系统v9重构 | search, filter | 1 |

## G

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| GenerateSW | 生成 Service Worker | Workbox 的自动模式——"你告诉我缓存什么，我帮你写缓存代码" | TECH-npm-explained-20260702 | Workbox, PWA, Service Worker | 1 |
| Gzip | 文件压缩算法 | 把文件压得更小，网速慢也能快速下载 | TECH-npm-explained-20260702 | build, bundle | 1 |
| GraphQL | 查询语言/API 协议 | 一种比 REST 更灵活的数据请求方式 | 产品化总体规划 | API, REST | 1 |

## H

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Hash | 哈希/指纹 | 内容的唯一身份证号——内容变一点点，指纹就变 | TECH-npm-explained-20260702 | content-hash, build | 1 |
| Highlight | 高亮 | 把搜索匹配到的文字用彩色背景标出来，让用户一眼看到 | 搜索系统v9重构 | search, CSS | 1 |

## I

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Import | 导入/引入 | 从别的文件"借"代码来用 | TECH-npm-explained-20260702 | ESM, module, export | 1 |
| IndexedDB | 浏览器结构化数据库 | 浏览器里的"大仓库"，能存比 localStorage 多得多、复杂得多的数据 | 产品化总体规划 | localStorage, PWA | 1 |

## J

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| JSDOM | 浏览器 DOM 模拟器 | 在 Node.js 里假装自己是浏览器——测试时不用真打开浏览器 | TECH-npm-explained-20260702 | Vitest, test | 1 |

## L

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Lighthouse | 网页性能评估工具 | Google 的"网页体检仪"——给网页打分（速度、可访问性、SEO、PWA） | 产品化总体规划 | PWA, Performance | 1 |
| LocalStorage | 浏览器本地存储 | 浏览器里的"小抽屉"——能存几MB数据，关了网页还在 | TECH-npm-explained-20260702 | IndexedDB, PWA | 1 |
| Learning Curve | 学习曲线 | 记录每天答题量的折线图——像股票走势图一样看学习进度 | 统计图表v9重构 | chart, trend, daily | 1 |

## M

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Manifest.json | PWA 配置文件 | PWA 的"身份证"——告诉浏览器"我是谁、图标长什么样、主题色是什么" | TECH-npm-explained-20260702 | PWA, Service Worker | 1 |
| Minification | 代码压缩 | 把代码里的空格、注释、换行全去掉，让文件更小 | TECH-npm-explained-20260702 | build, Vite, gzip | 1 |
| Mastery Distribution | 掌握度分布 | 统计每个向量（方名→症状、症状→方名等）的掌握率条形图 | 统计图表v9重构 | vector, bar, chart | 1 |
| Module | 模块 | 代码的"独立小单元"——一个文件做一件事，需要时导入 | TECH-npm-explained-20260702 | ESM, import, export | 1 |

## N

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Node.js | JavaScript 运行时 | 让 JavaScript 能在电脑（不是浏览器）上运行的引擎 | TECH-npm-explained-20260702 | npm, Vite, ESM | 1 |
| NPM | Node Package Manager | Node.js 的"管家"——负责买工具、叫工具干活 | TECH-npm-explained-20260702 | Node.js, package.json, node_modules | 2 |
| NPM Install | 安装依赖 | 管家按购物清单去网上商城买工具，放到仓库里 | TECH-npm-explained-20260702 | npm, package.json, node_modules | 1 |
| NPM Registry | npm 公共仓库 | 网上的"工具商城"——所有人都可以上传和下载工具 | TECH-npm-explained-20260702 | npm, npm install | 1 |
| NPM Run | 执行脚本 | 管家按购物清单上的"指令本"，喊对应的工具来干活 | TECH-npm-explained-20260702 | npm, scripts, package.json | 1 |
| Node_Modules | 依赖安装目录 | 管家的"工具仓库"——所有买回来的工具都放在这里 | TECH-npm-explained-20260702 | npm, npm install, package.json | 1 |

## P

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Package.json | 项目配置清单 | 项目的"购物清单"——写什么工具、什么版本、怎么干活 | TECH-npm-explained-20260702 | npm, node_modules, package-lock.json | 1 |
| Package-Lock.json | 依赖版本锁定文件 | 购物清单的"精确版"——记录每个工具的确切版本，下次买一模一样 | TECH-npm-explained-20260702 | package.json, npm install | 1 |
| PATH | 系统环境变量 | 电脑的"地址簿"——找命令时按地址簿里的地址一个个去找 | TECH-npm-explained-20260702 | Node.js, npm, cmd | 1 |
| Playwright | 浏览器自动化测试 | 能自动操控真浏览器的"机器人"——模拟用户点击、输入、截图 | TECH-npm-explained-20260702 | test, E2E | 1 |
| PWA | Progressive Web App | "网页版APP"——能安装到手机主屏、能离线使用、像原生APP一样 | TECH-npm-explained-20260702 | Service Worker, manifest, Workbox | 1 |
| Precache | 预缓存 | 首次打开网页时，就把关键文件提前存到本地——下次没网也能看 | TECH-npm-explained-20260702 | Service Worker, PWA, Workbox | 1 |
| Pinyin Initials | 拼音首字母 | 用拼音的第一个字母缩写来搜索——比如"GZT"代表"桂枝汤" | 搜索系统v9重构 | search, pinyin | 1 |

## R

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| REST API | 表述性状态传递接口 | 最常见的网页数据接口格式——用 URL 定位资源，用 HTTP 方法操作 | 产品化总体规划 | API, GraphQL, HTTP | 1 |
| Radar Chart | 雷达图 | 多边形图表——像蜘蛛网一样，每个角代表一个维度，可以一眼看出强弱分布 | 统计图表v9重构 | six jing, chart, coverage | 1 |
| Retrieval Engine | 检索练习引擎 | 根据错题记录自动出题的系统——薄弱的地方多出题，会的少出题 | 检索练习v9重构 | spaced repetition, weak spot, quiz | 1 |

## S

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Scripts | 脚本命令 | 购物清单上的"指令本"——告诉管家喊什么工具来做什么 | TECH-npm-explained-20260702 | package.json, npm run | 1 |
| Service Worker Cache | Service Worker 缓存 | PWA 的"本地仓库"——把网页文件存到本地，没网也能打开 | 统计图表v9验证 | PWA, offline, Workbox | 1 |
| Service Worker | 浏览器后台脚本 | PWA 的"缓存管家"——在浏览器后台运行，拦截网络请求，优先从本地读 | TECH-npm-explained-20260702 | PWA, Workbox, precache | 1 |
| SW | Service Worker 缩写 | 缓存管家的简称 | TECH-npm-explained-20260702 | Service Worker, PWA | 1 |
| Search Cluster | 搜索聚类 | 把搜索结果或同标签卡片聚成一组，从中生成考试题目 | 搜索系统v9重构 | search, tag, exam | 1 |

## T

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Tree-Shaking | 摇树优化 | 像摇树一样把枯叶（没用的代码）摇掉，只保留有用的 | TECH-npm-explained-20260702 | build, Vite, bundle | 1 |
| Transitive Dependency | 传递依赖 | 工具A依赖工具B，工具B又依赖工具C——买了A就得把B和C也买回来 | TECH-npm-explained-20260702 | npm install, node_modules | 1 |

## V

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Vite | 现代前端构建工具 | 超级快的"切菜机+打包机"——开发时秒开，打包时智能优化 | TECH-npm-explained-20260702 | build, npm, bundle | 1 |
| Vite-Plugin-PWA | Vite 的 PWA 插件 | 给 Vite 加装"外卖系统"——让打包后的网页能离线使用 | TECH-npm-explained-20260702 | Vite, PWA, Workbox | 1 |
| Vitest | 现代前端测试框架 | 和 Vite 配套的"质检仪"——速度快，和 Vite 用同一套配置 | TECH-npm-explained-20260702 | Vite, test, assertion | 1 |

## W

| 术语 | 定义 | 大白话 | 首次出现 | 相关术语 | 出现次数 |
|------|------|--------|----------|----------|----------|
| Web App | 网页应用 | 不用下载、打开浏览器就能用的应用 | 产品化总体规划 | PWA, browser | 1 |
| Workbox | Google PWA 工具库 | Google 写的"缓存工具箱"——让写 Service Worker 变得简单 | TECH-npm-explained-20260702 | PWA, Service Worker, generateSW | 1 |

---

## 更新日志

| 日期 | 操作 | 新增术语 | 更新术语 | 总计 |
|------|------|----------|----------|------|
| 2026-07-02 | Phase 0 基础设施验证（npm/test/build） | 38 | 0 | 38 |
| 2026-07-02 | Phase 1 批次1：搜索系统重构 | 5 | 1 | 43 |
| 2026-07-02 | Phase 1 批次2-5：错题本/检索练习/剂量换算/统计图表 | 7 | 2 | 50 |

---

*文档状态：活跃更新中*  
*产品名：明医成长录*  
*下次更新：Phase 1 PWA MVP 验证后*
