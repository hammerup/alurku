import os
import pytest
from fastapi.testclient import TestClient
from backend_api import app, get_current_user
from database import SessionLocal, get_system_policies, set_security_log

@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = lambda: "test_admin"
    c = TestClient(app)
    yield c
    app.dependency_overrides.clear()

def test_groq_preferred_seamless_failover_to_gemini(client):
    db = SessionLocal()
    policies = get_system_policies(db)
    policies["default_ai_engine"] = "groq"
    set_security_log(db, "system_policies", policies)
    db.close()

    res = client.post(
        "/api/ai/generate",
        json={"prompt": "Say test in two words", "provider": "groq"}
    )
    assert res.status_code == 200, f"Expected 200 OK with seamless failover, got {res.status_code}: {res.text}"
    data = res.json()
    assert "text" in data
    assert len(data["text"]) > 0
    assert data.get("provider") == "alurku AI"

def test_provider_branding_strictly_whitelabeled(client):
    res = client.post(
        "/api/ai/generate",
        json={"prompt": "Respond with OK", "provider": "auto"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data.get("provider") == "alurku AI"
    assert "gemini" not in data.get("provider", "").lower()
    assert "groq" not in data.get("provider", "").lower()

def test_all_providers_failure_sanitized_503(client, monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "invalid_key_for_test")
    monkeypatch.setenv("GROQ_API_KEY", "invalid_key_for_test")

    res = client.post(
        "/api/ai/generate",
        json={"prompt": "Hello", "provider": "auto"}
    )
    assert res.status_code == 503
    detail = res.json().get("detail", "")
    assert len(detail) > 0

    banned_keywords = [
        "groq",
        "gemini",
        "cloudflare",
        "geo block",
        "openai",
        "gpt-oss",
        "llama",
        ".env",
        "api key",
        "exception",
        "traceback"
    ]
    detail_lower = detail.lower()
    for kw in banned_keywords:
        assert kw not in detail_lower, f"CRITICAL LEAK: Found forbidden keyword {kw} in {detail}"