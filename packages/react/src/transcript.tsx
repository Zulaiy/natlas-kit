"use client";
import { useEffect, useId, useState } from "react";
import type { JobStatus, TranscriptionJob } from "natlaskit";
import { cx, formatTime, Icon } from "./icons";

export function SpeechStatus({
  status = "idle",
}: {
  status?: JobStatus | "idle";
}) {
  const labels = {
    idle: "Ready",
    queued: "Queued",
    running: "Processing",
    completed: "Completed",
    failed: "Failed",
  };
  return (
    <span className={cx("nk-ui nk-speech-status", "nk-status-" + status)}>
      <i />
      {labels[status]}
    </span>
  );
}
function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function TranscriptionPanel({
  text,
  status,
  error,
  job,
  onRetry,
}: {
  text?: string | null;
  status?: JobStatus | "idle";
  error?: string | null;
  job?: TranscriptionJob | null;
  onRetry?: () => void;
}) {
  const uid = useId();
  const state = status ?? job?.status ?? "idle";
  const transcript = text ?? job?.text ?? "";
  const failure = error ?? job?.error;
  const [view, setView] = useState<"text" | "json">("text");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [transcript, view]);
  useEffect(() => {
    if (!transcript && !job) setView("text");
  }, [transcript, job]);
  const json = JSON.stringify(
    job ?? { text: transcript, status: state },
    null,
    2,
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(view === "json" ? json : transcript);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  const busy = state === "queued" || state === "running";
  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  return (
    <section className="nk-ui nk-transcript" aria-label="Transcript">
      <div className="nk-transcript-toolbar">
        <div
          className="nk-view-tabs"
          role="tablist"
          aria-label="Transcript format"
        >
          <button
            type="button"
            role="tab"
            id={uid + "text"}
            aria-controls={uid + "panel"}
            tabIndex={view === "text" ? 0 : -1}
            onKeyDown={(event) => {
              if (
                (event.key === "ArrowRight" || event.key === "ArrowLeft") &&
                (transcript || job)
              ) {
                event.preventDefault();
                setView("json");
                document.getElementById(uid + "json")?.focus();
              }
            }}
            aria-selected={view === "text"}
            onClick={() => setView("text")}
          >
            <Icon name="text" width="14" />
            Transcript
          </button>
          <button
            type="button"
            role="tab"
            id={uid + "json"}
            aria-controls={uid + "panel"}
            tabIndex={view === "json" ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setView("text");
                document.getElementById(uid + "text")?.focus();
              }
            }}
            aria-selected={view === "json"}
            onClick={() => setView("json")}
            disabled={!transcript && !job}
          >
            <Icon name="code" width="14" />
            JSON
          </button>
        </div>
        <div className="nk-output-actions">
          <button
            type="button"
            className="nk-icon-button"
            aria-label={copied ? "Copied transcript" : "Copy transcript"}
            onClick={copy}
            disabled={!transcript}
          >
            <Icon name={copied ? "check" : "copy"} width="15" />
          </button>
          <button
            type="button"
            className="nk-icon-button"
            aria-label="Download transcript"
            disabled={!transcript}
            onClick={() =>
              download(
                view === "json" ? json : transcript,
                "natlaskit-transcript." + (view === "json" ? "json" : "txt"),
                view === "json" ? "application/json" : "text/plain",
              )
            }
          >
            <Icon name="download" width="16" />
          </button>
        </div>
      </div>
      <div
        className="nk-transcript-content"
        id={uid + "panel"}
        role="tabpanel"
        aria-labelledby={uid + view}
        aria-live="polite"
      >
        {failure ? (
          <div className="nk-transcript-empty nk-transcript-failure">
            <span className="nk-empty-symbol">
              <Icon name="warning" width="24" height="24" />
            </span>
            <strong>We couldn’t transcribe this recording</strong>
            <p role="alert">{failure}</p>
            {onRetry && (
              <button
                type="button"
                className="nk-secondary-button"
                onClick={onRetry}
              >
                <Icon name="refresh" width="14" />
                Try again
              </button>
            )}
          </div>
        ) : busy ? (
          <div className="nk-transcript-loading">
            <div className="nk-loading-title">
              <span className="nk-spinner" />
              <strong>
                {state === "running"
                  ? "Transcribing your recording"
                  : job
                    ? "Your recording is in the queue"
                    : "Sending your recording"}
              </strong>
            </div>
            <p>
              {state === "running"
                ? "The selected N-ATLAS model is processing your audio."
                : "We’ll show your transcript as soon as it’s ready."}
            </p>
            <div className="nk-skeleton-lines" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        ) : transcript ? (
          view === "json" ? (
            <pre className="nk-json-output">
              <code>{json}</code>
            </pre>
          ) : (
            <div className="nk-transcript-text">
              <span className="nk-output-label">TRANSCRIPT</span>
              <p>{transcript}</p>
            </div>
          )
        ) : (
          <div className="nk-transcript-empty">
            <span className="nk-empty-symbol">
              <Icon name="text" width="24" height="24" />
            </span>
            <strong>
              {state === "completed"
                ? "No speech detected"
                : "Your words, right here"}
            </strong>
            <p>
              {state === "completed"
                ? "Try a clearer recording or check the selected language."
                : "Add a recording and transcribe it. Your transcript will appear here, ready to copy or download."}
            </p>
          </div>
        )}
      </div>
      <div className="nk-transcript-footer">
        <SpeechStatus status={state} />
        <div>
          {transcript && (
            <span>
              {words} {words === 1 ? "word" : "words"}
            </span>
          )}
          {job?.audio_duration_seconds != null && (
            <span>{formatTime(job.audio_duration_seconds)} audio</span>
          )}
          {job?.processing_seconds != null && (
            <span>{job.processing_seconds.toFixed(1)}s processing</span>
          )}
        </div>
      </div>
      {copyError && (
        <p className="nk-error" role="alert">
          Clipboard access is unavailable. Select the transcript to copy it.
        </p>
      )}
    </section>
  );
}
export const TranscriptViewer = TranscriptionPanel;
