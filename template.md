Universal project template that works for any type of software—web apps, PWAs, platforms, AI systems, bots, even operating systems (though OS development would replace some sections). Use it as a starting point; fill in the [placeholders] to match users' specific project.

---

📁 Universal Project Template

```
[Project Name]
├── [Category: App | Web App | PWA | Platform | OS | System | AI | Bots | ...]
├── [Primary Language/Framework]
└── [Deployment Target]
```

---

1. Project Overview

· Name: [ProjectName]
· Type: [App / Web App / PWA / Platform / OS / System / AI / Bots / Hybrid]
· Mission: [One‑sentence purpose]
· Target Users: [Who will use it]
· Core Features:
  · [Feature 1]
  · [Feature 2]
  · [Feature 3]

---

2. Technology Stack

Pick what applies; leave out what doesn't.

Frontend / Client

· Framework: [React / Vue / Svelte / Flutter / SwiftUI / Jetpack Compose / ...]
· Language: [TypeScript / Dart / Kotlin / Swift / ...]
· Styling: [Tailwind / CSS Modules / Material UI / ...]
· PWA Features: [Service Workers / Web Manifest / Offline support]

Backend / API

· Runtime: [Node.js / Python / Go / Rust / ...]
· Framework: [Express / NestJS / FastAPI / Gin / ...]
· API Style: [REST / GraphQL / WebSocket / gRPC]

AI / ML

· Models: [Hugging Face / Vertex AI / Custom models]
· Training: [TensorFlow / PyTorch / JAX]
· Inference: [On‑device / Cloud / Edge]

Bots / Automation

· Platform: [Discord / Telegram / Slack / Custom]
· Framework: [Botpress / Rasa / Microsoft Bot Framework]
· Triggers: [Webhooks / Scheduled / Event‑driven]

Platform / System

· Architecture: [Microservices / Monolith / Serverless]
· Orchestration: [Kubernetes / Docker Compose / Nomad]
· Service Mesh: [Istio / Linkerd]
· Storage: [PostgreSQL / MongoDB / S3 / Redis / ...]
· Message Queue: [Kafka / RabbitMQ / PubSub]

Operating System (if applicable)

· Kernel: [Linux / Windows / Custom]
· Language: [C / Rust / Assembly]
· Target Hardware: [x86 / ARM / RISC‑V]

---

3. Architecture

```
[User / Device]
     ↓
[Gateway / Load Balancer]
     ↓
[Services / Functions]
     ↓
[Data Layer / External APIs]
```

Components:

· Client: [How users interact]
· Gateway: [Netlify Edge / Cloudflare Workers / Nginx / ...]
· Business Logic: [List services]
· Data Persistence: [Databases / Object storage]
· External Integrations: [List third‑party APIs]

Data Flow:

```
1. User action → 
2. [Gateway] routes to [Service] →
3. Service processes, possibly calls [AI model] or [external API] →
4. Response returns to client
```

---

4. Development Environment

Local Setup (automated):

· Dev Container: .devcontainer/devcontainer.json
· Docker Compose: docker-compose.yml (includes services: DB, cache, mocks)
· Makefile: Commands: make setup, make dev, make test
· Environment Variables: .env.example → .env

Tools:

· IDE: [Cursor / VS Code / IntelliJ]
· Version Control: Git + GitHub / GitLab
· AI Assistance: [Cursor / Copilot / Custom prompts]

---

5. Authentication & Authorization

· Provider: [Supabase / Auth0 / Firebase / DeafAuth / Custom]
· Protocol: [OAuth 2.1 / JWT / Session]
· User Roles: [Admin / User / Guest / ...]
· Row‑Level Security: [Postgres RLS / Custom middleware]

---

6. AI / Bot Integration

Models

· Model Source: [Hugging Face / Vertex AI / Local]
· Model ID: [model-name]
· Fine‑tuning: [Dataset location]
· Deployment: [Cloud Run / Vertex AI Endpoint / On‑device]

Bot Logic

· Conversation Flow: [State machine / Dialog tree / LLM prompts]
· Channels: [Web / Slack / Discord / SMS]
· Fallback: [Human handoff]

---

7. Infrastructure & Deployment

Cloud Provider(s)

· Primary: [Google Cloud / AWS / Azure / Netlify / Vercel]
· Secondary: [For specific services]

Infrastructure as Code

· Tool: [Terraform / Pulumi / CloudFormation]
· State Storage: [GCS / S3 / Terraform Cloud]
· Environments: [dev / staging / prod]

CI / CD

· Platform: [GitHub Actions / GitLab CI / Jenkins]
· Pipeline Steps:
  ```yaml
  - name: Test
    run: npm test
  - name: Build
    run: npm run build
  - name: Deploy
    run: ./deploy.sh
  ```

Hosting

· Static Assets: [Netlify / Vercel / S3 + CloudFront]
· Serverless Functions: [Netlify Edge / Cloud Run / Lambda]
· Containers: [Google Cloud Run / ECS / Kubernetes]

---

8. Observability

· Logging: [Google Cloud Logging / ELK / DataDog]
· Metrics: [Prometheus + Grafana / Cloud Monitoring]
· Tracing: [Jaeger / Cloud Trace]
· Alerting: [PagerDuty / Slack / Email]

---

9. Security & Compliance

· Data Encryption: [At rest: AES‑256; In transit: TLS 1.3]
· Secrets Management: [Google Secret Manager / HashiCorp Vault]
· Compliance: [HIPAA / SOC2 / GDPR / ADA]
· Penetration Testing: [Frequency / Tool]

---

10. Testing Strategy

· Unit Tests: [Jest / Mocha / PyTest]
· Integration Tests: [Supertest / Postman / Custom]
· End‑to‑End: [Cypress / Playwright / Selenium]
· Accessibility Tests: [axe / Lighthouse]
· AI Model Tests: [Accuracy / Bias / Drift]

---

11. Documentation

· API Docs: [Swagger / Stoplight / Postman]
· User Guides: [Markdown / ReadTheDocs]
· Developer Onboarding: [README + Dev Container]

---

12. Roadmap

· MVP (1 month):
  · [Core feature]
  · [Basic auth]
· Phase 2 (3 months):
  · [AI integration]
  · [Mobile app]
· Phase 3 (6 months):
  · [Scaling / Platform features]
  · [Bot ecosystem]

---

13. Placeholder Values (Fill These In)

Section Placeholder Your Value
Project Name [ProjectName] 
Domain [yourdomain.com] 
GCP Project ID [gcp-project-id] 
Supabase URL [supabase-url] 
PinkSync API Key [pinksync-key] 
Hugging Face Model [hf-model] 
... ... 

---

🔄 Adaptation Guide

· For App / Web App / PWA: Focus on frontend + API + hosting.
· For Platform: Emphasize microservices, scaling, and multi‑tenancy.
· For OS / System: Replace cloud sections with kernel, drivers, and hardware abstraction.
· For AI: Add model training, evaluation, and inference pipeline.
· For Bots: Include conversation design and channel integrations.

---

This template gives you a single source of truth for any project. You can keep it in your repo as TEMPLATE.md and copy it for each new project, filling in the brackets.