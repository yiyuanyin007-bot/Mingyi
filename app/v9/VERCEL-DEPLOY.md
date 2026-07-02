# Vercel 部署指南 — 明医成长录 v9

> 文档生成时间：2026-07-02
> 适用版本：v9 Phase 1（PWA MVP）

---

## 方式一：手动上传（最快，2分钟）

### 步骤

1. **打开 Vercel 上传页面**
   - 浏览器访问：https://vercel.com/new
   - 登录你的 GitHub 账号（或邮箱注册）

2. **导入本地项目**
   - 页面上方切换为 **"Import Git Repository" → "Upload"**（上传本地文件夹）
   - 或者直接拖拽上传

3. **选择项目根目录**
   - 把 `app/v9/` 这个文件夹整个拖进去
   - **注意**：Vercel 会自动识别 `package.json` 和构建配置

4. **配置构建选项**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `app/v9`（如果上传的是整个仓库，需要设置）

5. **点击 Deploy**
   - 等待约 1-2 分钟构建完成
   - 获得形如 `https://your-project.vercel.app` 的域名

---

## 方式二：GitHub 自动部署（推荐，后续 push 即自动更新）

### 步骤

1. **创建 GitHub 仓库**
   - 登录 https://github.com/new
   - 仓库名：`shanghanlun-v9`（随便取）
   - 公开或私有均可

2. **推送代码**
   ```bash
   cd "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
   git init
   git add .
   git commit -m "v9 Phase 1 MVP"
   git branch -M main
   git remote add origin https://github.com/你的用户名/shanghanlun-v9.git
   git push -u origin main
   ```
   > 如果你没装 Git，用 GitHub Desktop 也可以。

3. **在 Vercel 导入仓库**
   - 访问 https://vercel.com/new
   - 选择你刚才创建的 GitHub 仓库
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: 留空（如果仓库根就是 `app/v9`）

4. **点击 Deploy**
   - 首次部署约 2 分钟
   - 后续每次 `git push` 自动重新部署

---

## 已生成的部署包

本地已打包好的文件：

```
D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9\shanghanlun-v9-deploy.zip
```

大小：0.55 MB（579KB）

这个 zip 就是 `dist/` 目录的完整内容，包含：
- `index.html` — 入口页面
- `assets/` — JS/CSS 构建产物
- `sw.js` — Service Worker
- `manifest.json` — PWA 配置
- `data/` — 10 个 JSON 数据文件

如果你不想用 GitHub，可以直接把 `dist/` 文件夹里的内容上传到 Vercel 的 "Upload" 模式。

---

## 部署后验证清单

部署完成后，在浏览器中打开你的 Vercel 域名，验证以下功能：

- [ ] 页面正常加载，显示 99 张卡片列表
- [ ] 搜索框可以输入并筛选
- [ ] 标签可以点击聚类
- [ ] 点击卡片进入学习页，显示方剂详情
- [ ] 剂量点击弹出换算弹窗
- [ ] 条文按钮打开右侧面板
- [ ] 单卡练习/检索练习/今日复习能正常出题
- [ ] 错题本按钮可打开
- [ ] 统计按钮显示 3 个图表
- [ ] PWA 安装提示（Chrome 地址栏右侧）

---

## 常见问题

**Q: 构建失败，提示找不到 `vite`？**
> A: 确保 Build Command 是 `npm run build`，Vercel 会自动安装依赖。如果不行，改为 `npm install && npm run build`。

**Q: 部署后页面空白？**
> A: 检查 Output Directory 是否为 `dist`，以及 `vite.config.js` 中 `base` 是否为 `/`（已配置）。

**Q: 数据文件没加载？**
> A: 确保 `public/data/` 目录被复制到了 `dist/`。Vite 构建时 `public/` 目录会自动复制到 `dist/`。

**Q: PWA 图标不显示？**
> A: 检查 `manifest.json` 中的 `icons` 路径是否正确。Vercel 部署后路径应相对于根目录。

---

## 下一步

部署完成后，把 Vercel 域名发给我，我更新到项目文档中。

然后我们就可以进入 **P1 最终验收报告** 了。
