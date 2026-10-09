# natlaskit TypeScript and JavaScript SDK

Submit audio to a natlaskit speech backend and poll for a transcript from the official N-ATLAS ASR model selected by language. Use a modern browser or Node.js 22+ with fetch, FormData, Blob and AbortSignal support.

This is a source release. Build and pack the SDK from the monorepo, then install the generated tarball in your application. The package is not published on npm yet.

```bash
pnpm build:packages
pnpm --filter natlaskit pack --pack-destination ./dist-packages
```

```ts
import { NatlasClient } from 'natlaskit';

const client = new NatlasClient({ baseUrl: 'http://127.0.0.1:8000' });
const result = await client.transcribe({
  audio: audioFile,
  language: 'hausa',
  onStatus: job => console.log(job.status),
});
console.log(result.text);
```

audioFile is a Blob or File supplied by your application. In a browser, use a server proxy such as the included Next.js route; keep API credentials on your server. Node applications can pass apiKey directly.

Use createTranscription and getTranscription for manual control. transcribe uploads once and polls; cancelling or timing out stops the client wait and leaves the accepted job on the backend. Jobs with malformed responses or failed inference raise NatlasError.

See the [source and examples](https://github.com/Zulaiy/natlas-kit). The SDK code is MIT licensed; official model access and licences are separate.
