# Async Testing Patterns

## Basic Async/Await

```typescript
import { describe, test, expect } from 'vitest'

describe('AsyncService', () => {
  test('fetches data successfully', async () => {
    const result = await fetchData()
    expect(result).toBeDefined()
  })

  test('throws error when request fails', async () => {
    await expect(fetchInvalidData()).rejects.toThrow('Not found')
  })
})
```

## Testing Promises

### Resolved Promises

```typescript
test('resolves with correct data', async () => {
  const promise = fetchUser(1)
  await expect(promise).resolves.toEqual({ id: 1, name: 'John' })
})
```

### Rejected Promises

```typescript
test('rejects when user not found', async () => {
  const promise = fetchUser(999)
  await expect(promise).rejects.toThrow('User not found')
})

test('rejects with specific error type', async () => {
  const promise = fetchUser(999)
  await expect(promise).rejects.toBeInstanceOf(NotFoundError)
})
```

## Mocking Async Functions

### Mock Return Values

```typescript
import { vi } from 'vitest'

const mockFetch = vi.fn()

// Single resolved value
mockFetch.mockResolvedValue({ data: 'success' })

// Single rejected value
mockFetch.mockRejectedValue(new Error('Network error'))

// Sequential values
mockFetch
  .mockResolvedValueOnce({ data: 'first' })
  .mockResolvedValueOnce({ data: 'second' })
  .mockRejectedValueOnce(new Error('third fails'))
```

### Mock Implementation

```typescript
mockFetch.mockImplementation(async id => {
  if (id === 0) throw new Error('Invalid ID')
  return { id, data: `Data for ${id}` }
})
```

## Testing API Calls

### With Mocked Module

```typescript
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { fetchUsers } from '@/libs/api'
import { UserService } from './user-service'

vi.mock('@/libs/api', () => ({
  fetchUsers: vi.fn(),
}))

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns users when API succeeds', async () => {
    const mockUsers = [{ id: 1, name: 'John' }]
    vi.mocked(fetchUsers).mockResolvedValue(mockUsers)

    const service = new UserService()
    const result = await service.getUsers()

    expect(result).toEqual(mockUsers)
    expect(fetchUsers).toHaveBeenCalledTimes(1)
  })

  test('throws error when API fails', async () => {
    vi.mocked(fetchUsers).mockRejectedValue(new Error('API Error'))

    const service = new UserService()

    await expect(service.getUsers()).rejects.toThrow('API Error')
  })
})
```

## Testing Timeouts and Delays

### Fake Timers

```typescript
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

describe('Debounced function', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('executes after delay', async () => {
    const callback = vi.fn()
    const debounced = debounce(callback, 1000)

    debounced()
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('cancels previous call on rapid invocation', () => {
    const callback = vi.fn()
    const debounced = debounce(callback, 1000)

    debounced()
    vi.advanceTimersByTime(500)
    debounced()
    vi.advanceTimersByTime(500)
    debounced()
    vi.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
```

### Real Delays (Use Sparingly)

```typescript
test(
  'completes within timeout',
  async () => {
    const start = Date.now()
    await quickOperation()
    const duration = Date.now() - start

    expect(duration).toBeLessThan(100)
  },
  { timeout: 5000 }
)
```

## Testing Concurrent Operations

```typescript
describe('Concurrent requests', () => {
  test('handles parallel requests correctly', async () => {
    const results = await Promise.all([
      fetchUser(1),
      fetchUser(2),
      fetchUser(3),
    ])

    expect(results).toHaveLength(3)
    results.forEach((result, index) => {
      expect(result.id).toBe(index + 1)
    })
  })

  test('handles mixed success and failure', async () => {
    vi.mocked(fetchUser)
      .mockResolvedValueOnce({ id: 1 })
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({ id: 3 })

    const results = await Promise.allSettled([
      fetchUser(1),
      fetchUser(2),
      fetchUser(3),
    ])

    expect(results[0]).toEqual({ status: 'fulfilled', value: { id: 1 } })
    expect(results[1]).toEqual({
      status: 'rejected',
      reason: expect.any(Error),
    })
    expect(results[2]).toEqual({ status: 'fulfilled', value: { id: 3 } })
  })
})
```

## Testing Retry Logic

```typescript
describe('Retry mechanism', () => {
  test('retries on failure and succeeds', async () => {
    const mockFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValueOnce({ success: true })

    const result = await withRetry(mockFn, { maxRetries: 3 })

    expect(result).toEqual({ success: true })
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  test('throws after max retries exceeded', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'))

    await expect(withRetry(mockFn, { maxRetries: 3 })).rejects.toThrow(
      'Always fails'
    )

    expect(mockFn).toHaveBeenCalledTimes(3)
  })
})
```

## Common Async Testing Mistakes

### Forgetting await

```typescript
// ❌ Wrong - test passes before promise resolves
test('fetches data', () => {
  const result = fetchData() // Missing await!
  expect(result).toBeDefined() // Tests promise object, not result
})

// ✅ Correct
test('fetches data', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

### Not Awaiting Assertions

```typescript
// ❌ Wrong - assertion not awaited
test('rejects on error', () => {
  expect(fetchInvalidData()).rejects.toThrow() // Missing await!
})

// ✅ Correct
test('rejects on error', async () => {
  await expect(fetchInvalidData()).rejects.toThrow()
})
```
