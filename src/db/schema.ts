import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})
