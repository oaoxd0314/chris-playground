# Better-Auth + TanStack Start

## Auth Handler Route

**CRITICAL**: Use `createFileRoute` with `server.handlers`, NOT `createAPIFileRoute`.

```typescript
// src/routes/api/auth/$.ts
import { auth } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
```

## Auth Config

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"

export const auth = betterAuth({
  // ... database, providers
  plugins: [tanstackStartCookies()], // MUST be last
})
```

## Twitter/X with v2 API

```typescript
twitter: {
  clientId: process.env.TWITTER_CLIENT_ID || "",
  clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  version: "2.0",
  mapProfileToUser: (profile) => ({ username: profile.username }),
},
```

## Route Protection Middleware

```typescript
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

export const authMiddleware = createMiddleware().server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) throw redirect({ to: "/login" })
    return next()
  }
)

// Usage: server: { middleware: [authMiddleware] }
```

## Cloudflare Workers

With `compatibility_date >= 2025-04-01`, secrets are available via `process.env`.
