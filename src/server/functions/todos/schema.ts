import { z } from 'zod'

export const todoOrderOptions = ['newest', 'oldest'] as const
export type TodoOrder = (typeof todoOrderOptions)[number]

export const createTodoSchema = z.object({
  name: z.string().min(1),
})

export const updateTodoSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
})

export const toggleTodoSchema = z.object({
  id: z.number(),
  isCompleted: z.boolean(),
})

export const deleteTodoSchema = z.object({
  id: z.number(),
})
