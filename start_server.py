#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""启动本地 HTTP 服务器，服务整个项目目录。

用法：
    python start_server.py [端口]

默认端口 8100。服务根目录为项目根目录，使 /app/index.html 和 /data/*.json 均可访问。
"""

import os
import sys
import socketserver
from http.server import SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8100

os.chdir(ROOT)

# 端口冲突检测：若8100被占用，自动尝试8101
import socket
def _check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("", port)) != 0

if not _check_port(PORT):
    print(f"[警告] 端口 {PORT} 已被占用，尝试备用端口 8101...")
    PORT = 8101
    if not _check_port(PORT):
        print(f"[错误] 端口 8101 也被占用。请运行 port_check.py 检查全局冲突。")
        sys.exit(1)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # 本地开发时允许跨域，方便未来扩展
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, fmt, *args):
        # 简化日志，避免控制台刷屏
        print(f"[{self.log_date_time_string()}] {fmt % args}")


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"服务目录: {ROOT}")
        print(f"访问地址: http://localhost:{PORT}/app/index.html")
        print("按 Ctrl+C 停止服务")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
