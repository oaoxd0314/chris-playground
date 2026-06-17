# Project Conventions Quick Index

Quick reference index into this project's documentation. Use it to find specific conventions fast.

**Important**: This file is an INDEX only. Read the actual docs for the complete guidelines.

## Primary References

| Doc                             | Check For                                                                                                 | Link                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **CLAUDE.md**                   | Architecture, data-flow pattern, tech stack, code style, frontend-only rule                               | [../../../CLAUDE.md](../../../CLAUDE.md)                                               |
| **00-common.md**                | Naming, imports (`@/` alias), object maps over switch, early return, `Promise.allSettled`                 | [../../../docs/00-common.md](../../../docs/00-common.md)                               |
| **01-typescript.md**            | `type` vs `interface`, union types, generics, no `any`                                                    | [../../../docs/01-typescript.md](../../../docs/01-typescript.md)                       |
| **02-react.md**                 | Hooks deps rules, when (not) to use `useMemo`/`useCallback`, conditional rendering, custom-hook stability | [../../../docs/02-react.md](../../../docs/02-react.md)                                 |
| **04-component/composition.md** | Composition over boolean props; namespace exports; Provider-lifted state                                  | [../../../docs/04-component/composition.md](../../../docs/04-component/composition.md) |

## File Structure

| Doc                             | Check For               | Link                                                                                                           |
| ------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **03-file-structure/README.md** | Folder organization     | [../../../docs/03-file-structure/README.md](../../../docs/03-file-structure/README.md)                         |
| **barrel-export.md**            | Barrel export rules     | [../../../docs/03-file-structure/barrel-export.md](../../../docs/03-file-structure/barrel-export.md)           |
| **thin-index-pattern.md**       | Thin `index.ts` pattern | [../../../docs/03-file-structure/thin-index-pattern.md](../../../docs/03-file-structure/thin-index-pattern.md) |

## Pattern Docs (read when the pattern is detected)

| Doc               | When to Read                                 | Link                                                                         |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| **pattern/form/** | New form, multi-step form, shared form logic | [../../../docs/pattern/form/README.md](../../../docs/pattern/form/README.md) |
| **pattern/list/** | List / table page with filters + pagination  | [../../../docs/pattern/list/README.md](../../../docs/pattern/list/README.md) |

> The `pattern/` docs were ported from a monorepo project and are **not fully localized** (see `docs/pattern/README.md`). `@alison-ui` / `@product-ui` → shadcn/ui; `yup` → `zod`; multi-app portals → single app here. Read them as conceptual references.

## Key Directories (from CLAUDE.md)

- `src/routes/` — file-based routes (TanStack Router)
- `src/features/[feature]/` — feature module: `index.tsx`, `types.ts`, `components/`, `hooks/`
- `src/components/ui/` — shadcn/ui base components (new-york)
- `src/components/shared/` — cross-feature components
- `src/hooks/` — shared hooks
- `src/lib/utils.ts` — utilities (`cn`, etc.)
- `src/integrations/tanstack-query/` — query client provider + devtools

## Quick Checklist

### Naming & Structure

- [ ] `kebab-case` files/folders, `PascalCase` components, `camelCase` functions, `UPPER_SNAKE_CASE` constants
- [ ] Arrays `items` / `statusList`; objects `actionMap` / `nameDict`
- [ ] Domain types in `src/features/[feature]/types.ts`

### Exports & Imports

- [ ] Named exports only, no default exports
- [ ] `@/` path alias, no deep relative imports (`../../`)

### Code Quality

- [ ] No "what/how" comments, only "why"
- [ ] Object map instead of `switch`
- [ ] Early return instead of nested `if/else`
- [ ] `Promise.allSettled()` for batch operations

### TypeScript

- [ ] No `any`
- [ ] Prefer `type`; `interface` only for extendable contracts

### React & State

- [ ] Server / in-memory data → TanStack Query (never `useState`/Zustand)
- [ ] Global client UI → Zustand (when a real need exists)
- [ ] Derived state computed (`useMemo` or inline), not stored
- [ ] No `useCallback`/`useMemo` in plain components (only custom hooks)
- [ ] Deps arrays use primitives / stable values; watch for stable-reference traps

### Architecture

- [ ] Data flows: Route → Query Hook → in-memory store; Mutation → update store → invalidate
- [ ] No backend scenario yet — if a change adds a server function / ORM / DB, flag for confirmation (not a ban)

## Common Violations

| Issue                   | Example                       | Doc                     |
| ----------------------- | ----------------------------- | ----------------------- |
| Default export          | `export default Button`       | 00-common.md            |
| Deep relative import    | `../../../lib/utils`          | 00-common.md            |
| Switch statement        | `switch (type) { ... }`       | 00-common.md            |
| Nested if/else          | no early return               | 00-common.md            |
| `any` type              | `const x: any`                | 01-typescript.md        |
| Wrong state tool        | `useState` for in-memory data | 02-react.md / CLAUDE.md |
| Memo in plain component | `useMemo` for trivial value   | 02-react.md             |
| "What" comment          | `// Loop through users`       | 00-common.md            |

## Priority Mapping

| Convention                  | Priority | Why                                     |
| --------------------------- | -------- | --------------------------------------- |
| Named exports               | High     | Project standard                        |
| No `any`                    | High     | Type safety                             |
| Correct state tool          | High     | Architecture                            |
| Server fn / ORM / DB        | Confirm  | No backend scenario yet, but not banned |
| `@/` alias                  | Medium   | Consistency                             |
| Object map over switch      | Medium   | Code clarity                            |
| No memo in plain components | Medium   | Noise                                   |
| Comments                    | Medium   | Code clarity                            |
| Variable naming             | Low      | Minor improvement                       |
