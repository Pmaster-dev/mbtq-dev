# LLM + Deno + Supabase Guide

For the complete AI integration patterns with Deno Edge Functions and multiple LLM providers, see the original guide:

📖 **[llm-deno-supabase.md](../../llm-deno-supabase.md)**

## Summary

MBTQ.dev uses Supabase Edge Functions (Deno runtime) to:
- Keep LLM API keys server-side
- Stream AI responses to the client
- Route between OpenAI, Claude, Gemini, and other providers
- Store conversation memory in Supabase Postgres

## Architecture

```
Client → Supabase Edge Function (Deno) → LLM Provider API
                ↓
        Supabase Postgres (conversation history)
```

## Provider routing

```typescript
// Supabase Edge Function — supabase/functions/ai-chat/index.ts
const provider = selectProvider(intent) // 'openai' | 'claude' | 'gemini'
const stream = await callProvider(provider, messages)
return streamResponse(stream)
```

See [AI Routing Architecture](../architecture/ai-routing.md) for the full provider registry and routing strategy.
