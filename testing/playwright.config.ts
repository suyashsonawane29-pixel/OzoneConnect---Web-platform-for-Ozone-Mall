import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './testing/playwright',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'testing/reports/html-report', open: 'never' }],
    ['json', { outputFile: 'testing/reports/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'off',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  outputDir: 'testing/reports/test-artifacts',
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
  timeout: 60000,
});
