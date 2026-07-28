import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { resolveEnvironment } from './config/environments';
import { testExecutionConfig } from './config/test-config';

dotenv.config();

const env = resolveEnvironment();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: testExecutionConfig.isCI,
  retries: testExecutionConfig.retries,
  workers: testExecutionConfig.workers,
  timeout: env.defaultTimeoutMs,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: process.env.ALLURE_RESULTS_DIR ?? 'allure-results' }],
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
