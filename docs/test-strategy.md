# Test Strategy

## Scope

Application under test: [automationexercise.com](https://www.automationexercise.com), a
public e-commerce demo site with a documented REST API. Chosen so the framework
demonstrates both UI and API automation against a real, publicly reachable system rather
than mocks.

## Test layers and pyramid intent

| Layer | Location | Purpose | Relative weight |
|---|---|---|---|
| API | `tests/api` | Fast, stable validation of business logic and contracts | Heaviest |
| Integration | `tests/integration` | Confirms UI and API agree on shared state | Light |
| UI | `tests/ui` | Critical user journeys, visual/interaction correctness | Moderate |
| Accessibility | `tests/accessibility` | Automated WCAG 2.1 A/AA floor checks | Targeted, key pages only |

This mirrors the test pyramid: API tests are cheaper and less flaky, so they carry the bulk
of business-logic coverage; UI tests are reserved for flows that can only be verified end
to end (signup → login → checkout).

## Tagging and execution subsets

- `@smoke` — minimal, high-confidence subset (one flow per feature area). Intended to run
  on every push/PR in under a few minutes.
- `@regression` — full suite, including negative/boundary cases. Runs on schedule and
  before releases.

Run via `npm run test:smoke` / `npm run test:regression` (grep-based, no separate config
duplication).

## Coverage per scenario class

Every functional spec file includes, where meaningful:

- **Positive** — expected happy-path behavior (valid signup, valid login, successful
  checkout, matching search results).
- **Negative** — invalid credentials, duplicate email registration, guest checkout block,
  unknown-account deletion.
- **Boundary/validation** — empty/malformed inputs, nonsense search terms, missing
  required API params.

## Environments

`ENV=local|qa|staging` selects the target from `config/environments.ts`. QA/staging are
defined as distinct named configs (pointing at the same public demo host here, since no
private deployments exist for a portfolio project) so the selection mechanism itself is
exercised and ready to point at real per-environment URLs in a production setting.

## Cross-browser & parallelism

Three projects (Chromium, Firefox, WebKit) run the full suite each. `fullyParallel: true`
plus worker count from `WORKERS` env var (CI defaults to the runner's available cores).
CI retries failed tests twice (`RETRIES` env var, default 2 in CI / 0 locally) to absorb
transient network flake against a live public site without masking real regressions —
retried-but-passing tests are still visible as flaky in the Allure trend.

## Data management

- Dynamic tests generate unique users via `TestDataGenerator` (Faker) to avoid colliding
  on the API's unique-email constraint under parallel execution.
- Static reference data (`test-data/*.json`) covers documented boundary cases and invalid
  inputs for scenarios that benefit from fixed, reviewable values.
- Tests that create data via the API clean it up (`deleteAccount`) in the same test or
  fixture teardown — no reliance on a shared/reset environment.

## What's explicitly out of scope

- Visual regression (screenshot diffing) — not included to keep the portfolio focused;
  would be a natural next step (see README "Future Enhancements").
- Load/performance testing — functionally out of scope for a Playwright suite; called out
  as a future integration point (k6/Artillery) rather than faked here.
- Full WCAG AAA / manual accessibility audit — automated axe-core checks are a floor, not
  a substitute for manual review.
