# Fibonrose

**Fibonrose** is the evidence-based task validation system built into MBTQ.dev.

## How it works

Tasks are assigned a complexity level (0–9+). The number of required confirmations follows the Fibonacci sequence, ensuring progressively more evidence as tasks grow in scope.

| Complexity | Confirmations | Example |
|---|---|---|
| 0–1 | 1 | Fix typo, update docs |
| 2 | 2 | Add component prop |
| 3 | 3 | Create UI component |
| 4 | 5 | Implement feature with tests |
| 5 | 8 | Build complete feature |
| 6+ | 13+ | Major architectural changes |

## Usage in GitHub issues

1. Create an issue with the `fibonrose` label
2. The issue body includes a `Fibonrose Confirmation Checklist`
3. As you complete milestones, comment: `Confirm checkpoint 1: [evidence]`
4. The `fibonrose-validator.yml` workflow updates the checklist automatically
5. When all checkpoints are confirmed, the `fibonrose:completed` label is added

## Quick function (edge)

The Cloudflare Workers edge layer exposes a quick function for calculating complexity:

```bash
curl -X POST https://mbtq-workers.workers.dev/quick/fibonrose/complexity \
  -H "Content-Type: application/json" \
  -d '{"taskSize": 5}'
```

Returns:
```json
{
  "taskSize": 5,
  "complexityLevel": 5,
  "checkpoints": 8,
  "description": "Complex — build complete feature"
}
```
