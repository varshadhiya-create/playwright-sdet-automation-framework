import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Cart page: viewing line items, adjusting quantity, and removing products. Kept separate
 * from CheckoutPage since "manage the cart" and "complete checkout" are distinct
 * responsibilities/URLs — CheckoutPage composes on top of what's already in the cart.
 *
 * Note on "update quantity": automationexercise.com's cart table renders quantity as a
 * read-only value — there's no inline "update" control on this page. The realistic way to
 * change quantity is to add the same product again (from the catalog or product-details
 * page with a specific quantity), which increments the existing cart line. That is the
 * pattern used by tests/ui/cart.spec.ts's "update quantity" scenarios.
 */
export class CartPage extends BasePage {
  private readonly cartRows: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('#cart_info tbody tr');
  }

  private rowByProductName(productName: string): Locator {
    return this.cartRows.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async getItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async isProductInCart(productName: string): Promise<boolean> {
    return (await this.rowByProductName(productName).count()) > 0;
  }

  async getQuantity(productName: string): Promise<number> {
    const row = this.rowByProductName(productName);
    const text = await row.locator('.cart_quantity button, .cart_quantity input').first().textContent();
    return Number((text ?? '0').trim());
  }

  async getUnitPrice(productName: string): Promise<string> {
    return (await this.rowByProductName(productName).locator('.cart_price p').textContent())?.trim() ?? '';
  }

  async getLineTotal(productName: string): Promise<string> {
    return (await this.rowByProductName(productName).locator('.cart_total_price').textContent())?.trim() ?? '';
  }

  async removeProduct(productName: string): Promise<void> {
    await this.rowByProductName(productName).locator('.cart_quantity_delete').click();
    // Deletion is an AJAX row removal — assert on the row actually disappearing rather than
    // a fixed pause, which is the auto-waiting-friendly way to confirm the action completed.
    await expect(this.rowByProductName(productName)).toHaveCount(0);
  }

  async expectEmptyCartMessage(): Promise<void> {
    await expect(this.page.getByText('Cart is empty!')).toBeVisible();
  }
}
