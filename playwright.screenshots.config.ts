import { defineConfig, devices } from '@playwright/test'

const port = process.env.E2E_PORT ?? '3000'

/**
 * Captures the screenshots in docs/screenshots. Separate from the test config
 * because these are documentation, not assertions: they are regenerated on
 * demand rather than on every run, and a change in them is reviewed by eye.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.capture.ts',
  outputDir: './test-results',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: [['list']],
  webServer: {
    command: 'npm run start',
    env: {
      DEFAULT_CURRENCY_CODE: 'VND',
      ENABLE_EXPENSE_DOCUMENTS: 'true',
      S3_UPLOAD_BUCKET: 'chiatien-docs',
      S3_UPLOAD_KEY: 'docs-key',
      S3_UPLOAD_SECRET: 'docs-secret',
      S3_UPLOAD_REGION: 'us-east-1',
      ENABLE_RECEIPT_EXTRACT: 'true',
      OPENAI_API_KEY: 'docs-key',
      OPENAI_BASE_URL: 'http://127.0.0.1:9/v1',
      PORT: port,
    },
    url: `http://localhost:${port}/api/health/liveness`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    navigationTimeout: 30_000,
    video: 'off',
    timezoneId: 'UTC',
  },
})
