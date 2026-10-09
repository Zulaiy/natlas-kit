"use client";
export { languages } from "natlaskit";
export type { Language, TranscriptionJob } from "natlaskit";
export { useRecorder, useTranscription } from "./hooks";
export {
  AudioRecorder,
  AudioUploader,
  LanguageSelector,
  MicSelector,
  VoiceButton,
} from "./capture";
export { AudioPlayer, LiveWaveform, ScrubBar, Waveform } from "./audio";
export {
  SpeechStatus,
  TranscriptionPanel,
  TranscriptViewer,
} from "./transcript";
