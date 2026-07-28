import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { withAdRecovery } from '../utils/ad-overlay-handler';

/**
* Covers the cart -> checkout -> payment flow. Kept separate from ProductsPage since it
* represents a distinct URL/responsibility (cart & checkout), not product browsing.
*/
export class CheckoutPage extends BasePage {
  private readonly cartRows: Locator;
  private readonly proceedToCheckoutButton: Locator;
  private readonly commentTextArea: Locator;
  private readonly placeOrderButton: Locator;
  private readonly nameOnCardInput: Locator;
  private readonly cardNumberInput: Locator;
  private readonly cvcInput: Locator;
  private readonly expiryMonthInput: Locator;
  private readonly expiryYearInput: Locator;
  private readonly payAndConfirmButton: Locator;
  private readonly orderSuccessMessage: Locator;
  private readonly addressDeliverySection: Locator;
  private readonly reviewOrderHeading: Locator;
  private readonly orderPlacedHeading: Locator;
  private readonly downloadInvoiceButton: Locator;
  private readonly continueButton: Locator;

constructor(page: Page) {
  super(page);
  this.cartRows = page.locator('#cart_info tbody tr');
  this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');
  this.commentTextArea = page.locator('textarea[name="message"]');
  this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
  this.nameOnCardInput = page.locator('[data-qa="name-on-card"]');
  this.cardNumberInput = page.locator('[data-qa="card-number"]');
  this.cvcInput = page.locator('[data-qa="cvc"]');
  this.expiryMonthInput = page.locator('[data-qa="expiry-month"]');
  this.expiryYearInput = page.locator('[data-qa="expiry-year"]');
  this.payAndConfirmButton = page.locator('[data-qa="pay-button"]');
  this.orderSuccessMessage = page.getByText('Your order has been placed successfully!');
  this.addressDeliverySection = page.locator('#address_delivery');
  this.reviewOrderHeading = page.getByText('Review Your Order');
  this.orderPlacedHeading = page.getByRole('heading', { name: 'Order Placed!' });
  this.downloadInvoiceButton = page.getByRole('link', { name: 'Download Invoice' });
  this.continueButton = page.getByRole('link', { name: 'Continue' });
}

async cartItemCount(): Promise<number> {
  return this.cartRows.count();
}

async proceedToCheckout(): Promise<void> {
  await this.proceedToCheckoutButton.click();
}

async addOrderComment(comment: string): Promise<void> {
  await this.commentTextArea.fill(comment);
}

async placeOrder(): Promise<void> {
  await this.placeOrderButton.click();
}

async payWithCard(details: {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}): Promise<void> {
  await this.nameOnCardInput.fill(details.nameOnCard);
  await this.cardNumberInput.fill(details.cardNumber);
  await this.cvcInput.fill(details.cvc);
  await this.expiryMonthInput.fill(details.expiryMonth);
  await this.expiryYearInput.fill(details.expiryYear);
  await this.payAndConfirmButton.click();
}

async expectOrderPlacedSuccessfully(): Promise<void> {
  await expect(this.orderSuccessMessage).toBeVisible();
}

// --- Checkout validation ---

async expectReviewOrderVisible(): Promise<void> {
  await expect(this.reviewOrderHeading).toBeVisible();
}

async expectDeliveryAddressContains(text: string): Promise<void> {
  await expect(this.addressDeliverySection).toContainText(text);
}

/**
  * Submits the payment form with every field left blank. The fields carry the `required`
  * HTML attribute, so the browser blocks submission natively -- no custom JS assertion
  * needed, and no hard-coded wait: we assert on the page simply never navigating away.
  */
async attemptPaymentWithEmptyFields(): Promise<void> {
  await this.payAndConfirmButton.click();
}

async expectStillOnPaymentPage(): Promise<void> {
  await expect(this.nameOnCardInput).toBeVisible();
  await expect(this.orderSuccessMessage).not.toBeVisible();
}

// --- Order confirmation ---

async expectOrderConfirmationDetails(): Promise<void> {
  // The pay-and-confirm click already happened in payWithCard(); this only retries the
  // *assertions* (with ad-overlay dismissal in between) rather than resubmitting payment,
  // since resubmitting could place a duplicate order.
  await withAdRecovery(this.page, async () => {
    await expect(this.orderPlacedHeading).toBeVisible({ timeout: 6000 });
    await expect(this.orderSuccessMessage).toBeVisible({ timeout: 6000 });
  });
  await expect(this.downloadInvoiceButton).toBeVisible();
}

async continueAfterOrderConfirmation(): Promise<void> {
  await this.continueButton.click();
}
}
