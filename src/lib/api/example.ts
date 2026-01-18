/**
 * API Client 使用範例
 * 這個檔案展示如何使用 API client
 * 實際使用時可以刪除此檔案
 */

import { apiClient } from './index'
import type { ApiResponse, PaginatedResponse } from './index'

// ==========================================
// 範例 1: 基本 GET 請求
// ==========================================
export const getUsers = async () => {
  const response = await apiClient.get<ApiResponse<Array<User>>>('/users')
  return response.data
}

// ==========================================
// 範例 2: 帶參數的 GET 請求
// ==========================================
export const getUserById = async (id: string) => {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
  return response.data
}

// ==========================================
// 範例 3: POST 請求
// ==========================================
export const createUser = async (data: CreateUserDto) => {
  const response = await apiClient.post<ApiResponse<User>>('/users', data)
  return response.data
}

// ==========================================
// 範例 4: PUT 請求
// ==========================================
export const updateUser = async (id: string, data: Partial<CreateUserDto>) => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
  return response.data
}

// ==========================================
// 範例 5: DELETE 請求
// ==========================================
export const deleteUser = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`)
  return response.data
}

// ==========================================
// 範例 6: 帶查詢參數的請求
// ==========================================
export const searchUsers = async (params: SearchParams) => {
  const response = await apiClient.get<PaginatedResponse<User>>(
    '/users/search',
    {
      params, // axios 會自動將 params 轉換為查詢字串
    }
  )
  return response.data
}

// ==========================================
// 範例 7: 上傳檔案
// ==========================================
export const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await apiClient.post<ApiResponse<{ url: string }>>(
    '/users/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

// ==========================================
// 範例 8: 取消請求
// ==========================================
export const getUsersWithCancel = () => {
  const controller = new AbortController()

  const request = apiClient.get<ApiResponse<Array<User>>>('/users', {
    signal: controller.signal,
  })

  return {
    request,
    cancel: () => controller.abort(),
  }
}

// ==========================================
// 範例 9: 錯誤處理
// ==========================================
export const getUserWithErrorHandling = async (id: string) => {
  try {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return { data: response.data, error: null }
  } catch (error) {
    // 可以使用 isAxiosError 來判斷錯誤類型
    // import { isAxiosError } from './index'
    // if (isAxiosError(error)) {
    //   console.error('API Error:', error.response?.data)
    // }
    return { data: null, error }
  }
}

// ==========================================
// 型別定義（範例）
// ==========================================
interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface CreateUserDto {
  name: string
  email: string
  password: string
}

interface SearchParams {
  keyword?: string
  page?: number
  pageSize?: number
}
