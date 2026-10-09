import json
from natlaskit.cli import doctor


def test_doctor_does_not_expose_credentials(monkeypatch):
    monkeypatch.setenv("HF_TOKEN", "fixture-token-never-print")
    result = doctor(language="hausa")
    assert result["checks"]["hugging_face_token_configured"] is True
    assert result["model"] == "NCAIR1/Hausa-ASR"
    assert "fixture-token-never-print" not in json.dumps(result)
    assert "selected_model_access_verified" not in result["checks"]
