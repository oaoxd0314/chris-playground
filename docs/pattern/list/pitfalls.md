# List Pitfalls

> 完整地雷清單與對應解法。
> 回到 [README](./README.md)。

## Quick Index

| Pitfall                                                                                      | 何時會踩到                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------- |
| [Page reset 沒做（Pattern A）](#1-pattern-a-search--filter-變更沒-reset-page)                | manualPagination + search/filter      |
| [`display()` 沒被 filter 搜尋到](#2-display-的欄位無法被-global-filter-搜尋)                 | 用 global filter                      |
| [Polling 造成整個 table re-render](#3-polling-時整個-table-重渲染)                           | 用 `refetchInterval`                  |
| [`data` reference 不穩定](#4-usexxxtable-的-data-reference-不穩定)                           | useXXXTable 傳了 `data ?? []`         |
| [`isEmpty` 顯示時機錯誤](#5-isempty-在-loading-時就顯示)                                     | NoData 在 loading 時閃爍              |
| [Dependent query 不觸發](#6-dependent-query-沒有觸發)                                        | List 帶 reference ID 需要 batch fetch |
| [Cross-portal actions 兩邊不一致](#7-cross-portal-某邊缺-action)                             | 跨 portal 共用                        |
| [`autoResetPageIndex` 不認 server pagination](#1-pattern-a-search--filter-變更沒-reset-page) | manualPagination                      |

---

## 1. Pattern A: search / filter 變更沒 reset page

`manualPagination: true` 時，`autoResetPageIndex` **無效**。使用者在末頁搜尋會看到空結果。

```tsx
// ✅
const handleSearchChange = (value: string) => {
  setSearchValue(value)
  setPage(1)
}

const handleFilterChange = (value: string) => {
  setFilterValue(value)
  setPage(1)
}

// ❌
;<SearchInput onSearchChange={setSearchValue} />
```

---

## 2. `display()` 的欄位無法被 global filter 搜尋

```tsx
// ✅ accessor() — 可被搜尋
columnHelper.accessor('name', {
  cell: ({ row }) => <ResourceNameWithId name={row.original.name} />,
})

// ❌ display() — 不可被搜尋
columnHelper.display({
  id: 'name',
  cell: ({ row }) => <ResourceNameWithId name={row.original.name} />,
})
```

| Helper       | 用途                             | Global Filter |
| ------------ | -------------------------------- | ------------- |
| `accessor()` | 資料欄位                         | ✅            |
| `display()`  | actions / checkbox / computed UI | ❌            |

詳見 [patterns.md → Column 定義](./patterns.md#column-定義accessor-vs-display)。

---

## 3. Polling 時整個 table 重渲染

`useXXXFilter` 每次 render 回傳新 object → `filterState` reference 改 → `globalFilter` 重算 → 整個 table 重渲染。

```tsx
// ✅
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

需要 memoize 的 hooks：

| Hook            | Return             | 為什麼                              |
| --------------- | ------------------ | ----------------------------------- |
| `useXXXFilter`  | `useMemo`          | 傳給 `useXXXTable` 當 `filterState` |
| `useXXXColumns` | `useMemo`          | 傳給 `useReactTable` 當 `columns`   |
| `useXXXActions` | 個別 `useCallback` | 傳給 columns 當 action callbacks    |

---

## 4. `useXXXTable` 的 `data` reference 不穩定

```tsx
// ❌ 外層 ?? [] 每次都是新陣列
const { table } = useXXXTable({ data: data?.items ?? [] })

// ✅ 在 useXXXTable 內 useMemo 做 fallback
export function useContainerTable({ data }: { data: Container[] | undefined }) {
  const items = useMemo(() => data ?? [], [data])
  const table = useReactTable({ data: items })
}

export function useContainerList() {
  const { data } = useContainerQuery()
  const { table } = useContainerTable({ data: data?.items }) // 直接傳
}
```

---

## 5. `isEmpty` 在 loading 時就顯示

```tsx
// ❌
const isEmpty = data.length === 0 // loading 時 data 也是 []

// ✅
const isEmpty = !isPending && data.length === 0
```

`XXXList` 一定要在 `isEmpty` 時 render `<NoData>`，不要 loading 時就閃爍。

```tsx
if (isEmpty) {
  return <NoData title="..." description="..." icon={<InboxIcon />} />
}
return <XXXTable table={table} isLoading={isLoading} />
```

---

## 6. Dependent query 沒有觸發

List 帶 reference ID（如 `orgId`）需要 batch fetch organization 時：

```tsx
// ❌ 缺 enabled
const { data } = useGetOrganizationsQuery({ ids: orgIds })

// ✅
const { data } = useGetOrganizationsQuery(
  { ids: orgIds },
  { enabled: orgIds.length > 0 }
)
```

並且：

- ID 用 `useMemo + Set` 去重
- 用 `Map` O(1) lookup，不要 `.find()`

詳見 [references/dependent-data-fetching.md](./references/dependent-data-fetching.md)。

---

## 7. Cross-portal 某邊缺 action

ActionCell 共用，沒傳入的 action 會被隱藏 → 使用者在某 portal 看不到某 action。

對策見 [cross-portal.md → Action 一致性](./cross-portal.md#cross-portal-action-一致性重要)。

---

## Bonus: Quick Self-Check

開 PR 前對照一次：

- [ ] `useXXXList` 回 `{ filter, table, isLoading, isEmpty }`
- [ ] `isEmpty = !isPending && data.length === 0`
- [ ] `XXXList` 在 `isEmpty` 時 render `<NoData>`
- [ ] `useXXXFilter` / `useXXXColumns` 用 `useMemo` 包 return
- [ ] `useXXXActions` 個別用 `useCallback`
- [ ] `useXXXTable` 內部處理 `data ?? []`，外層直接傳
- [ ] 搜尋 / filter 欄位用 `accessor()` 不是 `display()`
- [ ] Pattern A: search / filter 變更同步 `setPage(1)`
- [ ] 跨 portal: 兩邊 endpoints + `useXXXList` 都實作所有 actions

---

## See Also

- [hooks.md](./hooks.md) — Hook composition 與 stability
- [patterns.md](./patterns.md) — Pattern A/B/C、column 規則
- [cross-portal.md](./cross-portal.md) — 跨 portal 拆分策略
