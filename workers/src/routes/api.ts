import { Hono } from 'hono'
import type { Env } from '../index'

export const apiRouter = new Hono<{ Bindings: Env }>()

// Ecosystem status endpoint
apiRouter.get('/ecosystem', (c) => {
  return c.json({
    platform: 'MBTQ.dev',
    version: '2.0.0',
    ecosystem: [
      { name: 'Developer-Magician', status: 'active', role: 'Accessibility validator' },
      { name: 'Business-Magician', status: 'active', role: 'Business AI platform' },
      { name: 'PinkFlow', status: 'active', role: 'Test automation & orchestration' },
      { name: 'DeafAUTH', status: 'active', role: 'Sign language authentication' },
      { name: 'Fibonrose', status: 'active', role: 'Task validation system' },
      { name: 'PinkSync', status: 'active', role: 'Real-time collaboration' },
    ],
  })
})

// AI routing info
apiRouter.get('/ai/providers', (c) => {
  return c.json({
    providers: [
      { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
      { id: 'anthropic', name: 'Anthropic Claude', models: ['claude-3-5-sonnet', 'claude-3-haiku'] },
      { id: 'google', name: 'Google Gemini', models: ['gemini-1.5-pro', 'gemini-1.5-flash'] },
      { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat'] },
      { id: 'mistral', name: 'Mistral', models: ['mistral-large', 'mistral-small'] },
    ],
    routing: 'cost-optimized',
    features: ['streaming', 'tool-calling', 'memory', 'accessibility-validation'],
  })
})

// Accessibility validation proxy (quick check at the edge)
apiRouter.post('/a11y/validate', async (c) => {
  const body = await c.req.json<{ url?: string; component?: string }>()

  if (!body.url && !body.component) {
    return c.json({ error: 'url or component is required' }, 400)
  }

  // Edge-level quick validation — full validation routes to Developer-Magician
  return c.json({
    status: 'queued',
    message: 'Full validation routed to Developer-Magician service',
    target: body.url ?? body.component,
    endpoint: 'https://api.developer-magician.dev/api/py/deafauth-validate',
  })
})
