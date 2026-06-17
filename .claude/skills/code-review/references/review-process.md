# Review Process Details

Detailed guidelines for conducting thorough and effective code reviews.

## Review Philosophy

Great code is self-documenting, follows established patterns, and makes the next developer's job easier. Be thorough but pragmatic — focus on issues that matter and avoid nitpicking trivial style preferences.

**Core Beliefs**:

- Code quality directly impacts maintainability
- Consistency reduces cognitive load
- Patterns emerge from solving real problems
- Prevention is better than fixing later

## Behavioral Guidelines

### 1. Be Specific

Don't say "this could be better" — say exactly what should change and why.

**Bad**: This function could be improved.

**Good**: `processTodoData` handles 3 responsibilities (validation, transformation, store mutation). Extract `validateTodo()`, `transformTodo()`, `saveTodo()`.

### 2. Provide Examples

When suggesting a fix, show the improved code.

**Bad**: Use proper error handling here.

**Good**:

```typescript
const results = await Promise.allSettled(items.map(i => mutateAsync(i.id)))
const failed = results.filter(r => r.status === 'rejected')
if (failed.length > 0) toast.error(`${failed.length} failed`)
```

### 3. Prioritize Appropriately

Focus on issues that have real impact, not style preferences.

- **High**: Breaks functionality, security, type safety, or project standards (incl. frontend-only architecture)
- **Medium**: Hurts readability, maintainability, or future changes
- **Low**: Nice-to-have improvements that don't block functionality

### 4. Be Constructive

Frame feedback as improvements, not criticisms.

**Bad**: This is wrong. You should never use `any`.

**Good**: Using `any` here loses type safety. Define a proper type:

```typescript
type TodoResponse = { id: number; name: string; done: boolean }
```

### 5. Acknowledge Good Work

Point out things done well to reinforce good patterns.

- ✓ Clean query-key factory in the feature hook
- ✓ Early-return guards keep the handler flat
- ✓ Object map instead of a switch
- ✓ Clear separation between UI and the in-memory store

### 6. Consider Context

Some "issues" may be intentional trade-offs — ask if unsure.

> 這裡用 inline style 而不是 Tailwind class，是為了動態樣式，還是該改用 CSS variable？

### 7. Check the Whole Picture

Ensure changes integrate well with surrounding code:

- Consistency with existing patterns
- Impact on other components/features
- Breaking changes to a feature's public hook API
- Whether the same concept already exists elsewhere (Single Source rule)

## Review Depth

### Review In-Depth

- New patterns (first usage of a new approach)
- Complex logic (state machines, data transformations)
- Anything touching the feature's query/mutation hooks (the data layer)
- User-input handling

### Review Lightly

- Code following established conventions
- Private utilities with clear purpose
- Generated code (route tree, type definitions)
- Standard config following templates

## Common Review Scenarios

### New Feature

Focus: follows existing patterns? edge cases handled? types defined? right state tool? data kept in the feature hook?

### Bug Fix

Focus: addresses root cause? similar bugs elsewhere? regression test? does it just patch a symptom (Single Source)?

### Refactor

Focus: intent clear? behavior preserved? changes minimal and focused?

### Performance

Focus: measurable improvement? premature? sacrifices readability?

## Communication

### Language

- **Review in**: Traditional Chinese (繁體中文)
- **Keep in English**: code snippets, technical terms, file paths, function/variable names, package names

### Tone

**Avoid**:

- "你說的對" or any unconditional agreement (explicit user preference)
- Overly apologetic language
- Vague statements like "可能需要改進"

**Prefer**:

- Specific, actionable feedback
- Objective technical analysis
- Clear reasoning for suggestions

### Example Phrasing

**Good**:

> 這個 function 處理了 3 個職責，建議拆成 `validateInput()` / `transformData()` / `saveToStore()`。

**Avoid**:

> 這段程式碼需要改進。

## Handling Edge Cases

### When Uncertain

> 我注意到這裡用了 inline style，這是為了動態樣式還是該重構成 Tailwind class？

### When Patterns Conflict

> 這裡兩種做法都合理：
>
> 1. Zustand 管理全域狀態（需要跨元件共享時）
> 2. `useState` 管理本地狀態（只在此元件使用時）
>    依目前場景，建議方案 2。

### When Trade-offs Exist

> 這個實作犧牲了一點效能換取可讀性。因為不在關鍵路徑上，這是合理的權衡。

## Next Steps After Review

- **High**: author fixes → quick re-review → approve
- **Medium**: fix now if cheap, otherwise note as tech debt; don't block an otherwise-good change
- **Low**: fix opportunistically
