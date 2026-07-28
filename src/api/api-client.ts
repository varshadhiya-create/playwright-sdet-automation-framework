import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../utils/logger';
import { ApiResponseEnvelope } from '../types/application-types';

/**
 * Generic REST wrapper around Playwright's APIRequestContext. Resource-specific classes
 * (UsersApi, ProductsApi) compose this rather than re-implementing request plumbing —
 * keeps retry/logging/error-shaping in one place (DRY, single responsibility).
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponseEnvelope<T>> {
    logger.info(`GET ${url}`);
    const response = await this.request.get(url, { params });
    return this.toEnvelope<T>(response);
  }

  async post<T>(
    url: string,
    form: Record<string, string>
  ): Promise<ApiResponseEnvelope<T>> {
    logger.info(`POST ${url}`);
    const response = await this.request.post(url, { form });
    return this.toEnvelope<T>(response);
  }

  async delete<T>(url: string, form: Record<string, string>): Promise<ApiResponseEnvelope<T>> {
    logger.info(`DELETE ${url}`);
    const response = await this.request.delete(url, { form });
    return this.toEnvelope<T>(response);
  }

  private async toEnvelope<T>(response: APIResponse): Promise<ApiResponseEnvelope<T>> {
    const status = response.status();
    const ok = response.ok();
    let body: T;
    try {
      body = (await response.json()) as T;
    } catch (error) {
      logger.warn(`Response for ${response.url()} was not valid JSON: ${(error as Error).message}`);
      body = (await response.text()) as unknown as T;
    }
    return { status, ok, body };
  }
}
