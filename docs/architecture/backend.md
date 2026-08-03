# Backend Architecture

## Services

### 1. Cloudflare Workers Edge Layer (`workers/`)

Built with **Hono** — ultra-fast Cloudflare Workers framework.

**Responsibilities:**
- API gateway routing
- CORS and auth middleware
- Quick functions (pure CPU, no I/O — sub-millisecond cold starts)
- Fibonrose complexity calculator
- Accessibility quick-check proxy
- DeafAUTH token format validation

**Key routes:**
| Route | Type | Purpose |
|---|---|---|
| `GET /health` | Quick | Worker health check |
| `GET /api/ecosystem` | API | Ecosystem status |
| `GET /api/ai/providers` | API | AI provider registry |
| `POST /api/a11y/validate` | API | Route to Developer-Magician |
| `POST /quick/fibonrose/complexity` | Quick | Complexity calculation |
| `POST /quick/a11y/quick-score` | Quick | WCAG score heuristic |

### 2. Node.js/Express Server (`server/`)

TypeScript REST API with:
- PostgreSQL via Prisma ORM
- API key authentication
- Webhook system
- Creator matching algorithm
- Content Fulfillment API

### 3. Supabase Edge Functions (Deno)

Used for AI integration (LLM calls, streaming). See [LLM + Deno guide](../guides/llm-deno.md).

## Communication

```
Browser → Cloudflare Workers (edge) → Node Server / Supabase
                                    → Developer-Magician API
                                    → AI Providers (via Supabase Edge Fn)
```
