import type { users } from '@/api/database/schema'
export type UserData = Omit<typeof users.$inferSelect, 'googleId' | 'createdAt'>
