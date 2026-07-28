import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestDataGenerator } from '../../src/utils/test-data-generator';

/**
 * Proves the API and UI agree on state: create a user purely via API, then confirm the UI
 * login flow accepts those exact credentials — catches drift between the two surfaces that
 * UI-only or API-only suites would miss.
 */
test.describe('UI ↔ API Integration @regression', () => {
  test('account created via API can log in through the UI @smoke', async ({
    usersApi,
    loginPage,
    dashboardPage,
    page,
  }) => {
    const user = TestDataGenerator.randomUser();

    const apiResult = await usersApi.createAccount(user);
    expect(apiResult.responseCode).toBe(201);

    await page.goto('/');
    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await dashboardPage.expectWelcomeBanner(user.name);

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('product visible in UI catalog matches a record from the products API', async ({
    productsApi,
    productsPage,
    page,
  }) => {
    const apiResponse = await productsApi.getAllProducts();
    const referenceProduct = apiResponse.products[0];

    await page.goto('/');
    await productsPage.open();
    await productsPage.searchProduct(referenceProduct.name.split(' ')[0]);

    await productsPage.expectProductVisible(referenceProduct.name.split(' ')[0]);
  });

  test('deleting an account via API invalidates UI login (negative)', async ({
    usersApi,
    loginPage,
    page,
  }) => {
    const user = TestDataGenerator.randomUser();
    await usersApi.createAccount(user);
    await usersApi.deleteAccount(user.email, user.password);

    await page.goto('/');
    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await loginPage.expectLoginError();
  });
});
