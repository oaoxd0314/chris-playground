# React Hooks Testing Patterns

Testing React hooks using `@testing-library/react` and Vitest.

## Setup

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
```

## Basic Hook Testing

### Simple State Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './use-counter'

describe('useCounter', () => {
  test('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  test('initializes with provided value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })

  test('increments count when increment called', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  test('decrements count when decrement called', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(4)
  })
})
```

## Hooks with Dependencies

### Testing useEffect

```typescript
describe('useDocumentTitle', () => {
  test('updates document title when title changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Initial' },
    })

    expect(document.title).toBe('Initial')

    rerender({ title: 'Updated' })
    expect(document.title).toBe('Updated')
  })
})
```

### Testing with Props Changes

```typescript
describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial') // Still old value

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })
})
```

## Async Hooks

### Testing Data Fetching Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetUser } from './use-get-user'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useGetUser', () => {
  test('returns user data when fetch succeeds', async () => {
    vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'John' })

    const { result } = renderHook(() => useGetUser(1), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual({ id: 1, name: 'John' })
  })

  test('returns error when fetch fails', async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error('Not found'))

    const { result } = renderHook(() => useGetUser(999), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Not found')
  })
})
```

## Hooks with Context

### Providing Context in Tests

```typescript
import { renderHook } from '@testing-library/react'
import { AuthContext, AuthProvider } from '@/contexts/auth'
import { useAuth } from './use-auth'

describe('useAuth', () => {
  const mockAuthValue = {
    user: { id: 1, name: 'John' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  )

  test('returns auth context value', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toEqual({ id: 1, name: 'John' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  test('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')
  })
})
```

## Testing Zustand Stores

### Basic Store Testing

```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { useUserStore } from './user-store'

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store between tests
    useUserStore.setState({ user: null, isLoading: false })
  })

  test('initializes with null user', () => {
    const state = useUserStore.getState()
    expect(state.user).toBeNull()
  })

  test('sets user when setUser called', () => {
    const { setUser } = useUserStore.getState()

    setUser({ id: 1, name: 'John' })

    expect(useUserStore.getState().user).toEqual({ id: 1, name: 'John' })
  })

  test('clears user when clearUser called', () => {
    useUserStore.setState({ user: { id: 1, name: 'John' } })
    const { clearUser } = useUserStore.getState()

    clearUser()

    expect(useUserStore.getState().user).toBeNull()
  })
})
```

### Testing Store with Hook

```typescript
import { renderHook, act } from '@testing-library/react'
import { useUserStore } from './user-store'

describe('useUserStore hook', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null })
  })

  test('updates component when store changes', () => {
    const { result } = renderHook(() => useUserStore(s => s.user))

    expect(result.current).toBeNull()

    act(() => {
      useUserStore.getState().setUser({ id: 1, name: 'John' })
    })

    expect(result.current).toEqual({ id: 1, name: 'John' })
  })
})
```

## Custom Hook with Multiple Hooks

```typescript
describe('useFormValidation', () => {
  test('validates required field', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        name: { required: true },
      })
    )

    act(() => {
      result.current.setValue('name', '')
      result.current.validate()
    })

    expect(result.current.errors.name).toBe('This field is required')
  })

  test('clears error when valid value provided', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        name: { required: true },
      })
    )

    // Set invalid, then valid
    act(() => {
      result.current.setValue('name', '')
      result.current.validate()
    })

    expect(result.current.errors.name).toBeDefined()

    act(() => {
      result.current.setValue('name', 'John')
      result.current.validate()
    })

    expect(result.current.errors.name).toBeUndefined()
  })
})
```

## Common Patterns

### Wrapper Factory

```typescript
const createTestWrapper = (overrides = {}) => {
  const queryClient = new QueryClient()
  const authValue = { user: null, ...overrides }

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

// Usage
const { result } = renderHook(() => useMyHook(), {
  wrapper: createTestWrapper({ user: { id: 1 } })
})
```

### Testing Cleanup

```typescript
describe('useEventListener', () => {
  test('removes listener on unmount', () => {
    const handler = vi.fn()
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useEventListener('resize', handler))

    expect(addSpy).toHaveBeenCalledWith('resize', handler)

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', handler)
  })
})
```
