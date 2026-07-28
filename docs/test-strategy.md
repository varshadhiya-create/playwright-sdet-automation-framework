# Test Strategy

## Scope

Application under test: [automationexercise.com](https://www.automationexercise.com), a
public e-commerce demo site with a documented REST API. Chosen so the framework
demonstrates both UI and API automation against a real, publicly reachable system rather
than mocks. Coverage spans login/signup, product search, category/brand filtering, product
details, cart management (add/update/remove), checkout and payment validation, order
confirmation, product/user API contracts, UI↔API data consistency, and automated
accessibility checks. See `docs/test-traceability.md` for the full test-by-test matrix.

## Test layers and pyramid intent

| Layer | Location | Purpose | Relative weight |
|---|---|---|---|
| API | `tests/api` | Fast, stable validation of business logic and contracts | Heaviest |
| Integration | `tests/integration` | Confirms UI and API agree on shared state | Light |
| UI | `tests/ui` | Critical user journeys, visual/interaction correctness | Moderate |
| Accessibility | `tests/accessibility` | Automated WCAG 2.1 A/AA floor checks | Targeted, key pages only |

This mirrors the test pyramid: API tests are cheaper and less flaky, so they carry the bulk
of business-logic coverage; UI tests are reserved for flows that can only be verified end
to end (signup → login → cart → checkout → order confirmation).

## Tagging and execution subsets

Every test carries one or more of six tags, declared via Playwright's native tag API
(`test('...', { tag: ['@ui', '@smoke'] }, ...)`), not string suffixes in the title:

- `@smoke` — minimal, high-confidence subset (one flow per feature area). Runs on every
  push/PR and is the default for manual CI dispatch.
- `@regression` — the full suite, including negative/boundary cases. Runs nightly and can
  be selected on demand.
- `@api` — API-only tests, independent of a browser.
- `@ui` — browser-driven tests.
- `@integration` — tests that assert UI and API agree on the same underlying state.
- `@critical` — the subset whose failure should block a release regardless of which other
  tag it also carries (e.g. checkout payment validation is `@ui @regression @critical`).

Run via `npm run test:smoke` / `npm run test:regression`, or directly with
`npx playwright test --grep "@critical"` for any ad-hoc combination — no separate config
or duplicated test logic per subset.

## Coverage per scenario class

Every functional spec file includes, where meaningful:

- **Positive** — expected happy-path behavior (valid signup, valid login, category/brand
  filtering, adding/removing cart items, successful checkout, matching search results).
- **Negative** — invalid credentials, duplicate email registration, guest checkout block,
  unknown-account deletion, blank payment fields.
- **Boundary/validation** — empty/malformed inputs, nonsense search terms, missing required
  API params, cart quantity boundary values, currency-format validation on product prices.

Two scenarios are intentionally **not** run, each with an inline comment explaining why
(`test.skip`/`test.fixme`): payment-card Luhn validation and review-email format validation
have no corresponding server-side check in this demo app, so a test asserting rejection
would be testing behavior that doesn't exist; a single-product-by-ID API boundary test has
no corresponding endpoint to call. Both stay visible in the suite (as skipped/fixme) rather
than being silently deleted.

## Environments

`ENV=local|qa|staging` selects the target from `config/environments.ts`. QA/staging are
defined as distinct named configs (pointing at the same public demo host here, since no
private deployments exist for a portfolio project) so the selection mechanism itself is
exercised and ready to point at real per-environment URLs in a production setting. CI's
manual dispatch input intentionally restricts the choice to `qa`/`staging` (not `local`),
since a GitHub-hosted runner has no "local" environment to target.

## Cross-browser & parallelism

Three projects (Chromium, Firefox, WebKit) run the full suite each. `fullyParallel: true`
plus a configurable worker count (`WORKERS` env var locally, a `PLAYWRIGHT_WORKERS`
repository variable in CI, defaulting to 2 for GitHub-hosted runners). CI retries failed
tests twice (`RETRIES` env var, default 2 in CI / 0 locally) to absorb transient network
flake against a live public site without masking real regressions — a retried-but-passing
test is still visible as flaky in the Allure trend.

## Data management

- Dynamic tests generate unique users via `TestDataGenerator` (Faker) to avoid colliding
  on the API's unique-email constraint under parallel execution.
- Static reference data (`test-data/*.json`: users, products, cart quantities) covers
  documented boundary cases and invalid inputs for scenarios that benefit from fixed,
  reviewable values, injected via the `testData` fixture.
- A single seeded account (`config/auth-config.ts`) backs the `authenticatedPage` fixture's
  storageState session — distinct from the throwaway per-test users used by signup/negative
  login tests.
- Tests that create data via the API clean it up (`deleteAccount`) in the same test or
  fixture teardown — no reliance on a shared/reset environment.

## What's explicitly out of scope

- Visual regression (screenshot diffing) — not included to keep the portfolio focused;
  would be a natural next step (see README "Future Enhancements").
- Load/performance testing — functionally out of scope for a Playwright suite; called out
  as a future integration point (k6/Artillery) rather than faked here.
- Full WCAG AAA / manual accessibility audit — automated axe-core checks are a floor, not
  a substitute for manual review.
- Real payment gateway validation (Luhn checks, declined-card handling) — the demo app has
  no real payment backend to validate against; see `tests/ui/checkout.spec.ts` for the
  documented `test.skip`.
