# natlaskit

Python and TypeScript SDKs, React components, and practical documentation for building with official N-ATLAS speech models.

## What's here

- Next.js landing page, speech playground, examples and Fumadocs documentation.
- Python HTTP SDK and optional local Hugging Face Transformers adapter.
- TypeScript SDK with multipart uploads, asynchronous job polling and cancellation.
- React recorder, uploader, language selector, transcript panel and hooks.
- CPU FastAPI speech service, single worker, temporary job storage and OpenAPI contract.

This is a source release: packages are not yet on npm/PyPI. Real N-ATLAS inference requires model access, `HF_TOKEN`, FFmpeg and local inference dependencies. Automated tests use labelled fixtures; real-model accuracy and CPU benchmarks remain to be collected.

## Website

Use Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

The landing page, documentation, component examples and recording interface work without a speech backend. To enable transcription, copy `apps/web/.env.example` to `apps/web/.env.local` and configure the service URL.

## Speech service

Use Python 3.11+, uv and FFmpeg. Accept the official models' Hugging Face access terms and export `HF_TOKEN` in your shell.

```bash
uv venv
uv pip install -e 'packages/python[local]' -e apps/api
uv run --no-project uvicorn natlaskit_api.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Models load lazily. The starter accepts 30-second clips up to 10 MB and processes one job at a time. The model registry targets Hausa, Yoruba, Igbo and Nigerian-accented English. Support quality must be validated with actual recordings.

Use `.venv/bin/python -m natlaskit doctor` to check CPU prerequisites. Add `--endpoint http://127.0.0.1:8000` to check a running service, or `--language english --check-access` to verify access to the small model configuration without downloading weights.

## Checks

```bash
pnpm typecheck
pnpm test
pnpm build
uv pip install -e packages/python -e apps/api pytest numpy
uv run --no-project pytest tests
.venv/bin/python scripts/export_openapi.py
```

## Repository

`apps/web` contains the public developer experience; `apps/api` is the CPU service; `packages` contains independently usable SDKs and React components; `examples` demonstrates integration; `contracts` contains generated OpenAPI; `benchmarks` documents real-model validation.

See the Fumadocs guides under `apps/web/content/docs` for installation, deployment, API usage and limitations.

## Attribution and licence

Toolkit code is MIT licensed. Model weights are not distributed here and retain their own access and licensing terms. N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies. natlaskit is an independent developer toolkit.
