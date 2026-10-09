import subprocess
from types import SimpleNamespace
import numpy as np
import pytest
from natlaskit import NatlasError
from natlaskit.local import decode_audio


@pytest.fixture
def recording(tmp_path):
    path = tmp_path / "fixture.wav"
    path.write_bytes(b"fixture audio")
    return path


def test_audio_normalisation_and_duration(monkeypatch, recording):
    samples = np.full(16000, 16384, dtype=np.int16)

    def decode(command, **kwargs):
        assert command[command.index("-ar") + 1] == "16000"
        assert command[command.index("-ac") + 1] == "1"
        assert command[command.index("-protocol_whitelist") + 1] == "file,pipe"
        return SimpleNamespace(stdout=samples.tobytes())

    monkeypatch.setattr(subprocess, "run", decode)
    audio, duration = decode_audio(recording)
    assert duration == 1
    assert audio.dtype == np.float32
    assert audio[0] == 0.5


def test_long_audio_rejected(monkeypatch, recording):
    monkeypatch.setattr(
        subprocess,
        "run",
        lambda *args, **kwargs: SimpleNamespace(
            stdout=np.zeros(31 * 16000, dtype=np.int16).tobytes()
        ),
    )
    with pytest.raises(NatlasError, match="up to 30 seconds"):
        decode_audio(recording)


def test_missing_decoder_error(monkeypatch, recording):
    def missing(*args, **kwargs):
        raise FileNotFoundError

    monkeypatch.setattr(subprocess, "run", missing)
    with pytest.raises(NatlasError, match="FFmpeg"):
        decode_audio(recording)


def test_missing_audio_rejected_before_decoding(tmp_path):
    with pytest.raises(NatlasError, match="non-empty audio file"):
        decode_audio(tmp_path / "missing.wav")
