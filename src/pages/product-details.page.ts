import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/** The single-product detail view reached from ProductsPage.viewProductDetails(). */
export class ProductDetailsPage extends BasePage {
  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly productCategory: Locator;
  private readonly productAvailability: Locator;
  private readonly productCondition: Locator;
  private readonly productBrand: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly reviewNameInput: Locator;
  private readonly reviewEmailInput: Locator;
  private readonly reviewTextArea: Locator;
  private readonly reviewSubmitButton: Locator;
  private readonly reviewSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-information h2');
    this.productPrice = page.locator('.product-information span span');
    this.productCategory = page.locator('.product-information p').filter({ hasText: 'Category' });
    this.productAvailability = page.getByText('Availability:');
    this.productCondition = page.getByText('Condition:');
    this.productBrand = page.getByText('Brand:');
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('button').filter({ hasText: 'Add to cart' });
    this.reviewNameInput = page.locator('#name');
    this.reviewEmailInput = page.locator('#email');
    this.reviewTextArea = page.locator('#review');
    this.reviewSubmitButton = page.locator('#button-review');
    this.reviewSuccessMessage = page.getByText('Thank you for your review.');
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  async getProductPrice(): Promise<string> {
    return (await this.productPrice.first().textContent())?.trim() ?? '';
  }

  async expectCoreDetailsVisible(): Promise<void> {
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice.first()).toBeVisible();
    await expect(this.productCategory).toBeVisible();
    await expect(this.productAvailability).toBeVisible();
    await expect(this.productCondition).toBeVisible();
    await expect(this.productBrand).toBeVisible();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async goToCartFromModal(): Promise<void> {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  async submitReview(name: string, email: string, review: string): Promise<void> {
    await this.reviewNameInput.fill(name);
    await this.reviewEmailInput.fill(email);
    await this.reviewTextArea.fill(review);
    await this.reviewSubmitButton.click();
  }

  async expectReviewSubmitted(): Promise<void> {
    await expect(this.reviewSuccessMessage).toBeVisible();
  }
}
