import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Checkout', { tag: ['@ui', '@regression'] }, () => {
  test(
    'authenticated user can add a product and place an order (positive, E2E)',
    { tag: ['@smoke', '@critical'] },
    async ({ authenticatedPage, authenticatedProductsPage, authenticatedCheckoutPage }) => {
      // authenticatedPage.page already carries a logged-in storageState session — no login
      // steps run as part of this test, keeping it focused on the checkout flow itself.
      await test.step('add a product to cart', async () => {
        await authenticatedPage.page.goto('/');
        await authenticatedProductsPage.open();
        await authenticatedProductsPage.addFirstProductToCart();
        await authenticatedProductsPage.viewCart();
      });

      await test.step('proceed through checkout and leave a delivery comment', async () => {
        await authenticatedCheckoutPage.proceedToCheckout();
        await authenticatedCheckoutPage.expectReviewOrderVisible();
        await authenticatedCheckoutPage.addOrderComment(
          'Please deliver in the afternoon — automated test order.'
        );
        await authenticatedCheckoutPage.placeOrder();
      });

      await test.step('pay with a valid test card', async () => {
        await authenticatedCheckoutPage.payWithCard({
          nameOnCard: authenticatedPage.user.name,
          cardNumber: '4111111111111111',
          cvc: '123',
          expiryMonth: '12',
          expiryYear: '2030',
        });
      });

      await test.step('verify order confirmation details', async () => {
        await authenticatedCheckoutPage.expectOrderConfirmationDetails();
      });
    }
  );

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

  test(
    'review step displays the delivery address for the authenticated account (positive)',
    async ({ authenticatedPage, authenticatedProductsPage, authenticatedCheckoutPage }) => {
      await authenticatedPage.page.goto('/');
      await authenticatedProductsPage.open();
      await authenticatedProductsPage.addFirstProductToCart();
      await authenticatedProductsPage.viewCart();
      await authenticatedCheckoutPage.proceedToCheckout();

      await authenticatedCheckoutPage.expectDeliveryAddressContains(authenticatedPage.user.name);
    }
  );

  test(
    'payment is rejected when all card fields are left blank (validation)',
    { tag: ['@critical'] },
    async ({ authenticatedPage, authenticatedProductsPage, authenticatedCheckoutPage }) => {
      await authenticatedPage.page.goto('/');
      await authenticatedProductsPage.open();
      await authenticatedProductsPage.addFirstProductToCart();
      await authenticatedProductsPage.viewCart();
      await authenticatedCheckoutPage.proceedToCheckout();
      await authenticatedCheckoutPage.placeOrder();

      await authenticatedCheckoutPage.attemptPaymentWithEmptyFields();

      await authenticatedCheckoutPage.expectStillOnPaymentPage();
    }
  );

  // Demonstrates test.skip with a documented reason: automationexercise.com's payment form
  // accepts any 16-digit string as a card number (it never contacts a real payment gateway),
  // so there's no app-level Luhn/format validation to actually exercise here.
  test.skip(
    'payment is rejected for a card number that fails a Luhn check (validation)',
    async () => {
      // Skipped: the demo app performs no real card validation — this would be a false test
      // of nothing. Keep the test named/visible so real-gateway coverage is easy to slot in
      // if this framework is ever pointed at a staging environment with real payment rails.
    }
  );

  test(
    'order confirmation offers a downloadable invoice and a way to continue shopping (positive)',
    async ({ authenticatedPage, authenticatedProductsPage, authenticatedCheckoutPage }) => {
      await authenticatedPage.page.goto('/');
      await authenticatedProductsPage.open();
      await authenticatedProductsPage.addFirstProductToCart();
      await authenticatedProductsPage.viewCart();
      await authenticatedCheckoutPage.proceedToCheckout();
      await authenticatedCheckoutPage.placeOrder();
      await authenticatedCheckoutPage.payWithCard({
        nameOnCard: authenticatedPage.user.name,
        cardNumber: '4111111111111111',
        cvc: '123',
        expiryMonth: '12',
        expiryYear: '2030',
      });

      await authenticatedCheckoutPage.expectOrderConfirmationDetails();
      await authenticatedCheckoutPage.continueAfterOrderConfirmation();

      await expect(authenticatedPage.page).toHaveURL(/automationexercise\.com\/?$/);
    }
  );
});
