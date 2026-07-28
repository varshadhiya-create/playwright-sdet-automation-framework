# CI/CD

## Pipeline overview (`.github/workflows/playwright-tests.yml`)

Triggers: `push` to `main`, `pull_request` targeting `main`, and a nightly `schedule` cron
for full regression, plus `workflow_dispatch` for manual/environment-targeted runs.

Stages, per job:

1. **Checkout** — `actions/checkout@v4`.
2. **Setup Node** — `actions/setup-node@v4`, pinned major version, npm cache enabled
   keyed on `package-lock.json`.
3. **Install dependencies** — `npm ci` for reproducible installs.
4. **Install Playwright browsers** — `npx playwright install --with-deps`, so system
   dependencies for Chromium/Firefox/WebKit are present on the runner.
5. **Execute tests** — matrix over `{chromium, firefox, webkit}` projects, `--grep @smoke`
   on PR pushes and full suite on schedule/dispatch; `ENV` and `RETRIES` passed as job env.
6. **Publish artifacts** — `actions/upload-artifact@v4` for the Playwright HTML report,
   Allure results, and `test-results/` (traces/screenshots/videos), even on failure
   (`if: always()`), so a failed run is debuggable without re-running locally.

## Why a matrix, not a single job

Running Chromium/Firefox/WebKit as separate matrix jobs parallelizes wall-clock time and
isolates a browser-specific failure (e.g. a WebKit-only flake) from blocking the other two
in the same PR check.

## Retry & flake handling

`RETRIES` defaults to 2 in CI (`testExecutionConfig`), so a transient failure against the
live public demo site is retried automatically; Allure's retry history still surfaces it as
flaky rather than silently hiding it.

## Secrets & environment targeting

`ENV` (local/qa/staging) and any environment-specific `BASE_URL`/`API_BASE_URL` overrides
are read from `env:` at the job level, ready to be sourced from GitHub Environments/secrets
in a real multi-environment deployment.

## Local parity

The same npm scripts used in CI (`npm run test:smoke`, `npm run test:regression`,
`npm run test:chromium`, etc.) are what a developer runs locally — the pipeline does not
hardcode any Playwright flags that aren't also available as a script, so CI failures are
reproducible with one command.
