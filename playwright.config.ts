import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

const desktop = devices["Desktop Chrome"];
const mobile360 = {
  ...devices["Pixel 7"],
  viewport: { width: 360, height: 780 },
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // Optional: point at a preinstalled Chromium instead of `playwright install`.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  projects: [
    {
      name: "desktop-ar",
      use: { ...desktop, locale: "ar-SA" },
      metadata: { locale: "ar" },
    },
    {
      name: "desktop-en",
      use: { ...desktop, locale: "en" },
      metadata: { locale: "en" },
    },
    {
      name: "mobile-ar",
      use: { ...mobile360, locale: "ar-SA" },
      metadata: { locale: "ar" },
    },
    {
      name: "mobile-en",
      use: { ...mobile360, locale: "en" },
      metadata: { locale: "en" },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // Fresh E2E database, then a production build.
        command: `pnpm e2e:db && pnpm build && pnpm start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
        // Stop the server politely so PGlite can close its files.
        gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
        env: {
          PGLITE_DATA_DIR: ".pglite-e2e",
          // E2E screenshots /styleguide, which is 404 in production builds without this flag.
          ENABLE_STYLEGUIDE: "1",
          // Lets tests pin "now" with a cookie to check the same-day cut-off.
          ENABLE_TEST_CLOCK: "1",
        },
      },
});
