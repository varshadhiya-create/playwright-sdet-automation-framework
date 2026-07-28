import {
  test as base,
  APIRequestContext,
  BrowserContext,
  Page,
  request as playwrightRequest,
} from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { ProductsPage } from '../pages/products.page';
import { CheckoutPage } from '../pages/checkout.page';
import { CartPage } from '../pages/cart.page';
import { ProductDetailsPage } from '../pages/product-details.page';
import { ApiClient } from '../api/api-client';
import { UsersApi } from '../api/users-api';
import { ProductsApi } from '../api/products-api';
import { TestDataGenerator } from '../utils/test-data-generator';
import { EnvironmentHelper } from '../utils/environment-helper';
import { seededUserCredentials, storageStatePath, SeededUserCredentials } from '../../config/auth-config';
import { EnvironmentConfig } from '../../config/environments';
import { StaticTestData, User } from '../types/application-types';
import { logger } from '../utils/logger';

import usersFixtureData from '../../test-data/users.json';
import productsFixtureData from '../../test-data/products.json';
import cartFixtureData from '../../test-data/cart.json';

/**
* automationexercise.com is a free, ad-monetized demo site that occasionally serves a
* full-page "Google vignette" ad interstitial on navigation clicks. Reactively dismissing
* it after the fact is racy (the ad can render after the dismiss check already ran), so
* instead every context blocks the ad-serving domains outright at the network level --
* the overlay never loads in the first place.
*/
const AD_NETWORK_HOST_PATTERN = /googlesyndication\.com|doubleclick\.net|google\.com\/pagead|googleadservices\.com|adservice\.google/;

async function blockAdNetworkRequests(context: BrowserContext): Promise<void> {
  await context.route(AD_NETWORK_HOST_PATTERN, (route) => route.abort());
}

/**
* Extended fixture set -- the framework's dependency-injection layer. Tests declare what
* they need (`{ authenticatedPage, testData }`) and never construct pages, API clients, or
* sessions themselves.
*
* Two distinct "logged in" patterns are intentionally kept separate:
* - `authenticatedPage` -- reuses the storageState captured once in global-setup.ts for a
* single seeded account. No login UI runs during the test. This is the default choice
* for any test that merely *requires* an authenticated session as a precondition.
* - Tests that verify the login/signup flow *itself* (tests/ui/login.spec.ts) deliberately
* bypass this fixture and drive `loginPage` directly, since re-running login is the point
* of those tests, not overhead to avoid.
*/
export interface Fixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productsPage: ProductsPage;
  checkoutPage: CheckoutPage;
  cartPage: CartPage;
  productDetailsPage: ProductDetailsPage;
  apiRequestContext: APIRequestContext;
  apiClient: ApiClient;
  usersApi: UsersApi;
  productsApi: ProductsApi;
  environment: EnvironmentConfig;
  testData: StaticTestData;
  testUser: User;
  authenticatedPage: { page: Page; user: SeededUserCredentials };
  // Page objects pre-bound to the authenticated session's page, so tests that need to be
// logged in never have to juggle two different `Page` instances (anonymous vs. authed).
authenticatedDashboardPage: DashboardPage;
  authenticatedProductsPage: ProductsPage;
  authenticatedCheckoutPage: CheckoutPage;
  authenticatedCartPage: CartPage;
  authenticatedProductDetailsPage: ProductDetailsPage;
}

export const test = base.extend<Fixtures>({
  // Overrides Playwright's built-in `context` fixture so every test -- not just the ones
                                          // using the custom page-object fixtures below -- gets ad-network blocking for free.
                                          context: async ({ context }, use) => {
                                            await blockAdNetworkRequests(context);
                                            await use(context);
                                          },

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

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },

  // Environment fixture: exposes the resolved base/API URLs and timeouts so tests can make
  // environment-aware assertions or decisions without importing config directly.
  environment: async ({}, use) => {
    await use(EnvironmentHelper.current);
  },

  // Test data fixture: static, reviewable JSON fixtures (boundary/invalid cases) available
  // to any test via dependency injection, distinct from the dynamic `testUser` fixture below.
  testData: async ({}, use) => {
    await use({
      users: usersFixtureData,
      products: productsFixtureData,
      cart: cartFixtureData,
    });
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

  // Dynamic test data fixture: a fresh, unique user per test via Faker. Used by
  // signup/negative-path tests that must control the identity under test directly.
  testUser: async ({}, use) => {
    await use(TestDataGenerator.randomUser());
  },

  // Authenticated user fixture: consumes the storageState written by global-setup.ts.
  // Creating a dedicated browser context here (rather than relying on the default `page`
  // fixture) means only tests that ask for `authenticatedPage` pay for/receive a session --
  // every other test stays anonymous by default.
  authenticatedPage: async ({ browser, environment }, use) => {
    const context = await browser.newContext({
      storageState: storageStatePath(environment.name),
      baseURL: environment.baseUrl,
    });
    await blockAdNetworkRequests(context);
    const page = await context.newPage();
    const user = seededUserCredentials(environment.name);

  logger.debug(`authenticatedPage fixture: reusing storageState session for ${user.email}`);
    await use({ page, user });

  await context.close();
  },

  authenticatedDashboardPage: async ({ authenticatedPage }, use) => {
    await use(new DashboardPage(authenticatedPage.page));
  },

  authenticatedProductsPage: async ({ authenticatedPage }, use) => {
    await use(new ProductsPage(authenticatedPage.page));
  },

  authenticatedCheckoutPage: async ({ authenticatedPage }, use) => {
    await use(new CheckoutPage(authenticatedPage.page));
  },

  authenticatedCartPage: async ({ authenticatedPage }, use) => {
    await use(new CartPage(authenticatedPage.page));
  },

  authenticatedProductDetailsPage: async ({ authenticatedPage }, use) => {
    await use(new ProductDetailsPage(authenticatedPage.page));
  },
});

export { expect } from '@playwright/test';
