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
    url: 'http://localhost:3000/api/health/liveness',
    reuseExistingServer: true,
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
