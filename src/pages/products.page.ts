import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';
import { withAdRecovery } from '../utils/ad-overlay-handler';

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
  this.filterResultsHeading = page.locator('.features_items h2.title');
}

async open(): Promise<void> {
  await withAdRecovery(this.page, async () => {
    await this.nav.goToProducts();
    await expect(this.page.getByRole('heading', { name: 'All Products' })).toBeVisible({ timeout: 12000 });
  });
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
  await withAdRecovery(this.page, async () => {
    const firstProduct = this.productCards.first();
    await firstProduct.hover();
    await firstProduct.getByText('Add to cart').first().click();
    await expect(this.page.getByText('Added!')).toBeVisible({ timeout: 12000 });
  });
}

async addProductToCartByName(productName: string): Promise<void> {
  await withAdRecovery(this.page, async () => {
    const card = this.page
    .locator('.product-image-wrapper')
    .filter({ has: this.page.getByText(productName, { exact: true }) });
    await card.hover();
    await card.getByText('Add to cart').first().click();
    await expect(this.page.getByText('Added!')).toBeVisible({ timeout: 12000 });
  });
}

async continueShopping(): Promise<void> {
  await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
}

async viewCart(): Promise<void> {
  await withAdRecovery(this.page, async () => {
    await this.page.getByRole('link', { name: 'View Cart' }).click();
    await expect(this.page.locator('#cart_info')).toBeVisible({ timeout: 12000 });
  });
}

/** Navigates from the catalog grid to a single product's detail page. */
async viewProductDetails(productName: string): Promise<void> {
  await withAdRecovery(this.page, async () => {
    const card = this.page
    .locator('.product-image-wrapper')
    .filter({ has: this.page.getByText(productName, { exact: true }) });
    await card.hover();
    await card.getByRole('link', { name: 'View Product' }).first().click();
    await expect(this.page.getByRole('heading', { level: 2 })).toBeVisible({ timeout: 12000 });
  });
}

async expectProductVisible(name: string): Promise<void> {
  await expect(this.page.getByText(name).first()).toBeVisible();
}

async expectNoResultsOrEmptyState(): Promise<void> {
  expect(await this.getVisibleProductCount()).toBe(0);
}

async filterByCategory(topLevel: 'Women' | 'Men' | 'Kids', subCategory: string): Promise<void> {
  await withAdRecovery(this.page, async () => {
    await this.categoryPanel.getByRole('link', { name: topLevel, exact: true }).click({ timeout: 12000 });
    await this.page
    .locator(`#${topLevel}`)
    .getByRole('link', { name: subCategory })
    .click({ timeout: 12000 });
    await expect(this.filterResultsHeading).toBeVisible({ timeout: 12000 });
  });
}

async filterByBrand(brandName: string): Promise<void> {
  await this.brandPanel.getByRole('link', { name: brandName, exact: true }).click();
  await expect(this.filterResultsHeading).toBeVisible();
}

async getFilterResultsHeadingText(): Promise<string> {
  return (await this.filterResultsHeading.textContent())?.trim() ?? '';
}
}
