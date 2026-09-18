from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db, Documentation

router = APIRouter(prefix="/api/docs", tags=["documentation"])


@router.get("")
def get_documentation(
    lang: Optional[str] = Query("id", pattern="^(id|en)$"),
    db: Session = Depends(get_db)
):
    """
    Mengambil daftar seluruh bab dokumentasi platform alurku. dari database.
    Mendukung bahasa 'id' (Bahasa Indonesia) dan 'en' (English).
    """
    docs = (
        db.query(Documentation)
        .order_by(Documentation.order_index.asc())
        .all()
    )

    is_id = (lang == "id")
    result = []
    for doc in docs:
        # Parse sections JSON
        try:
            raw_sections = json.loads(doc.sections) if doc.sections else []
        except Exception:
            raw_sections = []

        formatted_sections = []
        for s in raw_sections:
            formatted_sections.append({
                "id": s.get("id", ""),
                "title": s.get("title_id" if is_id else "title_en", ""),
                "content": s.get("content_id" if is_id else "content_en", ""),
            })

        # Parse see_also JSON
        try:
            see_also_list = json.loads(doc.see_also) if doc.see_also else []
        except Exception:
            see_also_list = []

        result.append({
            "id": doc.doc_id,
            "group": doc.group_title_id if is_id else doc.group_title_en,
            "title": doc.title_id if is_id else doc.title_en,
            "desc": doc.desc_id if is_id else doc.desc_en,
            "sections": formatted_sections,
            "seeAlso": see_also_list,
            "order_index": doc.order_index,
            "is_superadmin_only": bool(doc.is_superadmin_only),
        })

    return result
