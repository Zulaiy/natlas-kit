import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../../apps/web/app/api/status/route";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("website speech readiness", () => {
  it("does not claim a model is loaded just because the service is reachable", async () => {
    vi.stubEnv("NATLAS_API_URL", "http://fixture-only:8000");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ status: "ok", loaded_language: null }),
        )
        .mockResolvedValueOnce(response([])),
    );
    expect(await (await GET()).json()).toEqual({
      status: "connected",
      loadedLanguage: null,
    });
  });
  it("checks the service key and returns no credentials to the browser", async () => {
    vi.stubEnv("NATLAS_API_URL", "http://fixture-only:8000");
    vi.stubEnv("NATLAS_API_KEY", "test-only-secret");
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ status: "ok" }))
      .mockResolvedValueOnce(response({ detail: "Invalid credentials" }, 401));
    vi.stubGlobal("fetch", fetcher);
    expect(await (await GET()).json()).toEqual({ status: "unauthorized" });
    expect(fetcher.mock.calls[1][1].headers).toEqual({
      Authorization: "Bearer test-only-secret",
    });
  });
  it("does not treat an unrelated endpoint as the speech service", async () => {
    vi.stubEnv("NATLAS_API_URL", "http://fixture-only:8000");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ status: "unrelated" })),
    );
    expect(await (await GET()).json()).toEqual({ status: "offline" });
  });
});
