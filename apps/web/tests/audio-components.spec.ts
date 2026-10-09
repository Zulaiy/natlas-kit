import { test, expect, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});
test.afterEach(({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

test("audio player decodes, plays, seeks and changes speed", async ({
  page,
}) => {
  await page.goto("/components");
  const player = page.locator("#audio-player");
  await expect(player.getByLabel("Seek audio")).toBeEnabled();
  await expect(player.getByLabel("Seek audio")).toHaveAttribute("max", "8");
  await player.getByRole("button", { name: "Play audio", exact: true }).click();
  await expect
    .poll(() =>
      player
        .locator("audio")
        .evaluate((el) => (el as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0);
  await player.getByRole("button", { name: "Pause audio" }).click();
  await player.getByLabel("Seek audio").fill("3");
  expect(
    await player
      .locator("audio")
      .evaluate((el) => (el as HTMLAudioElement).currentTime),
  ).toBeCloseTo(3, 1);
  await player.getByLabel("Playback speed").selectOption("1.5");
  expect(
    await player
      .locator("audio")
      .evaluate((el) => (el as HTMLAudioElement).playbackRate),
  ).toBe(1.5);
  await player.getByRole("button", { name: "Mute audio", exact: true }).click();
  expect(
    await player
      .locator("audio")
      .evaluate((el) => (el as HTMLAudioElement).muted),
  ).toBe(true);
});

test("recording pauses, resumes and releases the microphone on finish and unmount", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const streams: MediaStream[] = [];
    (window as unknown as { testStreams: MediaStream[] }).testStreams = streams;
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      streams.push(stream);
      return stream;
    };
  });
  await page.goto("/components");
  const recorder = page.locator("#recorder");
  await recorder
    .getByRole("button", { name: "Record audio", exact: true })
    .click();
  await expect(recorder.locator(".nk-recorder-time")).not.toHaveText(
    "00:00 / 00:30",
  );
  await recorder.getByRole("button", { name: "Pause recording" }).click();
  const paused = await recorder.locator(".nk-recorder-time").textContent();
  await page.waitForTimeout(1100);
  await expect(recorder.locator(".nk-recorder-time")).toHaveText(paused!);
  await recorder.getByRole("button", { name: "Resume recording" }).click();
  await expect(recorder.locator(".nk-recorder-time")).not.toHaveText(paused!);
  await recorder.getByRole("button", { name: "Finish recording" }).click();
  await expect(recorder.getByText(/Recording captured ·/)).toBeVisible();
  const allStopped = () =>
    page.evaluate(() =>
      (window as unknown as { testStreams: MediaStream[] }).testStreams.every(
        (s) => s.getTracks().every((t) => t.readyState === "ended"),
      ),
    );
  expect(await allStopped()).toBe(true);
  await recorder.getByRole("button", { name: "Record again" }).click();
  await expect(
    recorder.getByRole("button", { name: "Pause recording" }),
  ).toBeVisible();
  await page.getByLabel("Find a component").fill("upload");
  await expect.poll(allStopped).toBe(true);
});

test("gallery supports themes, keyboard tabs, filters and transcript download", async ({
  page,
}) => {
  await page.goto("/components");
  await page.getByRole("button", { name: "Dark component previews" }).click();
  await expect(page.locator("#audio-player .nk-player")).toHaveCSS(
    "background-color",
    "rgb(25, 27, 31)",
  );
  const transcript = page.locator("#transcript");
  await transcript
    .getByRole("tab", { name: "Transcript", exact: true })
    .press("ArrowRight");
  await expect(
    transcript.getByRole("tab", { name: "JSON", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await transcript
    .getByRole("button", { name: "Copy transcript", exact: true })
    .click();
  expect(
    JSON.parse(await page.evaluate(() => navigator.clipboard.readText())).text,
  ).toContain("Every language");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    transcript.getByRole("button", { name: "Download transcript" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("natlaskit-transcript.json");
  await page.getByLabel("Find a component").fill("player");
  await expect(page.locator(".kit-card")).toHaveCount(1);
  await page.getByLabel("Find a component").fill("unknown");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".kit-card")).toHaveCount(10);
});

test("playground locks capture actions and shows a selected-language result", async ({
  page,
}) => {
  // This fixture validates the interface and SDK wiring, not model inference.
  const job = {
    id: "browser-fixture",
    status: "completed",
    language: "yoruba",
    model: "NCAIR1/Yoruba-ASR",
    text: "A labelled browser test result.",
    error: null,
    audio_duration_seconds: 2,
    processing_seconds: 1,
  };
  await page.route("**/api/status", (r) =>
    r.fulfill({ json: { status: "connected", loadedLanguage: "yoruba" } }),
  );
  let payload = "";
  await page.route("**/api/speech/v1/transcriptions", (r) => {
    payload = r.request().postDataBuffer()?.toString() ?? "";
    return r.fulfill({ json: job });
  });
  await page.goto("/playground");
  await page.getByLabel("Language").selectOption("yoruba");
  await page
    .getByRole("group", { name: "Audio source" })
    .getByRole("button", { name: "Record audio" })
    .click();
  await page
    .locator(".nk-recorder")
    .getByRole("button", { name: "Record audio", exact: true })
    .click();
  await expect(page.getByLabel("Language")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Transcribe audio", exact: true }),
  ).toBeDisabled();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Finish recording" }).click();
  await page
    .getByRole("button", { name: "Transcribe audio", exact: true })
    .click();
  await expect(page.getByText(job.text, { exact: true })).toBeVisible();
  expect(payload).toContain("yoruba");
  await page.getByRole("button", { name: "Use the SDK" }).click();
  await expect(page.locator("#studio-sdk")).toContainText('"yoruba"');
});

test("small screens fit the gallery and studio", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/components", "/playground"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
