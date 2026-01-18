import axios from 'axios'
import {
  requestFulfilledInterceptor,
  requestRejectedInterceptor,
  responseFulfilledInterceptor,
  responseRejectedInterceptor,
} from './interceptors'
import type { AxiosInstance } from 'axios'
import { env } from '@/lib/env'

/**
 * 建立 Axios 實例
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.VITE_API_URL,
    timeout: env.VITE_API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 註冊 Request Interceptors
  client.interceptors.request.use(
    requestFulfilledInterceptor,
    requestRejectedInterceptor
  )

  // 註冊 Response Interceptors
  client.interceptors.response.use(
    responseFulfilledInterceptor,
    responseRejectedInterceptor
  )

  return client
}

/**
 * API Client 實例
 * 使用方式：
 * import { apiClient } from '@/lib/api'
 * const response = await apiClient.get('/users')
 */
export const apiClient = createApiClient()

/**
 * Runtime Config 支援
 * 在開發或測試時可以動態修改配置
 */
export const updateApiConfig = (config: {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}) => {
  if (config.baseURL) {
    apiClient.defaults.baseURL = config.baseURL
  }
  if (config.timeout) {
    apiClient.defaults.timeout = config.timeout
  }
  if (config.headers) {
    Object.assign(apiClient.defaults.headers.common, config.headers)
  }
}
