# Cross-Portal List Sharing

> 何時抽到 product-ui、actions 一致性、export 設定。
> 回到 [README](./README.md)。

## When to Share

當 supervisor-portal 也需要相同 list 功能時，把可共用的部分抽到 `@product-ui/react`。

**核心原則：最大化重用，最小化 App 層代碼。**

App 層只做「不得不做」的事：

1. 呼叫 app-specific 的 API endpoint
2. 處理 app-specific 的路由 / 導航
3. 組合 product-ui 提供的 hooks / components

---

## 拆分策略

### 放在 `@product-ui/react/`（盡量多）

```
packages/product-ui/src/components/{resource}-list/
├── index.ts                      # Barrel export
├── types.ts
├── {resource}-ability.ts         # Ability factory
├── use-{resource}-filter.ts      # Filter hook
├── use-{resource}-actions.ts     # Actions hook（callbacks + error/toast）
├── use-{resource}-table.ts       # Table hook
├── use-{resource}-columns.tsx    # Column hook
├── {resource}-filters.tsx        # Filter UI
├── {resource}-table.tsx          # Table UI
├── {resource}-action-cell.tsx    # Action cell
└── {resource}-status-badge.tsx   # Display components
```

### 留在 app 內（盡量少）

```
apps/user-portal/src/features/{resource}/
├── use-{resource}-list.ts        # API call + 組合 product-ui hooks
├── {resource}-list.tsx           # Layout + 路由
└── page.tsx
```

### App 層 hook 應該極簡

```tsx
// apps/user-portal/src/features/container/use-container-list.ts
export function useContainerList() {
  const filter = useContainerFilter() // product-ui
  const { data, isPending } = useContainerQuery(filter.apiParams) // app
  const actions = useContainerActions() // product-ui
  const { table } = useContainerTable({ data, ...actions }) // product-ui
  return { filter, table, isLoading: isPending }
}
```

---

## Cross-Portal Action 一致性（重要）

跨 portal 共用時**兩邊 actions 必須一致**。常見錯誤：user-portal 有某個 action，supervisor-portal 沒實作。

### Checklist

1. **Actions Hook 在 product-ui** 定義所有可能 actions：

   ```tsx
   // product-ui/src/components/{resource}-list/use-{resource}-actions.ts
   export interface UseXXXActionsOptions {
     associate: (payload: {...}) => Promise<void>
     disassociate: (id: string) => Promise<void>
     release?: (id: string) => Promise<void>  // 所有 actions 都列出
   }
   ```

2. **兩邊 endpoints 都要有對應 mutation**：

   ```
   apps/user-portal/src/endpoints/{resource}.ts
   ├── useAssociate{Resource}Mutation       ✓
   ├── useDisassociate{Resource}Mutation    ✓
   └── useRelease{Resource}Mutation         ✓

   apps/supervisor-portal/src/endpoints/{resource}.ts
   ├── useAssociate{Resource}Mutation       ✓
   ├── useDisassociate{Resource}Mutation    ✓
   └── useRelease{Resource}Mutation         ✓  ← 別漏
   ```

3. **兩邊 `useXXXList` 都傳入所有 actions**：

   ```tsx
   // user-portal/use-{resource}-list.ts
   const actions = useXXXActions({ associate, disassociate, release })

   // supervisor-portal/use-{resource}-list.ts
   const actions = useXXXActions({ associate, disassociate, release }) // 兩邊一致
   ```

4. **Table hook 傳入所有 action handlers**：

   ```tsx
   const { table } = useXXXTable({
     data,
     onAssociate: handleAssociate,
     onDisassociate: actions.handleDisassociate,
     onRelease: actions.handleRelease, // 兩邊都傳
   })
   ```

### 為什麼重要

- 使用者預期不同 portal 看到相同功能
- ActionCell 是共用元件，沒傳入的 action 會被隱藏
- 避免「為什麼 supervisor 沒有 release？」這種問題

---

## Package.json Exports

```json
{
  "exports": {
    "./{resource}-list": "./src/components/{resource}-list/index.ts"
  }
}
```

---

## See Also

- [hooks.md](./hooks.md) — Hook composition 細節
- [quick-reference.md](./references/quick-reference.md) — Cross-portal checklist + imports
- [containers-example.md](./references/containers-example.md) — 完整跨 portal 拆分範例
