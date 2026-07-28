import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestDataGenerator } from '../../src/utils/test-data-generator';

test.describe('Login & Signup @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can create a new account and lands on authenticated dashboard @smoke', async ({
    page,
    loginPage,
    dashboardPage,
    usersApi,
  }) => {
    const user = TestDataGenerator.randomUser();

    await loginPage.open();
    await loginPage.startSignup(user.name, user.email);
    await loginPage.completeAccountInformation(user);

    await dashboardPage.expectWelcomeBanner(user.name);

    // Cleanup via API — faster and more reliable than repeating UI steps.
    await usersApi.deleteAccount(user.email, user.password);
    void page;
  });

  test('login fails with incorrect credentials (negative)', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('nonexistent.user@example.com', 'WrongPassword123');
    await loginPage.expectLoginError();
  });

  test('login fails with malformed email (boundary/validation)', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.login(TestDataGenerator.invalidEmail(), 'AnyPassword123');
    // Browser-native validation blocks submission; page stays on the login form.
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

  test('signup is rejected when email already registered (negative)', async ({
    loginPage,
    usersApi,
  }) => {
    const user = TestDataGenerator.randomUser();
    await usersApi.createAccount(user);

    await loginPage.open();
    await loginPage.startSignup(user.name, user.email);
    await loginPage.expectSignupEmailExistsError();

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('authenticated fixture logs a user in and tears down cleanly @smoke', async ({
    authenticatedPage,
    dashboardPage,
  }) => {
    await dashboardPage.expectWelcomeBanner(authenticatedPage.user.name);
  });
});
