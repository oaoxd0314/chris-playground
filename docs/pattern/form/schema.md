# Form Schema

> Yup schema 組合、條件驗證、可重用 schema 萃取、error message。
> 回到 [README](./README.md)。

## Basic Structure

每個 step 一個 modular schema，可用 `yup.concat()` 組合：

```typescript
import * as yup from 'yup'

// Step 1
export const resourceSchema = yup.object({
  name: yup.string().required(),
  type: yup.string().oneOf(['a', 'b', 'c']).required(),
  idc: yup.string().required(),
})

// Step 2
export const configSchema = yup.object({
  port: yup.number().min(1).max(65535).required(),
  protocol: yup.string().oneOf(['TCP', 'UDP']).required(),
})

// Combined
export const myFormSchema = resourceSchema.concat(configSchema)

// Type exports
export type ResourceSchema = yup.InferType<typeof resourceSchema>
export type ConfigSchema = yup.InferType<typeof configSchema>
export type MyFormSchema = yup.InferType<typeof myFormSchema>
```

---

## Steps Configuration

```typescript
export const FORM_STEPS = [
  { id: '1', schema: resourceSchema },
  { id: '2', schema: configSchema },
]

const { step, setStep, form } = useStepperForm<MyFormSchema, string>({
  steps: FORM_STEPS,
  initialValues,
  initialStep: '1',
})
```

---

## Conditional Validation

### Toggle-Dependent Fields

```typescript
const settingsSchema = yup.object({
  enable: yup.boolean().default(false),
  items: yup
    .array()
    .of(itemSchema)
    .when('enable', {
      is: true,
      then: schema => schema.required().min(1),
      otherwise: schema => schema.strip(),
    }),
})
```

### List with Enable Toggle

```typescript
const portMappingsSchema = yup.object({
  enable: yup.boolean().default(true),
  items: yup
    .array()
    .of(
      yup.object({
        hostPort: yup.number().nullable().optional(),
        containerPort: yup.number().min(1).max(65535).required(),
        protocol: yup.string().oneOf(['TCP', 'UDP']).required(),
      })
    )
    .when('enable', {
      is: true,
      then: schema =>
        schema
          .required()
          .test('unique', 'DuplicatedPortError', checkForDuplicates),
      otherwise: schema => schema.strip(),
    }),
})
```

### Nested Conditional Schema

```typescript
const sshConnectionSchema = yup.object({
  enable: yup.boolean().default(false),
  sshKey: sshKeySchema.when('enable', {
    is: true,
    then: schema => schema,
    otherwise: schema => schema.strip(),
  }),
})
```

### Conditional Password

```typescript
const passwordSchema = yup.string().when('enable', {
  is: true,
  then: schema =>
    schema
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
  otherwise: schema => schema.strip(),
})
```

---

## Custom Validation

### Uniqueness

```typescript
const checkForDuplicates = (items?: ItemType[]) => {
  if (!items) return true
  const uniqueItems = new Set(
    items.map(({ key1, key2 }) => JSON.stringify({ key1, key2 }))
  )
  return uniqueItems.size === items.length
}

// Usage
.test('unique', 'error:key', checkForDuplicates)
```

### Regex

```typescript
const pathSchema = yup.object({
  hostPath: yup
    .string()
    .matches(/^[a-zA-Z0-9_-]+$/, 'error:InvalidPathError')
    .required(),
  containerPath: yup
    .string()
    .matches(/^\/[a-zA-Z0-9_/-]*$/, 'error:InvalidPathError')
    .required(),
})
```

---

## Reusable Schemas

把跨 form 重用的 schema 抽到對應 component 旁邊：

```typescript
// packages/product-ui/src/components/ssh-key-field/schema.ts
export const sshKeySchema = yup.object({
  sshKeyIdList: yup.array().of(yup.string()).default([]),
  customSshKeyEnabled: yup.boolean().default(false),
  customSshKeyList: yup
    .array()
    .of(yup.string())
    .when('customSshKeyEnabled', {
      is: true,
      then: schema => schema.required().min(1),
      otherwise: schema => schema.strip(),
    }),
})

// packages/product-ui/src/components/subscription-period-field/schema.ts
export const subscriptionPeriodSchema = yup
  .string()
  .oneOf(['1 month', '3 months', '6 months', '1 year'])
  .required()
```

使用：

```typescript
import { sshKeySchema } from '../ssh-key-field'
import { subscriptionPeriodSchema } from '../subscription-period-field'

export const mySchema = yup.object({
  subscriptionPeriod: subscriptionPeriodSchema,
  sshKey: sshKeySchema,
})
```

---

## Error Messages

常見錯誤透過 `yup.setLocale` + i18n 自動處理：

- `required` / `min` / `max` → i18n translation
- 自訂錯誤 → 使用 `'namespace:errorKey'` 格式

```typescript
// i18n key（推薦）
.test('unique', 'container:DuplicatedPortError', checkForDuplicates)

// Inline message（少用）
.required('Please select a product')
```

---

## Type Inference

一律 export inferred type：

```typescript
export type MyFormSchema = yup.InferType<typeof myFormSchema>

type PartialFormSchema = Partial<MyFormSchema>
```
