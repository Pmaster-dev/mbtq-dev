## 2024-05-24 - Interactive List Items
**Learning:** Found an accessibility issue pattern where `<li>` elements had `onClick` handlers. These are not inherently keyboard focusable or operable by screen readers.
**Action:** When creating interactive lists, wrap the content in semantic `<button>` tags within the `<li>`. Use `w-full text-left` to maintain the block layout, add focus styles (`focus:outline-none focus-visible:ring-x`), and include appropriate ARIA attributes like `aria-expanded`.

## 2025-02-14 - Explicit Form Labels & Required State Feedback
**Learning:** Encountered an accessibility issue where inputs lacked explicitly associated labels (missing `htmlFor` and `id` pair), depriving screen readers of their accessible names. Also noticed a UX pattern where submit buttons were disabled based on required input, but with no inline feedback provided explaining the required state.
**Action:** Always use explicit `htmlFor` attributes on labels targeting input `id`s. Add screen-reader-only text (e.g. `(Required)`) for mandatory fields, and use `aria-live` regions or inline helpers to explain exactly why a form is not ready to submit.

## 2025-04-08 - Accessible Dynamic Scrollable Regions
**Learning:** When creating dynamically updating scrollable regions (like activity logs), they are often invisible to screen reader users and keyboard navigators. They require a specific combination of attributes (`tabIndex={0}`, `role="region"`, `aria-labelledby`, and visible focus rings) to be discoverable, and `aria-live="polite"` to read out new items naturally. Empty states are also critical for providing context before any dynamic content arrives.
**Action:** Always apply the full accessibility suite (`tabIndex`, `role`, `aria-labelledby`, `focus-visible:ring`, and `aria-live`) to dynamically populating scrollable list containers. Include empty states to prevent confusion for both visual and non-visual users.
## 2024-05-18 - Keyboard Accessibility in A11y Controls
**Learning:** The `A11yBar` component, while providing accessibility features, lacked proper keyboard focus indicators and `aria-pressed` state for toggle buttons, which is ironic for an accessibility control panel.
**Action:** Ensure all interactive elements, especially those in custom control bars, have clear `focus-visible` styles and semantic ARIA states like `aria-pressed` for toggles.

## 2024-04-25 - Add Keyboard Focus & ARIA to Custom Toggle Groups
**Learning:** Custom UI toggle groups built with generic HTML elements lack inherent grouping and focus visibility, breaking keyboard navigation and screen reader context.
**Action:** Always wrap custom button groups in a `role="group"` with an `aria-labelledby` referencing the section title. Add `aria-pressed` to individual toggle buttons and explicit `focus-visible` ring utilities to ensure accessible keyboard navigation.

## 2024-05-18 - High Contrast Focus Styles on Custom Navigation Components
**Learning:** Custom tab and select elements styled with default `focus:outline-*` can fail to meet accessibility requirements if the color contrast is too low against the background (e.g., `outline-fuchsia-700` against dark or varied backgrounds). Default outlines also don't offset enough to be prominent.
**Action:** Always prefer `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color]-400 focus-visible:ring-offset-2` for prominent interactive components (like custom tabs or action bars) to ensure clear, high-contrast visual focus indicators for keyboard navigation.
## 2024-04-29 - [Async Button Loading State]
**Learning:** Dynamic imports for tools like axe-core can cause noticeable lag on slower connections. Users need immediate visual feedback when an action is triggered, even if the primary operation is async module loading.
**Action:** Added an explicitly handled `isChecking` boolean state to render a disabled loading spinner on the button with `aria-busy="true"` and `cursor-wait` to communicate background work cleanly.

## 2025-05-24 - Explicit Form Labels & ARIA
**Learning:** In React components like widgets that lack explicit form containers, standard form controls often miss explicit labels which negatively impacts screen reader reliability, relying instead on nested `<label>` or `aria-label` incorrectly.
**Action:** Ensure inputs have explicit `id`s and `htmlFor` attributes pointing to their corresponding `<label>` element. Add keyboard focus styling explicitly via classes.
## 2024-05-10 - Add prominent focus visible rings
**Learning:** Default Tailwind `focus:outline-*` properties provide insufficient visual contrast for keyboard navigation on colorful gradients. Using `focus-visible:ring-*` with `ring-offset` provides a much clearer, high-contrast indicator for accessibility.
**Action:** Always prefer `focus-visible:ring-4 focus-visible:ring-[color]-400` with offsets over default outlines for interactive elements, especially on layered or gradient backgrounds.

## 2025-05-24 - High-Contrast Focus Rings for Keyboard Accessibility
**Learning:** Found instances where custom interactive UI elements, especially those overriding default outline styles, used low-contrast or hard-to-see `focus:outline-*` properties, or had poor default browser focus styles.
**Action:** When creating custom interactive UI elements, always provide prominent, high-contrast visual focus indicators using Tailwind's `focus-visible:ring-*` utilities (e.g., `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color]-400 focus-visible:ring-offset-2`).

## 2024-05-25 - Focus Visible Rings on Icon-Only Buttons
**Learning:** Encountered an accessibility issue where icon-only buttons (like the `×` dismiss button in `VisualNotificationSystem`) lacked ANY keyboard focus indicator. While the visual design didn't originally include a focus state, it is critically important for keyboard users to know where their focus lies.
**Action:** Always provide explicit, high-contrast visual focus indicators using Tailwind's `focus-visible:ring-*` utilities for all interactive UI elements, especially icon-only buttons. Add `focus-visible:outline-none` and `focus-visible:ring-4 focus-visible:ring-white/50` or similar for clear focus visibility against varied colored backgrounds.
## 2025-05-24 - Inline Clear Actions for Textareas
**Learning:** Generative AI forms often require users to input very long prompts. Providing no quick way to clear the text forces users to manually select all text to delete it, degrading the UX. Additionally, found that standard dismiss/close buttons (like an "×" icon) in custom notification systems often lack keyboard focus rings.
**Action:** Always include an inline "Clear" action (e.g., a button inside or next to the textarea) for generative AI inputs to improve the editing flow. Always ensure custom dismiss buttons have explicit `focus-visible:ring` styles to guarantee keyboard navigation accessibility.

## 2025-05-24 - Tooltips for Disabled States
**Learning:** Using the native `disabled` attribute removes interactive elements from the tab sequence. Screen reader users tab right past them and miss the context entirely, creating confusion.
**Action:** Instead of `disabled`, use `aria-disabled="true"`, prevent the click action in the handler, retain keyboard focusability, and add a tooltip or `aria-live` region explaining exactly *why* the action is disabled.
## 2025-02-14 - Use aria-disabled with prop guard instead of native disabled
**Learning:** Using the native `disabled` attribute on interactive elements (like buttons) completely removes them from the keyboard tab sequence. This means screen reader users and keyboard navigators can't access them to trigger tooltips or read their state when they are temporarily disabled (e.g., during a loading or checking state).
**Action:** When a button's state needs to be communicated while it's temporarily disabled, use `aria-disabled="true"` coupled with a conditional prop guard on `onClick` (e.g. `onClick={isChecking ? undefined : handler}`) instead of `disabled={true}`. Wrap the button in a `group` and provide a tooltip (using `group-hover` and `group-focus-within`) that explains the state.

## 2025-05-18 - Missing Loading State in Async Destination Areas
**Learning:** In highly dynamic layout components (like `MBTQDevGenerator.tsx`) that trigger async operations which eventually populate a distinct, large empty "destination" area on the screen, just adding a loading spinner to the trigger button is insufficient UX. Users expect immediate visual feedback within the destination area itself (e.g., using `role="status"` and `aria-live="polite"`), otherwise the app appears broken or stalled while waiting for the operation to complete.
**Action:** When auditing or implementing async data fetch/generation features that target a specific layout container, always implement a dedicated skeleton or loading text placeholder directly inside that target container.
## 2025-05-24 - Keyboard Shortcut Hints for Form Submission
**Learning:** Found that long textareas (like for generative AI prompts) often force keyboard users to tab out to find the submit button, which can be frustrating. Adding a keyboard shortcut like Cmd/Ctrl + Enter is standard, but if it is not visible, users won't know it exists.
**Action:** When adding keyboard shortcuts for primary actions (like form submission), always include a visual hint (e.g., `(⌘/Ctrl + Enter)`) in the submit button or nearby, and make sure to use `aria-hidden="true"` so screen readers don't read out the exact keystrokes redundantly if not necessary, but keep it visible for power users.
