"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  NatlasClient,
  languages,
  type Language,
  type TranscriptionJob,
  type JobStatus,
} from "natlaskit";
export { languages };
export type { Language, TranscriptionJob };

export function useRecorder({ maxSeconds = 30 }: { maxSeconds?: number } = {}) {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const acquiring = useRef(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const release = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    release();
    if (mounted.current) setRecording(false);
  }, [release]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);
  const start = useCallback(async () => {
    if (acquiring.current || recorder.current?.state === "recording") return;
    acquiring.current = true;
    const currentGeneration = ++generation.current;
    setStarting(true);
    setError(null);
    setAudio(null);
    setElapsed(0);
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          "Recording needs a supported browser on localhost or HTTPS. You can upload a file instead.",
        );
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || currentGeneration !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(
        media,
        mimeType ? { mimeType } : undefined,
      );
      recorder.current = instance;
      const chunks: BlobPart[] = [];
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      instance.onstop = () => {
        if (currentGeneration !== generation.current) return;
        release();
        if (mounted.current) {
          setAudio(new Blob(chunks, { type: instance.mimeType }));
          setRecording(false);
        }
      };
      instance.onerror = () => {
        stop();
        if (mounted.current)
          setError("Recording was interrupted. Try again or upload audio.");
      };
      instance.start();
      setRecording(true);
      const began = Date.now();
      timer.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - began) / 1000);
        if (mounted.current) setElapsed(Math.min(seconds, maxSeconds));
        if (seconds >= maxSeconds) stop();
      }, 200);
    } catch (cause) {
      release();
      if (mounted.current)
        setError(
          cause instanceof DOMException && cause.name === "NotAllowedError"
            ? "Microphone permission was denied. Allow access or upload a recording."
            : cause instanceof Error
              ? cause.message
              : "Could not access the microphone.",
        );
    } finally {
      acquiring.current = false;
      if (mounted.current) setStarting(false);
    }
  }, [maxSeconds, release, stop]);
  const clear = useCallback(() => {
    generation.current += 1;
    stop();
    setAudio(null);
    setElapsed(0);
    setError(null);
  }, [stop]);
  return { recording, starting, elapsed, audio, error, start, stop, clear };
}

export function useTranscription({
  baseUrl,
  apiKey,
}: {
  baseUrl: string;
  apiKey?: string;
}) {
  const [job, setJob] = useState<TranscriptionJob | null>(null);
  const [status, setStatus] = useState<JobStatus | "idle">("idle");
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const transcribe = useCallback(
    async (audio: Blob, language: Language, filename?: string) => {
      controller.current?.abort();
      const active = new AbortController();
      controller.current = active;
      setError(null);
      setJob(null);
      setStatus("queued");
      try {
        const result = await new NatlasClient({ baseUrl, apiKey }).transcribe({
          audio,
          language,
          filename,
          signal: active.signal,
          onStatus: (next) => {
            if (!active.signal.aborted) {
              setJob(next);
              setStatus(next.status);
            }
          },
        });
        if (!active.signal.aborted) {
          setJob(result);
          setStatus("completed");
        }
        return result;
      } catch (cause) {
        if (!active.signal.aborted) {
          setStatus("failed");
          setError(
            cause instanceof Error ? cause.message : "Transcription failed.",
          );
        }
        return null;
      }
    },
    [baseUrl, apiKey],
  );
  const reset = useCallback(() => {
    controller.current?.abort();
    setJob(null);
    setStatus("idle");
    setError(null);
  }, []);
  return {
    job,
    status,
    error,
    transcribe,
    reset,
    busy: status === "queued" || status === "running",
  };
}

export function LanguageSelector({
  value,
  onChange,
  disabled,
  className,
}: {
  value: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={className ?? "nk-language"}>
      <span>Language</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as Language)}
      >
        {languages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function AudioUploader({
  onAudio,
  disabled,
  className,
}: {
  onAudio: (file: File) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  function change(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.size || file.size > 10 * 1024 * 1024) {
      setError("Choose a non-empty audio file smaller than 10 MB.");
      return;
    }
    setError(null);
    onAudio(file);
  }
  return (
    <div className={className ?? "nk-uploader"}>
      <label>
        <span>Upload audio</span>
        <input
          aria-label="Upload audio"
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
          disabled={disabled}
          onChange={change}
        />
      </label>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function AudioRecorder({
  onAudio,
  disabled,
  maxSeconds = 30,
}: {
  onAudio: (audio: Blob) => void;
  disabled?: boolean;
  maxSeconds?: number;
}) {
  const { recording, starting, elapsed, audio, error, start, stop } =
    useRecorder({ maxSeconds });
  useEffect(() => {
    if (audio?.size) onAudio(audio);
  }, [audio, onAudio]);
  return (
    <div className="nk-recorder">
      <button
        type="button"
        disabled={disabled || starting}
        aria-pressed={recording}
        onClick={recording ? stop : start}
      >
        {recording
          ? `Stop recording · ${elapsed}s`
          : starting
            ? "Opening microphone…"
            : "Record audio"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function TranscriptionPanel({
  text,
  status = "idle",
  error,
}: {
  text?: string | null;
  status?: JobStatus | "idle";
  error?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [text]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text ?? "");
      setCopied(true);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <section className="nk-transcript" aria-label="Transcript">
      <div className="nk-transcript-heading">
        <span>Transcript</span>
        {text && (
          <button type="button" onClick={copy}>
            {copied ? "Copied" : "Copy text"}
          </button>
        )}
      </div>
      <div aria-live="polite">
        {error ? (
          <p role="alert">{error}</p>
        ) : (
          <p>
            {text ||
              (status === "completed"
                ? "No speech was detected. Try a clearer recording or check the selected language."
                : status === "queued"
                  ? "Waiting for the speech service…"
                  : status === "running"
                    ? "Transcribing your recording…"
                    : "Your transcript will appear here.")}
          </p>
        )}
        {copyError && (
          <p role="alert">
            Clipboard access is unavailable. Select the transcript to copy it.
          </p>
        )}
      </div>
    </section>
  );
}
