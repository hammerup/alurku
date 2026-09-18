import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, Documentation, setup_db

client = TestClient(app)


def test_documentation_database_and_endpoint():
    # 1. Trigger setup_db to ensure database table and seeds exist
    setup_db()

    # 2. Test GET /api/docs in Indonesian
    resp_id = client.get("/api/docs?lang=id")
    assert resp_id.status_code == 200, f"Failed: {resp_id.text}"
    docs_id = resp_id.json()
    assert len(docs_id) >= 10, f"Expected at least 10 doc chapters, got {len(docs_id)}"

    doc_ids_id = {d["id"] for d in docs_id}
    assert "overview" in doc_ids_id
    assert "workspace" in doc_ids_id
    assert "command-bar" in doc_ids_id
    assert "views-workflow" in doc_ids_id
    assert "pricing-tiers" in doc_ids_id
    assert "ai-planning" in doc_ids_id

    # Verify Indonesian content for command-bar
    cmd_doc_id = next(d for d in docs_id if d["id"] == "command-bar")
    assert "Command Bar Quick-Add" in cmd_doc_id["title"]
    assert "p:urgent" in cmd_doc_id["sections"][1]["content"]
    assert cmd_doc_id["group"] == "Fitur Utama"

    # 3. Test GET /api/docs in English
    resp_en = client.get("/api/docs?lang=en")
    assert resp_en.status_code == 200, f"Failed: {resp_en.text}"
    docs_en = resp_en.json()
    assert len(docs_en) >= 10

    cmd_doc_en = next(d for d in docs_en if d["id"] == "command-bar")
    assert cmd_doc_en["group"] == "Core Features"
    assert "Press" in cmd_doc_en["sections"][0]["content"]

    # 4. Direct DB verification
    db = SessionLocal()
    try:
        count = db.query(Documentation).count()
        assert count >= 10, f"Expected at least 10 rows in database, got {count}"
    finally:
        db.close()
