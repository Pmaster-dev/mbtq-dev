# GitHub Actions Guide

All CI/CD workflows live in `.github/workflows/`.

## Workflow Summary

| File | Trigger | Purpose |
|---|---|---|
| `cloudflare-workers.yml` | push/PR (`workers/`) | Build + deploy Hono edge workers |
| `node.js.yml` | push/PR (`main`) | Node.js build + test matrix |
| `deno.yml` | push (`main`) | Deno build + GitHub Pages deploy |
| `security.yml` | weekly + push | CodeQL analysis + npm audit |
| `dependency-review.yml` | PR | Block PRs introducing vulnerable deps |
| `super-linter.yml` | push/PR (`main`) | Lint all code |
| `fibonrose-validator.yml` | issue events | Validate Fibonrose task checkpoints |
| `auto-merge.yml` | Dependabot PRs | Auto-merge safe dependency updates |
| `stale.yml` | daily (cron) | Mark stale issues and PRs |
| `summary.yml` | issue opened | AI-generated issue summary |
| `codacy.yml` | push/PR/schedule | Codacy security scan |

## Dependabot

`dependabot.yml` automatically opens PRs for:
- Root npm dependencies (weekly)
- `workers/` npm dependencies (weekly)
- `client/` Docker base images (weekly)
- `server/` Docker base images (weekly)
- GitHub Actions versions (weekly)

Dependabot PRs are auto-merged by `auto-merge.yml` after all CI checks pass.

## Required Secrets

| Secret | Used by |
|---|---|
| `CLOUDFLARE_API_TOKEN` | `cloudflare-workers.yml` |
| `CLOUDFLARE_ACCOUNT_ID` | `cloudflare-workers.yml` |
| `CODACY_PROJECT_TOKEN` | `codacy.yml` |
| `GITHUB_TOKEN` | All workflows (auto-provided) |
