# TypeScript 規範

## 類型定義優先級

1. **Type** - 大多數場景的首選 (更簡潔)
2. **Union Type** - 變體、狀態列舉
3. **Generic** - 可重用的工具
4. **Interface** - 僅用於擴展/實作 (不可變契約)

```typescript
// ✅ 元件 Props (偏好 type)
type ButtonProps = {
  variant: 'primary' | 'secondary'
  onClick: () => void
  disabled?: boolean
}

// ✅ 狀態列舉 (union type)
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ✅ 泛型工具
function createApiHook<T>(endpoint: string): QueryHook<T> { ... }

// ✅ Interface 僅用於需要擴展的契約
interface ApiResponse {
  status: number
  message: string
}

interface ExtendedApiResponse extends ApiResponse {
  data: unknown
}
```

## 常見模式

### API 響應類型

```typescript
type ApiResponse<T> = {
  data: T
  status: number
  message?: string
}

type User = {
  id: string
  name: string
  email: string
}

type GetUserResponse = ApiResponse<User>
```

### 狀態類型

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
```

### 元件 Props 類型

```typescript
type ComponentProps = {
  title: string
  description?: string
  onAction: (id: string) => void
  children?: ReactNode
}
```

## 檔案命名規範

### Type 定義檔案

```typescript
// ✅ 使用 .ts 而非 .d.ts
// types/user.ts
export type User = {
  id: string
  name: string
}

// ❌ 避免 .d.ts (除非是 ambient declarations)
// types/user.d.ts
```

**原因**: `.d.ts` 檔案是 ambient declarations，應該只用於描述外部模組的類型，不應用於應用程式內部的類型定義。

參考: [TypeScript Issue #52593](https://github.com/microsoft/TypeScript/issues/52593#issuecomment-1419505081)

## TypeScript 最佳實踐

- [ ] 使用嚴格的 TypeScript 配置
- [ ] 為所有函數參數和返回值添加類型
- [ ] 優先使用 `type` 而非 `interface`
- [ ] 使用 Union Types 定義狀態枚舉
- [ ] 避免使用 `any` 類型
- [ ] 使用泛型提高代碼重用性
