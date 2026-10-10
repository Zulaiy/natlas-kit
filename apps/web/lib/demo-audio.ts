export function demoAudio() {
  const rate = 16000,
    seconds = 8,
    frames = rate * seconds;
  const buffer = new ArrayBuffer(44 + frames * 2);
  const view = new DataView(buffer);
  function word(offset: number, value: string) {
    for (let i = 0; i < value.length; i++)
      view.setUint8(offset + i, value.charCodeAt(i));
  }
  word(0, "RIFF");
  view.setUint32(4, 36 + frames * 2, true);
  word(8, "WAVE");
  word(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  word(36, "data");
  view.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) {
    const t = i / rate;
    const envelope =
      Math.pow(Math.max(0, Math.sin(t * 3.8)), 2) *
      Math.min(1, t * 3, (seconds - t) * 3);
    const value =
      (Math.sin(t * 2 * Math.PI * 220) * 0.55 +
        Math.sin(t * 2 * Math.PI * 330) * 0.2) *
      envelope;
    view.setInt16(44 + i * 2, value * 22000, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
