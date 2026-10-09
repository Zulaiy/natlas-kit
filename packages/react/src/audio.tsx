"use client";
import { useEffect, useRef, useState } from "react";
import { cx, formatTime, Icon } from "./icons";

export function Waveform({
  peaks = [],
  progress = 0,
  className,
}: {
  peaks?: readonly number[];
  progress?: number;
  className?: string;
}) {
  const bars = peaks.length ? peaks : Array.from({ length: 100 }, () => 0);
  const count = Math.min(180, bars.length);
  return (
    <svg
      className={cx("nk-waveform", className)}
      viewBox="0 0 640 88"
      preserveAspectRatio="none"
      role="img"
      aria-label="Audio waveform"
    >
      {Array.from({ length: count }, (_, index) => {
        const value = bars[Math.floor((index * bars.length) / count)];
        const amplitude = Number.isFinite(value)
          ? Math.max(0, Math.min(1, value))
          : 0;
        const height = Number(Math.max(3, amplitude * 80).toFixed(3));
        return (
          <rect
            key={index}
            x={(index * 640) / count}
            y={(88 - height) / 2}
            width={Math.max(1, 640 / count - 2.5)}
            height={height}
            rx="1.8"
            className={
              index / count < progress ? "nk-wave-played" : "nk-wave-unplayed"
            }
          />
        );
      })}
    </svg>
  );
}

export function LiveWaveform({
  stream,
  active = true,
  className,
}: {
  stream?: MediaStream | null;
  active?: boolean;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [available, setAvailable] = useState(true);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let frame = 0;
    let context: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let stopped = false;
    const paint = (values?: Uint8Array) => {
      const width = element.clientWidth || 320;
      const height = element.clientHeight || 82;
      const scale = window.devicePixelRatio || 1;
      if (
        element.width !== width * scale ||
        element.height !== height * scale
      ) {
        element.width = width * scale;
        element.height = height * scale;
      }
      const drawing = element.getContext("2d");
      if (!drawing) return;
      drawing.setTransform(scale, 0, 0, scale, 0, 0);
      drawing.clearRect(0, 0, width, height);
      drawing.fillStyle = getComputedStyle(element).color;
      const count = Math.max(24, Math.floor(width / 6));
      for (let index = 0; index < count; index++) {
        let amplitude = 0;
        if (values) {
          const start = Math.floor((index * values.length) / count);
          const end = Math.max(
            start + 1,
            Math.floor(((index + 1) * values.length) / count),
          );
          for (let point = start; point < end; point++)
            amplitude = Math.max(
              amplitude,
              Math.abs(values[point] - 128) / 128,
            );
        }
        const bar = Math.max(3, amplitude * (height - 6));
        drawing.beginPath();
        drawing.roundRect(
          (index * width) / count,
          (height - bar) / 2,
          Math.max(2, width / count - 2.5),
          bar,
          1.4,
        );
        drawing.fill();
      }
    };
    paint();
    setAvailable(true);
    const resize = new ResizeObserver(() => paint());
    resize.observe(element);
    if (stream && active) {
      try {
        context = new AudioContext();
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        const values = new Uint8Array(analyser.fftSize);
        const draw = () => {
          if (stopped) return;
          analyser.getByteTimeDomainData(values);
          paint(values);
          frame = requestAnimationFrame(draw);
        };
        void context
          .resume()
          .then(draw)
          .catch(() => {
            if (!stopped) setAvailable(false);
          });
      } catch {
        setAvailable(false);
      }
    }
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      source?.disconnect();
      if (context && context.state !== "closed")
        void context.close().catch(() => {});
    };
  }, [stream, active]);
  return (
    <div className={cx("nk-live-waveform", className)}>
      <canvas
        ref={canvas}
        role="img"
        aria-label={
          stream && active
            ? "Live microphone waveform"
            : "Microphone waveform at rest"
        }
      />
      {!available && (
        <span className="nk-help">
          Live levels unavailable. Recording can continue.
        </span>
      )}
    </div>
  );
}

export function ScrubBar({
  peaks,
  value,
  duration,
  onChange,
  disabled,
}: {
  peaks?: readonly number[];
  value: number;
  duration: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="nk-scrub">
      <Waveform peaks={peaks} progress={duration > 0 ? value / duration : 0} />
      <input
        type="range"
        min="0"
        max={duration || 1}
        step="0.01"
        value={Math.min(value, duration || 1)}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled || !duration}
        aria-label="Seek audio"
        aria-valuetext={formatTime(value) + " of " + formatTime(duration)}
      />
    </div>
  );
}

export function AudioPlayer({
  audio,
  name = "Your recording",
  onRemove,
  disabled = false,
}: {
  audio: Blob;
  name?: string;
  onRemove?: () => void;
  disabled?: boolean;
}) {
  const player = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState("");
  const [peaks, setPeaks] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let context: AudioContext | null = null;
    const source = URL.createObjectURL(audio);
    setUrl(source);
    setPosition(0);
    setDuration(0);
    setPeaks([]);
    setPlaying(false);
    setError(null);
    setAnalysing(true);
    const analyse = async () => {
      try {
        context = new AudioContext();
        const decoded = await context.decodeAudioData(
          await audio.arrayBuffer(),
        );
        const samples = decoded.getChannelData(0);
        const values = Array.from({ length: 140 }, (_, index) => {
          const start = Math.floor((index * samples.length) / 140);
          const end = Math.max(
            start + 1,
            Math.floor(((index + 1) * samples.length) / 140),
          );
          let peak = 0;
          for (let point = start; point < end; point++)
            peak = Math.max(peak, Math.abs(samples[point] ?? 0));
          return peak;
        });
        const max = Math.max(...values, 0.001);
        if (!cancelled) {
          setDuration(decoded.duration);
          setPeaks(values.map((value) => value / max));
        }
      } catch {
        /* Native playback remains available when browser waveform decoding is unsupported. */
      } finally {
        if (!cancelled) setAnalysing(false);
        if (context && context.state !== "closed")
          void context.close().catch(() => {});
      }
    };
    void analyse();
    return () => {
      cancelled = true;
      URL.revokeObjectURL(source);
      if (context && context.state !== "closed")
        void context.close().catch(() => {});
    };
  }, [audio]);
  async function toggle() {
    const element = player.current;
    if (!element) return;
    if (playing) element.pause();
    else {
      try {
        await element.play();
        setError(null);
      } catch {
        setError("This audio could not be played. Try another recording.");
      }
    }
  }
  function seek(seconds: number) {
    if (player.current && duration) {
      const next = Math.max(0, Math.min(seconds, duration));
      player.current.currentTime = next;
      setPosition(next);
    }
  }
  return (
    <div className="nk-ui nk-player">
      <audio
        ref={player}
        src={url || undefined}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value)) setDuration(value);
          event.currentTarget.playbackRate = rate;
          event.currentTarget.muted = muted;
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError("The browser cannot play this audio format.")}
      />
      <div className="nk-player-heading">
        <span className="nk-file-icon">
          <Icon name="file" />
        </span>
        <div>
          <strong title={name}>{name}</strong>
          <span>
            {audio.size >= 1024 * 1024
              ? (audio.size / 1024 / 1024).toFixed(1) + " MB"
              : Math.max(1, Math.round(audio.size / 1024)) + " KB"}{" "}
            ·{" "}
            {analysing
              ? "Reading audio…"
              : duration
                ? formatTime(duration)
                : "Audio file"}
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            className="nk-icon-button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove recording"
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      <ScrubBar
        peaks={peaks}
        value={position}
        duration={duration}
        onChange={seek}
      />
      <div className="nk-player-controls">
        <span className="nk-time">
          {formatTime(position)} <span>/ {formatTime(duration)}</span>
        </span>
        <div className="nk-transport">
          <button
            type="button"
            className="nk-icon-button"
            aria-label="Skip back 5 seconds"
            onClick={() => seek(position - 5)}
            disabled={!duration}
          >
            <Icon name="back" width="15" />
          </button>
          <button
            type="button"
            className="nk-play-button"
            aria-label={playing ? "Pause audio" : "Play audio"}
            onClick={toggle}
          >
            <Icon name={playing ? "pause" : "play"} />
          </button>
          <button
            type="button"
            className="nk-icon-button"
            aria-label="Skip forward 5 seconds"
            onClick={() => seek(position + 5)}
            disabled={!duration}
          >
            <Icon name="forward" width="15" />
          </button>
        </div>
        <div className="nk-audio-options">
          <select
            aria-label="Playback speed"
            value={rate}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRate(next);
              if (player.current) player.current.playbackRate = next;
            }}
          >
            {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <option key={speed} value={speed}>
                {speed}×
              </option>
            ))}
          </select>
          <button
            type="button"
            className="nk-icon-button"
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            onClick={() => {
              setMuted(!muted);
              if (player.current) player.current.muted = !muted;
            }}
          >
            <Icon name={muted ? "mute" : "volume"} width="17" />
          </button>
        </div>
      </div>
      {error && (
        <p className="nk-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
