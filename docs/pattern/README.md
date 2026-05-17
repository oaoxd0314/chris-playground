# Patterns

UI / 資料層的常用 pattern 整理，主要當作未來開新 feature 時的參考。

## Index

| Pattern                  | When to read                                          | Entry            |
| ------------------------ | ----------------------------------------------------- | ---------------- |
| [Form](./form/README.md) | 開新表單、多步驟表單、共用 form 邏輯                  | `form/README.md` |
| [List](./list/README.md) | 開 list / table 頁、含 filter + pagination 的資料列表 | `list/README.md` |

## Convention for these docs

每個 pattern 目錄都遵循同一結構：

```
{pattern}/
├── README.md              # 入口：overview、quick start、決策樹
├── architecture.md        # 整體結構、檔案組織、命名
├── ...                    # 主題分檔
└── references/            # 延伸資料（完整範例、補充說明）
```

## Localization Notes

這些文件大多是從其他專案（gmicloud 內部）搬過來的個人化筆記，**還沒完成本地化**。閱讀時請注意：

- `@alison-ui/react` / `@product-ui/react` 是原專案的內部 package，本 repo 用 shadcn/ui 取代
- `apps/user-portal` / `apps/supervisor-portal` 是原專案的 monorepo 結構，本 repo 是單一 app
- Confluence / Jira 連結對外部讀者無效，可忽略
- `useContainersList` 等 example hooks 在本 repo 不存在，當作虛擬範例看
