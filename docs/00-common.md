# 通用規範 (Common)

## 檔案與資料夾命名

- **檔案與資料夾**: `kebab-case`
- **元件匯出**: `PascalCase`
- **函數**: `camelCase`
- **常數**: `CONSTANTS_CASE`

```typescript
// ✅ 正確
// File: member-data-table.tsx
export function MemberDataTable() { ... }

// File: use-debounce.ts
export function useDebounce() { ... }

// File: constants.ts
export const BASE_URI = 'https://api.example.com'
export const ACCOUNT_TYPE_MAP = {
  account: 'a',
  trading: 'b',
} as const

// ❌ 錯誤
// File: MemberDataTable.tsx
// File: memberDataTable.tsx
```

## 匯入規範

### 匯入路徑優先級

```typescript
// 1. React imports (僅在需要時)
import { useState, useEffect, useMemo } from 'react'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

// 3. 內部模組 (使用 alias)
import { db } from '@/db'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'

// 4. 本地模組 (relative imports)
import { EmptyState } from './empty-state'
import { utils } from './utils'
```

### 路徑 Alias 規則

```typescript
// ✅ 使用 paths alias
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import './local-file'

// ❌ 避免深層相對路徑
import xxx from '../../local-file'
import xxx from '../../../utils'
```

## 命名慣例

### Array 與 List

```typescript
// ✅ 使用 s 或 list 後綴
const statusList = ['active', 'pending', 'closed']
const names = ['Alice', 'Bob', 'Charlie']
const items = [1, 2, 3]
```

### Object/Map/Dictionary

```typescript
// ✅ 使用 dict、dictionary 或 map 後綴
const nameDict = {
  a: 'Alice',
  b: 'Bob',
}

const routeDictionary = {
  home: '/',
  settings: '/settings',
}

const actionMap = {
  edit: () => {},
  preview: () => {},
}
```

## 程式碼風格

### 避免 switch case

使用 object map 取代 switch case：

```typescript
// ❌ 避免 switch case
switch (type) {
  case 'add':
    return handleAdd()
  case 'edit':
    return handleEdit()
  case 'delete':
    return handleDelete()
  default:
    return null
}

// ✅ 使用 object map
const actionMap = {
  add: handleAdd,
  edit: handleEdit,
  delete: handleDelete,
} as const

return actionMap[type]?.() ?? null
```

### 條件判斷優化

```typescript
// ❌ 複雜的條件判斷
if (a !== 1 && b !== 2 && (c !== 3 || d === 5)) {
  return doSomething()
}

// ✅ 使用陣列 iteration
const conditions = [a !== 1, b !== 2, c !== 3 || d === 5]
if (conditions.every(Boolean)) {
  return doSomething()
}
```

### Early Return 模式

```typescript
// ✅ 使用 early return
const handleSubmit = async () => {
  if (items.length === 0) {
    toast.error('No items')
    return
  }

  const results = await submitItems(items)

  if (results.failed.length === 0) {
    toast.success('All succeeded')
    return
  }

  if (results.succeeded.length === 0) {
    toast.error('All failed')
    return
  }

  toast.success(
    `${results.succeeded.length} succeeded, ${results.failed.length} failed`
  )
}

// ❌ 巢狀 if/else
const handleSubmit = async () => {
  if (items.length > 0) {
    const results = await submitItems(items)
    if (results.failed.length > 0) {
      if (results.succeeded.length > 0) {
        toast.success('Partial success')
      } else {
        toast.error('All failed')
      }
    } else {
      toast.success('All succeeded')
    }
  } else {
    toast.error('No items')
  }
}
```

### 批次操作使用 Promise.allSettled

```typescript
// ✅ 使用 Promise.allSettled 並行處理
const results = await Promise.allSettled(
  items.map(item => mutation.mutateAsync(item.id))
)

const succeeded = results.filter(r => r.status === 'fulfilled')
const failed = results.filter(r => r.status === 'rejected')

if (failed.length > 0) {
  if (succeeded.length > 0) {
    toast.success(`${succeeded.length} succeeded, ${failed.length} failed`)
  } else {
    toast.error('All operations failed')
  }
} else {
  toast.success('All operations succeeded')
}

// ❌ 避免 sequential for loop
for (const item of items) {
  await mutation.mutateAsync(item.id) // 逐一等待，效能差
}
```

### FP Pattern 資料轉換

```typescript
import pipe from 'lodash/fp/pipe'

// ✅ 使用 pipe 組合純函數
const processedData = pipe(
  (items: Item[]) => filterItems(items, searchTerm),
  sortItems
)(allItems)

// ❌ 避免多層
const filtered = filterItems(allItems, searchTerm)
const sorted = sortItems(filtered)
```

## 最佳實踐

### 程式碼風格

- [ ] 使用 paths alias 避免深層相對路徑
- [ ] Array 使用 `s` 或 `list` 後綴
- [ ] Object/Map 使用 `dict`、`dictionary` 或 `map` 後綴
- [ ] 避免 switch case，使用 object map
- [ ] 複雜條件使用陣列 iteration
- [ ] 使用 early return 避免巢狀 if/else
- [ ] 批次操作使用 Promise.allSettled
- [ ] 資料轉換使用 lodash/fp/pipe
