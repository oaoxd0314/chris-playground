import { z } from 'zod'

/**
 * 環境變數 Schema 定義
 * 使用 Zod 進行型別驗證和解析
 */
const envSchema = z.object({
  // 環境設定
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // API 設定
  VITE_API_URL: z.string().url('VITE_API_URL 必須是有效的 URL'),
  VITE_API_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive('VITE_API_TIMEOUT 必須是正數'))
    .default('30000'),

  // 應用設定
  VITE_APP_NAME: z.string().min(1, 'VITE_APP_NAME 不能為空').default('My App'),
  VITE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive())
    .default('3000'),

  // 功能開關
  VITE_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false'),
  VITE_ENABLE_MOCK: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false'),

  // 第三方服務（選用）
  VITE_GA_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
})

/**
 * 驗證並解析環境變數
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_PORT: import.meta.env.VITE_PORT,
    VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
    VITE_ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK,
    VITE_GA_ID: import.meta.env.VITE_GA_ID,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  })

  if (!parsed.success) {
    console.error('❌ 環境變數驗證失敗：')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('環境變數配置錯誤，請檢查 .env 檔案')
  }

  return parsed.data
}

/**
 * 型別安全的環境變數
 * 在應用啟動時驗證，確保所有必要的環境變數都存在且格式正確
 */
export const env = parseEnv()

/**
 * 環境判斷工具
 */
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
