"use client";
import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Code2,
  Copy,
  FileAudio,
  Mic,
  Moon,
  Search,
  Sun,
  Terminal,
  Text,
  Waves,
} from "lucide-react";
import {
  AudioPlayer,
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  LiveWaveform,
  MicSelector,
  ScrubBar,
  SpeechStatus,
  TranscriptionPanel,
  VoiceButton,
  useRecorder,
} from "@natlaskit/react";
import type { Language } from "natlaskit";
import { demoAudio } from "@/lib/demo-audio";

const demoPeaks = Array.from(
  { length: 110 },
  (_, index) =>
    Math.pow(Math.max(0, Math.sin(index * 0.29)), 2) *
    (0.38 + 0.62 * Math.abs(Math.sin(index * 0.07))),
);
function LiveDemo() {
  const recorder = useRecorder({ maxSeconds: 15 });
  return (
    <div className="kit-live-demo">
      <div className="kit-live-label">
        <span className={recorder.recording ? "kit-live-active" : ""} />{" "}
        {recorder.recording
          ? "Live microphone input"
          : "Waiting for microphone"}
      </div>
      <LiveWaveform stream={recorder.mediaStream} active={recorder.recording} />
      <VoiceButton
        state={
          recorder.recording
            ? "recording"
            : recorder.starting
              ? "connecting"
              : "idle"
        }
        onClick={recorder.recording ? recorder.stop : recorder.start}
      >
        {recorder.recording ? "Stop microphone" : "Try live input"}
      </VoiceButton>
      {recorder.error && <p role="alert">{recorder.error}</p>}
    </div>
  );
}
function VoiceDemo() {
  const recorder = useRecorder({ maxSeconds: 15 });
  return (
    <div className="kit-voice-demo">
      <span className="kit-voice-orbit">
        <Mic size={28} strokeWidth={1.4} />
      </span>
      <VoiceButton
        state={
          recorder.starting
            ? "connecting"
            : recorder.paused
              ? "paused"
              : recorder.recording
                ? "recording"
                : "idle"
        }
        onClick={recorder.recording ? recorder.stop : recorder.start}
      />
      <p>
        {recorder.recording
          ? "Your microphone is on."
          : "One control. Every recording state."}
      </p>
      {recorder.error && <p role="alert">{recorder.error}</p>}
    </div>
  );
}
function ComponentCard({
  id,
  title,
  description,
  tag,
  code,
  children,
  theme,
}: {
  id: string;
  title: string;
  description: string;
  tag: string;
  code: string;
  children: React.ReactNode;
  theme: string;
}) {
  const [view, setView] = useState("preview");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const uid = useId();
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <article id={id} className="kit-card">
      <div className="kit-card-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span>{tag}</span>
      </div>
      <div className="kit-card-controls">
        <div role="tablist" aria-label={title + " example"}>
          {["preview", "code"].map((item) => (
            <button
              type="button"
              role="tab"
              key={item}
              id={uid + item}
              aria-controls={uid + "panel"}
              aria-selected={view === item}
              tabIndex={view === item ? 0 : -1}
              onClick={() => setView(item)}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  const next = view === "preview" ? "code" : "preview";
                  setView(next);
                  document.getElementById(uid + next)?.focus();
                }
              }}
            >
              {item === "preview" ? (
                <>
                  <Waves size={12} />
                  Preview
                </>
              ) : (
                <>
                  <Code2 size={12} />
                  Code
                </>
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={"Copy " + title + " example"}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div
        id={uid + "panel"}
        role="tabpanel"
        aria-labelledby={uid + view}
        className={
          "kit-card-preview " + (view === "code" ? "kit-code-preview" : "")
        }
        data-nk-theme={theme}
      >
        {view === "preview" ? (
          children
        ) : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </div>
      {copyError && (
        <p className="kit-copy-error" role="alert">
          Clipboard unavailable. Select the example to copy it.
        </p>
      )}
    </article>
  );
}
export function ComponentDemos() {
  const [audio, setAudio] = useState<Blob | null>(null);
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const [upload, setUpload] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>("yoruba");
  const [device, setDevice] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [theme, setTheme] = useState("light");
  const [position, setPosition] = useState(2.2);
  useEffect(() => setAudio(demoAudio()), []);
  const captured = useCallback((blob: Blob) => setRecorded(blob), []);
  const items = [
    {
      id: "audio-player",
      title: "AudioPlayer",
      category: "Playback",
      description: "Every recording deserves a proper player.",
      tag: "Interactive",
      code: [
        "import { AudioPlayer } from '@natlaskit/react';",
        "import '@natlaskit/react/styles.css';",
        "",
        '<AudioPlayer audio={recording} name="voice-note.wav" />',
      ].join("\n"),
      content: (
        <>
          {audio && <AudioPlayer audio={audio} name="studio-preview.wav" />}
          <p className="kit-preview-caption">
            Generated tones · audio interface demo
          </p>
        </>
      ),
    },
    {
      id: "recorder",
      title: "AudioRecorder",
      category: "Capture",
      description: "Capture a voice. See it as it happens.",
      tag: "Microphone",
      code: [
        "import { AudioRecorder } from '@natlaskit/react';",
        "",
        "<AudioRecorder onAudio={setAudio} maxSeconds={30} />",
      ].join("\n"),
      content: (
        <>
          <AudioRecorder onAudio={captured} />
          {recorded && (
            <p className="kit-preview-caption" role="status">
              Recording captured · {Math.round(recorded.size / 1024)} KB
            </p>
          )}
        </>
      ),
    },
    {
      id: "upload",
      title: "AudioUploader",
      category: "Capture",
      description: "A file picker that feels like an invitation.",
      tag: "Drag & drop",
      code: [
        "import { AudioUploader } from '@natlaskit/react';",
        "",
        "<AudioUploader onAudio={setAudio} />",
      ].join("\n"),
      content: (
        <>
          <AudioUploader onAudio={setUpload} />
          {upload && (
            <p className="kit-preview-caption" role="status">
              Selected {upload.name}
            </p>
          )}
        </>
      ),
    },
    {
      id: "transcript",
      title: "TranscriptViewer",
      category: "Output",
      description: "Readable results. Useful actions. No clutter.",
      tag: "Sample content",
      code: [
        "import { TranscriptViewer } from '@natlaskit/react';",
        "",
        "<TranscriptViewer job={job} status={status} error={error} />",
      ].join("\n"),
      content: (
        <TranscriptionPanel
          text="Every language carries a world. Build something that lets people speak in their own."
          status="completed"
        />
      ),
    },
    {
      id: "live-waveform",
      title: "LiveWaveform",
      category: "Visualization",
      description: "Give your microphone a visual presence.",
      tag: "Live input",
      code: [
        "import { LiveWaveform, useRecorder } from '@natlaskit/react';",
        "",
        "const { mediaStream, recording, start, stop } = useRecorder();",
        "<LiveWaveform stream={mediaStream} active={recording} />",
      ].join("\n"),
      content: <LiveDemo />,
    },
    {
      id: "voice-button",
      title: "VoiceButton",
      category: "Capture",
      description: "A single, expressive control for speech.",
      tag: "State aware",
      code: [
        "import { VoiceButton } from '@natlaskit/react';",
        "",
        "<VoiceButton state={recording ? 'recording' : 'idle'}",
        "  onClick={recording ? stop : start} />",
      ].join("\n"),
      content: <VoiceDemo />,
    },
    {
      id: "waveform",
      title: "Waveform & ScrubBar",
      category: "Playback",
      description: "See the shape of sound. Find your moment.",
      tag: "Seekable",
      code: [
        "import { ScrubBar } from '@natlaskit/react';",
        "",
        "<ScrubBar peaks={peaks} value={position}",
        "  duration={8} onChange={setPosition} />",
      ].join("\n"),
      content: (
        <div className="kit-wave-demo">
          <span className="kit-demo-small">SAMPLE WAVEFORM</span>
          <ScrubBar
            peaks={demoPeaks}
            value={position}
            duration={8}
            onChange={setPosition}
          />
          <div>
            <span>{position.toFixed(1)} seconds</span>
            <span>Drag to scrub</span>
          </div>
        </div>
      ),
    },
    {
      id: "language-selector",
      title: "LanguageSelector",
      category: "Configuration",
      description: "The right model, in a familiar language.",
      tag: "4 languages",
      code: [
        "import { LanguageSelector } from '@natlaskit/react';",
        "",
        "<LanguageSelector value={language}",
        "  onChange={setLanguage} />",
      ].join("\n"),
      content: (
        <div className="kit-language-demo">
          <LanguageSelector value={language} onChange={setLanguage} />
          <div className="kit-model-pill">
            <AudioLines size={15} />
            <div>
              <span>Selected N-ATLAS model</span>
              <strong>
                {language === "english"
                  ? "Nigerian-accented English"
                  : language.charAt(0).toUpperCase() + language.slice(1)}{" "}
                ASR
              </strong>
            </div>
            <Check size={13} />
          </div>
        </div>
      ),
    },
    {
      id: "mic-selector",
      title: "MicSelector",
      category: "Configuration",
      description: "Let people choose how they’re heard.",
      tag: "Devices",
      code: [
        "import { MicSelector } from '@natlaskit/react';",
        "",
        "<MicSelector value={deviceId} onChange={setDeviceId} />",
      ].join("\n"),
      content: (
        <div className="kit-mic-demo">
          <span className="kit-voice-orbit">
            <Mic size={25} strokeWidth={1.3} />
          </span>
          <MicSelector value={device} onChange={setDevice} />
          <p>Only asks for access when you choose an input.</p>
        </div>
      ),
    },
    {
      id: "speech-status",
      title: "SpeechStatus",
      category: "Output",
      description: "A quiet signal for every job state.",
      tag: "5 states",
      code: [
        "import { SpeechStatus } from '@natlaskit/react';",
        "",
        "<SpeechStatus status={job?.status ?? 'idle'} />",
      ].join("\n"),
      content: (
        <div className="kit-status-demo">
          {(["idle", "queued", "running", "completed", "failed"] as const).map(
            (status) => (
              <div key={status}>
                <SpeechStatus status={status} />
                <code>{status}</code>
              </div>
            ),
          )}
        </div>
      ),
    },
  ];
  const visible = items.filter(
    (item) =>
      (category === "All" || item.category === category) &&
      (item.title + " " + item.description)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="kit-layout">
      <aside className="kit-sidebar">
        <span className="kit-sidebar-label">BUILD WITH NATLASKIT</span>
        <button
          className={category === "All" ? "selected" : ""}
          onClick={() => setCategory("All")}
        >
          <Waves size={15} />
          All components<span>{items.length}</span>
        </button>
        {[
          "Capture",
          "Playback",
          "Visualization",
          "Output",
          "Configuration",
        ].map((group) => (
          <button
            key={group}
            className={category === group ? "selected" : ""}
            onClick={() => setCategory(group)}
          >
            {group === "Capture" ? (
              <Mic size={14} />
            ) : group === "Playback" ? (
              <FileAudio size={14} />
            ) : group === "Output" ? (
              <Text size={14} />
            ) : (
              <AudioLines size={14} />
            )}{" "}
            {group}
          </button>
        ))}
        <div className="kit-sidebar-links">
          <span className="kit-sidebar-label">RESOURCES</span>
          <Link href="/docs/react">
            Installation <ArrowUpRight size={12} />
          </Link>
          <Link href="/docs/react#hooks-and-styling">
            Hooks & API <ArrowUpRight size={12} />
          </Link>
          <Link href="/playground">
            Speech playground <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="kit-sidebar-note">
          <span className="kit-dot" />
          Made for real audio.
          <p>React components for the languages we call home.</p>
        </div>
      </aside>
      <div className="kit-content">
        <div className="kit-search-row">
          <label>
            <Search size={15} />
            <input
              aria-label="Find a component"
              placeholder="Find a component…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>⌕</kbd>
          </label>
          <div className="kit-theme-switch" aria-label="Preview appearance">
            <button
              aria-label="Light component previews"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
            >
              <Sun size={14} />
            </button>
            <button
              aria-label="Dark component previews"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              <Moon size={14} />
            </button>
          </div>
        </div>
        <div className="kit-section-title">
          <span>{category === "All" ? "Audio & speech" : category}</span>
          <span>{visible.length} components</span>
        </div>
        <div className="kit-component-grid">
          {visible.map((item) => (
            <ComponentCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              tag={item.tag}
              code={item.code}
              theme={theme}
            >
              {item.content}
            </ComponentCard>
          ))}
        </div>
        {!visible.length && (
          <div className="kit-no-results">
            <Search size={24} />
            <h2>No components found</h2>
            <p>Try a different name or category.</p>
            <button
              onClick={() => {
                setCategory("All");
                setQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="kit-install-banner">
          <span>
            <Terminal size={20} />
          </span>
          <div>
            <h3>Looks good here. Feels right in your app.</h3>
            <p>
              Import the components and stylesheet. Connect your N-ATLAS
              backend.
            </p>
          </div>
          <Link href="/docs/react">
            Start building <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
