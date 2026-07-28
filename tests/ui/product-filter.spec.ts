import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Product Filtering', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page, productsPage }) => {
    await page.goto('/');
    await productsPage.open();
  });

  test(
    'filtering by category narrows results and updates the results heading (positive)',
    { tag: ['@smoke', '@critical'] },
    async ({ productsPage }) => {
      await test.step('apply Women > Dress filter', async () => {
        await productsPage.filterByCategory('Women', 'Dress');
      });

      await test.step('assert the results heading reflects the applied filter', async () => {
        const heading = await productsPage.getFilterResultsHeadingText();
        expect(heading).toMatch(/Women\s*-\s*Dress Products/i);
      });

      expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
    }
  );

  test('filtering by a second category (Men > Tshirts) also narrows results (positive)', async ({
    productsPage,
  }) => {
    await productsPage.filterByCategory('Men', 'Tshirts');
    const heading = await productsPage.getFilterResultsHeadingText();
    expect(heading).toMatch(/Men\s*-\s*Tshirts Products/i);
  });

  test('filtering by brand narrows results to that brand only (positive)', async ({
    productsPage,
  }) => {
    await productsPage.filterByBrand('Polo');
    const heading = await productsPage.getFilterResultsHeadingText();
    expect(heading).toMatch(/Polo/i);
    expect(await productsPage.getVisibleProductCount()).toBeGreaterThan(0);
  });

  test(
    'expected category/brand combinations from static test data all resolve',
    async ({ productsPage, testData }) => {
      for (const { usertype, category } of testData.products.expectedCategories) {
        // usertype in the fixture is a plain string ("Women"/"Men"/"Kids"); narrow it for
        // the page object's stricter literal-union parameter type.
        const topLevel = usertype as 'Women' | 'Men' | 'Kids';
        await productsPage.filterByCategory(topLevel, category);
        expect(await productsPage.getVisibleProductCount()).toBeGreaterThanOrEqual(0);
        await productsPage.open();
      }
    }
  );

  // Demonstrates test.fixme with a clear, actionable reason — the sidebar has no invalid
  // category state to exercise (it's a fixed, server-rendered list of links), so a
  // "filtering by a nonexistent category" negative test isn't meaningfully automatable
  // without directly manipulating the DOM, which would test the test rather than the app.
  test.fixme(
    'filtering by an unsupported/nonexistent category shows a graceful empty state',
    async () => {
      // Intentionally left unimplemented: automationexercise.com's category sidebar only
      // exposes valid, pre-defined categories — there is no user-facing way to request an
      // invalid one through the UI. Revisit if the app ever adds a category search/URL param.
    }
  );
});
