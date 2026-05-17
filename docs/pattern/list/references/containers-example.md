# Containers List — Complete Example

> 13-step 完整實作範例（跨 portal 版本），對應 [README](../README.md) 中所有 pattern。
> 本檔來自原專案 user-portal，本 repo 中當虛擬範例參考。

---

## File Structure

**Shared in product-ui (cross-portal):**

```
packages/product-ui/src/components/
├── container-ability/
│   └── index.ts                  # createContainerAbility factory
└── containers/
    ├── index.ts                  # Barrel export
    ├── containers-table.tsx      # Table UI
    ├── containers-filters.tsx    # Filter UI
    ├── containers-action-cell.tsx    # Action cell component
    ├── use-containers-columns.tsx    # Column hook
    ├── use-containers-filter.ts      # Filter hook (state + API params)
    ├── use-containers-table.ts       # Table hook (接收 data，可選 client filter)
    └── types.ts                  # Type definitions
```

**App-specific (each portal):**

```
apps/user-portal/src/features/containers/
├── index.ts                      # Barrel export
├── containers-list.tsx           # Main component (layout only)
└── use-containers-list.ts        # All logic: API + actions + table
```

**Why this split?**
| Location | Contains | Reason |
|----------|----------|--------|
| `product-ui` | Ability, Table, Filters, Column hook, ActionCell, **useXXXTable** | UI、column、table state 共用 |
| `app` | **useXXXList** + List component | 各 portal 的 API endpoint 不同 |

---

## Step 1: Type Definitions (product-ui)

```tsx
// packages/product-ui/src/components/containers/types.ts
export interface ContainerWithSpec {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error' | 'pending'
  templateName?: string
  idc?: string
  ipAddress?: string
  ports?: number[]
  createdAt?: string
  spec?: {
    gpu?: string
    cpu?: string
    memory?: string
  }
}
```

---

## Step 2: Ability Factory (product-ui)

使用 CASL 做 per-item ability 判斷：

```tsx
// packages/product-ui/src/components/container-ability/index.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

import type { ContainerWithSpec } from '../containers/types'

export function createContainerAbility(container: ContainerWithSpec) {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  // View log: 任何狀態都可以
  can('action', 'view-log')

  // Edit: 只有 running 或 stopped 可以
  if (container.status === 'running' || container.status === 'stopped') {
    can('action', 'edit')
  }

  // Terminate: 只有非 pending 可以
  if (container.status !== 'pending') {
    can('action', 'terminate')
  }

  return build()
}
```

---

## Step 3: Action Cell Component (product-ui)

將 action 邏輯抽成獨立 component，所有 action 的顯示都透過 ability 控制：

```tsx
// packages/product-ui/src/components/containers/containers-action-cell.tsx
'use client'

import { useMemo } from 'react'

import { Button } from '@alison-ui/react/button'
import { DropdownMenu } from '@alison-ui/react/dropdown-menu'
import { Tooltip } from '@alison-ui/react/tooltip'
import { confirmDialog } from '@alison-ui/react/confirm-dialog'

import { MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import LogIcon from '@repo/img/icons/log.component.svg'

import type { ContainerWithSpec } from './types'
import { createContainerAbility } from '../container-ability'

interface ContainerActionCellProps {
  item: ContainerWithSpec
  onViewLog?: (item: ContainerWithSpec) => void
  onEdit?: (item: ContainerWithSpec) => void
  onDelete?: (id: string) => Promise<void>
  portal?: 'user' | 'supervisor'
}

export function ContainerActionCell({
  item,
  onViewLog,
  onEdit,
  onDelete,
  portal = 'user',
}: ContainerActionCellProps) {
  const ability = useMemo(() => createContainerAbility(item), [item])

  const canViewLog = ability.can('action', 'view-log')
  const canEdit = ability.can('action', 'edit')
  const canDelete = ability.can('action', 'terminate')

  const handleDelete = () => {
    confirmDialog({
      title: 'Delete Container',
      description: `Are you sure you want to delete "${item.name}"?`,
      confirmText: 'Delete',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        await onDelete?.(item.id)
      },
    })
  }

  return (
    <div className="flex items-center gap-1">
      {/* View Log - Direct button */}
      {canViewLog && onViewLog && (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Button variant="ghost" size="icon" onClick={() => onViewLog(item)}>
              <LogIcon className="h-4 w-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>View Log</Tooltip.Content>
        </Tooltip.Root>
      )}

      {/* More actions in dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {canEdit && onEdit && (
            <DropdownMenu.Item onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenu.Item>
          )}
          {canDelete && onDelete && (
            <DropdownMenu.Item
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}
```

---

## Step 4: Column Hook (product-ui)

使用 `useMemo` 確保 columns 穩定：

```tsx
// packages/product-ui/src/components/containers/use-containers-columns.tsx
'use client'

import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'

import { Badge } from '@alison-ui/react/badge'

import type { ContainerWithSpec } from './types'
import { ContainerActionCell } from './containers-action-cell'

const columnHelper = createColumnHelper<ContainerWithSpec>()

export interface UseContainersColumnsOptions {
  getHref?: (container: ContainerWithSpec) => string
  onViewLog?: (container: ContainerWithSpec) => void
  onEdit?: (container: ContainerWithSpec) => void
  onDelete?: (id: string) => Promise<void>
  portal?: 'user' | 'supervisor'
}

export function useContainersColumns({
  getHref,
  onViewLog,
  onEdit,
  onDelete,
  portal = 'user',
}: UseContainersColumnsOptions = {}) {
  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => {
          const name = row.original.name
          if (getHref) {
            return (
              <Link
                href={getHref(row.original)}
                className="font-medium hover:underline"
              >
                {name}
              </Link>
            )
          }
          return <span className="font-medium">{name}</span>
        },
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue()
          const variant = {
            running: 'success',
            stopped: 'secondary',
            error: 'destructive',
            pending: 'warning',
          }[status] as 'success' | 'secondary' | 'destructive' | 'warning'

          return <Badge variant={variant}>{status}</Badge>
        },
      }),

      columnHelper.accessor('templateName', {
        header: 'Template',
        cell: ({ getValue }) => getValue() ?? '-',
      }),

      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ContainerActionCell
            item={row.original}
            onViewLog={onViewLog}
            onEdit={onEdit}
            onDelete={onDelete}
            portal={portal}
          />
        ),
      }),
    ],
    [getHref, onViewLog, onEdit, onDelete, portal]
  )
}
```

---

## Step 5: Filter Hook (product-ui)

管理 filter state，**只專注於 state 和 handlers**，不處理 API 參數轉換：

```tsx
// packages/product-ui/src/components/containers/use-containers-filter.ts
'use client'

import { useState, useCallback, useMemo } from 'react'

export function useContainersFilter() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value)
  }, [])

  return useMemo(
    () => ({
      // State
      searchText,
      statusFilter,
      // Handlers
      setSearchText: handleSearchTextChange,
      setStatusFilter: handleStatusFilterChange,
    }),
    [searchText, statusFilter, handleSearchTextChange, handleStatusFilterChange]
  )
}

export type ContainersFilterReturn = ReturnType<typeof useContainersFilter>
```

---

## Step 6: Actions Hook (product-ui)

將 action handlers（error handling、toast）抽成共用 hook：

```tsx
// packages/product-ui/src/components/containers/use-containers-actions.ts
'use client'

import { useCallback } from 'react'
import { toast } from '@alison-ui/react/toast'
import { logger } from '@repo/libs/logger'

import type { ContainerWithSpec } from './types'

interface UseContainersActionsOptions {
  viewLog: (container: ContainerWithSpec) => Promise<void>
  deleteContainer: (id: string) => Promise<void>
}

export function useContainersActions({
  viewLog,
  deleteContainer,
}: UseContainersActionsOptions) {
  const handleViewLog = useCallback(
    async (container: ContainerWithSpec) => {
      try {
        await viewLog(container)
      } catch (error) {
        logger.error('Failed to view log', 'Containers', { error })
        toast.error('Failed to view log.')
      }
    },
    [viewLog]
  )

  const handleDelete = useCallback(
    async (containerId: string) => {
      await deleteContainer(containerId)
      toast.success('Container deleted')
    },
    [deleteContainer]
  )

  return { handleViewLog, handleDelete }
}
```

**Why separate?**

- Error handling 和 toast 邏輯在各 portal 相同
- App 層只需傳入 API functions，不需重複寫 try-catch

---

## Step 7: Table Hook (product-ui)

管理 table instance。這個 hook 用於 **client-side pagination** 的情況：

```tsx
// packages/product-ui/src/components/containers/use-containers-table.ts
'use client'

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ContainerWithSpec } from './types'
import type { ContainersFilterState } from './use-containers-filter'
import {
  useContainersColumns,
  type UseContainersColumnsOptions,
} from './use-containers-columns'

interface UseContainersTableOptions extends UseContainersColumnsOptions {
  /** Data from API (各 portal 自己 fetch) */
  data: ContainerWithSpec[] | undefined
  /** Loading state from API */
  isLoading: boolean
  /** 傳入 filter state 啟用 client-side filtering（不傳則假設 server-side） */
  filterState?: ContainersFilterState
}

export function useContainersTable({
  data,
  isLoading,
  filterState,
  // Column options
  getHref,
  onViewLog,
  onEdit,
  onDelete,
  portal = 'user',
}: UseContainersTableOptions) {
  const columns = useContainersColumns({
    getHref,
    onViewLog,
    onEdit,
    onDelete,
    portal,
  })

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Client-side filter（有傳 filterState 才啟用）
    ...(filterState && {
      getFilteredRowModel: getFilteredRowModel(),
      state: { globalFilter: filterState },
      globalFilterFn: (
        row,
        _columnId,
        { searchText, statusFilter }: ContainersFilterState
      ) => {
        const item = row.original
        if (statusFilter !== 'all' && item.status !== statusFilter) return false
        if (
          searchText &&
          !item.name.toLowerCase().includes(searchText.toLowerCase())
        )
          return false
        return true
      },
    }),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return { table, isLoading }
}
```

---

## Step 8: Filter Component (product-ui)

```tsx
// packages/product-ui/src/components/containers/containers-filters.tsx
'use client'

import { Search } from 'lucide-react'

import { InputGroup } from '@alison-ui/react/input-group'
import { Select } from '@alison-ui/react/select'

interface ContainersFiltersProps {
  searchText: string
  setSearchText: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'running', label: 'Running' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'error', label: 'Error' },
  { value: 'pending', label: 'Pending' },
]

export function ContainersFilters({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
}: ContainersFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <InputGroup.Root className="w-64">
        <InputGroup.LeftIcon>
          <Search className="h-4 w-4" />
        </InputGroup.LeftIcon>
        <InputGroup.Input
          placeholder="Search containers..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </InputGroup.Root>

      <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
        <Select.Trigger className="w-40">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {STATUS_OPTIONS.map(option => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  )
}
```

---

## Step 9: Table Component (product-ui)

只負責 DataTable + NoData 邏輯，**不包含 pagination**：

```tsx
// packages/product-ui/src/components/containers/containers-table.tsx
'use client'

import { DataTable } from '@alison-ui/react/data-table'

import { NoData } from '@product-ui/react/no-data'
import type { Table } from '@tanstack/react-table'

import type { ContainerWithSpec } from './types'

interface ContainersTableProps {
  table: Table<ContainerWithSpec>
  isLoading?: boolean
  hasSearchFilter?: boolean
}

export function ContainersTable({
  table,
  isLoading,
  hasSearchFilter,
}: ContainersTableProps) {
  const hasData = table.getRowModel().rows.length > 0

  // 有 filter 但沒結果
  if (!isLoading && !hasData && hasSearchFilter) {
    return (
      <NoData
        title="No Containers Found"
        description="No containers match your search. Try adjusting your filters."
      />
    )
  }

  // 完全沒資料
  if (!isLoading && !hasData) {
    return (
      <NoData
        title="No Containers"
        description="Create your first container to get started."
      />
    )
  }

  return <DataTable table={table} isLoading={isLoading} loadingCount={5} />
}
```

---

## Step 10: useContainersList Hook (App-Specific)

**這是最關鍵的一步**。根據 API 能力選擇實作方式：

### 選擇指南

```
API 支援 pagination?
├─ Yes → Pattern A: Full Server
│        └─ Filters 也必須用 Server-side（否則只能過濾當前頁）
│
└─ No  → API 回傳全部資料
         ├─ API 支援 filter? → Pattern C: Hybrid
         └─ API 不支援 filter? → Pattern B: Full Client
```

---

### Utility: usePagination Hook (Pattern A 專用)

Server-side pagination 需要手動管理 `pageIndex` 和 `pageSize`。抽成共用 hook：

```tsx
// packages/product-ui/src/hooks/use-pagination.ts
'use client'

import { useState, useCallback } from 'react'
import type { PaginationState, Updater } from '@tanstack/react-table'

export function usePagination(initialPageSize = 10) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const resetPage = useCallback(() => setPageIndex(0), [])

  const paginationState: PaginationState = { pageIndex, pageSize }

  const onPaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      setPageIndex(next.pageIndex)
      setPageSize(next.pageSize)
    },
    [pageIndex, pageSize]
  )

  return {
    paginationState,
    onPaginationChange,
    resetPage,
    pageIndex,
    pageSize,
  }
}
```

**Export from product-ui:**

```tsx
// packages/product-ui/src/hooks/index.ts
export * from './use-pagination'

// packages/product-ui/package.json
{
  "exports": {
    "./hooks": "./src/hooks/index.ts"
  }
}
```

---

### Pattern A: Full Server (API 支援 pagination + filter)

適用於大資料量，API 完整支援 pagination 和 filtering。

```tsx
// apps/user-portal/src/features/containers/use-containers-list.ts
'use client'

import { useEffect } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import {
  useContainersFilter,
  useContainersActions,
  useContainersColumns,
} from '@product-ui/react/containers'
import { usePagination } from '@product-ui/react/hooks'

import {
  useContainersQuery,
  useContainerLogActions,
  useDeleteContainerMutation,
} from '@/endpoints/containers'

export function useContainersList() {
  // ============================================
  // Filter & Pagination State
  // ============================================
  const filter = useContainersFilter()
  const pagination = usePagination(10)

  // Reset to first page when filters change
  useEffect(() => {
    pagination.resetPage()
  }, [filter.searchText, filter.statusFilter, pagination.resetPage])

  // ============================================
  // API Call (Server-side pagination + filtering)
  // ============================================
  const { data, isPending } = useContainersQuery({
    page: pagination.pageIndex + 1, // API uses 1-based
    pageSize: pagination.pageSize,
    // 在 list hook 中組合 API 參數
    ...(filter.searchText && { search: filter.searchText }),
    ...(filter.statusFilter !== 'all' && { status: filter.statusFilter }),
  })

  // ============================================
  // Actions (用 product-ui 的 hook)
  // ============================================
  const { viewLog } = useContainerLogActions()
  const { mutateAsync: deleteContainer } = useDeleteContainerMutation()
  const actions = useContainersActions({ viewLog, deleteContainer })

  // ============================================
  // Columns
  // ============================================
  const columns = useContainersColumns({
    getHref: c => `/user-console/containers/${c.id}`,
    onViewLog: actions.handleViewLog,
    onDelete: actions.handleDelete,
    portal: 'user',
  })

  // ============================================
  // Table (Server-side pagination)
  // ============================================
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 0,
    state: { pagination: pagination.paginationState },
    onPaginationChange: pagination.onPaginationChange,
  })

  // ============================================
  // Return
  // ============================================
  return {
    filter,
    table,
    isLoading: isPending,
  }
}
```

---

### Pattern B: Full Client (API 回傳全部資料)

適用於小資料量 (< 500 筆)，API 回傳全部資料，不支援 filter。

```tsx
// apps/user-portal/src/features/containers/use-containers-list.ts
'use client'

import {
  useContainersFilter,
  useContainersActions,
  useContainersTable,
} from '@product-ui/react/containers'

import {
  useContainersQuery,
  useContainerLogActions,
  useDeleteContainerMutation,
} from '@/endpoints/containers'

export function useContainersList() {
  // ============================================
  // Filter State (用 product-ui 的 hook)
  // ============================================
  const filter = useContainersFilter()

  // ============================================
  // API Call (取得全部資料，不帶 filter)
  // ============================================
  const { data: containers, isPending } = useContainersQuery()

  // ============================================
  // Actions (用 product-ui 的 hook)
  // ============================================
  const { viewLog } = useContainerLogActions()
  const { mutateAsync: deleteContainer } = useDeleteContainerMutation()
  const actions = useContainersActions({ viewLog, deleteContainer })

  // ============================================
  // Table Hook (傳 filterState 啟用 client-side filtering)
  // ============================================
  const { table, isLoading } = useContainersTable({
    data: containers,
    isLoading: isPending,
    filterState: filter, // ← Client-side filtering
    getHref: c => `/user-console/containers/${c.id}`,
    onViewLog: actions.handleViewLog,
    onDelete: actions.handleDelete,
    portal: 'user',
  })

  return {
    filter,
    table,
    isLoading,
  }
}
```

---

### Pattern C: Hybrid (API 支援部分 filter，不支援 pagination)

適用於中等資料量，API 支援部分 filter（如 status）但不支援 pagination。

```tsx
// apps/user-portal/src/features/containers/use-containers-list.ts
'use client'

import { useEffect } from 'react'

import {
  useContainersFilter,
  useContainersActions,
  useContainersTable,
} from '@product-ui/react/containers'

import {
  useContainersQuery,
  useContainerLogActions,
  useDeleteContainerMutation,
} from '@/endpoints/containers'

export function useContainersList() {
  // ============================================
  // Filter State
  // ============================================
  const filter = useContainersFilter()

  // ============================================
  // API Call (Server-side filter: status only)
  // ============================================
  const { data: containers, isPending } = useContainersQuery({
    status: filter.statusFilter === 'all' ? undefined : filter.statusFilter,
    // search 不傳給 API，由 client 處理
  })

  // ============================================
  // Actions (用 product-ui 的 hook)
  // ============================================
  const { viewLog } = useContainerLogActions()
  const { mutateAsync: deleteContainer } = useDeleteContainerMutation()
  const actions = useContainersActions({ viewLog, deleteContainer })

  // ============================================
  // Table Hook (Client-side filter for searchText only)
  // ============================================
  const { table, isLoading } = useContainersTable({
    data: containers,
    isLoading: isPending,
    filterState: { searchText: filter.searchText, statusFilter: 'all' }, // 只做 searchText 的 client filter
    getHref: c => `/user-console/containers/${c.id}`,
    onViewLog: actions.handleViewLog,
    onDelete: actions.handleDelete,
    portal: 'user',
  })

  // Server filter 改變時重置頁碼
  useEffect(() => {
    table.setPageIndex(0)
  }, [filter.statusFilter, table])

  return {
    filter,
    table,
    isLoading,
  }
}
```

---

### Pattern 比較

| Pattern        | Pagination                | Filtering              | API 要求            | 適用場景          |
| -------------- | ------------------------- | ---------------------- | ------------------- | ----------------- |
| A: Full Server | `manualPagination: true`  | 全部傳 API             | pagination + filter | 大資料量          |
| B: Full Client | `getPaginationRowModel()` | `filterState`          | 無                  | 小資料量 < 500 筆 |
| C: Hybrid      | `getPaginationRowModel()` | 部分 API + 部分 client | 部分 filter         | 中等資料量        |

**⚠️ 注意**: Server Pagination + Client Filtering 的組合有嚴重問題（只能過濾當前頁），應避免使用。

---

## Step 11: Main List Component (App-Specific)

List component 只負責 **layout**，邏輯都在 `useContainersList` 裡：

```tsx
// apps/user-portal/src/features/containers/containers-list.tsx
'use client'

import Link from 'next/link'

import { Button } from '@alison-ui/react/button'
import { DataTablePagination } from '@alison-ui/react/data-table'

import {
  ContainersFilters,
  ContainersTable,
} from '@product-ui/react/containers'
import { $path } from 'next-typesafe-url'

import { DashboardContent } from '@/app/(dashboard)/_content/dashboard-content'

import { useContainersList } from './use-containers-list'

export function ContainersList() {
  const { filter, table, isLoading } = useContainersList()

  return (
    <DashboardContent.Root
      breadcrumbs={[
        {
          href: $path({ route: '/user-console/containers' }),
          label: 'Containers',
        },
      ]}
    >
      <DashboardContent.Content>
        <DashboardContent.Header className="border-b">
          <div className="flex items-center justify-between">
            <DashboardContent.Title>Containers</DashboardContent.Title>
            <Link href={$path({ route: '/user-console/containers/create' })}>
              <Button>Launch</Button>
            </Link>
          </div>
        </DashboardContent.Header>

        <DashboardContent.Main>
          <div className="space-y-6">
            <ContainersFilters {...filter} />
            <ContainersTable
              table={table}
              isLoading={isLoading}
              hasSearchFilter={filter.hasActiveFilters}
            />
          </div>
        </DashboardContent.Main>

        {/* Pagination 由 app 決定放在 Footer */}
        <DashboardContent.Footer>
          <DataTablePagination table={table} />
        </DashboardContent.Footer>
      </DashboardContent.Content>
    </DashboardContent.Root>
  )
}
```

---

## Step 12: Barrel Exports

**Product UI (shared components):**

```tsx
// packages/product-ui/src/components/containers/index.ts
export * from './types'
export * from './containers-table'
export * from './containers-filters'
export * from './containers-action-cell'
export * from './use-containers-columns'
export * from './use-containers-filter'
export * from './use-containers-actions'
export * from './use-containers-table'
```

**App (app-specific components):**

```tsx
// apps/user-portal/src/features/containers/index.ts
export { ContainersList } from './containers-list'
export { useContainersList } from './use-containers-list'
```

---

## Step 13: Page Entry Point

```tsx
// apps/user-portal/src/app/(dashboard)/user-console/containers/page.tsx
'use client'

import { ContainersList } from '@/features/containers'

export default function ContainersPage() {
  return <ContainersList />
}
```
