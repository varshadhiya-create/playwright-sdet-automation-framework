import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Products API', { tag: ['@api', '@regression'] }, () => {
  test(
    'productsList returns a well-formed product catalog (positive)',
    { tag: ['@smoke', '@critical'] },
    async ({ productsApi }) => {
      const response = await productsApi.getAllProducts();

      expect(response.responseCode).toBe(200);
      expect(Array.isArray(response.products)).toBe(true);
      expect(response.products.length).toBeGreaterThan(0);

      const [first] = response.products;
      expect(first).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.any(String),
          brand: expect.any(String),
        })
      );
    }
  );

  test('searchProduct returns matches for a known term (positive)', async ({ productsApi }) => {
    const response = await productsApi.searchProduct('Top');
    expect(response.responseCode).toBe(200);
    expect(response.products.length).toBeGreaterThan(0);
    for (const product of response.products) {
      expect(product.name.toLowerCase()).toContain('top');
    }
  });

  test(
    'searchProduct resolves every known term from static test data',
    async ({ productsApi, testData }) => {
      for (const term of testData.products.knownSearchTerms) {
        const response = await productsApi.searchProduct(term);
        expect(response.responseCode).toBe(200);
        expect(Array.isArray(response.products)).toBe(true);
      }
    }
  );

  test('searchProduct returns empty set for nonsense term (boundary)', async ({
    productsApi,
  }) => {
    const response = await productsApi.searchProduct('zzzzznotarealproduct9999');
    expect(response.responseCode).toBe(200);
    expect(response.products).toEqual([]);
  });

  test('searchProduct without search_product param fails validation (negative)', async ({
    productsApi,
  }) => {
    const response = await productsApi.searchProduct('');
    // API treats missing/blank term as a bad request rather than "match everything".
    expect([200, 400]).toContain(response.responseCode);
  });

  test('brandsList returns a non-empty, well-formed list (positive)', async ({ productsApi }) => {
    const brands = await productsApi.getBrandsList();
    expect(brands).toMatchObject({ responseCode: 200 });
    expect(Array.isArray((brands as { brands: unknown[] }).brands)).toBe(true);
  });

  test(
    'every product in the catalog has a positive, well-formed price (validation)',
    async ({ productsApi }) => {
      const response = await productsApi.getAllProducts();

      await test.step('assert response shape', async () => {
        expect(response.responseCode).toBe(200);
      });

      await test.step('assert every product price matches the expected currency format', async () => {
        for (const product of response.products) {
          expect(product.price).toMatch(/^Rs\.\s?\d+$/);
        }
      });
    }
  );

  // Demonstrates test.fixme with a clear reason: the public API has no documented endpoint
  // for fetching a single product by ID (only the full list and search), so a "GET product
  // by id returns 404 for an out-of-range id" boundary test cannot be implemented as written.
  test.fixme(
    'fetching a single product by an out-of-range ID returns a 404 (boundary)',
    async () => {
      // Intentionally unimplemented: automationexercise.com's public API only exposes
      // /productsList and /searchProduct, not a per-ID product endpoint. Revisit if/when
      // the API adds one, or adapt to filter the full list client-side instead.
    }
  );
});
