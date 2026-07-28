import { test as base, APIRequestContext, request as playwrightRequest } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProductsPage } from '../pages/products.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ApiClient } from '../api/api-client';
import { UsersApi } from '../api/users-api';
import { ProductsApi } from '../api/products-api';
import { TestDataGenerator } from '../utils/test-data-generator';
import { EnvironmentHelper } from '../utils/environment-helper';
import { User } from '../types/application-types';
import { logger } from '../utils/logger';

/**
 * Extended fixture set. Two user-state fixtures are provided:
 *  - `testUser` + unauthenticated `page`: default Playwright page, no session.
 *  - `authenticatedPage`: a page with a real session, created via the API (fast, avoids
 *    re-running the UI signup flow in every UI test that needs to be logged in) and torn
 *    down (account deleted) after the test — keeps the demo app's user list clean.
 */
export interface Fixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
  apiRequestContext: APIRequestContext;
  apiClient: ApiClient;
  usersApi: UsersApi;
  productsApi: ProductsApi;
  testUser: User;
  authenticatedPage: { page: import('@playwright/test').Page; user: User };
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  apiRequestContext: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: EnvironmentHelper.apiBaseUrl,
    });
    await use(context);
    await context.dispose();
  },

  apiClient: async ({ apiRequestContext }, use) => {
    await use(new ApiClient(apiRequestContext));
  },

  usersApi: async ({ apiClient }, use) => {
    await use(new UsersApi(apiClient));
  },

  productsApi: async ({ apiClient }, use) => {
    await use(new ProductsApi(apiClient));
  },

  testUser: async ({}, use) => {
    await use(TestDataGenerator.randomUser());
  },

  authenticatedPage: async ({ page, usersApi, testUser, loginPage }, use) => {
    await usersApi.createAccount(testUser);
    logger.info(`Fixture: created account for ${testUser.email}`);

    await page.goto('/');
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);
    await loginPage.expectLoggedIn(testUser.name);

    await use({ page, user: testUser });

    await usersApi.deleteAccount(testUser.email, testUser.password);
    logger.info(`Fixture: cleaned up account for ${testUser.email}`);
  },
});

export { expect } from '@playwright/test';
