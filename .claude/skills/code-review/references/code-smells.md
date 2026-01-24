# Code Smells Catalog

Quick reference catalog of common code smells to look for during review.

## Complexity Issues

### Long Function / God Function

**Symptom**: Function doing too many things, hard to name, 100+ lines

**Quick check**: Can you describe what it does in one sentence? If not, it's doing too much.

**Fix**: Extract separate functions for each responsibility

**Priority**: High

---

### Deep Nesting

**Symptom**: 3+ levels of nested conditionals

**Example**:

```typescript
// ❌ BAD
if (user) {
  if (user.isActive) {
    if (user.orders) {
      if (user.orders.length > 0) {
        /* ... */
      }
    }
  }
}

// ✅ GOOD
if (!user?.isActive) return
if (!user.orders?.length) return
// ...
```

**Priority**: Medium

---

### Long Parameter List

**Symptom**: 5+ parameters

**Fix**: Use object parameter

```typescript
// ❌ BAD
function create(name, email, age, city, country, phone) {}

// ✅ GOOD
function create(params: CreateParams) {}
```

**Priority**: Medium

## Duplication

### Copy-Paste Code

**Symptom**: Similar code blocks in multiple places

**Fix**: Extract common pattern into reusable function

**Priority**: High

---

### Similar Patterns Not Abstracted

**Symptom**: Multiple similar implementations

**Example**:

```typescript
// ❌ BAD
function getActiveUsers() {
  return users.filter(u => u.status === 'active')
}
function getInactiveUsers() {
  return users.filter(u => u.status === 'inactive')
}

// ✅ GOOD
function getUsersByStatus(status: UserStatus) {
  return users.filter(u => u.status === status)
}
```

**Priority**: Medium

## Poor Abstractions

### Leaky Abstraction

**Symptom**: Implementation details leak through

**Example**:

```typescript
// ❌ BAD - exposes axios
export async function fetchUser(id: string) {
  return axios.get(`/users/${id}`)
}
// Caller must know: response.data

// ✅ GOOD - hides implementation
export async function fetchUser(id: string): Promise<User> {
  const response = await axios.get(`/users/${id}`)
  return response.data
}
```

**Priority**: High

---

### Mixed Concerns

**Symptom**: Single function doing UI + business logic + data access

**Fix**: Separate concerns into layers

**Priority**: High

## State Management

### Wrong Tool for State Type

**Symptom**: Using wrong state management solution

| State Type  | Wrong            | Right                         |
| ----------- | ---------------- | ----------------------------- |
| Server data | useState/Zustand | TanStack Query                |
| Form data   | useState         | React Hook Form or controlled |
| Derived     | useState         | useMemo                       |
| URL state   | useState         | TanStack Router               |

**Priority**: High

---

### Unnecessary State

**Symptom**: State that could be derived

**Example**:

```typescript
// ❌ BAD
const [users, setUsers] = useState([])
const [activeUsers, setActiveUsers] = useState([])
useEffect(() => setActiveUsers(users.filter(u => u.isActive)), [users])

// ✅ GOOD
const [users, setUsers] = useState([])
const activeUsers = useMemo(() => users.filter(u => u.isActive), [users])
```

**Priority**: Medium

---

### Derived State Stored

**Symptom**: Storing calculated values

**Fix**: Compute on demand with `useMemo`

**Priority**: High (prevents sync issues)

## TypeScript Issues

### Any Type Usage

**Symptom**: Using `any` type

**Fix**: Use proper types or `unknown` with type guards

**Priority**: High

---

### Missing Types

**Symptom**: Implicit any or overly broad types

**Fix**: Add explicit type annotations

**Priority**: High

---

### Unnecessary Type Assertions

**Symptom**: Using `as` when type can be inferred

**Fix**: Type the function return properly

**Priority**: Medium

## Project-Specific

### Default Exports

**Symptom**: Using default exports

**Fix**: Use named exports

```typescript
// ❌ BAD
export default Button

// ✅ GOOD
export { Button }
```

**Priority**: High (project standard)

---

### Unnecessary Comments

**Symptom**: Comments explaining what code does

**Fix**: Remove or refactor to self-documenting code

```typescript
// ❌ BAD
// Loop through users and find active ones
const activeUsers = users.filter(u => u.isActive)

// ✅ GOOD - no comment needed
const activeUsers = users.filter(u => u.isActive)

// ✅ GOOD - "why" comment only
// FIXME: API returns null until backend v2.1.0
const users = data ?? []
```

**Priority**: Medium

## Quick Priority Reference

| Priority   | When to Use                                                       |
| ---------- | ----------------------------------------------------------------- |
| **High**   | Breaks functionality, security, type safety, or project standards |
| **Medium** | Hurts readability, maintainability, or future changes             |
| **Low**    | Nice-to-have improvements, doesn't block functionality            |

## Detection Tips

**Scan for these in code**:

- Functions > 50 lines → Check for god function
- Nested `if` statements → Count nesting depth
- Multiple similar functions → Look for duplication
- `any` type → Type safety issue
- `export default` → Export convention violation
- Repeated logic → Abstraction opportunity
