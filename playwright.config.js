import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/browser",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4178/woodshed/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    acceptDownloads: true,
  },
  projects: [
    { name: "chromium-desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
    { name: "chromium-narrow", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "webkit-desktop", use: { browserName: "webkit", viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: "node scripts/serve-browser-tests.mjs",
    url: "http://127.0.0.1:4178/woodshed/",
    reuseExistingServer: false,
    timeout: 15000,
  },
});
