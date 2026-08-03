# AI Routing Architecture

MBTQ.dev uses a multi-provider AI gateway rather than tying to a single model.

## Provider Registry

| Provider | Models | Strengths |
|---|---|---|
| OpenAI | GPT-4o, GPT-4o-mini | General purpose, function calling |
| Anthropic Claude | claude-3-5-sonnet, claude-3-haiku | Long context, reasoning |
| Google Gemini | gemini-1.5-pro, gemini-1.5-flash | Multimodal, speed |
| DeepSeek | deepseek-chat | Code, cost efficiency |
| Mistral | mistral-large, mistral-small | European data residency |
| Local LLMs | Ollama-compatible | Privacy, no egress cost |

## Routing Strategy

```
Request
  ↓
Classify intent (code / chat / accessibility / image)
  ↓
Select provider by: cost → latency → capability
  ↓
Stream response with tool-calling support
  ↓
Accessibility validation (if UI generation)
```

## Features

- **Streaming** — chunked SSE responses for all providers
- **Memory** — conversation context stored in Supabase
- **Tool calling** — structured function invocation
- **Accessibility validation** — AI-generated UI routes through Developer-Magician
- **Cost optimization** — route cheap tasks to smaller models automatically

## Implementation

AI calls are made via **Supabase Edge Functions (Deno)** to keep API keys server-side and leverage edge caching. See the full guide: [LLM + Deno + Supabase](../guides/llm-deno.md).
