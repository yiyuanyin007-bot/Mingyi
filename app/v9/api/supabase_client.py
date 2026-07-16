"""
supabase_client — Supabase 客户端单例

环境变量：
  SUPABASE_URL     — Supabase 项目 URL（https://xxx.supabase.co）
  SUPABASE_SERVICE_KEY — Supabase service_role key（有权限在后端操作 auth）

本地开发可在 .env 文件中配置，或直接设置环境变量。
Vercel 部署时在 Vercel Dashboard 设置 Environment Variables。
"""

import os
from supabase import create_client, Client

_SUPABASE_CLIENT: Client | None = None


def get_supabase() -> Client:
    global _SUPABASE_CLIENT
    if _SUPABASE_CLIENT is None:
        url = os.environ.get("SUPABASE_URL", "")
        key = os.environ.get("SUPABASE_SERVICE_KEY", "")
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL 和 SUPABASE_SERVICE_KEY 环境变量未设置"
            )
        _SUPABASE_CLIENT = create_client(url, key)
    return _SUPABASE_CLIENT


def reset_client():
    """重置客户端（主要用于测试）"""
    global _SUPABASE_CLIENT
    _SUPABASE_CLIENT = None
