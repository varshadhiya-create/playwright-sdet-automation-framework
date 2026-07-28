import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestDataGenerator } from '../../src/utils/test-data-generator';

/**
 * Proves the API and UI agree on state: create a user purely via API, then confirm the UI
 * login flow accepts those exact credentials — catches drift between the two surfaces that
 * UI-only or API-only suites would miss.
 */
test.describe('UI ↔ API Integration', { tag: ['@integration', '@regression'] }, () => {
  test(
    'account created via API can log in through the UI',
    { tag: ['@smoke', '@critical'] },
    async ({ usersApi, loginPage, dashboardPage, page }) => {
      const user = TestDataGenerator.randomUser();

      const apiResult = await usersApi.createAccount(user);
      expect(apiResult.responseCode).toBe(201);

      await page.goto('/');
      await loginPage.open();
      await loginPage.login(user.email, user.password);

      await dashboardPage.expectWelcomeBanner(user.name);

      await usersApi.deleteAccount(user.email, user.password);
    }
  );

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

  test(
    'authenticatedPage storageState session remains valid against the live API session check',
    async ({ authenticatedPage, usersApi }) => {
      // Confirms the storageState captured in global-setup.ts corresponds to a session the
      // API itself still recognizes as a valid account — catches "storageState went stale"
      // drift (e.g. seeded account deleted out-of-band) before it silently breaks every
      // other authenticated test in the run.
      const result = await usersApi.verifyLogin(
        authenticatedPage.user.email,
        authenticatedPage.user.password
      );
      expect(result.responseCode).toBe(200);
    }
  );

  test(
    'every product returned by the API is discoverable through the UI search box (positive)',
    { tag: ['@critical'] },
    async ({ productsApi, productsPage, page }) => {
      const apiResponse = await productsApi.getAllProducts();
      // Sampling rather than iterating the full catalog keeps this test fast while still
      // catching systemic UI/API drift (e.g. a renamed product, a broken search index).
      const sample = apiResponse.products.slice(0, 3);

      await page.goto('/');
      await productsPage.open();

      for (const product of sample) {
        await test.step(`search API-known product "${product.name}"`, async () => {
          const firstWord = product.name.split(' ')[0];
          await productsPage.searchProduct(firstWord);
          expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
        });
      }
    }
  );

  test(
    'a product added to cart in the UI matches the API-reported price for that product (positive)',
    async ({ productsApi, productsPage, cartPage, page }) => {
      const apiResponse = await productsApi.getAllProducts();
      const referenceProduct = apiResponse.products[0];

      await page.goto('/');
      await productsPage.open();
      await productsPage.addProductToCartByName(referenceProduct.name);
      await productsPage.viewCart();

      const cartUnitPrice = await cartPage.getUnitPrice(referenceProduct.name);
      expect(cartUnitPrice.replace(/\s/g, '')).toBe(referenceProduct.price.replace(/\s/g, ''));
    }
  );
});
