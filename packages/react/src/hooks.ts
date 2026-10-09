"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NatlasClient,
  type Language,
  type TranscriptionJob,
  type JobStatus,
} from "natlaskit";

export function useRecorder({
  maxSeconds = 30,
  deviceId,
}: { maxSeconds?: number; deviceId?: string } = {}) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [starting, setStarting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const acquiring = useRef(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timing = useRef({ accumulated: 0, began: 0 });
  const release = useCallback(() => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (mounted.current) setMediaStream(null);
  }, []);
  const currentElapsed = useCallback(() => {
    return (
      timing.current.accumulated +
      (recorder.current?.state === "recording"
        ? (performance.now() - timing.current.began) / 1000
        : 0)
    );
  }, []);
  const stop = useCallback(() => {
    const instance = recorder.current;
    if (instance && instance.state !== "inactive") {
      if (mounted.current) setElapsed(currentElapsed());
      instance.stop();
    }
    release();
    if (mounted.current) {
      setRecording(false);
      setPaused(false);
    }
  }, [release, currentElapsed]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      stop();
    };
  }, [stop]);
  const start = useCallback(async () => {
    if (
      acquiring.current ||
      (recorder.current && recorder.current.state !== "inactive")
    )
      return;
    acquiring.current = true;
    const currentGeneration = ++generation.current;
    setStarting(true);
    setError(null);
    setAudio(null);
    setElapsed(0);
    setPaused(false);
    try {
      if (!Number.isFinite(maxSeconds) || maxSeconds <= 0)
        throw new Error("Recording duration must be positive.");
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw new Error(
          "Recording needs a supported browser on localhost or HTTPS. You can upload a file instead.",
        );
      const media = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      if (!mounted.current || currentGeneration !== generation.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      setMediaStream(media);
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
          setPaused(false);
        }
      };
      instance.onerror = () => {
        stop();
        if (mounted.current)
          setError("Recording was interrupted. Try again or upload audio.");
      };
      timing.current = { accumulated: 0, began: performance.now() };
      instance.start();
      setRecording(true);
      timer.current = setInterval(() => {
        const seconds = currentElapsed();
        if (mounted.current) setElapsed(Math.min(seconds, maxSeconds));
        if (seconds >= maxSeconds) stop();
      }, 100);
    } catch (cause) {
      release();
      if (mounted.current && currentGeneration === generation.current)
        setError(
          cause instanceof DOMException && cause.name === "NotAllowedError"
            ? "Microphone permission was denied. Allow access or upload a recording."
            : cause instanceof Error
              ? cause.message
              : "Could not access the microphone.",
        );
    } finally {
      acquiring.current = false;
      if (mounted.current && currentGeneration === generation.current)
        setStarting(false);
    }
  }, [deviceId, maxSeconds, release, stop, currentElapsed]);
  const pause = useCallback(() => {
    if (recorder.current?.state !== "recording") return;
    timing.current.accumulated = currentElapsed();
    recorder.current.pause();
    setPaused(true);
    setElapsed(timing.current.accumulated);
  }, [currentElapsed]);
  const resume = useCallback(() => {
    if (recorder.current?.state !== "paused") return;
    timing.current.began = performance.now();
    recorder.current.resume();
    setPaused(false);
  }, []);
  const clear = useCallback(() => {
    generation.current += 1;
    stop();
    setAudio(null);
    setElapsed(0);
    setError(null);
    setStarting(false);
  }, [stop]);
  return {
    recording,
    paused,
    starting,
    elapsed,
    audio,
    error,
    mediaStream,
    start,
    stop,
    pause,
    resume,
    clear,
  };
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
