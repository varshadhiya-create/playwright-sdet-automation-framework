import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Cart Management', { tag: ['@ui', '@regression'] }, () => {
  test.describe('Add to cart', () => {
    test.beforeEach(async ({ page, productsPage }) => {
      await page.goto('/');
      await productsPage.open();
    });

    test(
      'adding a product from the catalog places it in the cart (positive)',
      { tag: ['@smoke', '@critical'] },
      async ({ productsPage, cartPage }) => {
        const names = await productsPage.getVisibleProductNames();
        const targetName = names[0];

        await test.step('add product to cart from the catalog grid', async () => {
          await productsPage.addProductToCartByName(targetName);
          await productsPage.continueShopping();
        });

        await test.step('open the cart and verify the product is present', async () => {
          await productsPage.viewCart();
          expect(await cartPage.isProductInCart(targetName)).toBe(true);
        });
      }
    );

    test('adding a specific quantity from product details reflects that quantity (positive)', async ({
      productsPage,
      productDetailsPage,
      cartPage,
    }) => {
      const names = await productsPage.getVisibleProductNames();
      const targetName = names[0];

      await productsPage.viewProductDetails(targetName);
      await productDetailsPage.setQuantity(4);
      await productDetailsPage.addToCart();
      await productDetailsPage.goToCartFromModal();

      expect(await cartPage.getQuantity(targetName)).toBe(4);
    });
  });

  test.describe('Update quantity', () => {
    test.beforeEach(async ({ page, productsPage }) => {
      await page.goto('/');
      await productsPage.open();
    });

    test(
      'adding the same product again increases its cart quantity (positive)',
      async ({ productsPage, productDetailsPage, cartPage }) => {
        const names = await productsPage.getVisibleProductNames();
        const targetName = names[0];

        await productsPage.viewProductDetails(targetName);
        await productDetailsPage.setQuantity(2);
        await productDetailsPage.addToCart();
        await productDetailsPage.goToCartFromModal();
        expect(await cartPage.getQuantity(targetName)).toBe(2);

        await productsPage.open();
        await productsPage.viewProductDetails(targetName);
        await productDetailsPage.setQuantity(3);
        await productDetailsPage.addToCart();
        await productDetailsPage.goToCartFromModal();

        expect(await cartPage.getQuantity(targetName)).toBe(5);
      }
    );

    test(
      'quantity accumulates correctly across every boundary value from static test data',
      async ({ productsPage, productDetailsPage, cartPage, testData }) => {
        // This scenario is noticeably slower than the rest of the suite (a full add-to-cart
        // round trip per boundary value) — test.slow() triples the timeout for *this* test
        // instead of the whole suite flaking under a timeout tuned for the common case.
        test.slow();

        const names = await productsPage.getVisibleProductNames();
        const targetName = names[0];
        let expectedTotal = 0;

        for (const { value } of testData.cart.boundaryQuantities) {
          await productsPage.open();
          await productsPage.viewProductDetails(targetName);
          await productDetailsPage.setQuantity(value);
          await productDetailsPage.addToCart();
          await productDetailsPage.goToCartFromModal();
          expectedTotal += value;

          expect(await cartPage.getQuantity(targetName)).toBe(expectedTotal);
        }
      }
    );
  });

  test.describe('Remove from cart', () => {
    test.beforeEach(async ({ page, productsPage }) => {
      await page.goto('/');
      await productsPage.open();
    });

    test(
      'removing a product deletes it from the cart (positive)',
      { tag: ['@critical'] },
      async ({ productsPage, cartPage }) => {
        const names = await productsPage.getVisibleProductNames();
        const targetName = names[0];

        await productsPage.addProductToCartByName(targetName);
        await productsPage.viewCart();
        expect(await cartPage.isProductInCart(targetName)).toBe(true);

        await cartPage.removeProduct(targetName);
        expect(await cartPage.isProductInCart(targetName)).toBe(false);
      }
    );

    test('removing the only item in the cart shows the empty-cart state (boundary)', async ({
      productsPage,
      cartPage,
    }) => {
      const names = await productsPage.getVisibleProductNames();
      const targetName = names[0];

      await productsPage.addProductToCartByName(targetName);
      await productsPage.viewCart();
      await cartPage.removeProduct(targetName);

      await cartPage.expectEmptyCartMessage();
    });
  });
});
