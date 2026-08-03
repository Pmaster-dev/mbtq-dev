# Quick Start

Get MBTQ.dev running locally in under 5 minutes.

## Prerequisites

- Node.js 20+ (`node -v`)
- npm or pnpm
- A [Supabase](https://supabase.com) account (free)

## 1. Clone

```bash
git clone https://github.com/Pmaster-dev/mbtq-dev.git
cd mbtq-dev
```

## 2. Install & configure

```bash
# Client
cd client && npm install

# Server
cd ../server && npm install && npm run prisma:generate

# Workers (optional — requires Cloudflare account)
cd ../workers && npm install
```

Copy the environment template:
```bash
cp .env.example .env
```

Fill in your Supabase URL and anon key in `.env`.

## 3. Start development servers

```bash
# Terminal 1 — backend
cd server && npm run dev       # http://localhost:4000

# Terminal 2 — frontend
cd client && npm run dev       # http://localhost:5173

# Terminal 3 — edge workers (optional)
cd workers && npm run dev      # http://localhost:8787
```

## 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173).

## Next steps

- [Supabase setup](./supabase.md)
- [AI integration](./llm-deno.md)
- [Cloudflare Workers](./cloudflare-workers.md)
- [Deployment](./deployment.md)
