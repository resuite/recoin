import type { users, workspaces } from '@/api/database/schema'

export type WorkspaceProfile = Omit<typeof workspaces.$inferSelect, 'createdAt'>
export type UserData = Omit<typeof users.$inferSelect, 'googleId' | 'createdAt'> & {
   workspaces: Array<WorkspaceProfile>
}
export type TransactionType = 'income' | 'expense'
