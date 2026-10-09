"use client";
import { useCallback, useState } from "react";
import {
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  TranscriptionPanel,
} from "@natlaskit/react";
import type { Language } from "natlaskit";
export function ComponentDemos() {
  const [recorded, setRecorded] = useState("No recording yet.");
  const [language, setLanguage] = useState<Language>("hausa");
  const onAudio = useCallback(
    (audio: Blob) =>
      setRecorded(
        `Captured ${(audio.size / 1024).toFixed(0)} KB of audio. Ready for your backend.`,
      ),
    [],
  );
  return (
    <div className="demo-grid">
      <article id="recorder" className="demo-card">
        <span className="small-label">CAPTURE</span>
        <h2>AudioRecorder</h2>
        <p>Working microphone recording with a 30-second limit.</p>
        <div className="demo-stage">
          <AudioRecorder onAudio={onAudio} />
          <p aria-live="polite">{recorded}</p>
        </div>
        <pre>
          <code>{"<AudioRecorder onAudio={setAudio} />"}</code>
        </pre>
      </article>
      <article className="demo-card">
        <span className="small-label">UPLOAD</span>
        <h2>AudioUploader</h2>
        <p>File input with empty-file and size validation.</p>
        <div className="demo-stage">
          <AudioUploader
            onAudio={(file) => setRecorded(`Selected ${file.name}.`)}
          />
          <p aria-live="polite">{recorded}</p>
        </div>
        <pre>
          <code>{"<AudioUploader onAudio={setAudio} />"}</code>
        </pre>
      </article>
      <article className="demo-card">
        <span className="small-label">SELECT</span>
        <h2>LanguageSelector</h2>
        <p>A consistent selector for the official language models.</p>
        <div className="demo-stage">
          <LanguageSelector value={language} onChange={setLanguage} />
          <p>Selected model language: {language}</p>
        </div>
        <pre>
          <code>
            {"<LanguageSelector value={language}\n  onChange={setLanguage} />"}
          </code>
        </pre>
      </article>
      <article id="transcript" className="demo-card">
        <span className="small-label">DISPLAY · ILLUSTRATIVE CONTENT</span>
        <h2>TranscriptionPanel</h2>
        <p>Transcript display and copy control. This example is sample text.</p>
        <div className="demo-stage">
          <TranscriptionPanel
            text="A small idea can bring people together."
            status="completed"
          />
        </div>
        <pre>
          <code>
            {
              "<TranscriptionPanel text={job?.text}\n  status={status} error={error} />"
            }
          </code>
        </pre>
      </article>
    </div>
  );
}
