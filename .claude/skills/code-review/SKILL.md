---
name: code-review
description: Reviews recently written code for maintainability, code smells, and adherence to project conventions. Use after implementing features, fixing bugs, refactoring, or adding components. Automatically loads pattern-specific skills/docs (tanstack-start, form, list, test, story, mobile) when detected.
---

# Code Review

Proactive code review focusing on project conventions and maintainability.

This is currently a **frontend-only** project: data lives in-memory and is served through TanStack Query, because there's no backend scenario yet. Introducing a server function / ORM / database is **not a violation** — it's just out of scope today. If a change adds one, **flag it for confirmation** ("這是刻意要接後端嗎？目前還沒有這個場景"), don't auto-reject.

## Review Workflow

Copy this checklist and track progress:

```
Code Review Progress:
- [ ] Step 1: Identify changed code
- [ ] Step 2: Detect patterns and load guidelines
- [ ] Step 3: Check project conventions
- [ ] Step 4: Identify code smells
- [ ] Step 5: Provide actionable feedback
```

### Step 1: Identify Changed Code

Focus review on:

- New files created
- Functions/components added or modified
- Logic changes

### Step 2: Detect Patterns and Load Guidelines

Scan the changed code for these patterns and load the corresponding skill or doc:

| Pattern                    | Trigger                                                                                                | Action                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **TanStack Start / Query** | `queryOptions`, `useSuspenseQuery`, `useMutation`, `createFileRoute`, route `loader`, `createServerFn` | Load `/tanstack-start` skill            |
| **Form**                   | `useForm()`, `<FormField>`, `z.object()`, `schema.ts`, `form-adapter.ts`, `*-form.tsx`                 | Read `docs/pattern/form/README.md`      |
| **List**                   | `useReactTable()`, `DataTable`, `*-list.tsx`, `*-filters.tsx`, `usePagination()`                       | Read `docs/pattern/list/README.md`      |
| **Composition**            | `render*` JSX callback prop, 5+ boolean props on one component, prop drilling 3+ layers                | Read `docs/04-component/composition.md` |
| **Responsive**             | `useBreakPointDown`, `useMediaQuery`, `if (isMobile) return <Mobile/>`                                 | Load `/mobile-view` skill               |
| **Tests**                  | `*.test.ts(x)`, `describe()`, `test()`, `expect()`                                                     | Load `/gen-unit-test` skill             |
| **Stories**                | `*.stories.tsx`, `Meta`, `StoryObj`                                                                    | Load `/gen-storybook` skill             |

**If pattern detected**: Use the Skill() tool (or Read the doc) NOW, then continue the review with those guidelines.

**If no patterns**: State "No pattern-specific skills needed" and proceed with general review.

See [references/trigger-rules.md](references/trigger-rules.md) for detailed detection logic.

### Step 3: Check Project Conventions

Verify against CLAUDE.md + `docs/`:

**Must-check items**:

- ✓ Named exports (no default exports)
- ✓ `@/` path alias, no deep relative imports (`../../`)
- ✓ Naming: `kebab-case` files, `PascalCase` components, `camelCase` functions, `UPPER_SNAKE_CASE` constants
- ✓ Array names `items` / `statusList`; object names `actionMap` / `nameDict`
- ✓ Object map instead of `switch` statement
- ✓ Early return instead of nested `if/else`
- ✓ `Promise.allSettled()` for batch operations
- ✓ No "what/how" comments (only "why" comments)
- ✓ Correct state management tool for the state type (see Step 4)
- ✓ Server / in-memory data goes through TanStack Query (no backend scenario yet — flag, don't reject, if a change adds one)

See [references/project-conventions.md](references/project-conventions.md) for the complete index into `docs/`.

### Step 4: Identify Code Smells

Look for common issues:

**High priority** (must fix):

- `any` type usage
- Wrong state management tool (server/in-memory data in `useState`/Zustand instead of TanStack Query)
- Default exports
- **Suspicious default fallback values** (`?? 'defaultValue'` in business logic that may hide errors)
- **Inline `renderXxx` arrow/function defined inside a component body** that branches on conditions to return JSX — extract to a child component
- **Repeated domain concept across surfaces** — see "Single Source rule" below
- **`useMemo` / `useEffect` / `useCallback` whose deps include a referentially-stable hook return** (e.g. `[table]` from `useReactTable`, `[ref]` from `useRef`) — memo never recomputes; see "Stable-reference dep" in code-smells reference
- **`flex` / `grid` container without an explicit `gap` between sibling sections** — see "Section-break gap audit" below

**Medium priority** (should fix):

- Deep nesting (3+ levels)
- Long parameter lists (5+)
- Unnecessary state
- Derived state stored instead of computed
- `useCallback` / `useMemo` in plain components where it isn't needed (only justified in custom hooks — see `docs/02-react.md`)

**Low priority** (consider):

- Variable naming improvements
- Minor refactoring opportunities

See [references/code-smells.md](references/code-smells.md) for the detailed catalog with examples.

#### Single Source rule for repeated concepts

When the same domain concept is rendered, computed, validated, or gated in 2+ places, flag it as a **High priority** issue — even if the two places currently agree. Repeated implementations of the same concept WILL drift over time; the durable fix is to lift into a shared abstraction.

Concepts to watch for:

| Type                                     | What to grep                                                                                          | Shared abstraction to suggest                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Display (label, badge, format)           | duplicate `<Badge variant=...>{label}</Badge>` blocks, duplicate `formatXxx()` calls inlined          | React component (e.g. `<TodoStatusBadge>`)                             |
| Derived state / computation              | same `if (status === X \|\| status === Y)` repeated across files; same `data.foo ?? data.bar` pattern | function / selector / hook                                             |
| Validation rule                          | same `z.string().min(...)` block in two schemas; field invariants repeated in submit handler          | shared schema / schema factory                                         |
| Gate / restriction                       | per-field `disabled={...}` AND payload filter computing the same eligibility                          | single helper (e.g. `isFieldEditable(field, status)`) consumed by both |
| Constant (enum label, route, permission) | string literal repeated 3+ times                                                                      | exported constant in `constants.ts`                                    |

**How to spot during review**:

1. After identifying changed files, **grep the changed concept names across the rest of the surface area**. Example: if the diff touches a `<Badge>` for todo status, `rg "todo.*status.*Badge"` to find other surfaces rendering the same concept.
2. If you find 2+ implementations, ask: "Why isn't this one component / function / hook / constant?"
3. **Anti-pattern to call out**: "I'll fix surface A to match surface B" — this treats the symptom. Future surface C will drift again. Push for the structural fix instead.

#### Section-break gap audit

When reviewing a JSX block with a `flex` / `grid` container whose direct children are **distinct sections** (dialog Header + body, step header + step content, panel + footer), the container MUST have an explicit `gap-*` / `space-y-*`. A bare `flex flex-col` with no gap renders children touching at 0px — visually broken but easy to miss because screenshots compress vertical rhythm.

**How to spot during review**:

1. Grep changed files for `className=".*flex.*flex-col"` or `className=".*grid"` with 2+ JSX children.
2. For each, check whether the container's className includes `gap-` or the children use `space-y-` / `mt-*`. If neither, flag.
3. Rough convention:
   - Between distinct sections: `gap-6` / `space-y-6`
   - Within a section (label + input, button row): `gap-2` / `gap-3` / `space-y-3`
   - Tight grouping (icon + text, inline badges): `gap-1` / `gap-2`
4. When unsure whether two children are "section break" or "within section", err on the side of section break.

**Anti-pattern**: `<div className="flex flex-col"><Header/>{body}</div>` — the inner flex-col has no gap, so Header and body touch. Tailwind's `flex flex-col` does NOT set a default gap.

### Step 5: Provide Actionable Feedback

For each issue:

1. **Location**: File:line or function name
2. **Issue**: Clear description
3. **Why it matters**: Impact on maintainability/performance/correctness
4. **Suggestion**: Specific fix with code example
5. **Priority**: High / Medium / Low

See [references/review-process.md](references/review-process.md) for behavioral guidelines, depth, and phrasing.

## Output Format

```
## Code Review Summary

**Files Reviewed:** [list]
**Overall Assessment:** [Good / Needs Improvement / Significant Issues]
**Patterns Detected:** [If any - list loaded skills/docs]

---

### High Priority Issues
[Issues that must be fixed before committing]

#### Issue 1: [Title]
- **Location:** file.ts:42
- **Problem:** [Clear description]
- **Impact:** [Why this matters]
- **Fix:** [Specific recommendation with code]

### Medium Priority Issues
[Should fix but not blocking]

### Low Priority Suggestions
[Nice-to-have improvements]

### Positive Observations
[Things done well - reinforce good patterns]

---

## Recommended Actions
1. [Specific action]
2. [Specific action]
```

## Quick Reference

**Common violations**:

- Default export → Use named export
- `any` type → Add proper type
- `switch (type) { ... }` → object map (`actionMap[type]?.()`)
- Nested `if/else` → early return
- "what" comment → Remove or explain "why" only
- `useState` for in-memory/server data → Use TanStack Query
- `useCallback`/`useMemo` in a plain component → drop it unless it's a custom hook
- `?? 'defaultValue'` in business logic → Flag for user confirmation (may hide errors)
- New server function / ORM / DB → Flag for confirmation (no backend scenario yet, but not banned)

**Language**: Provide review in **Traditional Chinese (繁體中文)**, but keep:

- Code snippets in English
- Technical terms in English
- File paths in English

Do not open with "你說的對" or any unconditional agreement.

## Additional Resources

- [references/trigger-rules.md](references/trigger-rules.md) - Pattern detection and skill loading
- [references/project-conventions.md](references/project-conventions.md) - Index into `docs/`
- [references/code-smells.md](references/code-smells.md) - Detailed code smell catalog
- [references/review-process.md](references/review-process.md) - Review philosophy and phrasing
- [examples/review-examples.md](examples/review-examples.md) - Example reviews
- [CHANGELOG.md](CHANGELOG.md) - Guideline change history

## Self-Check

Before finalizing review:

- [ ] Focused on recently changed code only
- [ ] Loaded pattern-specific skills/docs if detected
- [ ] Checked against project conventions (CLAUDE.md, `docs/`)
- [ ] All suggestions are actionable with examples
- [ ] Prioritized issues correctly
- [ ] Included positive feedback
- [ ] Feedback is constructive and professional
