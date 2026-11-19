import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /e2e[\\/]site[\\/]/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'site',
      testMatch: /e2e[\\/]site[\\/].*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
  ],
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      // Builds the docs site, then serves the static output on port 3000.
      command: 'npm run build:site && npm run preview -w projects/site -- -l 3000',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env['CI'],
      timeout: 300_000,
    },
  ],
});
