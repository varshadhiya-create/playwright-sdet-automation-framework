# Framework Architecture

## Layered design

```
tests/            → what to verify (specs, one behavior per test)
src/fixtures/      → how tests get pre-built dependencies (POs, API clients, users)
src/pages/          → how to interact with a screen (Page Object Model)
src/components/     → how to interact with repeated UI fragments (nav, modals)
src/api/             → how to call the backend (typed request/response wrappers)
src/utils/            → cross-cutting concerns (logging, data generation, env resolution)
config/                → where to run (environments) and how (execution settings)
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

## Fixtures

`src/fixtures/test-fixtures.ts` extends Playwright's base `test` with:

- `apiRequestContext` / `apiClient` / `usersApi` / `productsApi` — API access without any
  UI dependency, so pure API specs never spin up a browser page for API calls.
- `testUser` — a fresh, unique `User` per test via `TestDataGenerator`.
- `authenticatedPage` — provisions a real logged-in session **through the API** (fast,
  avoids re-running the UI signup form in every test that just needs to be logged in),
  yields the page, and deletes the account afterward — the demo app accumulates junk users
  otherwise. This is the standard "arrange via API, assert via UI" pattern used at scale.

An unauthenticated page is simply the default `page` fixture — no separate fixture is
needed for that state.

## Reporting & artifacts

- HTML reporter for local iteration; Allure for CI/history/trends; GitHub reporter adds
  inline annotations on PRs.
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
  — full diagnostics for a flaky/failing test without bloating storage on green runs.

## Cross-cutting utilities

- `logger.ts` — Winston logger, console transport by default, optional file transport for
  local debugging (`LOG_TO_FILE=true`).
- `test-data-generator.ts` — Faker-backed, guarantees unique emails per run to avoid
  colliding with the unique-email constraint on signup, even under parallel workers.
- `environment-helper.ts` — single seam between test code and `config/environments.ts`.
