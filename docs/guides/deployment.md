# Deployment Guide

## Production Environments

| Component | Platform | Trigger |
|---|---|---|
| Frontend | GitHub Pages | Push to `main` |
| Edge Workers | Cloudflare Workers | Push to `main` (workers/ changes) |
| Backend API | Self-hosted / Railway / Fly.io | Manual or CI |
| Database | Supabase (managed) | Always on |

## GitHub Pages (Frontend)

Automatic deployment via `deno.yml` workflow on push to `main`.

Manual:
```bash
cd client
npm run build
# Output in client/dist/
```

## Cloudflare Workers (Edge)

```bash
cd workers
npm run deploy
```

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as environment variables or GitHub secrets.

See [Cloudflare Workers guide](./cloudflare-workers.md) for full details.

## Docker (Self-hosted)

```bash
# Build and start all services
docker-compose up --build -d

# Client only
docker build -t mbtq-client ./client

# Server only
docker build -t mbtq-server ./server
```

## Environment Variables

### Client (`.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SOCKET_SERVER_URL=https://your-server.example.com
```

### Server (`.env`)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
```

See `.env.example` and `.env.production.example` for full variable lists.
