# Form Architecture

> 整體結構、layout 元件、step 模式、view state、`FormField` 用法。
> 回到 [README](./README.md)。

## Hierarchical Structure

```
Form
├── FormLayout.Content
│   ├── ViewSetting (表單內容)
│   │   └── Step (對應 stepper 步驟)
│   │       └── Field
│   └── ViewReview (檢視內容，optional)
│       ├── OrderCard
│       └── SlaCheckbox
├── FormLayout.Sidebar (optional)
│   ├── SidebarSummary (對應 ViewSetting)
│   └── GmiPayment (對應 ViewReview)
├── schema.ts (Yup schemas)
└── form-adapter.ts (form ↔ API adapters)
```

---

## Layout

一律使用 `FormLayout` 維持結構一致：

```typescript
import { FormLayout } from '@product-ui/react/form-layout'

<FormLayout.Root>
  <FormLayout.Content>
    <FormLayout.Header>
      <FormLayout.Title>Title</FormLayout.Title>
      <FormLayout.Description>Description</FormLayout.Description>
    </FormLayout.Header>
    {/* Form steps */}
  </FormLayout.Content>
  <FormLayout.Sidebar>
    {/* Summary or payment */}
  </FormLayout.Sidebar>
</FormLayout.Root>
```

**注意：**

- `DashboardContent.FormMain` 會移除預設 padding 與 scroll
- `FormLayout.Content` 與 `FormLayout.Sidebar` 各自獨立 scroll
- [FormLayout Figma](https://www.figma.com/design/D2Q7K7jvKW1Hd4n2FNuO1f/Alison-UI?node-id=20412-23748&m=dev)

---

## Step Components

### Multi-Step Forms

使用 `Stepper` + `useStepperForm`：

```typescript
import { Stepper } from '@alison-ui/react/stepper'
import { useStepperForm } from '@product-ui/react/hooks'

const STEPS = [
  { id: '1', schema: resourceSchema },
  { id: '2', schema: configSchema },
]

const { step, setStep, form } = useStepperForm<FormSchema, string>({
  steps: STEPS,
  initialValues,
  initialStep: '1',
})

<Stepper.Root value={step} onValueChange={setStep}>
  <Stepper.List>
    <Stepper.Item value="1">Resource</Stepper.Item>
    <Stepper.Item value="2">Configuration</Stepper.Item>
  </Stepper.List>
  <Stepper.Content value="1"><SectionResource /></Stepper.Content>
  <Stepper.Content value="2"><SectionConfiguration /></Stepper.Content>
</Stepper.Root>
```

### Expanded Forms

使用 `FormStep` 或 `FormStepCollapsible`：

```typescript
import { FormStep } from '@product-ui/react/form-step'
import { FormStepCollapsible } from '@product-ui/react/form-step-collapsible'

<FormStep title="Resource">
  <SectionResource />
</FormStep>

<FormStepCollapsible title="Advanced" defaultOpen={false}>
  <SectionAdvanced />
</FormStepCollapsible>
```

---

## View State

當表單有 review step 時：

```typescript
const [view, setView] = useState<'setting' | 'review'>('setting')

onSuccess: () => setView('review')

{view === 'setting' && <ViewSetting />}
{view === 'review' && <ViewReview />}
```

---

## FormField

```typescript
import { FormField } from '@alison-ui/react/form'
import { Input } from '@alison-ui/react/input'

<FormField
  name="containerName"
  label="Name"
  description="Enter a unique name"
>
  <Input placeholder="my-container" />
</FormField>
```

**特性：**

- 與 react-hook-form 整合（透過 Form provider）
- 自動 render label / description
- 用 `yup.setLocale` 做 i18n error message
- 從 Form provider 取 `t` function

---

## Complete Form Component Example

```typescript
'use client'

import { useState } from 'react'
import { Form } from '@alison-ui/react/form'
import { FormLayout } from '@product-ui/react/form-layout'
import { useStepperForm } from '@product-ui/react/hooks'
import { StepperSkeleton } from '@product-ui/react/stepper-skeleton'
import { useClientTranslation } from '@repo/i18n/client'

import type { MyFormSchema } from './schema'
import { FORM_STEPS } from './schema'
import { ViewSetting } from './view-setting'
import { ViewReview } from './view-review'
import { SidebarSummary } from './sidebar-summary'

interface MyFormProps {
  mode: 'create' | 'edit'
  defaultValues: Partial<MyFormSchema>
  onSubmit: (data: MyFormSchema) => Promise<void>
  isSubmitting: boolean
  isLoading?: boolean
}

export function MyForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  isLoading,
}: MyFormProps) {
  const { t } = useClientTranslation(['common'])
  const [view, setView] = useState<'setting' | 'review'>('setting')

  const { step, setStep, form } = useStepperForm<MyFormSchema, string>({
    steps: FORM_STEPS,
    initialValues: defaultValues,
    initialStep: '1',
  })

  return (
    <Form t={t} {...form}>
      <FormLayout.Root>
        {view === 'setting' && (
          <>
            <FormLayout.Content>
              <FormLayout.Header>
                <FormLayout.Title>
                  {mode === 'create' ? 'Create Resource' : 'Edit Resource'}
                </FormLayout.Title>
              </FormLayout.Header>
              {isLoading ? (
                <StepperSkeleton steps={FORM_STEPS.length} />
              ) : (
                <ViewSetting
                  mode={mode}
                  currentStep={step}
                  setCurrentStep={setStep}
                  onSubmit={async data => {
                    await onSubmit(data)
                    setView('review')
                  }}
                  isSubmitting={isSubmitting}
                />
              )}
            </FormLayout.Content>
            <FormLayout.Sidebar>
              <SidebarSummary />
            </FormLayout.Sidebar>
          </>
        )}
        {view === 'review' && (
          <>
            <FormLayout.Content>
              <ViewReview onBack={() => setView('setting')} />
            </FormLayout.Content>
            <FormLayout.Sidebar>
              {/* Payment component */}
            </FormLayout.Sidebar>
          </>
        )}
      </FormLayout.Root>
    </Form>
  )
}
```
