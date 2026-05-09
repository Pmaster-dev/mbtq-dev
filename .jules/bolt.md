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
