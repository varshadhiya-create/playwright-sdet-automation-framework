import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { NavigationComponent } from '../components/navigation.component';
import { User } from '../types/application-types';
import { dismissAdOverlayIfPresent, withAdRecovery } from '../utils/ad-overlay-handler';

export class LoginPage extends BasePage {
  readonly nav: NavigationComponent;

private readonly loginEmailInput: Locator;
  private readonly loginPasswordInput: Locator;
  private readonly loginButton: Locator;
  private readonly loginErrorMessage: Locator;

private readonly signupNameInput: Locator;
  private readonly signupEmailInput: Locator;
  private readonly signupButton: Locator;
  private readonly signupErrorMessage: Locator;

constructor(page: Page) {
  super(page);
  this.nav = new NavigationComponent(page);

  this.loginEmailInput = page.getByPlaceholder('Email Address').first();
  this.loginPasswordInput = page.getByPlaceholder('Password');
  this.loginButton = page.getByRole('button', { name: 'Login' });
  this.loginErrorMessage = page.getByText('Your email or password is incorrect!');

  this.signupNameInput = page.getByPlaceholder('Name');
  this.signupEmailInput = page.getByPlaceholder('Email Address').last();
  this.signupButton = page.getByRole('button', { name: 'Signup' });
  this.signupErrorMessage = page.getByText('Email Address already exist!');
}

async open(): Promise<void> {
  await this.nav.signupLoginLink.click();
  await dismissAdOverlayIfPresent(this.page);
  await expect(this.page.getByText('Login to your account')).toBeVisible();
}

async login(email: string, password: string): Promise<void> {
  await this.loginEmailInput.fill(email);
  await this.loginPasswordInput.fill(password);
  await this.loginButton.click();
}

async startSignup(name: string, email: string): Promise<void> {
  await this.signupNameInput.fill(name);
  await this.signupEmailInput.fill(email);
  await this.signupButton.click();
  await dismissAdOverlayIfPresent(this.page);
}

async expectLoginError(): Promise<void> {
  await expect(this.loginErrorMessage).toBeVisible();
}

async expectSignupEmailExistsError(): Promise<void> {
  await expect(this.signupErrorMessage).toBeVisible();
}

async expectLoggedIn(userName: string): Promise<void> {
  await expect(this.nav.loggedInAsIndicator).toContainText(userName);
}

/** Fills the multi-step account creation form after "startSignup" redirects here. */
async completeAccountInformation(user: User): Promise<void> {
  // The ad interstitial (or a slow page load) can delay this transition, so this wait --
  // unlike the form fields below -- is retried with overlay-dismiss recovery.
  await withAdRecovery(this.page, () =>
    this.page.getByText('Enter Account Information').waitFor({ timeout: 12000 })
                       );

  const titleId = user.title === 'Mrs' ? '#id_gender2' : '#id_gender1';
  await this.page.locator(titleId).check();

  await this.page.locator('#password').fill(user.password);
  await this.page.locator('#days').selectOption(user.birthDate?.day ?? '1');
  await this.page.locator('#months').selectOption(user.birthDate?.month ?? 'January');
  await this.page.locator('#years').selectOption(user.birthDate?.year ?? '1990');

  await this.page.locator('#first_name').fill(user.firstName ?? '');
  await this.page.locator('#last_name').fill(user.lastName ?? '');
  await this.page.locator('#company').fill(user.company ?? '');
  await this.page.locator('#address1').fill(user.address1 ?? '');
  await this.page.locator('#state').fill(user.state ?? '');
  await this.page.locator('#city').fill(user.city ?? '');
  await this.page.locator('#zipcode').fill(user.zipcode ?? '');
  await this.page.locator('#mobile_number').fill(user.mobileNumber ?? '');

  await this.page.getByRole('button', { name: 'Create Account' }).click();
  await expect(this.page.getByText('Account Created!')).toBeVisible();
  await this.page.getByRole('link', { name: 'Continue' }).click();
}
}
