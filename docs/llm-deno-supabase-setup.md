# 🤖 Generative AI & Supabase Integration Guide

### Setting Up Your Supabase Backend

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com) and create a free account
   - Create a new project and note your project URL and anon key

2. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Initialize Supabase in Your App**
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

4. **Add Environment Variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SOCKET_SERVER_URL=http://localhost:4000
   ```

### Key Supabase Features

#### Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

#### Database Operations
```typescript
// Insert data
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', email: 'john@example.com' })

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'john@example.com')

// Update data
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', userId)

// Delete data
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

#### Real-time Subscriptions
```typescript
// Subscribe to changes
const channel = supabase
  .channel('public:posts')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// Unsubscribe when done
supabase.removeChannel(channel)
```

#### Storage
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar.png', file)

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('public/avatar.png')
```

### Integrating Generative AI

For complete AI integration patterns with Deno Edge Functions and multiple LLM providers, see our comprehensive guide:

📖 **[LLM + Deno + Supabase Architecture Guide](../llm-deno-supabase.md)**

This guide covers:
- Multi-model AI routing (GPT-4, Claude, Gemini)
- Cost optimization strategies
- Edge function deployment
- Real-time AI streaming
- Security and guardrails
- Production-grade patterns

### Finding and Using APIs

1. **API Discovery Resources**
   - [RapidAPI](https://rapidapi.com) - Marketplace of APIs
   - [Postman Public API Network](https://www.postman.com/explore) - API discovery
   - [Public APIs](https://github.com/public-apis/public-apis) - Curated list

2. **Integration Pattern**
   ```typescript
   // Example: Weather API integration
   async function getWeather(city: string) {
     const response = await fetch(
       `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
     )
     return response.json()
   }
   ```

3. **Best Practices**
   - Always store API keys in environment variables
   - Use server-side endpoints to protect keys
   - Implement rate limiting and caching
   - Handle errors gracefully
   - Read API documentation thoroughly

### Building Full-Stack Apps with MBTQ.dev

1. **Frontend**: Use our React templates or migrate to Next.js
2. **Backend**: Supabase for database, auth, and storage
3. **APIs**: Integrate third-party services as needed
4. **AI Features**: Use Supabase Edge Functions with LLM APIs
5. **Deployment**: Vercel/Netlify for frontend, Supabase handles backend
