import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test-fixtures';

/**
 * Automated a11y checks are a floor, not a ceiling — they catch programmatic issues
 * (missing labels, contrast, landmark structure) but don't replace manual/assistive-tech
 * review. Scoped to wcag2a/wcag2aa tags to match common organizational compliance targets.
 */
test.describe('Accessibility', { tag: ['@ui', '@regression'] }, () => {
  test('home page has no critical WCAG 2.1 A/AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('#carousel') // third-party carousel widget outside our control
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });

  test('login page has no critical WCAG 2.1 A/AA violations', async ({ page, loginPage }) => {
    await page.goto('/');
    await loginPage.open();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });

  test('products page has no critical WCAG 2.1 A/AA violations', async ({
    page,
    productsPage,
  }) => {
    await page.goto('/');
    await productsPage.open();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
});
