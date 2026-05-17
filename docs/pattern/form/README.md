# Form Pattern

> **Localization note**: 範例引用 `@alison-ui/react` 與 `@product-ui/react`，這些是原專案的 internal packages；本 repo 尚未個人化，閱讀時請對應到本 repo 的等價元件。

開新表單、多步驟表單、共用 form 邏輯時的參考。

## Table of Contents

| Topic                                 | File                                     |
| ------------------------------------- | ---------------------------------------- |
| 整體結構、layout、step                | [architecture.md](./architecture.md)     |
| Yup schema 組合、條件驗證             | [schema.md](./schema.md)                 |
| Form ↔ API 轉換                       | [form-adapter.md](./form-adapter.md)     |
| 跨 portal 共用策略                    | [cross-portal.md](./cross-portal.md)     |
| Best practices（useWatch、checklist） | [best-practices.md](./best-practices.md) |

---

## Mental Model

Form 採三層階層：

```
Form
└── View (optional, e.g. setting / review)
    └── Step (對應 stepper 步驟)
        └── Field
```

- **Form**：最外層 container，掛 `Form` provider、`FormLayout.Root`
- **View**：可選；當有 review / payment 等切換時才需要
- **Step**：對應 Stepper 步驟或 expanded section

詳細結構見 [architecture.md](./architecture.md)。

---

## Form Props（uncontrolled 風格）

| Prop            | Type                                  | 說明                                           |
| --------------- | ------------------------------------- | ---------------------------------------------- |
| `mode`          | `'create' \| 'edit' \| string`        | 操作模式；常見 `create` / `edit`               |
| `defaultValues` | `Partial<FormSchema>`                 | 初始值；edit 模式透過 form-adapter 從 API 轉換 |
| `onSubmit`      | `(data: FormSchema) => Promise<void>` | 提交 handler                                   |
| `isSubmitting`  | `boolean`                             | Loading state                                  |

---

## Quick Start

```typescript
import { Form } from '@alison-ui/react/form'
import { FormLayout } from '@product-ui/react/form-layout'
import { useStepperForm } from '@product-ui/react/hooks'

export function MyForm({ mode, defaultValues, onSubmit, isSubmitting }: MyFormProps) {
  const { step, setStep, form } = useStepperForm({
    steps: FORM_STEPS,
    initialValues: defaultValues,
    initialStep: '1',
  })

  return (
    <Form t={t} {...form}>
      <FormLayout.Root>
        <FormLayout.Content>{/* Steps */}</FormLayout.Content>
        <FormLayout.Sidebar>{/* Summary */}</FormLayout.Sidebar>
      </FormLayout.Root>
    </Form>
  )
}
```

完整範例見 [architecture.md → Complete Form Component Example](./architecture.md#complete-form-component-example)。

---

## Key Variations

| Aspect     | Options               | 對應實作                                |
| ---------- | --------------------- | --------------------------------------- |
| Steps      | Multi-step / Expanded | `useStepperForm + Stepper` / `FormStep` |
| Sidebar    | With / Without        | 一律用 `FormLayout.Root`                |
| ViewReview | With / Without        | 用 `view` state 切換                    |
| Mode       | Create / Edit / ...   | 用 `mode` prop 共用 component           |
| Portal     | user / supervisor     | 在 View / Step 層做抽象                 |

---

## Required Files

```
features/{feature}/components/{feature}-form/
├── index.tsx           # Form container
├── schema.ts           # Yup schemas
├── form-adapter.ts     # API ↔ form transformers
├── view-setting.tsx    # 設定 view
├── view-review.tsx     # 檢視 view (optional)
├── step-basic.tsx      # Step components
├── step-config.tsx
└── sidebar-summary.tsx # Sidebar (optional)
```

---

## See Also

- [architecture.md](./architecture.md) — 完整 layout 與 step 範例
- [schema.md](./schema.md) — `yup.concat()`、`.when()`、可重用 schema 萃取
- [form-adapter.md](./form-adapter.md) — `toXxxPayload` / `toXxxFormValues` 命名與 pattern
- [cross-portal.md](./cross-portal.md) — 何時抽到共用 package、props injection
- [best-practices.md](./best-practices.md) — `useWatch` 與 quality checklist
