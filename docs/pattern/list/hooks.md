# List Hooks

> `useXXXList` 組合、各 hook 用途、column hook、return 穩定性。
> 回到 [README](./README.md)。

## The useXXXList Hook

核心 pattern：用一個 `useXXXList` hook 封裝所有 list 邏輯，內部組合多個小 hook。

### 對外固定 shape

不論 Pattern A/B/C，`useXXXList` 一律回傳：

```tsx
const { filter, table, isLoading, isEmpty } = useContainerList()
```

| Key         | 說明                                             |
| ----------- | ------------------------------------------------ |
| `filter`    | filter state + handlers                          |
| `table`     | React Table instance                             |
| `isLoading` | loading state                                    |
| `isEmpty`   | **REQUIRED** — `!isPending && data.length === 0` |

**為什麼這樣設計？**

- **Encapsulation**: 內部細節對使用者透明
- **Consistent API**: 不同 List 用同一方式取
- **Hook composition**: 由 `useXXXFilter` / `useXXXActions` / ... 組合而成

---

## Hook 組合模式

```tsx
export function useContainerList() {
  // 1. Filter state（product-ui）— 只管 state，不組 API 參數
  const filter = useContainerFilter()

  // 2. Pagination state — 僅 Pattern A
  const pagination = usePagination(10)

  // 3. API call（app-specific）— 在這裡組 API 參數
  const { data, isPending } = useContainerQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...(filter.searchText && { search: filter.searchText }),
    ...(filter.statusFilter !== 'all' && { status: filter.statusFilter }),
  })

  // 4. Actions with error handling（product-ui）
  const actions = useContainerActions({ viewLog, deleteContainer })

  // 5. Table instance（product-ui，或 Pattern A 內聯）
  const { table } = useContainerTable({
    data,
    isLoading: isPending,
    filterState: filter, // 僅 Pattern B/C
    onViewLog: actions.handleViewLog,
    onDelete: actions.handleDelete,
  })

  const isEmpty = !isPending && (data?.items ?? []).length === 0

  return { filter, table, isLoading: isPending, isEmpty }
}
```

完整範例見 [containers-example.md Step 10](./references/containers-example.md)。

---

## 各 hook 的角色

| Hook               | 位置       | 職責                                      |
| ------------------ | ---------- | ----------------------------------------- |
| `useXXXList`       | app        | All-in-one: API + actions + table         |
| `useXXXFilter`     | product-ui | Filter state（setters + values）          |
| `useXXXActions`    | product-ui | Action handlers + error / toast           |
| `usePagination`    | product-ui | Server-side pagination state（Pattern A） |
| `useXXXTable`      | product-ui | Table instance + optional client filter   |
| `useXXXColumns`    | product-ui | Column 定義 + action cell                 |
| `createXXXAbility` | product-ui | Per-item 權限工廠                         |

---

## Column Hook（必須用 hook + useMemo）

```tsx
// use-xxx-columns.tsx
import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { XXXData } from './types'

const columnHelper = createColumnHelper<XXXData>()

interface UseXXXColumnsProps {
  onEdit?: (item: XXXData) => void
  onDelete?: (item: XXXData) => void
}

export function useXXXColumns({ onEdit, onDelete }: UseXXXColumnsProps = {}) {
  return useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue(),
      }),
      columnHelper.display({
        id: 'actions',
        cell: ({ row }) => (
          <ActionMenu
            onEdit={() => onEdit?.(row.original)}
            onDelete={() => onDelete?.(row.original)}
          />
        ),
      }),
    ],
    [onEdit, onDelete]
  )
}
```

**為什麼用 hook：**

- `useMemo` 確保 columns 不會每次 re-render 重新建立
- 可以接 action callbacks (`onEdit`, `onDelete`)
- 可以接 selection state
- Stable reference 避免 table 不必要的 re-render

`accessor()` vs `display()` 對 global filter 的影響見 [patterns.md](./patterns.md#column-定義accessor-vs-display)。

---

## Hook Return Stability（polling 重要）

當 list 使用 polling（`refetchInterval`），**hook 的 return object 必須穩定**，否則整個 table 會不必要地重新渲染。

### 問題

```tsx
// ❌ 錯誤
export function useXXXFilter() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return { searchValue, statusFilter, setSearchValue, setStatusFilter }
}
```

連鎖反應：

1. Polling 觸發 parent re-render
2. `useXXXFilter()` 回傳新 object（即使值相同）
3. `filterState` reference 改變
4. `useReactTable` 的 `globalFilter` 重算
5. **整個 table 所有 rows 重渲染**

### 解法

```tsx
// ✅ 正確：useMemo 包 return object
export function useXXXFilter() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const resetFilters = useCallback(() => {
    setSearchValue('')
    setStatusFilter('all')
  }, [])

  return useMemo(
    () => ({
      searchValue,
      statusFilter,
      setSearchValue,
      setStatusFilter,
      resetFilters,
    }),
    [searchValue, statusFilter, resetFilters]
  )
}
```

### 哪些 hook 要包

| Hook            | Return             | 為什麼                              |
| --------------- | ------------------ | ----------------------------------- |
| `useXXXFilter`  | `useMemo`          | 傳給 `useXXXTable` 當 `filterState` |
| `useXXXColumns` | `useMemo`          | 傳給 `useReactTable` 當 `columns`   |
| `useXXXActions` | 個別 `useCallback` | 傳給 columns 當 action callbacks    |

**Note**: `useState` 的 setter 和 `useCallback` 包過的 function 已經 stable，不用再處理。

---

## Data Reference Stability

傳給 `useXXXTable` 的 `data` 必須有穩定 reference；在 `useXXXTable` 內用 `useMemo` 處理 fallback：

```tsx
// ✅ useXXXTable 內做 fallback
export function useContainerTable({ data }: { data: Container[] | undefined }) {
  const items = useMemo(() => data ?? [], [data])
  const table = useReactTable({ data: items /* ... */ })
}

// ✅ useXXXList 直接傳原值，不做 ?? []
export function useContainerList() {
  const { data } = useContainerQuery()
  const { table } = useContainerTable({ data: data?.items })
}
```

---

## See Also

- [patterns.md](./patterns.md) — Pattern A/B/C、column 規則、row actions
- [pitfalls.md](./pitfalls.md) — 完整地雷清單
- [containers-example.md Step 4-7](./references/containers-example.md) — Column / Filter / Actions / Table hook 範例
