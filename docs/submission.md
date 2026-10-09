# natlaskit Developer Infrastructure Submission Draft

natlaskit is a speech developer toolkit for PS1, Developer Infrastructure. Its SDKs, CPU service, React components, playground and documentation are implemented. Real N-ATLAS transcription, language quality and external beta testing still need validation before the application is submitted.

## One line summary

natlaskit makes N-ATLAS speech integration easier with Python and TypeScript SDKs, reusable React components, a CPU backend, and practical documentation.

## Why we chose this problem statement

N-ATLAS model availability does not remove the work of handling access, audio formats, inference, API calls and interface design. Nigerian developers need a clear path from a recording to a usable integration. We chose developer infrastructure to provide reusable Python and TypeScript tools, CPU deployment guidance and working UI components that other teams can build on.

## Artefact description

natlaskit provides Python and TypeScript SDKs for audio uploads and transcription jobs, a Python adapter for the official N-ATLAS ASR models, and a FastAPI CPU backend. React components cover recording, uploading, language selection and transcript display. A Next.js website combines an interactive playground with Fumadocs guides and integration examples. The backend normalises audio to mono 16 kHz, processes one job at a time, retains one language model, and deletes recordings after processing. It targets Hausa, Yoruba, Igbo and Nigerian-accented English. The toolkit code is MIT licensed and includes a contribution guide. Automated checks validate SDK contracts and job handling with labelled fixtures. Real-model performance and external beta-test results remain to be collected.

## Current build status

Prototype implemented; real-model validation and external beta testing pending. Select the closest available application status without claiming deployment or completed beta testing.

## N-ATLAS capability

Select **N-ATLAS ASR (speech-to-text)**. The SDK calls the natlaskit backend, which loads the official NCAIR1 speech model weights through Hugging Face Transformers. This backend is an independent toolkit API; it is not an official N-ATLAS hosted endpoint. Text generation and fine-tuning are future extensions.

## Nigerian languages

The model registry targets Yoruba, Hausa, Igbo and Nigerian-accented English. Confirm each language with an actual model run before representing it as tested support.

## Technology stack

Python, FastAPI, HTTPX, PyTorch on CPU, Hugging Face Transformers, FFmpeg and SQLite; TypeScript/JavaScript, React, Next.js, Fumadocs, Tailwind CSS, pnpm and GitHub Actions. The website proxies requests to a persistent speech worker. Hosted infrastructure is not deployed yet.

## Repository and working artefact links

[natlaskit repository](https://github.com/Zulaiy/natlas-kit). The repository is currently private. The evaluation panel needs an accessible repository or deployed application. A public PS1 repository must include the MIT licence and CONTRIBUTING.md already present in this build.

## Toolkit components

Select **More than one**: Python/JavaScript SDK, interactive playground, and developer documentation portal. Reusable React UI components and the CPU backend accompany them. A fine-tuning starter kit is outside the implemented scope.

## First time developer journey

A developer follows the quickstart to clone natlaskit, install the workspace and Python packages, and configure access to the official N-ATLAS ASR model for their language. The doctor command checks FFmpeg, CPU inference dependencies and model access without printing credentials. They start the included speech service, connect the Next.js playground, and record or upload a short clip. The service decodes the audio, loads the selected official model and returns a transcription job. The playground shows progress and lets them copy or download the transcript. The same integration is available through the Python SDK, TypeScript SDK or command-line tool. A React application can reuse the recorder, uploader, language selector and transcript panel. Documentation explains model provenance, API behaviour, access failures, CPU limits and deployment. This journey still requires end-to-end validation with an authorised model and recordings.

## External beta tester count

Enter the verified number after testing. No external beta-test sessions have been documented in this repository yet. PS1 requires at least two developers outside the core team.

## Beta test outcome

External beta testing is pending. No outcome is claimed yet. The evidence will record each developer's environment, setup time, first successful N-ATLAS transcription, integration path, obstacles and resulting fixes. Consented screenshots or recordings and sanitised logs will support the results. Automated fixture tests are separate from beta-test evidence.

## Technical documentation

The Fumadocs guides cover installation, Python and TypeScript SDK usage, React components, CLI commands, model provenance, API reference and CPU deployment. Attach an exported technical document if the form requires a file; use docs/technical-documentation.md as the source.

## Video demonstration outline

Prepare a four-minute recording after real inference works:

1. 0:00–0:30: Show the developer problem, repository and supported toolkit components.
2. 0:30–1:15: Show the quickstart and doctor report, with all credentials hidden.
3. 1:15–2:15: Record a consented clip and show a real N-ATLAS transcript in the playground.
4. 2:15–3:15: Run the Python or TypeScript example and show the same integration in a small application.
5. 3:15–4:00: Show external beta-test evidence, measured CPU results and contribution instructions.

Do not present sample UI text or automated fixtures as model-generated evidence.

## Submission requirements and date

The [official challenge requirements](https://ncair.nitda.gov.ng/naic/#eligibility) require a functioning N-ATLAS integration, real-world validation, technical documentation, a 3–5 minute video, team details and the relevant track evidence. PS1 requires at least two external beta testers. The deadline is **12 October 2026 at 11:59 PM WAT**.

Team identity, track eligibility, registration or ID evidence and the final beta-test count must be supplied by the team. The challenge page lists inconsistent Innovation and Enterprise team sizes in its track section and FAQ; confirm the applicable size in the application form before submission.
