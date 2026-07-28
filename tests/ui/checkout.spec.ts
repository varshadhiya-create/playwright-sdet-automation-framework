import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Checkout @regression', () => {
  test('authenticated user can add a product and place an order (positive, E2E) @smoke', async ({
    authenticatedPage,
    productsPage,
    checkoutPage,
  }) => {
    await authenticatedPage.page.goto('/');
    await productsPage.open();
    await productsPage.addFirstProductToCart();
    await productsPage.viewCart();

    await checkoutPage.proceedToCheckout();
    await checkoutPage.addOrderComment('Please deliver in the afternoon — automated test order.');
    await checkoutPage.placeOrder();

    await checkoutPage.payWithCard({
      nameOnCard: authenticatedPage.user.name,
      cardNumber: '4111111111111111',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '2030',
    });

    await checkoutPage.expectOrderPlacedSuccessfully();
  });

  test('checkout requires an account — guest is redirected to login (negative)', async ({
    page,
    productsPage,
    checkoutPage,
  }) => {
    await page.goto('/');
    await productsPage.open();
    await productsPage.addFirstProductToCart();
    await productsPage.viewCart();
    await checkoutPage.proceedToCheckout();

    await expect(
      page.getByText('Register / Login account to proceed on checkout.')
    ).toBeVisible();
  });
});
