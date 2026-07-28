import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';

export class ProductsPage extends BasePage {
  readonly nav: NavigationComponent;

  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly productCards: Locator;
  private readonly searchedProductsHeading: Locator;
  private readonly categoryPanel: Locator;
  private readonly brandPanel: Locator;
  private readonly filterResultsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);

    this.searchInput = page.getByPlaceholder('Search Product');
    this.searchButton = page.locator('#submit_search');
    this.productCards = page.locator('.product-image-wrapper');
    this.searchedProductsHeading = page.getByText('Searched Products');
    this.categoryPanel = page.locator('.left-sidebar .panel-group').first();
    this.brandPanel = page.locator('.brands_products');
    // Both search and category/brand filtering land on a heading of this shape
    // ("Searched Products" / "Women - Dress Products" / "Brand - Polo Products").
    this.filterResultsHeading = page.locator('.features_items h2.title');
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

  async getVisibleProductNames(): Promise<string[]> {
    return this.page.locator('.product-image-wrapper .productinfo p').allTextContents();
  }

  async addFirstProductToCart(): Promise<void> {
    const firstProduct = this.productCards.first();
    await firstProduct.hover();
    await firstProduct.getByText('Add to cart').click();
    await expect(this.page.getByText('Added!')).toBeVisible();
  }

  async addProductToCartByName(productName: string): Promise<void> {
    const card = this.page
      .locator('.product-image-wrapper')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
    await card.hover();
    await card.getByText('Add to cart').click();
    await expect(this.page.getByText('Added!')).toBeVisible();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
  }

  async viewCart(): Promise<void> {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  /** Navigates from the catalog grid to a single product's detail page. */
  async viewProductDetails(productName: string): Promise<void> {
    const card = this.page
      .locator('.product-image-wrapper')
      .filter({ has: this.page.getByText(productName, { exact: true }) });
    await card.hover();
    await card.getByRole('link', { name: 'View Product' }).click();
    await expect(this.page.getByRole('heading', { level: 2 })).toBeVisible();
  }

  async expectProductVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  async expectNoResultsOrEmptyState(): Promise<void> {
    // Boundary case: searching a nonsense term should not error, just show zero results.
    expect(await this.getVisibleProductCount()).toBe(0);
  }

  // --- Filtering (left sidebar CATEGORY / BRANDS panels) ---

  /**
   * The category sidebar is an accordion: clicking the top-level category (Women/Men/Kids)
   * expands it, then a subcategory link (Dress, Tshirts, ...) applies the filter.
   */
  async filterByCategory(topLevel: 'Women' | 'Men' | 'Kids', subCategory: string): Promise<void> {
    await this.categoryPanel.getByRole('link', { name: topLevel, exact: true }).click();
    await this.page
      .locator(`#${topLevel}`)
      .getByRole('link', { name: subCategory })
      .click();
    await expect(this.filterResultsHeading).toBeVisible();
  }

  async filterByBrand(brandName: string): Promise<void> {
    await this.brandPanel.getByRole('link', { name: brandName, exact: true }).click();
    await expect(this.filterResultsHeading).toBeVisible();
  }

  async getFilterResultsHeadingText(): Promise<string> {
    return (await this.filterResultsHeading.textContent())?.trim() ?? '';
  }
}
