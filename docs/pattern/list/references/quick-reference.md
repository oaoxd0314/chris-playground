# Quick Reference

> Cross-portal checklist + 常用 imports + Pattern 速查。
> 回到 [README](../README.md)。

---

## File Placement Decision

```
這個 List 需要在 supervisor-portal 也使用嗎？
│
├─ No  → 單一 Portal：全部放在 app 內
│        └─ 見「Single Portal Structure」
│
└─ Yes → 跨 Portal 共用：拆分到 product-ui
         └─ 見「Cross-Portal Sharing Checklist」
```

---

## Single Portal Structure

當 List 只在單一 portal 使用時，全部放在 app 內：

```
apps/user-portal/src/app/(dashboard)/user-console/{resource}/_content/
├── types.ts                    # Type definitions
├── constants.ts                # Filter constants
├── {resource}-list.tsx         # Main container (calls useXXXTable)
├── components/
│   ├── {resource}-filters.tsx  # Filter UI, receives props
│   └── search-bar.tsx          # Reusable filter components
├── hooks/
│   ├── use-{resource}-table.ts # All-in-one hook (filter + table + actions)
│   └── use-{resource}-columns.tsx  # Optional: column hook
└── table/
    ├── index.tsx               # Barrel export
    ├── {resource}-table.tsx    # Table UI, receives table instance
    └── columns.tsx             # Column definitions
```

**適用情境：** 大多數只在 user-portal 或 supervisor-portal 單獨使用的 List。

---

## Cross-Portal Sharing Checklist

When building a list shared between user-portal and supervisor-portal.

**核心原則：最大化重用，最小化 App 層代碼**

### Put in `@product-ui/react/` (盡量多):

```
packages/product-ui/src/components/{resource}-list/
├── index.ts                      # Barrel export
├── types.ts                      # Type definitions
├── {resource}-ability.ts         # Ability factory
├── use-{resource}-filter.ts      # Filter hook (state + apiParams)
├── use-{resource}-actions.ts     # Actions hook (callbacks + error/toast)
├── use-{resource}-table.ts       # Table hook (接收 data + actions)
├── use-{resource}-columns.tsx    # Column hook
├── {resource}-filters.tsx        # Filter UI
├── {resource}-table.tsx          # Table UI
├── {resource}-action-cell.tsx    # Action cell
└── {resource}-status-badge.tsx   # Display components
```

### Keep in each app (盡量少):

```
apps/user-portal/src/features/{resource}/
├── use-{resource}-list.ts        # 只做：API call + 組合 product-ui hooks
├── {resource}-list.tsx           # 只做：Layout + 路由相關
└── page.tsx                      # Page component
```

**App 層 hook 應該極簡：**

```tsx
export function useContainerList() {
  const filter = useContainerFilter() // from product-ui
  const { data, isPending } = useContainerQuery(filter.apiParams) // app-specific
  const actions = useContainerActions() // from product-ui
  const { table } = useContainerTable({ data, ...actions }) // from product-ui
  return { filter, table, isLoading: isPending }
}
```

### Export Pattern (product-ui package.json):

```json
{
  "exports": {
    "./{resource}-list": "./src/components/{resource}-list/index.ts"
  }
}
```

---

## Key Imports Quick Reference

```tsx
// TanStack React Table
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, Table } from '@tanstack/react-table'

// CASL Ability - 見下方 Product UI imports

// Alison UI - Components
import { DataTable, DataTablePagination } from '@alison-ui/react/data-table'
import { Button } from '@alison-ui/react/button'
import { Dialog } from '@alison-ui/react/dialog'
import { DropdownMenu } from '@alison-ui/react/dropdown-menu'
import { Select } from '@alison-ui/react/select'
import { InputGroup } from '@alison-ui/react/input-group'
import { Tooltip } from '@alison-ui/react/tooltip'
import { toast } from '@alison-ui/react/toast'

// Alison UI - Imperative Dialogs
import { confirmDialog } from '@alison-ui/react/confirm-dialog'
import { inputDialog } from '@alison-ui/react/input-dialog'
import { typeToConfirmDialog } from '@alison-ui/react/type-to-confirm-dialog'

// Alison UI - Overlays (for custom dialogs)
import { openOverlay, closeOverlay, closeAllOverlays } from '@alison-ui/react/overlay'

// Product UI (shared list components)
import {
  type {Resource}WithSpec,
  use{Resource}Filter,       // Filter state + API params
  use{Resource}Actions,      // Actions with error handling + toast
  use{Resource}Table,        // Table hook (接收 data，可選 client filter)
  use{Resource}Columns,
  {Resource}Table,
  {Resource}Filters,
  {Resource}ActionCell,
} from '@product-ui/react/{resource}-list'
import { create{Resource}Ability } from '@product-ui/react/{resource}-ability'
import { usePagination } from '@product-ui/react/hooks'  // Pattern A only
import { NoData } from '@product-ui/react/no-data'

// Routing
import { $path } from 'next-typesafe-url'

// Dashboard layout
import { DashboardContent } from '@/app/(dashboard)/_content/dashboard-content'
```

---

## Pattern Selection Quick Guide

```
API 支援 pagination?
├─ Yes → Pattern A: Full Server
│        └─ manualPagination: true
│        └─ Filters 也必須用 Server-side
│
└─ No  → API 回傳全部資料
         ├─ API 支援 filter? → Pattern C: Hybrid
         │  └─ getPaginationRowModel() + 部分 server filter
         └─ API 不支援 filter? → Pattern B: Full Client
            └─ getPaginationRowModel() + filterState
```

| Pattern | Pagination                       | Filtering              | 適用場景          |
| ------- | -------------------------------- | ---------------------- | ----------------- |
| A       | Server (`manualPagination`)      | Server                 | 大資料量          |
| B       | Client (`getPaginationRowModel`) | Client (`filterState`) | 小資料量 < 500 筆 |
| C       | Client (`getPaginationRowModel`) | Hybrid                 | 中等資料量        |
