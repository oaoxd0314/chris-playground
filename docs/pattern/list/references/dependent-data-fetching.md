# Dependent Data Fetching in Lists

> 回到 [README](../README.md)。
>
> **When to read this**: When your List API returns items with only reference IDs (e.g., `orgId`, `userId`) and you need to fetch the full details for those references.

## Overview

This pattern handles the common scenario where:

1. A list API returns items with only reference IDs (e.g., `promotions` with `orgId`)
2. A batch API is needed to fetch full details for those IDs (e.g., `organizations` by IDs)
3. UI should show progressive loading: display primary data immediately, show skeleton for dependent fields while loading

This is a common N+1 query pattern that balances performance (batch API call) with user experience (progressive loading).

## When to Use This Pattern

Use this pattern in your List component when:

- List API items contain reference IDs (`orgId`, `userId`, `productId`, etc.) instead of full details
- Need to display the referenced entity's name/details in the list
- Want to optimize UX with progressive loading (show available data first, then enrich)
- Working with batch APIs that accept multiple IDs

**Common scenarios:**

- Promotions list → Organization names
- Posts list → User/Author details
- Orders list → Product information
- Activities list → User avatars and names
- Comments list → Category/Tag names

## Architecture Layer

This pattern is implemented in the **`useXXXList` hook** (Portal Hook Layer) according to the endpoint-portal-pattern.

```
┌─────────────────────────────────────────────────────────┐
│  UI Components (XXXList, XXXTable)                      │
│  - Shows isPrimaryLoading for full skeleton            │
│  - Shows isOrgLoading for org name field skeleton      │
└───────────────────────────┬─────────────────────────────┘
                            │ uses
┌───────────────────────────▼─────────────────────────────┐
│  useXXXList Hook                                        │
│  - Implements dependent fetching pattern                │
│  - Manages progressive loading states (isPrimaryLoading,│
│    isOrgLoading, isEnrichmentLoading)                   │
│  - Enriches data with dependent details                 │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│  Endpoint Hooks                                         │
│  - useGetPromotionsQuery() → Promotion[]                │
│  - useGetOrganizationsQuery(ids) → Organization[]       │
└─────────────────────────────────────────────────────────┘
```

**Do NOT implement this pattern in:**

- ❌ Endpoint layer - Keep endpoints simple and focused on single API calls
- ❌ UI components - Keep components focused on rendering, not data composition

## Integration with List Pattern

This pattern extends the standard List hook composition pattern. Add dependent data fetching between the filter and table hooks:

```tsx
// Standard List Pattern with Dependent Data Fetching
export function usePromotionList() {
  // 1. Filter state (product-ui)
  const filter = usePromotionFilter()

  // 2. Fetch primary list (app-specific)
  const { data: promotions = [], isPending: isPrimaryLoading } =
    useGetPromotionsQuery(filter.apiParams)

  // 3. ⭐ DEPENDENT DATA FETCHING - Extract IDs and fetch dependent data
  const orgIds = useMemo(
    () => Array.from(new Set(promotions.map(p => p.orgId).filter(Boolean))),
    [promotions]
  )

  const { data: organizations = [], isPending: isOrgLoading } =
    useGetOrganizationsQuery(
      { ids: orgIds },
      { enabled: orgIds.length > 0 }
    )

  // Combined enrichment loading state
  const isEnrichmentLoading = isOrgLoading

  // Enrich data
  const enrichedData = useMemo(() => {
    const orgMap = new Map(organizations.map(org => [org.id, org]))
    return promotions.map(p => ({
      ...p,
      organizationName: orgMap.get(p.orgId)?.name,
    }))
  }, [promotions, organizations])

  // 4. Actions (product-ui)
  const actions = usePromotionActions({ ... })

  // 5. Table (product-ui)
  const { table } = usePromotionTable({
    data: enrichedData,
    isOrgLoading,  // Pass to table for skeleton control
    ...actions,
  })

  return {
    filter,
    table,
    isLoading: isPrimaryLoading || isEnrichmentLoading,
    isPrimaryLoading,      // For full list skeleton
    isEnrichmentLoading,   // Combined enrichment loading
    isOrgLoading,          // For org name field skeleton
  }
}
```

## Naming Conventions

**Use specific resource names for loading states** to make the code self-documenting and enable precise skeleton control:

### Loading State Naming Pattern

| Pattern               | Usage                                         | Example                                                           |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| `isPrimaryLoading`    | Loading state for primary list                | `const { isPending: isPrimaryLoading } = useGetPromotionsQuery()` |
| `is{Resource}Loading` | Loading state for specific dependent resource | `const { isPending: isOrgLoading } = useGetOrganizationsQuery()`  |
| `isEnrichmentLoading` | Combined loading for all dependent resources  | `const isEnrichmentLoading = isOrgLoading \|\| isUserLoading`     |

**Examples:**

```typescript
// Single dependent resource
const { isPending: isPrimaryLoading } = useGetPromotionsQuery()
const { isPending: isOrgLoading } = useGetOrganizationsQuery()

// Multiple dependent resources
const { isPending: isPrimaryLoading } = useGetBalancesQuery()
const { isPending: isOrgLoading } = useGetOrganizationsQuery()
const { isPending: isSupervisorLoading } = useGetSupervisorsQuery()
const isEnrichmentLoading = isOrgLoading || isSupervisorLoading
```

**Why specific resource names?**

- ✅ Self-documenting: `isOrgLoading` clearly indicates which resource is loading
- ✅ Precise skeleton control: Can show skeleton only for specific fields
- ✅ Better debugging: Easy to identify which resource is causing delays
- ❌ Generic names like `isDependentLoading` hide which resource is loading

## TanStack Query Implementation

### Basic Pattern

```typescript
// useXXXList hook
export function usePromotionList() {
  const filter = usePromotionFilter()

  // Step 1: Fetch primary list
  const {
    data: promotions = [],
    isPending: isPrimaryLoading,
  } = useGetPromotionsQuery(filter.apiParams)

  // Step 2: Extract dependent IDs
  const orgIds = useMemo(
    () => Array.from(new Set(promotions.map(p => p.orgId).filter(Boolean))),
    [promotions]
  )

  // Step 3: Fetch dependent data (enabled when IDs are ready)
  const {
    data: organizations = [],
    isPending: isOrgLoading,
  } = useGetOrganizationsQuery(
    { ids: orgIds },
    {
      enabled: orgIds.length > 0,
      select: data => data?.organizations ?? [],
    }
  )

  // Step 4: Create lookup map for efficient enrichment
  const orgMap = useMemo(
    () => new Map(organizations.map(org => [org.id, org])),
    [organizations]
  )

  // Step 5: Enrich primary data with dependent details
  const enrichedPromotions = useMemo(
    () =>
      promotions.map(promotion => ({
        ...promotion,
        organizationName: orgMap.get(promotion.orgId)?.name,
      })),
    [promotions, orgMap]
  )

  // Rest of the hook (actions, table, etc.)
  const actions = usePromotionActions({ ... })
  const { table } = usePromotionTable({
    data: enrichedPromotions,
    ...actions,
  })

  return {
    filter,
    table,
    isPrimaryLoading,     // true: show full skeleton
    isOrgLoading,         // true: show partial skeleton (org names only)
    isLoading: isPrimaryLoading || isOrgLoading,
  }
}
```

### Progressive Loading States

**Loading state breakdown:**

| Primary Loading | Org Loading | UI Display                              |
| --------------- | ----------- | --------------------------------------- |
| `true`          | `false`     | Full list skeleton                      |
| `false`         | `true`      | Show promotions, skeleton for org names |
| `false`         | `false`     | Full data displayed                     |

**UI implementation example:**

```typescript
// XXXList component
function PromotionList() {
  const { filter, table, isPrimaryLoading, isOrgLoading } = usePromotionList()

  return (
    <>
      <PromotionFilters {...filter} />
      <PromotionTable
        table={table}
        isLoading={isPrimaryLoading}
        isOrgLoading={isOrgLoading}
      />
    </>
  )
}

// XXXTable component
function PromotionTable({ table, isLoading, isOrgLoading }) {
  // Full skeleton while primary data loads
  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <Table.Root>
      <Table.Body>
        {table.getRowModel().rows.map(row => (
          <Table.Row key={row.id}>
            <Table.Cell>{row.original.title}</Table.Cell>
            <Table.Cell>
              {/* Partial skeleton for org name while dependent data loads */}
              {isOrgLoading && !row.original.organizationName ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                row.original.organizationName ?? '-'
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
```

## Endpoint Layer Implementation

### Primary Endpoint (promotions)

```typescript
// src/endpoints/promotions.ts
export interface Promotion {
  id: string
  title: string
  description?: string
  orgId: string // Reference ID only
  createdAt: string
}

export const useGetPromotionsQuery = () => {
  return useQuery({
    queryKey: ['qk_promotion_list'],
    queryFn: () => promotionApi.getPromotions(),
    select: data => data?.promotions ?? [],
  })
}
```

### Dependent Endpoint (organizations)

**Option 1: Batch API with IDs parameter** (Recommended)

```typescript
// src/endpoints/organizations.ts
export interface Organization {
  id: string
  name: string
  // ... other fields
}

interface GetOrganizationsParams {
  ids?: string[] // Batch fetch by IDs
}

export const useGetOrganizationsQuery = (
  params: GetOrganizationsParams,
  options?: { enabled?: boolean; select?: (data: any) => Organization[] }
) => {
  return useQuery({
    queryKey: ['qk_organization_list', params],
    queryFn: () => organizationApi.getOrganizations(params),
    ...options,
  })
}
```

**Option 2: Individual queries with useQueries** (Less efficient)

Use this only if batch API is not available:

```typescript
// In useXXXList hook
import { useQueries } from '@tanstack/react-query'

export function usePromotionList() {
  const { data: promotions = [] } = useGetPromotionsQuery()
  const orgIds = useMemo(
    () => Array.from(new Set(promotions.map(p => p.orgId).filter(Boolean))),
    [promotions]
  )

  // Fetch individual organizations
  const orgQueries = useQueries({
    queries: orgIds.map(id => ({
      queryKey: ['qk_organization', id],
      queryFn: () => organizationApi.getOrganization(id),
      enabled: !!id,
    })),
  })

  const isDependentLoading = orgQueries.some(q => q.isPending)
  const organizations = orgQueries
    .map(q => q.data)
    .filter((org): org is Organization => org !== undefined)

  // ... rest of the implementation
}
```

**Prefer Option 1** (batch API) for better performance and simpler code.

## Type Definitions

Follow endpoint-portal-pattern for type organization:

```typescript
// src/endpoints/promotions.ts - Base type
export interface Promotion {
  id: string
  title: string
  orgId: string // Reference only
}

// src/app/(dashboard)/promotions/_content/types.ts - Enriched type
import type { Promotion } from '@/endpoints/promotions'

export interface PromotionWithOrganization extends Promotion {
  organizationName?: string // Enriched field
}
```

## Best Practices

### ✅ DO

- **Use batch APIs** - Fetch dependent data in a single call when possible
- **Progressive loading** - Show primary data first, then enrich with dependent data
- **Memoize ID extraction** - Use `useMemo` for extracting unique IDs
- **Create lookup maps** - Use `Map` for O(1) enrichment instead of `.find()`
- **Handle empty states** - Check `orgIds.length > 0` before enabling dependent query
- **Type enriched data** - Define explicit types for enriched data (e.g., `PromotionWithOrganization`)
- **Return both loading states** - Return `isPrimaryLoading` and `isDependentLoading` for flexible UI

### ❌ DON'T

- **Don't block primary data** - Never wait for dependent data before showing the list
- **Don't use nested `.find()`** - Creates O(n²) complexity, use Map instead
- **Don't forget `enabled`** - Always use `enabled` option to prevent unnecessary API calls
- **Don't implement in endpoints** - Keep this pattern in portal hooks, not endpoint layer
- **Don't duplicate state** - Use TanStack Query cache, don't store enriched data in separate state

## Performance Optimization

### Deduplication with Set

Always deduplicate IDs before fetching:

```typescript
// ✅ Good - Deduplicate IDs
const orgIds = useMemo(
  () => Array.from(new Set(promotions.map(p => p.orgId).filter(Boolean))),
  [promotions]
)

// ❌ Bad - Duplicate API calls
const orgIds = promotions.map(p => p.orgId) // [1, 2, 2, 3, 3, 3] → 3 duplicate calls
```

### Efficient Lookup with Map

Use Map for O(1) lookups instead of O(n) `.find()`:

```typescript
// ✅ Good - O(1) lookup with Map
const orgMap = useMemo(
  () => new Map(organizations.map(org => [org.id, org])),
  [organizations]
)
const enriched = promotions.map(p => ({
  ...p,
  orgName: orgMap.get(p.orgId)?.name,
}))

// ❌ Bad - O(n²) complexity with nested find
const enriched = promotions.map(p => ({
  ...p,
  orgName: organizations.find(org => org.id === p.orgId)?.name,
}))
```

### Conditional Fetching with `enabled`

Prevent unnecessary API calls when there are no IDs:

```typescript
// ✅ Good - Only fetch when IDs exist
const { data } = useGetOrganizationsQuery(
  { ids: orgIds },
  { enabled: orgIds.length > 0 }
)

// ❌ Bad - API call with empty array
const { data } = useGetOrganizationsQuery({ ids: [] }) // Wasteful API call
```

## Common Scenarios in Lists

### Scenario 1: User/Author Details

```typescript
// Posts list with author details
export function usePostList() {
  const filter = usePostFilter()
  const { data: posts = [], isPending: isPrimaryLoading } = useGetPostsQuery(filter.apiParams)

  const userIds = useMemo(
    () => Array.from(new Set(posts.map(p => p.authorId))),
    [posts]
  )

  const { data: users = [], isPending: isUserLoading } = useGetUsersQuery(
    { ids: userIds },
    { enabled: userIds.length > 0 }
  )

  const userMap = useMemo(
    () => new Map(users.map(u => [u.id, u])),
    [users]
  )

  const enrichedPosts = useMemo(
    () =>
      posts.map(post => ({
        ...post,
        authorName: userMap.get(post.authorId)?.name,
        authorAvatar: userMap.get(post.authorId)?.avatar,
      })),
    [posts, userMap]
  )

  const actions = usePostActions({ ... })
  const { table } = usePostTable({ data: enrichedPosts, ...actions })

  return {
    filter,
    table,
    isPrimaryLoading,
    isUserLoading,
    isLoading: isPrimaryLoading || isUserLoading,
  }
}
```

### Scenario 2: Multiple Dependent Resources

When a list item has multiple reference IDs:

```typescript
// Orders list with product + customer details
export function useOrderList() {
  const filter = useOrderFilter()
  const { data: orders = [], isPending: isPrimaryLoading } = useGetOrdersQuery(filter.apiParams)

  // Extract multiple sets of IDs
  const productIds = useMemo(
    () => Array.from(new Set(orders.map(o => o.productId))),
    [orders]
  )
  const customerIds = useMemo(
    () => Array.from(new Set(orders.map(o => o.customerId))),
    [orders]
  )

  // Fetch both dependent resources
  const { data: products = [], isPending: isProductLoading } =
    useGetProductsQuery({ ids: productIds }, { enabled: productIds.length > 0 })

  const { data: customers = [], isPending: isCustomerLoading } =
    useGetCustomersQuery(
      { ids: customerIds },
      { enabled: customerIds.length > 0 }
    )

  // Create lookup maps
  const productMap = useMemo(
    () => new Map(products.map(p => [p.id, p])),
    [products]
  )
  const customerMap = useMemo(
    () => new Map(customers.map(c => [c.id, c])),
    [customers]
  )

  // Enrich with both resources
  const enrichedOrders = useMemo(
    () =>
      orders.map(order => ({
        ...order,
        productName: productMap.get(order.productId)?.name,
        customerName: customerMap.get(order.customerId)?.name,
      })),
    [orders, productMap, customerMap]
  )

  const isEnrichmentLoading = isProductLoading || isCustomerLoading

  const actions = useOrderActions({ ... })
  const { table } = useOrderTable({ data: enrichedOrders, ...actions })

  return {
    filter,
    table,
    isPrimaryLoading,
    isEnrichmentLoading,     // Combined loading for both dependent resources
    isProductLoading,        // For product-specific skeleton
    isCustomerLoading,       // For customer-specific skeleton
    isLoading: isPrimaryLoading || isEnrichmentLoading,
  }
}
```

## Troubleshooting

### Issue: Dependent query never fires

**Symptom**: Organizations query never executes even though IDs exist.

**Cause**: Missing `enabled` option or IDs not ready when query initializes.

**Solution**:

```typescript
// ✅ Ensure enabled option is set
const { data } = useGetOrganizationsQuery(
  { ids: orgIds },
  { enabled: orgIds.length > 0 } // Critical!
)
```

### Issue: Duplicate API calls

**Symptom**: Same organization fetched multiple times.

**Cause**: IDs not deduplicated before fetching.

**Solution**:

```typescript
// ✅ Deduplicate with Set
const orgIds = useMemo(
  () => Array.from(new Set(promotions.map(p => p.orgId).filter(Boolean))),
  [promotions]
)
```

### Issue: Slow rendering with large lists

**Symptom**: UI freezes when rendering enriched list.

**Cause**: Using `.find()` for enrichment creates O(n²) complexity.

**Solution**:

```typescript
// ✅ Use Map for O(1) lookups
const orgMap = useMemo(
  () => new Map(organizations.map(org => [org.id, org])),
  [organizations]
)
```

### Issue: Hook return value instability with polling

**Symptom**: Table re-renders unnecessarily when using `refetchInterval`.

**Cause**: `useXXXList` returns new object on every render.

**Solution**: Apply the **Hook Return Value Stability** pattern from the main List guideline - wrap the return object in `useMemo`:

```typescript
export function usePromotionList() {
  // ... all the logic

  return useMemo(
    () => ({
      filter,
      table,
      isPrimaryLoading,
      isOrgLoading,
      isLoading: isPrimaryLoading || isOrgLoading,
    }),
    [filter, table, isPrimaryLoading, isOrgLoading]
  )
}
```

## Implementation Checklist

When implementing dependent data fetching in your List:

- [ ] Primary query returns base data with reference IDs
- [ ] IDs are extracted and deduplicated with `useMemo` + `Set`
- [ ] Dependent query uses `enabled: ids.length > 0`
- [ ] Lookup map created with `Map` for efficient enrichment
- [ ] Types defined: base type in endpoint, enriched type in portal hook types
- [ ] Progressive loading states returned: `isPrimaryLoading`, specific resource loading states (`isOrgLoading`, `isUserLoading`, etc.)
- [ ] Combined enrichment loading state created if multiple dependent resources: `isEnrichmentLoading`
- [ ] UI shows full skeleton for primary loading
- [ ] UI shows partial skeleton for specific resource loading (in table cells)
- [ ] Batch API preferred over individual queries when available
- [ ] No duplicate state management (rely on TanStack Query cache)
- [ ] Hook return value wrapped in `useMemo` for stability (if using polling)
