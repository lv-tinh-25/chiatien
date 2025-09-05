import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  // One worker, no video: parallel Chromium instances do not fit in the memory
  // this machine has free.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  webServer: {
    command: 'npm run start',
    // The ported specs assert amounts formatted as US dollars, so the server
    // under test creates groups in USD regardless of the local default.
    //
    // The optional features are switched on so their screens are covered. The
    // S3 credentials are deliberately fake: `env.ts` refuses to boot with the
    // flag set and no bucket, and every upload is fulfilled inside the browser
    // (see e2e/fixtures.ts), so nothing leaves this machine. OPENAI_BASE_URL
    // points at the discard port for the same reason.
    env: {
      DEFAULT_CURRENCY_CODE: 'USD',
      ENABLE_EXPENSE_DOCUMENTS: 'true',
      S3_UPLOAD_BUCKET: 'chiatien-e2e',
      S3_UPLOAD_KEY: 'e2e-key',
      S3_UPLOAD_SECRET: 'e2e-secret',
      S3_UPLOAD_REGION: 'us-east-1',
      ENABLE_RECEIPT_EXTRACT: 'true',
      OPENAI_API_KEY: 'e2e-key',
      OPENAI_BASE_URL: 'http://127.0.0.1:9/v1',
    },
    url: 'http://localhost:3000/api/health/liveness',
    // Never reuse: a dev server left running from an earlier build silently
    // serves stale code and every assertion fails for the wrong reason.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Must stay at or above 768px: useMediaQuery swaps Radix Dialog for
        // Vaul Drawer below it, which renders a different component tree.
        viewport: { width: 1280, height: 900 },
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    },
  ],
})
