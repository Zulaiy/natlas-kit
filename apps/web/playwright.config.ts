import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:4310",
    viewport: { width: 1440, height: 1100 },
    permissions: ["microphone", "clipboard-read", "clipboard-write"],
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm start --port 4310",
    url: "http://localhost:4310",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
