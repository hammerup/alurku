import pytest
import os
import sys
from fastapi import Request
from unittest.mock import MagicMock

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import get_frontend_url


def test_get_frontend_url_from_origin():
    mock_request = MagicMock()
    mock_request.headers.get.side_effect = lambda h, default=None: {
        "origin": "http://localhost:5173",
        "referer": None
    }.get(h.lower(), default)

    url = get_frontend_url(mock_request)
    assert url == "http://localhost:5173"

    url_with_path = get_frontend_url(mock_request, "/daftar?email=user@domain.com")
    assert url_with_path == "http://localhost:5173/daftar?email=user@domain.com"


def test_get_frontend_url_from_custom_domain_origin():
    mock_request = MagicMock()
    mock_request.headers.get.side_effect = lambda h, default=None: {
        "origin": "https://alurku.id",
        "referer": None
    }.get(h.lower(), default)

    url = get_frontend_url(mock_request)
    assert url == "https://alurku.id"

    url_with_path = get_frontend_url(mock_request, "/masuk")
    assert url_with_path == "https://alurku.id/masuk"


def test_get_frontend_url_from_referer_fallback():
    mock_request = MagicMock()
    mock_request.headers.get.side_effect = lambda h, default=None: {
        "origin": None,
        "referer": "https://staging.alurku.app:8080/dashboard/projects"
    }.get(h.lower(), default)

    url = get_frontend_url(mock_request)
    assert url == "https://staging.alurku.app:8080"


def test_get_frontend_url_from_env_fallback():
    mock_request = MagicMock()
    mock_request.headers.get.side_effect = lambda h, default=None: None

    old_env = os.environ.get("FRONTEND_URL")
    try:
        os.environ["FRONTEND_URL"] = "https://custom-flow.com/"
        url = get_frontend_url(mock_request)
        assert url == "https://custom-flow.com"

        # Also when request is None (e.g. background tasks or cron)
        url_none = get_frontend_url(None)
        assert url_none == "https://custom-flow.com"
    finally:
        if old_env is not None:
            os.environ["FRONTEND_URL"] = old_env
        else:
            os.environ.pop("FRONTEND_URL", None)


def test_get_frontend_url_default_localhost():
    mock_request = MagicMock()
    mock_request.headers.get.side_effect = lambda h, default=None: None

    old_env = os.environ.get("FRONTEND_URL")
    try:
        if "FRONTEND_URL" in os.environ:
            del os.environ["FRONTEND_URL"]

        url = get_frontend_url(mock_request)
        assert url == "http://localhost:5173"

        url_none = get_frontend_url(None)
        assert url_none == "http://localhost:5173"
    finally:
        if old_env is not None:
            os.environ["FRONTEND_URL"] = old_env


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
