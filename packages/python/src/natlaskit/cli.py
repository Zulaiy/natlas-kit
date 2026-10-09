import argparse
import importlib.util
import json
import os
import shutil
import httpx
from .local import MODELS


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
            "Install the local extra: uv pip install -e 'packages/python[local]'."
        )
    if endpoint:
        try:
            response = httpx.get(endpoint.rstrip("/") + "/health", timeout=5)
            checks["service_reachable"] = response.is_success
            checks["service_model_access_verified"] = (
                response.is_success
                and response.json().get("model_access_verified", False)
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


def main():
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
    args = parser.parse_args()
    print(json.dumps(doctor(args.endpoint, args.language, args.check_access), indent=2))
