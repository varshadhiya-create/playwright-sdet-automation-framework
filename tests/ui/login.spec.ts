import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestDataGenerator } from '../../src/utils/test-data-generator';

test.describe('Login & Signup', { tag: ['@ui', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test(
    'user can create a new account and lands on authenticated dashboard',
    { tag: ['@smoke', '@critical'] },
    async ({ page, loginPage, dashboardPage, usersApi }) => {
      const user = TestDataGenerator.randomUser();

      await loginPage.open();
      await loginPage.startSignup(user.name, user.email);
      await loginPage.completeAccountInformation(user);

      await dashboardPage.expectWelcomeBanner(user.name);

      // Cleanup via API — faster and more reliable than repeating UI steps.
      await usersApi.deleteAccount(user.email, user.password);
      void page;
    }
  );

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

  test(
    'boundary and invalid credentials from static fixture data are all rejected',
    { tag: ['@regression'] },
    async ({ page, loginPage, testData }) => {
      for (const invalidUser of testData.users.invalidUsers) {
        await loginPage.open();
        await loginPage.login(invalidUser.email, invalidUser.password);
        // Either the login API rejects it, or (for empty password) the browser blocks submit —
        // in both cases the user must not reach the authenticated dashboard.
        await expect(page).not.toHaveURL(/account_info/);
      }
    }
  );

  test(
    'authenticatedPage fixture reuses a pre-authenticated session with no UI login step',
    { tag: ['@smoke'] },
    async ({ authenticatedPage, authenticatedDashboardPage }) => {
      // No loginPage/loginPage.login() call here — storageState from global-setup.ts already
      // has this user signed in, which is the whole point of the fixture.
      await authenticatedDashboardPage.expectWelcomeBanner(authenticatedPage.user.name);
    }
  );
});
