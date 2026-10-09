import argparse
from dataclasses import asdict
import importlib.util
import json
import os
import shutil
import sys
import httpx
from .client import NatlasClient, NatlasError
from .local import LocalSpeech, MODELS


def doctor(
    endpoint: str | None = None, language: str = "english", check_access: bool = False
):
    checks = {
        "ffmpeg": shutil.which("ffmpeg") is not None,
        "torch": importlib.util.find_spec("torch") is not None,
        "transformers": importlib.util.find_spec("transformers") is not None,
        "numpy": importlib.util.find_spec("numpy") is not None,
        "hugging_face_token_configured": bool(os.getenv("HF_TOKEN")),
    }
    hints = []
    if not checks["ffmpeg"]:
        hints.append("Install FFmpeg and make it available on PATH.")
    if not all(checks[key] for key in ("torch", "transformers", "numpy")):
        hints.append(
            "Install the local extra: uv pip install --torch-backend cpu -e 'packages/python[local]'."
        )
    if endpoint:
        try:
            response = httpx.get(endpoint.rstrip("/") + "/health", timeout=5)
            body = response.json()
            checks["service_reachable"] = (
                response.is_success
                and isinstance(body, dict)
                and body.get("status") == "ok"
            )
            checks["service_model_access_verified"] = (
                checks["service_reachable"]
                and body.get("model_access_verified") is True
            )
        except (httpx.HTTPError, ValueError):
            checks["service_reachable"] = False
            checks["service_model_access_verified"] = False
        if not checks["service_reachable"]:
            hints.append("Start the speech service and check its endpoint.")
    if check_access:
        try:
            from huggingface_hub import hf_hub_download

            hf_hub_download(
                MODELS[language], "config.json", token=os.getenv("HF_TOKEN") or None
            )
            checks["selected_model_access_verified"] = True
        except Exception:
            checks["selected_model_access_verified"] = False
            hints.append(
                "Accept the selected model terms on Hugging Face and configure your access token. This check downloads only the small model configuration."
            )
    return {
        "language": language,
        "model": MODELS[language],
        "checks": checks,
        "hints": hints,
    }


def positive_seconds(value: str) -> float:
    import math

    seconds = float(value)
    if not math.isfinite(seconds) or seconds <= 0:
        raise argparse.ArgumentTypeError("Use a positive number of seconds.")
    return seconds


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="natlaskit")
    commands = parser.add_subparsers(dest="command", required=True)
    check = commands.add_parser(
        "doctor", help="Check CPU speech prerequisites without exposing credentials"
    )
    check.add_argument("--endpoint")
    check.add_argument("--language", choices=list(MODELS), default="english")
    check.add_argument(
        "--check-access",
        action="store_true",
        help="Verify access by downloading the model configuration, not weights",
    )
    transcription = commands.add_parser(
        "transcribe",
        help="Transcribe a recording with the speech service or local CPU models",
    )
    transcription.add_argument(
        "audio", help="Path to an audio file up to 30 seconds and 10 MB"
    )
    transcription.add_argument("--language", choices=list(MODELS), default="english")
    mode = transcription.add_mutually_exclusive_group()
    mode.add_argument(
        "--local", action="store_true", help="Run official models on this CPU"
    )
    mode.add_argument(
        "--endpoint",
        help="Speech service URL; defaults to NATLAS_API_URL or localhost:8000",
    )
    transcription.add_argument(
        "--timeout",
        type=positive_seconds,
        default=300,
        help="Remote wait limit in seconds (default: 300); local inference is not time limited",
    )
    transcription.add_argument(
        "--json",
        action="store_true",
        help="Print transcript and model metadata as JSON",
    )
    args = parser.parse_args(argv)
    try:
        if args.command == "doctor":
            print(
                json.dumps(
                    doctor(args.endpoint, args.language, args.check_access), indent=2
                )
            )
            return 0
        if args.local:
            result = LocalSpeech().transcribe(args.audio, args.language)
        else:
            endpoint = (
                args.endpoint or os.getenv("NATLAS_API_URL") or "http://127.0.0.1:8000"
            )
            with NatlasClient(endpoint, api_key=os.getenv("NATLAS_API_KEY")) as client:
                result = client.transcribe(
                    args.audio, args.language, timeout=args.timeout
                )
        print(
            json.dumps(asdict(result), ensure_ascii=False, indent=2)
            if args.json
            else result.text
        )
        return 0
    except (NatlasError, OSError) as exc:
        print(f"natlaskit: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print(
            "natlaskit: Stopped waiting. An accepted server job may still finish.",
            file=sys.stderr,
        )
        return 130
