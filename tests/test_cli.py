import json
import pytest
from natlaskit import LocalTranscription, NatlasError
from natlaskit.cli import main


def test_local_cli_keeps_unicode_and_metadata(monkeypatch, capsys):
    monkeypatch.setattr(
        "natlaskit.cli.LocalSpeech.transcribe",
        lambda self, audio, language: LocalTranscription(
            "Ẹ káàárọ̀", language, "NCAIR1/Yoruba-ASR", 1.0, 0.2
        ),
    )
    assert (
        main(["transcribe", "fixture.wav", "--language", "yoruba", "--local", "--json"])
        == 0
    )
    output = capsys.readouterr()
    assert "Ẹ káàárọ̀" in output.out
    assert json.loads(output.out)["model"] == "NCAIR1/Yoruba-ASR"
    assert not output.err


def test_remote_cli_uses_server_environment(monkeypatch, capsys):
    calls = []

    class FixtureClient:
        def __init__(self, endpoint, api_key):
            assert endpoint == "http://test-only:8000"
            assert api_key == "fixture-secret"

        def __enter__(self):
            return self

        def __exit__(self, *_):
            pass

        def transcribe(self, audio, language, timeout):
            calls.append((audio, language, timeout))
            return LocalTranscription(
                "Fixture transcript", language, "fixture model", 1, 0.2
            )

    monkeypatch.setenv("NATLAS_API_URL", "http://test-only:8000")
    monkeypatch.setenv("NATLAS_API_KEY", "fixture-secret")
    monkeypatch.setattr("natlaskit.cli.NatlasClient", FixtureClient)
    assert main(["transcribe", "fixture.wav", "--timeout", "600"]) == 0
    output = capsys.readouterr()
    assert output.out.strip() == "Fixture transcript"
    assert "fixture-secret" not in output.out + output.err
    assert calls == [("fixture.wav", "english", 600)]


def test_cli_failures_go_to_stderr(monkeypatch, capsys):
    def failed(*_):
        raise NatlasError("Accept the selected model terms.")

    monkeypatch.setattr("natlaskit.cli.LocalSpeech.transcribe", failed)
    assert main(["transcribe", "fixture.wav", "--local"]) == 1
    output = capsys.readouterr()
    assert not output.out
    assert "Accept the selected model terms" in output.err


@pytest.mark.parametrize("value", ["0", "-1", "nan", "inf"])
def test_cli_rejects_invalid_wait_limits(value):
    with pytest.raises(SystemExit) as error:
        main(["transcribe", "fixture.wav", "--timeout", value])
    assert error.value.code == 2
