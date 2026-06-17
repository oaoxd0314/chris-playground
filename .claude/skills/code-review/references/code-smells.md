# Code Smells Catalog

Quick reference catalog of common code smells to look for during review.

## Complexity Issues

### Long Function / God Function

**Symptom**: Function doing too many things, hard to name, 100+ lines

**Quick check**: Can you describe what it does in one sentence? If not, it's doing too much.

**Fix**: Extract separate functions for each responsibility

**Priority**: High

---

### Deep Nesting

**Symptom**: 3+ levels of nested conditionals

**Example**:

```typescript
// ❌ BAD
if (user) {
  if (user.isActive) {
    if (user.orders) {
      if (user.orders.length > 0) {
        /* ... */
      }
    }
  }
}

// ✅ GOOD
if (!user?.isActive) return
if (!user.orders?.length) return
// ...
```

**Priority**: Medium

---

### Long Parameter List

**Symptom**: 5+ parameters

**Fix**: Use object parameter

```typescript
// ❌ BAD
function create(name, email, age, city, country, phone) {}

// ✅ GOOD
function create(params: CreateParams) {}
```

**Priority**: Medium

---

### Switch Statement

**Symptom**: `switch (type) { case ... }` for dispatch / mapping

**Fix**: Use an object map (project convention — see `docs/00-common.md`)

```typescript
// ❌ BAD
switch (type) {
  case 'add':
    return handleAdd()
  case 'edit':
    return handleEdit()
  default:
    return null
}

// ✅ GOOD
const actionMap = {
  add: handleAdd,
  edit: handleEdit,
} as const
return actionMap[type]?.() ?? null
```

**Priority**: Medium

## Duplication

### Copy-Paste Code

**Symptom**: Similar code blocks in multiple places

**Fix**: Extract common pattern into reusable function

**Priority**: High

---

### Similar Patterns Not Abstracted

**Symptom**: Multiple similar implementations

**Example**:

```typescript
// ❌ BAD
function getActiveUsers() {
  return users.filter(u => u.status === 'active')
}
function getInactiveUsers() {
  return users.filter(u => u.status === 'inactive')
}

// ✅ GOOD
function getUsersByStatus(status: UserStatus) {
  return users.filter(u => u.status === status)
}
```

**Priority**: Medium

## Poor Abstractions

### Leaky Abstraction

**Symptom**: Implementation details leak through

**Example**:

```typescript
// ❌ BAD - caller must know the in-memory store shape
export function fetchTodos() {
  return { rows: todos, meta: { total: todos.length } }
}

// ✅ GOOD - return the domain shape callers expect
export function fetchTodos(): Array<Todo> {
  return todos
}
```

**Priority**: High

---

### Mixed Concerns

**Symptom**: Single function/component doing UI + business logic + data access

**Fix**: Separate concerns — data lives in the feature's query/mutation hooks (`src/features/[feature]/hooks/`), UI stays in components

**Priority**: High

---

### Inline `renderXxx` Function in Component Body

**Symptom**: Defining a local arrow function inside a component that branches on conditions to return JSX, then calling it once in the JSX tree.

**Why this matters**: It's a render-prop pattern hiding inside a single component. Hurts readability (you have to scan two scopes to understand the tree), prevents memoization, and the branches usually deserve to be testable / named units. See `docs/04-component/composition.md`.

**Example**:

```tsx
// ❌ BAD — inline render fn that dynamic-branches
export function TodoTab({ id }: Props) {
  const { data, isPending } = useTodo(id)

  const renderBody = () => {
    if (isPending) return <Spinner />
    if (!data) return <p>Not found</p>
    return <TodoDetail todo={data} />
  }

  return (
    <div className="flex flex-col gap-6">
      {renderBody()}
      <TodoMeta id={id} />
    </div>
  )
}

// ✅ GOOD — extract branching into a child component
function TodoBody({ id }: { id: number }) {
  const { data, isPending } = useTodo(id)
  if (isPending) return <Spinner />
  if (!data) return <p>Not found</p>
  return <TodoDetail todo={data} />
}

export function TodoTab({ id }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <TodoBody id={id} />
      <TodoMeta id={id} />
    </div>
  )
}
```

**Detection**: search the diff for `const render[A-Z]\w* = \(\) =>` (or `function render[A-Z]\w*\(`) defined **inside another component**.

**Exception**: A truly trivial single-line ternary inline in JSX is fine (`{isOpen ? <Foo /> : null}`). The smell is multi-branch logic hidden behind a named local function.

**Priority**: High

## State Management

### Wrong Tool for State Type

**Symptom**: Using the wrong state management solution

| State Type              | Wrong                    | Right                              |
| ----------------------- | ------------------------ | ---------------------------------- |
| Server / in-memory data | `useState` / Zustand     | TanStack Query                     |
| Form data               | `useState` scattered     | controlled form / React Hook Form  |
| Derived                 | `useState` + `useEffect` | `useMemo` (or just compute inline) |
| URL state               | `useState`               | TanStack Router                    |
| Global client UI        | TanStack Query           | Zustand                            |

**Priority**: High

---

### Unnecessary State

**Symptom**: State that could be derived

```typescript
// ❌ BAD
const [users, setUsers] = useState([])
const [activeUsers, setActiveUsers] = useState([])
useEffect(() => setActiveUsers(users.filter(u => u.isActive)), [users])

// ✅ GOOD
const [users, setUsers] = useState([])
const activeUsers = useMemo(() => users.filter(u => u.isActive), [users])
```

**Priority**: Medium

---

### Derived State Stored

**Symptom**: Storing calculated values

**Fix**: Compute on demand with `useMemo` (or inline if cheap)

**Priority**: High (prevents sync issues)

## React Hooks Traps

### Stable-reference dep in `useMemo` / `useEffect` / `useCallback`

When a deps array contains a value from a hook that returns **referentially stable instances across renders**, the memo/effect/callback never re-runs after the first render — even though the underlying state changes. Silent stale-closure bug.

**Common stable-reference returns**:

| Source                                            | Why it's stable                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `useReactTable(...)` from `@tanstack/react-table` | Returns one table instance that mutates internally; the reference does not change across renders |
| `useRef(...)` return                              | `{ current }` object is stable by design                                                         |
| Setters from `useState` (`setX`)                  | Stable by design                                                                                 |
| Zustand selectors with shallow equality           | Stable when the result hasn't changed                                                            |

**Anti-pattern**:

```ts
// ❌ table is referentially stable → memo locks at mount → selectedRows always empty
const selectedRows = useMemo(
  () => table.getSelectedRowModel().rows.map(r => r.original),
  [table]
)
```

Symptom: dependent UI (e.g. a button gated on `selectedRows.length > 0`) never appears even though the table state visibly updates. Type-check passes; static review may pass; only multi-select + visual smoke test reveals it.

**Fix** — drop the memo if the computation is cheap (almost always preferable):

```ts
const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
```

Or use the actual reactive state as dep:

```ts
const selectedRows = useMemo(
  () => table.getSelectedRowModel().rows.map(r => r.original),
  [rowSelection] // ← whatever useState backs the selection
)
```

**Review checklist**: For every `useMemo([X])` / `useEffect(..., [X])` / `useCallback(..., [X])` whose dep includes a hook return:

1. Identify what hook X comes from.
2. Ask: "Does X's reference change on the renders we expect this memo to re-run?"
3. If unsure, check the hook's source — many library hook returns are intentionally stable for perf, which makes them traps for naive deps.

**Why high priority**: silent, no compile error, no runtime warning, hard to spot without explicit awareness — the dep array is `unknown[]` so the type system can't catch it.

**Priority**: High

---

### Unneeded `useCallback` / `useMemo` in a Plain Component

**Symptom**: Memoizing simple values or handlers in a regular component (not a custom hook)

**Why**: Project convention (`docs/02-react.md`) — avoid `useCallback`/`useMemo` in plain components unless inside a custom hook. They add noise without measurable benefit.

```typescript
// ❌ unnecessary
const isEmpty = useMemo(() => items.length === 0, [items])
const handleClick = useCallback(() => setOpen(true), [])

// ✅ just compute / declare
const isEmpty = items.length === 0
const handleClick = () => setOpen(true)
```

**Priority**: Medium

## TypeScript Issues

### Any Type Usage

**Symptom**: Using `any` type

**Fix**: Use proper types or `unknown` with type guards

**Priority**: High

---

### Missing Types

**Symptom**: Implicit any or overly broad types

**Fix**: Add explicit type annotations. Prefer `type` over `interface` except for extendable contracts (`docs/01-typescript.md`)

**Priority**: High

---

### Unnecessary Type Assertions

**Symptom**: Using `as` when the type can be inferred

**Fix**: Type the function return properly

**Priority**: Medium

## Error Hiding

### Suspicious Default Fallback Values

**Symptom**: Using `??` or `||` with a default value that may hide missing-data errors

**Why this matters**: Default fallbacks silently mask data issues. When data is unexpectedly missing, the code continues with a fallback instead of surfacing the error.

**Suspicious patterns to flag**:

```typescript
// ❌ SUSPICIOUS - may hide missing data in business logic
status: todo?.status ?? 'pending'
priority: item?.priority ?? 0

// ✅ BETTER - fail fast with early return
if (!todo?.status) return
doSomething(todo.status)

// ✅ ACCEPTABLE - display fallback (not business logic)
<span>{user.name ?? 'Unknown'}</span>
<Label>{data?.title ?? 'Untitled'}</Label>
```

**When to flag**:

- Fallback affects business logic or branching (`if (status === 'pending')`)
- Fallback is passed to functions expecting specific values

**When acceptable**:

- Display-only fallbacks (labels, placeholders)
- Explicitly documented intentional defaults

**Action**: Flag for user confirmation — ask "Is this fallback intentional, or should we fail fast?"

**Priority**: High (can hide bugs)

## Project-Specific

### Default Exports

**Symptom**: Using default exports

**Fix**: Use named exports

```typescript
// ❌ BAD
export default Button

// ✅ GOOD
export { Button }
```

**Priority**: High (project standard)

---

### Deep Relative Imports

**Symptom**: `import x from '../../../lib/utils'`

**Fix**: Use the `@/` path alias

```typescript
// ❌ BAD
import { cn } from '../../../lib/utils'

// ✅ GOOD
import { cn } from '@/lib/utils'
```

**Priority**: Medium

---

### Introducing a Backend

**Symptom**: Adding a server function (`createServerFn`), ORM, database client, or fetch to a real server

**Not a violation** — there's just no backend scenario yet, so today data lives in module-level in-memory state exposed through TanStack Query (see CLAUDE.md + the Query Hook Pattern). The project isn't opposed to adding a backend later.

**Action**: Flag for confirmation — "這是刻意要接後端嗎？目前還沒有這個場景。" Don't auto-reject. If it's intended, just check it's done cleanly (data still flows through the feature's query/mutation hooks).

**Priority**: Confirm with user (not auto-High)

---

### "What" Comments

**Symptom**: Comments explaining what code does

**Fix**: Remove or refactor to self-documenting code; keep only "why" comments

```typescript
// ❌ BAD
// Loop through users and find active ones
const activeUsers = users.filter(u => u.isActive)

// ✅ GOOD - no comment needed
const activeUsers = users.filter(u => u.isActive)

// ✅ GOOD - "why" comment
// FIXME: source data is unsorted until the seed script runs
const sorted = [...users].sort(byName)
```

**Priority**: Medium

## Quick Priority Reference

| Priority   | When to Use                                                       |
| ---------- | ----------------------------------------------------------------- |
| **High**   | Breaks functionality, security, type safety, or project standards |
| **Medium** | Hurts readability, maintainability, or future changes             |
| **Low**    | Nice-to-have improvements, doesn't block functionality            |

## Detection Tips

**Scan for these in code**:

- Functions > 50 lines → Check for god function
- Nested `if` statements → Count nesting depth
- Multiple similar functions → Look for duplication
- `any` type → Type safety issue
- `export default` → Export convention violation
- `switch (` → Should be an object map
- `../../` → Should use `@/` alias
- `const render[A-Z]` / `function render[A-Z]` inside a component → Extract to child component
- `useMemo([table])` / stable hook return in deps → Stale-closure trap
- Repeated logic → Abstraction opportunity (Single Source rule)
