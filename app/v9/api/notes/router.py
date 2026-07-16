"""
notes / router — 笔记 CRUD
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase_client import get_supabase
from auth.dependencies import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])


class NoteCreate(BaseModel):
    type: str
    card_id: str
    source_id: str | None = None
    content: str = ""
    tags: list = []
    vector: str | None = None
    vector_label: str | None = None
    diagnosis: str | None = None
    diagnosis_label: str | None = None
    question: str | None = None
    selected: str | None = None
    correct: str | None = None
    prompt: str | None = None
    review_schedule: list | None = None
    source_title: str | None = None
    source_chapter: str | None = None
    source_text: str | None = None


class NoteUpdate(BaseModel):
    content: str | None = None
    tags: list | None = None
    vector: str | None = None
    diagnosis: str | None = None
    diagnosis_label: str | None = None
    question: str | None = None
    selected: str | None = None
    correct: str | None = None
    prompt: str | None = None
    review_schedule: list | None = None


@router.get("")
async def get_notes(type: str = None, card_id: str = None,
                   user: dict = Depends(get_current_user)):
    """获取笔记（可过滤）"""
    supabase = get_supabase()
    query = supabase.table("notes").select("*").eq("user_id", user["id"])
    if type:
        query = query.eq("type", type)
    if card_id:
        query = query.eq("card_id", card_id)
    res = query.order("updated_at", desc=True).execute()
    return {"data": res.data}


@router.post("")
async def create_note(data: NoteCreate, user: dict = Depends(get_current_user)):
    """创建笔记"""
    supabase = get_supabase()
    res = supabase.table("notes").insert({
        "user_id": user["id"],
        "type": data.type,
        "card_id": data.card_id,
        "source_id": data.source_id,
        "content": data.content,
        "tags": data.tags,
        "vector": data.vector,
        "vector_label": data.vector_label,
        "diagnosis": data.diagnosis,
        "diagnosis_label": data.diagnosis_label,
        "question": data.question,
        "selected": data.selected,
        "correct": data.correct,
        "prompt": data.prompt,
        "review_schedule": data.review_schedule,
        "source_title": data.source_title,
        "source_chapter": data.source_chapter,
        "source_text": data.source_text,
    }).execute()
    return {"data": res.data[0]} if res.data else {"data": None}


@router.put("/{note_id}")
async def update_note(note_id: str, data: NoteUpdate,
                      user: dict = Depends(get_current_user)):
    """更新笔记（部分更新）"""
    supabase = get_supabase()
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    updates["updated_at"] = "now()"
    supabase.table("notes").update(updates) \
        .eq("id", note_id) \
        .eq("user_id", user["id"]) \
        .execute()
    return {"message": "已更新"}


@router.delete("/{note_id}")
async def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    """删除笔记"""
    supabase = get_supabase()
    supabase.table("notes").delete() \
        .eq("id", note_id) \
        .eq("user_id", user["id"]) \
        .execute()
    return {"message": "已删除"}
