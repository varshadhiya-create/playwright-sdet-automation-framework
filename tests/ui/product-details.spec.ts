import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Product Details', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page, productsPage }) => {
    await page.goto('/');
    await productsPage.open();
  });

  test(
    'product details page shows name, price, category, availability, condition, and brand (positive)',
    { tag: ['@smoke', '@critical'] },
    async ({ productsPage, productDetailsPage }) => {
      const names = await productsPage.getVisibleProductNames();
      const targetName = names[0];

      await test.step('navigate from catalog to product details', async () => {
        await productsPage.viewProductDetails(targetName);
      });

      await test.step('assert core product details are visible', async () => {
        await productDetailsPage.expectCoreDetailsVisible();
        expect(await productDetailsPage.getProductName()).toBe(targetName);
        expect(await productDetailsPage.getProductPrice()).toMatch(/Rs\.\s?\d+/);
      });
    }
  );

  test('quantity field accepts a valid positive integer (positive)', async ({
    page,
    productsPage,
    productDetailsPage,
  }) => {
    const names = await productsPage.getVisibleProductNames();
    await productsPage.viewProductDetails(names[0]);

    await productDetailsPage.setQuantity(3);
    await productDetailsPage.addToCart();
    await productDetailsPage.goToCartFromModal();

    await expect(page).toHaveURL(/view_cart/);
  });

  test(
    'quantity boundary values from static test data are all accepted by the input (boundary)',
    async ({ productsPage, productDetailsPage, testData }) => {
      const names = await productsPage.getVisibleProductNames();
      await productsPage.viewProductDetails(names[0]);

      for (const { value } of testData.cart.boundaryQuantities) {
        await productDetailsPage.setQuantity(value);
      }
    }
  );

  test('submitting a product review with valid data succeeds (positive)', async ({
    productsPage,
    productDetailsPage,
  }) => {
    const names = await productsPage.getVisibleProductNames();
    await productsPage.viewProductDetails(names[0]);

    await productDetailsPage.submitReview(
      'QA Reviewer',
      'qa.reviewer@example.com',
      'Solid product, automated review submission works as expected.'
    );
    await productDetailsPage.expectReviewSubmitted();
  });

  // Demonstrates test.skip with a clear reason: the review form has no client-side email
  // format validation on this demo app (it accepts any string server-side), so a
  // "malformed email is rejected" assertion would be testing behavior the app doesn't have.
  test.skip(
    'submitting a review with a malformed email is rejected (negative)',
    async () => {
      // Skipped: automationexercise.com's review form does not validate email format;
      // it accepts the submission regardless. Re-enable if/when the app adds validation.
    }
  );
});
