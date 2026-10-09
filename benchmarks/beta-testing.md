# natlaskit External Developer Beta Testing

Use this procedure to test whether developers outside the core team can reach a real N-ATLAS transcription and reuse the toolkit. The [PS1 challenge requirements](https://ncair.nitda.gov.ng/naic/#eligibility) require at least two external beta testers. Fixture tests do not count as these sessions.

## Before testing

Provide repository access and the quickstart. Choose a consented recording under 30 seconds for a language whose official model access has been accepted. The tester can use their own CPU backend or a team-hosted backend. Record which path they use: a hosted service does not validate local CPU setup.

Keep tokens, personal recordings and raw private transcripts out of a public repository. Ask the tester before retaining or publishing their name, screen recording or audio. Use an anonymous tester ID in the evidence table when appropriate.

## Tasks for each tester

1. Start from the documentation and record the start time, operating system and prior toolkit experience.
2. Install the Python SDK or TypeScript workspace. Run the doctor command for a local CPU setup.
3. Submit a real recording through the CLI or SDK. Record time to the first successful transcription, the official model ID and job result.
4. Open the playground, choose the recording language and complete recording or upload, transcription, copy and download.
5. Reuse a React component or one SDK call in a small application. Record which example was used and whether assistance was needed.
6. Report the clearest instructions, confusing steps, failures and the one change that would make integration easier.

Use the documentation without coaching for the first attempt. Record any subsequent assistance explicitly. Preserve failed attempts as well as successful ones.

## Session record

Copy this table for each real session. Blank fields are not completed results.

| Field                                                            | Recorded evidence |
| ---------------------------------------------------------------- | ----------------- |
| Tester ID and confirmation they are outside the core team        |                   |
| Session date and consent for evidence use                        |                   |
| Operating system, CPU, RAM and toolkit commit                    |                   |
| Local CPU or hosted backend                                      |                   |
| Python, Node and inference package versions                      |                   |
| Language and official model ID and revision                      |                   |
| Installation start and first successful transcript timestamps    |                   |
| Setup duration and whether a model download is included          |                   |
| Audio duration, format and recording provenance                  |                   |
| Transcript and reference transcript or private evidence location |                   |
| SDK or component integration task and outcome                    |                   |
| Failures, assistance and suggested improvements                  |                   |
| Linked fix and retest outcome                                    |                   |
| Sanitised screenshot, video or log evidence                      |                   |

## Report the outcomes

Report the number of actual external developers, the tasks they completed, their setup times and the main obstacles. Link fixes to observed problems. Do not replace incomplete sessions with hypothetical success claims. Keep the application outcome under 200 words and within its character limit.

For CPU measurements, distinguish first model load from repeated inference. Use the same consented clip for both measurements and record hardware and model revision. Installation time, model-download time and warm inference time answer different questions.

## Current evidence status

External sessions and real-model benchmarks have not been recorded in this repository. Add verified session records after testing; do not count the automated labelled fixtures as external developer evidence.
