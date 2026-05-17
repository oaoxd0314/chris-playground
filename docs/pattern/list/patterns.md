# List Patterns

> Pattern A / B / C 選擇、column 定義規則、row actions、dialogs。
> 回到 [README](./README.md)。

## Pattern Selection

```
API 支援 pagination?
├─ Yes → Pattern A: Full Server
│        └─ manualPagination: true
│        └─ Filter 也必須 server-side
│
└─ No  → API 回傳全部資料
         ├─ API 支援 filter? → Pattern C: Hybrid
         └─ API 不支援 filter? → Pattern B: Full Client
```

| Pattern        | Pagination                | Filter                 | API 要求            | 適用     |
| -------------- | ------------------------- | ---------------------- | ------------------- | -------- |
| A: Full Server | `manualPagination: true`  | Server                 | pagination + filter | 大資料量 |
| B: Full Client | `getPaginationRowModel()` | Client (`filterState`) | 無                  | < 500 筆 |
| C: Hybrid      | `getPaginationRowModel()` | Server + Client        | 部分 filter         | 中等     |

**⚠️ 避免** Server Pagination + Client Filtering（只能過濾當前頁）。

完整 Pattern A/B/C 範例見 [containers-example.md Step 10](./references/containers-example.md)。

---

## Pattern A：Page Reset on Filter Change（必做）

`manualPagination: true` 時，TanStack Table 的 `autoResetPageIndex` **無效**。
search / filter 改變時**必須手動 `setPage(1)`**，否則使用者在末頁搜尋會看到空結果。

```tsx
// ✅ 正確
const handleSearchChange = (value: string) => {
  setSearchValue(value)
  setPage(1)
}

// ❌ 錯誤：直接把 setSearchValue 給 search component
;<SearchInput onSearchChange={setSearchValue} />
```

任何 filter 變更同理：

```tsx
const handleFilterChange = (value: string) => {
  setFilterValue(value)
  setPage(1)
}
```

---

## Column 定義：`accessor()` vs `display()`

**規則：要被 global filter 搜尋的欄位必須用 `accessor()`，不能 `display()`。**

```tsx
// ✅ accessor() — global filter 可搜尋
columnHelper.accessor('name', {
  header: 'Name',
  cell: ({ row }) => <ResourceNameWithId name={row.original.name} />,
})

columnHelper.accessor('description', {
  header: 'Description',
  cell: ({ row }) => <div>{row.original.description || 'N/A'}</div>,
})

// ❌ display() — global filter 無法搜尋
columnHelper.display({
  id: 'name',
  header: 'Name',
  cell: ({ row }) => <ResourceNameWithId name={row.original.name} />,
})
```

**為什麼：**

- `accessor()` 會從 data 取值，讓 TanStack Table 知道欄位的「值」
- `display()` 只負責渲染，不提供值給 filter

| Helper       | 用途                                         | Global Filter |
| ------------ | -------------------------------------------- | ------------- |
| `accessor()` | 資料欄位（name、status、description）        | ✅ 可搜尋     |
| `display()`  | 非資料欄位（actions、checkbox、computed UI） | ❌ 不可搜尋   |

搭配：

```tsx
const table = useReactTable({
  data,
  columns,
  state: { globalFilter: searchValue },
  globalFilterFn: 'includesString',
  getFilteredRowModel: getFilteredRowModel(),
})
```

---

## Row Actions：Ability + ActionCell

每個 row 根據自身狀態決定可執行 actions。用 **Ability + ActionCell** 模式。

### Ability Factory

用 CASL 建 per-item ability：

```tsx
// xxx-ability.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export function createXXXAbility(item: XXXData) {
  const { can, build } = new AbilityBuilder(createMongoAbility)

  if (item.status === 'running') {
    can('action', 'stop')
  }
  if (item.status !== 'pending') {
    can('action', 'delete')
  }

  return build()
}
```

### Action Cell

```tsx
// xxx-action-cell.tsx
export function XXXActionCell({ item, onEdit, onDelete }: Props) {
  const ability = useMemo(() => createXXXAbility(item), [item])

  return (
    <DropdownMenu.Root>
      {ability.can('action', 'edit') && (
        <DropdownMenu.Item onClick={() => onEdit(item)}>Edit</DropdownMenu.Item>
      )}
      {ability.can('action', 'delete') && (
        <DropdownMenu.Item onClick={() => onDelete(item)}>
          Delete
        </DropdownMenu.Item>
      )}
    </DropdownMenu.Root>
  )
}
```

**為什麼：**

- **Per-item permissions**: 每 row 依自身狀態決定 actions
- **Centralized logic**: 權限邏輯集中在 ability factory
- **Reusable**: ActionCell 可在 table / detail page 重用

完整實作見 [containers-example.md Step 2-3](./references/containers-example.md)。

---

## Action Dialogs

Row actions 常需要開 dialog。使用 **imperative dialog** 避免複雜 state 管理。

### Simple Dialogs

confirm / input / type-to-confirm：

```tsx
import { confirmDialog } from '@alison-ui/react/confirm-dialog'

columnHelper.display({
  id: 'actions',
  cell: ({ row }) => (
    <Button
      onClick={() => {
        confirmDialog({
          title: 'Delete Container',
          description: `Are you sure you want to delete "${row.original.name}"?`,
          confirmVariant: 'destructive',
          onConfirm: async () => {
            await deleteContainer(row.original.id)
          },
        })
      }}
    >
      Delete
    </Button>
  ),
})
```

### Custom Dialogs（Overlays）

複雜 UI（edit form、wizard）用 `openOverlay`：

```tsx
import { openOverlay } from '@alison-ui/react/overlay'
import { EditContainerDialog } from './edit-container-dialog'

onClick={() => {
  openOverlay(EditContainerDialog, {
    container: row.original,
    onSuccess: () => refetch(),
  })
}}
```

Dialog 元件需接 `open` / `onOpenChange`：

```tsx
interface EditContainerDialogProps {
  container: ContainerWithSpec
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditContainerDialog({
  container,
  open,
  onOpenChange,
  onSuccess,
}: EditContainerDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>{/* ... */}</Dialog.Content>
    </Dialog.Root>
  )
}
```

**Setup**：`<Overlays />` 需要 mount 在 app provider（user-portal 已 setup）。

### Imperative Dialog 的好處

| Benefit             | 說明                                        |
| ------------------- | ------------------------------------------- |
| No state management | 不用 `useState` 管 open，不用 prop drilling |
| No dialog mounting  | Provider 在 app root render                 |
| Multiple dialogs    | 每次呼叫都是獨立 instance                   |
| Call from anywhere  | columns / hooks / event handlers 都能用     |
| Linear flow         | Action → Dialog → Result                    |

延伸：[references/action-dialogs.md](./references/action-dialogs.md)。

---

## See Also

- [hooks.md](./hooks.md) — `useXXXList` 組合
- [pitfalls.md](./pitfalls.md) — 完整地雷清單
- [containers-example.md](./references/containers-example.md) — 13-step 完整實作
