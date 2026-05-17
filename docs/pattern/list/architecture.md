# List Architecture

> 元件結構、檔案組織、命名、loading / empty state。
> 回到 [README](./README.md)。

## Component Structure

```
List
├── Filter        # Search / filter controls
├── Table | ListContent
└── Pagination
```

| Role        | 命名                          | 範例（Users）        |
| ----------- | ----------------------------- | -------------------- |
| 主容器      | `XXXList`                     | `UsersList`          |
| Filter      | `XXXFilters`                  | `UsersFilters`       |
| 顯示        | `XXXTable` / `XXXListContent` | `UsersTable`         |
| Action cell | `XXXActionCell`               | `UsersActionCell`    |
| Ability     | `createXXXAbility`            | `createUsersAbility` |

---

## File Structure

```
xxx-list/
├── index.ts                    # Barrel export
├── xxx-list.tsx                # 主元件，呼叫 useXXXList
├── xxx-filters.tsx             # Filter UI，props 接 state
├── xxx-table.tsx               # Table UI，props 接 table instance
├── xxx-action-cell.tsx         # Action cell（ability checks）
├── use-xxx-filter.ts           # Filter hook（state）
├── use-xxx-actions.ts          # Actions hook（callbacks + error/toast）
├── use-xxx-table.ts            # Table hook（建 table instance）
├── use-xxx-columns.tsx         # Column hook（return memoized columns）
└── (optional) xxx-ability.ts   # 每個 item 的權限工廠
```

跨 portal 共用時的拆分見 [cross-portal.md](./cross-portal.md)。

---

## File Placement

```
這個 List 需要在 supervisor-portal 也使用嗎？
│
├─ No  → 單一 Portal：全部放在 app 內
│        └─ app/(dashboard)/user-console/{resource}/_content/
│        └─ 或 features/{resource}/
│
└─ Yes → 跨 Portal 共用：拆分到 product-ui（見 cross-portal.md）
```

### 單一 Portal 範例

```
apps/user-portal/src/app/(dashboard)/user-console/{resource}/_content/
├── types.ts
├── constants.ts
├── {resource}-list.tsx
├── components/
│   ├── {resource}-filters.tsx
│   └── search-bar.tsx
├── hooks/
│   ├── use-{resource}-table.ts     # All-in-one
│   └── use-{resource}-columns.tsx
└── table/
    ├── index.tsx
    ├── {resource}-table.tsx
    └── columns.tsx
```

**特點：** 簡單直接，適合多數只在單一 portal 使用的 List。

---

## Loading & Empty States

### Loading — `TableSkeleton`

```tsx
import TableSkeleton from '@/components/table-skeleton'

;<TableSkeleton rows={10} columns={5} />

// 含 filter skeleton
{
  isLoading && (
    <section>
      <Skeleton className="mb-6 h-[44px] w-full" />
      <TableSkeleton rows={10} />
    </section>
  )
}
```

### Empty — `NoData`（**必做**）

```tsx
import { NoData } from '@product-ui/react/no-data'
import { InboxIcon } from 'lucide-react'

;<NoData
  title="No data found"
  description="Try adjusting your filters or create a new item."
  icon={<InboxIcon />}
  actionButton={<Button>Create New</Button>} // Optional
/>
```

**規則：**

- `isEmpty` 必須是 `!isPending && data.length === 0` — loading 中不顯示 NoData
- `title` / `description` / `icon` 必填
- `actionButton` 視情況加（例如 "Create New" CTA）

### Combined — `TableLayout`（optional）

包好 loading + empty 的 wrapper：

```tsx
import TableLayout from '@/components/table-layout'

;<TableLayout
  data={data}
  isLoading={isLoading}
  emptyTitle="No containers"
  emptyDescription="Create your first container to get started."
  hasFilter
  emptyActionButton={<Button>Create Container</Button>}
>
  {data => <ContainerTable data={data} />}
</TableLayout>
```

---

## XXXList Empty State Pattern

```tsx
export function ContainerList() {
  const { filter, table, isLoading, isEmpty } = useContainerList()

  return (
    <div className="space-y-4">
      <ContainerFilters {...filter} />
      {isEmpty ? (
        <NoData
          title="No containers"
          description="Create your first container to get started."
          icon={<InboxIcon />}
        />
      ) : (
        <ContainerTable table={table} isLoading={isLoading} />
      )}
    </div>
  )
}
```

---

## See Also

- [hooks.md](./hooks.md) — `useXXXList` / `useXXXFilter` / `useXXXTable` 細節
- [patterns.md](./patterns.md) — Pattern A/B/C
- [cross-portal.md](./cross-portal.md) — 跨 portal 拆分
- [containers-example.md](./references/containers-example.md) — 13-step 完整實作
