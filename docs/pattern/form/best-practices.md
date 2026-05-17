# Form Best Practices

> React Hook Form 在 React 19 的注意事項 + quality checklist。
> 回到 [README](./README.md)。

## ⚠️ React 19：用 `useWatch` 取代 `form.watch()`

在 React 19，`form.watch()` 可能無法正確觸發 re-render。一律改用 `useWatch`。

**為什麼：**

- `watch` 在 root 層觸發 re-render，效能差
- `useWatch` 把訂閱隔離到 component 層
- React 19 較嚴格的 render 行為要求 `useWatch` 的細粒度控制

### Migration

```typescript
// ❌ BAD — 在 React 19 可能不觸發 re-render
import { useFormContext } from 'react-hook-form'

function MyComponent() {
  const form = useFormContext()
  const fieldValue = form.watch('fieldName')

  return <div>{fieldValue}</div>
}
```

```typescript
// ✅ GOOD
import { useFormContext, useWatch } from 'react-hook-form'

function MyComponent() {
  const { control } = useFormContext()
  const fieldValue = useWatch({ control, name: 'fieldName' })

  return <div>{fieldValue}</div>
}
```

### Watch Multiple Fields

```typescript
const [field1, field2, field3] = useWatch({
  control,
  name: ['field1', 'field2', 'field3'],
})

// 全部欄位
const formValues = useWatch({ control })
```

### 訂閱順序很重要

`useWatch` 的訂閱必須在 `setValue()` **之前**建立；訂閱建立前的更新會被忽略。

---

## Quality Checklist

開新 form 前對照一次：

- [ ] Form 使用 `mode` / `defaultValues` / `onSubmit` / `isSubmitting` props（[README → Form Props](./README.md#form-propsuncontrolled-風格)）
- [ ] Schema 用 `yup.concat()` 做 modular composition（[schema.md](./schema.md)）
- [ ] Form adapter 採 target-only 命名（`toXxxPayload` / `toXxxFormValues`）（[form-adapter.md](./form-adapter.md)）
- [ ] 使用 `@alison-ui/react/form` 的 `Form` 與 `FormField`
- [ ] 使用 `@product-ui/react/form-layout` 的 `FormLayout`
- [ ] 多步驟表單使用 `useStepperForm`
- [ ] **使用 `useWatch` 而非 `form.watch()`**（本檔上方）
- [ ] Named exports only（不用 default export）

---

## External Reference

[Form Guideline on Confluence](https://gmicloud.atlassian.net/wiki/spaces/Frontend/pages/295305313/Form+Guideline)
