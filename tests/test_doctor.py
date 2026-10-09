import json
import httpx
from natlaskit.cli import doctor


def test_doctor_does_not_expose_credentials(monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "fixture-token-never-print")
    result = doctor(language="hausa")
    assert result["checks"]["hugging_face_token_configured"] is True
    assert result["model"] == "NCAIR1/Hausa-ASR"
    assert "fixture-token-never-print" not in json.dumps(result)
    assert "selected_model_access_verified" not in result["checks"]


def test_doctor_rejects_unrelated_health_response(monkeypatch):
    monkeypatch.setattr(
        httpx,
        "get",
        lambda *args, **kwargs: httpx.Response(200, json=["unrelated service"]),
    )
    result = doctor(endpoint="http://test-only")
    assert result["checks"]["service_reachable"] is False
    assert result["checks"]["service_model_access_verified"] is False
