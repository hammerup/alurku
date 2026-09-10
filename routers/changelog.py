from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db, Changelog

router = APIRouter(prefix="/api/changelogs", tags=["changelogs"])


@router.get("")
def list_changelogs(
    lang: Optional[str] = Query("id", description="Language: 'id' or 'en'"),
    type: Optional[str] = Query(None, description="Filter by type: 'major', 'feature', 'improvement', 'fix'"),
    search: Optional[str] = Query(None, description="Search query in title or changes"),
    db: Session = Depends(get_db)
):
    query = db.query(Changelog).order_by(Changelog.order_index.desc(), Changelog.id.desc())
    
    if type and type.lower() != "all":
        query = query.filter(Changelog.type == type.lower())
        
    records = query.all()
    results = []
    
    for r in records:
        try:
            changes_id = json.loads(r.changes_id) if r.changes_id else []
        except:
            changes_id = []
        try:
            changes_en = json.loads(r.changes_en) if r.changes_en else []
        except:
            changes_en = []
            
        changes = changes_id if lang == "id" else changes_en
        title = r.title_id if lang == "id" else r.title_en
        
        if search:
            q = search.lower().strip()
            changes_str = " ".join(changes)
            text_corpus = f"{r.version} {title} {changes_str}".lower()
            if q not in text_corpus:
                continue
                
        results.append({
            "id": r.id,
            "version": r.version,
            "release_date": r.release_date,
            "type": r.type,
            "title": title,
            "title_id": r.title_id,
            "title_en": r.title_en,
            "changes": changes,
            "changes_id": changes_id,
            "changes_en": changes_en,
            "order_index": r.order_index,
        })
        
    return results


@router.get("/{version}")
def get_changelog_by_version(
    version: str,
    lang: Optional[str] = "id",
    db: Session = Depends(get_db)
):
    r = db.query(Changelog).filter(Changelog.version == version).first()
    if not r:
        raise HTTPException(status_code=404, detail="Changelog not found")
        
    try:
        changes_id = json.loads(r.changes_id) if r.changes_id else []
    except:
        changes_id = []
    try:
        changes_en = json.loads(r.changes_en) if r.changes_en else []
    except:
        changes_en = []
        
    return {
        "id": r.id,
        "version": r.version,
        "release_date": r.release_date,
        "type": r.type,
        "title": r.title_id if lang == "id" else r.title_en,
        "title_id": r.title_id,
        "title_en": r.title_en,
        "changes": changes_id if lang == "id" else changes_en,
        "changes_id": changes_id,
        "changes_en": changes_en,
        "order_index": r.order_index,
    }
