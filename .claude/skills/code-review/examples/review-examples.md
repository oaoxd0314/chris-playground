# Review Examples

Example code reviews demonstrating proper feedback structure and communication. All examples use this project's frontend-only, in-memory + TanStack Query architecture.

## Example 1: Feature Query Hook Review

### Context

Reviewed a new `todo` feature query hook.

### Review Output

````markdown
## Code Review Summary

**Files Reviewed:**

- src/features/todo/hooks/index.ts
- src/features/todo/types.ts

**Overall Assessment:** Needs Improvement
**Patterns Detected:** TanStack Start / Query - loaded /tanstack-start

---

### High Priority Issues

#### Issue 1: 伺服器狀態用了 useState

- **Location:** todo/hooks/index.ts:8
- **Problem:** 用 `useState` 持有 todo 清單，再手動 set，繞過 TanStack Query
- **Impact:** 違反專案 data-flow（Route → Query Hook → in-memory store），快取與 invalidate 失效
- **Fix:** 資料放 module-level state，透過 `queryOptions` 暴露：

```typescript
let todos: Array<Todo> = []

export const todosQueryOptions = () =>
  queryOptions({ queryKey: todoKeys.all(), queryFn: () => todos })

export function useTodos() {
  return useSuspenseQuery(todosQueryOptions())
}
```
````

#### Issue 2: any 型別

- **Location:** types.ts:3
- **Problem:** `type Todo = { meta: any }`
- **Impact:** 失去型別安全
- **Fix:** 定義明確型別，或用 `unknown` 搭配 type guard

### Medium Priority Issues

#### Issue 1: mutation 後沒有 invalidate

- **Location:** todo/hooks/index.ts:22
- **Problem:** `useCreateTodo` 更新 store 後沒有 `invalidateQueries`
- **Impact:** 列表不會自動更新
- **Fix:**

```typescript
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
```

### Positive Observations

✓ `todoKeys` query-key factory 命名清楚
✓ 資料維持 in-memory，沒有引入後端

---

## Recommended Actions

1. 將 todo 清單從 useState 改為 module-level state + queryOptions
2. types.ts 移除 any
3. mutation onSuccess 補上 invalidateQueries

````

---

## Example 2: List Component Review

### Context

Reviewed a todo list with a multi-select bulk action.

### Review Output

```markdown
## Code Review Summary

**Files Reviewed:**
- src/features/todo/components/todo-list.tsx
- src/features/todo/hooks/use-todo-table.ts

**Overall Assessment:** Significant Issues
**Patterns Detected:** List pattern - read docs/pattern/list/

---

### High Priority Issues

#### Issue 1: Stable-reference dep 陷阱
- **Location:** use-todo-table.ts:18
- **Problem:** `useMemo(() => table.getSelectedRowModel().rows, [table])` — `table` 是 `useReactTable` 回傳的穩定 reference，memo 鎖在第一次 render
- **Impact:** 多選後 `selectedRows` 永遠是空陣列，bulk action 按鈕不會出現。型別檢查與靜態 review 都不會報錯，只有實際多選才會發現
- **Fix:** 直接計算（便宜）或用真正的 reactive state 當 dep：
```typescript
// 直接算
const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
// 或
const selectedRows = useMemo(
  () => table.getSelectedRowModel().rows.map(r => r.original),
  [rowSelection],
)
````

### Medium Priority Issues

#### Issue 1: switch 應改 object map

- **Location:** todo-list.tsx:40
- **Problem:** 用 `switch (action)` 分派 row action
- **Impact:** 違反專案慣例（00-common.md）
- **Fix:**

```typescript
const actionMap = { edit: onEdit, delete: onDelete } as const
actionMap[action]?.(row)
```

### Positive Observations

✓ 命名遵循 `TodoList` / `useTodoTable`
✓ filter / table hook 拆分清楚

---

## Recommended Actions

1. 修掉 useMemo([table]) 的 stale-closure
2. switch 改 object map

````

---

## Example 3: Component Composition Review

### Context

Reviewed a dialog component that accumulated boolean props.

### Review Output

```markdown
## Code Review Summary

**Files Reviewed:**
- src/features/todo/components/todo-dialog.tsx

**Overall Assessment:** Needs Improvement
**Patterns Detected:** Composition pattern - read docs/04-component/composition.md

---

### High Priority Issues

#### Issue 1: Boolean props 巨型組件
- **Location:** todo-dialog.tsx:10
- **Problem:** `<TodoDialog isEdit isReadonly hideFooter showDelete renderHeader={...} />` — 5+ boolean props + render-prop
- **Impact:** 內部充滿條件分支，難讀難測；違反 composition 原則
- **Fix:** 改用 namespace / compound component，用 JSX 結構表達意圖：
```tsx
<TodoDialog.Root>
  <TodoDialog.Header>{title}</TodoDialog.Header>
  <TodoDialog.Body>{form}</TodoDialog.Body>
  <TodoDialog.Footer><DeleteButton /></TodoDialog.Footer>
</TodoDialog.Root>
````

#### Issue 2: inline renderXxx 分支

- **Location:** todo-dialog.tsx:25
- **Problem:** component body 內定義 `renderBody = () => { if (...) return ...; }`
- **Impact:** render-prop 藏在單一 component 裡，難讀、無法 memo
- **Fix:** 抽成子 component `<TodoDialogBody />`

### Medium Priority Issues

#### Issue 1: section 之間沒有 gap

- **Location:** todo-dialog.tsx:30
- **Problem:** `<div className="flex flex-col">` 包 Header + Body，沒有 `gap-*`
- **Impact:** 兩個 section 貼在一起（0px）
- **Fix:** 加 `gap-6`（或 wrapper 用 `space-y-6`）

### Positive Observations

✓ 使用 shadcn/ui base component
✓ Props 型別用 type 定義

---

## Recommended Actions

1. 拆成 compound component
2. inline renderBody 抽成子 component
3. flex-col 補 gap-6

```

---

## Key Takeaways

### Good Review Characteristics

1. **Clear structure**: files reviewed, overall assessment, patterns detected
2. **Prioritized issues**: High / Medium / Low with reasoning
3. **Actionable feedback**: location, problem, impact, fix
4. **Code examples**: show both bad and good code
5. **Positive observations**: acknowledge good patterns
6. **Numbered actions**: clear next steps

### Communication Style

1. **Language**: Traditional Chinese for explanations, English for code/terms/paths
2. **Tone**: direct and specific, never "你說的對", not apologetic or vague
3. **Context**: explain why it matters, not just what's wrong
```
