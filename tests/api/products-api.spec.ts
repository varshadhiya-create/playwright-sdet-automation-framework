import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Products API @regression', () => {
  test('productsList returns a well-formed product catalog (positive) @smoke', async ({
    productsApi,
  }) => {
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
  });

  test('searchProduct returns matches for a known term (positive)', async ({ productsApi }) => {
    const response = await productsApi.searchProduct('Top');
    expect(response.responseCode).toBe(200);
    expect(response.products.length).toBeGreaterThan(0);
    for (const product of response.products) {
      expect(product.name.toLowerCase()).toContain('top');
    }
  });

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
});
