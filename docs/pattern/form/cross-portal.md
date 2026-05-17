# Cross-Portal Form Sharing

> 何時把 form 抽到共用 package、抽到什麼層級、props injection 模式。
> 回到 [README](./README.md)。

## When to Share

當 user-portal 與 supervisor-portal 都需要時：

- 核心欄位相同
- Validation rule 相同
- 只有 UI / UX 不同（sidebar、payment、review step）

---

## Portal 差異對照

| Aspect     | user-portal     | supervisor-portal |
| ---------- | --------------- | ----------------- |
| API        | User-facing     | Admin             |
| Sidebar    | Usually present | Usually absent    |
| ViewReview | With payment    | No payment        |
| Payment    | GmiPayment      | N/A               |

---

## Abstraction Level

**在 View / Step 層共用，不在 Form 層共用**：

```
product-ui/                        # 共用層
└── {feature}-form-generic/
    ├── index.ts
    ├── schema.ts
    ├── form-adapter.ts
    ├── section-resource.tsx       # Step sections
    ├── section-config.tsx
    └── constants.ts

user-portal/                       # 完整 UI
└── features/{feature}/components/{feature}-form/
    ├── index.tsx                  # 含 sidebar + review
    ├── view-setting.tsx           # 從 product-ui import sections
    ├── view-review.tsx            # Payment flow
    └── sidebar-summary.tsx

supervisor-portal/                 # 簡化 UI
└── features/{feature}/components/{feature}-form/
    ├── index.tsx                  # 無 sidebar、無 review
    └── view-setting.tsx           # 從 product-ui import sections
```

---

## 範例

### Shared Package Entry

```typescript
// packages/product-ui/src/components/container-form-generic/index.ts
export * from './schema'
export * from './form-adapter'
export * from './constants'
export { SectionResource } from './section-resource'
export { SectionNetworking } from './section-networking'
export { SectionStorage } from './section-storage'
export { SectionBasicInformation } from './section-basic-information'
```

### user-portal Form

```typescript
// apps/user-portal/src/features/containers/components/container-create-form/index.tsx
import {
  toCreateContainerPayload,
  type ContainerFormSchema,
  resourceSchema,
  portsSchema,
} from '@product-ui/react/container-form-generic'
import { FormLayout } from '@product-ui/react/form-layout'

export function ContainerCreateForm({ initialValues }) {
  const [mainStep, setMainStep] = useState<'setting' | 'review'>('setting')

  return (
    <Form t={t} {...form}>
      <FormLayout.Root>
        {mainStep === 'setting' && (
          <>
            <FormLayout.Content>
              <ViewSetting onSubmit={handleCreateOrder} />
            </FormLayout.Content>
            <FormLayout.Sidebar>
              <SidebarSummary />
            </FormLayout.Sidebar>
          </>
        )}
        {mainStep === 'review' && (
          <>
            <FormLayout.Content>
              <ViewReview orderDetail={orderDetail} />
            </FormLayout.Content>
            <FormLayout.Sidebar>
              <GMIPayment orderId={orderId} onSubmit={handlePayment} />
            </FormLayout.Sidebar>
          </>
        )}
      </FormLayout.Root>
    </Form>
  )
}
```

### supervisor-portal Form

```typescript
// apps/supervisor-portal/src/features/containers/components/container-create-form/index.tsx
import {
  toCreateContainerPayload,
  type ContainerFormSchema,
  resourceSchema,
  portsSchema,
} from '@product-ui/react/container-form-generic'
import { FormLayout } from '@product-ui/react/form-layout'

export function ContainerCreateForm({ initialValues }) {
  // 無 view state — supervisor 沒有 review

  return (
    <Form t={t} {...form}>
      <FormLayout.Root>
        <FormLayout.Content>
          <ViewSetting onSubmit={handleCreateContainer} />
        </FormLayout.Content>
        {/* 無 sidebar */}
      </FormLayout.Root>
    </Form>
  )
}
```

---

## Props Injection Pattern

Portal-specific 的資料（API 結果、idc list）透過 props 注入：

```typescript
// 共用 section
interface SectionResourceProps {
  productItems: ProductItem[]
  idcList: IDC[]
  mode: 'create' | 'edit'
}

export function SectionResource({ productItems, idcList, mode }: SectionResourceProps) {
  return (
    <div className="space-y-4">
      <FormField name="idc" label="Data Center">
        <Select.Root>
          <Select.Content>
            {idcList.map(idc => (
              <Select.Item key={idc.id} value={idc.id}>
                {idc.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </FormField>
    </div>
  )
}
```

各 portal 用各自的 hook 取資料：

```typescript
// user-portal
const { data: idcList } = useGetIDCListQuery()
<SectionResource productItems={productList} idcList={idcList} mode="create" />

// supervisor-portal
const { data: idcList } = useAdminGetIDCListQuery()
<SectionResource productItems={adminProductList} idcList={idcList} mode="create" />
```

---

## Package.json Exports

```json
{
  "exports": {
    "./container-form-generic": "./src/components/container-form-generic/index.ts",
    "./bare-metal-form-generic": "./src/components/bare-metal-form-generic/index.ts"
  }
}
```

---

## Migration Checklist

抽共用時的步驟：

- [ ] 確認 shared schemas、adapters、sections
- [ ] 在 product-ui 建 `{feature}-form-generic/`
- [ ] 搬 `schema.ts`（含所有 step schemas）
- [ ] 搬 `form-adapter.ts`（加 generic type parameters）
- [ ] 抽出可重用的 section component
- [ ] 在 product-ui `package.json` 加 exports
- [ ] 更新兩個 portal 的 imports
- [ ] Portal-specific 的元件留在各 app
- [ ] 兩邊 portal 都測試一次

---

## Best Practices

1. **Don't over-share**：UI 差異太大時就不要硬抽
2. **Use props for resources**：API 資料透過 props 注入，不要在共用 component 裡呼叫 hook
3. **Generic type parameters**：在 adapter 中使用 generics 容納不同 API type
4. **Keep Forms separate**：只共用 View / Step component，最外層 Form 維持各 portal 各自實作
5. **Named exports only**
