# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint             # Check linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format all files

# Database
docker compose up -d  # Start PostgreSQL
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio web UI
```

## Architecture

### Data Flow Pattern

```
Route (loader) → Server Function → Database
     ↓
Component → Query Hook → Server Function → Database
     ↓
Mutation Hook → Server Function → Database → Invalidate Queries
```

### Key Directories

- `src/server/functions/` - Server functions with `createServerFn`, includes Zod schemas
- `src/endpoints/` - TanStack Query hooks wrapping server functions (query keys, options, mutations)
- `src/features/` - Feature modules with domain components
- `src/components/ui/` - shadcn/ui base components
- `src/db/` - Drizzle schema and connection

### Server Function Pattern

```typescript
// src/server/functions/[feature]/schema.ts - Zod schemas
// src/server/functions/[feature]/index.ts - Server functions
export const createTodoFn = createServerFn({ method: 'POST' })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => { ... })
```

### Query Hook Pattern

```typescript
// src/endpoints/[feature].ts
const todoKeys = { all: (opts?) => ['todos', opts], detail: (id) => ['todos', id] }
export const todosQueryOptions = (opts?) => queryOptions({ queryKey: todoKeys.all(opts), queryFn: () => getTodosFn() })
export function useTodos(opts?) { return useSuspenseQuery(todosQueryOptions(opts)) }
export function useCreateTodo() { return useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }) }) }
```

## Tech Stack

- TanStack Start (React 19) + Router + Query
- Drizzle ORM with PostgreSQL
- Tailwind CSS v4 + shadcn/ui
- Zod for validation
- Vitest for testing

## Code Style

- No comments unless absolutely necessary
- Files/folders: `kebab-case`, Components: `PascalCase`, Functions: `camelCase`, Constants: `UPPER_SNAKE_CASE`
- Use `@/` path alias, avoid deep relative imports
- Arrays: `items`, `statusList`; Objects: `actionMap`, `nameDict`
- Avoid switch statements → use object maps
- Use early return pattern
- Batch operations: `Promise.allSettled()`

## Commit Convention

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

Scope from folder: `components`, `hooks`, `server`, `db`, `endpoints`, `features`

## Schema Architecture

Two-layer schema design:

1. **DB Schema** (`src/db/schema.ts`) - Table definitions with Drizzle ORM
2. **App Schema** (`src/server/functions/*/schema.ts`) - API input/output validation with Zod, shared by client and server

When adding a new API endpoint:

- If the table doesn't exist → define DB schema first
- If the table exists → define App schema directly

App schema differs from DB schema because API requests rarely require all table columns.

## Verification Rule

When adding new rules or logic to this project, create quiz questions to verify understanding before accepting changes.

Quiz guidelines:

- Questions must be semantically clear (specify: server/client, new feature/existing feature, etc.)
- Allow the user to ask clarifying questions about the quiz before answering
- Mix question types: multiple choice AND short answer/essay questions
- Only accept changes after the user demonstrates understanding
- Skip quiz with: `quiz -f --skip` (for urgent situations)
