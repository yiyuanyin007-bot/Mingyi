"""
stats / router — 学习统计与答题历史
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from supabase_client import get_supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/stats", tags=["stats"])


class AnswerRecord(BaseModel):
    card_id: str
    card_name: str = ""
    vector: str = ""
    vector_label: str = ""
    is_correct: bool = True
    mode: str = ""
    selected_label: str | None = None


class TodayStatsUpdate(BaseModel):
    total: int = 0
    right: int = 0
    wrong: int = 0
    card_ids: list = []


@router.post("/answer")
async def record_answer(data: AnswerRecord, user: dict = Depends(get_current_user)):
    """记录一次答题"""
    supabase = get_supabase()

    # 1. 写入 answer_history
    supabase.table("answer_history").insert({
        "user_id": user["id"],
        "card_id": data.card_id,
        "card_name": data.card_name,
        "vector": data.vector,
        "vector_label": data.vector_label,
        "is_correct": data.is_correct,
        "mode": data.mode,
        "selected_label": data.selected_label,
    }).execute()

    # 2. 更新 card_stats
    existing = supabase.table("card_stats") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .eq("card_id", data.card_id) \
        .execute()

    if existing.data:
        cs = existing.data[0]
        ve = cs.get("vector_errors") or {}
        oc = cs.get("option_choices") or {}
        if not data.is_correct:
            ve[data.vector] = ve.get(data.vector, 0) + 1
        if data.selected_label:
            if data.vector not in oc:
                oc[data.vector] = {}
            oc[data.vector][data.selected_label] = \
                oc[data.vector].get(data.selected_label, 0) + 1

        supabase.table("card_stats").update({
            "total_attempts": cs["total_attempts"] + 1,
            "total_errors": cs["total_errors"] + (0 if data.is_correct else 1),
            "vector_errors": ve,
            "option_choices": oc,
            "last_error": "now()" if not data.is_correct else cs.get("last_error"),
            "consecutive_errors": 0 if data.is_correct else (cs.get("consecutive_errors", 0) + 1),
        }).eq("id", cs["id"]).execute()
    else:
        supabase.table("card_stats").insert({
            "user_id": user["id"],
            "card_id": data.card_id,
            "card_name": data.card_name,
            "total_attempts": 1,
            "total_errors": 0 if data.is_correct else 1,
            "vector_errors": {} if data.is_correct else {data.vector: 1},
            "option_choices": {},
            "last_error": "now()" if not data.is_correct else None,
            "consecutive_errors": 0 if data.is_correct else 1,
        }).execute()

    # 3. 更新 daily_stats
    from datetime import date
    today = str(date.today())
    daily = supabase.table("daily_stats") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .eq("date", today) \
        .execute()

    if daily.data:
        d = daily.data[0]
        cids = set(d.get("card_ids") or [])
        cids.add(data.card_id)
        supabase.table("daily_stats").update({
            "total": d["total"] + 1,
            "right": d["right"] + (1 if data.is_correct else 0),
            "wrong": d["wrong"] + (0 if data.is_correct else 1),
            "card_ids": list(cids),
        }).eq("id", d["id"]).execute()
    else:
        supabase.table("daily_stats").insert({
            "user_id": user["id"],
            "date": today,
            "total": 1,
            "right": 1 if data.is_correct else 0,
            "wrong": 0 if data.is_correct else 1,
            "card_ids": [data.card_id],
        }).execute()

    return {"message": "已记录"}


@router.get("/today")
async def get_today_stats(user: dict = Depends(get_current_user)):
    """获取今日统计"""
    from datetime import date
    today = str(date.today())
    supabase = get_supabase()
    res = supabase.table("daily_stats") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .eq("date", today) \
        .execute()
    if res.data:
        d = res.data[0]
        return {
            "total": d["total"],
            "right": d["right"],
            "wrong": d["wrong"],
            "cardCount": len(d.get("card_ids") or []),
        }
    return {"total": 0, "right": 0, "wrong": 0, "cardCount": 0}


@router.get("/cards")
async def get_card_stats(user: dict = Depends(get_current_user)):
    """获取卡片统计"""
    supabase = get_supabase()
    res = supabase.table("card_stats") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .execute()
    stats = {}
    for cs in res.data:
        stats[cs["card_id"]] = cs
    return {"data": stats}
