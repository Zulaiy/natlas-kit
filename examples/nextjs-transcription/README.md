# Next.js transcription

Copy `speech-input.tsx` into your React 19 / Next.js application. Add the `natlaskit` and `@natlaskit/react` workspace packages or build and install their local tarballs. The packages are not yet published.

Copy `apps/web/app/api/speech/[...path]/route.ts` into your app's `app/api/speech/[...path]/route.ts`. Configure server-side `NATLAS_API_URL` and `NATLAS_API_KEY`. Import `@natlaskit/react/styles.css` in your root layout to include the standalone component styling.

The complete running example is the website's `/playground` route.
