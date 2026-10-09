# Contributing

Open an issue with the developer problem and a minimal reproduction, then submit a focused pull request. Keep examples and SDK interfaces aligned with the actual OpenAPI contract.

Run `pnpm typecheck`, `pnpm test`, `pnpm build`, and Python tests for the affected code. Regenerate the API contract after schema changes. Do not commit credentials, personal recordings, downloaded models or runtime databases.

Real-model evaluations must document model revision, hardware, audio provenance, transcription accuracy and cold/warm processing times. Fixture-based tests are not real-world validation evidence.
