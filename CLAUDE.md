# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is currently a **frontend-only** project: data lives in-memory and is served through TanStack Query, because there's no backend scenario yet. Server functions / ORMs / databases aren't banned — they're just out of scope today. If a change adds one, flag it for confirmation ("是刻意要接後端嗎？") rather than rejecting it.

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm test             # Run tests (vitest)
pnpm lint             # Check linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format all files (prettier)
pnpm storybook        # Start Storybook (port 6006)
```

## Architecture

### Data Flow Pattern

Data is held in-memory (module-level state inside each feature's hooks) and exposed through TanStack Query.

```
Route (loader / component) → Query Hook → in-memory store
     ↓
Mutation Hook → update in-memory store → invalidate queries
```

### Key Directories

- `src/routes/` - File-based routes (TanStack Router): `__root.tsx`, `index.tsx`, `todo/index.tsx`
- `src/features/[feature]/` - Feature module: `index.tsx`, `types.ts`, `components/`, `hooks/`
- `src/components/ui/` - shadcn/ui base components (new-york style)
- `src/components/shared/` - Cross-feature components (ErrorBoundary, NotFound)
- `src/components/theme/` - Theme provider + toggle
- `src/hooks/` - Shared hooks (breakpoints, media-query, theme)
- `src/lib/utils.ts` - Utilities (`cn`, etc.)
- `src/integrations/tanstack-query/` - Query client provider + devtools

### Query Hook Pattern

Each feature owns its data and query hooks in `src/features/[feature]/hooks/index.ts`. Data is module-level state — no fetch, no server.

```typescript
// src/features/todo/hooks/index.ts
let todos: Array<Todo> = []

export const todoKeys = {
  all: (options?: TodosOptions) => ['todos', options] as const,
  detail: (id: number) => ['todos', id] as const,
}

export const todosQueryOptions = (options?: TodosOptions) =>
  queryOptions({ queryKey: todoKeys.all(options), queryFn: () => todos })

export function useTodos(options?: TodosOptions) {
  return useSuspenseQuery(todosQueryOptions(options))
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => {
      todos = [...todos /* ... */]
      return newTodo
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}
```

Domain types live in `src/features/[feature]/types.ts`.

## Tech Stack

- TanStack Start (React 19) + Router + Query
- Tailwind CSS v4 (CSS-based config in `src/styles.css`) + shadcn/ui (new-york)
- Vitest + Testing Library for testing
- Storybook for component development

Installed but not yet used: `zustand` (client state), `zod` (validation). Wire them in when a real need shows up — don't add usage for its own sake.

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

Scope from folder: `components`, `hooks`, `features`, `lib`, `routes`, `integrations`

## Verification Rule

When adding new rules or logic to this project, create quiz questions to verify understanding before accepting changes.

Quiz guidelines:

- Questions must be semantically clear (specify: new feature/existing feature, etc.)
- Allow the user to ask clarifying questions about the quiz before answering
- Mix question types: multiple choice AND short answer/essay questions
- Only accept changes after the user demonstrates understanding
- Skip quiz with: `quiz -f --skip` (for urgent situations)
