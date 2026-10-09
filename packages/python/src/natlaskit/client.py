from dataclasses import dataclass
from pathlib import Path
import mimetypes
import math
import time
from typing import Literal
import httpx

Language = Literal["hausa", "yoruba", "igbo", "english"]


class NatlasError(RuntimeError):
    pass


@dataclass
class TranscriptionJob:
    id: str
    status: str
    language: str
    model: str
    text: str | None = None
    error: str | None = None
    audio_duration_seconds: float | None = None
    processing_seconds: float | None = None


class NatlasClient:
    """HTTP SDK. Model dependencies are only needed for LocalSpeech."""

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:8000",
        api_key: str | None = None,
        *,
        transport: httpx.BaseTransport | None = None,
    ):
        self._http = httpx.Client(
            base_url=base_url.rstrip("/"),
            headers={"Authorization": f"Bearer {api_key}"} if api_key else {},
            timeout=15,
            transport=transport,
        )

    def close(self):
        self._http.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()

    def _request(self, method, path, **kwargs):
        try:
            response = self._http.request(method, path, **kwargs)
        except httpx.HTTPError as exc:
            raise NatlasError(
                "Could not reach the speech service. Check your endpoint and connection."
            ) from exc
        try:
            body = response.json()
        except ValueError as exc:
            raise NatlasError(
                "The speech service returned an invalid response."
            ) from exc
        if not response.is_success:
            detail = body.get("detail") if isinstance(body, dict) else None
            raise NatlasError(
                detail
                if isinstance(detail, str)
                else "Speech service rejected the request."
            )
        return body

    @staticmethod
    def _job(body):
        message = "The speech service returned an invalid transcription response."
        if not isinstance(body, dict):
            raise NatlasError(message)
        if (
            not isinstance(body.get("id"), str)
            or not body["id"]
            or body.get("status") not in ("queued", "running", "completed", "failed")
            or body.get("language") not in ("hausa", "yoruba", "igbo", "english")
            or not isinstance(body.get("model"), str)
            or not body["model"]
        ):
            raise NatlasError(message)
        for key in ("text", "error"):
            if body.get(key) is not None and not isinstance(body[key], str):
                raise NatlasError(message)
        if body["status"] == "completed" and not isinstance(body.get("text"), str):
            raise NatlasError(message)
        for key in ("audio_duration_seconds", "processing_seconds"):
            value = body.get(key)
            if value is not None and (
                type(value) not in (int, float) or not math.isfinite(value) or value < 0
            ):
                raise NatlasError(message)
        return TranscriptionJob(
            **{
                key: body[key]
                for key in TranscriptionJob.__dataclass_fields__
                if key in body
            }
        )

    def models(self):
        return self._request("GET", "/v1/models")

    def get_transcription(self, job_id: str, *, request_timeout: float = 15):
        from urllib.parse import quote

        return self._job(
            self._request(
                "GET",
                f"/v1/transcriptions/{quote(job_id, safe='')}",
                timeout=request_timeout,
            )
        )

    def create_transcription(
        self, audio: str | Path, language: Language, *, request_timeout: float = 15
    ):
        if language not in ("hausa", "yoruba", "igbo", "english"):
            raise NatlasError("Choose a supported N-ATLAS language.")
        path = Path(audio)
        if not path.is_file() or not 0 < path.stat().st_size <= 10 * 1024 * 1024:
            raise NatlasError("Choose a non-empty audio file smaller than 10 MB.")
        with path.open("rb") as file:
            body = self._request(
                "POST",
                "/v1/transcriptions",
                files={
                    "audio": (
                        path.name,
                        file,
                        mimetypes.guess_type(path.name)[0]
                        or "application/octet-stream",
                    )
                },
                data={"language": language},
                timeout=request_timeout,
            )
        return self._job(body)

    def transcribe(
        self,
        audio: str | Path,
        language: Language = "english",
        *,
        timeout: float = 300,
        poll_interval: float = 1,
    ):
        if (
            not math.isfinite(timeout)
            or not math.isfinite(poll_interval)
            or timeout <= 0
            or poll_interval <= 0
        ):
            raise ValueError("timeout and poll_interval must be positive")
        deadline = time.monotonic() + timeout
        job = self.create_transcription(
            audio, language, request_timeout=min(15, timeout)
        )
        while job.status in ("queued", "running"):
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise NatlasError(
                    "Transcription timed out. The server job may still finish."
                )
            time.sleep(min(poll_interval, remaining))
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise NatlasError(
                    "Transcription timed out. The server job may still finish."
                )
            job = self.get_transcription(job.id, request_timeout=min(15, remaining))
        if job.status == "failed":
            raise NatlasError(job.error or "Transcription failed.")
        return job
