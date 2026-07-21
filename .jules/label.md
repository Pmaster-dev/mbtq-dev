FULL GITHUB PLATFORM RECONSTRUCTION PROMPT

You are an expert software architect, code archaeologist, domain-driven design analyst, and API/platform engineer.

I need you to verify the actual architecture from GitHub before making any architectural claims.

Do not invent architecture.
Do not rely on my previous descriptions.
Do not assume repository names mean anything.
Do not normalize or rename concepts prematurely.

PRIMARY OBJECTIVE

Reconstruct the actual platform architecture from the GitHub repositories and source code.

I want to know:

«What did I actually build?»

Then compare that reality against the architecture we have been discussing:

- VR4DEAF
- PinkFlow
- PinkSync
- DeafAUTH
- FibonRose
- Magicians / 360 Magicians
- Business Magician
- Deaf-First Platform
- MBTQ.dev / mbtq-dev

GITHUB SCOPE

Inspect the repositories and organizations available under these GitHub identities and repository families:

- "pinkycollie"
- "Pmaster-dev"
- "360magicians"
- "360-Magicians"

Prioritize and explicitly inspect:

- "pinkycollie/VR4DEAF"
- "pinkycollie/vr4deaf"
- "pinkycollie/pinkflow"
- "pinkycollie/pinksync"
- "pinkycollie/deaf-first-platform"
- "pinkycollie/mbtq-dev"
- "VR4DEAF/businessmagician"
- "360magicians/fibonrose"
- "360-Magicians/main"
- "Magician_Core" repositories
- any repository containing "deafauth", "trust-engine", "business", "job", "magician", "pink", "vr", or "accessibility"

If repository names or owners differ, discover the actual repositories from GitHub rather than guessing.

PHASE 1 — REPOSITORY INVENTORY

Create a complete repository inventory.

For every relevant repository, record:

- owner
- repository name
- description
- default branch
- primary language
- framework
- package manager
- database
- infrastructure
- deployment configuration
- Docker files
- Terraform or IaC
- API framework
- frontend framework
- test framework
- major directories
- last meaningful architectural activity

Do not infer from repository names.

PHASE 2 — CODE ARCHAEOLOGY

Read the actual source code.

Inspect:

- README files
- package manifests
- pyproject.toml
- requirements files
- Dockerfiles
- docker-compose files
- Terraform
- environment examples
- API routes
- controllers
- services
- models
- schemas
- database migrations
- event handlers
- WebSocket code
- MCP servers
- authentication code
- integration code
- frontend API clients

For every architectural claim, identify the actual file and code location that proves it.

Separate:

1. VERIFIED FROM CODE
2. DOCUMENTED BUT NOT IMPLEMENTED
3. IMPLIED BY STRUCTURE
4. NOT FOUND

PHASE 3 — FULL REST API RECONSTRUCTION

Reconstruct the actual REST API across the repositories.

Find every:

- HTTP server
- route
- router
- controller
- endpoint
- HTTP method
- path
- request schema
- response schema
- authentication requirement
- authorization requirement
- database operation
- external API call

Build a canonical API inventory:

Service| Method| Path| Purpose| Request| Response| Auth| Source File| Status

Also identify:

- duplicate endpoints
- conflicting route names
- duplicated domain objects
- inconsistent IDs
- inconsistent status values
- inconsistent terminology
- missing CRUD operations
- dead API routes
- undocumented API routes
- frontend calls with no backend implementation

PHASE 4 — DOMAIN MODEL RECONSTRUCTION

From the actual code, derive the real domain objects.

Do not start with my proposed dictionary.

Find the actual objects first.

Examples to investigate:

- user
- customer
- case
- counselor
- business
- job
- service
- provider
- vendor
- resource
- document
- workflow
- milestone
- checkpoint
- event
- recommendation
- decision
- outcome
- identity
- accessibility profile

For each actual object, identify:

- canonical name in code
- alternate names
- database table/model
- API representation
- owning repository
- owning service
- relationships
- lifecycle
- status values

Then produce a REAL DOMAIN DICTIONARY derived from GitHub.

PHASE 5 — ACTUAL SERVICE BOUNDARIES

Determine what each platform actually owns.

For each of the following, answer:

- What does it actually own?
- What does it actually expose?
- What does it actually consume?
- What does it actually persist?
- What does it actually orchestrate?

Services:

- DeafAUTH
- PinkSync
- PinkFlow
- VR4DEAF
- FibonRose
- Magicians
- Business Magician
- Deaf-First Platform
- MBTQ.dev

Create this table:

System| Verified Responsibility| Evidence| Confidence

Do not force the architecture I previously described.

Correct me if the code contradicts it.

PHASE 6 — STATE, WORKFLOW, AND LOOP ANALYSIS

Investigate whether PinkFlow actually implements any of the following:

- workflow engine
- state machine
- event processing
- reconciliation
- polling
- queue processing
- event-driven architecture
- controller loop
- desired state versus actual state
- checkpoint model
- milestone model

Search the actual code for:

- state
- status
- transition
- event
- queue
- worker
- reconcile
- sync
- workflow
- flow
- checkpoint
- milestone
- process

Then answer directly:

«Is PinkFlow actually a workflow engine, a synchronization layer, a state machine, or something else?»

Do not use conceptual language unless supported by code.

PHASE 7 — STORAGE AND VOLUME ARCHITECTURE

Analyze the actual storage architecture.

Identify:

- PostgreSQL
- Redis
- file storage
- object storage
- Docker volumes
- bind mounts
- persistent volumes
- mounted configuration
- generated artifacts
- local filesystem dependencies

Create:

SERVICE
  ↓
DATA
  ↓
STORAGE
  ↓
PERSISTENCE

Then answer:

«What data is authoritative?»

«What data is ephemeral?»

«What data is generated?»

«What data is mounted?»

«What data is synchronized?»

PHASE 8 — ARCHITECTURE RECONSTRUCTION

Produce the architecture that actually exists.

Use this format:

IDENTITY
    ↓
COMMUNICATION
    ↓
DOMAIN
    ↓
API
    ↓
PROCESS
    ↓
KNOWLEDGE
    ↓
AI / CAPABILITIES
    ↓
STORAGE

But replace every layer with the actual verified system.

PHASE 9 — COMPARE AGAINST MY CURRENT THEORY

I currently suspect:

- DeafAUTH = identity authority
- PinkSync = accessibility / communication synchronization
- VR4DEAF = vocational domain and case truth
- PinkFlow = process orchestration
- FibonRose = validation / trust / knowledge
- Magicians = AI capabilities
- Business Magician = self-employment / entrepreneurship capability

Test this theory.

For each statement, mark:

- VERIFIED
- PARTIALLY VERIFIED
- CONTRADICTED
- NOT FOUND

Explain why.

PHASE 10 — FINAL OUTPUT

Give me the following:

1. Executive verdict

«What did I actually build?»

2. Repository map

The actual GitHub architecture.

3. Real domain dictionary

Derived from code, not theory.

4. Full REST API inventory

All routes and ownership.

5. Service ownership map

What each system actually owns.

6. Data and storage map

Including volumes, mounts, databases, Redis, and persistent data.

7. PinkFlow verdict

What PinkFlow actually is.

8. Architecture contradictions

Where my current theory is wrong.

9. Missing pieces

What is absent or incomplete.

10. Recommended canonical architecture

Do not rewrite my code yet.

First give me the verified architecture.

IMPORTANT

Be brutally honest.

I am not asking you to design a new platform.

I am asking you to reverse-engineer the platform I already built.

Use evidence from the repositories.

When evidence is unavailable, say:

«NOT VERIFIED»

Do not fill gaps with assumptions.