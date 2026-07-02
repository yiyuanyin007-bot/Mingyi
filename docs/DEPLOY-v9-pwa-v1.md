# DEPLOY-v9-pwa-v1.md — v9 PWA 配置说明

> **文档编号**：DEPLOY-v9-pwa-v1  
> **版本**：v1.0  
> **日期**：2026-07-02  
> **产品名**：明医成长录

---

## 配置变更

### 1. package.json
- 添加依赖：`vite-plugin-pwa`
- 添加脚本：`build:pwa`

### 2. vite.config.js
- 添加 `VitePWA` 插件
- 配置 Workbox：
  - 缓存所有页面（NetworkFirst，7天）
  - 缓存数据文件（CacheFirst，30天）
  - 自动更新 Service Worker

### 3. public/manifest.json
- 应用名称：明医成长录
- 主题色：赭石 `#C17F59`
- 背景色：米白 `#FAF8F5`
- 图标：192x192 + 512x512（需替换为实际图标）

### 4. index.html
- 添加 `<link rel="manifest" href="/manifest.json" />`
- 添加 theme-color、apple-mobile-web-app 等 meta 标签

---

## 安装步骤

```bash
cd app/v9
npm install
npm run build
```

## 部署

```bash
# 构建产物在 dist/ 目录
# 部署到 Vercel/Netlify/任何静态托管
```

---

## 验证清单

- [ ] `npm run build` 无报错
- [ ] `dist/manifest.json` 存在
- [ ] `dist/sw.js` 存在（Service Worker）
- [ ] Lighthouse PWA 评分 ≥ 90
- [ ] 可安装到主屏
- [ ] 断网后页面可访问
