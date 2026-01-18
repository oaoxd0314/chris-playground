import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VITE_API_URL: z.string().url(),
  VITE_API_TIMEOUT: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.number().positive())
    .default(30000),
})

const parseEnv = () => {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT,
  })

  if (!parsed.success) {
    throw new Error(
      `runtime environment variables are not valid: ${parsed.error.message}`
    )
  }

  return parsed.data
}

export const env = parseEnv()
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
