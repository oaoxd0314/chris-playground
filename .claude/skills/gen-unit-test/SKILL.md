---
name: gen-unit-test
description: Generate unit tests following project testing conventions. Use when creating new tests, writing tests for existing code, or when the user asks to "test", "add tests", "write unit tests", or "gen-testcase" for utility functions, hooks, or business logic.
---

# Unit Test Generation

Generate comprehensive unit tests following the project's Vitest + BDD conventions.

## Philosophy: Tests as Documentation

Tests serve two purposes: **defense** (catch regressions) and **documentation** (explain behavior to the next developer). Prioritize the documentation role by:

- Naming each `describe` block as a readable condition, not a code label
- Nesting deeply enough that the test runner output reads like a spec
- Keeping test bodies to a single assertion so each case is unambiguous

The tradeoff: deeper nesting means more indentation in code. Accept this cost — the output readability is worth it.

## Core Rules

| Rule                          | Detail                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **One `expect` per test**     | If two behaviors need asserting, open two test cases                                   |
| **Setup in `beforeEach`**     | Test bodies contain only the assertion. All arrangement goes in `before`/`after` hooks |
| **Cases list before loop**    | Declare test data as an array first, then generate tests with `forEach`                |
| **Semantic `describe` names** | Each describe level represents one input dimension or condition                        |

## Structure: BDD Nesting + Table-Driven

The canonical pattern combines semantic nesting with a data-driven loop:

```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { computeFn } from './my-module'

describe('computeFn', () => {
  describe('when conditionA is true', () => {
    const cases = [
      { label: 'conditionB is present', input: 'x', expected: true },
      { label: 'conditionB is absent', input: '', expected: false },
    ]

    cases.forEach(({ label, input, expected }) => {
      describe(label, () => {
        let result: boolean

        beforeEach(() => {
          result = computeFn(true, input)
        })

        test(`returns ${expected}`, () => {
          expect(result).toBe(expected)
        })
      })
    })
  })

  describe('when conditionA is false', () => {
    let result: boolean

    beforeEach(() => {
      result = computeFn(false, 'anything')
    })

    test('returns false regardless of input', () => {
      expect(result).toBe(false)
    })
  })
})
```

This produces output like:

```
computeFn
  when conditionA is true
    conditionB is present
      ✓ returns true
    conditionB is absent
      ✓ returns false
  when conditionA is false
    ✓ returns false regardless of input
```

## Test Naming Convention

Use **third-person present tense** with a clear condition:

| Pattern                                                | Example                                             |
| ------------------------------------------------------ | --------------------------------------------------- |
| `test('returns X when Y', ...)`                        | `test('returns null when value is empty', ...)`     |
| `test('returns X', ...)` inside a condition `describe` | preferred — condition lives in the outer `describe` |
| `test('throws when Y', ...)`                           | `test('throws error when API fails', ...)`          |

Avoid `should` in `test()` — it is acceptable only with `it()`.

## When to Use `beforeEach` vs Inline

**Always use `beforeEach`** — even for pure functions. The test body is reserved for `expect` only.

```typescript
// ✅ Correct
describe('when value is null', () => {
  let result: string

  beforeEach(() => {
    result = formatValue(null)
  })

  test('returns "-"', () => {
    expect(result).toBe('-')
  })
})

// ❌ Avoid — setup inside test body
test('returns "-" when value is null', () => {
  const result = formatValue(null) // setup mixed with assertion
  expect(result).toBe('-')
})
```

Exception: when the inline form is genuinely more readable for a single trivial case with no shared state. Prefer `beforeEach` by default.

## Cases Array Pattern

Declare the full test matrix as a typed array before the loop. This makes the spec scannable without reading the loop body:

```typescript
const cases: Array<{
  label: string
  deploymentType: string | null | undefined
  expected: boolean
}> = [
  { label: 'llm_proxy', deploymentType: 'llm_proxy', expected: false },
  { label: 'dedicated', deploymentType: 'dedicated', expected: true },
  { label: 'undefined', deploymentType: undefined, expected: true },
  { label: 'null', deploymentType: null, expected: true },
]

cases.forEach(({ label, deploymentType, expected }) => {
  describe(label, () => {
    let result: boolean

    beforeEach(() => {
      result = computeIsDedicatedEnabled(deploymentType)
    })

    test(`returns ${expected}`, () => {
      expect(result).toBe(expected)
    })
  })
})
```

## Required Edge Cases

Always cover:

| Category           | Values                              |
| ------------------ | ----------------------------------- |
| **Null/Undefined** | `null`, `undefined`                 |
| **Empty**          | `''`, `[]`, `{}`                    |
| **Boundaries**     | `0`, `NaN`, `-Infinity`, `Infinity` |
| **Type mismatch**  | wrong casing, wrong type            |

## Mocking Patterns

```typescript
import { vi } from 'vitest'

// Function mock
const mockFn = vi.fn().mockReturnValue('value')

// Module mock
vi.mock('@/libs/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: [] }),
}))

// Cleanup
afterEach(() => {
  vi.clearAllMocks()
})
```

## File Location

Place test files adjacent to the source file:

```
src/features/artifact/utils/
├── llm-artifact.ts
└── llm-artifact.test.ts   ← co-located
```

## Running Tests

```bash
# All tests for an app
pnpm --filter user-portal test --run

# Filter by path (fastest for focused work)
pnpm --filter user-portal test --run src/features/artifact
pnpm --filter user-portal test --run src/features/artifact/utils/llm-artifact

# Via Nx (pass path after --)
pn nx run user-portal:test -- src/features/artifact/utils/llm-artifact

# Watch mode
pnpm --filter user-portal test:watch
```

## Generation Checklist

- [ ] Import `describe, test, expect, beforeEach` from `'vitest'`
- [ ] Outer `describe` = function/module under test
- [ ] Inner `describe` levels = input dimensions or conditions
- [ ] Test data declared as a typed `cases` array before `forEach`
- [ ] `forEach` generates one `describe` + one `beforeEach` + one `test` per case
- [ ] `beforeEach` contains all setup; `test` body contains only `expect`
- [ ] Exactly one `expect` per `test`
- [ ] All edge cases covered (null, undefined, empty, boundary, wrong type)
- [ ] Test names use third-person present tense verbs

---

> Reference: [testing.md](../../../docs/dev/testing.md)
> For async testing, hooks, and React hooks patterns: see [ASYNC-TESTING.md](ASYNC-TESTING.md), [REACT-HOOKS.md](REACT-HOOKS.md), [MOCKING.md](MOCKING.md)
