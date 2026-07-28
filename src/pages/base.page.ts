import { Page } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Common navigation/assertion helpers shared by all page objects. Concrete pages compose
 * a NavigationComponent rather than extend multiple bases, keeping the hierarchy shallow.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    logger.debug(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
