# List Architecture Diagrams

> 視覺化 List 元件的架構與資料流。
> 回到 [README](../README.md)。

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ContainersList (App)                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ const { filter, table, isLoading } = useContainersList()               │ │
│  │ • Layout 決策: pagination 放在 DashboardContent.Footer                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│                                    ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                     useContainersList() (App)                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │ 封裝所有邏輯：                                                     │  │ │
│  │  │ • useContainersFilter() → filter state                           │  │ │
│  │  │ • usePagination() → pagination state (Pattern A only)            │  │ │
│  │  │ • useContainersQuery({ search, status, ... }) → API 呼叫          │  │ │
│  │  │ • useContainersActions({ viewLog, deleteContainer }) → actions   │  │ │
│  │  │ • useContainersTable({ data, ... }) → table instance             │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  return { filter, table, isLoading }                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│           ┌────────────────────────┴────────────────────────┐               │
│           │ spread props                                    │ table         │
│           ▼                                                 ▼               │
│  ┌─────────────────────────────┐   ┌─────────────────────────────────────┐  │
│  │    ContainersFilters       │   │        ContainersTable              │  │
│  │    (product-ui)            │   │        (product-ui)                 │  │
│  │    ─────────────────       │   │        ───────────────              │  │
│  │    • searchText            │   │        • table                      │  │
│  │    • onSearchTextChange    │   │        • isLoading                  │  │
│  │    • statusFilter          │   │        • hasSearchFilter            │  │
│  │    • onStatusFilterChange  │   │        ┌─────────────────────────┐  │  │
│  │    ┌───────────────────┐   │   │        │  DataTable / NoData     │  │  │
│  │    │ Input   │ Select  │   │   │        │  (不含 pagination)      │  │  │
│  │    └───────────────────┘   │   │        │  ┌─────────────────────┐│  │  │
│  └─────────────────────────────┘   │        │  │  Column (name)      ││  │  │
│                                    │        │  │  Column (status)    ││  │  │
│                                    │        │  │  Column (actions)───┼┼──┼──┼─┐
│                                    │        │  └─────────────────────┘│  │  │ │
│                                    │        └─────────────────────────┘  │  │ │
│                                    └─────────────────────────────────────┘  │ │
│                                                                             │ │
│  ┌─────────────────────────────────────────────────────────────────────────┐│ │
│  │  DashboardContent.Footer (app 決定 pagination 位置)                     ││ │
│  │  ┌───────────────────────────────────────────────────────────────────┐ ││ │
│  │  │                    DataTablePagination                            │ ││ │
│  │  │                    (from @alison-ui/react)                        │ ││ │
│  │  └───────────────────────────────────────────────────────────────────┘ ││ │
│  └─────────────────────────────────────────────────────────────────────────┘│ │
└─────────────────────────────────────────────────────────────────────────────┘ │
                                                                                │
  ┌─────────────────────────────────────────────────────────────────────────────┘
  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ContainerActionCell (product-ui)                      │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ const ability = useMemo(() => createContainerAbility(item), [item])    │ │
│  │ ──────────────────────────────────────────────────────────────────     │ │
│  │ canViewLog = ability.can('action', 'view-log')                         │ │
│  │ canEdit    = ability.can('action', 'edit')                             │ │
│  │ canDelete  = ability.can('action', 'terminate')                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          ▼                         ▼                         ▼              │
│  ┌───────────────┐       ┌─────────────────┐       ┌─────────────────┐      │
│  │  View Log     │       │   Edit Button   │       │  Delete (in     │      │
│  │  Button       │       │   (if canEdit)  │       │  DropdownMenu)  │      │
│  │  (if canView) │       │                 │       │  (if canDelete) │      │
│  └───────────────┘       └─────────────────┘       └─────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Server-Side Filtering

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Server-Side Filtering                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  useContainersFilter()                                                   │
│         │                                                                │
│         │ filter state: { search, status }                               │
│         ▼                                                                │
│  useContainersQuery({ search, status }) ─▶ API ──────▶ filtered data     │
│         ↑ (API params constructed in list hook)                          │
│         │                                                                │
│         │ data (already filtered by server)                              │
│         ▼                                                                │
│  useContainersTable({ data, isLoading })                                 │
│         │                                                                │
│         │ table (no client filtering)                                    │
│         ▼                                                                │
│  ContainersTable                                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Client-Side Filtering

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Client-Side Filtering                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  useContainersFilter()                                                   │
│         │                                                                │
│         │ (filterParams not used for API)                                │
│         │                                                                │
│  useContainersQuery() ──────────────────▶ API ──────▶ all data           │
│         │                                                                │
│         │ data (all records)    filterState: { searchText, statusFilter }│
│         │                              │                                 │
│         ▼                              ▼                                 │
│  useContainersTable({ data, isLoading, filterState })                    │
│         │                                                                │
│         │ table (with globalFilterFn applied)                            │
│         ▼                                                                │
│  ContainersTable                                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Package Distribution

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        @product-ui/react                                │
├─────────────────────────────────────────────────────────────────────────┤
│  containers/                      │  container-ability/                 │
│  ├── types.ts                     │  └── index.ts                       │
│  ├── use-containers-filter.ts     │      • createContainerAbility()     │
│  ├── use-containers-actions.ts    │                                     │
│  ├── use-containers-table.ts      │  hooks/                             │
│  ├── use-containers-columns.tsx   │  └── use-pagination.ts              │
│  ├── containers-filters.tsx       │      • usePagination() ← Pattern A  │
│  ├── containers-table.tsx         │                                     │
│  └── containers-action-cell.tsx   │                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ imports
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    apps/user-portal (or supervisor-portal)              │
├─────────────────────────────────────────────────────────────────────────┤
│  features/containers/             │  endpoints/containers.ts            │
│  ├── containers-list.tsx          │  • useContainersQuery()             │
│  ├── use-containers-list.ts       │  • useDeleteContainerMutation()     │
│  └── index.ts                     │  • useContainerLogActions()         │
│                                   │                                     │
│  app/.../containers/page.tsx      │                                     │
│  └── <ContainersList />           │                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Hooks Relationship

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Hooks Overview                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │  useContainersList (App)  ← All-in-one hook for List component      │
  │  ─────────────────────────────────────────────────────────────────  │
  │                                                                     │
  │  ┌───────────────────────┐  ┌───────────────────────┐               │
  │  │  useContainersFilter  │  │  usePagination        │               │
  │  │  ───────────────────  │  │  ─────────────────    │               │
  │  │  Returns:             │  │  (Pattern A only)     │               │
  │  │  • searchText         │  │  Returns:             │               │
  │  │  • statusFilter       │  │  • paginationState    │───┐           │
  │  │  • setSearchText      │  │  • onPaginationChange │   │           │
  │  │  • setStatusFilter    │  │  • resetPage          │   │           │
  │  └───────────────────────┘  └───────────────────────┘   │           │
  │           │                                             │           │
  │           │ filter state (API params built in list hook)│           │
  │           ▼                                             ▼           │
  │  ┌─────────────────────────────────────────────────────────────┐    │
  │  │                      API Query                              │    │
  │  │  useContainersQuery({ search, status, page, pageSize })     │    │
  │  └─────────────────────────────────────────────────────────────┘    │
  │           │                                                         │
  │           │ data, isPending                                         │
  │           ▼                                                         │
  │  ┌───────────────────────┐  ┌───────────────────────┐               │
  │  │  useContainersActions │  │  useContainersTable   │               │
  │  │  ───────────────────  │  │  ───────────────────  │               │
  │  │  Accepts:             │  │  Accepts:             │               │
  │  │  • viewLog (from API) │  │  • data               │               │
  │  │  • deleteContainer    │  │  • isLoading          │               │
  │  │  ───────────────────  │  │  • filterState?       │               │
  │  │  Returns:             │  │  • column options     │               │
  │  │  • handleViewLog      │  │  ───────────────────  │               │
  │  │  • handleDelete ──────┼──┼▶ Returns:             │               │
  │  └───────────────────────┘  │  • table              │               │
  │                             │  • isLoading          │               │
  │                             └───────────────────────┘               │
  │                                      │                              │
  │                                      │ uses                         │
  │                                      ▼                              │
  │                             ┌───────────────────────┐               │
  │                             │  useContainersColumns │               │
  │                             │  ───────────────────  │               │
  │                             │  Accepts:             │               │
  │                             │  • getHref            │               │
  │                             │  • onViewLog          │◀── from       │
  │                             │  • onEdit             │    actions    │
  │                             │  • onDelete           │               │
  │                             │  • portal             │               │
  │                             │  ───────────────────  │               │
  │                             │  Returns:             │               │
  │                             │  • ColumnDef[]        │               │
  │                             └───────────────────────┘               │
  │                                                                     │
  │  return { filter, table, isLoading } ───▶ ContainersList (render)   │
  └─────────────────────────────────────────────────────────────────────┘
```

---

## Summary Table

| Component/Hook           | Location   | Responsibility                                   |
| ------------------------ | ---------- | ------------------------------------------------ |
| `useContainersList`      | **app**    | All-in-one: API + actions + table (app-specific) |
| `useContainersFilter`    | product-ui | Filter state only (setters + values)             |
| `useContainersActions`   | product-ui | Action handlers with error/toast                 |
| `usePagination`          | product-ui | Server-side pagination state (Pattern A)         |
| `useContainersTable`     | product-ui | Table instance + optional client filter          |
| `useContainersColumns`   | product-ui | Column definitions + action cell                 |
| `ContainersFilters`      | product-ui | Filter UI                                        |
| `ContainersTable`        | product-ui | Table UI (DataTable + NoData)                    |
| `ContainerActionCell`    | product-ui | Row actions with ability checks                  |
| `createContainerAbility` | product-ui | Per-item ability factory                         |
| `ContainersList`         | **app**    | Layout only (uses useContainersList)             |
