## 2024-03-29 - React Memoization on Background Elements
**Learning:** Found multiple unmemoized background animation components (`FloatingEmoji`) in `App.tsx` that re-render whenever the main application state (theme, active view, celebration) changes. Also, static arrays inside components (`MBTQDevGenerator`) are recreated on every text input stroke.
**Action:** Apply `React.memo` to pure presentational or independently-stateful background components to prevent unnecessary React render cycles when the parent state updates, and move static arrays out of components.
## 2025-02-20 - React Memoization on Large Static Components
**Learning:** Found complex, stateful components without props (e.g., `MBTQDevGenerator`) being unnecessarily re-rendered by top-level state changes (like theme toggles) because they lacked memoization.
**Action:** Apply `React.memo` to large, self-contained components that do not rely on props to prevent performance hits when unrelated parent state changes.
## 2024-05-24 - Throttling High-Frequency Socket Emits with Closures
**Learning:** In interactive React applications, combining high-frequency DOM events (like those emitted by `interact.js` at ~60fps) with network operations (`socket.emit`) causes both stale-state closure bugs and massive network congestion. The initial implementation captured stale coordinates in closures, and emitted a barrage of websocket packets per second, grinding the system down.
**Action:** Always wrap high-frequency network emitters in a `throttle` function (e.g., using a custom `useThrottle` hook), and pass the strictly calculated immediate state object to the throttled emitter (rather than reading from closed-over reactive state) to ensure correct data without overwhelming the network.
## 2025-02-21 - List Rendering Performance with Custom Event Bus
**Learning:** The `ActionLog` component prepends new events from the `StateEventBus` singleton. Relying on array indices for React keys in a dynamically prepended list causes O(n) rendering bottlenecks, as React remounts components when indices shift.
**Action:** Always include a stable, unique identifier (like `crypto.randomUUID()`) at the event emission source (`StateEventBus`) to act as the React key when rendering prepended dynamic lists.
## 2024-04-18 - [Memoization of Dynamic Notification Lists]
**Learning:** [When rendering dynamic lists of components that contain internal timeouts (like `VisualNotificationSystem`), failing to wrap child items in `React.memo` and parent handlers in `useCallback` causes O(n) re-renders, which can unintentionally reset the active `useEffect` timers of existing notifications when a new one is added.]
**Action:** [Always memoize list items and ensure stable handler references using `useCallback` when dealing with time-sensitive or dynamic component arrays in React.]
## 2024-05-24 - Chunked Concurrent Webhook Retries
**Learning:** Sequential `await` in loops for network requests (like webhook deliveries with 10s timeouts) creates O(N) blocking, stalling the event loop and dramatically slowing down background processes.
**Action:** Replace sequential `await` with chunked concurrent execution using `Promise.all()` (e.g., chunk size of 10) to optimize throughput without overwhelming external APIs or the Node event loop.
## 2026-05-10 - React.memo Optimization in SignVisualSystem
**Learning:** In highly dynamic components like `SignVisualSystem` that frequently emit state updates (e.g., via `eventBus.emit`), child components that rely on derived props from that state (like `SignerPanel` and `ActionLog`) will re-render unnecessarily if not memoized. This creates a performance bottleneck when the parent's state updates are frequent.
**Action:** Always wrap presentation components in `React.memo` when they receive complex objects as props and are rendered by a parent component that undergoes frequent state changes.
## 2025-05-11 - Prisma Data Fetching Optimization
**Learning:** When retrieving records for bulk operations where only the ID is needed (like `retryFailedWebhooks`), failing to use `select: { id: true }` causes Prisma to fetch the entire record, including large JSON payload blobs. This drastically increases memory usage and database I/O for 100+ records.
**Action:** Always use `select` to restrict fetched fields to only what is necessary, especially in background jobs dealing with potentially large data like webhook payloads.
## 2026-05-12 - Prevent large payload fetching in webhook retries
**Learning:** Using Prisma's `findMany` without `select` for batch processing endpoints pulls all columns into Node.js memory. For webhooks, this includes the potentially large JSON `payload` column, which wastes memory and increases DB I/O when only the ID is needed to trigger a retry.
**Action:** Always add `select: { id: true }` to Prisma queries used for batch job fetching or iteration when only specific identifier fields are needed for subsequent operations.
## 2024-05-24 - Prisma Partial Selection for Bulk Operations
**Learning:** In backend background jobs (like webhook retries), fetching complete records for large tables (like `webhookEvent` containing massive JSON payloads) causes significant memory bloat and database I/O bottlenecks when only the ID is needed for further processing.
**Action:** Always use `select: { id: true }` in Prisma `findMany` queries when fetching records for subsequent operations that only require the identifier, preventing large blobs from being loaded into the application's memory.
## 2024-05-16 - [Batching prisma writes in submit endpoint]
**Learning:** Found sequential `await prisma` calls in the `creators.routes.ts` file for updating the project, request, and creating a status log. Sequential writes require multiple database round trips, increasing network latency and risking inconsistency.
**Action:** Replace sequential Prisma operations with `await prisma.$transaction([...])`. This guarantees atomicity and executes all writes in a single round trip, reducing event loop blocking time.
## 2025-02-21 - Prisma $transaction for Sequential Writes
**Learning:** Sequential `await` operations on database writes (like updating bids, creating logs, updating status sequentially) create O(N) network roundtrips, causing performance bottlenecks and stalling the event loop, especially when atomicity is desired.
**Action:** Always batch consecutive Prisma database mutations using `await prisma.$transaction([...])` to guarantee atomicity and minimize network latency for significantly faster endpoint execution.
## 2026-04-30 - [Concurrent Webhook Retries]
**Learning:** In backend operations that iterate over potentially large datasets and make network calls (like webhook retries), using sequential `await` in a `for...of` loop causes O(N) network blocking, drastically slowing down processing.
**Action:** Replace sequential `await` operations in loops with chunked concurrent execution using `Promise.all()` (e.g., chunk size of 10) to prevent O(N) network blocking without overwhelming the event loop or external APIs.
## 2025-05-24 - Prisma $transaction for Sequential Writes in Project Submission
**Learning:** Sequential `await` operations on database writes (like updating projects, requests, and creating logs sequentially) create O(N) network roundtrips, causing performance bottlenecks and stalling the event loop, especially when atomicity is desired.
**Action:** Always batch consecutive Prisma database mutations using `await prisma.$transaction([...])` to guarantee atomicity and minimize network latency for significantly faster endpoint execution.
## 2024-05-25 - Prisma Partial Selection for List Endpoints
**Learning:** Fetching complete records in paginated list endpoints (like `/events`) when tables contain large JSON or TEXT columns (`payload`, `response`) causes memory bloat and slows down the API, even if the payload isn't rendered in the list view.
**Action:** Always use explicit `select` in Prisma `findMany` queries for list endpoints to exclude large text or JSON columns that are only needed for detail views.
