# 行为记录技术实现指南（大白话版）

> **文档编号**：TECH-behavioral-logging-impl-v1  
> **版本**：v1.0  
> **日期**：2026-07-02  
> **读者**：非技术背景用户（陈医生）  
> **目标**：把行为记录的技术原理、实现方式、性能影响，用大白话讲清楚

---

## 一、先回答你的核心问题

### Q1：记录的是什么？按钮点击、键盘按键、还是鼠标点击？

**答案：三者都可以记，但推荐以「按钮点击」为主，键盘/鼠标为辅。**

具体区别：

| 记录类型 | 能记录什么 | 通俗解释 | 是否推荐 |
|---------|----------|---------|---------|
| **按钮点击（click）** | 用户点了哪个按钮、哪个卡片、哪个选项 | 就像你在淘宝上点了"加入购物车"，系统知道你对这个商品感兴趣 | ✅ 主记录 |
| **键盘按键（keydown）** | 用户按了上下左右、回车、数字键 | 就像你在考试时用键盘切换题目，系统知道你习惯用键盘而不是鼠标 | ✅ 辅助记录 |
| **鼠标移动（mousemove）** | 鼠标划过哪里、悬停了多久 | 就像你在商店里把鼠标悬停在商品图片上3秒，系统知道你可能对这个感兴趣 | ⚠️ 可选，数据量大 |
| **页面滚动（scroll）** | 滚动了多少、看了哪里 | 就像你在看文章时滚动到第3段，系统知道你的阅读进度 | ✅ 推荐记录 |
| **页面停留（visibility）** | 切换后台、切回前台 | 就像你打开微信聊了5分钟再回来，系统知道你的专注度 | ✅ 推荐记录 |

**大白话总结：**
- 按钮点击 = 用户**做了什么选择**（最核心）
- 键盘按键 = 用户**用什么方式操作**（辅助判断习惯）
- 鼠标移动 = 用户**注意力在哪里**（可选，数据量大）

---

### Q2：这种记录对系统负担重不重？

**答案：几乎零负担。** 原因用比喻解释：

```
比喻：

你是一个收银员（浏览器），顾客（用户）在买东西（点击按钮）。

情况A：你每卖一样东西，就写进账本（记录日志）。
→ 顾客买了100件东西，你写了100条记录。
→ 你需要多写100条字，但这不影响你卖货的速度。

情况B：你每卖一样东西，就打电话告诉老板（实时上传到服务器）。
→ 顾客买了100件东西，你打了100个电话。
→ 这会影响你卖货，因为电话占用了你的时间。
```

**我们的方案是情况A（本地记录），不是情况B（实时上传）。**

具体数字：
- 用户一次学习 session（30分钟）大约产生 50-200 个行为事件
- 每个事件记录约 200 字节（JSON 格式）
- 一次 session 的数据量 = 200 × 200 = 40,000 字节 = 40 KB
- 连续学习 30 天 = 40 KB × 30 = 1.2 MB
- 手机一个微信聊天记录都几百 MB，1.2 MB 完全忽略不计

**性能影响：**
- 记录行为事件 → 几乎零开销（浏览器原生能力，就像你走路时顺便呼吸一样自然）
- 写入 localStorage → 每次约 1-5 毫秒，用户完全无感知
- 只有在「关闭页面时批量保存」才会有一次稍多的操作，但也就几十毫秒

**唯一需要注意的：**
如果记录「鼠标移动」，数据量会暴增（鼠标每秒移动 30-60 次）。
→ 解决方案：节流处理，不是每动一下就记，而是每 100 毫秒记一次位置，或者只记「悬停超过 1 秒」的位置。

---

### Q3：是否需要专门的响应器或脚本？

**答案：不需要后端服务器，不需要专门硬件，纯前端代码即可实现。**

三层架构大白话：

```
第一层：你看到的页面（前端）
  ├─ 按钮、卡片、考试界面
  ├─ 这些是 HTML 元素，就像印刷在纸上的按钮图案
  └─ 我们用 JavaScript 给这些按钮"装上耳朵"

第二层：监听层（Event Listeners）
  ├─ 给每个按钮装一个"监听器"（Listener）
  ├─ 监听器就像耳朵：听到点击 → 就喊一声"有人点了按钮A！"
  └─ 这是浏览器自带的能力，不需要额外安装任何东西

第三层：记录层（Logger）
  ├─ 监听器喊了一声 → 记录层听到 → 把"谁、什么时候、点了什么"写进日志
  ├─ 日志先存在内存里（像一个临时记事本）
  └─ 页面关闭时，一次性把记事本内容存到 localStorage（像把记事本收进抽屉）
```

**不需要什么：**
- ❌ 不需要后端服务器（数据存在用户本地，不上传）
- ❌ 不需要数据库（localStorage 就是简易数据库）
- ❌ 不需要专门硬件（用户电脑/手机的浏览器就是全部）
- ❌ 不需要额外安装软件（浏览器原生支持）

**只需要什么：**
- ✅ 在现有代码中增加约 50-100 行 JavaScript 代码
- ✅ 这段代码写在 app.js 中，和其他代码一起运行

---

## 二、具体技术实现方案（附代码示例）

### 2.1 实现方案概览

```
┌─────────────────────────────────────────┐
│  用户操作（点击按钮、按键、滚动）           │
│         │                              │
│         ▼                              │
│  ┌──────────────┐                     │
│  │  事件监听器   │  ← 捕捉用户行为      │
│  │  (Listener)  │                     │
│  └──────┬───────┘                     │
│         │                              │
│         ▼                              │
│  ┌──────────────┐                     │
│  │  事件处理器   │  ← 把行为转成结构化数据 │
│  │  (Handler)   │                     │
│  └──────┬───────┘                     │
│         │                              │
│         ▼                              │
│  ┌──────────────┐                     │
│  │  内存缓冲区   │  ← 临时存储（像一个记事本）│
│  │  (Buffer)   │                     │
│  └──────┬───────┘                     │
│         │                              │
│         ▼                              │
│  ┌──────────────┐                     │
│  │  localStorage │  ← 持久化存储（像抽屉）  │
│  │  (持久化)    │                     │
│  └──────────────┘                     │
└─────────────────────────────────────────┘
```

### 2.2 代码示例（可直接给前端开发者参考）

```javascript
// ==========================================
// 行为日志系统（Behavioral Logger）
// 职责：无感收集用户行为，几乎零性能开销
// 数据量：每次 session 约 40 KB，每月约 1.2 MB
// ==========================================

class BehavioralLogger {
  constructor() {
    this.buffer = [];        // 内存缓冲区（记事本）
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initListeners();    // 给按钮装上耳朵
  }

  // 生成唯一的会话ID
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ========== 核心：给按钮装上耳朵 ==========
  initListeners() {
    // 1. 监听所有按钮点击（最主要）
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // 只记录有意义的点击（按钮、卡片、选项）
      if (this.isMeaningfulElement(target)) {
        this.log({
          type: 'click',
          element: this.describeElement(target),  // "按钮：开始考试"
          timestamp: Date.now(),
          // 附加信息：当前在哪个页面、在看哪张卡片
          context: this.getCurrentContext()
        });
      }
    });

    // 2. 监听键盘按键（辅助）
    document.addEventListener('keydown', (e) => {
      // 只记录方向键、回车、数字键（有意义的操作）
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', '1', '2', '3', '4'].includes(e.key)) {
        this.log({
          type: 'keydown',
          key: e.key,  // "ArrowRight" 或 "Enter"
          timestamp: Date.now(),
          context: this.getCurrentContext()
        });
      }
    });

    // 3. 监听页面滚动（阅读进度）
    let scrollTimeout;
    document.addEventListener('scroll', () => {
      // 防抖：用户停止滚动 200ms 后才记录
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.log({
          type: 'scroll',
          scrollY: window.scrollY,  // 滚动位置
          timestamp: Date.now()
        });
      }, 200);
    });

    // 4. 监听页面可见性（切换后台/前台）
    document.addEventListener('visibilitychange', () => {
      this.log({
        type: 'visibility',
        state: document.visibilityState,  // "visible" 或 "hidden"
        timestamp: Date.now()
      });
    });

    // 5. 页面关闭时：把记事本一次性收进抽屉
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  // 判断点击的元素是否有意义
  isMeaningfulElement(el) {
    const meaningfulTags = ['BUTTON', 'A', 'DIV', 'SPAN'];
    const meaningfulClasses = ['card', 'btn', 'option', 'exam-option', 'nav-btn', 'search-result'];
    
    // 是常见交互元素
    if (!meaningfulTags.includes(el.tagName)) return false;
    
    // 有特定的功能类名（不是空白区域的误点击）
    const hasClass = meaningfulClasses.some(c => el.classList.contains(c));
    
    return hasClass;
  }

  // 描述点击的元素是什么
  describeElement(el) {
    // 优先使用 data-log 属性（开发时给按钮标注的"名字"）
    if (el.dataset.log) return el.dataset.log;
    
    // 否则用类名+文本内容
    const text = el.textContent.trim().substring(0, 20);  // 最多20字
    return `${el.tagName}.${el.className}:${text}`;
  }

  // 获取当前上下文（用户在哪个页面、看哪张卡片）
  getCurrentContext() {
    return {
      page: window.location.hash || 'dashboard',  // 当前页面
      cardId: document.querySelector('.active-card')?.dataset?.cardId || null,  // 当前卡片
      examMode: document.querySelector('.exam-container')?.dataset?.mode || null,  // 考试模式
      timestamp: Date.now()
    };
  }

  // ========== 记录一条行为 ==========
  log(event) {
    // 添加会话信息
    const record = {
      ...event,
      sessionId: this.sessionId,
      elapsedTime: Date.now() - this.startTime  // 从session开始过了多久
    };
    
    // 先写入记事本（内存），非常快（<1毫秒）
    this.buffer.push(record);
    
    // 记事本满了（比如100条），就存一次抽屉
    if (this.buffer.length >= 100) {
      this.saveToStorage();
    }
  }

  // ========== 保存到 localStorage（抽屉）==========
  saveToStorage() {
    if (this.buffer.length === 0) return;
    
    try {
      // 读取抽屉里已有的数据
      const existing = JSON.parse(localStorage.getItem('sh_behavior_logs') || '[]');
      
      // 把记事本内容合并进去
      const updated = [...existing, ...this.buffer];
      
      // 如果抽屉太满了（超过1000条），只保留最近500条
      const trimmed = updated.slice(-500);
      
      // 存回抽屉
      localStorage.setItem('sh_behavior_logs', JSON.stringify(trimmed));
      
      // 清空记事本
      this.buffer = [];
    } catch (e) {
      console.warn('行为日志保存失败:', e);
    }
  }

  // ========== 获取所有行为日志（用于AI分析）==========
  getAllLogs() {
    return JSON.parse(localStorage.getItem('sh_behavior_logs') || '[]');
  }

  // ========== 导出日志（用户导出数据）==========
  exportLogs() {
    const logs = this.getAllLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behavior_logs_${Date.now()}.json`;
    a.click();
  }

  // ========== 清空日志（用户删除数据）==========
  clearLogs() {
    localStorage.removeItem('sh_behavior_logs');
    this.buffer = [];
  }
}

// ========== 使用方式 ==========
// 在 app.js 初始化时创建：
// const logger = new BehavioralLogger();
// 之后 logger 会自动工作，无需额外操作

// 按钮上标注 data-log（开发时给按钮起名字）：
// <button data-log="开始考试:桂枝汤" class="btn">开始考试</button>
// <button data-log="选择选项:A" class="exam-option">发热汗出恶风</button>
// <button data-log="查看条文:桂枝汤" class="nav-btn">条文</button>
```

### 2.3 数据长什么样？

用户学习一次后，localStorage 里的数据大概是这样：

```json
[
  {
    "type": "visibility",
    "state": "visible",
    "timestamp": 1719900000000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 0
  },
  {
    "type": "click",
    "element": "BUTTON.btn:今日复习",
    "timestamp": 1719900005000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 5000,
    "context": {
      "page": "dashboard",
      "cardId": null,
      "examMode": null
    }
  },
  {
    "type": "click",
    "element": "DIV.card:桂枝汤",
    "timestamp": 1719900010000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 10000,
    "context": {
      "page": "learn",
      "cardId": "gui-zhi-tang",
      "examMode": null
    }
  },
  {
    "type": "click",
    "element": "BUTTON.nav-btn:查看条文",
    "timestamp": 1719900012000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 12000,
    "context": {
      "page": "learn",
      "cardId": "gui-zhi-tang",
      "examMode": null
    }
  },
  {
    "type": "scroll",
    "scrollY": 500,
    "timestamp": 1719900015000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 15000
  },
  {
    "type": "click",
    "element": "BUTTON.btn:开始考试",
    "timestamp": 1719900020000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 20000,
    "context": {
      "page": "learn",
      "cardId": "gui-zhi-tang",
      "examMode": "practice-card"
    }
  },
  {
    "type": "click",
    "element": "DIV.exam-option:发热汗出恶风",
    "timestamp": 1719900028000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 28000,
    "context": {
      "page": "exam",
      "cardId": "gui-zhi-tang",
      "examMode": "practice-card"
    }
  },
  {
    "type": "keydown",
    "key": "ArrowRight",
    "timestamp": 1719900030000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 30000,
    "context": {
      "page": "exam",
      "cardId": "gui-zhi-tang",
      "examMode": "practice-card"
    }
  },
  {
    "type": "visibility",
    "state": "hidden",
    "timestamp": 1719900100000,
    "sessionId": "sess_1719900000000_abc123",
    "elapsedTime": 100000
  }
]
```

**这段数据在说：**
- 用户打开页面（visible）
- 5秒后点击「今日复习」
- 再5秒后点击「桂枝汤」卡片进入学习
- 2秒后点击「查看条文」
- 3秒后滚动页面（看条文内容）
- 5秒后点击「开始考试」
- 8秒后点击选项「发热汗出恶风」（思考了8秒）
- 2秒后按右方向键（下一题）
- 70秒后切换后台（可能去回微信了）

**AI 分析时可以看到：**
- 用户从「查看条文」到「开始考试」间隔 5 秒 → 快速进入考试，表征可能已经内化
- 用户选答案用了 8 秒 → 在思考，不是直觉反应
- 用户用键盘「右方向键」切换题目 → 习惯用键盘操作

---

## 三、给按钮起名（data-log 标注）

为了让行为日志有意义，开发时需要在 HTML 按钮上加一个属性：

```html
<!-- 给按钮起一个"机器能读懂"的名字 -->

<!-- 原来： -->
<button class="btn">开始考试</button>

<!-- 加上 data-log 后： -->
<button class="btn" data-log="开始考试:桂枝汤">开始考试</button>

<!-- 其他例子： -->
<button class="exam-option" data-log="选择选项:A">发热汗出恶风</button>
<button class="nav-btn" data-log="查看条文:桂枝汤">条文</button>
<button class="btn" data-log="提交答案">提交</button>
<button class="btn" data-log="下一题">→</button>
<button class="card" data-log="打开卡片:麻黄汤">麻黄汤</button>
<button class="btn" data-log="今日复习">今日复习</button>
<button class="btn" data-log="错题本">错题本</button>
<input data-log="搜索输入" placeholder="搜索..." />
```

**这样日志里记录的就是「用户点了开始考试（桂枝汤）」，而不是「用户点了一个class叫btn的按钮」——后者对 AI 分析没有意义。**

---

## 四、你需要告诉开发者的（如果请别人做）

如果你要请一个前端开发者实现这个功能，给他以下清单：

### 4.1 开发需求清单

```markdown
## 行为日志系统需求

### 功能需求
1. 无感收集用户行为，用户不感知性能影响
2. 记录以下行为：
   - 按钮点击（必须）
   - 键盘操作（方向键、回车、数字键）（必须）
   - 页面滚动（可选）
   - 页面可见性切换（必须）
3. 数据本地存储（localStorage），不上传服务器
4. 每次 session 数据量 < 100 KB
5. 提供导出功能（用户可下载自己的数据）
6. 提供清空功能（用户可删除自己的数据）

### 技术约束
- 纯前端实现，不依赖后端
- 性能影响 < 1%（用户无感知）
- 代码量 < 200 行（精简）
- 使用 localStorage，key = 'sh_behavior_logs'

### 数据格式
每条记录包含：
- type: click | keydown | scroll | visibility
- element: 按钮描述（从 data-log 属性读取）
- timestamp: 时间戳（毫秒）
- sessionId: 会话ID
- elapsedTime: 从session开始的时间
- context: { page, cardId, examMode }

### 按钮标注要求
所有交互按钮需要添加 data-log 属性：
- data-log="动作:对象"
- 例如：data-log="开始考试:桂枝汤"
- 例如：data-log="选择选项:A"
- 例如：data-log="查看条文:桂枝汤"

### 交付物
- 一个 BehavioralLogger.js 文件
- 在 app.js 中初始化即可使用
- 提供 getAllLogs() / exportLogs() / clearLogs() 三个方法
```

### 4.2 预计工作量

| 任务 | 工作量 | 说明 |
|------|--------|------|
| 编写 BehavioralLogger.js | 2-3 小时 | 核心代码约100行 |
| 给现有按钮添加 data-log | 1-2 小时 | 遍历所有按钮，添加属性 |
| 测试验证 | 1-2 小时 | 模拟用户操作，检查日志完整性 |
| **总计** | **4-7 小时** | 一个前端开发者半天即可完成 |

---

## 五、隐私与伦理（简短说明）

你说"现在不是做实验，不涉及伦理问题"——从纯技术角度是对的，但从产品设计角度建议：

| 做法 | 建议 | 原因 |
|------|------|------|
| 数据存储位置 | 本地（localStorage） | 不上传到服务器，不涉及数据泄露 |
| 用户知情权 | 在用户协议中声明 | "我们记录您的操作行为以优化学习体验" |
| 用户控制权 | 提供导出和删除按钮 | 用户随时可以拿走或删除自己的数据 |
| 数据用途 | 仅用于AI自我评估 | 不用于其他商业目的 |
| 是否匿名 | 不需要（数据不上传） | 本地存储就是用户自己的数据 |

**建议一句话：** 在系统设置页面加一个小说明：「我们记录您的学习操作（如点击了哪些按钮、学习了多久），仅用于生成您的个人学习评估。数据仅存储在您的设备上，不会上传。您可以随时导出或删除。」

---

## 六、总结

| 问题 | 答案 |
|------|------|
| 记录什么？ | 按钮点击（主）、键盘操作（辅）、页面滚动、可见性切换 |
| 负担重吗？ | 几乎零负担，每次session约40KB，纯前端代码实现 |
| 需要专门脚本吗？ | 不需要，浏览器原生支持，约100行JavaScript代码 |
| 实现难度？ | 低，前端开发者4-7小时即可完成 |
| 数据存在哪里？ | 用户本地localStorage，不上传服务器 |
| 用户隐私？ | 数据不上传，用户可导出/删除，合规风险极低 |
| 对AI分析的价值？ | 记录「用户做了什么选择+什么时候做+花了多久」，是AI理解用户认知状态的原材料 |

---

*本文档用大白话解释技术原理，面向非技术背景用户。*
*实际开发时，前端开发者可参考代码示例实现。*
