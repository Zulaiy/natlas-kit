import { readFile } from "node:fs/promises";
import { NatlasClient } from "natlaskit";
const [path, language = "english"] = process.argv.slice(2);
if (!path)
  throw new Error(
    "Usage: node transcribe.mjs recording.wav [hausa|yoruba|igbo|english]",
  );
const client = new NatlasClient({
  baseUrl: process.env.NATLAS_API_URL ?? "http://127.0.0.1:8000",
  apiKey: process.env.NATLAS_API_KEY,
});
const result = await client.transcribe({
  audio: new Blob([await readFile(path)]),
  filename: path.split("/").pop(),
  language,
});
console.log(result.text);
