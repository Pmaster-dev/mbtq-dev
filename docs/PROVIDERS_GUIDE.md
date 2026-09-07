# 🔌 MBTQ Service Providers Integration Guide

This guide details the supported service providers, required environment variables, authentication headers, and testing procedures for the MBTQ platform.

## 🚀 Supported Service Providers

| Provider | Type | Environment Variable | Service Purpose |
|----------|------|----------------------|-----------------|
| **Supabase** | Database & Auth | `SUPABASE_URL` / `SUPABASE_ANON_KEY` | PostgreSQL, Auth, Realtime Postgres Changes |
| **OpenAI** | AI / LLM | `OPENAI_API_KEY` | GPT-4o, Embeddings |
| **Anthropic** | AI / LLM | `ANTHROPIC_API_KEY` | Claude 3.5 Sonnet |
| **Gemini** | AI / LLM | `GEMINI_API_KEY` | Gemini 1.5 Pro |
| **Deno KV** | Key-Value Store | `DENO_KV_URL` | Zero-cost edge key-value storage |
| **DeafAUTH** | Auth / Identity | `DEAFAUTH_SECRET` | Deaf-first sign language auth verification |

---

## 🛠️ Provider Service Usage in Server

The `ProviderService` class (`server/src/services/provider.service.ts`) provides automated health checks and environment variable audits:

```typescript
import { providerService } from './services/provider.service';

// Check all configured providers
const statuses = providerService.checkProviders(process.env);
console.log(statuses);
```

### Example Status Output:
```json
[
  {
    "name": "Supabase",
    "type": "database",
    "configured": true,
    "status": "online",
    "message": "Supabase configured via SUPABASE_URL"
  },
  {
    "name": "OpenAI",
    "type": "ai",
    "configured": false,
    "status": "unconfigured",
    "message": "Missing OPENAI_API_KEY environment variable"
  }
]
```

---

## 🧪 Testing Provider Integrations

Run unit tests for provider verification:

```bash
npm run test:all
```
