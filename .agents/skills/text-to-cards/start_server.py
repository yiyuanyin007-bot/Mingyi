#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动本地 HTTP 服务器，用于访问《伤寒论》训练系统 v7 DB 版。

用法：
    python start_server.py
    # 然后在浏览器打开 http://localhost:8100/shanghanlun-v7-db.html
"""

import http.server
import socketserver
import os

PORT = 8100
DIRECTORY = os.path.dirname(__file__)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"服务已启动: http://localhost:{PORT}/shanghanlun-v7-db.html")
        print(f"数据目录: {DIRECTORY}")
        print("按 Ctrl+C 停止")
        httpd.serve_forever()
