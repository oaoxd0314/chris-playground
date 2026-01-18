# API Client

統一的 API 請求客戶端，基於 Axios 封裝。

## 📁 檔案結構

```
src/lib/api/
├── client.ts          # Axios 實例配置
├── interceptors.ts    # 請求/回應攔截器
├── types.ts          # 型別定義
├── index.ts          # 導出入口
├── example.ts        # 使用範例（可刪除）
└── README.md         # 說明文件
```

## 🚀 基本使用

```typescript
import { apiClient } from '@/lib/api'

// GET 請求
const users = await apiClient.get('/users')

// POST 請求
const newUser = await apiClient.post('/users', {
  name: 'John',
  email: 'john@example.com',
})

// PUT 請求
const updated = await apiClient.put('/users/123', { name: 'Jane' })

// DELETE 請求
await apiClient.delete('/users/123')
```

## ⚙️ 配置說明

### 基礎配置

API client 會自動從環境變數讀取配置：

- `VITE_API_URL` - API 基礎 URL
- `VITE_API_TIMEOUT` - 請求逾時時間

### Runtime 配置

如果需要在運行時修改配置（例如測試環境）：

```typescript
import { updateApiConfig } from '@/lib/api'

updateApiConfig({
  baseURL: 'https://test-api.example.com',
  timeout: 60000,
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

## 🔌 Interceptors（攔截器）

### Request Interceptor

在 `interceptors.ts` 的 `requestFulfilledInterceptor` 中添加邏輯：

```typescript
export const requestFulfilledInterceptor = async config => {
  // 1. 添加 Authentication Token
  const token = getToken() // 從你的 store 或其他地方獲取
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // 2. 添加自定義 Headers
  const clientId = getClientId()
  if (clientId) {
    config.headers['CE-ClientId'] = clientId
  }

  // 3. 記錄請求日誌
  console.log('API Request:', config.method?.toUpperCase(), config.url)

  return config
}
```

### Response Interceptor

在 `interceptors.ts` 的 `responseRejectedInterceptor` 中處理錯誤：

```typescript
export const responseRejectedInterceptor = async error => {
  // 1. 處理 401 錯誤 (未授權)
  if (error.response?.status === 401) {
    try {
      // 嘗試 refresh token
      const newToken = await refreshToken()

      // 更新 header 並重試
      error.config.headers.Authorization = `Bearer ${newToken}`
      return axios.request(error.config)
    } catch (refreshError) {
      // Refresh 失敗，登出用戶
      logout()
      window.location.href = '/login'
    }
  }

  // 2. 處理其他狀態碼
  if (error.response?.status === 403) {
    toast.error('您沒有權限執行此操作')
  }

  // 3. 顯示錯誤訊息
  const message = error.response?.data?.message || '請求失敗'
  toast.error(message)

  return Promise.reject(error)
}
```

## 📝 完整範例

查看 `example.ts` 檔案，裡面包含了各種使用場景的範例：

- ✅ 基本 CRUD 操作
- ✅ 查詢參數
- ✅ 檔案上傳
- ✅ 請求取消
- ✅ 錯誤處理
- ✅ TypeScript 型別定義

## 🔧 整合 TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users')
      return response.data
    },
  })
}
```

## 📌 注意事項

1. **環境變數**：確保 `.env` 檔案中已配置 `VITE_API_URL`
2. **錯誤處理**：記得在 interceptors 中實作完整的錯誤處理邏輯
3. **Token 管理**：實作 Auth Store 後，在 interceptor 中整合
4. **型別安全**：盡量為 API 回應定義明確的型別

## 🎯 下一步

- [ ] 實作 Auth Store (zustand)
- [ ] 在 Request Interceptor 中添加 token
- [ ] 在 Response Interceptor 中處理 401 錯誤
- [ ] 建立具體的 API endpoints (例如：`src/lib/api/users.ts`)
- [ ] 整合 TanStack Query
