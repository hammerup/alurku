import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_api import app
from database import SessionLocal, Changelog

client = TestClient(app)


def test_changelog_api_and_db_persistence():
    db = SessionLocal()
    try:
        # 1. Verify DB contains records
        count = db.query(Changelog).count()
        assert count >= 20, f"Expected at least 20 changelog releases, found {count}"

        # 2. Test GET /api/changelogs in Indonesian (default)
        res_id = client.get("/api/changelogs?lang=id")
        assert res_id.status_code == 200
        data_id = res_id.json()
        assert len(data_id) >= 20
        latest = data_id[0]
        assert "version" in latest
        assert "v2.5.0" in latest["version"]
        assert "title" in latest
        assert "changes" in latest
        assert len(latest["changes"]) > 0

        # 3. Test GET /api/changelogs in English
        res_en = client.get("/api/changelogs?lang=en")
        assert res_en.status_code == 200
        data_en = res_en.json()
        assert data_en[0]["title"] != data_id[0]["title"]

        # 4. Test filter by type
        res_major = client.get("/api/changelogs?type=major")
        assert res_major.status_code == 200
        data_major = res_major.json()
        for item in data_major:
            assert item["type"] == "major"

        # 5. Test search filter
        res_search = client.get("/api/changelogs?search=Burnout")
        assert res_search.status_code == 200
        data_search = res_search.json()
        assert len(data_search) >= 1
        assert any("v2.5.0" in item["version"] for item in data_search)

        # 6. Test GET /api/changelogs/{version}
        res_single = client.get("/api/changelogs/v2.5.0?lang=id")
        assert res_single.status_code == 200
        single_data = res_single.json()
        assert single_data["version"] == "v2.5.0"
        assert "title_id" in single_data
        assert "title_en" in single_data

        # 7. Test 404 for nonexistent version
        res_404 = client.get("/api/changelogs/v999.0.0")
        assert res_404.status_code == 404
    finally:
        db.close()
