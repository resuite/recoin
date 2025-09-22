import type { users, workspaces } from '@/api/database/schema'
import type { IconName } from '@/components/icons'
export type WorkspaceProfile = Omit<typeof workspaces.$inferSelect, 'createdAt'>
export type UserData = Omit<typeof users.$inferSelect, 'googleId' | 'createdAt'> & {
   workspaces: Array<WorkspaceProfile>
}

interface Model {
   id: `${string}_${string}`
}

type Id<T extends string> = `${T}_${string}`
type Ref<M extends Model> = M['id']
export type TransactionType = 'income' | 'expense'

export interface Category extends Model {
   id: Id<'category'>
   name: string
   icon: IconName
}

export interface Currency extends Model {
   id: Id<'currency'>
   value: string
}

export interface Transaction extends Model {
   id: Id<'transaction'>
   currency: Ref<Currency>
   type: TransactionType
   category: Ref<Category>
   label: string
   amount: number
}
