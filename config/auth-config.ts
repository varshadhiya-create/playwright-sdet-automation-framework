import path from 'path';
import { EnvironmentName } from './environments';

/**
 * Centralizes everything related to the pre-authenticated ("storageState") session so
 * global-setup.ts and the `authenticatedPage` fixture agree on a single source of truth.
 *
 * Storage state is keyed by environment so a stale local session can never leak into a
 * qa/staging run (and vice versa) when a developer switches ENV between runs.
 */
export interface SeededUserCredentials {
  name: string;
  email: string;
  password: string;
}

const AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth');

export function storageStatePath(env: EnvironmentName): string {
  return path.join(AUTH_DIR, `${env}.json`);
}

export function authDir(): string {
  return AUTH_DIR;
}

/**
 * A single, stable seeded account reused across the whole run for storageState-based auth.
 * Fixed (not per-test-random) on purpose: storageState is captured once in global setup,
 * so every test that consumes it must be able to log in as the *same* user. Tests that
 * exercise signup/login behavior itself still generate their own throwaway users via
 * TestDataGenerator and never touch this account.
 *
 * Override via env vars in CI/QA/staging where a real seeded fixture account should be used
 * instead of one created on the fly against the public demo app.
 */
export function seededUserCredentials(env: EnvironmentName): SeededUserCredentials {
  return {
    name: process.env.SEED_USER_NAME ?? 'SDET Fixture User',
    email: process.env.SEED_USER_EMAIL ?? `sdet.fixture.${env}@mailinator.com`,
    password: process.env.SEED_USER_PASSWORD ?? 'Fixture!Passw0rd',
  };
}
