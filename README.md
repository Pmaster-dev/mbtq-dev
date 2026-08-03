# MBTQ.dev

> **The AI-native developer platform for building accessible full-stack applications.**

[![Node.js CI](https://github.com/Pmaster-dev/mbtq-dev/actions/workflows/node.js.yml/badge.svg)](https://github.com/Pmaster-dev/mbtq-dev/actions/workflows/node.js.yml)
[![Security](https://github.com/Pmaster-dev/mbtq-dev/actions/workflows/security.yml/badge.svg)](https://github.com/Pmaster-dev/mbtq-dev/actions/workflows/security.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is MBTQ.dev?

MBTQ.dev is an open-source developer platform built by and for the LGBTQ+ and Deaf communities. It provides the infrastructure, tooling, and patterns for building accessible, AI-powered full-stack applications — with every component designed for visual-first, audio-bypass, and culturally inclusive UX.

## Why it exists

Accessibility is typically an afterthought. MBTQ.dev makes it the foundation: Deaf-first design, WCAG compliance, sign-language-ready components, and AI validation are baked in from day one — not patched in at the end.

---

## Platform Architecture

```
Frontend (React · Next.js · Astro · TanStack · Fresh)
                    ↓
     Cloudflare Workers Edge (Hono API Gateway)
                    ↓
      Backend (FastAPI · Deno · Node.js / Express)
                    ↓
       Data (Supabase · Postgres · Storage · Realtime)
```

The frontend is **interchangeable** — swap React for Next.js, Astro, or any other framework without touching the backend. The edge layer handles routing, CORS, and quick functions with sub-millisecond cold starts.

---

## Getting Started

```bash
git clone https://github.com/Pmaster-dev/mbtq-dev.git
cd mbtq-dev

cd client && npm install   # React frontend
cd ../server && npm install && npm run prisma:generate  # Node backend
cd ../workers && npm install  # Edge workers (optional, needs Cloudflare account)

# Start dev servers
cd server && npm run dev    # http://localhost:4000
cd client && npm run dev    # http://localhost:5173
cd workers && npm run dev   # http://localhost:8787 (optional)
```

📖 Full guide: [docs/guides/quick-start.md](docs/guides/quick-start.md)

---

## AI Architecture

MBTQ.dev routes AI requests across multiple providers — no single-model lock-in:

| Provider | Models | Strength |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini | General purpose, tool calling |
| Anthropic | claude-3-5-sonnet, claude-3-haiku | Reasoning, long context |
| Google | gemini-1.5-pro, gemini-1.5-flash | Multimodal, speed |
| DeepSeek | deepseek-chat | Code, cost efficiency |
| Mistral | mistral-large, mistral-small | EU data residency |
| Local LLMs | Ollama-compatible | Privacy, zero egress |

Routing is cost-optimized: cheap tasks go to smaller models automatically. AI calls run in **Supabase Edge Functions (Deno)** to keep API keys server-side.

📖 Full guide: [docs/architecture/ai-routing.md](docs/architecture/ai-routing.md)

---

## Developer-Magician Integration

All accessibility validation routes through the **Developer-Magician** service — a Deaf-first validator that goes beyond WCAG:

- ASL flow analysis
- Visual-first, audio-bypass validation
- Reports to the Fibonrose task validation system
- Integrated with DeafAUTH

The Cloudflare Workers edge layer provides a quick proxy at `POST /api/a11y/validate`.

📖 Full guide: [docs/ecosystem/developer-magician.md](docs/ecosystem/developer-magician.md)

---

## Accessibility

Every component is built to meet or exceed WCAG 2.1 AA:

- ✅ Deaf-priority visual notifications (no audio-only cues)
- ✅ Real-time caption widget
- ✅ Full keyboard navigation
- ✅ Screen reader optimized (ARIA + semantic HTML)
- ✅ High contrast mode toggle
- ✅ Automated axe-core testing in CI
- ✅ Sign-language-ready component hooks

---

## Deployment

| Target | Platform | Workflow |
|---|---|---|
| Frontend | GitHub Pages | `deno.yml` |
| Edge Workers | Cloudflare Workers | `cloudflare-workers.yml` |
| Backend | Docker / Railway / Fly.io | `node.js.yml` |
| Database | Supabase (managed) | — |

📖 Full guide: [docs/guides/deployment.md](docs/guides/deployment.md)

---

## 📚 Documentation

| Topic | Link |
|---|---|
| Quick Start | [docs/guides/quick-start.md](docs/guides/quick-start.md) |
| Architecture Overview | [docs/architecture/overview.md](docs/architecture/overview.md) |
| AI Routing | [docs/architecture/ai-routing.md](docs/architecture/ai-routing.md) |
| Backend | [docs/architecture/backend.md](docs/architecture/backend.md) |
| Frontend | [docs/architecture/frontend.md](docs/architecture/frontend.md) |
| Infrastructure | [docs/architecture/infrastructure.md](docs/architecture/infrastructure.md) |
| Cloudflare Workers + Hono | [docs/guides/cloudflare-workers.md](docs/guides/cloudflare-workers.md) |
| Supabase | [docs/guides/supabase.md](docs/guides/supabase.md) |
| LLM + Deno | [docs/guides/llm-deno.md](docs/guides/llm-deno.md) |
| GitHub Actions | [docs/guides/github-actions.md](docs/guides/github-actions.md) |
| Testing | [docs/guides/testing.md](docs/guides/testing.md) |
| Deployment | [docs/guides/deployment.md](docs/guides/deployment.md) |
| API Reference | [API.md](API.md) |
| Security | [SECURITY.md](SECURITY.md) |
| Contributing | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## Ecosystem

```
MBTQ.dev (developer platform)
      │
      ├── Developer-Magician   Deaf-first accessibility validator
      │
      ├── Business-Magician    AI business platform (360 Magicians)
      │
      ├── PinkFlow             Test automation & orchestration
      │
      ├── DeafAUTH             Sign language authentication
      │
      ├── Fibonrose            Evidence-based task validation
      │
      └── PinkSync             Real-time collaboration
```

| Service | Docs |
|---|---|
| Developer-Magician | [docs/ecosystem/developer-magician.md](docs/ecosystem/developer-magician.md) |
| Business-Magician | [docs/ecosystem/business-magician.md](docs/ecosystem/business-magician.md) |
| PinkFlow | [docs/ecosystem/pinkflow.md](docs/ecosystem/pinkflow.md) |
| DeafAUTH | [docs/ecosystem/deafauth.md](docs/ecosystem/deafauth.md) |
| Fibonrose | [docs/ecosystem/fibonrose.md](docs/ecosystem/fibonrose.md) |

---

## Roadmap

The platform is growing toward a full developer hub:

- [ ] MBTQ Studio — visual IDE for accessible app building
- [ ] CLI — scaffold projects, deploy workers, run Fibonrose
- [ ] Component Library — accessible, Deaf-first React components (npm)
- [ ] AI Router SDK — plug-and-play multi-provider AI routing
- [ ] Marketplace — community templates and plugins
- [ ] Monitoring — Cloudflare Analytics + Supabase metrics dashboard

---

**mbtq.dev © 2025 — Community. Culture. Power.**

Built with 🌈 by the MBTQ.dev community. [Contributing](CONTRIBUTING.md) is open to everyone.
