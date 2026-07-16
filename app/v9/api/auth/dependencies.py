"""
auth / dependencies — 获取当前用户的依赖注入

前端在请求头中携带 Authorization: Bearer <access_token>
后端通过 Supabase Admin API 验证 token 并解析出 user_id。
"""

from fastapi import Header, HTTPException, Depends
from supabase_client import get_supabase


async def get_current_user(authorization: str = Header(None)) -> dict:
    """
    验证 JWT token，返回用户信息 dict：
      { "id": "uuid", "email": "user@example.com", ... }
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="缺少 Authorization 请求头")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Authorization 格式需为 Bearer <token>")

    try:
        supabase = get_supabase()
        user = supabase.auth.get_user(token)
        return {
            "id": user.user.id,
            "email": user.user.email,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token 验证失败: {str(e)}")
