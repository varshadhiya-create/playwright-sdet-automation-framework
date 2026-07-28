# Framework Architecture

## Layered design

```
tests/            → what to verify (specs, one behavior per test, tagged)
src/fixtures/      → how tests get pre-built dependencies (POs, API clients, sessions, data)
src/pages/          → how to interact with a screen (Page Object Model)
src/components/     → how to interact with repeated UI fragments (nav, modals)
src/api/             → how to call the backend (typed request/response wrappers)
src/utils/            → cross-cutting concerns (logging, data generation, env resolution)
config/                → where to run (environments) and how (execution/auth settings)
global-setup.ts          → runs once before the suite: seeds a user, captures storageState
```

Each layer only depends on the layer(s) below it. Tests never construct locators or call
`request.post` directly — they express intent through page objects and API classes, so a
DOM or endpoint change is a one-file fix, not a find-and-replace across the suite.

## Page Object Model

- `BasePage` holds only truly generic behavior (`goto`, `waitForLoadState`). It is
  intentionally thin — most page logic lives in the concrete class, not pushed up into an
  overloaded base.
- `NavigationComponent` is composed into every page object instead of duplicated, since the
  header/nav markup is identical across the site. This is composition over inheritance:
  a page "has a" nav, rather than "is a" nav.
- Six page objects cover the automated surface: `LoginPage`, `DashboardPage`,
  `ProductsPage` (catalog, search, category/brand filtering), `ProductDetailsPage`
  (single-product view, quantity, reviews), `CartPage` (line items, quantity, removal),
  and `CheckoutPage` (address review, payment, order confirmation).
- Locators are private fields, initialized once in the constructor using role/label/testid
  based locators (`getByRole`, `getByPlaceholder`, `getByText`, `data-qa` attributes) rather
  than CSS class soup — these survive markup refactors and mirror how assistive tech and
  users perceive the page.
- Public methods on page objects express **user actions and assertions** ("login",
  "expectLoginError"), not raw Playwright calls — tests read like a spec, not a script.

## API layer

- `ApiClient` is a single, generic wrapper (get/post/delete) around
  `APIRequestContext`. All logging, response-shape normalization (status/ok/body), and
  non-JSON-body handling live here once.
- `UsersApi` / `ProductsApi` are resource-specific and translate between our internal
  `User`/`Product` types and the API's actual form-field names — that translation is
  isolated to one place instead of leaking into every test.

## Authentication: storageState + global setup

Rather than every test that needs to be logged in repeating the UI signup/login flow,
`global-setup.ts` runs **once** before the whole run:

1. Resolves a single seeded account (`config/auth-config.ts`), creating it via the API if it
   doesn't exist yet.
2. Logs in through the UI exactly once and captures the authenticated browser storageState
   (cookies/local storage) to `playwright/.auth/<environment>.json`.
3. Writes `allure-results/environment.properties` so the Allure report's Environment tab
   shows which env/browsers/CI run produced it.

The `authenticatedPage` fixture then opens a **new browser context** with that storageState
file — no login UI runs during the test itself. This is faster (one login instead of N) and
more reliable (login flow flake can't intermittently fail unrelated tests). Page objects
bound to this session (`authenticatedProductsPage`, `authenticatedCartPage`,
`authenticatedCheckoutPage`, `authenticatedDashboardPage`) exist so a test never has to
juggle two different `Page` instances (anonymous vs. authenticated).

Tests that verify the login/signup flow **itself** (`tests/ui/login.spec.ts`) deliberately
bypass this fixture and drive `loginPage` directly — re-running login is the point of those
tests, not overhead to avoid.

## Fixtures

`src/fixtures/test-fixtures.ts` extends Playwright's base `test` with:

- `environment` — the resolved `EnvironmentConfig` (base/API URLs, timeouts) for the active
  `ENV`, without tests importing config directly.
- `testData` — static, reviewable JSON fixtures (`test-data/*.json`: users, products, cart
  boundary values) injected as a typed object.
- `testUser` — a fresh, unique `User` per test via `TestDataGenerator` (Faker), for tests
  that must control the identity under test directly (signup, negative login paths).
- `apiRequestContext` / `apiClient` / `usersApi` / `productsApi` — API access without any
  browser dependency, so pure API specs never pay for a page.
- `authenticatedPage` — the storageState-backed session described above.
- `authenticatedProductsPage` / `authenticatedCartPage` / `authenticatedCheckoutPage` /
  `authenticatedDashboardPage` — page objects pre-bound to that session's page.
- `loginPage` / `dashboardPage` / `productsPage` / `productDetailsPage` / `cartPage` /
  `checkoutPage` — anonymous-session page objects, bound to the default `page` fixture.

An unauthenticated page is simply the default `page` fixture — no separate fixture is
needed for that state.

## Test tagging

Every `test.describe`/`test` declares its tags using Playwright's native tag API
(`{ tag: ['@ui', '@regression'] }`), not string suffixes in the title. Six tags are used
consistently: `@smoke`, `@regression`, `@api`, `@ui`, `@integration`, `@critical`. A test
can (and often does) carry more than one — e.g. a checkout E2E test is
`@ui @regression @smoke @critical`. This is what powers `--grep "@smoke"` /
`--grep "@critical"` filtering in npm scripts and CI without needing separate directories
or duplicated test logic. See `docs/test-strategy.md` for how the tags map to CI triggers.

## Reporting & artifacts

- HTML reporter for local iteration (titled per-environment); Allure for CI/history/trends,
  enriched with `environment.properties` metadata from global setup; `playwright.config.ts`
  also sets `metadata` (environment, base URL, CI run id) surfaced in the HTML report header.
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
  — full diagnostics for a flaky/failing test without bloating storage on green runs.

## Cross-cutting utilities

- `logger.ts` — Winston logger, console transport by default, optional file transport for
  local debugging (`LOG_TO_FILE=true`).
- `test-data-generator.ts` — Faker-backed, guarantees unique emails per run to avoid
  colliding with the unique-email constraint on signup, even under parallel workers.
- `environment-helper.ts` — single seam between test code and `config/environments.ts`.
- `config/auth-config.ts` — single source of truth for the seeded storageState account and
  where its captured session lives on disk, shared by `global-setup.ts` and the
  `authenticatedPage` fixture so they can never disagree.
