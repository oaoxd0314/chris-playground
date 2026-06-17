# Pattern Detection and Skill Loading

Detailed rules for detecting code patterns and loading the corresponding skill or doc during review.

## Detection Strategy

**Scan these sources**:

1. File names and paths
2. Import statements
3. Function/hook calls
4. Type definitions

**Load immediately** when a pattern is detected — don't wait until later in the review.

> Note: this project has **skills** for tanstack-start, gen-unit-test, gen-storybook, and mobile-view, but form/list patterns live in **docs** only (`docs/pattern/`), and composition lives in `docs/04-component/`. Load the skill where one exists; otherwise Read the doc.

## TanStack Start / Query Pattern

### Triggers

**Code patterns**:

```typescript
queryOptions({ queryKey, queryFn })
useSuspenseQuery(...)
useQuery(...)
useMutation({ mutationFn, onSuccess })
queryClient.invalidateQueries(...)
createFileRoute('/...')
loader: ...           // route loader
createServerFn(...)   // ⚠️ should NOT exist — frontend-only project
```

### Action

```typescript
Skill({ skill: 'tanstack-start' })
```

### Focus Areas

- Query Hook Pattern: feature owns its data + query hooks in `src/features/[feature]/hooks/index.ts`
- Data is module-level in-memory state — no fetch, no server, no DB
- `todoKeys` style query-key factory
- Mutations update the in-memory store then `invalidateQueries`
- `createServerFn` / ORM / DB is not banned — there's just no backend scenario yet; **flag for confirmation** rather than reject

## Form Pattern

### Triggers

**File patterns**: `*-form.tsx`, `*-form/index.tsx`, `schema.ts`, `form-adapter.ts`

**Code patterns**:

```typescript
useForm()
<FormField name="..." />
z.object({ ... })       // zod (installed, wire in when needed)
toXxxPayload(...)
toXxxFormValues(...)
```

### Action

Read `docs/pattern/form/README.md` (then `architecture.md` / `schema.md` / `form-adapter.md` as needed).

> The form docs were ported from another (monorepo) project and reference `@alison-ui` / `@product-ui` / `yup`. In this repo: shadcn/ui replaces those packages, and `zod` replaces `yup`. Read them as conceptual references, not literal imports.

### Focus Areas

- Form props pattern (`mode`, `defaultValues`, `onSubmit`, `isSubmitting`)
- Schema composition and reuse
- Form-adapter naming conventions (`toXxxPayload` / `toXxxFormValues`)

## List Pattern

### Triggers

**File patterns**: `*-list.tsx`, `*-filters.tsx`, `*-table.tsx`, `use-*-filter.ts`, `use-*-table.ts`, `use-*-columns.tsx`

**Code patterns**:

```typescript
useReactTable()
usePagination()
createColumnHelper()
<DataTable ... />
```

### Action

Read `docs/pattern/list/README.md` (then `hooks.md` / `patterns.md` / `pitfalls.md` as needed).

### Focus Areas

- Naming (`XxxList`, `XxxFilters`, `XxxTable`)
- Hook composition (`useXxxList`, `useXxxFilter`, `useXxxTable`)
- Column hook stability
- Pattern selection (server / client / hybrid) — here, data is in-memory
- **Stable-reference dep trap** (`useMemo([table])`) — see `pitfalls.md` and code-smells
- **Select-all header** — when `enableRowSelection` is a predicate, the built-in `toggleAllPageRowsSelected` / `getIsAllPageRowsSelected` / `getIsSomePageRowsSelected` already filter by `getCanSelect()`. Flag hand-rolled `filter + every/some + forEach(toggleSelected)` as redundant; keep only the "hide when nothing selectable" guard. See `docs/pattern/list/pitfalls.md#8`

## Composition Pattern

### Triggers

**Code patterns**:

```tsx
renderHeader={...}  renderFooter={...}  renderItem={...}   // render-prop callbacks
isEditing isThread hideAttachments showFooter ...          // 5+ boolean props on one component
<A><B><C value={value} /></B></A>                          // same prop drilled 3+ layers
onFormStateChange + useEffect forwarding state upward
```

### Action

Read `docs/04-component/composition.md`.

### Focus Areas

- Replace boolean-prop monoliths with compound components / namespace exports (`Dialog.Root`, `Card.Header`)
- Lift shared state into a Provider instead of forwarding via callbacks
- Express intent with JSX structure, not prop switches

## Responsive / Mobile Pattern

### Triggers

```tsx
useBreakPointDown(...)
useMediaQuery(...)
if (isMobile) return <MobileView />
```

### Action

```typescript
Skill({ skill: 'mobile-view' })
```

### Focus Areas

- Choosing CSS responsive classes vs JS breakpoint hooks
- Avoiding hydration mismatches from JS-only branches

## Test Pattern

### Triggers

**File patterns**: `*.test.ts`, `*.test.tsx`, `__tests__/*`

**Code patterns**:

```typescript
import { describe, test, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
vi.mock(...) / vi.fn()
```

### Action

```typescript
Skill({ skill: 'gen-unit-test' })
```

### Focus Areas

- Test naming (third-person present tense)
- Edge case coverage (null, undefined, empty, boundaries)
- AAA pattern (Arrange-Act-Assert)
- Mock setup/teardown

## Storybook Pattern

### Triggers

**File patterns**: `*.stories.tsx`

**Code patterns**:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
const meta: Meta<typeof Component> = { ... }
```

### Action

```typescript
Skill({ skill: 'gen-storybook' })
```

### Focus Areas

- CSF 3.0 structure
- Complete `argTypes` documentation
- Default story uses the `Story` / `StoryObj` type

## Multi-Pattern Detection

When multiple patterns are detected, load all relevant guidelines:

```
Example: a list page that also has a create form
1. Detect: list pattern + form pattern
2. Read: docs/pattern/list/README.md
3. Read: docs/pattern/form/README.md
4. Review: apply both sets of guidelines
```

**Priority order**:

1. Primary pattern (main thing being built)
2. Secondary patterns (supporting code)

## No Pattern Detected

```
State: "No pattern-specific skills needed, proceeding with general review"
Continue with: project conventions and code smells checks
```

## Important Notes

1. **Load immediately** — don't wait until mid-review
2. **State explicitly** — mention which patterns were detected and what was loaded
3. **Apply guidelines** — actually check against the loaded skill/doc conventions
4. **Don't skip** — if a pattern is detected but the skill/doc isn't loaded, the review is incomplete
