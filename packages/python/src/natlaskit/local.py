from dataclasses import dataclass
from pathlib import Path
import os
import subprocess
import threading
import time
from .client import NatlasError

MODELS = {
    "hausa": "NCAIR1/Hausa-ASR",
    "yoruba": "NCAIR1/Yoruba-ASR",
    "igbo": "NCAIR1/Igbo-ASR",
    "english": "NCAIR1/NigerianAccentedEnglish",
}
LABELS = {
    "hausa": "Hausa",
    "yoruba": "Yoruba",
    "igbo": "Igbo",
    "english": "Nigerian English",
}


@dataclass
class LocalTranscription:
    text: str
    language: str
    model: str
    audio_duration_seconds: float
    processing_seconds: float


def decode_audio(path: str | Path, max_seconds: int = 30):
    path = Path(path)
    if not path.is_file() or not 0 < path.stat().st_size <= 10 * 1024 * 1024:
        raise NatlasError("Choose a non-empty audio file smaller than 10 MB.")
    try:
        import numpy as np
    except ImportError as exc:
        raise NatlasError(
            "Install the Python package with the local extra to process audio."
        ) from exc
    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-nostdin",
                "-v",
                "error",
                "-protocol_whitelist",
                "file,pipe",
                "-i",
                str(path.resolve()),
                "-t",
                str(max_seconds + 1),
                "-vn",
                "-ac",
                "1",
                "-ar",
                "16000",
                "-f",
                "s16le",
                "pipe:1",
            ],
            capture_output=True,
            check=True,
            timeout=30,
        )
    except FileNotFoundError as exc:
        raise NatlasError(
            "FFmpeg is required. Install it and restart the speech service."
        ) from exc
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise NatlasError(
            "Could not decode this recording. Try a WAV, MP3, M4A, OGG, or WebM audio file."
        ) from exc
    samples = np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768
    duration = len(samples) / 16000
    if duration < 0.1:
        raise NatlasError(
            "The recording is empty or too short. Record at least 0.1 seconds."
        )
    if duration > max_seconds:
        raise NatlasError(
            f"This CPU starter accepts recordings up to {max_seconds} seconds. Split longer recordings into shorter clips."
        )
    return samples, duration


class LocalSpeech:
    """Lazy CPU inference. Retains one official language model at a time."""

    def __init__(self):
        self._pipeline = None
        self._language = None
        self._lock = threading.Lock()

    @property
    def loaded_language(self):
        return self._language

    def transcribe(self, audio: str | Path, language: str = "english"):
        if language not in MODELS:
            raise NatlasError("Choose a supported N-ATLAS language.")
        with self._lock:
            started = time.monotonic()
            samples, duration = decode_audio(audio)
            if self._language != language:
                try:
                    import torch
                    from transformers import pipeline
                except ImportError as exc:
                    raise NatlasError(
                        "Install the Python package with the local extra: uv pip install --torch-backend cpu -e 'packages/python[local]'."
                    ) from exc
                self._pipeline = None
                self._language = None
                try:
                    self._pipeline = pipeline(
                        "automatic-speech-recognition",
                        model=MODELS[language],
                        device=-1,
                        dtype=torch.float32,
                        token=os.getenv("HF_TOKEN") or None,
                    )
                    self._language = language
                except Exception as exc:
                    raise NatlasError(
                        "Could not load the official N-ATLAS model. Accept its Hugging Face access terms, configure HF_TOKEN, and check your connection and available memory."
                    ) from exc
            try:
                result = self._pipeline({"array": samples, "sampling_rate": 16000})
            except Exception as exc:
                raise NatlasError(
                    "N-ATLAS inference failed. Check available memory and retry with a shorter recording."
                ) from exc
            return LocalTranscription(
                result["text"].strip(),
                language,
                MODELS[language],
                duration,
                round(time.monotonic() - started, 3),
            )
