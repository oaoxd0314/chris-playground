# Server Routes

Use `createFileRoute` with `server.handlers` (NOT `createAPIFileRoute`).

## Basic Pattern

```typescript
export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => new Response('Hello'),
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ received: body })
      },
    },
  },
})
```

## Catch-All (for auth handlers)

```typescript
// routes/api/auth/$.ts → /api/auth/*
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ params }) => new Response(params._splat), // path after /api/auth/
    },
  },
})
```

## With Middleware

```typescript
export const Route = createFileRoute('/api/protected')({
  server: {
    middleware: [authMiddleware],
    handlers: { GET: async () => Response.json({ ok: true }) },
  },
})
```

## Handler Context

- `request`: Request object
- `params`: Dynamic path params (`$id` → `params.id`, `$` → `params._splat`)
- `context`: From middleware
