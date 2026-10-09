import httpx
import pytest
from natlaskit import NatlasClient, NatlasError

JOB = {
    "id": "fixture",
    "status": "completed",
    "language": "hausa",
    "model": "NCAIR1/Hausa-ASR",
    "text": "Fixture transcript",
}


@pytest.mark.parametrize(
    "body",
    [
        [],
        "unexpected",
        {},
        {**JOB, "status": "unknown"},
        {**JOB, "text": None},
        {**JOB, "processing_seconds": -1},
        {**JOB, "audio_duration_seconds": True},
    ],
)
def test_sdk_rejects_invalid_job_contract(body):
    with NatlasClient(
        transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))
    ) as client:
        with pytest.raises(NatlasError, match="invalid transcription response"):
            client.get_transcription("fixture")


def test_sdk_accepts_additional_server_fields():
    with NatlasClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(200, json={**JOB, "future_field": 42})
        )
    ) as client:
        assert client.get_transcription("fixture").text == "Fixture transcript"


def test_sdk_handles_non_object_error_body():
    with NatlasClient(
        transport=httpx.MockTransport(
            lambda _: httpx.Response(502, json=["upstream failed"])
        )
    ) as client:
        with pytest.raises(NatlasError, match="rejected the request"):
            client.get_transcription("fixture")


def test_invalid_deadline_rejected_before_submission(tmp_path):
    with NatlasClient() as client:
        with pytest.raises(ValueError, match="positive"):
            client.transcribe(tmp_path / "missing.wav", timeout=float("inf"))
