export const languages = [
  { id: "hausa", label: "Hausa", code: "HA", model: "NCAIR1/Hausa-ASR" },
  { id: "yoruba", label: "Yoruba", code: "YO", model: "NCAIR1/Yoruba-ASR" },
  { id: "igbo", label: "Igbo", code: "IG", model: "NCAIR1/Igbo-ASR" },
  {
    id: "english",
    label: "Nigerian English",
    code: "EN",
    model: "NCAIR1/NigerianAccentedEnglish",
  },
] as const;
export type Language = (typeof languages)[number]["id"];
export type JobStatus = "queued" | "running" | "completed" | "failed";
export interface TranscriptionJob {
  id: string;
  status: JobStatus;
  language: Language;
  model: string;
  text: string | null;
  error: string | null;
  audio_duration_seconds: number | null;
  processing_seconds: number | null;
}
export interface ModelInfo {
  id: Language;
  label: string;
  model: string;
  loaded: boolean;
}
export class NatlasError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "NatlasError";
  }
}
export interface ClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
}
export interface TranscribeOptions {
  audio: Blob;
  language: Language;
  filename?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  pollIntervalMs?: number;
  onStatus?: (job: TranscriptionJob) => void;
}
function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}
export class NatlasClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof globalThis.fetch;
  constructor(private readonly options: ClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetcher = options.fetch ?? globalThis.fetch.bind(globalThis);
  }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.options.apiKey)
      headers.set("Authorization", `Bearer ${this.options.apiKey}`);
    let response: Response;
    try {
      response = await this.fetcher(`${this.baseUrl}${path}`, {
        ...init,
        headers,
      });
    } catch (error) {
      if (init.signal?.aborted) throw error;
      throw new NatlasError(
        "Could not reach the speech service. Check your endpoint and connection.",
      );
    }
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new NatlasError(
        typeof body?.detail === "string"
          ? body.detail
          : (body?.error ?? `Speech service returned ${response.status}.`),
        response.status,
      );
    if (body === null || typeof body !== "object")
      throw new NatlasError("The speech service returned an invalid response.");
    return body as T;
  }
  models(signal?: AbortSignal) {
    return this.request<ModelInfo[]>("/v1/models", { signal });
  }
  getTranscription(id: string, signal?: AbortSignal) {
    return this.request<TranscriptionJob>(
      `/v1/transcriptions/${encodeURIComponent(id)}`,
      { signal },
    );
  }
  createTranscription({
    audio,
    language,
    filename,
    signal,
  }: TranscribeOptions) {
    if (!languages.some((item) => item.id === language))
      throw new NatlasError("Choose a supported N-ATLAS language.");
    if (!audio.size) throw new NatlasError("The audio file is empty.");
    if (audio.size > 10 * 1024 * 1024)
      throw new NatlasError("Audio must be smaller than 10 MB.");
    const form = new FormData();
    form.append(
      "audio",
      audio,
      filename ??
        (audio.type.includes("webm") ? "recording.webm" : "recording.wav"),
    );
    form.append("language", language);
    return this.request<TranscriptionJob>("/v1/transcriptions", {
      method: "POST",
      body: form,
      signal,
    });
  }
  async transcribe(options: TranscribeOptions): Promise<TranscriptionJob> {
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 300_000);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout])
      : timeout;
    let job = await this.createTranscription({ ...options, signal });
    options.onStatus?.(job);
    while (job.status === "queued" || job.status === "running") {
      await sleep(options.pollIntervalMs ?? 1000, signal);
      job = await this.getTranscription(job.id, signal);
      options.onStatus?.(job);
    }
    if (job.status === "failed")
      throw new NatlasError(job.error ?? "Transcription failed.");
    return job;
  }
}
