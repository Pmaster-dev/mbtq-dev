# 🔌 Backend Connector Guide for MBTQ.dev

## Complete Guide to Connecting Your Frontend to Supabase and APIs

This guide will teach you how to integrate your MBTQ.dev application with Supabase and other third-party APIs to create full-stack applications.

---

## 📚 Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Authentication](#authentication)
3. [Database Operations](#database-operations)
4. [Real-time Features](#real-time-features)
5. [File Storage](#file-storage)
6. [Edge Functions (Serverless)](#edge-functions)
7. [API Integration Guide](#api-integration-guide)
8. [Security Best Practices](#security-best-practices)

---

## 🚀 Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - Project name (e.g., "mbtq-dev-app")
   - Database password (save this securely!)
   - Region (choose closest to your users)
5. Wait for project to be created (~2 minutes)

### Step 2: Get Your Project Credentials

In your Supabase dashboard:
1. Go to **Settings** > **API**
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (safe to use in frontend)

### Step 3: Install Supabase Client

```bash
cd client
npm install @supabase/supabase-js
```

### Step 4: Configure Environment Variables

Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SOCKET_SERVER_URL=http://localhost:4000
```

### Step 5: Initialize Supabase Client

Create `client/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 🔐 Authentication

### Sign Up New Users

```typescript
import { supabase } from './lib/supabase'

async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:5173/auth/callback',
    }
  })

  if (error) {
    console.error('Sign up error:', error.message)
    return null
  }

  return data.user
}
```

### Sign In Users

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Sign in error:', error.message)
    return null
  }

  return data.user
}
```

### Sign Out

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Sign out error:', error.message)
}
```

### Get Current User

```typescript
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### Listen to Auth State Changes

```typescript
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, signUp, signIn, signOut }
}
```

---

## 💾 Database Operations

### Create Tables in Supabase

1. Go to **Database** > **Tables** in your Supabase dashboard
2. Click "Create a new table"
3. Example table schema:

```sql
-- Create a profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Allow users to read all profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Allow users to update their own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### Insert Data

```typescript
async function createProfile(username: string, avatarUrl: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      username,
      avatar_url: avatarUrl,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error.message)
    return null
  }

  return data
}
```

### Query Data

```typescript
// Get all profiles
async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')

  if (error) {
    console.error('Error fetching profiles:', error.message)
    return []
  }

  return data
}

// Get single profile
async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error.message)
    return null
  }

  return data
}

// Complex query with filters
async function searchProfiles(searchTerm: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}
```

### Update Data

```typescript
async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error.message)
    return null
  }

  return data
}
```

### Delete Data

```typescript
async function deleteProfile(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting profile:', error.message)
    return false
  }

  return true
}
```

---

## 🔄 Real-time Features

### Subscribe to Table Changes

```typescript
import { useEffect, useState } from 'react'

function useRealtimeProfiles() {
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    // Initial fetch
    fetchProfiles()

    // Set up real-time subscription
    const channel = supabase
      .channel('profiles-channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Change received!', payload)

          if (payload.eventType === 'INSERT') {
            setProfiles((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setProfiles((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setProfiles((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*')
    setProfiles(data || [])
  }

  return profiles
}
```

### Broadcast Messages (Real-time Chat)

```typescript
// Send a message
function sendMessage(channel: any, message: string) {
  channel.send({
    type: 'broadcast',
    event: 'message',
    payload: { text: message },
  })
}

// Listen for messages
const channel = supabase.channel('room1')
channel
  .on('broadcast', { event: 'message' }, (payload) => {
    console.log('Message received:', payload)
  })
  .subscribe()
```

---

## 📁 File Storage

### Upload Files

```typescript
async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading file:', error.message)
    return null
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
```

### Download Files

```typescript
async function downloadFile(path: string) {
  const { data, error } = await supabase.storage
    .from('avatars')
    .download(path)

  if (error) {
    console.error('Error downloading file:', error.message)
    return null
  }

  return data
}
```

### Delete Files

```typescript
async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('avatars')
    .remove([path])

  if (error) {
    console.error('Error deleting file:', error.message)
    return false
  }

  return true
}
```

---

## ⚡ Secure Backend Endpoints

Use a trusted backend endpoint or service layer to call external APIs securely and keep secrets off the client.

### Create a Backend Endpoint

```bash
# Install Supabase CLI
npm install -g supabase

# Add the Supabase client to your backend
npm install @supabase/supabase-js
```

### Example Backend Handler

`server/src/routes/hello-world.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export async function createGreeting(req: Request) {
  try {
    // Get Supabase client with service role (has elevated permissions)
    const supabaseClient = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    const { name } = await req.json()

    const { data, error } = await supabaseClient
      .from('greetings')
      .insert({ name })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ message: `Hello ${name}!`, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

### Call Backend Endpoint from Frontend

```typescript
async function callBackendEndpoint(name: string) {
  const response = await fetch('/api/hello-world', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })

  if (!response.ok) {
    console.error('Error calling endpoint')
    return null
  }

  return response.json()
}
```

---

## 🌐 API Integration Guide

### Finding APIs

1. **API Marketplaces**
   - [RapidAPI](https://rapidapi.com) - Thousands of APIs
   - [Postman API Network](https://www.postman.com/explore)
   - [APIs.guru](https://apis.guru) - OpenAPI directory

2. **Popular API Categories**
   - Weather: OpenWeatherMap, WeatherAPI
   - Maps: Google Maps, Mapbox
   - Payment: Stripe, PayPal
   - Email: SendGrid, Mailgun
   - AI: OpenAI, Anthropic, Google AI

### Making API Calls

```typescript
// Example: Weather API
async function getWeather(city: string) {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}
```

### Using Backend Endpoints for API Calls (Recommended)

**Why?** Keeps API keys secure on the server side.

`server/src/routes/fetch-weather.ts`:

```typescript
export async function fetchWeather(req: Request) {
  const { city } = await req.json()
  const API_KEY = process.env.WEATHER_API_KEY

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  )

  const data = await response.json()

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

Call from frontend:

```typescript
async function getWeather(city: string) {
  const response = await fetch('/api/fetch-weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  })

  return response.json()
}
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

Never commit API keys to Git:

```env
# .env (add to .gitignore)
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
# Never expose service role key in frontend!
```

### 2. Row Level Security (RLS)

Always enable RLS on Supabase tables:

```sql
-- Enable RLS
alter table profiles enable row level security;

-- Example policies
create policy "Users can read all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

### 3. Input Validation

```typescript
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
```

### 4. Error Handling

```typescript
async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall()
  } catch (error) {
    console.error('API call failed:', error)
    // Log to error tracking service (e.g., Sentry)
    return null
  }
}
```

### 5. Rate Limiting

Use your backend endpoint or API gateway with rate limiting:

```typescript
const rateLimitMap = new Map<string, number>()

export async function rateLimitedHandler(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const lastRequest = rateLimitMap.get(ip) || 0

  // Allow 1 request per second
  if (now - lastRequest < 1000) {
    return new Response('Too many requests', { status: 429 })
  }

  rateLimitMap.set(ip, now)

  // Your function logic here
  return new Response('OK')
}
```

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

## 💬 Need Help?

- [MBTQ.dev GitHub Discussions](https://github.com/pinkycollie/mbtq-dev/discussions)
- [Supabase Discord](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

**MBTQ.dev © 2025 | Community. Culture. Power. 💜**
