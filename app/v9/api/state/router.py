"""
state / router — 掌握度 CRUD
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase_client import get_supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/state", tags=["state"])


class MasteryUpdate(BaseModel):
    card_id: str
    vector: str
    level: int = 0
    status: str = "未知"
    streak_right: int = 0
    streak_wrong: int = 0
    total_rights: int = 0
    total_wrongs: int = 0
    last_result: str | None = None
    last_review: str | None = None
    next_review: int = 0


@router.get("")
async def load_state(user: dict = Depends(get_current_user)):
    """加载用户全部掌握度"""
    supabase = get_supabase()
    res = supabase.table("mastery_state") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .execute()
    return {"data": res.data}


@router.put("")
async def save_state(data: list[MasteryUpdate], user: dict = Depends(get_current_user)):
    """全量保存掌握度（upsert）"""
    supabase = get_supabase()
    upserted = 0
    for item in data:
        supabase.table("mastery_state").upsert({
            "user_id": user["id"],
            "card_id": item.card_id,
            "vector": item.vector,
            "level": item.level,
            "status": item.status,
            "streak_right": item.streak_right,
            "streak_wrong": item.streak_wrong,
            "total_rights": item.total_rights,
            "total_wrongs": item.total_wrongs,
            "last_result": item.last_result,
            "last_review": item.last_review,
            "next_review": item.next_review,
        }, on_conflict=["user_id", "card_id", "vector"]).execute()
        upserted += 1
    return {"message": f"已保存 {upserted} 条掌握度"}


@router.post("/{card_id}/{vector}")
async def update_vector(card_id: str, vector: str, data: MasteryUpdate,
                        user: dict = Depends(get_current_user)):
    """更新单条掌握度"""
    supabase = get_supabase()
    supabase.table("mastery_state").upsert({
        "user_id": user["id"],
        "card_id": card_id,
        "vector": vector,
        "level": data.level,
        "status": data.status,
        "streak_right": data.streak_right,
        "streak_wrong": data.streak_wrong,
        "total_rights": data.total_rights,
        "total_wrongs": data.total_wrongs,
        "last_result": data.last_result,
        "last_review": data.last_review,
        "next_review": data.next_review,
    }, on_conflict=["user_id", "card_id", "vector"]).execute()
    return {"message": f"已更新 {card_id}/{vector}"}
