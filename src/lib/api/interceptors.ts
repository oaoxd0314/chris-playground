import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'

/**
 * Request Interceptor - 請求發送前的處理
 *
 * 使用場景：
 * - 添加 Authentication Token
 * - 添加自定義 Headers (如 Client-Id)
 * - 修改請求配置
 * - 記錄請求日誌
 */
export const requestFulfilledInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  // TODO: 在這裡添加你的邏輯
  // 範例：添加 token
  // const token = getTokenFromSomewhere()
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }

  return config
}

/**
 * Request Error Interceptor - 請求發送失敗的處理
 */
export const requestRejectedInterceptor = (error: AxiosError) => {
  // TODO: 處理請求發送前的錯誤
  console.error('Request Error:', error)
  return Promise.reject(error)
}

/**
 * Response Interceptor - 回應成功的處理
 *
 * 使用場景：
 * - 統一處理回應格式
 * - 提取 data
 * - 記錄回應日誌
 */
export const responseFulfilledInterceptor = (response: AxiosResponse) => {
  // TODO: 在這裡處理成功的回應
  // 可以選擇直接返回 response.data 或保持原樣
  return response
}

/**
 * Response Error Interceptor - 回應錯誤的處理
 *
 * 使用場景：
 * - 統一錯誤處理
 * - 401 自動 refresh token 或登出
 * - 錯誤訊息顯示
 * - 錯誤日誌記錄
 */
export const responseRejectedInterceptor = async (error: AxiosError) => {
  // TODO: 在這裡處理錯誤回應

  // 範例：處理 401 錯誤
  // if (error.response?.status === 401) {
  //   try {
  //     await refreshToken()
  //     // 重新發送原始請求
  //     return axios.request(error.config!)
  //   } catch (refreshError) {
  //     // Refresh 失敗，登出用戶
  //     logout()
  //     return Promise.reject(refreshError)
  //   }
  // }

  // 範例：處理其他狀態碼
  // if (error.response?.status === 403) {
  //   // 處理無權限
  // }

  console.error('Response Error:', error)
  return Promise.reject(error)
}

/**
 * 工具函數：判斷是否為 Axios 錯誤
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError === true
}
