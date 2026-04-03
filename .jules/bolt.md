## 2024-03-29 - React Memoization on Background Elements
**Learning:** Found multiple unmemoized background animation components (`FloatingEmoji`) in `App.tsx` that re-render whenever the main application state (theme, active view, celebration) changes. Also, static arrays inside components (`MBTQDevGenerator`) are recreated on every text input stroke.
**Action:** Apply `React.memo` to pure presentational or independently-stateful background components to prevent unnecessary React render cycles when the parent state updates, and move static arrays out of components.
## 2025-02-20 - React Memoization on Large Static Components
**Learning:** Found complex, stateful components without props (e.g., `MBTQDevGenerator`) being unnecessarily re-rendered by top-level state changes (like theme toggles) because they lacked memoization.
**Action:** Apply `React.memo` to large, self-contained components that do not rely on props to prevent performance hits when unrelated parent state changes.
