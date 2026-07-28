import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { resolveEnvironment } from './config/environments';
import { testExecutionConfig } from './config/test-config';

dotenv.config();

const env = resolveEnvironment();

export default defineConfig({
  testDir: './tests',
  // Provisions a seeded, logged-in session once (storageState) instead of every test
  // repeating the UI login flow — see global-setup.ts.
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: testExecutionConfig.isCI,
  retries: testExecutionConfig.retries,
  workers: testExecutionConfig.workers,
  timeout: env.defaultTimeoutMs,
  expect: {
    timeout: 10_000,
  },
  // Metadata surfaces in the HTML report header and in Allure's environment tab —
  // answers "which env/build was this?" without cross-referencing CI logs.
  metadata: {
    environment: env.name,
    baseUrl: env.baseUrl,
    ciRun: process.env.GITHUB_RUN_ID ?? 'local',
  },
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
        title: `Playwright SDET Automation Framework — ${env.name.toUpperCase()}`,
      },
    ],
    ['allure-playwright', { resultsDir: process.env.ALLURE_RESULTS_DIR ?? 'allure-results' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ...(testExecutionConfig.isCI ? [['github'] as const] : []),
  ],
  use: {
    baseURL: env.baseUrl,
    headless: testExecutionConfig.headless,
    actionTimeout: testExecutionConfig.actionTimeoutMs,
    navigationTimeout: testExecutionConfig.navigationTimeoutMs,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
