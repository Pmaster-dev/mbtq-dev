# MBTQ Quantum AI Architecture

## Building Deaf-First AI Infrastructure with Supabase

---

## 🎯 Vision

MBTQ is building a **quantum-inspired coordination layer** for Deaf-first, accessibility-native AI products.

This repo stays focused on:

- **Quantum orchestration** for AI-assisted workflows
- **Supabase-backed data, auth, and realtime**
- **Accessible client experiences** for LGBTQ+ and Deaf communities
- **Vendor-neutral service boundaries** so platform logic is not tied to one runtime

Fresh and other Deno-specific applications now belong in a separate repository.

---

## 🏗️ Architecture Overview

```text
User Request
    ↓
Accessible Client Experience
    ↓
MBTQ Quantum Service Layer
    ↓
Auth / Policy / Trust Checks
    ↓
AI Provider Router
    ↓
Supabase (Postgres + Auth + Realtime + Storage)
    ↓
Response + Audit Trail
```

### Core Principles

1. **Accessibility first** — visual-first flows, keyboard support, and clear structure
2. **Community safety** — policy enforcement, escalation paths, and transparent handling
3. **Quantum orchestration** — modular agents and services coordinated through explicit boundaries
4. **Vendor neutrality** — avoid coupling core product logic directly to a single framework or runtime

---

## 🧩 Recommended Boundaries

Keep the stack split into clear layers:

### 1. Client Layer
- React/Vite or another frontend
- Presentation, accessibility, and local interaction state

### 2. Quantum SDK / Service Layer
- Shared request helpers
- Typed domain operations
- Safety and validation hooks

### 3. Data & Integration Layer
- Supabase access
- AI provider adapters
- External API integrations

This keeps the repo aligned with the platform direction while allowing Deno/Fresh services to evolve elsewhere.

---

## 🔐 Supabase Role

Supabase remains the primary backend for:

- **PostgreSQL data storage**
- **Authentication**
- **Realtime subscriptions**
- **Storage**
- **Row Level Security**

Recommended domains to model early:

- `organizations`
- `memberships`
- `roles`
- `permissions`
- `audit_logs`
- `trust_scores`

---

## 🤖 AI Integration Strategy

Use a provider router that selects the right model for each task:

- **Fast classification** for guardrails and intent routing
- **Higher-quality reasoning** for architecture and code generation
- **Long-context models** for documentation and repo analysis
- **Vision-capable models** for screenshots and accessibility review

### Guardrails

Before fulfilling requests:

1. Authenticate the user
2. Apply trust and policy checks
3. Validate scope and safety
4. Log important actions
5. Return visual-first, structured responses

---

## 📡 Realtime Guidance

For PinkSync and related collaborative features, define:

- who owns the source of truth
- conflict resolution rules
- timestamp strategy
- replay/history requirements
- moderation and incident logging

Supabase Realtime can support this, but the ownership model should be explicit in the service layer.

---

## 🚀 Deployment Direction

For this repository:

- keep the primary app and docs runtime-agnostic
- keep CI focused on the code that lives here
- keep backend secrets on trusted server-side systems
- keep framework-specific runtimes in their own repositories when they become standalone products

---

## ✅ Practical Checklist

- Keep product logic out of runtime-specific entrypoints
- Prefer adapters over direct provider calls from UI components
- Document service boundaries before scaling features
- Keep AI keys off the client
- Use RLS and audit logging for safety-critical data

---

## 🔗 Related Docs

- [README.md](./README.md)
- [BACKEND_CONNECTOR_GUIDE.md](./BACKEND_CONNECTOR_GUIDE.md)
- [QUICK_START.md](./QUICK_START.md)
- [MODERNIZATION_SUMMARY.md](./MODERNIZATION_SUMMARY.md)

---

**MBTQ.dev © 2026 | Community. Culture. Power. 💜**
