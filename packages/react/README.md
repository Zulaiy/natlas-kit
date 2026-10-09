# natlaskit React Components

Add audio recording, uploads, language selection and transcript display to a React 19 application. The package exports AudioRecorder, AudioUploader, LanguageSelector, TranscriptionPanel, useRecorder and useTranscription.

This is a source release. Build the monorepo packages and install locally packed natlaskit and @natlaskit/react tarballs in your application. They are not published on npm yet.

```tsx
import { useCallback, useState } from 'react';
import { AudioRecorder, TranscriptionPanel, useTranscription } from '@natlaskit/react';

export function SpeechInput() {
  const [audio, setAudio] = useState<Blob | null>(null);
  const onAudio = useCallback((blob: Blob) => setAudio(blob), []);
  const { transcribe, job, status, error, busy } = useTranscription({ baseUrl: '/api/speech' });
  return <>
    <AudioRecorder onAudio={onAudio} disabled={busy} />
    <button disabled={!audio || busy} onClick={() => audio && transcribe(audio, 'hausa')}>Transcribe</button>
    <TranscriptionPanel text={job?.text} status={status} error={error} />
  </>;
}
```

Use a server proxy and keep credentials in the server environment. Components provide semantic HTML with nk-* classes; supply your own CSS. The website stylesheet is a reference. Browser recording needs localhost or HTTPS and microphone permission. AudioRecorder defaults to a 30-second maximum.

See the [Next.js example](https://github.com/Zulaiy/natlas-kit/tree/main/examples/nextjs-transcription). Toolkit code is MIT licensed. The official speech models retain their own access and licensing terms.
