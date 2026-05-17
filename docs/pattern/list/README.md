# List Pattern

> **Localization note**: 範例引用 `@alison-ui/react`、`@product-ui/react`，以及 `apps/user-portal` / `supervisor-portal` 的 monorepo 結構，這些是原專案的內部設定；本 repo 尚未個人化，閱讀時請對應到本 repo 的等價元件 / 結構。

開 list / table 頁、含 filter + pagination 的資料列表時的參考。

## Table of Contents

| Topic                                            | File                                 |
| ------------------------------------------------ | ------------------------------------ |
| 元件結構、檔案組織、命名、loading / empty state  | [architecture.md](./architecture.md) |
| `useXXXList` 組合、各種 hook 用途、return 穩定性 | [hooks.md](./hooks.md)               |
| Pattern A / B / C 選擇、column 規則、row actions | [patterns.md](./patterns.md)         |
| 跨 portal 共用策略、actions 一致性               | [cross-portal.md](./cross-portal.md) |
| 常見地雷（reference stability、page reset）      | [pitfalls.md](./pitfalls.md)         |

延伸資料（references/）：

- [containers-example.md](./references/containers-example.md) — 13-step 完整範例
- [action-dialogs.md](./references/action-dialogs.md) — Overlays / imperative dialog
- [dependent-data-fetching.md](./references/dependent-data-fetching.md) — list 帶 reference ID 的 batch fetch
- [quick-reference.md](./references/quick-reference.md) — Cross-portal checklist + imports
- [diagrams.md](./assets/diagrams.md) — 架構視覺化

---

## How to Use

1. **確認 API 能力** — 支援 pagination？支援 filter？
2. **選 Pattern** — 用下方決策樹
3. **照範例組合** — [containers-example.md](./references/containers-example.md) Step 1-13
4. **檢查 imports** — [quick-reference.md](./references/quick-reference.md)
5. **Dependent data** — 若 list item 帶 reference ID 需要 batch fetch，見 [dependent-data-fetching.md](./references/dependent-data-fetching.md)
6. **Empty state（必做）** — `useXXXList` 必須回傳 `isEmpty`，`XXXList` 在 `isEmpty` 時 render `<NoData>`

---

## Component Structure

```
List (Main container)
├── Filter        # Search / filter controls
├── Table | ListContent   # 表格用 Table；卡片或其他 layout 用 ListContent
└── Pagination    # Page navigation
```

---

## Pattern Decision Tree

```
API 支援 pagination?
├─ Yes → Pattern A: Full Server
│        └─ usePagination + manualPagination: true
│        └─ Filter 也必須 server-side（否則只能過濾當前頁）
│
└─ No  → API 回傳全部資料
         ├─ API 支援 filter? → Pattern C: Hybrid
         └─ API 不支援 filter? → Pattern B: Full Client
```

| Pattern        | Pagination                | Filter                 | 適用場景          |
| -------------- | ------------------------- | ---------------------- | ----------------- |
| A: Full Server | `manualPagination: true`  | Server                 | 大資料量          |
| B: Full Client | `getPaginationRowModel()` | Client (`filterState`) | 小資料量 < 500 筆 |
| C: Hybrid      | `getPaginationRowModel()` | Server + Client        | 中等資料量        |

**⚠️ 避免** Server Pagination + Client Filtering 組合（只能過濾當前頁）。

詳見 [patterns.md](./patterns.md)。

---

## useXXXList 的固定回傳 shape

不論 Pattern A/B/C，所有 `useXXXList` 對外都回相同形狀：

```tsx
const { filter, table, isLoading, isEmpty } = useContainerList()
//      ^^^^^^   ^^^^^   ^^^^^^^^^   ^^^^^^^
//      filter   React   loading     loaded
//      state    Table   state       且資料為空
//                instance
```

詳見 [hooks.md](./hooks.md)。

---

## Naming Conventions

| Role        | 命名                                                      |
| ----------- | --------------------------------------------------------- |
| 主容器      | `XXXList`                                                 |
| Filter 元件 | `XXXFilters`                                              |
| 顯示元件    | `XXXTable`（表格）/ `XXXListContent`（卡片等其他 layout） |
| Action cell | `XXXActionCell`                                           |
| Ability     | `createXXXAbility`                                        |

**範例：** Users → `UsersList` / `UsersFilters` / `UsersTable`。

---

## File Placement

```
這個 List 需要在 supervisor-portal 也使用嗎？
│
├─ No  → 單一 Portal：全部放在 app 內
│        └─ apps/{portal}/src/.../{resource}/_content/
│
└─ Yes → 跨 Portal 共用：拆分到 product-ui
         └─ 詳見 cross-portal.md
```

詳見 [architecture.md → File Structure](./architecture.md#file-structure) 與 [cross-portal.md](./cross-portal.md)。

---

## Key Takeaways

1. **Naming**: `XXXList` / `XXXFilters` / `XXXTable` / `XXXActionCell`
2. **Hook composition**: `useXXXFilter` + `useXXXActions` + `usePagination` (Pattern A) + `useXXXTable`
3. **Column hook**: 永遠用 `useXXXColumns + useMemo`，確保 stable reference
4. **Column 定義**: 要被 global filter 搜尋的欄位必須用 `accessor()`，不能 `display()`
5. **Row actions**: `createXXXAbility` + `XXXActionCell` 控 per-item 權限
6. **Imperative dialogs**: 簡單用 `confirmDialog`，自訂用 `openOverlay`
7. **Cross-portal**: UI 在 product-ui，API 呼叫留在 app
8. **Cross-portal actions 一致**: 兩邊 endpoints + `useXXXList` 都要實作所有 actions
9. **Polling 用 useMemo**: 用 polling 時，hook return object 必須用 `useMemo` 包裝
10. **Data reference 穩定**: `useXXXTable` 內部用 `useMemo` 處理 fallback，不要在外層 `?? []`
11. **Empty state（必做）**: `useXXXList` 回 `isEmpty`，`XXXList` 在 `isEmpty` 時 render `<NoData>`
12. **Page reset on filter change**（Pattern A）: search / filter 變更必須手動 `setPage(1)`

---

## External Reference

[List Guideline on Confluence](https://gmicloud.atlassian.net/wiki/spaces/Frontend/pages/295403649/List+Guideline)
