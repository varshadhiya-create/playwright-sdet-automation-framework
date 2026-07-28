import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';

export class ProductsPage extends BasePage {
  readonly nav: NavigationComponent;

  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly productCards: Locator;
  private readonly searchedProductsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);

    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = page.locator('.product-image-wrapper');
    this.searchedProductsHeading = page.getByText('Searched Products');
  }

  async open(): Promise<void> {
    await this.nav.goToProducts();
    await expect(this.page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  }

  async searchProduct(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await expect(this.searchedProductsHeading).toBeVisible();
  }

  async getVisibleProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async addFirstProductToCart(): Promise<void> {
    const firstProduct = this.productCards.first();
    await firstProduct.hover();
    await firstProduct.getByText('Add to cart').click();
    await expect(this.page.getByText('Added!')).toBeVisible();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async viewCart(): Promise<void> {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  async expectProductVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  async expectNoResultsOrEmptyState(): Promise<void> {
    // Boundary case: searching a nonsense term should not error, just show zero results.
    expect(await this.getVisibleProductCount()).toBe(0);
  }
}
