# 不要做 Barrel Re-export

`index.ts` 不要只是 re-export 其他檔案。每個檔案直接從定義處 import。

```typescript
// ❌ src/features/todo/components/index.ts
export * from './todo-list'
export * from './todo-item'
export * from './todo-form'

// 使用端
import { TodoList, TodoItem } from '@/features/todo/components'
```

```typescript
// ✅ 直接從定義檔 import
import { TodoList } from '@/features/todo/components/todo-list'
import { TodoItem } from '@/features/todo/components/todo-item'
```

## 為什麼

- **Tree-shaking 更精準**：barrel 容易把整包 module 拉進 bundle
- **循環依賴風險**：barrel 是常見的 circular import 源頭
- **跳轉與重構工具更準**：IDE 直接指到定義檔，而非中繼層
- **減少維護成本**：新增檔案不必同步更新 `index.ts`

## 例外

只有當該資料夾本身就是一個對外的「套件 / 模組邊界」時才寫 `index.ts`（例如 `@/components/ui/button` 這種 shadcn 元件，整個資料夾就是一個元件）。專案內部的 feature module、hooks 集合、utils 集合 **不算**。
