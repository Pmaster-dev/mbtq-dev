# Infrastructure

## Environments

| Environment | Hosting | Branch |
|---|---|---|
| Production | Cloudflare Workers + GitHub Pages | `main` |
| Staging | Cloudflare Workers (staging env) | Pull requests |
| Local | Vite dev server + Node server | any |

## Cloudflare Workers

All edge functions are deployed via **Wrangler** using the config in `workers/wrangler.toml`.

Required secrets (set in GitHub repository settings):
- `CLOUDFLARE_API_TOKEN` — Wrangler deploy token
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

## GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `cloudflare-workers.yml` | push/PR to `workers/` | Deploy Hono edge functions |
| `node.js.yml` | push/PR to `main` | Build + test Node.js |
| `deno.yml` | push to `main` | Deploy Deno/GitHub Pages |
| `security.yml` | weekly + push | CodeQL + dependency audit |
| `dependency-review.yml` | PR | Block vulnerable deps |
| `super-linter.yml` | push/PR | Lint all code |
| `fibonrose-validator.yml` | issue comments | Validate Fibonrose checkpoints |
| `auto-merge.yml` | Dependabot PRs | Auto-merge safe updates |
| `stale.yml` | daily | Mark stale issues/PRs |

## Dependabot Coverage

Dependabot tracks:
- `/` — root npm dependencies
- `/workers` — Cloudflare Workers npm dependencies
- `/client` — Docker base images
- `/server` — Docker base images
- `/` — GitHub Actions versions

## Docker

- `client/Dockerfile` — Nginx-based production container
- `server/Dockerfile` — Node.js production container
- `docker-compose.yml` — Multi-container local dev

## Supabase

- Auth, Database, Storage, and Edge Functions
- See [Supabase guide](../guides/supabase.md)
