# CI/CD

## Pipeline overview (`.github/workflows/playwright-tests.yml`)

A single, consolidated workflow (an earlier two-file smoke/regression split was merged into
this one — see the deprecation notice at the top of `.github/workflows/regression.yml` for
the history). Triggers:

- `push` to `main` and `pull_request` targeting `main` — always runs the `@smoke` subset,
  single browser (chromium), for fast feedback.
- `schedule` (nightly, 02:00 UTC) — always runs the full `@regression` subset across all
  three browsers.
- `workflow_dispatch` — manual runs with three inputs: **environment** (`qa`/`staging`),
  **browser** (`chromium`/`firefox`/`webkit`/`all`), and **suite**
  (`smoke`/`regression`/`ui`/`api`/`all`), so an engineer can, for example, run `@api` only
  against `staging` on `webkit` without touching the workflow file.

## Job structure

1. **`resolve-inputs`** — a small job that maps the trigger type and any dispatch inputs
   into three outputs: the `--grep` pattern for the selected suite (`@smoke`, `@regression`,
   `@ui`, `@api`, or empty for `all`), the browser matrix as a JSON array, and an artifact
   retention period (7 days for push/PR, 14 for manual dispatch, 30 for the nightly
   schedule). Centralizing this logic here keeps the test job's steps declarative instead of
   full of inline conditionals.
2. **`test`** — matrixed over the resolved browser list. Per leg:
   1. Checkout (`actions/checkout@v4`)
   2. Setup Node.js 20, with `actions/setup-node`'s built-in npm cache keyed on
      `package-lock.json`
   3. `npm ci`
   4. `npx playwright install --with-deps <browser>` — only the browser this leg needs
   5. `npm run lint` (ESLint)
   6. `npm run typecheck` (`tsc --noEmit`)
   7. Run Playwright with the resolved `--project` and `--grep` (HTML report is generated
      as a byproduct of this step, per the `reporter` config in `playwright.config.ts` —
      there is no separate "generate HTML report" command)
   8. `npm run report:allure:generate` (`if: always()`, so a failed run still gets a
      browsable Allure report)
   9. Upload three artifacts, all `if: always()`: the Playwright HTML report, the generated
      Allure report, and `test-results/` (which contains traces, screenshots, and videos
      together — they're not re-uploaded separately, since Playwright already writes them
      to the same directory and duplicating the upload would just double storage cost for
      identical files)

## Why a matrix, not a single job

Running each browser as a separate matrix leg parallelizes wall-clock time and isolates a
browser-specific failure (e.g. a WebKit-only flake) from blocking the other two in the same
check.

## Retry, worker, and timeout configuration

- `RETRIES=2` in CI (read by `config/test-config.ts`) absorbs transient network flake
  against the live public demo site without masking real regressions — a retried-but-passing
  test still surfaces as flaky in Allure's history.
- `WORKERS` defaults to a `PLAYWRIGHT_WORKERS` repository/organization variable (falling
  back to `2`, a safe value for GitHub-hosted 2-core runners) — tunable without editing the
  workflow file.
- The `test` job has a 60-minute `timeout-minutes` ceiling so a hung run fails fast instead
  of consuming the full default 6-hour GitHub Actions limit.

## Secrets & environment targeting

`ENV` (`qa`/`staging` in CI) and any environment-specific `BASE_URL`/`API_BASE_URL` or
`SEED_USER_*` overrides are read from job `env:`, ready to be sourced from GitHub
Environments/secrets in a real multi-environment deployment.

## Local parity

The same npm scripts used conceptually in CI (`npm run test:smoke`, `npm run
test:regression`, `npm run lint`, `npm run typecheck`, `npm run report:allure:generate`)
are what a developer runs locally. The workflow's dynamic `--project`/`--grep` selection
(driven by dispatch inputs) has no single static npm-script equivalent by design — that
parameterization is exactly what manual dispatch inputs are for — but every fixed suite
(`@smoke`, `@regression`) and every directory (`tests/ui`, `tests/api`) remains runnable
identically both locally and in CI.
