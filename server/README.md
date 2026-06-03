# FEATURED: Content Fulfillment API

Backend API for managing video requests and creator fulfillment between `videos.mbtq.dev` (request platform) and `creators.pinksync.io` (creator workspace).

## Features

- ✅ **RESTful API** - TypeScript-based Express API
- ✅ **Database Integration** - PostgreSQL with Prisma ORM
- ✅ **Authentication** - API key-based authentication
- ✅ **Webhooks** - Dynamic webhook registration and delivery
- ✅ **Real-time Sync** - Socket.IO for real-time updates
- ✅ **Creator Matching** - Stored function for auto-matching creators
- ✅ **OpenAPI Documentation** - Complete API specifications

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **API Docs**: OpenAPI 3.0

## Database Schema

### Tables

- `companies` - Corporate clients
- `creators` - Video creators
- `requests` - Video requests
- `bids` - Creator bids on requests
- `projects` - Fulfillment projects
- `request_status_logs` - Audit trail
- `webhook_events` - Webhook delivery log

### Stored Functions

- `find_matching_creators(service_type, required_skills)` - Auto-match verified creators to requests

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Edit `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mbtq_dev?schema=public"
PORT=4000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables and stored function)
npm run prisma:migrate
```

### 4. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run serve
```

The server will start on `http://localhost:4000`

## API Endpoints

### Requests API (Client/Corporate)

- `POST /api/requests` - Create video request
- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get request details
- `PATCH /api/requests/:id/status` - Update status
- `POST /api/requests/:id/accept-bid` - Accept creator bid

### Webhooks API

- `POST /api/webhooks/register` - Register webhook URL
- `DELETE /api/webhooks/register` - Remove webhook
- `GET /api/webhooks/events` - List webhook events
- `POST /api/webhooks/test` - Test webhook delivery

### Creators API

- `GET /api/creators/requests/available` - List open requests
- `POST /api/creators/bids` - Submit bid
- `POST /api/creators/projects/:id/submit` - Submit completed work
- `GET /api/creators/match/:requestId` - Find matching creators

## Authentication

All client endpoints require API key authentication via `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key-here" \
  http://localhost:4000/api/requests
```

## Webhook Events

The system sends webhooks for the following events:

- `request.status_changed` - When request status changes
- `project.completed` - When creator submits completed work
- `webhook.test` - Test event

Webhook payload format:

```json
{
  "event": "request.status_changed",
  "data": {
    "requestId": "...",
    "title": "...",
    "oldStatus": "PENDING",
    "newStatus": "COMPLETED",
    "project": {
      "id": "...",
      "creatorName": "...",
      "deliverableUrl": "..."
    }
  },
  "timestamp": "2025-12-05T04:45:45.703Z"
}
```

## Example Usage

### Create a Request

```bash
curl -X POST http://localhost:4000/api/requests \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "title": "ASL Video for Product Launch",
    "description": "Need ASL interpretation for 5-minute product video",
    "requirements": {
      "skills": ["ASL", "video-editing"],
      "quality": "professional"
    },
    "serviceType": "sign-language",
    "budget": 500,
    "deadline": "2025-12-31T23:59:59Z"
  }'
```

### Register Webhook

```bash
curl -X POST http://localhost:4000/api/webhooks/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "webhookUrl": "https://videos.mbtq.dev/webhooks/notify"
  }'
```

### Creator Submits Bid

```bash
curl -X POST http://localhost:4000/api/creators/bids \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "req_123",
    "creatorId": "creator_456",
    "amount": 450,
    "proposal": "I can deliver high-quality ASL interpretation...",
    "estimatedDays": 7
  }'
```

## OpenAPI Documentation

View complete API documentation in `openapi.yaml`.

You can visualize it using:
- [Swagger Editor](https://editor.swagger.io/)
- [Redoc](https://github.com/Redocly/redoc)
- [Postman](https://www.postman.com/)

## Development

### TypeScript Compilation

```bash
npm run build
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (caution!)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

## Project Structure

```
server/
├── src/
│   ├── middleware/
│   │   └── auth.ts           # API key authentication
│   ├── routes/
│   │   ├── requests.routes.ts   # Client endpoints
│   │   ├── webhooks.routes.ts   # Webhook management
│   │   └── creators.routes.ts   # Creator endpoints
│   ├── services/
│   │   └── webhook.service.ts   # Webhook delivery
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── index.ts                 # Main server
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # SQL migrations
├── openapi.yaml                 # API documentation
├── tsconfig.json                # TypeScript config
└── package.json
```

## Security Features

- ✅ API key authentication
- ✅ Company-scoped data access
- ✅ SQL injection prevention (Prisma)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Rate limiting ready

## Deployment

### Environment Variables

Set these in production:

```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
```

### Build and Deploy

```bash
npm run build
npm run serve
```

## License

Open source. Part of the mbtq.dev community platform.

---

**Built with 💖 by the LGBTQ+ and Deaf communities**
