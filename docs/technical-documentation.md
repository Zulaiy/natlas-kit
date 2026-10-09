# natlaskit Technical Documentation

natlaskit provides tools for integrating the official N-ATLAS speech models into Python, TypeScript and React applications. This source release includes an HTTP SDK in each backend language, direct local CPU inference in Python, a FastAPI service, reusable React controls and a Next.js developer website.

## Architecture

Browser components send audio to the Next.js speech proxy. The proxy keeps the API credential on the server and calls the persistent FastAPI service. Python and Node applications can call that service directly through their SDK. A Python application can also use LocalSpeech directly.

FastAPI stores job metadata in SQLite and schedules inference on one background thread. FFmpeg decodes uploaded audio into mono 16 kHz samples. LocalSpeech loads the selected official model through Hugging Face Transformers on CPU in float32 precision and retains one language model at a time. Changing languages replaces the retained model.

## Official model registry

| Language                  | Hugging Face model             |
| ------------------------- | ------------------------------ |
| Hausa                     | NCAIR1/Hausa-ASR               |
| Yoruba                    | NCAIR1/Yoruba-ASR              |
| Igbo                      | NCAIR1/Igbo-ASR                |
| Nigerian-accented English | NCAIR1/NigerianAccentedEnglish |

Model weights are not included in the toolkit. Their access requirements and licences apply separately from the MIT toolkit licence. The natlaskit API is independent of an official hosted N-ATLAS API. Text generation and fine-tuning are outside this source release.

## Installation and configuration

Follow README.md or the Fumadocs quickstart for the runnable commands. Use Node.js 22+, pnpm, Python 3.11+, uv and FFmpeg. Install the local extra using uv with the explicit CPU backend option. That selects CPU PyTorch and supplies Transformers and NumPy. Use a recent uv version that supports this option.

Accept access to the selected official model on Hugging Face and configure HF_TOKEN in the speech process. Set NATLAS_API_URL in the Next.js server environment. If API authentication is enabled, set the same NATLAS_API_KEY in both services. Credentials must stay out of browser code and source control.

From the repository root:

```bash
pnpm install
uv venv
uv pip install --torch-backend cpu -e 'packages/python[local]' -e apps/api
uv run --no-project natlaskit doctor --language english --check-access
uv run --no-project uvicorn natlaskit_api.main:app --host 127.0.0.1 --port 8000 --workers 1
```

In a second terminal, copy apps/web/.env.example to apps/web/.env.local, configure the local backend URL and run `pnpm dev`. Open the playground from the website navigation. To transcribe without the website:

```bash
uv run --no-project natlaskit transcribe recording.wav --language hausa --json
```

For a Python integration:

```python
from natlaskit import NatlasClient

with NatlasClient(base_url="http://127.0.0.1:8000") as client:
    result = client.transcribe("recording.wav", language="hausa")
    print(result.text)
```

The doctor command reports dependencies and can check access by retrieving a small model configuration. A successful configuration check does not establish transcription accuracy or CPU performance.

## API and job lifecycle

| Endpoint                    | Behaviour                                                           |
| --------------------------- | ------------------------------------------------------------------- |
| GET /health                 | CPU service health and the currently loaded language                |
| GET /v1/models              | Official registry and loaded-model state                            |
| POST /v1/transcriptions     | Multipart audio and language; returns an accepted job with HTTP 202 |
| GET /v1/transcriptions/{id} | Retrieves queued, running, completed or failed state                |

The service accepts clips up to 10 MB and 30 seconds and limits pending or running jobs to 16. Inference processes one job at a time. SDK transcription calls submit once and poll; they do not retry uploads automatically. Stopping client polling does not cancel an accepted server job.

SDKs validate job response shape and known states. Invalid responses raise NatlasError. A completed empty transcript means that the model returned no detected speech. The playground identifies disconnected services, rejected API credentials and the selected model's loaded state.

## React audio library

Import `@natlaskit/react/styles.css` once in your application entry. The standalone stylesheet supports light and dark themes and CSS variable overrides. The library includes AudioRecorder, AudioPlayer, AudioUploader, LiveWaveform, Waveform, ScrubBar, VoiceButton, MicSelector, LanguageSelector, TranscriptViewer and SpeechStatus, plus recording and transcription hooks.

Recording supports pause, resume, discard and microphone selection. Live levels come from the actual microphone stream; player waveforms are decoded from the selected file. Transcript text and JSON can be copied or downloaded. The studio uses these same reusable controls. See the React documentation for props and integration examples.

## Audio and result retention

Uploaded audio is stored temporarily and deleted after processing, including failures. Unfinished jobs are marked failed on a service restart, and abandoned audio files are removed. Completed and failed job records older than an hour are removed when new jobs are submitted. Applications needing durable transcripts should save completed results in their own storage.

## Deployment

Run one FastAPI process for this starter. The included Dockerfile installs FFmpeg and CPU PyTorch and runs as an unprivileged user. Preserve the Hugging Face cache to avoid repeated model downloads. Deploy the Next.js application separately with the speech endpoint and API credential configured server-side.

Shared queues, multi-instance inference, streaming transcription and long recordings require further implementation. Public deployments need appropriate gateway rate limits. There are no measured latency or accuracy claims in this release.

## Validation and evidence

Automated tests use labelled fixtures to exercise uploads, job processing and failures, audio constraints, SDK response validation, command-line behaviour and credential handling. Browser checks cover recording, pause/resume, microphone cleanup, waveform playback and seeking, drag-and-drop upload, transcript actions, themes, SDK examples, documentation search and mobile layout. The five Playwright regression tests run with `pnpm --filter @natlaskit/web test:ui` against the built website; install Chromium first with `pnpm --filter @natlaskit/web exec playwright install chromium`.

Real N-ATLAS transcription still requires authorised model access and recordings. For challenge evidence, collect the model revision, hardware, cold and warm timing, reference transcript, actual transcript and external developer session records. See benchmarks/beta-testing.md for the procedure.

## Source and contribution

[Source repository](https://github.com/Zulaiy/natlas-kit). Contributions follow CONTRIBUTING.md. The generated API contract is in contracts/openapi.json, and the Fumadocs API guide is generated from the same backend schema.
