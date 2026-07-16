"""
clinical / router — 临床档案 CRUD
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase_client import get_supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/clinical", tags=["clinical"])


class ClinicalCreate(BaseModel):
    patient_name: str = ""
    symptoms: list = []
    input_text: str = ""
    note: str = ""
    related_person_id: str | None = None


class ClinicalUpdate(BaseModel):
    patient_name: str | None = None
    symptoms: list | None = None
    input_text: str | None = None
    note: str | None = None
    related_person_id: str | None = None


@router.get("")
async def get_all(user: dict = Depends(get_current_user)):
    """获取全部临床档案"""
    supabase = get_supabase()
    res = supabase.table("clinical_records") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .execute()
    return {"data": res.data}


@router.get("/search")
async def search(q: str = "", user: dict = Depends(get_current_user)):
    """搜索临床档案"""
    supabase = get_supabase()
    res = supabase.table("clinical_records") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .execute()
    records = res.data
    if q:
        q_lower = q.lower()
        records = [
            r for r in records
            if q_lower in (r.get("patient_name") or "").lower()
            or any(q_lower in (s or "") for s in (r.get("symptoms") or []))
            or q_lower in (r.get("input_text") or "").lower()
            or q_lower in (r.get("note") or "").lower()
        ]
    return {"data": records}


@router.post("")
async def create(data: ClinicalCreate, user: dict = Depends(get_current_user)):
    """创建临床档案"""
    supabase = get_supabase()
    res = supabase.table("clinical_records").insert({
        "user_id": user["id"],
        "patient_name": data.patient_name,
        "symptoms": data.symptoms,
        "input_text": data.input_text,
        "note": data.note,
        "related_person_id": data.related_person_id,
    }).execute()
    return {"data": res.data[0]} if res.data else {"data": None}


@router.put("/{record_id}")
async def update(record_id: str, data: ClinicalUpdate,
                 user: dict = Depends(get_current_user)):
    """更新临床档案"""
    supabase = get_supabase()
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    updates["updated_at"] = "now()"
    supabase.table("clinical_records").update(updates) \
        .eq("id", record_id) \
        .eq("user_id", user["id"]) \
        .execute()
    return {"message": "已更新"}


@router.delete("/{record_id}")
async def delete(record_id: str, user: dict = Depends(get_current_user)):
    """删除临床档案"""
    supabase = get_supabase()
    supabase.table("clinical_records").delete() \
        .eq("id", record_id) \
        .eq("user_id", user["id"]) \
        .execute()
    return {"message": "已删除"}
