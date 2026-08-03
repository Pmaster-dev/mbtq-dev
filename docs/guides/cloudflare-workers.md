# Cloudflare Workers + Hono Guide

MBTQ.dev uses **Cloudflare Workers** for edge functions and **Hono** as the web framework.

## Why Cloudflare Workers?

- **Zero cold starts** for quick functions (pure CPU)
- **Global edge network** — <10ms latency worldwide
- **Built-in KV, Durable Objects, R2** for stateful edge logic
- **Wrangler CLI** for seamless local dev and deployment

## Why Hono?

- Tiny footprint (~15 KB), zero dependencies
- Full TypeScript support
- Works on Workers, Deno, Node, Bun — same code
- Built-in middleware: CORS, logger, timing, pretty JSON

## Project Structure

```
workers/
├── src/
│   ├── index.ts          # App entry, middleware, route mounts
│   └── routes/
│       ├── api.ts        # Standard API routes
│       └── quick.ts      # Quick functions (pure CPU, no I/O)
├── wrangler.toml         # Cloudflare configuration
├── package.json
└── tsconfig.json
```

## Local Development

```bash
cd workers
npm install
npm run dev     # Starts wrangler dev at http://localhost:8787
```

Test endpoints:
```bash
curl http://localhost:8787/health
curl http://localhost:8787/api/ecosystem
curl http://localhost:8787/api/ai/providers

# Fibonrose complexity (quick function)
curl -X POST http://localhost:8787/quick/fibonrose/complexity \
  -H "Content-Type: application/json" \
  -d '{"taskSize": 5}'

# WCAG quick score
curl -X POST http://localhost:8787/quick/a11y/quick-score \
  -H "Content-Type: application/json" \
  -d '{"checks":[{"name":"alt-text","passed":true},{"name":"contrast","passed":false}]}'
```

## Deployment

### Secrets required

Set these in your GitHub repository settings (`Settings → Secrets → Actions`):

| Secret | How to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |

### Manual deploy

```bash
cd workers
npm run deploy             # production
npm run deploy:staging     # staging environment
```

### Automatic deploy (CI)

The `cloudflare-workers.yml` workflow deploys automatically:
- **Staging** — on every PR that touches `workers/`
- **Production** — on push to `main` that touches `workers/`

## Adding a New Route

### API route (can make external calls)

```typescript
// workers/src/routes/api.ts
apiRouter.get('/my-feature', async (c) => {
  const result = await fetch('https://external-api.example.com/data')
  return c.json(await result.json())
})
```

### Quick function (CPU-only, fastest possible)

```typescript
// workers/src/routes/quick.ts
quickRouter.post('/my-quick-fn', async (c) => {
  const { input } = await c.req.json<{ input: string }>()
  const output = myPureCpuFunction(input)
  return c.json({ output })
})
```

## KV Storage

To add KV storage, update `wrangler.toml` and the `Env` interface:

```toml
[[kv_namespaces]]
binding = "MBTQ_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

```typescript
// workers/src/index.ts
export interface Env {
  ENVIRONMENT: string
  MBTQ_KV: KVNamespace
}
```

Then in your routes:
```typescript
await c.env.MBTQ_KV.put('key', 'value')
const value = await c.env.MBTQ_KV.get('key')
```
