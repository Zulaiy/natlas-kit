"use client";
import { useCallback, useState } from "react";
import {
  AudioPlayer,
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  TranscriptionPanel,
  useTranscription,
} from "@natlaskit/react";
import type { Language } from "natlaskit";
export function SpeechInput() {
  const [capturing, setCapturing] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [language, setLanguage] = useState<Language>("english");
  const { transcribe, job, status, error, busy } = useTranscription({
    baseUrl: "/api/speech",
  });
  const onAudio = useCallback((blob: Blob) => setAudio(blob), []);
  return (
    <>
      <LanguageSelector
        value={language}
        onChange={setLanguage}
        disabled={busy || capturing}
      />
      <AudioRecorder
        onAudio={onAudio}
        onRecordingChange={setCapturing}
        disabled={busy}
      />
      {audio && <AudioPlayer audio={audio} />}
      <AudioUploader onAudio={onAudio} disabled={busy || capturing} />
      <button
        disabled={!audio || busy || capturing}
        onClick={() => audio && transcribe(audio, language)}
      >
        Transcribe
      </button>
      <TranscriptionPanel job={job} status={status} error={error} />
    </>
  );
}
