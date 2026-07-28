import { Page } from '@playwright/test';

/**
* automationexercise.com is ad-monetized and occasionally serves a full-page "Google
* vignette" interstitial ad on navigation clicks. The ad's click-intercept listener is
* attached from page load regardless of whether the ad's own network requests succeed, so
* blocking ad-serving domains alone does not stop it from swallowing a click -- the overlay
* still needs to be detected and dismissed after the fact, and the action it swallowed
* needs to be retried. This is a known characteristic of this specific public demo site --
* not application behavior under test -- so it is handled defensively here rather than
* baked into every page object's logic.
*/
export async function dismissAdOverlayIfPresent(page: Page): Promise<boolean> {
    const closeButton = page.getByText('Close', { exact: true });
    try {
        await closeButton.waitFor({ state: 'visible', timeout: 2000 });
        await closeButton.click();
        return true;
    } catch {
        return false;
    }
}

/**
* Runs `action` and, if it throws (typically a Playwright timeout because the ad overlay
* swallowed a click or is covering the target element), dismisses the overlay and retries
* the whole action. Retried actions must be safe to repeat -- callers should only wrap
* idempotent navigation/assertion sequences, not one-shot form submissions.
*/
export async function withAdRecovery<T>(
    page: Page,
    action: () => Promise<T>,
    attempts = 3
    ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await action();
        } catch (error) {
            lastError = error;
            await dismissAdOverlayIfPresent(page);
        }
    }
    throw lastError;
}
