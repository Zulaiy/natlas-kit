# natlaskit Python SDK

Use natlaskit to call a speech backend or run the official N-ATLAS ASR models on your CPU. The HTTP SDK needs HTTPX; local inference additionally needs FFmpeg, CPU PyTorch, Transformers and authorised access to the selected official model.

This is a source release. Install from the repository or a locally built wheel; the package is not published on PyPI yet.

```bash
uv pip install -e packages/python
uv run --no-project natlaskit transcribe recording.wav --language hausa --json
```

```python
from natlaskit import NatlasClient

with NatlasClient(base_url="http://127.0.0.1:8000") as client:
    result = client.transcribe("recording.wav", language="hausa")
    print(result.text)
```

For direct CPU inference, install the local extra with a recent uv version:

```bash
uv pip install --torch-backend cpu -e 'packages/python[local]'
uv run --no-project natlaskit doctor --language hausa --check-access
uv run --no-project natlaskit transcribe recording.wav --language hausa --local
```

Accept the official model's access terms and set HF_TOKEN in your local environment. Recordings must be non-empty, no larger than 10 MB and no longer than 30 seconds. Choose hausa, yoruba, igbo or english explicitly; automatic language detection is outside this release.

Use NATLAS_API_URL for a remote CLI endpoint and NATLAS_API_KEY for backend authentication. HTTP transcription polls for up to 300 seconds by default. A client timeout does not cancel an accepted job. Local model loading and inference are not limited by that polling deadline.

See the [source and documentation](https://github.com/Zulaiy/natlas-kit). The toolkit code is MIT licensed; model access and licences apply separately.
