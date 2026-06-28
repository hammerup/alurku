from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db, Article

router = APIRouter(prefix="/api/articles", tags=["articles"])


@router.get("")
def list_articles(lang: Optional[str] = "id", db: Session = Depends(get_db)):
    """
    Mengambil daftar ringkasan artikel panduan untuk halaman utama panduan (/panduan).
    Mendukung parameter bahasa (lang) 'id' atau 'en'.
    """
    articles = (
        db.query(Article)
        .filter(Article.language == lang)
        .order_by(Article.id.asc())
        .all()
    )
    
    result = []
    for art in articles:
        result.append({
            "id": art.id,
            "title": art.title,
            "slug": art.slug,
            "category": art.category,
            "category_slug": art.category_slug,
            "duration": art.duration,
            "description": art.description,
            "image_url": art.image_url,
            "language": art.language,
        })
    return result


@router.get("/{category_slug}/{slug}")
def get_article_detail(category_slug: str, slug: str, db: Session = Depends(get_db)):
    """
    Mengambil konten detail artikel berdasarkan slug kategori dan slug artikel.
    """
    article = (
        db.query(Article)
        .filter(Article.category_slug == category_slug, Article.slug == slug)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    return {
        "id": article.id,
        "title": article.title,
        "slug": article.slug,
        "category": article.category,
        "category_slug": article.category_slug,
        "duration": article.duration,
        "description": article.description,
        "content": article.content,
        "image_url": article.image_url,
        "language": article.language,
        "created_at": article.created_at.strftime("%Y-%m-%d %H:%M:%S") if article.created_at else None,
    }
