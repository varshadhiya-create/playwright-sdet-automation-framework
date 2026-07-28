import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Product Catalog', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page, productsPage }) => {
    await page.goto('/');
    await productsPage.open();
  });

  test('product listing renders items', { tag: ['@smoke'] }, async ({ productsPage }) => {
    expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
  });

  test('searching a known product returns matching results (positive)', async ({
    productsPage,
  }) => {
    await productsPage.searchProduct('Dress');
    expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
    await productsPage.expectProductVisible('Dress');
  });

  test(
    'searching each known term from static test data returns results',
    async ({ productsPage, testData }) => {
      for (const term of testData.products.knownSearchTerms) {
        await productsPage.searchProduct(term);
        expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
      }
    }
  );

  test('searching a nonsense term returns zero results (boundary)', async ({ productsPage }) => {
    await productsPage.searchProduct('zzzzznotarealproduct9999');
    await productsPage.expectNoResultsOrEmptyState();
  });

  test(
    'adding a product to cart shows confirmation and updates cart (positive)',
    { tag: ['@critical'] },
    async ({ productsPage, checkoutPage }) => {
      await productsPage.addFirstProductToCart();
      await productsPage.viewCart();
      expect(await checkoutPage.cartItemCount()).toBeGreaterThan(0);
    }
  );
});
