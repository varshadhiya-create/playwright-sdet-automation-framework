import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestDataGenerator } from '../../src/utils/test-data-generator';

test.describe('Users API @regression', () => {
  test('createAccount succeeds with valid payload and response schema (positive) @smoke', async ({
    usersApi,
  }) => {
    const user = TestDataGenerator.randomUser();
    const response = await usersApi.createAccount(user);

    expect(response.responseCode).toBe(201);
    expect(response.message).toBe('User created!');

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('createAccount fails when email already exists (negative)', async ({ usersApi }) => {
    const user = TestDataGenerator.randomUser();
    await usersApi.createAccount(user);

    const duplicate = await usersApi.createAccount(user);
    expect(duplicate.responseCode).toBe(400);
    expect(duplicate.message).toMatch(/email already exists/i);

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('verifyLogin succeeds with correct credentials (positive)', async ({ usersApi }) => {
    const user = TestDataGenerator.randomUser();
    await usersApi.createAccount(user);

    const result = await usersApi.verifyLogin(user.email, user.password);
    expect(result.responseCode).toBe(200);
    expect(result.message).toBe('User exists!');

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('verifyLogin fails with incorrect password (negative)', async ({ usersApi }) => {
    const user = TestDataGenerator.randomUser();
    await usersApi.createAccount(user);

    const result = await usersApi.verifyLogin(user.email, 'WrongPassword!');
    expect(result.responseCode).toBe(404);

    await usersApi.deleteAccount(user.email, user.password);
  });

  test('verifyLogin fails when email param is missing (boundary/validation)', async ({
    usersApi,
  }) => {
    const result = await usersApi.verifyLogin('', '');
    expect(result.responseCode).toBe(400);
    expect(result.message).toMatch(/missing/i);
  });

  test('deleteAccount is idempotent-safe: unknown account returns not-found (negative)', async ({
    usersApi,
  }) => {
    const result = await usersApi.deleteAccount('ghost.user.does.not.exist@example.com', 'x');
    expect(result.responseCode).toBe(200);
    expect(result.message).toMatch(/account not found/i);
  });
});
