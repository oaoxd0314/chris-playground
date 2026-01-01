/**
 * API 相關型別定義
 */

/**
 * API 通用回應格式
 * 根據你的後端 API 格式調整
 */
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

/**
 * API 錯誤回應格式
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

/**
 * 分頁請求參數
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分頁回應格式
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
