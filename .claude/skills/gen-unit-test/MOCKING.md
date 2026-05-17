# Mocking Patterns

Comprehensive guide to mocking in Vitest.

## Basic Mocking

### Mock Functions

```typescript
import { vi, describe, test, expect } from 'vitest'

describe('Callback handling', () => {
  test('calls callback with correct arguments', () => {
    const callback = vi.fn()

    processData({ id: 1 }, callback)

    expect(callback).toHaveBeenCalledWith({ id: 1, processed: true })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
```

### Mock Return Values

```typescript
const mockFn = vi.fn()

// Static return value
mockFn.mockReturnValue('static')

// Return value once (then undefined)
mockFn.mockReturnValueOnce('first')
mockFn.mockReturnValueOnce('second')

// Chain for sequence
mockFn
  .mockReturnValueOnce('1st call')
  .mockReturnValueOnce('2nd call')
  .mockReturnValue('subsequent calls')
```

### Mock Implementations

```typescript
// Full implementation
mockFn.mockImplementation(x => x * 2)

// One-time implementation
mockFn.mockImplementationOnce(x => x * 3)

// Async implementation
mockFn.mockImplementation(async id => {
  if (id === 0) throw new Error('Invalid')
  return { id }
})
```

## Module Mocking

### Basic Module Mock

```typescript
import { vi } from 'vitest'

vi.mock('@/libs/api', () => ({
  fetchUsers: vi.fn(),
  fetchUser: vi.fn(),
  createUser: vi.fn(),
}))
```

### Partial Module Mock

```typescript
import { vi } from 'vitest'
import * as api from '@/libs/api'

vi.mock('@/libs/api', async importOriginal => {
  const actual = await importOriginal<typeof api>()
  return {
    ...actual,
    fetchUsers: vi.fn(), // Only mock this one
  }
})
```

### Using vi.mocked()

```typescript
import { vi } from 'vitest'
import { fetchUsers } from '@/libs/api'

vi.mock('@/libs/api')

describe('UserService', () => {
  test('fetches users', async () => {
    vi.mocked(fetchUsers).mockResolvedValue([{ id: 1 }])

    const result = await getUsers()

    expect(result).toEqual([{ id: 1 }])
  })
})
```

## Mocking External Dependencies

### Mocking Axios

```typescript
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('API calls', () => {
  test('fetches data with axios', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { users: [] },
    })

    const result = await fetchData('/users')

    expect(axios.get).toHaveBeenCalledWith('/users')
    expect(result).toEqual({ users: [] })
  })
})
```

### Mocking next/navigation

```typescript
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}))
```

### Mocking next-intl

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))
```

## Spying

### Spy on Object Methods

```typescript
import { vi } from 'vitest'

describe('Logger', () => {
  test('logs to console', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    logger.info('test message')

    expect(consoleSpy).toHaveBeenCalledWith('[INFO]', 'test message')

    consoleSpy.mockRestore()
  })
})
```

### Spy on Module Exports

```typescript
import * as utils from '@/utils'

describe('formatDate', () => {
  test('uses locale formatter', () => {
    const spy = vi.spyOn(utils, 'getLocale').mockReturnValue('en-US')

    formatDate(new Date())

    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })
})
```

## Environment Mocking

### Environment Variables

```typescript
// Pattern from project: EnvMocker
class EnvMocker {
  private original: Record<string, string | undefined> = {}

  static createScoped() {
    return new EnvMocker()
  }

  set(key: string, value: string) {
    if (!(key in this.original)) {
      this.original[key] = process.env[key]
    }
    process.env[key] = value
  }

  delete(key: string) {
    if (!(key in this.original)) {
      this.original[key] = process.env[key]
    }
    delete process.env[key]
  }

  restore() {
    for (const [key, value] of Object.entries(this.original)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
}

// Usage
test('reads environment variable', () => {
  const envMocker = EnvMocker.createScoped()

  try {
    envMocker.set('API_URL', 'http://test.com')

    const result = getApiUrl()

    expect(result).toBe('http://test.com')
  } finally {
    envMocker.restore()
  }
})
```

### Using vi.stubEnv

```typescript
import { vi, beforeEach, afterEach } from 'vitest'

describe('Environment-dependent code', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('API_URL', 'http://test.com')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('uses test environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
})
```

## Timer Mocking

### Fake Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest'

describe('Delayed operations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('executes after timeout', () => {
    const callback = vi.fn()
    setTimeout(callback, 1000)

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalled()
  })

  test('runs all pending timers', () => {
    const callback = vi.fn()
    setTimeout(callback, 5000)
    setTimeout(callback, 10000)

    vi.runAllTimers()

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
```

### Date Mocking

```typescript
describe('Date-dependent code', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns current date', () => {
    const result = getCurrentDate()
    expect(result).toEqual(new Date('2024-01-15T10:00:00Z'))
  })
})
```

## Mock Assertions

### Call Verification

```typescript
const mockFn = vi.fn()

// Called at least once
expect(mockFn).toHaveBeenCalled()

// Called exact number of times
expect(mockFn).toHaveBeenCalledTimes(3)

// Called with specific arguments
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')

// Last call arguments
expect(mockFn).toHaveBeenLastCalledWith('final')

// Nth call arguments
expect(mockFn).toHaveBeenNthCalledWith(2, 'second-call-arg')

// Never called
expect(mockFn).not.toHaveBeenCalled()
```

### Return Value Verification

```typescript
const mockFn = vi.fn().mockReturnValue('result')

mockFn()

// Check return value
expect(mockFn).toHaveReturnedWith('result')
expect(mockFn).toHaveReturnedTimes(1)
```

## Clearing and Resetting

```typescript
const mockFn = vi.fn().mockReturnValue('value')

// Clear call history, keep implementation
mockFn.mockClear()

// Reset to empty function
mockFn.mockReset()

// Restore original (for spies)
mockFn.mockRestore()

// Clear all mocks
vi.clearAllMocks()

// Reset all mocks
vi.resetAllMocks()

// Restore all mocks
vi.restoreAllMocks()
```

## Recommended Setup

```typescript
import { vi, beforeEach, afterEach } from 'vitest'

describe('MyModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // tests...
})
```

## Mock Hoisting

```typescript
// ✅ Correct - vi.mock is hoisted
import { vi } from 'vitest'
import { api } from '@/libs/api'

vi.mock('@/libs/api') // This is hoisted to top

// ❌ Wrong - dynamic mock in test
test('...', () => {
  vi.mock('@/libs/api') // Won't work as expected
})
```

## Factory Functions for Complex Mocks

```typescript
const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  ...overrides,
})

const createMockResponse = (data: unknown, status = 200) => ({
  data,
  status,
  headers: {},
  config: {},
})

// Usage
test('handles user data', () => {
  vi.mocked(fetchUser).mockResolvedValue(
    createMockResponse(createMockUser({ name: 'Jane' }))
  )
})
```
