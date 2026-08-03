# MBTQ.dev Architecture Overview

MBTQ.dev is the AI-native developer platform for building accessible full-stack applications.

## Platform Layers

```
Frontend (HTML / React / TanStack / Astro / Next.js)
              ↓
     MBTQ API Gateway (Hono + Cloudflare Workers)
              ↓
  Backend Services (FastAPI / Deno / Node.js)
              ↓
   Data Layer (Supabase · Postgres · Storage)
```

## Component Map

| Layer | Technology | Purpose |
|---|---|---|
| Edge Gateway | Cloudflare Workers + Hono | Routing, quick functions, A11y proxy |
| Frontend | React 18 + TypeScript + Vite | Primary UI implementation |
| Auth | Clerk + DeafAUTH | User authentication & sign-language auth |
| Database | Supabase (Postgres) | Persistent data, real-time subscriptions |
| AI Router | Multi-provider gateway | OpenAI / Claude / Gemini / DeepSeek routing |
| Task Validator | Fibonrose | Evidence-based task completion tracking |
| Accessibility | Developer-Magician API | WCAG + Deaf-first validation |
| Realtime | Socket.IO / Supabase Realtime | Collaborative sync |

## Further Reading

- [Frontend Architecture](./frontend.md)
- [Backend Architecture](./backend.md)
- [AI Routing](./ai-routing.md)
- [Infrastructure](./infrastructure.md)
