import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { todos } from '@/db/schema'
import {
  createTodoSchema,
  deleteTodoSchema,
  toggleTodoSchema,
  updateTodoSchema,
} from './schema'

export const getTodosFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.query.todos.findMany()
  }
)

export const createTodoFn = createServerFn({ method: 'POST' })
  .inputValidator(createTodoSchema)
  .handler(async ({ data }) => {
    return db.insert(todos).values({ ...data, isCompleted: false })
  })

export const updateTodoFn = createServerFn({ method: 'POST' })
  .inputValidator(updateTodoSchema)
  .handler(async ({ data }) => {
    const { id, ...rest } = data
    return db.update(todos).set(rest).where(eq(todos.id, id))
  })

export const toggleTodoFn = createServerFn({ method: 'POST' })
  .inputValidator(toggleTodoSchema)
  .handler(async ({ data }) => {
    return db
      .update(todos)
      .set({ isCompleted: data.isCompleted })
      .where(eq(todos.id, data.id))
  })

export const deleteTodoFn = createServerFn({ method: 'POST' })
  .inputValidator(deleteTodoSchema)
  .handler(async ({ data }) => {
    return db.delete(todos).where(eq(todos.id, data.id))
  })
