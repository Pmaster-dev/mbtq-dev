# Developer-Magician

**Developer-Magician** is MBTQ.dev's Deaf-first accessibility validation service.

- **Repository**: [github.com/pinkycollie/Developer-Magician](https://github.com/pinkycollie/Developer-Magician)
- **Stack**: FastAPI (Python) + Next.js frontend

## What it does

- Validates UIs for WCAG compliance beyond standard tooling
- ASL flow analysis — ensures sign-language-first UX paths work correctly
- Visual-first, audio-bypass validation
- Reports scores to Fibonrose task validation system
- Integrates with DeafAUTH for auth flow accessibility

## API Reference

Base path: `/api/py/`

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/py/health` | GET | Health check |
| `/api/py/ecosystem-status` | GET | MBTQ ecosystem status |
| `/api/py/deafauth-validate` | POST | Validate auth flow accessibility |
| `/api/py/fibonrose-report` | POST | Report scores to Fibonrose |
| `/api/py/ai-validate` | POST | AI-triggered validation |
| `/api/py/workflows/ci-cd-story` | GET | CI/CD as educational journey |

## Edge proxy

The Cloudflare Workers edge layer (`POST /api/a11y/validate`) proxies validation requests to Developer-Magician, providing CORS handling and rate limiting at the edge before reaching the FastAPI backend.
