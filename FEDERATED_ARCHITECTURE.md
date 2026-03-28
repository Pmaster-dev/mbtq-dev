# Federated Architecture: MBTQ Foundry & Deaf-First Commons

This document defines the relationship between the **Engineering Foundry** (`@mbtq-dev`) and the **Community Commons** (`@deaf-first`).

## 1. Structural Overview

The ecosystem is split into two distinct tiers to balance core infrastructure stability with community-driven innovation.

### 🏗️ Engineering Foundry (@mbtq-dev)
**Purpose:** Core service development, infrastructure management, and reusable building blocks.
- **Identity (DeafAuth)**: The logic and protocol for deaf-first authentication.
- **Execution (PinkSync)**: Real-time synchronization and visual alert engines.
- **Trust (Fibonrose)**: The mathematical trust validation system.
- **Orchestration (PinkFlow)**: CI/CD automation and cross-repo coordination.

### 🌐 Community Commons (@deaf-first)
**Purpose:** Public-facing platform, community contributions, and agency implementations.
- **Platform UI**: The primary visual interface for users.
- **Community Services**: Tools built by the community using Foundry building blocks.
- **Agencies**: Specific implementations (e.g., VR4Deaf) that leverage the core.

---

## 2. Federation Protocols

### 🔑 Identity Federation
- **One Identity Source**: All services across both orgs use the same Supabase Auth instance.
- **Cross-Org JWTs**: Access tokens issued by `@mbtq-dev/identity` are valid for `@deaf-first` services.
- **Unified Profiles**: User accessibility preferences are stored centrally and shared via the "Sovereign Pod" handshake.

### 🌹 Trust Federation
- **Global Trust Score**: A contributor's Fibonrose trust score follows them across both organizations.
- **Shared Evidence Ledger**: Evidence for task completion in `@deaf-first` repos is recorded in the `@mbtq-dev` trust history.
- **Cross-Repo Validation**: Reusable workflows in `@mbtq-dev` can validate PRs in `@deaf-first` using the Fibonrose sequence.

### 🔄 Real-time Federation
- **Unified Pulse**: PinkSync channels are federated, allowing a visual alert triggered in an Engineering tool to be reflected in a Community tool.
- **Shared Schema**: All real-time messages follow the `@mbtq-dev` accessibility metadata standards.

---

## 3. Workflow Federation (CI/CD)

To ensure consistency, `@deaf-first` repositories utilize **Reusable Workflows** hosted in the `@mbtq-dev/factory-hub`.

1. **Compliance Gating**: Every PR in the Commons must pass the `mbtq-dev/reusable-compliance` check.
2. **Auto-Deployment**: Deployment workflows in `@deaf-first` are triggered by validated handshakes from `@mbtq-dev` agents.
3. **Federated Secrets**: Critical keys (e.g., Supabase, Azure) are managed via GitHub Organization Secrets in `@mbtq-dev` and shared with specific repositories in `@deaf-first`.

---

## 4. Federated Governance

| Aspect | Engineering (@mbtq-dev) | Community (@deaf-first) |
| :--- | :--- | :--- |
| **Code Ownership** | Lead Architects | Public Contributors |
| **Validation Level** | Level 7+ (Architect Review) | Level 3-5 (Community Peer) |
| **Release Cycle** | Continuous (Stable Core) | Agile (Feature Driven) |
| **Support** | Infrastructure SLA | Community Forum / Wiki |


## 5. Unified Branching Strategy

To maintain stability in the Foundry while allowing agility in the Commons, both organizations follow a standardized branching model.

### 🌿 Protected Branches
- **`main`**: Production-ready code. In `@mbtq-dev`, this is the "Golden Source". In `@deaf-first`, this represents the live platform.
- **`develop`**: Integration branch for upcoming releases. All feature branches merge here first.

### 🛠️ Feature & Workflow Branches
- **`feature/*`**: New capabilities or components.
- **`fix/*`**: Bug fixes and compliance patches.
- **`rfc/*`**: Requests for Comments on architectural changes (primarily in Engineering Foundry).
- **`pod/*`**: Specific configuration changes for agency implementation pods.

### 🌹 Validation Gates
- **Develop → Main**: Requires a Level 5+ Fibonrose validation and 2 architect approvals.
- **Feature → Develop**: Requires a Level 3+ Fibonrose validation and 1 peer approval.
