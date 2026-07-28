import { Page } from '@playwright/test';

/**
 * automationexercise.com is ad-monetized and occasionally serves a full-page "Google
 * vignette" interstitial ad after a navigation click, which intercepts the click and can
 * leave the page in an unexpected state for the next assertion. This is a known
 * characteristic of this specific public demo site -- not application behavior under test --
 * so it is handled defensively here rather than baked into every page object's logic.
 */
export async function dismissAdOverlayIfPresent(page: Page): Promise<void> {
    const closeButton = page.getByText('Close', { exact: true });
    try {
          await closeButton.waitFor({ state: 'visible', timeout: 2000 });
          await closeButton.click();
    } catch {
          // No ad overlay appeared within the window -- nothing to dismiss.
    }
}
