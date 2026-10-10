import { test, expect, type Page } from "@playwright/test";
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on("pageerror", (e) => list.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") list.push(m.text());
  });
});
test.afterEach(({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test("homepage preview, SDK copy, and FAQs work", async ({ page }) => {
  await page.goto("/");
  const preview = page.locator(".home-preview");
  await preview.getByRole("button", { name: "YO Yoruba", exact: true }).click();
  await expect(
    preview.getByRole("button", { name: "YO Yoruba", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    preview.getByRole("link", { name: "Try your own recording" }),
  ).toHaveAttribute("href", "/playground?language=yoruba");
  await expect(preview.getByLabel("Seek audio")).toBeEnabled();
  await preview
    .getByRole("button", { name: "Play audio", exact: true })
    .click();
  await expect
    .poll(() =>
      preview
        .locator("audio")
        .evaluate((el) => (el as HTMLAudioElement).currentTime),
    )
    .toBeGreaterThan(0);
  await preview.getByRole("button", { name: "Pause audio" }).click();
  await page.getByRole("tab", { name: "Python", exact: true }).click();
  await page.getByRole("button", { name: "Copy code", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "from natlaskit import NatlasClient",
  );
  const faq = page.locator("details").filter({
    has: page.locator("summary", { hasText: "Can I get started on a CPU?" }),
  });
  await faq.locator("summary").click();
  await expect(faq.locator("p")).toBeVisible();
});

test("docs search, model links, anchors, and page sharing work", async ({
  page,
}) => {
  await page.goto("/docs/models");
  await expect(page.locator(".docs-model-grid > a")).toHaveCount(4);
  await expect(
    page
      .locator(".docs-model-grid > a")
      .filter({ hasText: "NCAIR1/Hausa-ASR" }),
  ).toHaveAttribute("href", "https://huggingface.co/NCAIR1/Hausa-ASR");
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "http://localhost:4310/docs/models",
  );
  await page
    .locator("#nd-toc")
    .getByRole("link", { name: "Access and terms", exact: true })
    .click();
  await expect(page).toHaveURL(/#access-and-terms$/);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("Search", { exact: true }).fill("Hausa");
  await expect(
    dialog.getByText("Official language models", { exact: true }).first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page
    .locator("#nd-sidebar")
    .getByRole("link", { name: "Python SDK", exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/python$/);
  await expect(page.locator("h1")).toHaveText("Python SDK");
});

test("mobile navigation and docs drawer lead to readable pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Documentation", exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs$/);
  await page.getByRole("button", { name: "Open documentation menu" }).click();
  const drawer = page.locator("#nd-sidebar-mobile");
  await expect(drawer).toBeVisible();
  await drawer
    .getByRole("link", { name: "Language models", exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/models$/);
  await expect(drawer).not.toBeVisible();
  await expect(page.locator("h1")).toHaveText("Official language models");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
