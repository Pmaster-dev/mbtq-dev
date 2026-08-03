# Supabase Integration Guide

Supabase provides MBTQ.dev with database, auth, storage, and edge functions.

## Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Add to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Initialize the client

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## Authentication

```typescript
// Sign up
await supabase.auth.signUp({ email, password })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## Database

```typescript
// Insert
await supabase.from('posts').insert({ title, body })

// Query
const { data } = await supabase.from('posts').select('*').eq('author_id', user.id)

// Update
await supabase.from('posts').update({ title }).eq('id', postId)

// Delete
await supabase.from('posts').delete().eq('id', postId)
```

## Real-time

```typescript
const channel = supabase
  .channel('public:posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()

// Cleanup
supabase.removeChannel(channel)
```

## Storage

```typescript
// Upload
await supabase.storage.from('avatars').upload('public/avatar.png', file)

// Get URL
const { data } = supabase.storage.from('avatars').getPublicUrl('public/avatar.png')
```

## Edge Functions (AI / LLM)

See [LLM + Deno + Supabase guide](./llm-deno.md) for deploying AI functions as Supabase Edge Functions.
