# Testing Guide

## Test Stack

| Layer | Tool | Location |
|---|---|---|
| Unit / Component | Vitest + React Testing Library | `client/src/components/__tests__/` |
| Accessibility | axe-core | `client/src/test/` |
| Fibonrose validation | GitHub Actions | `.github/workflows/fibonrose-validator.yml` |
| Security | CodeQL + npm audit | `.github/workflows/security.yml` |

## Run Tests

```bash
# Client tests
cd client
npm test             # run once
npm run test:watch   # watch mode
npm run test:coverage

# Server tests (if configured)
cd server
npm test
```

## Accessibility Testing

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

Also available in-browser: click the **A11y Check** button in the accessibility bar — results appear in the browser console.

## Fibonrose Task Validation

Tasks tracked with the Fibonrose system use evidence-based checkpoints:

```markdown
Confirm checkpoint 1: component created (commit: abc123)
Confirm checkpoint 2: tests passing (coverage: 95%)
```

The `fibonrose-validator.yml` workflow processes these confirmations automatically in GitHub issues.
