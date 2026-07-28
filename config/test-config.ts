/**
 * Execution-level settings, separated from environment (which/where) so CI can tune
 * concurrency and retry behavior without touching environment definitions.
 */
export interface TestExecutionConfig {
  headless: boolean;
  workers: number | undefined;
  retries: number;
  actionTimeoutMs: number;
  navigationTimeoutMs: number;
  isCI: boolean;
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const testExecutionConfig: TestExecutionConfig = {
  headless: toBool(process.env.HEADLESS, true),
  workers: process.env.WORKERS ? toInt(process.env.WORKERS, 4) : undefined,
  retries: toInt(process.env.RETRIES, process.env.CI ? 2 : 0),
  actionTimeoutMs: 15_000,
  navigationTimeoutMs: 30_000,
  isCI: Boolean(process.env.CI),
};

export default testExecutionConfig;
