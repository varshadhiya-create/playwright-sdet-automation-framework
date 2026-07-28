import { ApiClient } from './api-client';
import { EnvironmentHelper } from '../utils/environment-helper';
import { CreateAccountResponse, User, VerifyLoginResponse } from '../types/application-types';

/**
 * Wraps automationexercise.com's /api/{createAccount,verifyLogin,deleteAccount,...} endpoints.
 * Field mapping matches the API's documented form-field names (not our internal User shape),
 * isolating that translation here instead of leaking API quirks into tests.
 */
export class UsersApi {
  private readonly baseUrl = `${EnvironmentHelper.apiBaseUrl}`;

  constructor(private readonly client: ApiClient) {}

  async createAccount(user: User): Promise<CreateAccountResponse> {
    const form: Record<string, string> = {
      name: user.name,
      email: user.email,
      password: user.password,
      title: user.title ?? 'Mr',
      birth_date: user.birthDate?.day ?? '1',
      birth_month: user.birthDate?.month ?? 'January',
      birth_year: user.birthDate?.year ?? '1990',
      firstname: user.firstName ?? user.name.split(' ')[0],
      lastname: user.lastName ?? user.name.split(' ')[1] ?? 'Doe',
      company: user.company ?? 'QA Corp',
      address1: user.address1 ?? '123 Main St',
      address2: user.address2 ?? '',
      country: user.country ?? 'United States',
      zipcode: user.zipcode ?? '10001',
      state: user.state ?? 'NY',
      city: user.city ?? 'New York',
      mobile_number: user.mobileNumber ?? '5555555555',
    };
    const { body } = await this.client.post<CreateAccountResponse>(
      `${this.baseUrl}/createAccount`,
      form
    );
    return body;
  }

  async verifyLogin(email: string, password: string): Promise<VerifyLoginResponse> {
    const { body } = await this.client.post<VerifyLoginResponse>(
      `${this.baseUrl}/verifyLogin`,
      { email, password }
    );
    return body;
  }

  async deleteAccount(email: string, password: string): Promise<CreateAccountResponse> {
    const { body } = await this.client.delete<CreateAccountResponse>(
      `${this.baseUrl}/deleteAccount`,
      { email, password }
    );
    return body;
  }

  async getUserDetailByEmail(email: string): Promise<unknown> {
    const { body } = await this.client.get(`${this.baseUrl}/getUserDetailByEmail`, { email });
    return body;
  }
}
