"""
auth / router — 注册、登录、登出、获取当前用户信息
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from supabase_client import get_supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Request / Response 模型 ──

class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── 端点 ──

@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    """
    注册新用户
    Supabase Auth 自动发送确认邮件（可在 Supabase → Auth → Settings 中关闭邮箱确认）
    """
    try:
        supabase = get_supabase()
        res = supabase.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,  # 自动确认（即无需邮件验证）
        })
        user = res.user

        # 同时在 profiles 表创建用户资料
        supabase.table("profiles").insert({
            "id": user.id,
            "email": req.email,
        }).execute()

        # 注册后直接登录以获取 token
        login_res = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        session = login_res.session

        return AuthResponse(
            access_token=session.access_token,
            user={"id": user.id, "email": req.email},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"注册失败: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """登录，返回 access_token"""
    try:
        supabase = get_supabase()
        res = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })
        session = res.session
        user = res.user
        return AuthResponse(
            access_token=session.access_token,
            user={"id": user.id, "email": user.email},
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"登录失败: {str(e)}")


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """登出（前端也需清除本地 token）"""
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
        return {"message": "登出成功"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"登出失败: {str(e)}")


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return user
