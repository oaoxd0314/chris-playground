# Thin Index + 子資料夾

當一個 feature / module 大到不只一個檔案時，用 **thin index + 角色分類子資料夾** 的方式組織，不要把所有東西平鋪在同一層。

## 結構

```
features/<feature>/
  index.tsx          ← thin entry：只做組裝、對外的 public surface
  types.ts           ← 該 feature 共用的 type
  components/        ← UI 子元件
    <feature>-list.tsx
    <feature>-item.tsx
    <feature>-form.tsx
  hooks/             ← 該 feature 專屬的 hook
    use-<x>.ts
```

實際範例：`src/features/todo/`

```
src/features/todo/
  index.tsx
  types.ts
  components/{todo-list,todo-item,todo-form}.tsx
  hooks/...
```

## 規則

- **`index.tsx` 必須是 thin 的**：只負責 composition（把子元件 / hook 組起來）和對外 export 的入口。資料抓取、商業邏輯、複雜 state 都不該塞在這層。
- **子資料夾依「角色」分類，不是依「實作細節」分類**：`components/` / `hooks/` / `utils/` 是角色；`helpers/` / `misc/` / `common/` 不是 — 一看就不知道裡面該放什麼。
- **`types.ts` 放在 feature 根目錄**：跨 components/hooks 共用的型別；只有單一檔案在用的型別就留在那個檔裡。
- **不要從 `index.tsx` 對外 re-export 子檔內容**：使用端要用某個子元件就直接 import `@/features/todo/components/todo-item`，理由見 [barrel-export.md](./barrel-export.md)。`index.tsx` 是「這個 feature 的進入點」，不是 barrel。
- **跨 feature 共用的東西不該放在 feature 裡**：往上提到 `@/components/ui`、`@/components/shared`、`@/hooks`、`@/lib`。Feature 資料夾只裝「只有這個 feature 才會用到」的東西。

## 何時開始拆 / 何時還不用

| 情境                                    | 做法                                 |
| --------------------------------------- | ------------------------------------ |
| feature 只有 1-2 個元件 + 沒有專屬 hook | 一個檔案就好，先不開資料夾           |
| 出現 3+ 個元件，或開始有專屬 hook       | 開 `components/` / `hooks/` 子資料夾 |
| 同類角色檔案 ≥ 2 個（例如兩個 hook）    | 該角色資料夾值得開                   |

> 過早分層比過晚分層糟。先平鋪，等真的長出第二、第三個同類檔案時再拆，比一開始就建好空架子可維護。

## 同樣的 pattern 適用於

- **複雜元件**：一個元件本身就是個 mini module 時（例如 `data-table/` 含 columns、filter、pagination 子元件），用同樣的 thin `index.tsx` + 子檔結構。
- **`src/server/functions/<feature>/`**：`index.ts` 匯出 server functions、`schema.ts` 放 Zod schema — 同樣是 thin entry + 角色分檔。

## Hook 的擺放位置

Hook 在這個專案有三個合法的家，按「使用範圍」分：

| 種類                                    | 位置                            | 例子                                              |
| --------------------------------------- | ------------------------------- | ------------------------------------------------- |
| Server-state / 資料層 hook              | `src/endpoints/<feature>.ts`    | `useTodos`, `useCreateTodo`                       |
| Feature 專屬的 business hook            | `src/features/<feature>/hooks/` | `useTodoFilters`, `useTodoForm`                   |
| 跨 feature 共用的 hook（含 UI utility） | `src/hooks/`                    | `useBreakpoint`, `useDebounce`, `useClickOutside` |

### UI utility hook 放 `src/hooks/`、不要放 `src/components/ui/`

`useBreakpoint`、`useMediaQuery`、`useClickOutside` 這類 UI utility hook 屬於 `src/hooks/`，**不要**塞進 `src/components/ui/`。

- `components/ui/` 的語意是「shadcn-style 視覺元件」，裡面的東西可以直接 render。塞 hook 進去會破壞「打開 `components/ui/` 期待看到元件」的直覺。
- UI utility hook 跟純邏輯 hook 在使用端的形態相同（都是 `import { useX } from '@/hooks/...'`），沒有理由分兩個入口。
- 公司專案把 `useBreakpoint` 放在 UI package 是因為要跨 app 重用 + 跟 design system token 綁；單一 app 下，`src/hooks/` 就是它的對應物。

### `src/hooks/` 何時要切子資料夾

延續同章節「≥2 同類才開資料夾」的原則：

```
# 還少時，平鋪
src/hooks/
  use-breakpoint.ts
  use-debounce.ts

# 多了之後（~6-8 檔且能明顯分群）才切
src/hooks/
  ui/                ← viewport / DOM / 互動
    use-breakpoint.ts
    use-media-query.ts
    use-click-outside.ts
  utils/             ← 純邏輯、無 UI 依賴
    use-debounce.ts
    use-local-storage.ts
```

### 邊界判斷：`src/hooks/` vs `features/<x>/hooks/`

問自己：**「另一個 feature 會不會需要它？」**

- 會 → `src/hooks/`
- 不會 / 目前只有這個 feature 用 → `features/<x>/hooks/`

不要預先猜「未來可能會共用」就上提。第一次出現第二個 feature 真的需要時，再從 `features/<x>/hooks/` 移到 `src/hooks/`。
