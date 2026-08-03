# DeafAUTH

**DeafAUTH** is the sign language video authentication service in the MBTQ ecosystem.

## What it does

- Authenticates users via sign language video
- Integrates with PinkFlow for orchestration
- Works with Developer-Magician for accessibility validation of auth flows
- Replaces or augments traditional password-based auth for Deaf users

## Integration with MBTQ.dev

The Cloudflare Workers edge layer includes a quick token-format validator:

```bash
curl -X POST https://mbtq-workers.workers.dev/quick/deafauth/validate-token-format \
  -H "Content-Type: application/json" \
  -d '{"token": "your-deafauth-token"}'
```

This checks the token format at the edge before sending to the full DeafAUTH service.

## Auth flow accessibility

Developer-Magician validates DeafAUTH flows to ensure:
- Sign language videos are visible and accessible
- No audio-only prompts in the auth journey
- Visual feedback replaces all audio cues
- Full keyboard and assistive technology compatibility

## Planned extension

```typescript
import '@mbtq.dev/deafauth'
```

A future `@mbtq.dev/deafauth` npm package will provide drop-in React components for sign language video authentication.
