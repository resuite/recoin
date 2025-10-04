import type { users, workspaces } from '@/api/database/schema'
import type { IconName } from '@/components/icons'

export type WorkspaceProfile = Omit<typeof workspaces.$inferSelect, 'createdAt'>
export type UserData = Omit<typeof users.$inferSelect, 'googleId' | 'createdAt'> & {
   workspaces: Array<WorkspaceProfile>
}
export type TransactionType = 'income' | 'expense'

export interface Achievement {
   name: string
   icon: IconName
   message: string
}
