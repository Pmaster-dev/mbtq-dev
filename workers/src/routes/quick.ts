import { Hono } from 'hono'
import type { Env } from '../index'

// Quick Functions — ultra-low latency, no external I/O, run purely at the edge
export const quickRouter = new Hono<{ Bindings: Env }>()

// Fibonrose complexity calculator (pure CPU, no I/O)
quickRouter.post('/fibonrose/complexity', async (c) => {
  const { taskSize } = await c.req.json<{ taskSize: number }>()

  if (typeof taskSize !== 'number' || taskSize < 0) {
    return c.json({ error: 'taskSize must be a non-negative number' }, 400)
  }

  const fib = (n: number): number => {
    if (n <= 1) return n
    let a = 0, b = 1
    for (let i = 2; i <= n; i++) {
      ;[a, b] = [b, a + b]
    }
    return b
  }

  const level = Math.min(Math.floor(taskSize), 12)
  const checkpoints = fib(level + 1)

  return c.json({
    taskSize,
    complexityLevel: level,
    checkpoints,
    description: getComplexityDescription(level),
  })
})

function getComplexityDescription(level: number): string {
  const map: Record<number, string> = {
    0: 'Trivial — fix typo, update docs',
    1: 'Minimal — small config change',
    2: 'Simple — add component prop',
    3: 'Moderate — create UI component',
    4: 'Standard — implement feature with tests',
    5: 'Complex — build complete feature',
    6: 'Large — major architectural changes',
  }
  return map[level] ?? 'Epic — multi-system coordination required'
}

// DeafAUTH token format validator (pure edge logic)
quickRouter.post('/deafauth/validate-token-format', async (c) => {
  const { token } = await c.req.json<{ token?: string }>()

  if (!token) {
    return c.json({ valid: false, reason: 'token is required' }, 400)
  }

  // Basic format validation only — full validation requires DeafAUTH service
  const isValidFormat = /^[A-Za-z0-9\-._~+/]+=*$/.test(token) && token.length >= 32

  return c.json({
    valid: isValidFormat,
    reason: isValidFormat ? 'format ok — submit to DeafAUTH for full validation' : 'invalid token format',
  })
})

// Accessibility score calculator (WCAG quick check heuristics)
quickRouter.post('/a11y/quick-score', async (c) => {
  const { checks } = await c.req.json<{
    checks: { name: string; passed: boolean }[]
  }>()

  if (!Array.isArray(checks) || checks.length === 0) {
    return c.json({ error: 'checks array is required' }, 400)
  }

  const passed = checks.filter((c) => c.passed).length
  const score = Math.round((passed / checks.length) * 100)
  const level = score >= 90 ? 'AAA' : score >= 75 ? 'AA' : score >= 50 ? 'A' : 'fail'

  return c.json({
    score,
    wcagLevel: level,
    passed,
    total: checks.length,
    failed: checks.filter((c) => !c.passed).map((c) => c.name),
  })
})
