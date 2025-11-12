import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration
 *
 * Purpose: Configure Playwright for end-to-end testing of the Vendora application
 *
 * Key Features:
 * - Runs tests against local dev server (http://localhost:8080)
 * - Uses Chromium browser (fast, reliable)
 * - Captures screenshots and traces on failure
 * - Parallel execution for faster test runs
 * - Automatic retry on failure
 */
export default defineConfig({
  // Test directory
  testDir: './test/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:8080',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
