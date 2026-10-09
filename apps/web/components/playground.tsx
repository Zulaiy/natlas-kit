"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  TranscriptionPanel,
  useTranscription,
} from "@natlaskit/react";
import { languages, type Language } from "natlaskit";
import {
  ArrowRight,
  AudioLines,
  Download,
  FileAudio,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
export function Playground({
  initialLanguage = "english",
}: {
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("recording.webm");
  const [url, setUrl] = useState<string | null>(null);
  const [connection, setConnection] = useState<
    "checking" | "connected" | "offline" | "unconfigured"
  >("checking");
  const { job, status, error, transcribe, busy, reset } = useTranscription({
    baseUrl: "/api/speech",
  });
  const model = languages.find((item) => item.id === language)!;
  const check = useCallback(async () => {
    setConnection("checking");
    try {
      const response = await fetch("/api/status");
      const data = await response.json();
      setConnection(data.status ?? "offline");
    } catch {
      setConnection("offline");
    }
  }, []);
  useEffect(() => {
    void check();
  }, [check]);
  useEffect(() => {
    if (!audio) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(audio);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [audio]);
  const recorded = useCallback(
    (blob: Blob) => {
      setAudio(blob);
      setFilename(
        blob.type.includes("mp4")
          ? "recording.m4a"
          : blob.type.includes("ogg")
            ? "recording.ogg"
            : "recording.webm",
      );
      reset();
    },
    [reset],
  );
  function uploaded(file: File) {
    setAudio(file);
    setFilename(file.name);
    reset();
  }
  function download() {
    if (!job?.text) return;
    const target = URL.createObjectURL(
      new Blob([job.text], { type: "text/plain" }),
    );
    const anchor = document.createElement("a");
    anchor.href = target;
    anchor.download = `natlaskit-${language}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(target), 1000);
  }
  return (
    <div className="playground-shell">
      <div className="connection-bar">
        <span
          className={`status-dot ${connection !== "connected" ? "muted" : ""}`}
        />
        <span>
          {connection === "connected"
            ? "Speech service connected"
            : connection === "checking"
              ? "Checking speech service…"
              : connection === "unconfigured"
                ? "Connect a speech service to transcribe"
                : "Speech service is unavailable"}
        </span>
        <button onClick={check} aria-label="Check speech service again">
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="playground-grid">
        <section className="input-panel">
          <div className="panel-heading">
            <span className="small-label">01 / YOUR AUDIO</span>
            <AudioLines size={19} />
          </div>
          <LanguageSelector
            value={language}
            disabled={busy}
            onChange={(next) => {
              setLanguage(next);
              reset();
            }}
          />
          <div className="record-zone">
            <div className="record-illustration" aria-hidden="true">
              <AudioLines size={45} strokeWidth={1} />
            </div>
            <h3>A voice note is all it takes.</h3>
            <p>Record up to 30 seconds, or upload a short audio file.</p>
            <AudioRecorder onAudio={recorded} disabled={busy} />
            <div className="or-divider">
              <span />
              or
              <span />
            </div>
            <AudioUploader onAudio={uploaded} disabled={busy} />
          </div>
          {audio && (
            <div className="selected-audio">
              <div>
                <FileAudio size={16} />
                <span>{filename}</span>
                <span>{(audio.size / 1024).toFixed(0)} KB</span>
              </div>
              {url && <audio controls src={url} />}
              <button
                className="text-link"
                disabled={busy}
                onClick={() => {
                  setAudio(null);
                  reset();
                }}
              >
                Remove recording
              </button>
            </div>
          )}
          <button
            className="button primary transcribe-button"
            disabled={!audio || busy || connection !== "connected"}
            onClick={() => {
              if (audio) void transcribe(audio, language, filename);
            }}
          >
            {busy ? "Transcribing…" : "Transcribe audio"}
            <ArrowRight size={17} />
          </button>
          <p className="model-note">
            Model: <code>{model.model}</code>
          </p>
        </section>
        <section className="output-panel">
          <div className="panel-heading">
            <span className="small-label">02 / YOUR TRANSCRIPT</span>
            <span className="preview-badge">
              {status === "idle" ? "Ready when you are" : status}
            </span>
          </div>
          <TranscriptionPanel text={job?.text} status={status} error={error} />
          {job?.status === "completed" && (
            <div className="result-meta">
              <span>
                {job.audio_duration_seconds?.toFixed(1)}s audio ·{" "}
                {job.processing_seconds?.toFixed(1)}s processing
              </span>
              <button onClick={download}>
                <Download size={14} /> Download
              </button>
            </div>
          )}
          <div className="output-note">
            <span className="tiny-cross">+</span>
            <p>
              Transcripts here come from your connected N-ATLAS service. CPU
              processing time depends on your machine and recording length.
            </p>
          </div>
          {connection !== "connected" && (
            <div className="setup-note">
              <strong>Bring your own backend.</strong>
              <p>
                Start the Python speech service, accept the model access terms
                on Hugging Face, and configure the website endpoint.
              </p>
              <Link className="text-link" href="/docs/quickstart">
                Set up your service <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
