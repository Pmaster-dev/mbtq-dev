import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { timing } from 'hono/timing'
import { apiRouter } from './routes/api'
import { quickRouter } from './routes/quick'

export interface Env {
  ENVIRONMENT: string
  // Add KV/DO bindings here when needed:
  // MBTQ_KV: KVNamespace
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', timing())
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['https://mbtq.dev', 'https://www.mbtq.dev'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposeHeaders: ['X-Request-Id'],
    maxAge: 86400,
  })
)
app.use('*', prettyJSON())

// Health check (quick function — no external I/O)
app.get('/', (c) => {
  return c.json({
    service: 'mbtq-workers',
    status: 'ok',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', uptime: Date.now() })
})

// Mount routers
app.route('/api', apiRouter)
app.route('/quick', quickRouter)

// 404 fallback
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err)
  return c.json(
    { error: 'Internal server error', message: err.message },
    500
  )
})

export default app
