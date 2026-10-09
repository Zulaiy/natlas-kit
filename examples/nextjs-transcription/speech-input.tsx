"use client";
import { useCallback, useState } from "react";
import {
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  TranscriptionPanel,
  useTranscription,
} from "@natlaskit/react";
import type { Language } from "natlaskit";
export function SpeechInput() {
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
        disabled={busy}
      />
      <AudioRecorder onAudio={onAudio} disabled={busy} />
      <AudioUploader onAudio={onAudio} disabled={busy} />
      <button
        disabled={!audio || busy}
        onClick={() => audio && transcribe(audio, language)}
      >
        Transcribe
      </button>
      <TranscriptionPanel text={job?.text} status={status} error={error} />
    </>
  );
}
