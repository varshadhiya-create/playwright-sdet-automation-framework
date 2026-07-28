import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';

/** Represents the authenticated landing state (home page with "Logged in as" nav). */
export class DashboardPage extends BasePage {
  readonly nav: NavigationComponent;

  constructor(page: Page) {
    super(page);
    this.nav = new NavigationComponent(page);
  }

  async expectWelcomeBanner(userName: string): Promise<void> {
    await expect(this.nav.loggedInAsIndicator).toContainText(userName);
  }

  async logout(): Promise<void> {
    await this.nav.logout();
    await expect(this.page.getByText('Login to your account')).toBeVisible();
  }

  async deleteAccount(): Promise<void> {
    await this.nav.deleteAccountLink.click();
    await expect(this.page.getByText('Account Deleted!')).toBeVisible();
  }
}
