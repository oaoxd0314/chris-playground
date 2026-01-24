# React 規範

## React Import 統一規範

得益於新的 JSX Transform，可選擇性 import React：

```typescript
// ✅ 使用 React hooks 的檔案 - 只 import 需要的 hooks
import { useState, useEffect, useMemo, useCallback } from 'react'

export function MyComponent() {
  const [count, setCount] = useState(0)
  // ...
}

// ✅ 純 JSX 組件檔案 - 無需 import React
export function PureComponent({ title }: { title: string }) {
  return <h1>{title}</h1>
}

// ✅ 類型定義 - 直接 import 需要的類型
import { useState, type ReactNode, type FC } from 'react'

interface Props {
  children: ReactNode // 不是 React.ReactNode
}

// ❌ 避免不必要的 React import
import React from 'react' // 不需要

export function SimpleComponent() {
  return <div>Hello</div>
}

// ❌ 避免 React. 前綴
React.useEffect(() => {}, []) // 應該是 useEffect(() => {}, [])
React.useState(0) // 應該是 useState(0)
const node: React.ReactNode // 應該是 ReactNode
```

## 元件結構模式

```typescript
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

type ComponentProps = {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: ComponentProps) {
  // 1. Hooks & state 優先
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Side effects
  }, [])

  // 2. 早期返回處理邊界情況
  if (!title) return null

  // 3. 事件處理器
  const handleClick = () => {
    setIsLoading(true)
    onAction()
  }

  // 4. 主要渲染
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </Button>
    </div>
  )
}
```

## React Hooks 最佳實踐

### 依賴陣列規則

- ✅ 使用 **原始值** (string, number, boolean)
- ✅ 使用 **來自 useState/useRef 的值** (React 保證穩定)
- ❌ 避免 **objects/arrays** (每次渲染都是新引用)

```typescript
// ✅ 正確 - 原始值和穩定值
const [searchTerm, setSearchTerm] = useState('') // 穩定引用
const filteredData = useMemo(
  () => data.filter(item => item.name.includes(searchTerm)),
  [data, searchTerm] // 兩者都是穩定的
)

// ❌ 錯誤 - 物件依賴導致無限重新渲染
const config = { sort: 'name' } // 每次渲染都是新物件
const sortedData = useMemo(
  () => data.sort((a, b) => a[config.sort] - b[config.sort]),
  [config] // config 每次渲染都改變 = 無限迴圈
)
```

### 記憶化策略

#### 何時使用 useMemo

```typescript
// ✅ 昂貴的計算
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => {
    return acc + performExpensiveCalculation(item)
  }, 0)
}, [data])

// ❌ 簡單的操作不需要 useMemo
const simpleValue = useMemo(() => items.length > 0, [items]) // 不必要
const simpleValue = items.length > 0 // 更好
```

#### 何時使用 useCallback

```typescript
// ✅ 傳遞給昂貴子元件的回調
const handleExpensiveAction = useCallback(
  (id: string) => {
    onAction(id)
  },
  [onAction]
)

return <ExpensiveChild onAction={handleExpensiveAction} />

// ❌ 簡單的事件處理器不需要 useCallback
const handleClick = useCallback(() => setCount(c => c + 1), []) // 不必要
const handleClick = () => setCount(c => c + 1) // 更好
```

### 一般元件 vs Custom Hooks

**重要原則**: 在一般元件中避免使用 `useCallback` 和 `useMemo`，除非是 custom hooks。

```typescript
// ✅ Custom Hook - 需要穩定化輸出
export function useTableFilter(data: Item[]) {
  const [search, setSearch] = useState('')

  const filteredData = useMemo(
    () => data.filter(item => item.name.includes(search)),
    [data, search]
  )

  const handleSearch = useCallback((value: string) => setSearch(value), [])

  return { filteredData, search, handleSearch }
}

// ✅ 一般元件 - 不需要 useCallback/useMemo
export function SearchBar({ value, onChange }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return <Input value={value} onChange={handleChange} />
}
```

### Custom Hooks 穩定性規範

```typescript
// ✅ 穩定的 custom hook
export function useFeatureIndicators() {
  const data = useMemo(() => processData(), [dependencies])

  const getFeatureInfo = useCallback((key: string) => data[key], [data])

  const isOverridden = useCallback(
    (key: string) => data[key]?.isOverridden || false,
    [data]
  )

  return {
    data, // useMemo 包裝的值
    getFeatureInfo, // useCallback 包裝的函數
    isOverridden, // useCallback 包裝的函數
  }
}

// ❌ 不穩定的 custom hook
export function useFeatureIndicators() {
  const data = processData() // 每次渲染都重新計算

  return {
    data,
    // 每次渲染都產生新的函數引用
    getFeatureInfo: (key: string) => data[key],
    isOverridden: (key: string) => data[key]?.isOverridden || false,
  }
}
```

### 複雜邏輯應抽取為 Helper Function

```typescript
// ❌ 不好測試 - 邏輯藏在 useMemo 裡
export function DataTable({ data, filters }: Props) {
  const processedData = useMemo(() => {
    return data
      .filter(item => item.status === filters.status)
      .map(item => ({
        ...item,
        formattedDate: formatDate(item.createdAt),
        displayName: `${item.firstName} ${item.lastName}`,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [data, filters])

  return <Table data={processedData} />
}

// ✅ 好測試 - 抽取為 pure function
export function processTableData(data: Item[], filters: Filters) {
  return data
    .filter(item => item.status === filters.status)
    .map(item => ({
      ...item,
      formattedDate: formatDate(item.createdAt),
      displayName: `${item.firstName} ${item.lastName}`,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function DataTable({ data, filters }: Props) {
  const processedData = useMemo(() => processTableData(data, filters), [data, filters])

  return <Table data={processedData} />
}

// 現在可以輕鬆寫 unit test
describe('processTableData', () => {
  it('should filter by status', () => {
    const result = processTableData(mockData, { status: 'active' })
    expect(result.every(item => item.status === 'active')).toBe(true)
  })
})
```

## 條件渲染策略

```typescript
// ✅ 複雜條件使用早期返回
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <EmptyState />
return <MainContent data={data} />

// ✅ 簡單條件使用短路運算
{showModal && <Modal />}
{items.length > 0 && <ItemList items={items} />}

// ❌ 避免複雜的巢狀三元運算子
{isLoading ? <Spinner /> : error ? <Error /> : data ? <Content /> : <Empty />}
```

## className 處理

```typescript
import { cn } from '@/lib/utils'

// ✅ 使用 cn 函數
<div className={cn('base-class', conditionalClass)} />
<div className={cn('text-sm p-4', isActive && 'bg-blue-500', className)} />

// ❌ 避免字串拼接
<div className={`base-class ${conditionalClass || ''}`} />
<div className={`text-sm p-4 ${className || ''}`} />
```

## useEffect 最佳化

```typescript
// ✅ 簡潔的 useEffect
useEffect(() => {
  console.log('這只會在客戶端執行')
  // 客戶端邏輯
}, [])

// ❌ 不必要的 window 檢查
useEffect(() => {
  if (typeof window !== 'undefined') {
    // 不需要
    console.log('客戶端邏輯')
  }
}, [])
```

## 狀態更新最佳實踐

### 函數式更新

```typescript
// ✅ 優先使用函數式更新
const increment = () => setCount(prev => prev + 1)
const addItem = item => setItems(prev => [...prev, item])

// ❌ 避免直接依賴當前狀態
const increment = () => setCount(count + 1) // 可能導致競態條件
```

### 批量狀態更新

```typescript
// ✅ 組合相關狀態
type FormState = {
  name: string
  email: string
  isSubmitting: boolean
}

const [formState, setFormState] = useState<FormState>({
  name: '',
  email: '',
  isSubmitting: false,
})

// ❌ 分離相關狀態
const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
```

## 元件效能優化

### 避免不必要的重新渲染

```typescript
// ✅ 使用 React.memo 包裝純元件
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
  onAction,
}: Props) {
  // 複雜的渲染邏輯
  return <ComplexUI />
})

// ✅ 穩定的 props 參考
function Parent() {
  const stableCallback = useCallback(() => {
    // 處理邏輯
  }, [])

  return <ExpensiveComponent onAction={stableCallback} />
}
```

## 最佳實踐

- [ ] 選擇性 import React hooks
- [ ] 一般元件避免 `useCallback`/`useMemo`
- [ ] Custom hooks 需要穩定化輸出
- [ ] 複雜邏輯抽取為 pure function 方便測試
- [ ] 使用 early return 處理條件渲染
- [ ] 使用 `cn` 函數處理 className
- [ ] 優先使用函數式狀態更新
- [ ] 組合相關狀態
- [ ] 昂貴元件使用 React.memo
