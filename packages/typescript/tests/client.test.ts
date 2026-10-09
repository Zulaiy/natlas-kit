import { describe, expect, it, vi } from "vitest";
import { NatlasClient, NatlasError } from "../src/index";
const job = {
  id: "abc",
  status: "queued",
  language: "hausa",
  model: "NCAIR1/Hausa-ASR",
  text: null,
  error: null,
  audio_duration_seconds: null,
  processing_seconds: null,
};
const response = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
describe("speech SDK contract", () => {
  it.each([
    {},
    [],
    { ...job, status: "unexpected" },
    { ...job, status: "completed", text: null },
    { ...job, processing_seconds: -1 },
  ])("rejects malformed job responses: %j", async (body) => {
    const client = new NatlasClient({
      baseUrl: "/api/speech",
      fetch: vi.fn().mockResolvedValue(response(body)),
    });
    await expect(client.getTranscription("abc")).rejects.toThrow(
      "invalid transcription response",
    );
  });
  it("rejects invalid wait controls before submitting audio", async () => {
    const fetcher = vi.fn();
    const client = new NatlasClient({ baseUrl: "/api/speech", fetch: fetcher });
    await expect(
      client.transcribe({
        audio: new Blob(["fixture"]),
        language: "hausa",
        pollIntervalMs: 0,
      }),
    ).rejects.toThrow("pollIntervalMs");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uploads multipart audio and polls until completed", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(job, 202))
      .mockResolvedValueOnce(response({ ...job, status: "running" }))
      .mockResolvedValueOnce(
        response({ ...job, status: "completed", text: "Test transcript" }),
      );
    const client = new NatlasClient({
      baseUrl: "http://localhost:8000/",
      apiKey: "test-only",
      fetch: fetcher,
    });
    const result = await client.transcribe({
      audio: new Blob(["audio"]),
      language: "hausa",
      pollIntervalMs: 1,
    });
    expect(result.text).toBe("Test transcript");
    const init = fetcher.mock.calls[0][1];
    expect(init.body.get("language")).toBe("hausa");
    expect(init.headers.get("Authorization")).toBe("Bearer test-only");
    expect(init.headers.has("Content-Type")).toBe(false);
    expect(fetcher.mock.calls[1][0]).toBe(
      "http://localhost:8000/v1/transcriptions/abc",
    );
  });
  it("surfaces model-access failures without retrying submission", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(job, 202))
      .mockResolvedValueOnce(
        response({
          ...job,
          status: "failed",
          error: "Accept model access terms.",
        }),
      );
    await expect(
      new NatlasClient({ baseUrl: "/api/speech", fetch: fetcher }).transcribe({
        audio: new Blob(["audio"]),
        language: "hausa",
        pollIntervalMs: 1,
      }),
    ).rejects.toThrow("Accept model access terms.");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("rejects empty audio before contacting the service", () => {
    const fetcher = vi.fn();
    const client = new NatlasClient({ baseUrl: "/api/speech", fetch: fetcher });
    expect(() =>
      client.createTranscription({ audio: new Blob(), language: "hausa" }),
    ).toThrow(NatlasError);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("stops polling when the caller cancels", async () => {
    const fetcher = vi.fn().mockResolvedValue(response(job, 202));
    const controller = new AbortController();
    const result = new NatlasClient({
      baseUrl: "/api/speech",
      fetch: fetcher,
    }).transcribe({
      audio: new Blob(["audio"]),
      language: "hausa",
      signal: controller.signal,
      onStatus: () => controller.abort(),
    });
    await expect(result).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("reports backend errors and unreachable services", async () => {
    const client = new NatlasClient({
      baseUrl: "/api/speech",
      fetch: vi
        .fn()
        .mockResolvedValue(response({ detail: "Queue full." }, 429)),
    });
    await expect(client.models()).rejects.toThrow("Queue full.");
    const offline = new NatlasClient({
      baseUrl: "/api/speech",
      fetch: vi.fn().mockRejectedValue(new TypeError("offline")),
    });
    await expect(offline.models()).rejects.toThrow("Could not reach");
  });
});
