# Form Adapter

> Form values ↔ API payload / response 的轉換。
> 回到 [README](./README.md)。

## Purpose

集中所有 form ↔ API 的轉換邏輯到單一 `form-adapter.ts`，避免散落在 component 各處。

---

## Naming Convention

採 **target-only naming**（每個 target 通常只有一個來源）：

| Pattern                   | Example                         | Use Case                   |
| ------------------------- | ------------------------------- | -------------------------- |
| `toXxxPayload`            | `toCreateContainerPayload`      | Form → API create payload  |
| `toXxxFormValues`         | `toContainerFormValues`         | API response → Form values |
| `toReconfigureXxxPayload` | `toReconfigureContainerPayload` | Form → API update payload  |

避免冗長命名：`mapFormValuesToCreatePayload` ❌

---

## Basic Structure

```typescript
import type { MyFormSchema } from './schema'

interface CreatePayload {
  name: string
  config: { key: string; value: string }[]
}

interface ApiResponse {
  name: string
  config: { key: string; value: string }[]
}

export const toCreatePayload = (formData: MyFormSchema): CreatePayload => ({
  name: formData.name,
  config: formData.settings.enable
    ? formData.settings.items.map(item => ({
        key: item.key,
        value: item.value,
      }))
    : [],
})

export const toFormValues = (response: ApiResponse): Partial<MyFormSchema> => ({
  name: response.name,
  settings: {
    enable: response.config.length > 0,
    items: response.config.map(c => ({ key: c.key, value: c.value })),
  },
})
```

---

## Common Patterns

### List Transformation

```typescript
// Form → API
const ports =
  formData.portMappings?.items?.map(port => ({
    port: port.hostPort ?? undefined,
    containerPort: port.containerPort,
    protocol: port.protocol as 'TCP' | 'UDP',
  })) ?? []

// API → Form：帶 enable flag
const portMappings = {
  enable: (response.ports?.length ?? 0) > 0,
  items:
    response.ports?.map(port => ({
      hostPort: port.port,
      containerPort: port.containerPort,
      protocol: port.protocol,
    })) ?? [],
}
```

### Conditional Fields

```typescript
export const toCreatePayload = (formData: MyFormSchema) => {
  let envs: EnvVariable[] = []

  if (formData.envVariables.enable) {
    envs = formData.envVariables.items.map(env => ({
      name: env.key,
      value: env.value,
    }))
  }

  // 從其他 toggle 帶入 special env
  if (formData.sshConnection.enable) {
    envs.push({
      name: 'SSH_KEY',
      value: formData.sshConnection.sshKey.customSshKeyList?.join('\n') ?? '',
    })
  }

  return { envs /* ... */ }
}
```

### Extracting Special Values

從 API 通用 list 中拆出特殊值：

```typescript
export const toFormValues = (response: ApiResponse): Partial<MyFormSchema> => {
  const envVariables =
    response.envs?.map(env => ({
      key: env.name,
      value: env.value,
    })) ?? []

  // 把 SSH_KEY 從 envs 中抽出來
  const sshEnvIndex = envVariables.findIndex(env => env.key === 'SSH_KEY')
  let customSshKeyList: string[] = []
  if (sshEnvIndex !== -1) {
    const sshEnv = envVariables[sshEnvIndex]
    envVariables.splice(sshEnvIndex, 1)
    customSshKeyList = sshEnv?.value?.split('\n') ?? []
  }

  return {
    envVariables: { enable: envVariables.length > 0, items: envVariables },
    sshConnection: {
      enable: customSshKeyList.length > 0,
      sshKey: {
        customSshKeyEnabled: customSshKeyList.length > 0,
        customSshKeyList,
      },
    },
  }
}
```

### Partial Update Payload

用 `lodash/pick` 做 reconfigure：

```typescript
import { pick } from 'lodash'

export const toReconfigurePayload = (formData: MyFormSchema) => ({
  ...pick(toCreatePayload(formData), ['name', 'ports', 'envs', 'templateId']),
})
```

---

## Generic Type Parameters

跨 portal 共用時，用 generics 容納不同 API type：

```typescript
export const toCreatePayload = <TPayload = DefaultPayload>(
  formData: MyFormSchema
): TPayload => {
  return {
    name: formData.name,
    /* ... */
  } as TPayload
}

// user-portal
import type { ContainerReq } from '@/libs/ajax/iaasModuleApi'
const payload = toCreatePayload<ContainerReq>(formData)

// supervisor-portal
import type { AdminContainerReq } from '@/libs/ajax/adminApi'
const payload = toCreatePayload<AdminContainerReq>(formData)
```

---

## Complete Example

```typescript
// packages/product-ui/src/components/container-form-generic/form-adapter.ts

import { isEmpty, pick } from 'lodash'
import type { ContainerFormSchema } from './schema'
import { SSH_KEY, JUPYTER_TOKEN } from './constants'

export interface ContainerReq {
  product: string
  count: number
  name: string
  templateId: string
  ports?: Array<{
    port?: number
    containerPort: number
    protocol: 'TCP' | 'UDP'
  }>
  envs?: Array<{ name: string; value: string }>
  idc: string
  sshKeyIdList?: string[]
}

export interface ContainersResp {
  name: string
  product: string
  templateId: string
  idc?: string
  sshKeyIdList?: string[]
  ports?: Array<{ port?: number; containerPort: number; protocol: string }>
  envs?: Array<{ name: string; value: string }>
}

export const toCreateContainerPayload = <T = ContainerReq>(
  formData: ContainerFormSchema
): T => {
  const ports =
    formData.portMappings?.items?.map(p => ({
      port: p.hostPort ?? undefined,
      containerPort: p.containerPort,
      protocol: p.protocol as 'TCP' | 'UDP',
    })) ?? []

  let envs: { name: string; value: string }[] = []
  if (formData.envVariables.enable) {
    envs = formData.envVariables.items.map(e => ({
      name: e.key,
      value: e.value,
    }))
  }

  if (formData.sshConnection.enable) {
    envs.push({
      name: SSH_KEY,
      value: formData.sshConnection.sshKey.customSshKeyList?.join('\n') ?? '',
    })
  }

  return {
    product: formData.product,
    count: formData.count,
    name: formData.containerName,
    templateId: formData.templateId,
    ports,
    envs,
    idc: formData.idc,
    sshKeyIdList: formData.sshConnection.enable
      ? formData.sshConnection.sshKey.sshKeyIdList
      : undefined,
  } as T
}

export const toContainerFormValues = <T = ContainersResp>(
  response: T
): Partial<ContainerFormSchema> => {
  const resp = response as ContainersResp

  const portMappings =
    resp.ports?.map(p => ({
      hostPort: p.port,
      containerPort: p.containerPort,
      protocol: p.protocol,
    })) ?? []

  const envVariables =
    resp.envs?.map(e => ({
      key: e.name,
      value: e.value,
    })) ?? []

  const sshIndex = envVariables.findIndex(e => e.key === SSH_KEY)
  let customSshKeyList: string[] = []
  if (sshIndex !== -1) {
    customSshKeyList = envVariables[sshIndex]?.value?.split('\n') ?? []
    envVariables.splice(sshIndex, 1)
  }

  return {
    product: resp.product,
    containerName: resp.name,
    templateId: resp.templateId,
    idc: resp.idc!,
    portMappings: { enable: true, items: portMappings },
    envVariables: { enable: !isEmpty(envVariables), items: envVariables },
    sshConnection: {
      enable:
        (resp.sshKeyIdList?.length ?? 0) > 0 || customSshKeyList.length > 0,
      sshKey: {
        sshKeyIdList: resp.sshKeyIdList ?? [],
        customSshKeyEnabled: customSshKeyList.length > 0,
        customSshKeyList,
      },
    },
  }
}

export const toReconfigureContainerPayload = <T = Partial<ContainerReq>>(
  formData: ContainerFormSchema
): T =>
  ({
    ...pick(toCreateContainerPayload(formData), [
      'name',
      'ports',
      'envs',
      'templateId',
    ]),
  }) as T
```
