import fs from 'fs';
import { chromium, request as playwrightRequest, FullConfig } from '@playwright/test';
import { resolveEnvironment } from './config/environments';
import { authDir, seededUserCredentials, storageStatePath } from './config/auth-config';
import { ApiClient } from './src/api/api-client';
import { UsersApi } from './src/api/users-api';
import { logger } from './src/utils/logger';

/**
 * Runs once before the whole run (not per worker, not per test). It provisions a single
 * seeded user and captures its logged-in browser storageState to disk.
 *
 * Why this exists: without it, every test that needs to be "logged in" would repeat the
 * UI signup/login flow, which is (a) slow — a full page load + form submission per test —
 * and (b) a source of flake, since it re-exercises the login UI as a *side effect* of
 * unrelated tests instead of as its own explicit test. Login/signup UI behavior is still
 * covered directly and explicitly in tests/ui/login.spec.ts.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const env = resolveEnvironment();
  const credentials = seededUserCredentials(env.name);

  fs.mkdirSync(authDir(), { recursive: true });

  const apiRequestContext = await playwrightRequest.newContext({ baseURL: env.apiBaseUrl });
  const apiClient = new ApiClient(apiRequestContext);
  const usersApi = new UsersApi(apiClient);

  const loginCheck = await usersApi.verifyLogin(credentials.email, credentials.password);
  if (loginCheck.responseCode !== 200) {
    logger.info(`Global setup: seeded user does not exist yet, creating ${credentials.email}`);
    await usersApi.createAccount({
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
    });
  } else {
    logger.info(`Global setup: reusing existing seeded user ${credentials.email}`);
  }
  await apiRequestContext.dispose();

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: env.baseUrl });

  await page.goto('/login');
  await page.getByPlaceholder('Email Address').first().fill(credentials.email);
  await page.getByPlaceholder('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('Logged in as').waitFor();

  const statePath = storageStatePath(env.name);
  await page.context().storageState({ path: statePath });
  logger.info(`Global setup: storageState saved to ${statePath}`);

  await browser.close();

  writeAllureEnvironmentInfo(env.name, config);
}

/**
 * Allure reads `allure-results/environment.properties` and renders it as an "Environment"
 * tab on the report — invaluable when triaging a failure days later ("which env/browser
 * combination was this?") without digging through CI logs.
 */
function writeAllureEnvironmentInfo(envName: string, config: FullConfig): void {
  const resultsDir = process.env.ALLURE_RESULTS_DIR ?? 'allure-results';
  fs.mkdirSync(resultsDir, { recursive: true });

  const projects = config.projects.map((p) => p.name).join(', ');
  const lines = [
    `Environment=${envName}`,
    `Browsers=${projects}`,
    `Node=${process.version}`,
    `CI=${Boolean(process.env.CI)}`,
    `RunTimestamp=${new Date().toISOString()}`,
  ];

  fs.writeFileSync(`${resultsDir}/environment.properties`, lines.join('\n'));
}

export default globalSetup;
