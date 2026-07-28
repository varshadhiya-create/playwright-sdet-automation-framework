# Playwright SDET Automation Framework

Enterprise-grade UI + API test automation framework built with **Playwright** and
**TypeScript**, demonstrating senior-level automation architecture: Page Object Model,
composable fixtures, typed API clients, environment-based configuration, CI/CD, and
multi-format reporting.

**Author:** Varsha Agraharam — Senior SDET / QA Automation Engineer (~14 years IT experience)

Application under test: [automationexercise.com](https://www.automationexercise.com) —
a public e-commerce demo site with both a browsable UI and a documented REST API, chosen
so the framework exercises real UI automation, real API contracts, and their interaction.

---

## Why this framework, not a tutorial repo

This project is structured the way a QE org would maintain a shared automation framework:
layered architecture (tests → fixtures → page objects/API clients → utils/config), typed
domain models, reusable fixtures for authenticated/unauthenticated state, environment
switching, tagged smoke/regression subsets, and CI that publishes triaged artifacts — not
a single flat `tests/` folder of copy-pasted scripts.

## Architecture

```
config/            Environment (local/qa/staging) and execution (retries, timeouts) settings
src/api/            Typed REST client + resource-specific API classes (Users, Products)
src/pages/           Page Object Model classes (Login, Dashboard, Products, Checkout)
src/components/      Reusable UI fragments composed into pages (Navigation)
src/fixtures/         Extended Playwright test with DI-style fixtures (POs, API clients, users)
src/utils/             Logger, test data generator, environment helper
src/types/              Shared TypeScript domain types
tests/ui/                Page-driven end-to-end scenarios
tests/api/                 Request/response contract tests
tests/integration/          UI ↔ API state-consistency tests
tests/accessibility/         axe-core WCAG 2.1 A/AA checks
test-data/                     Static fixture data (boundary/invalid cases)
docs/                           Architecture, test strategy, CI/CD write-ups
```

See [`docs/framework-architecture.md`](docs/framework-architecture.md) for the full design
rationale, [`docs/test-strategy.md`](docs/test-strategy.md) for coverage strategy, and
[`docs/ci-cd.md`](docs/ci-cd.md) for the pipeline breakdown.

## Tech stack

| Concern | Choice |
|---|---|
| Test runner | Playwright Test |
| Language | TypeScript (strict mode) |
| Runtime | Node.js 18+ |
| API testing | Playwright `APIRequestContext` |
| Reporting | Allure + Playwright HTML reporter |
| Accessibility | `@axe-core/playwright` |
| Test data | `@faker-js/faker` |
| Logging | Winston |
| CI | GitHub Actions (matrix across Chromium/Firefox/WebKit) |

## Getting started

```bash
git clone <repo-url>
cd playwright-sdet-automation-framework
npm ci
npx playwright install --with-deps
cp .env.example .env
```

## Running tests

```bash
npm test                    # full suite, all projects
npm run test:smoke          # @smoke tagged subset (fast, PR-friendly)
npm run test:regression     # @regression tagged subset (full coverage)
npm run test:ui             # tests/ui only
npm run test:api            # tests/api only
npm run test:integration    # tests/integration only
npm run test:accessibility  # tests/accessibility only
npm run test:headed         # headed browser, useful for local debugging
npm run test:debug          # Playwright Inspector step-through
npm run test:chromium       # single-browser run
npm run test:qa             # ENV=qa
npm run test:staging        # ENV=staging
```

## Reporting

```bash
npm run report:html          # opens the Playwright HTML report
npm run report:allure:generate   # builds allure-report/ from allure-results/
npm run report:allure:open       # serves the Allure report locally
npm run report                   # generate + open Allure in one step
```

On failure, Playwright captures a trace, screenshot, and video (`trace: on-first-retry`,
`screenshot: only-on-failure`, `video: retain-on-failure`) — inspect a trace with
`npx playwright show-trace test-results/<test-name>/trace.zip`.

## CI/CD

`.github/workflows/playwright-tests.yml` runs on push/PR to `main`, nightly on a cron
schedule, and on manual dispatch (with environment/grep inputs). It matrixes across all
three browser engines, type-checks the codebase, runs the tests, and uploads the HTML
report, Allure results, and trace/screenshot/video artifacts — even on failure. See
[`docs/ci-cd.md`](docs/ci-cd.md) for details.

## Environment configuration

`ENV=local|qa|staging` (see `config/environments.ts`) selects the target base URL and API
URL, with `BASE_URL`/`API_BASE_URL` env var overrides available for QA/staging. Execution
behavior (retries, workers, headless mode) is controlled separately via `.env` — see
`.env.example`.

## Test data strategy

- Dynamic scenarios generate unique users at runtime via `TestDataGenerator` (Faker-backed)
  to avoid unique-email collisions under parallel execution.
- Static boundary/invalid cases live in `test-data/*.json` for deterministic, reviewable
  edge-case coverage.
- Tests that create accounts via the API clean them up in the same test or fixture
  teardown (`authenticatedPage` fixture deletes the account after each test that uses it).

## Linting & type safety

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm run format         # prettier --write
```

## Future enhancements

- Visual regression testing (screenshot diffing) via Playwright's built-in snapshot support.
- Contract testing against an OpenAPI/Swagger schema for the Products/Users API.
- Performance/load testing integration (k6 or Artillery) triggered from the same pipeline.
- Dockerized test execution for fully reproducible local/CI parity.
- Multi-language/localization test coverage.
- Slack/Teams CI notification on regression failures.
