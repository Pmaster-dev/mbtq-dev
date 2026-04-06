## 2024-03-29 - React Memoization on Background Elements
**Learning:** Found multiple unmemoized background animation components (`FloatingEmoji`) in `App.tsx` that re-render whenever the main application state (theme, active view, celebration) changes. Also, static arrays inside components (`MBTQDevGenerator`) are recreated on every text input stroke.
**Action:** Apply `React.memo` to pure presentational or independently-stateful background components to prevent unnecessary React render cycles when the parent state updates, and move static arrays out of components.
## 2025-02-20 - React Memoization on Large Static Components
**Learning:** Found complex, stateful components without props (e.g., `MBTQDevGenerator`) being unnecessarily re-rendered by top-level state changes (like theme toggles) because they lacked memoization.
**Action:** Apply `React.memo` to large, self-contained components that do not rely on props to prevent performance hits when unrelated parent state changes.
## 2024-05-24 - Throttling High-Frequency Socket Emits with Closures
**Learning:** In interactive React applications, combining high-frequency DOM events (like those emitted by `interact.js` at ~60fps) with network operations (`socket.emit`) causes both stale-state closure bugs and massive network congestion. The initial implementation captured stale coordinates in closures, and emitted a barrage of websocket packets per second, grinding the system down.
**Action:** Always wrap high-frequency network emitters in a `throttle` function (e.g., using a custom `useThrottle` hook), and pass the strictly calculated immediate state object to the throttled emitter (rather than reading from closed-over reactive state) to ensure correct data without overwhelming the network.
