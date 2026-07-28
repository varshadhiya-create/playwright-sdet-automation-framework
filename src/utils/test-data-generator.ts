import { faker } from '@faker-js/faker';
import { User } from '../types/application-types';

/**
 * Generates unique, realistic test data per test run so parallel/CI runs never collide
 * on unique-constraint fields (email is unique on automationexercise.com signup).
 */
export class TestDataGenerator {
  static randomUser(overrides: Partial<User> = {}): User {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const runId = Date.now();

    const base: User = {
      name: `${firstName} ${lastName}`,
      email: `sdet.${runId}.${faker.string.alphanumeric(6).toLowerCase()}@mailinator.com`,
      password: faker.internet.password({ length: 12, memorable: false }),
      title: faker.helpers.arrayElement(['Mr', 'Mrs']),
      birthDate: {
        day: String(faker.number.int({ min: 1, max: 28 })),
        month: faker.date.month(),
        year: String(faker.number.int({ min: 1970, max: 2000 })),
      },
      firstName,
      lastName,
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: 'United States',
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      mobileNumber: faker.phone.number({ style: 'national' }),
    };

    return { ...base, ...overrides };
  }

  static invalidEmail(): string {
    return `not-an-email-${faker.string.alphanumeric(4)}`;
  }

  static weakPassword(): string {
    return '123';
  }

  static randomSearchTerm(): string {
    return faker.helpers.arrayElement(['Dress', 'Tshirt', 'Jeans', 'Top', 'Saree']);
  }
}
