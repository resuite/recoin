// FILE: api/db/schema.ts

import { relations } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
   id: text('id').primaryKey(),
   googleId: text('google_id').unique().notNull(),
   email: text('email').unique().notNull(),
   name: text('name'),
   createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})

export const workspaces = sqliteTable('workspaces', {
   id: text('id').primaryKey(),
   name: text('name').notNull(),
   userId: text('user_id')
      .notNull()
      .references(() => users.id),
   createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
})

export const usersRelations = relations(users, ({ many }) => ({
   workspaces: many(workspaces)
}))

export const workspacesRelations = relations(workspaces, ({ one }) => ({
   user: one(users, {
      fields: [workspaces.userId],
      references: [users.id]
   })
}))
