/**
* Environment registry for local / qa / staging.
* QA and staging point at the same public demo app (automationexercise.com) since no
* private QA/staging deployments exist for this portfolio project -- in a real org these
* would be distinct hosts. Kept as separate entries so the selection mechanism is real.
*/
export type EnvironmentName = 'local' | 'qa' | 'staging';

export interface EnvironmentConfig {
  name: EnvironmentName;
  baseUrl: string;
  apiBaseUrl: string;
  defaultTimeoutMs: number;
}

const environments: Record<EnvironmentName, EnvironmentConfig> = {
  local: {
    name: 'local',
    baseUrl: 'https://www.automationexercise.com',
    apiBaseUrl: 'https://www.automationexercise.com/api',
    defaultTimeoutMs: 30_000,
  },
  // The live public demo app occasionally responds slowly under repeated CI load, and the
  // ad-recovery helper (src/utils/ad-overlay-handler.ts) needs headroom to retry a swallowed
  // action -- 90s keeps that budget comfortable without masking a genuinely hung test.
  qa: {
    name: 'qa',
    baseUrl: process.env.BASE_URL ?? 'https://www.automationexercise.com',
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://www.automationexercise.com/api',
    defaultTimeoutMs: 90_000,
  },
  staging: {
    name: 'staging',
    baseUrl: process.env.BASE_URL ?? 'https://www.automationexercise.com',
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://www.automationexercise.com/api',
    defaultTimeoutMs: 90_000,
  },
};

export function resolveEnvironment(envName?: string): EnvironmentConfig {
  const key = (envName ?? process.env.ENV ?? 'local') as EnvironmentName;
  const config = environments[key];
  if (!config) {
    throw new Error(
      `Unknown environment "${key}". Valid options: ${Object.keys(environments).join(', ')}`
      );
  }
  return config;
}

export default environments;
