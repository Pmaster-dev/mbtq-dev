## 2024-05-18 - Avoid aria-live on interactive triggers
**Learning:** `aria-live` should be placed on a container element that exists in the DOM before the dynamic content is added or changed, rather than on the interactive element (like a button) that triggers the change. Screen readers monitor the `aria-live` region for changes, so if the region itself is added dynamically or if the attribute is on the trigger, the new content may not be announced correctly.
**Action:** Always wrap dynamic text or status updates in a dedicated `div` or `span` with `aria-live="polite"` (and often `aria-atomic="true"`) that is always present in the DOM, separate from the button that causes the update.

## 2024-05-20 - Adding focus states on gradients
**Learning:** Adding standard `focus-visible:ring` to buttons with background gradients can look muddy if the ring color clashes or isn't specifically tailored. `focus-visible:ring-offset` with the background container color makes it pop.
**Action:** When adding focus rings to gradient elements, ensure there is a `focus-visible:ring-offset-*` class that matches the background color and specifically target the `focus-visible:ring-*` to one of the gradient's base colors to harmonize with the theme.
