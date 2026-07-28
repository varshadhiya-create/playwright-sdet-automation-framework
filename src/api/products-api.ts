import { ApiClient } from './api-client';
import { EnvironmentHelper } from '../utils/environment-helper';
import { ProductsApiResponse } from '../types/application-types';

/** Wraps the read-only /api/productsList and /api/searchProduct endpoints. */
export class ProductsApi {
  private readonly baseUrl = `${EnvironmentHelper.apiBaseUrl}`;

  constructor(private readonly client: ApiClient) {}

  async getAllProducts(): Promise<ProductsApiResponse> {
    const { body } = await this.client.get<ProductsApiResponse>(`${this.baseUrl}/productsList`);
    return body;
  }

  async searchProduct(searchTerm: string): Promise<ProductsApiResponse> {
    const { body } = await this.client.post<ProductsApiResponse>(
      `${this.baseUrl}/searchProduct`,
      { search_product: searchTerm }
    );
    return body;
  }

  async getBrandsList(): Promise<unknown> {
    const { body } = await this.client.get(`${this.baseUrl}/brandsList`);
    return body;
  }
}
