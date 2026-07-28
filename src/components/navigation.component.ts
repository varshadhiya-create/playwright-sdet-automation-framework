import { Locator, Page } from '@playwright/test';
import { dismissAdOverlayIfPresent } from '../utils/ad-overlay-handler';

/**
* Reusable header/nav component present on every page. Modeled as a component (not a page)
* because it's composed into every page object instead of duplicated across them.
*/
export class NavigationComponent {
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsIndicator: Locator;

constructor(private readonly page: Page) {
  this.homeLink = page.getByRole('link', { name: 'Home', exact: true });
  this.productsLink = page.getByRole('link', { name: 'Products' });
  this.cartLink = page.getByRole('link', { name: 'Cart' });
  this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
  this.logoutLink = page.getByRole('link', { name: 'Logout' });
  this.deleteAccountLink = page.getByRole('link', { name: 'Delete Account' });
  this.loggedInAsIndicator = page.getByText('Logged in as');
}

async goToProducts(): Promise<void> {
  await this.productsLink.click();
  await dismissAdOverlayIfPresent(this.page);
}

async goToCart(): Promise<void> {
  await this.cartLink.click();
  await dismissAdOverlayIfPresent(this.page);
}

async logout(): Promise<void> {
  await this.logoutLink.click();
}

async isLoggedIn(): Promise<boolean> {
  return this.loggedInAsIndicator.isVisible();
}
}
