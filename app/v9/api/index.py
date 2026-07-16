"""
index.py — FastAPI 应用入口（兼容 Vercel Serverless）

本地开发：
  cd app/v9/api
  pip install -r requirements.txt
  uvicorn index:app --reload --port 8000

Vercel 部署：
  项目的 vercel.json 需配置 routes 将 /api/* 指向此文件
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as auth_router
from state.router import router as state_router
from notes.router import router as notes_router
from clinical.router import router as clinical_router
from stats.router import router as stats_router

app = FastAPI(
    title="明医成长录 API",
    version="9.0.0",
    description="经方学习系统 v9 后端 API",
)

# CORS — 允许前端本地开发 + Vercel 部署跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                # Vite dev
        "http://localhost:8100",                # 主端口
        "http://localhost:8101",                # 备用端口
        "http://localhost:8102",                # 开发/预留端口
        "https://ming-yi-cheng-zhang-lu.vercel.app",  # Vercel 生产
        "https://ming-yi-cheng-zhang-lu-git-*.vercel.app",  # Vercel Preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)
app.include_router(state_router)
app.include_router(notes_router)
app.include_router(clinical_router)
app.include_router(stats_router)


@app.get("/api/health")
async def health():
    """健康检查端点"""
    return {"status": "ok", "version": "9.0.0"}
