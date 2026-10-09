from dataclasses import dataclass
from pathlib import Path
import time
import httpx
import pytest
from fastapi.testclient import TestClient
from natlaskit import NatlasClient, NatlasError, LocalTranscription
from natlaskit_api.main import app


@pytest.fixture
def api(tmp_path, monkeypatch):
    monkeypatch.setenv("NATLAS_RUNTIME_DIR", str(tmp_path))
    monkeypatch.delenv("NATLAS_API_KEY", raising=False)
    with TestClient(app) as client:
        yield client


def wait(client, job_id):
    for _ in range(100):
        result = client.get(f"/v1/transcriptions/{job_id}").json()
        if result["status"] in ("completed", "failed"):
            return result
        time.sleep(0.01)
    pytest.fail("Job did not complete")


def test_upload_job_and_cleanup(api, monkeypatch):
    def transcribe(path, language):
        assert Path(path).read_bytes() == b"fixture audio"
        return LocalTranscription(
            "Test fixture transcript", language, "NCAIR1/Hausa-ASR", 1.0, 0.1
        )

    monkeypatch.setattr(app.state.runtime, "transcribe", transcribe)
    response = api.post(
        "/v1/transcriptions",
        files={"audio": ("recording.wav", b"fixture audio")},
        data={"language": "hausa"},
    )
    assert response.status_code == 202
    result = wait(api, response.json()["id"])
    assert result["text"] == "Test fixture transcript"
    assert result["model"] == "NCAIR1/Hausa-ASR"
    assert not list(app.state.directory.glob("audio-*"))


def test_model_failure_is_explicit(api, monkeypatch):
    def fail(*args):
        raise NatlasError("Accept the Hugging Face model terms.")

    monkeypatch.setattr(app.state.runtime, "transcribe", fail)
    job = api.post(
        "/v1/transcriptions",
        files={"audio": ("sample.wav", b"fixture")},
        data={"language": "igbo"},
    ).json()
    result = wait(api, job["id"])
    assert result["status"] == "failed"
    assert "Hugging Face" in result["error"]
    assert result["text"] is None


def test_invalid_uploads_and_unknown_jobs(api):
    assert (
        api.post(
            "/v1/transcriptions",
            files={"audio": ("empty.wav", b"")},
            data={"language": "hausa"},
        ).status_code
        == 400
    )
    assert (
        api.post(
            "/v1/transcriptions",
            files={"audio": ("sample.wav", b"x")},
            data={"language": "unsupported"},
        ).status_code
        == 422
    )
    assert api.get("/v1/transcriptions/missing").status_code == 404
    assert len(api.get("/v1/models").json()) == 4
    assert api.get("/health").json()["model_access_verified"] is False


def test_authentication(api, monkeypatch):
    monkeypatch.setenv("NATLAS_API_KEY", "test-credential")
    assert api.get("/v1/models").status_code == 401
    assert (
        api.get(
            "/v1/models", headers={"Authorization": "Bearer test-credential"}
        ).status_code
        == 200
    )


def test_python_sdk_multipart_polling(tmp_path):
    recording = tmp_path / "sample.wav"
    recording.write_bytes(b"fixture")
    calls = []

    def handler(request):
        calls.append(request)
        state = "queued" if request.method == "POST" else "completed"
        return httpx.Response(
            202 if state == "queued" else 200,
            json={
                "id": "test",
                "status": state,
                "language": "hausa",
                "model": "NCAIR1/Hausa-ASR",
                "text": "Test transcript" if state == "completed" else None,
            },
        )

    with NatlasClient(transport=httpx.MockTransport(handler)) as client:
        result = client.transcribe(recording, "hausa", poll_interval=0.001)
    assert result.text == "Test transcript"
    assert b'name="language"' in calls[0].content
    assert calls[1].url.path == "/v1/transcriptions/test"


def test_python_sdk_validation(tmp_path):
    path = tmp_path / "empty.wav"
    path.write_bytes(b"")
    with NatlasClient() as client:
        with pytest.raises(NatlasError):
            client.create_transcription(path, "hausa")
