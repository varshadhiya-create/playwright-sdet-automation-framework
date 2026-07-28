import { resolveEnvironment, EnvironmentConfig } from '../../config/environments';

/**
 * Thin accessor so tests/pages don't import config directly — keeps a single seam
 * if environment resolution logic ever needs to change (e.g. secrets manager lookup).
 */
export class EnvironmentHelper {
  private static cached: EnvironmentConfig | undefined;

  static get current(): EnvironmentConfig {
    if (!this.cached) {
      this.cached = resolveEnvironment();
    }
    return this.cached;
  }

  static get baseUrl(): string {
    return this.current.baseUrl;
  }

  static get apiBaseUrl(): string {
    return this.current.apiBaseUrl;
  }

  static isProdLike(): boolean {
    return this.current.name === 'staging';
  }
}
