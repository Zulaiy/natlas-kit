"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AudioPlayer,
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  TranscriptionPanel,
  useTranscription,
} from "@natlaskit/react";
import { languages, type Language } from "natlaskit";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Braces,
  Code2,
  Cpu,
  Mic,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Terminal,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { CodeTabs } from "./code-tabs";
export function Playground({
  initialLanguage = "english",
}: {
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("recording.webm");
  const [loadedLanguage, setLoadedLanguage] = useState<Language | null>(null);
  const [connection, setConnection] = useState<
    "checking" | "connected" | "offline" | "unconfigured" | "unauthorized"
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
      setConnection(
        ["connected", "offline", "unconfigured", "unauthorized"].includes(
          data.status,
        )
          ? data.status
          : "offline",
      );
      setLoadedLanguage(
        languages.some((item) => item.id === data.loadedLanguage)
          ? data.loadedLanguage
          : null,
      );
    } catch {
      setConnection("offline");
      setLoadedLanguage(null);
    }
  }, []);
  useEffect(() => {
    void check();
  }, [check]);
  useEffect(() => {
    if (job?.status === "completed") void check();
  }, [job?.status, check]);
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
  const [captureMode, setCaptureMode] = useState<"upload" | "record">("upload");
  const [capturing, setCapturing] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const locked = busy || capturing;
  const ready = !!audio && !locked && connection === "connected";
  const run = () => {
    if (ready && audio) void transcribe(audio, language, filename);
  };
  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <span className="studio-workspace">
          <span className="studio-workspace-icon">
            <AudioLines size={17} />
          </span>
          <span>
            natlaskit studio<small>Your audio workspace</small>
          </span>
        </span>
        <span className="studio-nav-label">WORKSPACE</span>
        <Link
          href="/playground"
          className="studio-nav-active"
          aria-current="page"
        >
          <AudioLines size={16} /> Speech to text
        </Link>
        <Link href="/components">
          <Braces size={16} /> Component library <ArrowUpRight size={12} />
        </Link>
        <Link href="/docs">
          <BookOpen size={16} /> Documentation <ArrowUpRight size={12} />
        </Link>
        <div className="studio-sidebar-bottom">
          <div className="studio-platform">
            <span className="status-dot" />
            Powered by N-ATLAS
            <p>
              Nigerian languages.
              <br />
              Ready for your application.
            </p>
          </div>
          <Link href="/docs/quickstart">
            <Terminal size={14} /> Developer quickstart{" "}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>
      <main className="studio-main">
        <header className="studio-titlebar">
          <div>
            <span className="studio-overline">SPEECH WORKSPACE</span>
            <h1>Speech to text</h1>
            <p>A recording in. Your words out.</p>
          </div>
          <button
            className="studio-outline"
            onClick={() => setShowCode(!showCode)}
            aria-expanded={showCode}
            aria-controls="studio-sdk"
          >
            <Code2 size={14} />
            {showCode ? "Hide code" : "Use the SDK"}
          </button>
        </header>
        <div className="studio-editor-grid">
          <div className="studio-editor">
            <section className="studio-input">
              <div className="studio-section-heading">
                <span>
                  <span className="studio-step">1</span> Add your audio
                </span>
                <span>30 sec max · 10 MB</span>
              </div>
              <div
                className="studio-source-tabs"
                role="group"
                aria-label="Audio source"
              >
                <button
                  disabled={locked}
                  aria-pressed={captureMode === "upload"}
                  onClick={() => setCaptureMode("upload")}
                >
                  <Upload size={14} />
                  Upload audio
                </button>
                <button
                  disabled={locked}
                  aria-pressed={captureMode === "record"}
                  onClick={() => setCaptureMode("record")}
                >
                  <Mic size={14} />
                  Record audio
                </button>
              </div>
              {captureMode === "upload" ? (
                <AudioUploader onAudio={uploaded} disabled={locked} />
              ) : (
                <AudioRecorder
                  onAudio={recorded}
                  onRecordingChange={setCapturing}
                  disabled={busy}
                />
              )}
              {audio && (
                <div className="studio-selected">
                  <AudioPlayer
                    audio={audio}
                    name={filename}
                    disabled={locked}
                    onRemove={() => {
                      setAudio(null);
                      reset();
                    }}
                  />
                </div>
              )}
              <div className="studio-run-row">
                <p>
                  <ShieldCheck size={14} />
                  Sent to your configured speech service.
                </p>
                <button className="studio-run" disabled={!ready} onClick={run}>
                  {busy ? (
                    <>
                      <span className="nk-spinner" />
                      Transcribing…
                    </>
                  ) : (
                    <>
                      Transcribe audio <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </section>
            <section className="studio-output">
              <div className="studio-section-heading">
                <span>
                  <span className="studio-step">2</span> Your transcript
                </span>
                <span>{model.label}</span>
              </div>
              <TranscriptionPanel
                job={job}
                status={status}
                error={error}
                onRetry={ready ? run : undefined}
              />
            </section>
            {showCode && (
              <section id="studio-sdk" className="studio-sdk">
                <div className="studio-section-heading">
                  <span>
                    <Code2 size={15} />
                    Build this into your app
                  </span>
                  <Link href="/docs/quickstart">
                    Installation <ArrowUpRight size={12} />
                  </Link>
                </div>
                <CodeTabs compact language={language} />
              </section>
            )}
          </div>
          <aside className="studio-settings">
            <div className="studio-settings-heading">
              <Settings2 size={15} />
              Settings
            </div>
            <div className="studio-setting-block">
              <LanguageSelector
                value={language}
                disabled={locked}
                onChange={(next) => {
                  setLanguage(next);
                  reset();
                }}
              />
            </div>
            <div className="studio-model">
              <div>
                <AudioLines size={16} />
                <span>N-ATLAS ASR</span>
                <span className="studio-model-tag">Official</span>
              </div>
              <strong>{model.label}</strong>
              <code>{model.model}</code>
              <p>
                Speech recognition tuned for{" "}
                {language === "english"
                  ? "Nigerian-accented English"
                  : model.label + " speech"}
                .
              </p>
            </div>
            <div className="studio-setting-block studio-service">
              <div className="studio-service-heading">
                <span>Speech service</span>
                <button
                  onClick={check}
                  disabled={connection === "checking"}
                  aria-label="Check speech service again"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              <div className="studio-connection" role="status">
                <span
                  className={
                    "status-dot " + (connection !== "connected" ? "muted" : "")
                  }
                />
                {connection === "connected"
                  ? "Connected"
                  : connection === "checking"
                    ? "Checking connection…"
                    : connection === "unauthorized"
                      ? "Check credentials"
                      : connection === "unconfigured"
                        ? "Not configured"
                        : "Unavailable"}
              </div>
              <p>
                {connection === "connected"
                  ? loadedLanguage === language
                    ? "This language model is loaded and ready."
                    : "The first request loads this model. Downloading can take several minutes; keep your service running."
                  : connection === "unauthorized"
                    ? "Set matching service credentials in the website and speech backend, then restart the website."
                    : "Connect the Python speech service and accept the model’s Hugging Face access terms to transcribe."}
              </p>
              {connection !== "connected" && (
                <Link href="/docs/quickstart">
                  Set up your service <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
            <div className="studio-runtime">
              <Cpu size={15} />
              <div>
                <strong>CPU friendly workflow</strong>
                <p>
                  Short recordings work best. Processing time depends on your
                  machine and clip length.
                </p>
              </div>
            </div>
            <Link className="studio-help" href="/docs/react">
              Make it your own
              <ArrowUpRight size={13} />
              <span>The same components, in your app.</span>
            </Link>
          </aside>
        </div>
        <footer className="studio-footnote">
          <span>
            <AudioLines size={13} /> Built with @natlaskit/react
          </span>
          <span>Yoruba · Hausa · Igbo · Nigerian English</span>
        </footer>
      </main>
    </div>
  );
}
