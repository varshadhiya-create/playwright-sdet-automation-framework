import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Product Catalog @regression', () => {
  test.beforeEach(async ({ page, productsPage }) => {
    await page.goto('/');
    await productsPage.open();
  });

  test('product listing renders items @smoke', async ({ productsPage }) => {
    expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
  });

  test('searching a known product returns matching results (positive)', async ({
    productsPage,
  }) => {
    await productsPage.searchProduct('Dress');
    expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
    await productsPage.expectProductVisible('Dress');
  });

  test('searching a nonsense term returns zero results (boundary)', async ({ productsPage }) => {
    await productsPage.searchProduct('zzzzznotarealproduct9999');
    await productsPage.expectNoResultsOrEmptyState();
  });

  test('adding a product to cart shows confirmation and updates cart (positive)', async ({
    productsPage,
    checkoutPage,
  }) => {
    await productsPage.addFirstProductToCart();
    await productsPage.viewCart();
    expect(await checkoutPage.cartItemCount()).toBeGreaterThan(0);
  });
});
