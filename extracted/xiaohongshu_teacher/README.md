# 小红书「针道轩」伤寒论笔记归档

## 来源

- 用户老师的小红书主页：https://www.xiaohongshu.com/user/profile/577afc1450c4b4209c29137b
- 采集时间：2026-06-13
- 采集方式：Kimi WebBridge 浏览器自动化 + 小红书 `user_posted` API 抓包 + 封面图 OCR

## 归档内容

| 文件 | 说明 |
|---|---|
| `notes_catalog.json` | 238 条笔记的元数据（note_id、标题、封面 URL、点赞数等） |
| `notes_catalog.md` | 238 条笔记的目录（含可直接访问的小红书链接） |
| `covers/` | 238 张封面原图，按 `note_id.jpg` 命名 |
| `covers/_download_log.json` | 封面下载日志 |
| `notes_ocr.json` | 对每张封面图做 OCR 后的原始文本 |
| `notes_ocr.md` | OCR 文本的 Markdown 汇编 |
| `伤寒论条文_小红书针道轩.md` | 清洗后的条文摘录，按条文编号降序排列 |

## 数据规模

- 共收录笔记：**238 条**
- 系列标题统一为：`每日学伤寒｜学《伤寒论》第 XXX 条`
- 覆盖条文范围：第 1 条 ～ 第 369 条（OCR 中可能有少量缺漏或错字）

## OCR 说明

- 使用 `rapidocr_onnxruntime`（ONNX 版，轻量中文 OCR）
- 识别准确率较高，但仍有少量形近字错误，例如：
  - `晬时` 误为 `醉时`
  - `吴茱萸` 误为 `吴莱萸`
  - `趋` 误为 `趣`
- 如需严格校对，建议以《伤寒论》原文逐条核对。

## 用途建议

1. 与项目内 `extracted/太阳病.md` 等本地条文做交叉补全。
2. 作为「每日学伤寒」系列的卡片 `source_text` 来源。
3. 用 `条文编号` 与卡片系统关联，快速生成复习卡片。

## 复现脚本

- `scripts/xhs_extract_helper.py`：WebBridge 辅助脚本
- `scripts/parse_xhs_network.py`：解析 `user_posted` API 响应生成目录
- `scripts/download_xhs_covers.py`：下载封面图
- `scripts/ocr_xhs_covers.py`：OCR 封面图
- `scripts/clean_xhs_ocr.py`：生成清洗后的条文摘录

> OCR 依赖 `venv_ocr` 虚拟环境中的 `rapidocr_onnxruntime`。
