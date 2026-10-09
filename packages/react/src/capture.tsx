"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { languages, type Language } from "natlaskit";
import { useRecorder } from "./hooks";
import { LiveWaveform } from "./audio";
import { cx, formatTime, Icon } from "./icons";

export function VoiceButton({
  state = "idle",
  onClick,
  disabled,
  children,
}: {
  state?: "idle" | "connecting" | "recording" | "paused" | "processing";
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const busy = state === "connecting" || state === "processing";
  const active = state === "recording" || state === "paused";
  return (
    <button
      type="button"
      className={cx("nk-ui nk-voice-button", active && "nk-voice-active")}
      data-state={state}
      disabled={disabled || busy}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="nk-voice-symbol">
        {busy ? (
          <span className="nk-spinner" />
        ) : (
          <Icon name={active ? "stop" : "mic"} width="17" height="17" />
        )}
      </span>
      {children ??
        (state === "connecting"
          ? "Opening microphone…"
          : state === "processing"
            ? "Processing…"
            : active
              ? "Finish recording"
              : "Record audio")}
      {state === "recording" && <span className="nk-recording-dot" />}
    </button>
  );
}

export function MicSelector({
  value = "",
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const refresh = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices?.enumerateDevices();
      if (mounted.current)
        setDevices(
          (list ?? []).filter(
            (device) =>
              device.kind === "audioinput" &&
              device.deviceId &&
              device.deviceId !== "default" &&
              device.deviceId !== "communications",
          ),
        );
    } catch {
      /* The default recording path still works if enumeration is unsupported. */
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void refresh();
    navigator.mediaDevices?.addEventListener("devicechange", refresh);
    return () => {
      mounted.current = false;
      navigator.mediaDevices?.removeEventListener("devicechange", refresh);
    };
  }, [refresh]);
  async function enable() {
    setLoading(true);
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      media.getTracks().forEach((track) => track.stop());
      await refresh();
    } catch {
      if (mounted.current)
        setError("Allow microphone access to choose an input.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }
  return (
    <div className="nk-ui nk-mic-selector">
      <div className="nk-mic-field">
        <Icon name="mic" width="14" />
        <select
          aria-label="Microphone"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || loading}
        >
          <option value="">Default microphone</option>
          {devices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "Microphone " + (index + 1)}
            </option>
          ))}
        </select>
        <Icon name="chevron" width="13" />
      </div>
      {!devices.some((device) => device.label) && (
        <button
          className="nk-text-button"
          type="button"
          onClick={enable}
          disabled={disabled || loading}
        >
          {loading ? "Requesting access…" : "Choose an input"}
        </button>
      )}
      {error && (
        <p className="nk-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AudioRecorder({
  onAudio,
  disabled,
  maxSeconds = 30,
  onRecordingChange,
}: {
  onAudio: (audio: Blob) => void;
  disabled?: boolean;
  maxSeconds?: number;
  onRecordingChange?: (recording: boolean) => void;
}) {
  const [deviceId, setDeviceId] = useState("");
  const recorder = useRecorder({ maxSeconds, deviceId });
  const delivered = useRef<Blob | null>(null);
  const callback = useRef(onAudio);
  const stateCallback = useRef(onRecordingChange);
  useEffect(() => {
    callback.current = onAudio;
    stateCallback.current = onRecordingChange;
  }, [onAudio, onRecordingChange]);
  useEffect(() => {
    if (recorder.audio?.size && delivered.current !== recorder.audio) {
      delivered.current = recorder.audio;
      callback.current(recorder.audio);
    }
  }, [recorder.audio]);
  useEffect(() => {
    stateCallback.current?.(recorder.recording || recorder.starting);
  }, [recorder.recording, recorder.starting]);
  useEffect(
    () => () => {
      stateCallback.current?.(false);
    },
    [],
  );
  const state = recorder.starting
    ? "connecting"
    : recorder.paused
      ? "paused"
      : recorder.recording
        ? "recording"
        : "idle";
  return (
    <div className="nk-ui nk-recorder" data-state={state}>
      <div className="nk-recorder-heading">
        <span
          className={cx(
            "nk-recorder-indicator",
            recorder.recording && !recorder.paused && "nk-is-live",
          )}
        >
          <i />
          {recorder.paused
            ? "Recording paused"
            : recorder.recording
              ? "Recording"
              : recorder.audio
                ? "Recording captured"
                : "Microphone ready"}
        </span>
        <span className="nk-chip">{maxSeconds}s limit</span>
      </div>
      <LiveWaveform
        stream={recorder.mediaStream}
        active={recorder.recording && !recorder.paused}
      />
      <div className="nk-recorder-time">
        {formatTime(recorder.elapsed)}
        <span> / {formatTime(maxSeconds)}</span>
      </div>
      <div className="nk-recorder-actions">
        {recorder.recording && (
          <button
            type="button"
            className="nk-round-button"
            aria-label={
              recorder.paused ? "Resume recording" : "Pause recording"
            }
            onClick={recorder.paused ? recorder.resume : recorder.pause}
          >
            <Icon name={recorder.paused ? "play" : "pause"} />
          </button>
        )}
        <VoiceButton
          state={state}
          disabled={disabled && !recorder.recording}
          onClick={recorder.recording ? recorder.stop : recorder.start}
        >
          {recorder.recording
            ? "Finish recording"
            : recorder.audio
              ? "Record again"
              : undefined}
        </VoiceButton>
        {recorder.recording && (
          <button
            type="button"
            className="nk-round-button"
            aria-label="Discard recording"
            onClick={recorder.clear}
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      <div className="nk-recorder-footer">
        <MicSelector
          value={deviceId}
          onChange={setDeviceId}
          disabled={disabled || recorder.recording || recorder.starting}
        />
        <span className="nk-help">
          {recorder.recording
            ? "Finish when you’re ready."
            : "Your microphone stays off until you record."}
        </span>
      </div>
      {recorder.error && (
        <p role="alert" className="nk-error">
          <Icon name="warning" width="15" />
          {recorder.error}
        </p>
      )}
    </div>
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
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const id = useId();
  function select(files: File[]) {
    if (disabled || !files.length) return;
    if (files.length !== 1) {
      setError("Choose one recording at a time.");
      return;
    }
    const file = files[0];
    if (!file.size || file.size > 10 * 1024 * 1024) {
      setError("Choose a non-empty audio file no larger than 10 MB.");
      return;
    }
    if (
      !file.type.startsWith("audio/") &&
      !/\.(wav|mp3|m4a|ogg|webm|flac|aac|mp4)$/i.test(file.name)
    ) {
      setError("Choose a WAV, MP3, M4A, OGG, WebM, FLAC or AAC recording.");
      return;
    }
    setError(null);
    onAudio(file);
  }
  function change(event: ChangeEvent<HTMLInputElement>) {
    select(Array.from(event.target.files ?? []));
    event.target.value = "";
  }
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    depth.current = 0;
    setDragging(false);
    select(Array.from(event.dataTransfer.files));
  }
  return (
    <div
      className={cx("nk-ui nk-uploader", className)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        depth.current++;
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setDragging(false);
      }}
      onDrop={drop}
    >
      <label
        className={cx(
          "nk-dropzone",
          dragging && "nk-dragging",
          disabled && "nk-disabled",
        )}
        htmlFor={id}
      >
        <span className="nk-upload-symbol">
          <Icon name="upload" width="22" height="22" />
        </span>
        <strong>
          {dragging ? "Drop your recording here" : "Drop an audio file here"}
        </strong>
        <span>
          or <span className="nk-browse">browse files</span>
        </span>
        <small>WAV, MP3, M4A, OGG, WebM, FLAC, AAC · up to 10 MB</small>
        <input
          id={id}
          aria-label="Upload audio"
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm,.flac,.aac"
          disabled={disabled}
          onChange={change}
        />
      </label>
      {error && (
        <p className="nk-error" role="alert">
          <Icon name="warning" width="15" />
          {error}
        </p>
      )}
    </div>
  );
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
  const selected = languages.find((language) => language.id === value)!;
  const id = useId();
  return (
    <div className={cx("nk-ui nk-language", className)}>
      <label htmlFor={id}>Language</label>
      <div className="nk-language-field">
        <span className="nk-language-code" aria-hidden="true">
          {selected.code}
        </span>
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as Language)}
        >
          {languages.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" width="14" />
      </div>
      <p className="nk-help">Choose the language spoken in your recording.</p>
    </div>
  );
}
