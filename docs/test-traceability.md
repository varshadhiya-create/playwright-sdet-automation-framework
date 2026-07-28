# Test Case Traceability Matrix

Maps each automated test back to the feature area, scenario type, and priority it covers.
`Automation Status` is `Automated` for everything implemented, `Skipped` for `test.skip()`
cases (documented, intentionally not run), and `Fixme` for `test.fixme()` cases (documented,
not yet implementable against this application — see the inline comment in each spec for why).

| Test ID | Feature | Scenario | Type | Priority | Automation Status |
|---|---|---|---|---|---|
| LOGIN-01 | User Login | Create account and land on authenticated dashboard | Happy path | Critical | Automated |
| LOGIN-02 | User Login | Login fails with incorrect credentials | Negative | High | Automated |
| LOGIN-03 | User Login | Login fails with malformed email | Validation | Medium | Automated |
| LOGIN-04 | User Login | Signup rejected when email already registered | Negative | High | Automated |
| LOGIN-05 | User Login | All invalid users from static fixture data are rejected | Boundary/Validation | Medium | Automated |
| LOGIN-06 | User Login | authenticatedPage fixture reuses storageState with no UI login step | Happy path | High | Automated |
| SEARCH-01 | Product Search | Product listing renders items on load | Happy path | High | Automated |
| SEARCH-02 | Product Search | Searching a known term returns matching results | Happy path | High | Automated |
| SEARCH-03 | Product Search | Every known term from static test data returns results | Happy path | Medium | Automated |
| SEARCH-04 | Product Search | Searching a nonsense term returns zero results | Boundary | Medium | Automated |
| FILTER-01 | Product Filtering | Filtering by category (Women > Dress) narrows results | Happy path | Critical | Automated |
| FILTER-02 | Product Filtering | Filtering by a second category (Men > Tshirts) narrows results | Happy path | Medium | Automated |
| FILTER-03 | Product Filtering | Filtering by brand narrows results to that brand | Happy path | High | Automated |
| FILTER-04 | Product Filtering | All expected category/brand combinations from fixture data resolve | Happy path | Medium | Automated |
| FILTER-05 | Product Filtering | Filtering by an unsupported category shows a graceful empty state | Negative | Low | Fixme |
| DETAILS-01 | Product Details | Details page shows name, price, category, availability, condition, brand | Happy path | Critical | Automated |
| DETAILS-02 | Product Details | Quantity field accepts a valid positive integer | Happy path | High | Automated |
| DETAILS-03 | Product Details | Quantity boundary values from static test data are accepted | Boundary | Medium | Automated |
| DETAILS-04 | Product Details | Submitting a product review with valid data succeeds | Happy path | Medium | Automated |
| DETAILS-05 | Product Details | Submitting a review with a malformed email is rejected | Validation | Low | Skipped |
| CART-01 | Add to Cart | Adding a product from the catalog places it in the cart | Happy path | Critical | Automated |
| CART-02 | Add to Cart | Adding a specific quantity from product details reflects that quantity | Happy path | High | Automated |
| CART-03 | Update Cart Quantity | Adding the same product again increases its cart quantity | Happy path | High | Automated |
| CART-04 | Update Cart Quantity | Quantity accumulates correctly across boundary values | Boundary | Medium | Automated |
| CART-05 | Remove from Cart | Removing a product deletes it from the cart | Happy path | Critical | Automated |
| CART-06 | Remove from Cart | Removing the only item shows the empty-cart state | Boundary | Medium | Automated |
| CHECKOUT-01 | Checkout Validation | Authenticated user can add a product and place an order (E2E) | Happy path | Critical | Automated |
| CHECKOUT-02 | Checkout Validation | Guest checkout is blocked and redirected to login | Negative | Critical | Automated |
| CHECKOUT-03 | Checkout Validation | Review step displays the delivery address for the account | Happy path | Medium | Automated |
| CHECKOUT-04 | Checkout Validation | Payment rejected when all card fields are left blank | Validation | Critical | Automated |
| CHECKOUT-05 | Checkout Validation | Payment rejected for a card number failing a Luhn check | Validation | Low | Skipped |
| ORDER-01 | Order Confirmation | Confirmation offers a downloadable invoice and continue-shopping link | Happy path | High | Automated |
| API-PROD-01 | API Product Validation | productsList returns a well-formed catalog with correct schema | Happy path | Critical | Automated |
| API-PROD-02 | API Product Validation | searchProduct returns matches for a known term | Happy path | High | Automated |
| API-PROD-03 | API Product Validation | searchProduct resolves every known term from static test data | Happy path | Medium | Automated |
| API-PROD-04 | API Product Validation | searchProduct returns empty set for a nonsense term | Boundary | Medium | Automated |
| API-PROD-05 | API Product Validation | searchProduct without a search term fails validation | Validation | Medium | Automated |
| API-PROD-06 | API Product Validation | brandsList returns a non-empty, well-formed list | Happy path | Medium | Automated |
| API-PROD-07 | API Product Validation | Every product price matches the expected currency format | Validation | High | Automated |
| API-PROD-08 | API Product Validation | Fetching a single product by out-of-range ID returns 404 | Boundary | Low | Fixme |
| API-USER-01 | API User Validation | createAccount succeeds with a valid payload and correct schema | Happy path | Critical | Automated |
| API-USER-02 | API User Validation | createAccount fails when the email already exists | Negative | High | Automated |
| API-USER-03 | API User Validation | verifyLogin succeeds with correct credentials | Happy path | Critical | Automated |
| API-USER-04 | API User Validation | verifyLogin fails with an incorrect password | Negative | High | Automated |
| API-USER-05 | API User Validation | verifyLogin fails when the email parameter is missing | Validation | Medium | Automated |
| API-USER-06 | API User Validation | deleteAccount is idempotent-safe for an unknown account | Negative | Medium | Automated |
| API-USER-07 | API User Validation | createAccount is rejected for every invalid fixture-data user | Boundary/Validation | Medium | Automated |
| API-USER-08 | API User Validation | getUserDetailByEmail returns a 404-style payload for an unknown email | Boundary | Medium | Automated |
| API-USER-09 | API User Validation | createAccount enforces rate limiting after rapid repeated requests | Boundary | Low | Skipped |
| CONSIST-01 | UI/API Data Consistency | Account created via API can log in through the UI | Happy path | Critical | Automated |
| CONSIST-02 | UI/API Data Consistency | Product visible in the UI catalog matches a record from the API | Happy path | High | Automated |
| CONSIST-03 | UI/API Data Consistency | Deleting an account via API invalidates UI login | Negative | High | Automated |
| CONSIST-04 | UI/API Data Consistency | authenticatedPage storageState session is still valid per the API | Happy path | Critical | Automated |
| CONSIST-05 | UI/API Data Consistency | Every sampled API product is discoverable through UI search | Happy path | High | Automated |
| CONSIST-06 | UI/API Data Consistency | Cart unit price matches the API-reported price for that product | Happy path | Critical | Automated |
| A11Y-01 | Accessibility | Home page has no critical WCAG 2.1 A/AA violations | Compliance | Medium | Automated |
| A11Y-02 | Accessibility | Login page has no critical WCAG 2.1 A/AA violations | Compliance | Medium | Automated |
| A11Y-03 | Accessibility | Products page has no critical WCAG 2.1 A/AA violations | Compliance | Medium | Automated |

## Notes on Skipped / Fixme entries

Every `Skipped` or `Fixme` row has an inline comment in its spec file explaining *why* —
either the public demo application has no corresponding validation to test (payment Luhn
checks, review-email format), no endpoint to exercise (single-product-by-ID), or the
scenario is unsafe to run against a shared public app on every CI pass (rate limiting).
None are silently disabled; `--grep-invert` is never used to hide them, and they still
appear (as skipped) in every Playwright HTML/Allure report run.
